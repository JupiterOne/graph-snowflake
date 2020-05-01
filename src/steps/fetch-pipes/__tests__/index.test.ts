/* eslint-disable @typescript-eslint/camelcase */

import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk/testing';
import { setupDefaultRecording } from '../../../../test';

import step from '../';
import databaseEntities from './__fixtures__/databaseEntities.json';
let recording: Recording;
beforeEach(() => {
  recording = setupDefaultRecording({
    directory: __dirname,
    name: 'fetch pipes',
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
  expect(context.jobState.collectedRelationships).toEqual([]);
  expect(context.jobState.collectedEntities).toEqual([
    {
      name: 'TEST_PIPE',
      owner: 'ACCOUNTADMIN',
      _class: ['Queue'],
      _type: 'snowflake_pipe',
      _key: 'snowflake-pipe:TEST_PIPE',
      createdOn: 1587740631416,
      displayName: 'TEST_PIPE',
      _rawData: [
        {
          name: 'default',
          rawData: {
            created_on: '2020-04-24 08:03:51.416 -0700',
            name: 'TEST_PIPE',
            database_name: 'UTIL_DB',
            schema_name: 'PUBLIC',
            definition:
              'copy into "UTIL_DB"."PUBLIC"."TEST_TABLE" from @test_stage',
            owner: 'ACCOUNTADMIN',
            notification_channel: null,
            comment: '',
          },
        },
      ],
    },
  ]);
});
