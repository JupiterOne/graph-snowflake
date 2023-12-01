const COMMANDS = {
  DATABASES: 'SHOW DATABASES;',
  FILE_FORMATS: 'SHOW FILE FORMATS;',
  FUNCTIONS: 'SHOW FUNCTIONS;',
  GLOBAL_GRANTS: 'SHOW GRANTS;',
  ACCOUNT_GRANTS: 'SHOW GRANTS ON ACCOUNT;',
  TO_DATABASE_GRANTS: (databaseName: string) =>
    `SHOW GRANTS ON DATABASE "${databaseName}";`,
  TO_ROLE_GRANTS: (roleName: string) => `SHOW GRANTS TO ROLE "${roleName}";`,
  TO_USER_GRANTS: (userName: string) => `SHOW GRANTS TO USER "${userName}";`,
  TO_SHARE_GRANTS: (shareName: string) =>
    `SHOW GRANTS TO SHARE "${shareName}";`,
  OF_SHARE_GRANTS: (shareName: string) =>
    `SHOW GRANTS OF SHARE "${shareName}";`,
  OF_ROLE_GRANTS: (roleName: string) => `SHOW GRANTS OF ROLE "${roleName}";`,
  FUTURE_SCHEMA_GRANTS: (schemaName: string) =>
    `SHOW FUTURE GRANTS IN SCHEMA "${schemaName}"`,
  FUTURE_DATABASE_GRANTS: (databaseName: string) =>
    `SHOW FUTURE GRANTS IN DATABASE "${databaseName}"`,
  ON_OBJECT_GRANTS: ({
    objectType,
    objectName,
  }: {
    // possible object types appear to be:
    // `WAREHOUSE`, `DATABASE`,`SCHEMA`, `TABLE`,
    // `VIEW`, `SHARE`, `STREAM`, `TASKS`, `SEQUENCE`
    // `PROCEDURE`, `PIPES`, `FUNCTIONS`, `STAGES`,
    // `INTEGRATIONS`, `FILE FORMAT`
    // almost everything... ugh.
    objectType: string;
    objectName: string;
  }) => `SHOW GRANTS ON "${objectType}" "${objectName}";`,
  INTEGRATIONS: 'SHOW INTEGRATIONS;',
  MANAGED_ACCOUNTS: 'SHOW MANAGED ACCOUNTS;',
  PIPES: 'SHOW PIPES;',
  PROCEDURES: 'SHOW PROCEDURES;',
  REGIONS: 'SHOW REGIONS;',
  ROLES: 'SHOW ROLES;',
  SCHEMAS: 'SHOW SCHEMAS;',
  SHARES: 'SHOW SHARES;',
  STAGES: 'SHOW STAGES;',
  STREAMS: 'SHOW STREAMS;',
  TABLES: 'SHOW TABLES;',
  TASKS: 'SHOW TASKS;',
  // Why does SHOW USERS require MANAGE GRANTS????
  USERS: 'SHOW USERS;',
  VIEWS: 'SHOW VIEWS;',
  WAREHOUSES: 'SHOW WAREHOUSES;',
} as const;

export default COMMANDS;
