/* eslint-disable @typescript-eslint/camelcase */

import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk/testing';
import { setupDefaultRecording } from '../../../../test';
import step from '../';

let recording: Recording;
beforeEach(() => {
  recording = setupDefaultRecording({
    directory: __dirname,
    name: 'fetch file formats',
  });
});

afterEach(async () => {
  await recording.stop();
});

test('step collects and processes data', async () => {
  const context = createMockStepExecutionContext();
  await step.executionHandler(context);
  expect(context.jobState.collectedRelationships).toEqual([]);
  expect(context.jobState.collectedEntities).toEqual([
    {
      name: 'CSV',
      owner: 'SYSADMIN',
      _class: ['Resource'],
      _type: 'snowflake_file_format',
      _key: 'snowflake-file-format:CSV',
      createdOn: 1586889322507,
      databaseName: 'UTIL_DB',
      displayName: 'CSV',
      schemaName: 'PUBLIC',
      extension: 'CSV',
      comment: 'parse comma-delimited data',
      _rawData: [
        {
          name: 'default',
          rawData: {
            created_on: '2020-04-14 11:35:22.507 -0700',
            name: 'CSV',
            database_name: 'UTIL_DB',
            schema_name: 'PUBLIC',
            type: 'CSV',
            owner: 'SYSADMIN',
            comment: 'parse comma-delimited data',
          },
        },
      ],
    },
    {
      name: 'CSV_DQ',
      owner: 'SYSADMIN',
      _class: ['Resource'],
      _type: 'snowflake_file_format',
      _key: 'snowflake-file-format:CSV_DQ',
      createdOn: 1586889322702,
      databaseName: 'UTIL_DB',
      displayName: 'CSV_DQ',
      schemaName: 'PUBLIC',
      extension: 'CSV',
      comment: 'parse comma-delimited, double-quoted data',
      _rawData: [
        {
          name: 'default',
          rawData: {
            created_on: '2020-04-14 11:35:22.702 -0700',
            name: 'CSV_DQ',
            database_name: 'UTIL_DB',
            schema_name: 'PUBLIC',
            type: 'CSV',
            owner: 'SYSADMIN',
            comment: 'parse comma-delimited, double-quoted data',
          },
        },
      ],
    },
    {
      name: 'JSON',
      owner: 'SYSADMIN',
      _class: ['Resource'],
      _type: 'snowflake_file_format',
      _key: 'snowflake-file-format:JSON',
      createdOn: 1586889324183,
      databaseName: 'UTIL_DB',
      displayName: 'JSON',
      schemaName: 'PUBLIC',
      extension: 'JSON',
      comment: 'parse JSON data',
      _rawData: [
        {
          name: 'default',
          rawData: {
            created_on: '2020-04-14 11:35:24.183 -0700',
            name: 'JSON',
            database_name: 'UTIL_DB',
            schema_name: 'PUBLIC',
            type: 'JSON',
            owner: 'SYSADMIN',
            comment: 'parse JSON data',
          },
        },
      ],
    },
    {
      name: 'PARQUET',
      owner: 'SYSADMIN',
      _class: ['Resource'],
      _type: 'snowflake_file_format',
      _key: 'snowflake-file-format:PARQUET',
      createdOn: 1586889324276,
      databaseName: 'UTIL_DB',
      displayName: 'PARQUET',
      schemaName: 'PUBLIC',
      extension: 'PARQUET',
      comment: 'parse uncompressed Parquet data',
      _rawData: [
        {
          name: 'default',
          rawData: {
            created_on: '2020-04-14 11:35:24.276 -0700',
            name: 'PARQUET',
            database_name: 'UTIL_DB',
            schema_name: 'PUBLIC',
            type: 'PARQUET',
            owner: 'SYSADMIN',
            comment: 'parse uncompressed Parquet data',
          },
        },
      ],
    },
    {
      name: 'PSV',
      owner: 'SYSADMIN',
      _class: ['Resource'],
      _type: 'snowflake_file_format',
      _key: 'snowflake-file-format:PSV',
      createdOn: 1586889323275,
      databaseName: 'UTIL_DB',
      displayName: 'PSV',
      schemaName: 'PUBLIC',
      extension: 'CSV',
      comment: 'parse pipe-delimited data',
      _rawData: [
        {
          name: 'default',
          rawData: {
            created_on: '2020-04-14 11:35:23.275 -0700',
            name: 'PSV',
            database_name: 'UTIL_DB',
            schema_name: 'PUBLIC',
            type: 'CSV',
            owner: 'SYSADMIN',
            comment: 'parse pipe-delimited data',
          },
        },
      ],
    },
    {
      name: 'PSV_DQ',
      owner: 'SYSADMIN',
      _class: ['Resource'],
      _type: 'snowflake_file_format',
      _key: 'snowflake-file-format:PSV_DQ',
      createdOn: 1586889323453,
      databaseName: 'UTIL_DB',
      displayName: 'PSV_DQ',
      schemaName: 'PUBLIC',
      extension: 'CSV',
      comment: 'parse pipe-delimited, double-quoted data',
      _rawData: [
        {
          name: 'default',
          rawData: {
            created_on: '2020-04-14 11:35:23.453 -0700',
            name: 'PSV_DQ',
            database_name: 'UTIL_DB',
            schema_name: 'PUBLIC',
            type: 'CSV',
            owner: 'SYSADMIN',
            comment: 'parse pipe-delimited, double-quoted data',
          },
        },
      ],
    },
    {
      name: 'SINGLE_COLUMN_ROWS',
      owner: 'SYSADMIN',
      _class: ['Resource'],
      _type: 'snowflake_file_format',
      _key: 'snowflake-file-format:SINGLE_COLUMN_ROWS',
      createdOn: 1586889322332,
      databaseName: 'UTIL_DB',
      displayName: 'SINGLE_COLUMN_ROWS',
      schemaName: 'PUBLIC',
      extension: 'CSV',
      comment: 'copy each line into single-column row',
      _rawData: [
        {
          name: 'default',
          rawData: {
            created_on: '2020-04-14 11:35:22.332 -0700',
            name: 'SINGLE_COLUMN_ROWS',
            database_name: 'UTIL_DB',
            schema_name: 'PUBLIC',
            type: 'CSV',
            owner: 'SYSADMIN',
            comment: 'copy each line into single-column row',
          },
        },
      ],
    },
    {
      name: 'SOH',
      owner: 'SYSADMIN',
      _class: ['Resource'],
      _type: 'snowflake_file_format',
      _key: 'snowflake-file-format:SOH',
      createdOn: 1586889323652,
      databaseName: 'UTIL_DB',
      displayName: 'SOH',
      schemaName: 'PUBLIC',
      extension: 'CSV',
      comment: 'parse SOH-delimited (0x01) data',
      _rawData: [
        {
          name: 'default',
          rawData: {
            created_on: '2020-04-14 11:35:23.652 -0700',
            name: 'SOH',
            database_name: 'UTIL_DB',
            schema_name: 'PUBLIC',
            type: 'CSV',
            owner: 'SYSADMIN',
            comment: 'parse SOH-delimited (0x01) data',
          },
        },
      ],
    },
    {
      name: 'SOH_DQ',
      owner: 'SYSADMIN',
      _class: ['Resource'],
      _type: 'snowflake_file_format',
      _key: 'snowflake-file-format:SOH_DQ',
      createdOn: 1586889323830,
      databaseName: 'UTIL_DB',
      displayName: 'SOH_DQ',
      schemaName: 'PUBLIC',
      extension: 'CSV',
      comment: 'parse SOH-delimited (0x01), double-quoted data',
      _rawData: [
        {
          name: 'default',
          rawData: {
            created_on: '2020-04-14 11:35:23.830 -0700',
            name: 'SOH_DQ',
            database_name: 'UTIL_DB',
            schema_name: 'PUBLIC',
            type: 'CSV',
            owner: 'SYSADMIN',
            comment: 'parse SOH-delimited (0x01), double-quoted data',
          },
        },
      ],
    },
    {
      name: 'THORN',
      owner: 'SYSADMIN',
      _class: ['Resource'],
      _type: 'snowflake_file_format',
      _key: 'snowflake-file-format:THORN',
      createdOn: 1586889323991,
      databaseName: 'UTIL_DB',
      displayName: 'THORN',
      schemaName: 'PUBLIC',
      extension: 'CSV',
      comment: 'parse thorn-delimited (0xFE) data',
      _rawData: [
        {
          name: 'default',
          rawData: {
            created_on: '2020-04-14 11:35:23.991 -0700',
            name: 'THORN',
            database_name: 'UTIL_DB',
            schema_name: 'PUBLIC',
            type: 'CSV',
            owner: 'SYSADMIN',
            comment: 'parse thorn-delimited (0xFE) data',
          },
        },
      ],
    },
    {
      name: 'TSV',
      owner: 'SYSADMIN',
      _class: ['Resource'],
      _type: 'snowflake_file_format',
      _key: 'snowflake-file-format:TSV',
      createdOn: 1586889322877,
      databaseName: 'UTIL_DB',
      displayName: 'TSV',
      schemaName: 'PUBLIC',
      extension: 'CSV',
      comment: 'parse tab-delimited data',
      _rawData: [
        {
          name: 'default',
          rawData: {
            created_on: '2020-04-14 11:35:22.877 -0700',
            name: 'TSV',
            database_name: 'UTIL_DB',
            schema_name: 'PUBLIC',
            type: 'CSV',
            owner: 'SYSADMIN',
            comment: 'parse tab-delimited data',
          },
        },
      ],
    },
    {
      name: 'TSV_DQ',
      owner: 'SYSADMIN',
      _class: ['Resource'],
      _type: 'snowflake_file_format',
      _key: 'snowflake-file-format:TSV_DQ',
      createdOn: 1586889323057,
      databaseName: 'UTIL_DB',
      displayName: 'TSV_DQ',
      schemaName: 'PUBLIC',
      extension: 'CSV',
      comment: 'parse tab-delimited, double-quoted data',
      _rawData: [
        {
          name: 'default',
          rawData: {
            created_on: '2020-04-14 11:35:23.057 -0700',
            name: 'TSV_DQ',
            database_name: 'UTIL_DB',
            schema_name: 'PUBLIC',
            type: 'CSV',
            owner: 'SYSADMIN',
            comment: 'parse tab-delimited, double-quoted data',
          },
        },
      ],
    },
  ]);
});
