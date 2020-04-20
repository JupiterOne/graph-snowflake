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
  GRANTS,
  INTEGRATIONS,
  MANAGED_ACCOUNTS,
  PIPES,
  PROCEDURES,
  REGIONS,
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

type SnowflakeTypes = RawSnowflake[keyof RawSnowflake];
type ExecuteSqlCommandFn<T extends SnowflakeTypes> = () => AsyncIterable<T>;

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
      fetchAsString: ['Number', 'Date'],
    });
    const stream = statement.streamRows();
    return stream;
  }
  executeStatementNoReturn(sqlText: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection.execute({
        sqlText,
        fetchAsString: ['Number', 'Date'],
        complete: (err: Error) => {
          if (err) {
            reject(err);
          }
          resolve();
        },
      });
    });
  }

  fetchDatabases() {
    return withValidator<RawSnowflake['Database']>(
      'Database',
      this.logger,
      () => this.executeStatement<RawSnowflake['Database']>(DATABASES),
    );
  }

  fetchFileFormats() {
    return withValidator<RawSnowflake['FileFormat']>(
      'FileFormat',
      this.logger,
      () => this.executeStatement<RawSnowflake['FileFormat']>(FILE_FORMATS),
    );
  }

  fetchFunctions() {
    return withValidator<RawSnowflake['Function']>(
      'Function',
      this.logger,
      () => this.executeStatement<RawSnowflake['Function']>(FUNCTIONS),
    );
  }

  fetchGrants() {
    return withValidator<RawSnowflake['Grant']>('Grant', this.logger, () =>
      this.executeStatement<RawSnowflake['Grant']>(GRANTS),
    );
  }

  fetchIntegrations() {
    return withValidator<RawSnowflake['Integration']>(
      'Integration',
      this.logger,
      () => this.executeStatement<RawSnowflake['Integration']>(INTEGRATIONS),
    );
  }

  fetchManagedAccounts() {
    return withValidator<RawSnowflake['ManagedAccount']>(
      'ManagedAccount',
      this.logger,
      () =>
        this.executeStatement<RawSnowflake['ManagedAccount']>(MANAGED_ACCOUNTS),
    );
  }

  fetchPipes() {
    return withValidator<RawSnowflake['Pipe']>('Pipe', this.logger, () =>
      this.executeStatement<RawSnowflake['Pipe']>(PIPES),
    );
  }

  fetchProcedures() {
    return withValidator<RawSnowflake['Procedure']>(
      'Procedure',
      this.logger,
      () => this.executeStatement<RawSnowflake['Procedure']>(PROCEDURES),
    );
  }

  fetchRegions() {
    return withValidator<RawSnowflake['Region']>('Region', this.logger, () =>
      this.executeStatement<RawSnowflake['Region']>(REGIONS),
    );
  }

  fetchSchemas() {
    return withValidator<RawSnowflake['Schema']>('Schema', this.logger, () =>
      this.executeStatement<RawSnowflake['Schema']>(SCHEMAS),
    );
  }

  fetchShares() {
    return withValidator<RawSnowflake['Share']>('Share', this.logger, () =>
      this.executeStatement<RawSnowflake['Share']>(SHARES),
    );
  }

  fetchStages() {
    return withValidator<RawSnowflake['Stage']>('Stage', this.logger, () =>
      this.executeStatement<RawSnowflake['Stage']>(STAGES),
    );
  }

  fetchStreams() {
    return withValidator<RawSnowflake['Stream']>('Stream', this.logger, () =>
      this.executeStatement<RawSnowflake['Stream']>(STREAMS),
    );
  }

  fetchTables() {
    return withValidator<RawSnowflake['Table']>('Table', this.logger, () =>
      this.executeStatement<RawSnowflake['Table']>(TABLES),
    );
  }
  fetchTasks() {
    return withValidator<RawSnowflake['Task']>('Task', this.logger, () =>
      this.executeStatement<RawSnowflake['Task']>(TASKS),
    );
  }

  fetchUsers() {
    return withValidator<RawSnowflake['User']>('User', this.logger, () =>
      this.executeStatement<RawSnowflake['User']>(USERS),
    );
  }

  fetchViews() {
    return withValidator<RawSnowflake['View']>('View', this.logger, () =>
      this.executeStatement<RawSnowflake['View']>(VIEWS),
    );
  }

  fetchWarehouses() {
    return withValidator<RawSnowflake['Warehouse']>(
      'Warehouse',
      this.logger,
      () => this.executeStatement<RawSnowflake['Warehouse']>(WAREHOUSES),
    );
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
