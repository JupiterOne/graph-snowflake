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
    name: 'fetch streams',
  });
});

afterEach(async () => {
  await recording.stop();
});

test('step collects and processes data', async () => {
  const context = createMockStepExecutionContext();
  await step.executionHandler(context);
  console.log(JSON.stringify(context.jobState.collectedEntities, null, 2));

  expect(context.jobState.collectedRelationships).toEqual([]);
  expect(context.jobState.collectedEntities).toEqual([
    {
      name: 'TEST_STREAM',
      owner: 'ACCOUNTADMIN',
      _class: ['Queue'],
      _type: 'snowflake_stream',
      _key: 'snowflake-stream:TEST_STREAM',
      createdOn: 1587746334039,
      displayName: 'TEST_STREAM',
      _rawData: [
        {
          name: 'default',
          rawData: {
            created_on: '2020-04-24 09:38:54.039 -0700',
            name: 'TEST_STREAM',
            database_name: 'DEMO_DB',
            schema_name: 'PUBLIC',
            owner: 'ACCOUNTADMIN',
            comment: '',
            table_name: 'DEMO_DB.PUBLIC.TEST_TABLE',
            type: 'DELTA',
            stale: 'false',
            mode: 'DEFAULT',
          },
        },
      ],
    },
  ]);
});
