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
    name: 'fetch warehouses',
  });
});

afterEach(async () => {
  await recording.stop();
});

test('step collects and processes data', async () => {
  const context = createMockStepExecutionContext();
  await step.executionHandler(context);
  expect(context.jobState.collectedRelationships).toEqual([]);
  expect(context.jobState.collectedEntities).toEqual([
    {
      name: 'COMPUTE_WH',
      owner: 'SYSADMIN',
      _class: ['DataStore', 'Database'],
      _type: 'snowflake_warehouse',
      _key: 'snowflake-warehouse:COMPUTE_WH',
      createdOn: 1586889626796,
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
            running: 0,
            queued: 0,
            is_default: 'Y',
            is_current: 'Y',
            auto_suspend: 600,
            auto_resume: 'true',
            available: '',
            provisioning: '',
            quiescing: '',
            other: '',
            created_on: '2020-04-14 11:40:26.796 -0700',
            resumed_on: '2020-04-22 12:14:44.195 -0700',
            updated_on: '2020-04-22 12:14:44.195 -0700',
            owner: 'SYSADMIN',
            comment: '',
            resource_monitor: 'null',
            actives: 0,
            pendings: 0,
            failed: 0,
            suspended: 1,
            uuid: '389448452',
          },
        },
      ],
    },
  ]);
});
