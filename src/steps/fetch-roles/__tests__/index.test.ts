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
    name: 'fetch roles',
  });
});

afterEach(async () => {
  await recording.stop();
});

test('step collects and processes data', async () => {
  const context = createMockStepExecutionContext();
  await step.executionHandler(context);
  expect(context.jobState.collectedRelationships).toEqual([]);
  // with the built in roles and the one from the setup sample data
  // we should have 6 roles.
  expect(context.jobState.collectedEntities).toHaveLength(6);
  expect(context.jobState.collectedEntities).toContainEqual({
    name: 'JUPITERONE',
    owner: 'ACCOUNTADMIN',
    _class: ['AccessRole'],
    _type: 'snowflake_role',
    _key: 'snowflake-role:JUPITERONE',
    displayName: 'JUPITERONE',
    createdOn: 1587745600810,
    comment: 'test_comment',
    numRolesGranted: 0,
    numAssignedUsers: 0,
    numGrantedToRoles: 0,
    isInheritedRole: false,
    _rawData: [
      {
        name: 'default',
        rawData: {
          created_on: '2020-04-24 09:26:40.810 -0700',
          name: 'JUPITERONE',
          is_default: 'N',
          is_current: 'N',
          is_inherited: 'N',
          assigned_to_users: 0,
          granted_to_roles: 0,
          granted_roles: 0,
          owner: 'ACCOUNTADMIN',
          comment: 'test_comment',
        },
      },
    ],
  });
});
