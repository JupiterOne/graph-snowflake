import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { setupDefaultRecording } from '../../../../test';

import step from '../';
import { SnowflakeIntegrationConfig } from '../../../types';

let recording: Recording;
beforeEach(() => {
  recording = setupDefaultRecording({
    directory: __dirname,
    name: 'fetch warehouses',
  });
});

afterEach(async () => {
  await recording.stop();
});

const instanceConfig: SnowflakeIntegrationConfig = {
  account: 'snowflake-account',
  password: 'snowflake-password',
  role: 'snowflake-role',
  username: 'snowflake-username',
};

test('step collects and processes data', async () => {
  const context = createMockStepExecutionContext({ instanceConfig });
  await step.executionHandler(context);
  expect(context.jobState.collectedRelationships).toEqual([]);
  expect(context.jobState.collectedEntities).toEqual([
    {
      name: 'COMPUTE_WH',
      owner: 'SYSADMIN',
      _class: ['DataStore', 'Database'],
      _type: 'snowflake_warehouse',
      _key: 'snowflake-warehouse:COMPUTE_WH',
      createdOn: expect.any(Number), // 1586889626796,
      classification: 'unknown',
      encrypted: true,
      displayName: 'COMPUTE_WH',
      _rawData: [
        {
          name: 'default',
          rawData: {
            name: 'COMPUTE_WH',
            state: 'SUSPENDED',
            type: 'STANDARD',
            size: 'X-Small',
            running: expect.any(Number),
            queued: expect.any(Number),
            is_default: expect.stringMatching(/Y|N/),
            is_current: expect.stringMatching(/Y|N/),
            auto_suspend: expect.any(Number),
            auto_resume: expect.stringMatching(/true|false/),
            available: '',
            provisioning: '',
            quiescing: '',
            other: '',
            created_on: expect.any(String),
            resumed_on: expect.any(String),
            updated_on: expect.any(String),
            owner: 'SYSADMIN',
            comment: '',
            resource_monitor: 'null',
            actives: expect.any(Number),
            pendings: expect.any(Number),
            failed: expect.any(Number),
            suspended: expect.any(Number),
            uuid: expect.any(String),
          },
        },
      ],
    },
  ]);
});
