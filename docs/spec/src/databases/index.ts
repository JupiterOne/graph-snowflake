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
      {
        _type: 'snowflake_database_allows_role',
        sourceType: 'snowflake_database',
        _class: RelationshipClass.ALLOWS,
        targetType: 'snowflake_role',
      },
    ],
    dependsOn: ['fetch-warehouses', 'fetch-roles'],
    implemented: true,
  },
];
