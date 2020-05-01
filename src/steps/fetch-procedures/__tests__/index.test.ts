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
    name: 'fetch procedures',
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
      name: 'TEST_PROCEDURE',
      description: 'test_comment',
      _class: ['Function'],
      _type: 'snowflake_procedure',
      _key: 'snowflake-procedure:TEST_PROCEDURE',
      createdOn: 1587743626120,
      displayName: 'TEST_PROCEDURE',
      _rawData: [
        {
          name: 'default',
          rawData: {
            created_on: '2020-04-24 08:53:46.120 -0700',
            name: 'TEST_PROCEDURE',
            schema_name: 'PUBLIC',
            is_builtin: 'N',
            is_aggregate: 'N',
            is_ansi: 'N',
            min_num_arguments: 0,
            max_num_arguments: 0,
            arguments: 'TEST_PROCEDURE() RETURN FLOAT',
            description: 'test_comment',
            catalog_name: 'DEMO_DB',
            is_table_function: 'N',
            valid_for_clustering: 'N',
            is_secure: 'N',
          },
        },
      ],
    },
  ]);
});
