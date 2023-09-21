import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
  createDirectRelationship,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk-core';
import { createClient, Client as SnowflakeClient } from '../../client';
import '../../client';
import { SnowflakeIntegrationConfig } from '../../types';
import { getUserKey } from '../fetch-users';
import {
  SnowflakeRoleEntityData,
  convertRole,
} from '../../converters/role.converter';

export async function fetchRoles({
  logger,
  jobState,
  instance,
}: IntegrationStepExecutionContext<SnowflakeIntegrationConfig>) {
  const { config } = instance;
  let client: SnowflakeClient | undefined;
  const roles: SnowflakeRoleEntityData[] = [];
  try {
    client = await createClient({ ...config, logger });
    logger.info('Fetching users...');

    for await (const rawRole of client.fetchRoles()) {
      const snowflakeRoleData = convertRole(rawRole);
      roles.push(snowflakeRoleData);
    }
    logger.info('Done fetching roles.');
  } catch (error) {
    logger.error({ error }, 'Error executing step');
    throw error;
  } finally {
    try {
      if (client) {
        await client.destroy();
      }
    } catch (error) {
      logger.error({ error }, 'Failed to destroy snowflake client');
    }
  }
  await jobState.addEntities(
    roles.map((role) => createIntegrationEntity({ entityData: role })),
  );
}

export async function buildUserRolesRelationships({
  logger,
  jobState,
  instance,
}: IntegrationStepExecutionContext<SnowflakeIntegrationConfig>) {
  const { config } = instance;
  let client: SnowflakeClient | undefined;
  try {
    client = await createClient({ ...config, logger });
    logger.info('Fetching grants...');
    await jobState.iterateEntities(
      { _type: 'snowflake_role' },
      async (roleEntity) => {
        for await (const rawGrant of (
          client as SnowflakeClient
        ).fetchRoleGrants(roleEntity.name as string)) {
          if (rawGrant.granted_to !== 'USER') {
            continue;
          }
          const userEntity = await jobState.findEntity(
            getUserKey(rawGrant.grantee_name),
          );
          if (!userEntity) {
            continue;
          }
          const userRoleRelationship = createDirectRelationship({
            _class: RelationshipClass.ASSIGNED,
            from: userEntity,
            to: roleEntity,
          });
          await jobState.addRelationship(userRoleRelationship);
        }
      },
    );
    logger.info('Done fetching grants.');
  } catch (error) {
    logger.error({ error }, 'Error executing step');
    throw error;
  } finally {
    try {
      if (client) {
        await client.destroy();
      }
    } catch (error) {
      logger.error({ error }, 'Failed to destroy snowflake client');
    }
  }
}

export const roleSteps: IntegrationStep<SnowflakeIntegrationConfig>[] = [
  {
    id: 'fetch-roles',
    name: 'Fetch Roles',
    entities: [
      {
        resourceName: 'Role',
        _type: 'snowflake_role',
        _class: ['AccessRole'],
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchRoles,
  },
  {
    id: 'build-user-roles-relationships',
    name: 'Build User Roles Relationships',
    entities: [],
    relationships: [
      {
        _type: 'snowflake_user_assigned_role',
        sourceType: 'snowflake_user',
        _class: RelationshipClass.ASSIGNED,
        targetType: 'snowflake_role',
      },
    ],
    dependsOn: ['fetch-users'],
    executionHandler: buildUserRolesRelationships,
  },
];
