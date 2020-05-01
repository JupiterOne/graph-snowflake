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
import { SnowflakeFileFormat } from '../../types';

type RawFileFormat = RawSnowflake['FileFormat'];
interface SnowflakeFileFormatEntityData extends IntegrationEntityData {
  assign: SnowflakeFileFormat;
  source: RawFileFormat;
}

function convertFileFormat(
  rawFileFormat: RawFileFormat,
): SnowflakeFileFormatEntityData {
  const {
    database_name: databaseName,
    name,
    schema_name: schemaName,
    type,
    owner,
    comment,
    created_on: createdOnStr,
  } = rawFileFormat;

  return {
    assign: {
      _class: ['Resource'],
      _type: 'snowflake_file_format',
      _key: `snowflake-file-format:${name}`,
      createdOn: getTime(createdOnStr),
      databaseName,
      displayName: name,
      schemaName,
      extension: type,
      owner,
      comment,
    },
    source: rawFileFormat,
  };
}

const step: IntegrationStep = {
  id: 'fetch-file-formats',
  name: 'Fetch File Formats',
  types: ['snowflake_file_format'],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext) {
    const { config } = instance;
    let client: SnowflakeClient | undefined;
    const fileFormats: SnowflakeFileFormatEntityData[] = [];
    try {
      client = await createClient({ ...config, logger });
      logger.info('Fetching file formats...');

      for await (const rawFileFormat of client.fetchFileFormats()) {
        const snowflakeFileFormat = convertFileFormat(rawFileFormat);
        fileFormats.push(snowflakeFileFormat);
      }
      logger.info('Done fetching file formats.');
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
      fileFormats.map((fileFormat) =>
        createIntegrationEntity({ entityData: fileFormat }),
      ),
    );
  },
};

export default step;
