/* eslint-disable @typescript-eslint/camelcase */
import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk/testing';
import { setupDefaultRecording } from '../../../../test';

import step from '../';
import accountEntities from './__fixtures__/accountEntities.json';

let recording: Recording;
beforeEach(() => {
  recording = setupDefaultRecording({
    directory: __dirname,
    name: 'fetch account privilege grants',
  });
});

afterEach(async () => {
  await recording.stop();
});

test('step collects and processes data', async () => {
  const context = createMockStepExecutionContext({ entities: accountEntities });
  await step.executionHandler(context);
  console.log(JSON.stringify(context.jobState.collectedEntities, null, 2));
  console.log(
    'Granted on: ',
    context.jobState.collectedEntities.map((e) => e.grantedOn),
  );
  console.log(
    'Granted to: ',
    context.jobState.collectedEntities.map((e) => e.grantedTo),
  );
  console.log(
    'Grantee name: ',
    context.jobState.collectedEntities.map((e) => e.granteeName),
  );
  console.log(
    'Granted by: ',
    context.jobState.collectedEntities.map((e) => e.grantedBy),
  );
  console.log(JSON.stringify(context.jobState.collectedRelationships, null, 2));
  expect(context.jobState.collectedRelationships).toEqual([]);
  // expect(context.jobState.collectedEntities).toEqual([]);
});
