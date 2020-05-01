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
import { SnowflakeStream } from '../../types';

type RawStream = RawSnowflake['Stream'];
interface SnowflakeStreamEntityData extends IntegrationEntityData {
  assign: SnowflakeStream;
  source: RawStream;
}

function buildKey(raw: RawStream): string {
  const { name } = raw;
  return `snowflake-stream:${name}`;
}

function convertStream(raw: RawStream): SnowflakeStreamEntityData {
  const { created_on: createdOnStr, name } = raw;

  return {
    assign: {
      _class: ['Queue'],
      _type: 'snowflake_stream',
      _key: buildKey(raw),
      createdOn: getTime(createdOnStr),
      displayName: name,
      name,
    },
    source: raw,
  };
}

const step: IntegrationStep = {
  id: 'fetch-streams',
  name: 'Fetch Streams',
  types: ['snowflake_stream'],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext) {
    const { config } = instance;
    let client: SnowflakeClient | undefined;
    const streams: SnowflakeStreamEntityData[] = [];
    try {
      client = await createClient({ ...config, logger });
      logger.info('Fetching streams...');

      for await (const rawStream of client.fetchStreams()) {
        const streamData = convertStream(rawStream);
        streams.push(streamData);
      }
      logger.info('Done fetching streams.');
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
      streams.map((stream) => createIntegrationEntity({ entityData: stream })),
    );
  },
};

export default step;
