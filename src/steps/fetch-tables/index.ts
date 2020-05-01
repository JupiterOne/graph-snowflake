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
import { SnowflakeTable, SnowflakeSchema } from '../../types';

type RawTable = RawSnowflake['Table'];
interface SnowflakeTableEntityData extends IntegrationEntityData {
  assign: SnowflakeTable;
  source: RawTable;
}

function buildKey(rawTable: RawTable): string {
  const {
    name,
    database_name: databaseName,
    schema_name: schemaName,
  } = rawTable;
  return `snowflake-table:${databaseName}:${schemaName}:${name}`;
}

function convertTable(rawTable: RawTable): SnowflakeTableEntityData {
  const {
    created_on: createdOnStr,
    rows,
    retention_time: retentionTimeStr,
    automatic_clustering: automaticClusteringStr,
    name,
    dropped_on: droppedOnStr,
    database_name: databaseName,
    change_tracking: changeTrackingStr,
    bytes,
    owner,
    kind,
    cluster_by: clusterBy,
    schema_name: schemaName,
  } = rawTable;
  const retentionTimeInDays = parseInt(retentionTimeStr, 10);

  return {
    assign: {
      _class: ['DataStore', 'Database'],
      _type: 'snowflake_table',
      _key: buildKey(rawTable),
      createdOn: getTime(createdOnStr),
      itemCount: rows,
      displayName: name,
      tableName: name,
      tableSizeBytes: bytes,
      clusterBy,
      kind,
      changeTracking: changeTrackingStr === 'ON',
      droppedOn: droppedOnStr ? getTime(droppedOnStr) : null,
      owner,
      // TODO: there aren't really tags like we have in
      // AWS, can we use some kind of structured value
      // in the `comment` field?
      classification: 'unknown',
      // according to: https://docs.snowflake.com/en/user-guide/security-encryption.html
      // "In Snowflake, all data at rest is always encrypted."
      encrypted: true,
      databaseName,
      schemaName,
      automaticClustering: automaticClusteringStr === 'ON',
      retentionTimeInDays: isNaN(retentionTimeInDays)
        ? retentionTimeInDays
        : null,
    },
    source: rawTable,
  };
}

const step: IntegrationStep = {
  id: 'fetch-tables',
  name: 'Fetch Tables',
  types: ['snowflake_table'],
  dependsOn: ['fetch-schemas'],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext) {
    const { config } = instance;
    let client: SnowflakeClient | undefined;
    const schemaMap = new Map<string, SnowflakeSchema | undefined>();
    const tables: SnowflakeTableEntityData[] = [];
    try {
      client = await createClient({ ...config, logger });
      logger.info('Fetching tables...');
      await jobState.iterateEntities(
        { _type: 'snowflake_schema' },
        async (schema: SnowflakeSchema) => {
          schemaMap.set(schema.name, schema);
          await client.setDatabase(schema.databaseName);
          await client.setSchema(schema.name);
          for await (const rawTable of client.fetchTables()) {
            const snowflakeTable = convertTable(rawTable);
            tables.push(snowflakeTable);
          }
        },
      );
      logger.info('Done fetching tables.');
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
      tables.map((table) => createIntegrationEntity({ entityData: table })),
    );

    for (const table of tables) {
      const { assign: tableEntity } = table;
      const schema = schemaMap.get(tableEntity.schemaName);
      if (schema) {
        await jobState.addRelationships([
          createIntegrationRelationship({
            _class: 'HAS',
            from: schema,
            to: tableEntity,
          }),
        ]);
      }
    }
  },
};

export default step;
