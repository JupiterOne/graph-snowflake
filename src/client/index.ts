/* eslint-disable @typescript-eslint/no-explicit-any */
import snowflake from 'snowflake-sdk';
import StreamToAsyncIterator from 'stream-to-async-iterator';

import { Readable } from 'stream';

type SnowflakeReadableStream = Readable;

interface CreateClientOptions {
  username: string;
  account: string;
  password: string;
}

interface StatementWithStreamRows {
  streamRows: () => SnowflakeReadableStream;
}

type DestroyFn = (err: Error, conn: RawConnection) => void;
type ExecuteFnStream = (options: {
  sqlText: string;
}) => StatementWithStreamRows;
type ExecuteFnCb = (options: {
  sqlText: string;
  complete: (err: Error, stmt: unknown, rows: unknown) => void;
}) => void;

interface RawConnection {
  getId: () => string;
  execute: ExecuteFnStream & ExecuteFnCb;
  destroy: (DestroyFn) => void;
}

function destroyClient(rawConnection: RawConnection): Promise<RawConnection> {
  return new Promise((resolve, reject) => {
    rawConnection.destroy((err: Error, conn: RawConnection) => {
      if (err) {
        reject(err);
      }
      resolve(conn);
    });
  });
}

function executeStatement(
  sqlText: string,
  rawConnection: RawConnection,
): AsyncIterable<any> {
  const statement = rawConnection.execute({
    sqlText,
  });
  return new StreamToAsyncIterator(statement.streamRows());
}

// use when small amount of results are expected
function executeStatementNoReturn(
  sqlText: string,
  rawConnection: RawConnection,
): Promise<void> {
  return new Promise((resolve, reject) => {
    rawConnection.execute({
      sqlText,
      complete: (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      },
    });
  });
}

export interface Client {
  _rawConnection: RawConnection;
  executeStatement: (sqlText: string) => ReturnType<typeof executeStatement>;
  executeStatementNoReturn: (sqlText: string) => Promise<void>;
  destroy: () => ReturnType<typeof destroyClient>;
}

async function createClient(options: CreateClientOptions): Promise<Client> {
  const { username, account, password } = options;

  return new Promise((resolve, reject) => {
    const _connection = snowflake.createConnection({
      account,
      username,
      password,
    });
    _connection.connect((err: Error, connection: RawConnection) => {
      if (err) {
        reject(err);
      }
      resolve({
        _rawConnection: connection,
        executeStatement: (sqlText: string) =>
          executeStatement(sqlText, connection),
        executeStatementNoReturn: (sqlText: string) =>
          executeStatementNoReturn(sqlText, connection),
        destroy: () => destroyClient(connection),
      });
    });
  });
}

export { createClient };
