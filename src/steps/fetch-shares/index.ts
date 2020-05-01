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
import { SnowflakeShare } from '../../types';

type RawShare = RawSnowflake['Share'];
interface SnowflakeShareEntityData extends IntegrationEntityData {
  assign: SnowflakeShare;
  source: RawShare;
}

// DO NOT CHANGE THIS FUNCTION UNLESS YOU KNOW WHAT YOU ARE DOING.
function buildKey(rawShare: RawShare): string {
  return `snowflake-share:${rawShare.name}`;
}

function convertShare(rawShare: RawShare): SnowflakeShareEntityData {
  const {
    created_on: createdOnStr,
    name,
    kind,
    owner,
    to,
    comment,
    database_name: databaseName,
  } = rawShare;
  return {
    assign: {
      _class: ['AccessPolicy'],
      _type: 'snowflake_share',
      _key: buildKey(rawShare),
      displayName: name,
      name,
      createdOn: getTime(createdOnStr),
      databaseName,
      kind,
      owner,
      to,
      comment,
    },
    source: rawShare,
  };
}

const step: IntegrationStep = {
  id: 'fetch-shares',
  name: 'Fetch Shares',
  types: ['snowflake_share'],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext) {
    const { config } = instance;
    let client: SnowflakeClient | undefined;
    const shares: SnowflakeShareEntityData[] = [];
    try {
      client = await createClient({ ...config, logger });
      logger.info('Fetching shares...');

      for await (const rawShare of client.fetchShares()) {
        const snowflakeShareData = convertShare(rawShare);
        shares.push(snowflakeShareData);
      }
      logger.info('Done fetching shares.');
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
      shares.map((share) => createIntegrationEntity({ entityData: share })),
    );
  },
};

export default step;
