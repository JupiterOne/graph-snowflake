import { IntegrationSpecConfig } from '@jupiterone/integration-sdk-core';

import { SnowflakeIntegrationConfig } from '../../../src/types';
import { databaseSpec } from './databases';
import { schemaSpec } from './schemas';
import { tablesSpec } from './tables';
import { userSpec } from './users';
import { warehousesSpec } from './warehouses';

export const invocationConfig: IntegrationSpecConfig<SnowflakeIntegrationConfig> = {
  integrationSteps: [
    ...userSpec,
    ...databaseSpec,
    ...schemaSpec,
    ...tablesSpec,
    ...warehousesSpec,
  ],
};
