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
import { SnowflakeTask } from '../../types';

type RawTask = RawSnowflake['Task'];
interface SnowflakeTaskEntityData extends IntegrationEntityData {
  assign: SnowflakeTask;
  source: RawTask;
}

function buildKey(raw: RawTask): string {
  const { name } = raw;
  return `snowflake-task:${name}`;
}

function convertTask(raw: RawTask): SnowflakeTaskEntityData {
  const {
    created_on: createdOnStr,
    name,
    owner,
    database_name: databaseName,
    warehouse: warehouseName,
    comment,
    definition,
    condition,
    schema_name: schemaName,
    schedule,
  } = raw;

  return {
    assign: {
      _class: ['Task'],
      _type: 'snowflake_task',
      _key: buildKey(raw),
      createdOn: getTime(createdOnStr),
      displayName: name,
      name,
      owner,
      definition,
      condition,
      comment,
      schedule,
      schemaName,
      databaseName,
      warehouseName,
    },
    source: raw,
  };
}

const step: IntegrationStep = {
  id: 'fetch-tasks',
  name: 'Fetch Tasks',
  types: ['snowflake_task'],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext) {
    const { config } = instance;
    let client: SnowflakeClient | undefined;
    const tasks: SnowflakeTaskEntityData[] = [];
    try {
      client = await createClient({ ...config, logger });
      logger.info('Fetching tasks...');

      for await (const rawTask of client.fetchTasks()) {
        const taskData = convertTask(rawTask);
        tasks.push(taskData);
      }
      logger.info('Done fetching tasks.');
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
      tasks.map((task) => createIntegrationEntity({ entityData: task })),
    );
  },
};

export default step;
