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
import { SnowflakeGrant } from '../../types';

type RawGlobalGrant = RawSnowflake['GlobalGrant'];

interface SnowflakeGlobalGrantEntityData extends IntegrationEntityData {
  assign: SnowflakeGrant;
  source: RawGlobalGrant;
}

// DO NOT CHANGE THIS FUNCTION UNLESS YOU KNOW WHAT YOU ARE DOING.
function buildKey(rawGlobalGrant: RawGlobalGrant): string {
  const {
    role,
    granted_to: grantedTo,
    grantee_name: granteeName,
    granted_by: grantedBy,
  } = rawGlobalGrant;
  return `snowflake-grant:global::${role}:${grantedTo}:${granteeName}:${grantedBy}`;
}

function convertGlobalGrant(
  rawGlobalGrant: RawGlobalGrant,
): SnowflakeGlobalGrantEntityData {
  const {
    created_on: createdOnStr,
    role,
    granted_to: grantedTo,
    grantee_name: granteeName,
    granted_by: grantedBy,
  } = rawGlobalGrant;
  const displayName = `Grant ${grantedTo} ${granteeName} role ${role}, granted by ${grantedBy}`;
  return {
    assign: {
      _class: ['AccessPolicy'],
      _type: 'snowflake_grant',
      _key: buildKey(rawGlobalGrant),
      displayName,
      name: displayName,
      createdOn: getTime(createdOnStr),
      grantedBy,
      grantedTo,
      granteeName,
    },
    source: rawGlobalGrant,
  };
}

const step: IntegrationStep = {
  id: 'fetch-global-grants',
  name: 'Fetch Global Grants',
  types: ['snowflake_grant'],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext) {
    const { config } = instance;
    let client: SnowflakeClient | undefined;
    const globalGrants: SnowflakeGlobalGrantEntityData[] = [];
    try {
      client = await createClient({ ...config, logger });
      logger.info('Fetching global grants...');

      for await (const rawGlobalGrant of client.fetchGlobalGrants()) {
        const snowflakeGlobalGrantData = convertGlobalGrant(rawGlobalGrant);
        globalGrants.push(snowflakeGlobalGrantData);
      }
      logger.info('Done fetching global grants.');
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
      globalGrants.map((globalGrant) =>
        createIntegrationEntity({ entityData: globalGrant }),
      ),
    );
  },
};

export default step;
