import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  // createIntegrationEntity,
} from '@jupiterone/integration-sdk';

import { createClient, Client as SnowflakeClient } from '../client';

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
      logger.info('Creating client...');
      client = await createClient(config);
      logger.info('Done creating client.');
      logger.info('Fetching databases...');
      await client.executeStatementNoReturn('USE ROLE JUPITERONE;');
      for await (const row of client.executeStatement('SHOW DATABASES;')) {
        logger.info(row, 'got row of databases!');
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
