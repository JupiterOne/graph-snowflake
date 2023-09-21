import {
  IntegrationEntityData,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';
import { RawSnowflake } from '../client/types';
import { SnowflakeRole } from '../types';

type RawRole = RawSnowflake['Role'];

export interface SnowflakeRoleEntityData extends IntegrationEntityData {
  assign: SnowflakeRole;
  source: RawRole;
}

function getRoleKey(roleName: string): string {
  return `snowflake-role:${roleName}`;
}

export function convertRole(rawRole: RawRole): SnowflakeRoleEntityData {
  return {
    source: rawRole,
    assign: {
      _class: ['AccessRole'],
      _type: 'snowflake_role',
      _key: getRoleKey(rawRole.name),
      name: rawRole.name,
      owner: rawRole.owner,
      comment: rawRole.comment,
      createdOn: parseTimePropertyValue(rawRole.created_on),
      isDefault: rawRole.is_default === 'Y',
      isCurrent: rawRole.is_current === 'Y',
      isInherited: rawRole.is_inherited === 'Y',
      assignedToUsers: rawRole.assigned_to_users,
      grantedToRoles: rawRole.granted_to_roles,
      grantedRoles: rawRole.granted_roles,
    },
  };
}
