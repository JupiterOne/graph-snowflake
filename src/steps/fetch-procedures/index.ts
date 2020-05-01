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
import { SnowflakeProcedure } from '../../types';

type RawProcedure = RawSnowflake['Procedure'];
interface SnowflakeProcedureEntityData extends IntegrationEntityData {
  assign: SnowflakeProcedure;
  source: RawProcedure;
}

function buildKey(raw: RawProcedure): string {
  const { name } = raw;
  return `snowflake-procedure:${name}`;
}

function convertProcedure(raw: RawProcedure): SnowflakeProcedureEntityData {
  const { created_on: createdOnStr, name } = raw;

  return {
    assign: {
      _class: ['Function'],
      _type: 'snowflake_procedure',
      _key: buildKey(raw),
      createdOn: getTime(createdOnStr),
      displayName: name,
      name,
    },
    source: raw,
  };
}

const step: IntegrationStep = {
  id: 'fetch-procedures',
  name: 'Fetch Procedures',
  types: ['snowflake_procedure'],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext) {
    const { config } = instance;
    let client: SnowflakeClient | undefined;
    const procedures: SnowflakeProcedureEntityData[] = [];
    try {
      client = await createClient({ ...config, logger });
      logger.info('Fetching procedures...');

      for await (const rawProcedure of client.fetchProcedures()) {
        const procedureData = convertProcedure(rawProcedure);
        procedures.push(procedureData);
      }
      logger.info('Done fetching procedures.');
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
      procedures.map((procedure) =>
        createIntegrationEntity({ entityData: procedure }),
      ),
    );
  },
};

export default step;
