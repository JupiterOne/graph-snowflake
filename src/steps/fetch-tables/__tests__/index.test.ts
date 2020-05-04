/* eslint-disable @typescript-eslint/camelcase */

import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk/testing';
import { setupDefaultRecording } from '../../../../test';
import schemaEntities from './__fixtures__/schemaEntities.json';

import step from '../';

let recording: Recording;
beforeEach(() => {
  recording = setupDefaultRecording({
    directory: __dirname,
    name: 'fetch tables',
  });
});

afterEach(async () => {
  await recording.stop();
});

test('step collects and processes data', async () => {
  const context = createMockStepExecutionContext({ entities: schemaEntities });
  await step.executionHandler(context);

  const testTable = context.jobState.collectedEntities.find(
    (d) => d.name === 'TEST_TABLE',
  );
  expect(testTable).toEqual({
    name: 'TEST_TABLE',
    owner: 'ACCOUNTADMIN',
    _class: ['DataStore', 'Database'],
    _type: 'snowflake_table',
    _key: 'snowflake-table:COMPUTE_WH:TEST_DB:TEST_SCHEMA:TEST_TABLE',
    createdOn: expect.any(Number),
    itemCount: expect.any(Number),
    displayName: 'TEST_TABLE',
    tableName: 'TEST_TABLE',
    tableSizeBytes: expect.any(Number),
    clusterBy: 'LINEAR(CC_CALL_CENTER_SK)',
    kind: 'TABLE',
    changeTracking: true,
    droppedOn: null,
    classification: 'unknown',
    encrypted: true,
    warehouseName: 'COMPUTE_WH',
    databaseName: 'TEST_DB',
    schemaName: 'TEST_SCHEMA',
    automaticClustering: true,
    retentionTimeInDays: null,
    _rawData: [
      {
        name: 'default',
        rawData: {
          created_on: expect.any(String),
          name: 'TEST_TABLE',
          database_name: 'TEST_DB',
          schema_name: 'TEST_SCHEMA',
          kind: 'TABLE',
          comment: '',
          cluster_by: 'LINEAR(CC_CALL_CENTER_SK)',
          rows: expect.any(Number),
          bytes: expect.any(Number),
          owner: 'ACCOUNTADMIN',
          retention_time: '1',
          automatic_clustering: 'ON',
          change_tracking: 'ON',
        },
      },
    ],
  });

  const testTableToTestSchema = context.jobState.collectedRelationships.find(
    (r) =>
      r._key ===
      'snowflake-schema:TEST_SCHEMA|has|snowflake-table:COMPUTE_WH:TEST_DB:TEST_SCHEMA:TEST_TABLE',
  );
  expect(testTableToTestSchema).toEqual({
    _class: 'HAS',
    _fromEntityKey: 'snowflake-schema:TEST_SCHEMA',
    _key:
      'snowflake-schema:TEST_SCHEMA|has|snowflake-table:COMPUTE_WH:TEST_DB:TEST_SCHEMA:TEST_TABLE',
    _toEntityKey: 'snowflake-table:COMPUTE_WH:TEST_DB:TEST_SCHEMA:TEST_TABLE',
    _type: 'snowflake_schema_has_table',
    displayName: 'HAS',
  });
});
