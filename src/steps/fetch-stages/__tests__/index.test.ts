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
    name: 'fetch stages',
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
      name: 'TEST_STAGE',
      owner: 'ACCOUNTADMIN',
      _class: ['DataStore'],
      _type: 'snowflake_stage',
      _key: 'snowflake-stage:TEST_STAGE',
      createdOn: 1587740446623,
      displayName: 'TEST_STAGE',
      encrypted: true,
      classification: 'unknown',
      _rawData: [
        {
          name: 'default',
          rawData: {
            created_on: '2020-04-24 08:00:46.623 -0700',
            name: 'TEST_STAGE',
            database_name: 'UTIL_DB',
            schema_name: 'PUBLIC',
            url: '',
            has_credentials: 'N',
            has_encryption_key: 'N',
            owner: 'ACCOUNTADMIN',
            comment: '',
            region: null,
            type: 'INTERNAL',
            cloud: null,
            notification_channel: null,
            storage_integration: null,
          },
        },
      ],
    },
  ]);
});
