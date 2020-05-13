import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk';

import instanceConfigFields from './instanceConfigFields';
import validateInvocation from './validateInvocation';

import fetchDatabases from './steps/fetch-databases';
import fetchSchemas from './steps/fetch-schemas';
import fetchTables from './steps/fetch-tables';
import fetchUsers from './steps/fetch-users';
import fetchWarehouses from './steps/fetch-warehouses';

export const invocationConfig: IntegrationInvocationConfig = {
  instanceConfigFields,
  validateInvocation,
  integrationSteps: [
    fetchDatabases,
    fetchSchemas,
    fetchTables,
    fetchUsers,
    fetchWarehouses,
  ],
};