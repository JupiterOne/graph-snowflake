import { Readable } from 'stream';
import snowflake from 'snowflake-sdk';
import { IntegrationLogger } from '@jupiterone/integration-sdk';
import sqlCommands from './sqlCommands';
import { RawSnowflake } from './types';
import validator from './validator';

const {
  DATABASES,
  VIEWS,
  FILE_FORMATS,
  FUNCTIONS,
  GLOBAL_GRANTS,
  ACCOUNT_GRANTS,
  TO_ROLE_GRANTS,
  TO_USER_GRANTS,
  TO_SHARE_GRANTS,
  OF_SHARE_GRANTS,
  OF_ROLE_GRANTS,
  FUTURE_SCHEMA_GRANTS,
  FUTURE_DATABASE_GRANTS,
  ON_OBJECT_GRANTS,
  INTEGRATIONS,
  MANAGED_ACCOUNTS,
  PIPES,
  PROCEDURES,
  REGIONS,
  ROLES,
  SCHEMAS,
  SHARES,
  STAGES,
  STREAMS,
  TABLES,
  TASKS,
  USERS,
  WAREHOUSES,
} = sqlCommands;

interface CreateClientOptions {
  username: string;
  account: string;
  password: string;
  role: string;
  logger: IntegrationLogger;
}

interface StatementWithStreamRows {
  streamRows: () => Readable;
}

type DestroyFn = (err: Error, conn: RawConnection) => void;

type ExecuteFnStream = (options: {
  sqlText: string;
  fetchAsString:
    | ['Number', 'Date']
    | ['Date', 'Number']
    | ['Number']
    | ['Date'];
}) => StatementWithStreamRows;

type ExecuteFnCb = (options: {
  sqlText: string;
  fetchAsString:
    | ['Number', 'Date']
    | ['Date', 'Number']
    | ['Number']
    | ['Date'];
  complete: (err: Error, stmt: unknown, rows: unknown) => void;
}) => void;

interface RawConnection {
  getId: () => string;
  execute: ExecuteFnStream & ExecuteFnCb;
  destroy: (fn: DestroyFn) => void;
}

type SnowflakeTypes = RawSnowflake[keyof RawSnowflake];
type ExecuteSqlCommandFn<T extends SnowflakeTypes> = () => AsyncIterable<T>;

function _createRawConnection(
  username: string,
  account: string,
  password: string,
): Promise<RawConnection> {
  return new Promise<RawConnection>((resolve, reject) => {
    const _connection = snowflake.createConnection({
      account,
      username,
      password,
    });
    _connection.connect((err: Error, connection: RawConnection) => {
      if (err) {
        reject(err);
      }
      resolve(connection);
    });
  });
}

// at the moment just logging validation results and errors.
async function* withValidator<T extends SnowflakeTypes>(
  key: string,
  logger: IntegrationLogger,
  fn: ExecuteSqlCommandFn<T>,
): AsyncIterable<T> {
  const iterable = fn();
  for await (const row of iterable) {
    try {
      const validateResult = validator.validate(`#/definitions/RawSnowflake`, {
        [key]: row,
      });
      logger.info({ validateResult }, 'Validate result');
      if (!validateResult) {
        logger.info({ errorText: validator.errorsText() }, 'Error text');
      }
    } catch (err) {
      logger.info({ err }, 'Error while validating');
    }
    yield row;
  }
}

export class Client {
  private createRawConnection: () => Promise<RawConnection>;
  private connection: RawConnection;
  private logger: IntegrationLogger;

  constructor(options: CreateClientOptions) {
    const { username, account, password, logger } = options;
    this.logger = logger;
    this.createRawConnection = () =>
      _createRawConnection(username, account, password);
  }

  async connect() {
    this.connection = await this.createRawConnection();
  }

  destroy(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection.destroy((err: Error) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }
  executeStatement<T = any>(sqlText: string): AsyncIterable<T> {
    const statement = this.connection.execute({
      sqlText,
      fetchAsString: ['Date'],
    });
    const stream = statement.streamRows();
    return stream;
  }

  executeStatementNoReturn(sqlText: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection.execute({
        sqlText,
        fetchAsString: ['Date'],
        complete: (err: Error) => {
          if (err) {
            reject(err);
          }
          resolve();
        },
      });
    });
  }

  private withValidator<T extends SnowflakeTypes>({
    typeName,
    statement,
  }: {
    typeName: string;
    statement: string;
  }) {
    return withValidator<T>(typeName, this.logger, () =>
      this.executeStatement<T>(statement),
    );
  }

  fetchDatabases() {
    const typeName = 'Database';
    type ReturnType = RawSnowflake[typeof typeName];
    const statement = DATABASES;
    return this.withValidator<ReturnType>({
      typeName,
      statement,
    });
  }

  fetchFileFormats() {
    const typeName = 'FileFormat';
    type ReturnType = RawSnowflake[typeof typeName];
    const statement = FILE_FORMATS;
    return this.withValidator<ReturnType>({
      typeName,
      statement,
    });
  }

  fetchFunctions() {
    const typeName = 'Function';
    type ReturnType = RawSnowflake[typeof typeName];
    const statement = FUNCTIONS;
    return this.withValidator<ReturnType>({
      typeName,
      statement,
    });
  }

  fetchGlobalGrants() {
    const typeName = 'GlobalGrant';
    type ReturnType = RawSnowflake[typeof typeName];
    const statement = GLOBAL_GRANTS;
    return this.withValidator<ReturnType>({
      typeName,
      statement,
    });
  }

  fetchAccountGrants() {
    const typeName = 'AccountPrivilegeGrant';
    type ReturnType = RawSnowflake[typeof typeName];
    const statement = ACCOUNT_GRANTS;
    return this.withValidator<ReturnType>({
      typeName,
      statement,
    });
  }

  fetchToRoleGrants(roleName: string) {
    const typeName = 'ToRolePrivilegeGrant';
    type ReturnType = RawSnowflake[typeof typeName];
    const statement = TO_ROLE_GRANTS(roleName);
    return this.withValidator<ReturnType>({
      typeName,
      statement,
    });
  }

  fetchToUserGrants(userName: string) {
    const typeName = 'ToUserPrivilegeGrant';
    type ReturnType = RawSnowflake[typeof typeName];
    const statement = TO_USER_GRANTS(userName);
    return this.withValidator<ReturnType>({
      typeName,
      statement,
    });
  }

  fetchToShareGrants(shareName: string) {
    const typeName = 'ToShareGrant';
    type ReturnType = RawSnowflake[typeof typeName];
    const statement = TO_SHARE_GRANTS(shareName);
    return this.withValidator<ReturnType>({
      typeName,
      statement,
    });
  }

  fetchOfShareGrants(shareName: string) {
    const typeName = 'OfShareGrant';
    type ReturnType = RawSnowflake[typeof typeName];
    const statement = OF_SHARE_GRANTS(shareName);
    return this.withValidator<ReturnType>({ typeName, statement });
  }

  fetchOfRoleGrants(roleName: string) {
    const typeName = 'OfRoleGrant';
    type ReturnType = RawSnowflake[typeof typeName];
    const statement = OF_ROLE_GRANTS(roleName);
    return this.withValidator<ReturnType>({ typeName, statement });
  }

  fetchFutureSchemaGrants(schemaName: string) {
    const typeName = 'FutureSchemaGrant';
    type ReturnType = RawSnowflake[typeof typeName];
    const statement = FUTURE_SCHEMA_GRANTS(schemaName);
    return this.withValidator<ReturnType>({ typeName, statement });
  }

  fetchFutureDatabaseGrants(databaseName: string) {
    const typeName = 'FutureDatabaseGrant';
    type ReturnType = RawSnowflake[typeof typeName];
    const statement = FUTURE_DATABASE_GRANTS(databaseName);
    return this.withValidator<ReturnType>({ typeName, statement });
  }

  fetchOnObjectGrants(input: { objectType: string; objectName: string }) {
    const typeName = 'OnObjectGrant';
    type ReturnType = RawSnowflake[typeof typeName];
    const statement = ON_OBJECT_GRANTS(input);
    return this.withValidator<ReturnType>({ typeName, statement });
  }

  fetchIntegrations() {
    const typeName = 'Integration';
    type ReturnType = RawSnowflake[typeof typeName];
    const statement = INTEGRATIONS;
    return this.withValidator<ReturnType>({
      typeName,
      statement,
    });
  }

  fetchManagedAccounts() {
    const typeName = 'ManagedAccount';
    type ReturnType = RawSnowflake[typeof typeName];
    const statement = MANAGED_ACCOUNTS;
    return this.withValidator<ReturnType>({
      typeName,
      statement,
    });
  }

  fetchPipes() {
    const typeName = 'Pipe';
    type ReturnType = RawSnowflake[typeof typeName];
    const statement = PIPES;
    return this.withValidator<ReturnType>({
      typeName,
      statement,
    });
  }

  fetchProcedures() {
    const typeName = 'Procedure';
    type ReturnType = RawSnowflake[typeof typeName];
    const statement = PROCEDURES;
    return this.withValidator<ReturnType>({
      typeName,
      statement,
    });
  }

  fetchRoles() {
    const typeName = 'Role';
    type ReturnType = RawSnowflake[typeof typeName];
    const statement = ROLES;
    return this.withValidator<ReturnType>({
      typeName,
      statement,
    });
  }

  fetchRegions() {
    const typeName = 'Region';
    type ReturnType = RawSnowflake[typeof typeName];
    const statement = REGIONS;
    return this.withValidator<ReturnType>({
      typeName,
      statement,
    });
  }

  fetchSchemas() {
    const typeName = 'Schema';
    type ReturnType = RawSnowflake[typeof typeName];
    const statement = SCHEMAS;
    return this.withValidator<ReturnType>({
      typeName,
      statement,
    });
  }

  fetchShares() {
    const typeName = 'Share';
    type ReturnType = RawSnowflake[typeof typeName];
    const statement = SHARES;
    return this.withValidator<ReturnType>({
      typeName,
      statement,
    });
  }

  fetchStages() {
    const typeName = 'Stage';
    type ReturnType = RawSnowflake[typeof typeName];
    const statement = STAGES;
    return this.withValidator<ReturnType>({
      typeName,
      statement,
    });
  }

  fetchStreams() {
    const typeName = 'Stream';
    type ReturnType = RawSnowflake[typeof typeName];
    const statement = STREAMS;
    return this.withValidator<ReturnType>({
      typeName,
      statement,
    });
  }

  fetchTables() {
    const typeName = 'Table';
    type ReturnType = RawSnowflake[typeof typeName];
    const statement = TABLES;
    return this.withValidator<ReturnType>({
      typeName,
      statement,
    });
  }
  fetchTasks() {
    const typeName = 'Task';
    type ReturnType = RawSnowflake[typeof typeName];
    const statement = TASKS;
    return this.withValidator<ReturnType>({
      typeName,
      statement,
    });
  }

  fetchUsers() {
    const typeName = 'User';
    type ReturnType = RawSnowflake[typeof typeName];
    const statement = USERS;
    return this.withValidator<ReturnType>({
      typeName,
      statement,
    });
  }

  fetchViews() {
    const typeName = 'View';
    type ReturnType = RawSnowflake[typeof typeName];
    const statement = VIEWS;
    return this.withValidator<ReturnType>({
      typeName,
      statement,
    });
  }

  fetchWarehouses() {
    const typeName = 'Warehouse';
    type ReturnType = RawSnowflake[typeof typeName];
    const statement = WAREHOUSES;
    return this.withValidator<ReturnType>({
      typeName,
      statement,
    });
  }
}

async function createClient(options: CreateClientOptions): Promise<Client> {
  const { logger } = options;
  logger.info('Creating client...');
  const client = new Client(options);
  logger.info('Attempting to connect...');
  try {
    await client.connect();
  } catch (err) {
    logger.error({ err }, 'Client failed to connect with error.');
    throw err;
  }

  logger.info('Client created.');
  return client;
}

export { createClient };
