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
    name: 'fetch regions',
  });
});

afterEach(async () => {
  await recording.stop();
});

test('step collects and processes data', async () => {
  const context = createMockStepExecutionContext();
  await step.executionHandler(context);

  expect(context.jobState.collectedRelationships).toEqual([]);

  // there are a lot of regions, just check that the length is what we
  // expect and that one of them is the expected value.
  expect(context.jobState.collectedEntities).toHaveLength(19);
  expect(context.jobState.collectedEntities).toContainEqual({
    _class: ['Record'],
    _type: 'snowflake_region',
    _key: 'snowflake-region:AWS_US_WEST_2:aws:us-west-2',
    displayName:
      'Snowflake region of AWS_US_WEST_2 on cloud aws region: us-west-2',
    name: 'Snowflake region of AWS_US_WEST_2 on cloud aws region: us-west-2',
    _rawData: [
      {
        name: 'default',
        rawData: {
          snowflake_region: 'AWS_US_WEST_2',
          cloud: 'aws',
          region: 'us-west-2',
        },
      },
    ],
  });
});
