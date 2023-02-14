import { RelationshipClass, StepSpec } from '@jupiterone/integration-sdk-core';
import { SnowflakeIntegrationConfig } from '../../../../src/types';

export const databaseSpec: StepSpec<SnowflakeIntegrationConfig>[] = [
  {
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
    ],
    dependsOn: ['fetch-warehouses'],
    implemented: true,
  },
];
