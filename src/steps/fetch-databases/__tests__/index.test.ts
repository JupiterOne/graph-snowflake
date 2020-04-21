/* eslint-disable @typescript-eslint/camelcase */

import {
  createMockStepExecutionContext,
  Recording,
  setupRecording,
} from '@jupiterone/integration-sdk/testing';
import { redactPollyEntry } from '../../../../test';
import step from '../';

let recording: Recording;
beforeEach(() => {
  recording = setupRecording({
    directory: __dirname,
    redactedRequestHeaders: ['authorization'],
    mutateEntry: redactPollyEntry,
    name: 'fetch databases',
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
      name: 'DEMO_DB',
      owner: 'SYSADMIN',
      _class: ['DataStore', 'Database'],
      _type: 'snowflake_database',
      _key: 'snowflake-database:DEMO_DB',
      displayName: 'DEMO_DB',
      createdOn: 1586889324927,
      comment: 'demo database',
      origin: '',
      classification: 'unknown',
      encrypted: true,
      retentionTimeInDays: null,
      _rawData: [
        {
          name: 'default',
          rawData: {
            created_on: '2020-04-14 11:35:24.927 -0700',
            name: 'DEMO_DB',
            is_default: 'N',
            is_current: 'N',
            origin: '',
            owner: 'SYSADMIN',
            comment: 'demo database',
            options: '',
            retention_time: '1',
          },
        },
      ],
    },
    {
      name: 'SNOWFLAKE_SAMPLE_DATA',
      owner: 'ACCOUNTADMIN',
      _class: ['DataStore', 'Database'],
      _type: 'snowflake_database',
      _key: 'snowflake-database:SNOWFLAKE_SAMPLE_DATA',
      displayName: 'SNOWFLAKE_SAMPLE_DATA',
      createdOn: 1586889325626,
      comment: 'TPC-H, OpenWeatherMap, etc',
      origin: 'SFC_SAMPLES.SAMPLE_DATA',
      classification: 'unknown',
      encrypted: true,
      retentionTimeInDays: null,
      _rawData: [
        {
          name: 'default',
          rawData: {
            created_on: '2020-04-14 11:35:25.626 -0700',
            name: 'SNOWFLAKE_SAMPLE_DATA',
            is_default: 'N',
            is_current: 'N',
            origin: 'SFC_SAMPLES.SAMPLE_DATA',
            owner: 'ACCOUNTADMIN',
            comment: 'TPC-H, OpenWeatherMap, etc',
            options: '',
            retention_time: '1',
          },
        },
      ],
    },
    {
      name: 'UTIL_DB',
      owner: 'SYSADMIN',
      _class: ['DataStore', 'Database'],
      _type: 'snowflake_database',
      _key: 'snowflake-database:UTIL_DB',
      displayName: 'UTIL_DB',
      createdOn: 1586889321774,
      comment: 'utility database',
      origin: '',
      classification: 'unknown',
      encrypted: true,
      retentionTimeInDays: null,
      _rawData: [
        {
          name: 'default',
          rawData: {
            created_on: '2020-04-14 11:35:21.774 -0700',
            name: 'UTIL_DB',
            is_default: 'N',
            is_current: 'N',
            origin: '',
            owner: 'SYSADMIN',
            comment: 'utility database',
            options: '',
            retention_time: '1',
          },
        },
      ],
    },
  ]);
});
