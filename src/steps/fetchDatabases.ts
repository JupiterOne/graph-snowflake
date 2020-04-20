import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  // createIntegrationEntity,
} from '@jupiterone/integration-sdk';

import { createClient, Client as SnowflakeClient } from '../client';
import '../client';

const step: IntegrationStep = {
  id: 'fetch-databases',
  name: 'Fetch Databases',
  types: ['snowflake_database'],
  async executionHandler({
    logger,
    // jobState,
    instance,
  }: IntegrationStepExecutionContext) {
    const { config } = instance;
    let client: SnowflakeClient | undefined;
    try {
      client = await createClient({ ...config, logger });
      logger.info('Fetching databases...');

      for await (const row of client.fetchDatabases()) {
        logger.info({ row: !!row }, 'Got row!');
      }
      logger.info('Done fetching databases.');
    } catch (error) {
      logger.error({ error }, 'Error executing step');
    } finally {
      try {
        if (client) {
          await client.destroy();
        }
      } catch (error) {
        logger.error({ error }, 'Failed to destroy snowflake client');
      }
    }
    // await jobState.addEntities([
    //   createIntegrationEntity({
    //     entityData: {
    //       source: {
    //         id: 'integration-account-a',
    //         name: 'My Account',
    //       },
    //       assign: {
    //         _key: 'account:integration-account-a',
    //         _type: 'my-integration-account',
    //         _class: 'Account',
    //       },
    //     },
    //   }),
    // ]);
  },
};

export default step;
