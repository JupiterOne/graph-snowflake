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
    name: 'fetch global grants',
  });
});

afterEach(async () => {
  await recording.stop();
});

test('step collects and processes data', async () => {
  const context = createMockStepExecutionContext();
  await step.executionHandler(context);
  expect(context.jobState.collectedRelationships).toEqual([]);
  // not sure how to abstract this one since it targets a specific user,
  // and it doesnt seem like we can create new users in test accounts,
  // so just add matchers to the specific parts.
  expect(context.jobState.collectedEntities).toContainEqual({
    _class: ['AccessPolicy'],
    _key: expect.stringContaining('snowflake-grant:global::'), // 'snowflake-grant:global::ACCOUNTADMIN:USER:AUSTINRAUSCH:',
    _rawData: [
      {
        name: 'default',
        rawData: {
          created_on: expect.any(String), // '2020-04-14 11:35:13.000 -0700',
          granted_by: '',
          granted_to: 'USER',
          grantee_name: expect.any(String), // 'AUSTINRAUSCH',
          role: 'ACCOUNTADMIN',
        },
      },
    ],
    _type: 'snowflake_grant',
    createdOn: 1586889313000,
    displayName: expect.stringContaining('Grant USER'), // 'Grant USER AUSTINRAUSCH role ACCOUNTADMIN, granted by ',
    grantedBy: '',
    grantedTo: 'USER',
    granteeName: expect.any(String), // 'AUSTINRAUSCH',
    name: expect.stringContaining('Grant USER'), // 'Grant USER AUSTINRAUSCH role ACCOUNTADMIN, granted by ',
  });
});
