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
import { SnowflakeGrant, SnowflakeSchema } from '../../types';

type RawFutureSchemaGrant = RawSnowflake['FutureSchemaGrant'];

interface SnowflakeFutureSchemaGrantEntityData extends IntegrationEntityData {
  assign: SnowflakeGrant;
  source: RawFutureSchemaGrant;
}

// DO NOT CHANGE THIS FUNCTION UNLESS YOU KNOW WHAT YOU ARE DOING.
function buildKey(raw: RawFutureSchemaGrant): string {
  const {
    privilege,
    grantee_name: granteeName,
    grant_on: grantOn,
    grant_to: grantTo,
  } = raw;
  return `snowflake-grant:future-schema::${privilege}:${grantOn}:${granteeName}:${grantTo}`;
}

function convertFutureSchemaGrant(
  raw: RawFutureSchemaGrant,
): SnowflakeFutureSchemaGrantEntityData {
  const {
    created_on: createdOnStr,
    privilege,
    grantee_name: granteeName,
    grant_on: grantOn,
    grant_to: grantTo,
  } = raw;
  const displayName = `Grant future schema privilege ${privilege} to ${grantTo} ${granteeName} on ${grantOn}`;
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
  id: 'fetch-future-schema-grants',
  name: 'Fetch future Schema Grants',
  types: ['snowflake_grant'],
  dependsOn: ['fetch-schemas'],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext) {
    const { config } = instance;
    let client: SnowflakeClient | undefined;
    const futureSchemaGrants: SnowflakeFutureSchemaGrantEntityData[] = [];
    try {
      client = await createClient({ ...config, logger });
      logger.info('Fetching future schema grants...');
      await jobState.iterateEntities(
        { _type: 'snowflake_schema' },
        async (schema: SnowflakeSchema) => {
          const schemaName = schema.name;
          const databaseName = schema.databaseName;
          logger.info(
            {
              schemaName,
            },
            'Fetching future grants of schema',
          );
          await client.executeStatementNoReturn(`USE DATABASE ${databaseName}`);
          for await (const rawFutureSchemaGrant of client.fetchFutureSchemaGrants(
            schemaName,
          )) {
            const snowflakeFutureSchemaData = convertFutureSchemaGrant(
              rawFutureSchemaGrant,
            );
            futureSchemaGrants.push(snowflakeFutureSchemaData);
          }
        },
      );
      logger.info('Done fetching future schema grants.');
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
      futureSchemaGrants.map((grant) =>
        createIntegrationEntity({ entityData: grant }),
      ),
    );
  },
};

export default step;
