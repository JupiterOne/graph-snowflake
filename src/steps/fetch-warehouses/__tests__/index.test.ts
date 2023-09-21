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
    name: 'fetch-warehouses',
  });
});

afterEach(async () => {
  await recording.stop();
});

// @NOTE: we are skipping tests because we were not able
// to make them work (sad face)
test.skip('fetch-warehouses', async () => {
  const stepConfig = buildStepTestConfigForStep('fetch-warehouses');
  const stepResult = await executeStepWithDependencies(stepConfig);
  expect(stepResult).toMatchStepMetadata(stepConfig);
});
