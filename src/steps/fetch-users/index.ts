import {
  IntegrationStep,
  IntegrationEntityData,
  createIntegrationEntity,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';
import { SnowflakeUser, SnowflakeIntegrationConfig } from '../../types';
import { createClient, Client as SnowflakeClient } from '../../client';
import '../../client';
import { RawSnowflake } from '../../client/types';

type RawUser = RawSnowflake['User'];
interface SnowflakeUserEntityData extends IntegrationEntityData {
  assign: SnowflakeUser;
  source: RawUser;
}

export function getUserKey(userName: string): string {
  return `snowflake-user:${userName}`;
}

function convertUser(rawUser: RawUser): SnowflakeUserEntityData {
  const {
    name,
    created_on: createdOnStr,
    login_name: loginName,
    display_name: displayName,
    first_name: firstName,
    last_name: lastName,
    email: rawEmail,
    mins_to_unlock: minsToUnlockStr,
    comment,
    disabled,
    must_change_password: mustChangePasswordStr,
    snowflake_lock: snowflakeLockStr,
    default_namespace: defaultNamespace,
    default_warehouse: defaultWarehouse,
    default_role: defaultRole,
    owner,
    last_success_login: lastSuccessLoginStr,
    expires_at_time: expiresAtTimeStr,
    locked_until_time: lockUntilTimeStr,
    has_password: hasPasswordStr,
    has_rsa_public_key: hasRsaPublicKeyStr,
    ext_authn_duo: extAuthnDuoStr,
    ext_authn_uid: extAuthnUid,
  } = rawUser;

  // email is required to be a non empty
  // string by the datamodel.
  let email: string | undefined;
  if (rawEmail.length !== 0) {
    email = rawEmail;
  }

  return {
    assign: {
      _class: ['User'],
      _type: 'snowflake_user',
      _key: getUserKey(name),
      displayName,
      firstName,
      lastName,
      loginName,
      name,
      username: name,
      email,
      hasRsaPublicKey: hasRsaPublicKeyStr === 'true',
      createdOn: parseTimePropertyValue(createdOnStr) as number,
      disabled: disabled === 'true',
      active: disabled !== 'true',
      hasPassword: hasPasswordStr === 'true',
      mustChangePassword: mustChangePasswordStr === 'true',
      lastLogin: parseTimePropertyValue(lastSuccessLoginStr) as number,
      comment,
      owner,
      snowflakeLock: snowflakeLockStr === 'true',
      minsToUnlock: parseTimePropertyValue(minsToUnlockStr) as number,
      lockedUntilTime:
        lockUntilTimeStr !== 'NULL'
          ? parseTimePropertyValue(lockUntilTimeStr)
          : null,
      expiresAtTime: parseTimePropertyValue(expiresAtTimeStr) as number,
      defaultWarehouse,
      defaultNamespace,
      defaultRole,
      fullName: `${firstName} ${lastName}`,
      externalAuthDuoEnabled: extAuthnDuoStr === 'true',
      externalAuthUid: extAuthnUid,
    },
    source: rawUser,
  };
}

const step: IntegrationStep<SnowflakeIntegrationConfig> = {
  id: 'fetch-users',
  name: 'Fetch Users',
  entities: [
    {
      resourceName: 'User',
      _type: 'snowflake_user',
      _class: ['User'],
    },
  ],
  relationships: [],
  async executionHandler({ logger, jobState, instance }) {
    const { config } = instance;
    let client: SnowflakeClient | undefined;
    const users: SnowflakeUserEntityData[] = [];
    try {
      client = await createClient({ ...config, logger });
      logger.info('Fetching users...');

      for await (const rawUser of client.fetchUsers()) {
        const snowflakeUserData = convertUser(rawUser);
        users.push(snowflakeUserData);
      }
      logger.info('Done fetching users.');
    } catch (error) {
      logger.error({ error }, 'Error executing step');
      throw error;
    } finally {
      try {
        if (client) {
          await client.destroy();
        }
      } catch (error) {
        logger.error({ error }, 'Failed to destroy snowflake client');
      }
    }
    await jobState.addEntities(
      users.map((user) => createIntegrationEntity({ entityData: user })),
    );
  },
};

export default step;
