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
import { SnowflakePipe, SnowflakeDatabase } from '../../types';

type RawPipe = RawSnowflake['Pipe'];
interface SnowflakePipeEntityData extends IntegrationEntityData {
  assign: SnowflakePipe;
  source: RawPipe;
}

function buildKey(raw: RawPipe): string {
  const { name } = raw;
  return `snowflake-pipe:${name}`;
}

function convertPipe(raw: RawPipe): SnowflakePipeEntityData {
  const { created_on: createdOnStr, name } = raw;

  return {
    assign: {
      _class: ['Queue'],
      _type: 'snowflake_pipe',
      _key: buildKey(raw),
      createdOn: getTime(createdOnStr),
      displayName: name,
      name,
    },
    source: raw,
  };
}

const step: IntegrationStep = {
  id: 'fetch-pipes',
  name: 'Fetch Pipes',
  types: ['snowflake_pipe'],
  dependsOn: ['fetch-databases'],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext) {
    const { config } = instance;
    let client: SnowflakeClient | undefined;
    const pipes: SnowflakePipeEntityData[] = [];
    try {
      client = await createClient({ ...config, logger });
      logger.info('Fetching pipes...');
      await jobState.iterateEntities(
        { _type: 'snowflake_database' },
        async (database: SnowflakeDatabase) => {
          const databaseName = database.name;
          logger.info({ databaseName }, 'Fetching pipes in database.');
          await client.setDatabase(databaseName);
          for await (const rawPipe of client.fetchPipes()) {
            const pipeData = convertPipe(rawPipe);
            pipes.push(pipeData);
          }
        },
      );

      logger.info('Done fetching pipes.');
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
      pipes.map((pipe) => createIntegrationEntity({ entityData: pipe })),
    );
  },
};

export default step;
