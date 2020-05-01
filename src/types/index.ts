import { Entity } from '@jupiterone/integration-sdk';
import { RawSnowflake } from '../client/types';

export interface SnowflakeUser extends Entity {
  _class: ['User'];
  _type: 'snowflake_user';
  name: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  createdOn: number;
  loginName: string;
  disabled: boolean;
  hasPassword: boolean;
  mustChangePassword: boolean;
  hasRsaPublicKey: boolean;
  lastLogin: number;
  comment: string;
  owner: string;
  snowflakeLock: boolean;
  minsToUnlock: number;
  lockedUntilTime?: number | null;
  expiresAtTime: number;
  defaultWarehouse: string;
  defaultNamespace: string;
  defaultRole: string;
  externalAuthUid: string;
  externalAuthDuoEnabled: boolean;
}

export interface SnowflakeWarehouse extends Entity {
  _class: ['DataStore', 'Database'];
  _type: 'snowflake_warehouse';
  name: string;
  classification: 'unknown';
  encrypted: true;
}

export interface SnowflakeDatabase extends Entity {
  _class: ['DataStore', 'Database'];
  _type: 'snowflake_database';
  name: string;
  comment: string;
  createdOn: number;
  owner: string;
  origin: string;
  classification: string;
  encrypted: true;
  retentionTimeInDays: number | null;
  warehouseName: string;
}

export interface SnowflakeSchema extends Entity {
  _class: ['DataStore', 'Database'];
  _type: 'snowflake_schema';
  name: string;
  databaseName: string;
  classification: 'unknown';
  encrypted: true;
}

export interface SnowflakeTable extends Entity {
  _class: ['DataStore', 'Database'];
  _type: 'snowflake_table';
  databaseName: string;
  schemaName: string;
  createdOn: number;
  itemCount: number;
  tableSizeBytes: number;
  tableName: string;
  clusterBy: string;
  kind: RawSnowflake['Table']['kind'];
  automaticClustering: boolean;
  changeTracking: boolean;
  owner: string;
  droppedOn?: number | null;
  classification: 'unknown';
  encrypted: true;
  retentionTimeInDays: number | null;
}

// NOT RELEASED YET

export interface SnowflakeAccount extends Entity {
  name: string;
}

export interface SnowflakeGrant extends Entity {
  _class: ['AccessPolicy'];
  _type: 'snowflake_grant';
  name: string;
  createdOn: number;
  grantedTo: string;
  granteeName: string;
  grantedBy?: string;
  privilege?: string | null;
  role?: string | null;
  grantedOn?: string | null;
  share?: string | null;
  allowsGranting?: boolean;
}

export interface SnowflakeFileFormat extends Entity {
  _class: ['Resource'];
  _type: 'snowflake_file_format';
  databaseName: string;
  schemaName: string;
  owner: string;
  comment: string;
  extension: RawSnowflake['FileFormat']['type'];
  createdOn: number;
}

export interface SnowflakeRole extends Entity {
  _class: ['AccessRole'];
  _type: 'snowflake_role';
  createdOn: number;
  name: string;
  owner: string;
  comment: string;
  numRolesGranted: number;
  numGrantedToRoles: number;
  numAssignedUsers: number;
  isInheritedRole: boolean;
}

export interface SnowflakeShare extends Entity {
  _class: ['AccessPolicy'];
  _type: 'snowflake_share';
  name: string;
  createdOn: number;
  databaseName: string;
  to: string;
  owner: string;
  kind: RawSnowflake['Share']['kind'];
  comment: string;
}

export interface SnowflakeIntegration extends Entity {
  _class: ['Resource'];
  _type: 'snowflake_integration';
  name: string;
}

export interface SnowflakeManagedAccount extends Entity {
  _class: ['Account'];
  _type: 'snowflake_managed_account';
  name: string;
}

export interface SnowflakePipe extends Entity {
  _class: ['Queue'];
  _type: 'snowflake_pipe';
  name: string;
}

export interface SnowflakeProcedure extends Entity {
  _class: ['Function'];
  _type: 'snowflake_procedure';
  name: string;
}

export interface SnowflakeStream extends Entity {
  _class: ['Queue'];
  _type: 'snowflake_stream';
  name: string;
}

export interface SnowflakeTask extends Entity {
  _class: ['Task'];
  _type: 'snowflake_task';
  name: string;
  owner: string;
  comment: string;
  warehouseName: string;
  databaseName: string;
  schemaName: string;
  schedule: string;
  definition: string;
  condition: string;
}

export interface SnowflakeStage extends Entity {
  _class: ['DataStore'];
  _type: 'snowflake_stage';
  classification: 'unknown';
  encrypted: true;
  name: string;
}

export interface SnowflakeRegion extends Entity {
  _class: ['Record'];
  _type: 'snowflake_region';
  name: string;
}
