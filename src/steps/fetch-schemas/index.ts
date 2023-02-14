import {
  IntegrationStep,
  IntegrationEntityData,
  createIntegrationEntity,
  parseTimePropertyValue,
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createClient, Client as SnowflakeClient } from '../../client';
import '../../client';
import { RawSnowflake } from '../../client/types';
import {
  SnowflakeSchema,
  SnowflakeDatabase,
  SnowflakeIntegrationConfig,
} from '../../types';

type RawSchema = RawSnowflake['Schema'];
interface SnowflakeSchemaEntityData extends IntegrationEntityData {
  assign: SnowflakeSchema;
  source: RawSchema;
}

function buildKey(raw: RawSchema, warehouseName: string): string {
  const { name } = raw;
  return `snowflake-schema:${warehouseName}:${raw.database_name}:${name}`;
}

function convertSchema(
  raw: RawSchema,
  warehouseName: string,
): SnowflakeSchemaEntityData {
  const { created_on: createdOnStr, name, database_name: databaseName } = raw;

  return {
    assign: {
      _class: ['DataStore', 'Database'],
      _type: 'snowflake_schema',
      _key: buildKey(raw, warehouseName),
      createdOn: parseTimePropertyValue(createdOnStr),
      databaseName,
      warehouseName,
      classification: 'unknown',
      encrypted: true,
      displayName: name,
      name,
    },
    source: raw,
  };
}

const step: IntegrationStep<SnowflakeIntegrationConfig> = {
  id: 'fetch-schemas',
  name: 'Fetch Schemas',
  entities: [
    {
      resourceName: 'Schema',
      _type: 'snowflake_schema',
      _class: ['DataStore', 'Database'],
    },
  ],
  relationships: [
    {
      _type: 'snowflake_database_has_schema',
      sourceType: 'snowflake_database',
      _class: RelationshipClass.HAS,
      targetType: 'snowflake_schema',
    },
  ],
  dependsOn: ['fetch-databases'],
  async executionHandler({ logger, jobState, instance }) {
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

          await client!.setWarehouse(database.warehouseName);
          await client!.setDatabase(database.name);
          for await (const rawSchema of client!.fetchSchemas()) {
            const schemaData = convertSchema(rawSchema, database.warehouseName);
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
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: database,
            to: schemaEntity,
          }),
        ]);
      }
    }
  },
};

export default step;
