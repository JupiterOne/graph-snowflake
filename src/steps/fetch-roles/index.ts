import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  IntegrationEntityData,
  createIntegrationEntity,
  getTime,
} from '@jupiterone/integration-sdk';

import { createClient, Client as SnowflakeClient } from '../../client';
import '../../client';
import { RawSnowflake } from '../../client/types';
import { SnowflakeRole } from '../../types';

type RawRole = RawSnowflake['Role'];
interface SnowflakeRoleEntityData extends IntegrationEntityData {
  assign: SnowflakeRole;
  source: RawRole;
}

// DO NOT CHANGE THIS FUNCTION UNLESS YOU KNOW WHAT YOU ARE DOING.
function buildKey(rawRole: RawRole): string {
  return `snowflake-role:${rawRole.name}`;
}

function convertRole(rawRole: RawRole): SnowflakeRoleEntityData {
  const {
    created_on: createdOnStr,
    name,
    assigned_to_users: numAssignedUsers,
    granted_roles: numRolesGranted,
    granted_to_roles: numGrantedToRoles,
    owner,
    comment,
    is_inherited: isInheritedStr,
  } = rawRole;
  return {
    assign: {
      _class: ['AccessRole'],
      _type: 'snowflake_role',
      _key: buildKey(rawRole),
      displayName: name,
      name,
      createdOn: getTime(createdOnStr),
      comment,
      owner,
      numRolesGranted,
      numAssignedUsers,
      numGrantedToRoles,
      isInheritedRole: isInheritedStr === 'Y',
    },
    source: rawRole,
  };
}

const step: IntegrationStep = {
  id: 'fetch-roles',
  name: 'Fetch Roles',
  types: ['snowflake_grant'],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext) {
    const { config } = instance;
    let client: SnowflakeClient | undefined;
    const roles: SnowflakeRoleEntityData[] = [];
    try {
      client = await createClient({ ...config, logger });
      logger.info('Fetching roles...');

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
  },
};

export default step;
