/* eslint-disable @typescript-eslint/camelcase */

import { createMockStepExecutionContext } from '@jupiterone/integration-sdk/testing';

import step from '..';

test('creates an account', async () => {
  const context = createMockStepExecutionContext();
  await step.executionHandler(context);
  expect(context.jobState.collectedRelationships).toEqual([]);
  expect(context.jobState.collectedEntities).toEqual([
    {
      _class: ['Account'],
      _type: 'snowflake_account',
      _key: 'snowflake-account:upa06479.us-east-1',
      name: 'upa06479.us-east-1',
      _rawData: [],
      displayName: 'upa06479.us-east-1',
    },
  ]);
});
