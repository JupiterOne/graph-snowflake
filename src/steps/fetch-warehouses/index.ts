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
import { SnowflakeWarehouse } from '../../types';

type RawWarehouse = RawSnowflake['Warehouse'];
interface SnowflakeWarehouseEntityData extends IntegrationEntityData {
  assign: SnowflakeWarehouse;
  source: RawWarehouse;
}

function buildKey(rawWarehouse: RawWarehouse): string {
  const { name } = rawWarehouse;
  return `snowflake-warehouse:${name}`;
}

function convertWarehouse(
  rawWarehouse: RawWarehouse,
): SnowflakeWarehouseEntityData {
  const { created_on: createdOnStr, name } = rawWarehouse;

  return {
    assign: {
      _class: ['DataStore', 'Database'],
      _type: 'snowflake_warehouse',
      _key: buildKey(rawWarehouse),
      createdOn: getTime(createdOnStr),
      classification: 'unknown',
      encrypted: true,
      displayName: name,
      name,
    },
    source: rawWarehouse,
  };
}

const step: IntegrationStep = {
  id: 'fetch-warehouses',
  name: 'Fetch Warehouses',
  types: ['snowflake_warehouse'],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext) {
    const { config } = instance;
    let client: SnowflakeClient | undefined;
    const warehouses: SnowflakeWarehouseEntityData[] = [];
    try {
      client = await createClient({ ...config, logger });
      logger.info('Fetching warehouses...');

      for await (const rawWarehouse of client.fetchWarehouses()) {
        const SnowflakeWarehouseEntityData = convertWarehouse(rawWarehouse);
        warehouses.push(SnowflakeWarehouseEntityData);
      }
      logger.info('Done fetching warehouses.');
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
      warehouses.map((warehouse) =>
        createIntegrationEntity({ entityData: warehouse }),
      ),
    );
  },
};

export default step;
