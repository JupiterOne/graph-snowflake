import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  IntegrationEntityData,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk';

import { SnowflakeAccount } from '../../types';

interface SnowflakeAccountEntityData extends IntegrationEntityData {
  assign: SnowflakeAccount;
  source: {};
}

// DO NOT CHANGE THIS UNLESS YOU KNOW WHAT YOU ARE DOING
function buildKey(name: string): string {
  return `snowflake-account:${name}`;
}

function createAccount(config: any): SnowflakeAccountEntityData {
  const { account: name } = config;
  return {
    assign: {
      _class: ['Account'],
      _type: 'snowflake_account',
      _key: buildKey(name),
      name,
    },
    source: {},
  };
}

const step: IntegrationStep = {
  id: 'create-account',
  name: 'Create Account',
  types: ['snowflake_account'],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext) {
    const { config } = instance;
    logger.info('Creating account object...');
    const account = createAccount(config);
    await jobState.addEntities([
      createIntegrationEntity({ entityData: account }),
    ]);
    logger.info('Done creating account object.');
  },
};

export default step;
