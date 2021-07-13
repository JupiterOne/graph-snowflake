import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { setupDefaultRecording } from '../../../../test';
import step from '../';

import warehouseEntities from './__fixtures__/warehouseEntities.json';
import { SnowflakeIntegrationConfig } from '../../../types';

const instanceConfig: SnowflakeIntegrationConfig = {
  account: 'snowflake-account',
  password: 'snowflake-password',
  role: 'snowflake-role',
  username: 'snowflake-username',
};

let recording: Recording;
beforeEach(() => {
  recording = setupDefaultRecording({
    directory: __dirname,
    name: 'fetch databases',
  });
});

afterEach(async () => {
  await recording.stop();
});

test('step collects and processes data', async () => {
  const context = createMockStepExecutionContext({
    entities: warehouseEntities,
    instanceConfig,
  });
  await step.executionHandler(context);

  // `toEqual` displays diffs better than `toContainEqual`.
  const testDbEntity = context.jobState.collectedEntities.find(
    (e) => e.name === 'TEST_DB',
  );
  expect(testDbEntity).toEqual({
    _class: ['DataStore', 'Database'],
    _key: 'snowflake-database:COMPUTE_WH:TEST_DB',
    _rawData: expect.anything(),
    _type: 'snowflake_database',
    classification: 'unknown',
    comment: 'test_comment',
    createdOn: expect.any(Number), // 1587763619822,
    displayName: 'TEST_DB',
    encrypted: true,
    name: 'TEST_DB',
    origin: '',
    owner: 'ACCOUNTADMIN',
    retentionTimeInDays: null,
    warehouseName: 'COMPUTE_WH',
  });

  const computWHToTestDBRel = context.jobState.collectedRelationships.find(
    (r) =>
      r._key ===
      'snowflake-warehouse:COMPUTE_WH|has|snowflake-database:COMPUTE_WH:TEST_DB',
  );
  expect(computWHToTestDBRel).toEqual({
    _class: 'HAS',
    _type: expect.any(String),
    _key:
      'snowflake-warehouse:COMPUTE_WH|has|snowflake-database:COMPUTE_WH:TEST_DB',
    _fromEntityKey: 'snowflake-warehouse:COMPUTE_WH',
    _toEntityKey: 'snowflake-database:COMPUTE_WH:TEST_DB',
    displayName: 'HAS',
  });
});
