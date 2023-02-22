import { RelationshipClass, StepSpec } from '@jupiterone/integration-sdk-core';
import { SnowflakeIntegrationConfig } from '../../../../src/types';

export const schemaSpec: StepSpec<SnowflakeIntegrationConfig>[] = [
  {
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
    implemented: true,
  },
];
