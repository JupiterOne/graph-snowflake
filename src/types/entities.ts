import { Entity } from '@jupiterone/integration-sdk';
import { RawSnowflake } from '../client/types';

export interface SnowflakeDatabase extends Entity {
  _class: ['DataStore', 'Database'];
  _type: 'snowflake_database';
  comment: string;
  createdOn: number;
  owner: string;
  origin: string;
  classification: string;
  encrypted: true;
  retentionTimeInDays: number | null;
}
