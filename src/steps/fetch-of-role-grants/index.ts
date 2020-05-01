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
import { SnowflakeGrant, SnowflakeRole } from '../../types';

type RawOfRoleGrant = RawSnowflake['OfRoleGrant'];

interface SnowflakeOfRoleGrantEntityData extends IntegrationEntityData {
  assign: SnowflakeGrant;
  source: RawOfRoleGrant;
}

// DO NOT CHANGE THIS FUNCTION UNLESS YOU KNOW WHAT YOU ARE DOING.
function buildKey(rawToRoleGrant: RawOfRoleGrant): string {
  const {
    role,
    granted_to: grantedTo,
    grantee_name: granteeName,
    granted_by: grantedBy,
  } = rawToRoleGrant;
  return `snowflake-grant:torole::${role}:${grantedTo}:${granteeName}:${grantedBy}`;
}

function convertOfRoleGrant(
  rawToRoleGrant: RawOfRoleGrant,
): SnowflakeOfRoleGrantEntityData {
  const {
    created_on: createdOnStr,
    role,
    granted_to: grantedTo,
    grantee_name: granteeName,
    granted_by: grantedBy,
  } = rawToRoleGrant;
  const displayName = `Grant on role ${role} ${grantedTo} ${granteeName} by ${grantedBy}`;
  return {
    assign: {
      _class: ['AccessPolicy'],
      _type: 'snowflake_grant',
      _key: buildKey(rawToRoleGrant),
      displayName,
      name: role,
      role,
      createdOn: getTime(createdOnStr),
      grantedBy,
      grantedTo,
      granteeName,
    },
    source: rawToRoleGrant,
  };
}

const step: IntegrationStep = {
  id: 'fetch-of-role-grants',
  name: 'Fetch of Role Grants',
  types: ['snowflake_grant'],
  dependsOn: ['fetch-roles'],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext) {
    const { config } = instance;
    let client: SnowflakeClient | undefined;
    const ofRoleGrants: SnowflakeOfRoleGrantEntityData[] = [];
    try {
      client = await createClient({ ...config, logger });
      logger.info('Fetching of role grants...');
      await jobState.iterateEntities(
        { _type: 'snowflake_role' },
        async (role: SnowflakeRole) => {
          const roleName = role.name;
          logger.info(
            {
              roleName,
            },
            'Fetching grants of role',
          );
          for await (const rawOfRoleGrant of client.fetchOfRoleGrants(
            roleName,
          )) {
            const snowflakeToRoleGrantData = convertOfRoleGrant(rawOfRoleGrant);
            ofRoleGrants.push(snowflakeToRoleGrantData);
          }
        },
      );
      logger.info('Done fetching of role grants.');
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
      ofRoleGrants.map((grant) =>
        createIntegrationEntity({ entityData: grant }),
      ),
    );
  },
};

export default step;
