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
import { SnowflakeDatabase, SnowflakeWarehouse } from '../../types';

type RawDatabase = RawSnowflake['Database'];
interface SnowflakeDatabaseEntityData extends IntegrationEntityData {
  assign: SnowflakeDatabase;
  source: RawDatabase;
}

// DO NOT CHANGE THIS UNLESS YOU KNOW WHAT YOU ARE DOING
function buildKey(rawDatabase: RawDatabase): string {
  return `snowflake-database:${rawDatabase.name}`;
}

function convertDatabase(
  rawDatabase: RawDatabase,
  currentWarehouse: string,
): SnowflakeDatabaseEntityData {
  const {
    name,
    created_on: createdOnStr,
    origin,
    owner,
    comment,
    retention_time: retentionTimeStr,
  } = rawDatabase;
  const retentionTimeInDays = parseInt(retentionTimeStr, 10);
  return {
    assign: {
      _class: ['DataStore', 'Database'],
      _type: 'snowflake_database',
      _key: buildKey(rawDatabase),
      displayName: name,
      name,
      createdOn: getTime(createdOnStr),
      comment,
      owner,
      origin,
      // TODO: there aren't really tags like we have in
      // AWS, can we use some kind of structured value
      // in the `comment` field?
      classification: 'unknown',
      // according to: https://docs.snowflake.com/en/user-guide/security-encryption.html
      // "In Snowflake, all data at rest is always encrypted."
      encrypted: true,
      retentionTimeInDays: isNaN(retentionTimeInDays)
        ? retentionTimeInDays
        : null,
      warehouseName: currentWarehouse,
    },
    source: rawDatabase,
  };
}

const step: IntegrationStep = {
  id: 'fetch-databases',
  name: 'Fetch Databases',
  types: ['snowflake_database'],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext) {
    const { config } = instance;
    let client: SnowflakeClient | undefined;
    const warehouseMap = new Map<string, SnowflakeWarehouse | undefined>();
    const databases: SnowflakeDatabaseEntityData[] = [];
    try {
      client = await createClient({ ...config, logger });
      logger.info('Fetching databases...');

      await jobState.iterateEntities(
        { _type: 'snowflake_warehouse' },
        async (warehouse: SnowflakeWarehouse) => {
          warehouseMap.set(warehouse.name, warehouse);
          await client.setWarehouse(warehouse.name);
          for await (const rawDatabase of client.fetchDatabases()) {
            const snowflakeDatabase = convertDatabase(
              rawDatabase,
              warehouse.name,
            );
            databases.push(snowflakeDatabase);
          }
        },
      );

      logger.info('Done fetching databases.');
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
      databases.map((database) =>
        createIntegrationEntity({ entityData: database }),
      ),
    );

    for (const database of databases) {
      const { assign: databaseEntity } = database;
      const { warehouseName } = databaseEntity;
      const warehouse = warehouseMap.get(warehouseName);
      await jobState.addRelationships([
        createIntegrationRelationship({
          _class: 'HAS',
          from: warehouse,
          to: databaseEntity,
        }),
      ]);
    }
  },
};

export default step;
