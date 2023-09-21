jest.useFakeTimers();
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
    name: 'fetch-users',
  });
});

afterEach(async () => {
  await recording.stop();
});

test.skip('fetch-users', async () => {
  const stepConfig = buildStepTestConfigForStep('fetch-users');
  const stepResult = await executeStepWithDependencies(stepConfig);
  expect(stepResult).toMatchStepMetadata(stepConfig);
});
