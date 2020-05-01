import { Client } from '../src/client';
import { createMockIntegrationLogger } from '@jupiterone/integration-sdk/testing';
import { simpleAsyncIterator } from '.';

function createMockedClient(): jest.Mocked<Client> {
  let currentWarehouse: string | null = null;
  let currentDatabase: string | null = null;
  let currentSchema: string | null = null;
  let currentRole: string | null = null;

  const mockedClient: jest.Mocked<Client> = {
    logger: createMockIntegrationLogger(),
    currentDatabase: '',
    currentRole: '',
    currentSchema: '',
    currentWarehouse: '',
    connection: {} as any,
    createRawConnection: jest.fn(),
    init: jest.fn(),
    destroy: jest.fn(),
    executeStatement: jest
      .fn()
      .mockImplementationOnce(() => simpleAsyncIterator([])),
    executeStatementNoReturn: jest.fn(),
    setRole: jest.fn().mockImplementation(async (val: string) => {
      currentRole = val;
    }),
    setWarehouse: jest.fn().mockImplementation(async (val: string) => {
      currentWarehouse = val;
    }),
    setDatabase: jest.fn().mockImplementation(async (val: string) => {
      currentDatabase = val;
    }),
    setSchema: jest.fn().mockImplementation(async (val: string) => {
      currentSchema = val;
    }),
    refreshCurrentValues: jest.fn(),
    getCurrentValues: jest.fn().mockImplementationOnce(() => {
      return {
        currentDatabase,
        currentRole,
        currentSchema,
        currentWarehouse,
      };
    }),
    withValidator: jest
      .fn()
      .mockImplementationOnce(() => simpleAsyncIterator([])),
    fetchDatabases: jest
      .fn()
      .mockImplementationOnce(() => simpleAsyncIterator([])),
    fetchFileFormats: jest
      .fn()
      .mockImplementationOnce(() => simpleAsyncIterator([])),
    fetchFunctions: jest
      .fn()
      .mockImplementationOnce(() => simpleAsyncIterator([])),
    fetchGlobalGrants: jest
      .fn()
      .mockImplementationOnce(() => simpleAsyncIterator([])),
    fetchAccountGrants: jest
      .fn()
      .mockImplementationOnce(() => simpleAsyncIterator([])),
    fetchToRoleGrants: jest
      .fn()
      .mockImplementationOnce(() => simpleAsyncIterator([])),
    fetchToUserGrants: jest
      .fn()
      .mockImplementationOnce(() => simpleAsyncIterator([])),
    fetchToShareGrants: jest
      .fn()
      .mockImplementationOnce(() => simpleAsyncIterator([])),
    fetchOfShareGrants: jest
      .fn()
      .mockImplementationOnce(() => simpleAsyncIterator([])),
    fetchOfRoleGrants: jest
      .fn()
      .mockImplementationOnce(() => simpleAsyncIterator([])),
    fetchFutureSchemaGrants: jest
      .fn()
      .mockImplementationOnce(() => simpleAsyncIterator([])),
    fetchFutureDatabaseGrants: jest
      .fn()
      .mockImplementationOnce(() => simpleAsyncIterator([])),
    fetchOnObjectGrants: jest
      .fn()
      .mockImplementationOnce(() => simpleAsyncIterator([])),
    fetchIntegrations: jest
      .fn()
      .mockImplementationOnce(() => simpleAsyncIterator([])),
    fetchManagedAccounts: jest
      .fn()
      .mockImplementationOnce(() => simpleAsyncIterator([])),
    fetchPipes: jest.fn().mockImplementationOnce(() => simpleAsyncIterator([])),
    fetchProcedures: jest
      .fn()
      .mockImplementationOnce(() => simpleAsyncIterator([])),
    fetchRoles: jest.fn().mockImplementationOnce(() => simpleAsyncIterator([])),
    fetchRegions: jest
      .fn()
      .mockImplementationOnce(() => simpleAsyncIterator([])),
    fetchSchemas: jest
      .fn()
      .mockImplementationOnce(() => simpleAsyncIterator([])),
    fetchShares: jest
      .fn()
      .mockImplementationOnce(() => simpleAsyncIterator([])),
    fetchStages: jest
      .fn()
      .mockImplementationOnce(() => simpleAsyncIterator([])),
    fetchStreams: jest
      .fn()
      .mockImplementationOnce(() => simpleAsyncIterator([])),
    fetchTables: jest
      .fn()
      .mockImplementationOnce(() => simpleAsyncIterator([])),
    fetchTasks: jest.fn().mockImplementationOnce(() => simpleAsyncIterator([])),
    fetchUsers: jest.fn().mockImplementationOnce(() => simpleAsyncIterator([])),
    fetchViews: jest.fn().mockImplementationOnce(() => simpleAsyncIterator([])),
    fetchWarehouses: jest
      .fn()
      .mockImplementationOnce(() => simpleAsyncIterator([])),
  };

  return mockedClient;
}

export default createMockedClient;
