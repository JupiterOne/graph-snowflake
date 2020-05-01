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
    name: 'fetch shares',
  });
});

afterEach(async () => {
  await recording.stop();
});

test('step collects and processes data', async () => {
  const context = createMockStepExecutionContext();
  await step.executionHandler(context);

  expect(context.jobState.collectedRelationships).toEqual([]);

  // sample data share and account usage share plus the
  // created test share should equal 3 total.
  expect(context.jobState.collectedEntities).toHaveLength(3);
  expect(context.jobState.collectedEntities).toContainEqual({
    name: 'UPA06479.TEST',
    owner: 'ACCOUNTADMIN',
    _class: ['AccessPolicy'],
    _type: 'snowflake_share',
    _key: 'snowflake-share:UPA06479.TEST',
    displayName: 'UPA06479.TEST',
    createdOn: 1587570603128,
    databaseName: '',
    kind: 'OUTBOUND',
    to: '',
    comment: '',
    _rawData: [
      {
        name: 'default',
        rawData: {
          created_on: '2020-04-22 08:50:03.128 -0700',
          kind: 'OUTBOUND',
          name: 'UPA06479.TEST',
          database_name: '',
          to: '',
          owner: 'ACCOUNTADMIN',
          comment: '',
        },
      },
    ],
  });
});
