import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  IntegrationEntityData,
  createIntegrationEntity,
  getTime,
  createIntegrationRelationship,
} from '@jupiterone/integration-sdk';

import { createClient, Client as SnowflakeClient } from '../../client';
import '../../client';
import { RawSnowflake } from '../../client/types';
import { SnowflakeSchema, SnowflakeDatabase } from '../../types';

type RawSchema = RawSnowflake['Schema'];
interface SnowflakeSchemaEntityData extends IntegrationEntityData {
  assign: SnowflakeSchema;
  source: RawSchema;
}

function buildKey(raw: RawSchema): string {
  const { name } = raw;
  return `snowflake-schema:${name}`;
}

function convertSchema(raw: RawSchema): SnowflakeSchemaEntityData {
  const { created_on: createdOnStr, name, database_name: databaseName } = raw;

  return {
    assign: {
      _class: ['DataStore', 'Database'],
      _type: 'snowflake_schema',
      _key: buildKey(raw),
      createdOn: getTime(createdOnStr),
      databaseName,
      classification: 'unknown',
      encrypted: true,
      displayName: name,
      name,
    },
    source: raw,
  };
}

const step: IntegrationStep = {
  id: 'fetch-schemas',
  name: 'Fetch Schemas',
  types: ['snowflake_schema'],
  dependsOn: ['fetch-databases'],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext) {
    const { config } = instance;
    let client: SnowflakeClient | undefined;
    const databaseMap = new Map<string, SnowflakeDatabase | undefined>();
    const schemas: SnowflakeSchemaEntityData[] = [];
    try {
      client = await createClient({ ...config, logger });
      logger.info('Fetching schemas...');
      await jobState.iterateEntities(
        { _type: 'snowflake_database' },
        async (database: SnowflakeDatabase) => {
          databaseMap.set(database.name, database);
          await client.setDatabase(database.name);
          for await (const rawSchema of client.fetchSchemas()) {
            const schemaData = convertSchema(rawSchema);
            schemas.push(schemaData);
          }
        },
      );
      logger.info('Done fetching schemas.');
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
      schemas.map((schema) => createIntegrationEntity({ entityData: schema })),
    );

    for (const schema of schemas) {
      const { assign: schemaEntity } = schema;
      const { databaseName } = schemaEntity;
      const database = databaseMap.get(databaseName);
      if (database) {
        await jobState.addRelationships([
          createIntegrationRelationship({
            _class: 'HAS',
            from: database,
            to: schemaEntity,
          }),
        ]);
      }
    }
  },
};

export default step;
