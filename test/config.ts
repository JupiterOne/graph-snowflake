import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';
import { StepTestConfig } from '@jupiterone/integration-sdk-testing';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { invocationConfig } from '../src';
import { SnowflakeIntegrationConfig } from '../src/types';

if (process.env.LOAD_ENV) {
  dotenv.config({
    path: path.join(__dirname, '../.env'),
  });
}
const DEFAULT_USERNAME = 'snowflake-username';
const DEFAULT_ACCOUNT = 'snowflake-account';
const DEFAULT_ROLE = 'snowflake-role';
const DEFAULT_PASSWORD = 'snowflake-password';

export const integrationConfig: SnowflakeIntegrationConfig = {
  username: process.env.USERNAME || DEFAULT_USERNAME,
  account: process.env.ACCOUNT || DEFAULT_ACCOUNT,
  password: process.env.PASSWORD || DEFAULT_PASSWORD,
  role: process.env.ROLE || DEFAULT_ROLE,
};

export function buildStepTestConfigForStep(stepId: string): StepTestConfig {
  return {
    stepId,
    instanceConfig: integrationConfig,
    invocationConfig: invocationConfig as IntegrationInvocationConfig,
  };
}
