import { StepSpec } from '@jupiterone/integration-sdk-core';
import { SnowflakeIntegrationConfig } from '../../../../src/types';

export const userSpec: StepSpec<SnowflakeIntegrationConfig>[] = [
  {
    id: 'fetch-users',
    name: 'Fetch Users',
    entities: [
      {
        resourceName: 'User',
        _type: 'snowflake_user',
        _class: ['User'],
      },
    ],
    relationships: [],
    implemented: true,
  },
];
