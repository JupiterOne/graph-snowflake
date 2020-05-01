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
    name: 'fetch tasks',
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
      name: 'TEST_TASK',
      id: '0193c24a-c511-6e64-0000-000000000001',
      owner: 'ACCOUNTADMIN',
      _class: ['Task'],
      _type: 'snowflake_task',
      _key: 'snowflake-task:TEST_TASK',
      createdOn: 1587644815184,
      displayName: 'TEST_TASK',
      definition:
        'SELECT * FROM "SNOWFLAKE_SAMPLE_DATA"."TPCDS_SF100TCL"."CALL_CENTER"',
      condition: null,
      comment: '',
      schedule: null,
      schemaName: 'PUBLIC',
      databaseName: 'UTIL_DB',
      warehouseName: 'COMPUTE_WH',
      _rawData: [
        {
          name: 'default',
          rawData: {
            created_on: '2020-04-23 05:26:55.184 -0700',
            name: 'TEST_TASK',
            id: '0193c24a-c511-6e64-0000-000000000001',
            database_name: 'UTIL_DB',
            schema_name: 'PUBLIC',
            owner: 'ACCOUNTADMIN',
            comment: '',
            warehouse: 'COMPUTE_WH',
            schedule: null,
            predecessors: null,
            state: 'suspended',
            definition:
              'SELECT * FROM "SNOWFLAKE_SAMPLE_DATA"."TPCDS_SF100TCL"."CALL_CENTER"',
            condition: null,
          },
        },
      ],
    },
  ]);
});
