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
import { SnowflakeStage } from '../../types';

type RawStage = RawSnowflake['Stage'];
interface SnowflakeStageEntityData extends IntegrationEntityData {
  assign: SnowflakeStage;
  source: RawStage;
}

function buildKey(raw: RawStage): string {
  const { name } = raw;
  return `snowflake-stage:${name}`;
}

function convertStage(raw: RawStage): SnowflakeStageEntityData {
  const { created_on: createdOnStr, name } = raw;

  return {
    assign: {
      _class: ['DataStore'],
      _type: 'snowflake_stage',
      _key: buildKey(raw),
      createdOn: getTime(createdOnStr),
      displayName: name,
      name,
      encrypted: true,
      classification: 'unknown',
    },
    source: raw,
  };
}

const step: IntegrationStep = {
  id: 'fetch-stages',
  name: 'Fetch Stages',
  types: ['snowflake_stage'],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext) {
    const { config } = instance;
    let client: SnowflakeClient | undefined;
    const stages: SnowflakeStageEntityData[] = [];
    try {
      client = await createClient({ ...config, logger });
      logger.info('Fetching stages...');

      for await (const rawStage of client.fetchStages()) {
        const stageData = convertStage(rawStage);
        stages.push(stageData);
      }
      logger.info('Done fetching stages.');
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
      stages.map((stage) => createIntegrationEntity({ entityData: stage })),
    );
  },
};

export default step;
