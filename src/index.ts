import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';

import validateInvocation from './validateInvocation';

import fetchDatabases from './steps/fetch-databases';
import fetchSchemas from './steps/fetch-schemas';
import fetchTables from './steps/fetch-tables';
import fetchUsers from './steps/fetch-users';
import fetchWarehouses from './steps/fetch-warehouses';
import { SnowflakeIntegrationConfig } from './types';
import { roleSteps } from './steps/fetch-roles';

export const invocationConfig: IntegrationInvocationConfig<SnowflakeIntegrationConfig> = {
  instanceConfigFields: {
    username: {
      type: 'string',
    },
    account: {
      type: 'string',
    },
    password: {
      type: 'string',
      mask: true,
    },
    role: {
      type: 'string',
    },
  },
  validateInvocation,
  integrationSteps: [
    fetchDatabases,
    fetchSchemas,
    fetchTables,
    fetchUsers,
    fetchWarehouses,
    ...roleSteps,
  ],
};
