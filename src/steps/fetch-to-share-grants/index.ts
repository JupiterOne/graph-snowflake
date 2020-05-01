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
import { SnowflakeGrant, SnowflakeShare } from '../../types';

type RawToShareGrant = RawSnowflake['ToShareGrant'];

interface SnowflakeToShareGrantEntityData extends IntegrationEntityData {
  assign: SnowflakeGrant;
  source: RawToShareGrant;
}

// DO NOT CHANGE THIS FUNCTION UNLESS YOU KNOW WHAT YOU ARE DOING.
function buildKey(rawToShareGrant: RawToShareGrant): string {
  const {
    name,
    granted_to: grantedTo,
    grantee_name: granteeName,
    granted_on: grantedOn,
  } = rawToShareGrant;
  return `snowflake-grant:toshare::${name}:${grantedTo}:${granteeName}:${grantedOn}`;
}

function convertToShareGrant(
  rawToShareGrant: RawToShareGrant,
): SnowflakeToShareGrantEntityData {
  const {
    created_on: createdOnStr,
    name,
    granted_to: grantedTo,
    grantee_name: granteeName,
    granted_on: grantedOn,
  } = rawToShareGrant;
  const displayName = `Grant ${name} ${grantedTo} ${granteeName} on ${grantedOn}`;
  return {
    assign: {
      _class: ['AccessPolicy'],
      _type: 'snowflake_grant',
      _key: buildKey(rawToShareGrant),
      displayName,
      name,
      createdOn: getTime(createdOnStr),
      grantedOn,
      grantedTo,
      granteeName,
    },
    source: rawToShareGrant,
  };
}

const step: IntegrationStep = {
  id: 'fetch-to-share-grants',
  name: 'Fetch to Share Grants',
  types: ['snowflake_grant'],
  dependsOn: ['fetch-shares'],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext) {
    const { config } = instance;
    let client: SnowflakeClient | undefined;
    const toShareGrants: SnowflakeToShareGrantEntityData[] = [];
    try {
      client = await createClient({ ...config, logger });
      logger.info('Fetching to share grants...');
      await jobState.iterateEntities(
        { _type: 'snowflake_share' },
        async (share: SnowflakeShare) => {
          // HACK: this throws an error when calling
          // Error thrown: "Share '"SNOWFLAKE.ACCOUNT_USAGE"' does not exist or not authorized.""
          if (share.name.endsWith('ACCOUNT_USAGE')) {
            return;
          }
          const shareName = share.name;
          logger.info(
            {
              shareName,
            },
            'Fetching grants to share',
          );
          for await (const rawToShareGrant of client.fetchToShareGrants(
            shareName,
          )) {
            const snowflakeToShareGrantData = convertToShareGrant(
              rawToShareGrant,
            );
            toShareGrants.push(snowflakeToShareGrantData);
          }
        },
      );
      logger.info('Done fetching to share grants.');
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
      toShareGrants.map((grant) =>
        createIntegrationEntity({ entityData: grant }),
      ),
    );
  },
};

export default step;
