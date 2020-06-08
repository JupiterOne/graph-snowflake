import { Entity } from '@jupiterone/integration-sdk-core';
import { RawSnowflake } from '../client/types';

export interface SnowflakeIntegrationConfig {
  username: string;
  account: string;
  password: string;
  role: string;
}

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
  warehouseName: string;
  classification: 'unknown';
  encrypted: true;
}

export interface SnowflakeTable extends Entity {
  _class: ['DataStore', 'Database'];
  _type: 'snowflake_table';
  warehouseName: string;
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
