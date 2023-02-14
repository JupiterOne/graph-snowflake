import { RelationshipClass, StepSpec } from '@jupiterone/integration-sdk-core';
import { SnowflakeIntegrationConfig } from '../../../../src/types';

export const tablesSpec: StepSpec<SnowflakeIntegrationConfig>[] = [
  {
    id: 'fetch-tables',
    name: 'Fetch Tables',
    entities: [
      {
        resourceName: 'Table',
        _type: 'snowflake_table',
        _class: ['DataStore', 'Database'],
      },
    ],
    relationships: [
      {
        _type: 'snowflake_schema_has_table',
        sourceType: 'snowflake_schema',
        _class: RelationshipClass.HAS,
        targetType: 'snowflake_table',
      },
    ],
    dependsOn: ['fetch-schemas'],
    implemented: true,
  },
];
