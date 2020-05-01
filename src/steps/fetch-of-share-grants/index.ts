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

type RawOfShareGrant = RawSnowflake['OfShareGrant'];

interface SnowflakeOfShareGrantEntityData extends IntegrationEntityData {
  assign: SnowflakeGrant;
  source: RawOfShareGrant;
}

// DO NOT CHANGE THIS FUNCTION UNLESS YOU KNOW WHAT YOU ARE DOING.
function buildKey(rawToShareGrant: RawOfShareGrant): string {
  const {
    share,
    granted_to: grantedTo,
    grantee_name: granteeName,
    granted_by: grantedBy,
  } = rawToShareGrant;
  return `snowflake-grant:ofshare::${share}:${grantedTo}:${granteeName}:${grantedBy}`;
}

function convertOfShareGrant(
  rawToShareGrant: RawOfShareGrant,
): SnowflakeOfShareGrantEntityData {
  const {
    created_on: createdOnStr,
    share,
    granted_to: grantedTo,
    grantee_name: granteeName,
    granted_by: grantedBy,
  } = rawToShareGrant;
  const displayName = `Grant on share ${share} ${grantedTo} ${granteeName} by ${grantedBy}`;
  return {
    assign: {
      _class: ['AccessPolicy'],
      _type: 'snowflake_grant',
      _key: buildKey(rawToShareGrant),
      displayName,
      name: share,
      share,
      createdOn: getTime(createdOnStr),
      grantedBy,
      grantedTo,
      granteeName,
    },
    source: rawToShareGrant,
  };
}

const step: IntegrationStep = {
  id: 'fetch-of-share-grants',
  name: 'Fetch of Share Grants',
  types: ['snowflake_grant'],
  dependsOn: ['fetch-shares'],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext) {
    const { config } = instance;
    let client: SnowflakeClient | undefined;
    const ofShareGrants: SnowflakeOfShareGrantEntityData[] = [];
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
            'Fetching grants of share',
          );
          for await (const rawOfShareGrant of client.fetchOfShareGrants(
            shareName,
          )) {
            const snowflakeToShareGrantData = convertOfShareGrant(
              rawOfShareGrant,
            );
            ofShareGrants.push(snowflakeToShareGrantData);
          }
        },
      );
      logger.info('Done fetching of share grants.');
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
      ofShareGrants.map((grant) =>
        createIntegrationEntity({ entityData: grant }),
      ),
    );
  },
};

export default step;
