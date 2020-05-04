/* eslint-disable @typescript-eslint/camelcase */

import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk/testing';
import { setupDefaultRecording } from '../../../../test';
import databaseEntities from './__fixtures__/databaseEntities.json';
import step from '../';

let recording: Recording;
beforeEach(() => {
  recording = setupDefaultRecording({
    directory: __dirname,
    name: 'fetch schemas',
  });
});

afterEach(async () => {
  await recording.stop();
});

test('step collects and processes data', async () => {
  const context = createMockStepExecutionContext({
    entities: databaseEntities,
  });
  await step.executionHandler(context);

  const testSchema = context.jobState.collectedEntities.find(
    (s) => s.name === 'TEST_SCHEMA',
  );
  expect(testSchema).toEqual({
    name: 'TEST_SCHEMA',
    owner: 'ACCOUNTADMIN',
    _class: ['DataStore', 'Database'],
    _type: 'snowflake_schema',
    _key: 'snowflake-schema:COMPUTE_WH:TEST_DB:TEST_SCHEMA',
    createdOn: expect.any(Number),
    warehouseName: 'COMPUTE_WH',
    databaseName: 'TEST_DB',
    classification: 'unknown',
    encrypted: true,
    displayName: 'TEST_SCHEMA',
    _rawData: [
      {
        name: 'default',
        rawData: {
          created_on: expect.any(String),
          name: 'TEST_SCHEMA',
          is_default: 'N',
          is_current: 'N',
          database_name: 'TEST_DB',
          owner: 'ACCOUNTADMIN',
          comment: 'test-schema',
          options: '',
          retention_time: '1',
        },
      },
    ],
  });
  const testDbToSchemaRel = context.jobState.collectedRelationships.find(
    (r) =>
      r._key ===
      'snowflake-database:TEST_DB|has|snowflake-schema:COMPUTE_WH:TEST_DB:TEST_SCHEMA',
  );
  expect(testDbToSchemaRel).toEqual({
    _key:
      'snowflake-database:TEST_DB|has|snowflake-schema:COMPUTE_WH:TEST_DB:TEST_SCHEMA',
    _type: 'snowflake_database_has_schema',
    _class: 'HAS',
    _fromEntityKey: 'snowflake-database:TEST_DB',
    _toEntityKey: 'snowflake-schema:COMPUTE_WH:TEST_DB:TEST_SCHEMA',
    displayName: 'HAS',
  });
});
