import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  IntegrationEntityData,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk';

import { createClient, Client as SnowflakeClient } from '../../client';
import '../../client';
import { RawSnowflake } from '../../client/types';
import { SnowflakeRegion } from '../../types';

type RawRegion = RawSnowflake['Region'];
interface SnowflakeRegionEntityData extends IntegrationEntityData {
  assign: SnowflakeRegion;
  source: RawRegion;
}

function buildKey(raw: RawRegion): string {
  const { region, snowflake_region: snowflakeRegion, cloud } = raw;
  return `snowflake-region:${snowflakeRegion}:${cloud}:${region}`;
}

function convertRegion(raw: RawRegion): SnowflakeRegionEntityData {
  const { region, snowflake_region: snowflakeRegion, cloud } = raw;
  const displayName = `Snowflake region of ${snowflakeRegion} on cloud ${cloud} region: ${region}`;
  return {
    assign: {
      _class: ['Record'],
      _type: 'snowflake_region',
      _key: buildKey(raw),
      displayName,
      name: displayName,
    },
    source: raw,
  };
}

const step: IntegrationStep = {
  id: 'fetch-regions',
  name: 'Fetch Regions',
  types: ['snowflake_region'],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext) {
    const { config } = instance;
    let client: SnowflakeClient | undefined;
    const regions: SnowflakeRegionEntityData[] = [];
    try {
      client = await createClient({ ...config, logger });
      logger.info('Fetching regions...');

      for await (const rawRegion of client.fetchRegions()) {
        const regionData = convertRegion(rawRegion);
        regions.push(regionData);
      }
      logger.info('Done fetching regions.');
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
      regions.map((region) => createIntegrationEntity({ entityData: region })),
    );
  },
};

export default step;
