import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  IntegrationEntityData,
  createIntegrationEntity,
  getTime,
} from '@jupiterone/integration-sdk';

import { createClient, Client as SnowflakeClient } from '../../client';
import '../../client';
import { RawSnowflake } from '../../client/types';
import { SnowflakeManagedAccount } from '../../types';

type RawManagedAccount = RawSnowflake['ManagedAccount'];
interface SnowflakeManagedAccountEntityData extends IntegrationEntityData {
  assign: SnowflakeManagedAccount;
  source: RawManagedAccount;
}

function buildKey(raw: RawManagedAccount): string {
  const { name } = raw;
  return `snowflake-managed-account:${name}`;
}

function convertManagedAccount(
  raw: RawManagedAccount,
): SnowflakeManagedAccountEntityData {
  const { created_on: createdOnStr, name } = raw;

  return {
    assign: {
      _class: ['Account'],
      _type: 'snowflake_managed_account',
      _key: buildKey(raw),
      createdOn: getTime(createdOnStr),
      displayName: name,
      name,
    },
    source: raw,
  };
}

const step: IntegrationStep = {
  id: 'fetch-managed-accounts',
  name: 'Fetch Managed Accounts',
  types: ['snowflake_managed_account'],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext) {
    const { config } = instance;
    let client: SnowflakeClient | undefined;
    const managedAccounts: SnowflakeManagedAccountEntityData[] = [];
    try {
      client = await createClient({ ...config, logger });
      logger.info('Fetching managed accounts...');

      for await (const rawManagedAccount of client.fetchManagedAccounts()) {
        const managedAccountData = convertManagedAccount(rawManagedAccount);
        managedAccounts.push(managedAccountData);
      }
      logger.info('Done fetching managed accounts.');
    } catch (error) {
      logger.error({ error }, 'Error executing step');
      throw error;
    } finally {
      try {
        if (client) {
          await client.destroy();
        }
      } catch (error) {
        logger.error({ error }, 'Failed to destroy snowflake client');
      }
    }
    await jobState.addEntities(
      managedAccounts.map((account) =>
        createIntegrationEntity({ entityData: account }),
      ),
    );
  },
};

export default step;
