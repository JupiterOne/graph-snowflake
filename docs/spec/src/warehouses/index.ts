import { StepSpec } from '@jupiterone/integration-sdk-core';
import { SnowflakeIntegrationConfig } from '../../../../src/types';

export const warehousesSpec: StepSpec<SnowflakeIntegrationConfig>[] = [
  {
    id: 'fetch-warehouses',
    name: 'Fetch Warehouses',
    entities: [
      {
        resourceName: 'Warehouse',
        _type: 'snowflake_warehouse',
        _class: ['DataStore', 'Database'],
      },
    ],
    relationships: [],
    implemented: true,
  },
];
