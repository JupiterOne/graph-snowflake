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
    name: 'fetch integrations',
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
      name: 'TEST_INTEGRATION',
      _class: ['Resource'],
      _type: 'snowflake_integration',
      _key: 'snowflake-integration:TEST_INTEGRATION',
      createdOn: 1587738080849,
      displayName: 'TEST_INTEGRATION',
      _rawData: [
        {
          name: 'default',
          rawData: {
            name: 'TEST_INTEGRATION',
            type: 'EXTERNAL_OAUTH - CUSTOM',
            category: 'SECURITY',
            enabled: 'false',
            created_on: '2020-04-24 07:21:20.849 -0700',
          },
        },
      ],
    },
  ]);
});
