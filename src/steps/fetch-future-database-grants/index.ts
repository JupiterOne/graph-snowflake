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
import { SnowflakeGrant, SnowflakeDatabase } from '../../types';

type RawFutureDatabaseGrant = RawSnowflake['FutureDatabaseGrant'];

interface SnowflakeFutureDatabaseGrantEntityData extends IntegrationEntityData {
  assign: SnowflakeGrant;
  source: RawFutureDatabaseGrant;
}

// DO NOT CHANGE THIS FUNCTION UNLESS YOU KNOW WHAT YOU ARE DOING.
function buildKey(raw: RawFutureDatabaseGrant): string {
  const {
    privilege,
    grantee_name: granteeName,
    grant_on: grantOn,
    grant_to: grantTo,
  } = raw;
  return `snowflake-grant:future-database::${privilege}:${grantOn}:${granteeName}:${grantTo}`;
}

function convertFutureDatabaseGrant(
  raw: RawFutureDatabaseGrant,
): SnowflakeFutureDatabaseGrantEntityData {
  const {
    created_on: createdOnStr,
    privilege,
    grantee_name: granteeName,
    grant_on: grantOn,
    grant_to: grantTo,
  } = raw;
  const displayName = `Grant future database privilege ${privilege} to ${grantTo} ${granteeName} on ${grantOn}`;
  return {
    assign: {
      _class: ['AccessPolicy'],
      _type: 'snowflake_grant',
      _key: buildKey(raw),
      displayName,
      name: displayName,
      createdOn: getTime(createdOnStr),
      grantedTo: grantTo,
      granteeName,
    },
    source: raw,
  };
}

const step: IntegrationStep = {
  id: 'fetch-future-database-grants',
  name: 'Fetch future Database Grants',
  types: ['snowflake_grant'],
  dependsOn: ['fetch-databases'],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext) {
    const { config } = instance;
    let client: SnowflakeClient | undefined;
    const futureDatabaseGrants: SnowflakeFutureDatabaseGrantEntityData[] = [];
    try {
      client = await createClient({ ...config, logger });
      logger.info('Fetching future database grants...');
      await jobState.iterateEntities(
        { _type: 'snowflake_database' },
        async (database: SnowflakeDatabase) => {
          const databaseName = database.name;
          logger.info(
            {
              databaseName,
            },
            'Fetching future grants of database',
          );
          for await (const rawFutureDatabaseGrant of client.fetchFutureDatabaseGrants(
            databaseName,
          )) {
            const snowflakeFutureDatabaseData = convertFutureDatabaseGrant(
              rawFutureDatabaseGrant,
            );
            futureDatabaseGrants.push(snowflakeFutureDatabaseData);
          }
        },
      );
      logger.info('Done fetching future database grants.');
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
      futureDatabaseGrants.map((grant) =>
        createIntegrationEntity({ entityData: grant }),
      ),
    );
  },
};

export default step;
