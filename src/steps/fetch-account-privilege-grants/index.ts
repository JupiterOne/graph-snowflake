import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  IntegrationEntityData,
  createIntegrationEntity,
  getTime,
  createIntegrationRelationship,
} from '@jupiterone/integration-sdk';

import { createClient, Client as SnowflakeClient } from '../../client';
import '../../client';
import { RawSnowflake } from '../../client/types';
import { SnowflakeGrant, SnowflakeAccount, SnowflakeRole } from '../../types';

type RawAccountPrivilegeGrant = RawSnowflake['AccountPrivilegeGrant'];
interface SnowflakeAccountPrivilegeGrantEntityData
  extends IntegrationEntityData {
  assign: SnowflakeGrant;
  source: RawAccountPrivilegeGrant;
}

function convertAccountPrivilegeGrant(
  rawAccountPrivilegeGrant: RawAccountPrivilegeGrant,
): SnowflakeAccountPrivilegeGrantEntityData {
  const {
    created_on: createdOnStr,
    privilege,
    granted_to: grantedTo,
    grantee_name: granteeName,
    granted_by: grantedBy,
    granted_on: grantedOn,
    // Grant option allows the recipient role
    // to grant this privilege to other roles.
    grant_option: grantOptionStr,
  } = rawAccountPrivilegeGrant;
  // granted on is the type of thing this grant allows actions on, this should
  // always be ACCOUNT for this step I think.
  // granted to is the type of thing this grant is granted to,
  // I think this is always ROLE?
  // grantee name is the name of the object that this grant is granted to
  // granted by
  const displayName = `Privilege '${privilege}' granted to ${grantedTo} '${granteeName}' on resource ${grantedOn} by ${
    grantedBy === '' ? 'UNKNOWN' : grantedBy
  }`;
  return {
    assign: {
      _class: ['AccessPolicy'],
      _type: 'snowflake_grant',
      _key: `snowflake-grant:global${grantedTo}:${granteeName}:${privilege}:${grantedBy}`,
      displayName,
      name: displayName,
      createdOn: getTime(createdOnStr),
      grantedBy,
      grantedTo,
      granteeName,
      grantedOn,
      allowsGranting: grantOptionStr === 'true',
    },
    source: rawAccountPrivilegeGrant,
  };
}

const step: IntegrationStep = {
  id: 'fetch-account-privilege-grants',
  name: 'Fetch Account Privilege Grants',
  types: ['snowflake_grant'],
  dependsOn: ['create-account', 'fetch-roles'],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext) {
    const { config } = instance;
    let client: SnowflakeClient | undefined;
    const accountPrivilegeGrants: SnowflakeAccountPrivilegeGrantEntityData[] = [];
    try {
      client = await createClient({ ...config, logger });
      logger.info('Fetching account privilege grants...');

      for await (const rawAccountPrivilegeGrant of client.fetchAccountGrants()) {
        const snowflakeaccountPrivilegeGrantData = convertAccountPrivilegeGrant(
          rawAccountPrivilegeGrant,
        );
        accountPrivilegeGrants.push(snowflakeaccountPrivilegeGrantData);
      }
      logger.info('Done fetching account privilege grants.');
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
    let account: SnowflakeAccount | undefined;
    // this feels like a weird way to iterate on the entities
    // so I added some error checking cases.
    await jobState.iterateEntities(
      { _type: 'snowflake_account' },
      (accountEntity: SnowflakeAccount) => {
        if (account) {
          logger.error(
            {
              existingAccount: account,
              otherAccount: accountEntity,
            },
            'Multiple accounts found for single integration run',
          );
          throw new Error('Multiple accounts found!');
        }
        account = accountEntity;
      },
    );
    if (!account) {
      logger.error('No account entity found...');
      throw new Error('No account entity found.');
    }
    logger.info('Creating role map.');
    const nameToRoleMap = new Map<string, SnowflakeRole | undefined>();
    await jobState.iterateEntities(
      { _type: 'snowflake_role' },
      async (role: SnowflakeRole) => {
        nameToRoleMap.set(role.name, role);
      },
    );
    logger.info('Done creating role map');

    await jobState.addEntities(
      accountPrivilegeGrants.map((accountPrivilegeGrant) =>
        createIntegrationEntity({ entityData: accountPrivilegeGrant }),
      ),
    );

    logger.info('Building relationships...');
    for (const { assign: entity, source: rawData } of accountPrivilegeGrants) {
      // there don't appear to be any other options for granted_to
      // for this grant type, but add specific
      // check just to make sure.
      if (rawData.granted_to === 'ROLE') {
        const targetRole = nameToRoleMap.get(rawData.grantee_name);
        if (targetRole) {
          await jobState.addRelationships([
            createIntegrationRelationship({
              _class: 'ASSIGNED',
              from: entity,
              to: targetRole,
            }),
          ]);
        }
      }

      if (rawData.granted_on === 'ACCOUNT') {
        await jobState.addRelationships([
          createIntegrationRelationship({
            _class: '',
            from: entity,
            to: account,
          }),
        ]);
      }
    }
    logger.info('Done building relationships');
  },
};

export default step;
