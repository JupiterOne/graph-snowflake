jest.useFakeTimers();
jest.setTimeout(30_000);

import {
  executeStepWithDependencies,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { buildStepTestConfigForStep } from '../../../../test/config';
import { setupProjectRecording } from '../../../../test/recording';

let recording: Recording;
beforeEach(() => {
  recording = setupProjectRecording({
    directory: __dirname,
    name: 'fetch-databases',
  });
});

afterEach(async () => {
  await recording.stop();
});

test.skip('fetch-databases', async () => {
  const stepConfig = buildStepTestConfigForStep('fetch-databases');
  const stepResult = await executeStepWithDependencies(stepConfig);
  expect(stepResult).toMatchStepMetadata(stepConfig);
});
