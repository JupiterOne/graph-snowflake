import {
  IntegrationStep,
  IntegrationEntityData,
  createIntegrationEntity,
  parseTimePropertyValue,
  createDirectRelationship,
  RelationshipClass,
  IntegrationStepExecutionContext,
  IntegrationWarnEventName,
} from '@jupiterone/integration-sdk-core';

import { createClient, Client as SnowflakeClient } from '../../client';
import '../../client';
import { RawSnowflake } from '../../client/types';
import {
  SnowflakeDatabase,
  SnowflakeWarehouse,
  SnowflakeIntegrationConfig,
} from '../../types';

type RawDatabase = RawSnowflake['Database'];
interface SnowflakeDatabaseEntityData extends IntegrationEntityData {
  assign: SnowflakeDatabase;
  source: RawDatabase;
}

// DO NOT CHANGE THIS UNLESS YOU KNOW WHAT YOU ARE DOING
function buildKey(rawDatabase: RawDatabase, currentWarehouse: string): string {
  return `snowflake-database:${currentWarehouse}:${rawDatabase.name}`;
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
      _key: buildKey(rawDatabase, currentWarehouse),
      displayName: name,
      name,
      createdOn: parseTimePropertyValue(createdOnStr) as number,
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

async function executionHandler({
  logger,
  jobState,
  instance,
}: IntegrationStepExecutionContext<SnowflakeIntegrationConfig>) {
  const { config } = instance;
  let client: SnowflakeClient | undefined;
  const warehouseMap = new Map<string, SnowflakeWarehouse | undefined>();
  const databases: SnowflakeDatabaseEntityData[] = [];

  try {
    client = await createClient({ ...config, logger });
    logger.info('Fetching databases...');
    const forbiddenWarehouses: string[] = [];

    await jobState.iterateEntities(
      { _type: 'snowflake_warehouse' },
      async (warehouse: SnowflakeWarehouse) => {
        warehouseMap.set(warehouse.name, warehouse);

        try {
          await client!.setWarehouse(warehouse.name);
        } catch (err) {
          if (err.message.includes('Insufficient privileges to operate')) {
            forbiddenWarehouses.push(warehouse.name);
            return;
          }
          throw err;
        }
        for await (const rawDatabase of client!.fetchDatabases()) {
          const snowflakeDatabase = convertDatabase(
            rawDatabase,
            warehouse.name,
          );
          databases.push(snowflakeDatabase);

          if (rawDatabase.owner !== '') {
            for await (const rawPrivilege of client!.fetchToDatabaseGrants(
              rawDatabase.name,
            )) {
              const exists = jobState.hasKey(
                `snowflake-role:${rawPrivilege.grantee_name}`,
              );

              if (exists) {
                await jobState.addRelationships([
                  createDirectRelationship({
                    _class: RelationshipClass.ALLOWS,
                    fromKey: snowflakeDatabase.assign._key,
                    fromType: snowflakeDatabase.assign._type,
                    toKey: `snowflake-role:${rawPrivilege.grantee_name}`,
                    toType: 'snowflake_role',
                  }),
                ]);
              }
            }
          }
        }
      },
    );

    if (forbiddenWarehouses.length) {
      logger.publishWarnEvent({
        name: IntegrationWarnEventName.MissingPermission,
        description: `Skipped fetching databases for warehouses, the user has insufficient privileges to operate in the following warehouses: ${forbiddenWarehouses.join(
          ', ',
        )}`,
      });
    }

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
    if (warehouse) {
      await jobState.addRelationships([
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: warehouse,
          to: databaseEntity,
        }),
      ]);
    }
  }
}

const step: IntegrationStep<SnowflakeIntegrationConfig> = {
  id: 'fetch-databases',
  name: 'Fetch Databases',
  entities: [
    {
      resourceName: 'Database',
      _type: 'snowflake_database',
      _class: ['DataStore', 'Database'],
    },
  ],
  relationships: [
    {
      _type: 'snowflake_warehouse_has_database',
      sourceType: 'snowflake_warehouse',
      _class: RelationshipClass.HAS,
      targetType: 'snowflake_database',
    },
    {
      _type: 'snowflake_database_allows_role',
      sourceType: 'snowflake_database',
      _class: RelationshipClass.ALLOWS,
      targetType: 'snowflake_role',
    },
  ],
  dependsOn: ['fetch-warehouses', 'fetch-roles'],
  executionHandler,
};

export default step;
