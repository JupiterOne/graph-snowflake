jest.useFakeTimers();
jest.setTimeout(300000);
import {
  executeStepWithDependencies,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { buildStepTestConfigForStep } from '../../../../test/config';
import { setupProjectRecording } from '../../../../test/recording';

describe.skip('fetch-schemas', () => {
  let recording: Recording;
  beforeEach(() => {
    recording = setupProjectRecording({
      directory: __dirname,
      name: 'fetch-schemas',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  it('should succeed', async () => {
    const stepConfig = buildStepTestConfigForStep('fetch-schemas');
    const stepResult = await executeStepWithDependencies(stepConfig);
    expect(stepResult).toMatchStepMetadata(stepConfig);
  });
});
