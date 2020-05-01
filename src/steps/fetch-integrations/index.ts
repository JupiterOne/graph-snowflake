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
import { SnowflakeIntegration } from '../../types';

type RawIntegration = RawSnowflake['Integration'];
interface SnowflakeIntegrationEntityData extends IntegrationEntityData {
  assign: SnowflakeIntegration;
  source: RawIntegration;
}

function buildKey(rawIntegration: RawIntegration): string {
  const { name } = rawIntegration;
  return `snowflake-integration:${name}`;
}

function convertIntergration(
  rawIntegration: RawIntegration,
): SnowflakeIntegrationEntityData {
  const { created_on: createdOnStr, name } = rawIntegration;

  return {
    assign: {
      _class: ['Resource'],
      _type: 'snowflake_integration',
      _key: buildKey(rawIntegration),
      createdOn: getTime(createdOnStr),
      displayName: name,
      name,
    },
    source: rawIntegration,
  };
}

const step: IntegrationStep = {
  id: 'fetch-integrations',
  name: 'Fetch Integrations',
  types: ['snowflake_integration'],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext) {
    const { config } = instance;
    let client: SnowflakeClient | undefined;
    const integrations: SnowflakeIntegrationEntityData[] = [];
    try {
      client = await createClient({ ...config, logger });
      logger.info('Fetching integrations...');
      for await (const rawIntegration of client.fetchIntegrations()) {
        const integrationData = convertIntergration(rawIntegration);
        integrations.push(integrationData);
      }
      logger.info('Done fetching integrations.');
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
      integrations.map((integration) =>
        createIntegrationEntity({ entityData: integration }),
      ),
    );
  },
};

export default step;
