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

type RawToRoleGrant = RawSnowflake['ToRolePrivilegeGrant'];

interface SnowflakeToRoleGrantEntityData extends IntegrationEntityData {
  assign: SnowflakeGrant;
  source: RawToRoleGrant;
}

// DO NOT CHANGE THIS FUNCTION UNLESS YOU KNOW WHAT YOU ARE DOING.
function buildKey(rawGlobalGrant: RawToRoleGrant): string {
  const {
    granted_on: grantedOn,
    granted_to: grantedTo,
    grantee_name: granteeName,
    granted_by: grantedBy,
    name,
    privilege,
  } = rawGlobalGrant;
  return `snowflake-grant:torole::${privilege}:${grantedOn}:${grantedTo}:${granteeName}:${grantedBy}:${name}`;
}

function convertToRoleGrant(
  rawToRoleGrant: RawToRoleGrant,
): SnowflakeToRoleGrantEntityData {
  const {
    created_on: createdOnStr,
    granted_on: grantedOn,
    granted_to: grantedTo,
    grantee_name: granteeName,
    granted_by: grantedBy,
  } = rawToRoleGrant;
  const displayName = `Grant ${grantedTo} ${granteeName} granted on ${grantedOn}, granted by ${grantedBy}`;
  return {
    assign: {
      _class: ['AccessPolicy'],
      _type: 'snowflake_grant',
      _key: buildKey(rawToRoleGrant),
      displayName,
      name: displayName,
      createdOn: getTime(createdOnStr),
      grantedBy,
      grantedTo,
      granteeName,
    },
    source: rawToRoleGrant,
  };
}

const step: IntegrationStep = {
  id: 'fetch-to-role-grants',
  name: 'Fetch To Role Grants',
  types: ['snowflake_grant'],
  dependsOn: ['fetch-roles'],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext) {
    const { config } = instance;
    let client: SnowflakeClient | undefined;
    const toRoleGrants: SnowflakeToRoleGrantEntityData[] = [];
    try {
      client = await createClient({ ...config, logger });
      logger.info('Fetching to role grants...');
      await jobState.iterateEntities(
        { _type: 'snowflake_role' },
        async (role: SnowflakeRole) => {
          const roleName = role.name;
          logger.info(
            {
              roleName,
            },
            'Fetching grants to role',
          );
          for await (const rawToRoleGrant of client.fetchToRoleGrants(
            roleName,
          )) {
            const snowflakeToRoleGrantData = convertToRoleGrant(rawToRoleGrant);
            toRoleGrants.push(snowflakeToRoleGrantData);
          }
        },
      );
      logger.info('Done fetching to role grants.');
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
      toRoleGrants.map((grant) =>
        createIntegrationEntity({ entityData: grant }),
      ),
    );
  },
};

export default step;
