import { Entity } from '@jupiterone/integration-sdk';
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
}

export interface SnowflakeAccount extends Entity {
  name: string;
}
