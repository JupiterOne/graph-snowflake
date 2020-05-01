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
    name: 'fetch users',
  });
});

afterEach(async () => {
  await recording.stop();
});

test('step collects and processes data', async () => {
  const context = createMockStepExecutionContext();
  await step.executionHandler(context);
  expect(context.jobState.collectedRelationships).toEqual([]);

  // there is a built in user and the one created for the
  // demo account. Should be two, check for the built in user
  // because that should be stable enough.
  expect(context.jobState.collectedEntities).toHaveLength(2);
  expect(context.jobState.collectedEntities).toContainEqual({
    name: 'SNOWFLAKE',
    owner: '',
    _class: ['User'],
    _type: 'snowflake_user',
    _key: 'snowflake-user:SNOWFLAKE',
    displayName: 'SNOWFLAKE',
    firstName: '',
    lastName: '',
    loginName: 'SNOWFLAKE',
    username: 'SNOWFLAKE',
    hasRsaPublicKey: false,
    createdOn: expect.any(Number), // 1586889313021,
    disabled: false,
    hasPassword: true,
    mustChangePassword: false,
    lastLogin: expect.any(Number), // 1586889321574,
    comment: '',
    snowflakeLock: false,
    lockedUntilTime: null,
    expiresAtTime: expect.any(Number), // 1586975713454,
    defaultWarehouse: '',
    defaultNamespace: '',
    defaultRole: '',
    fullName: ' ',
    externalAuthDuoEnabled: false,
    externalAuthUid: '',
    _rawData: [
      {
        name: 'default',
        rawData: {
          name: 'SNOWFLAKE',
          created_on: expect.any(String), // '2020-04-14 11:35:13.021 -0700',
          login_name: 'SNOWFLAKE',
          display_name: 'SNOWFLAKE',
          first_name: '',
          last_name: '',
          email: '',
          mins_to_unlock: '',
          days_to_expiry: expect.any(String), // '-7.101331018518518',
          comment: '',
          disabled: 'false',
          must_change_password: 'false',
          snowflake_lock: 'false',
          default_warehouse: '',
          default_namespace: '',
          default_role: '',
          ext_authn_duo: 'false',
          ext_authn_uid: '',
          mins_to_bypass_mfa: '',
          owner: '',
          last_success_login: expect.any(String), // '2020-04-14 11:35:21.574 -0700',
          expires_at_time: expect.any(String), // '2020-04-15 11:35:13.454 -0700',
          locked_until_time: 'NULL',
          has_password: 'true',
          has_rsa_public_key: 'false',
        },
      },
    ],
  });
});
