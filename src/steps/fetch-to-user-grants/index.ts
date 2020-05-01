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
import { SnowflakeGrant, SnowflakeUser } from '../../types';

type RawToUserGrant = RawSnowflake['ToUserPrivilegeGrant'];

interface SnowflakeToUserGrantEntityData extends IntegrationEntityData {
  assign: SnowflakeGrant;
  source: RawToUserGrant;
}

// DO NOT CHANGE THIS FUNCTION UNLESS YOU KNOW WHAT YOU ARE DOING.
function buildKey(rawToUserGrant: RawToUserGrant): string {
  const {
    role,
    granted_to: grantedTo,
    grantee_name: granteeName,
    granted_by: grantedBy,
  } = rawToUserGrant;
  return `snowflake-grant:touser::${role}:${grantedTo}:${granteeName}:${grantedBy}`;
}

function convertToUserGrant(
  RawToUserGrant: RawToUserGrant,
): SnowflakeToUserGrantEntityData {
  const {
    created_on: createdOnStr,
    role,
    granted_to: grantedTo,
    grantee_name: granteeName,
    granted_by: grantedBy,
  } = RawToUserGrant;
  const displayName = `Grant ${grantedTo} ${granteeName} role ${role}, granted by ${grantedBy}`;
  return {
    assign: {
      _class: ['AccessPolicy'],
      _type: 'snowflake_grant',
      _key: buildKey(RawToUserGrant),
      displayName,
      name: displayName,
      createdOn: getTime(createdOnStr),
      grantedBy,
      grantedTo,
      granteeName,
    },
    source: RawToUserGrant,
  };
}

const step: IntegrationStep = {
  id: 'fetch-to-user-grants',
  name: 'Fetch to User Grants',
  types: ['snowflake_grant'],
  dependsOn: ['fetch-users'],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext) {
    const { config } = instance;
    let client: SnowflakeClient | undefined;
    const toUserGrants: SnowflakeToUserGrantEntityData[] = [];
    try {
      client = await createClient({ ...config, logger });
      logger.info('Fetching to user grants...');
      await jobState.iterateEntities(
        { _type: 'snowflake_user' },
        async (user: SnowflakeUser) => {
          const userName = user.name;
          logger.info(
            {
              userName,
            },
            'Fetching grants to user',
          );
          for await (const rawToUserGrant of client.fetchToUserGrants(
            userName,
          )) {
            const snowflakeToUserGrantData = convertToUserGrant(rawToUserGrant);
            toUserGrants.push(snowflakeToUserGrantData);
          }
        },
      );
      logger.info('Done fetching to user grants.');
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
      toUserGrants.map((grant) =>
        createIntegrationEntity({ entityData: grant }),
      ),
    );
  },
};

export default step;
