type YorN = 'Y' | 'N';
type ONorOFF = 'ON' | 'OFF';
type BoolStr = 'true' | 'false';

export type RawSnowflake = {
  Database: {
    created_on: string;
    name: string;
    is_default: YorN;
    is_current: YorN;
    origin: string;
    owner: string;
    comment: string;
    options: string;
    retention_time: string;
  };

  Schema: {
    created_on: string;
    name: string;
    is_default: YorN;
    is_current: YorN;
    database_name: string;
    owner: string;
    comment: string;
    options: string;
    retention_time: string;
  };

  Table: {
    created_on: string;
    name: string;
    database_name: string;
    schema_name: string;
    kind: 'TABLE' | 'TEMPORARY' | 'TRANSIENT';
    comment: string;
    cluster_by: string;
    rows: number;
    bytes: number;
    owner: string;
    retention_time: string;
    automatic_clustering: ONorOFF;
    change_tracking: ONorOFF;
    dropped_on?: string | undefined;
  };

  View: {
    created_on: string;
    name: string;
    reserved: string;
    database_name: string;
    schema_name: string;
    owner: string;
    comment: string;
    text: string;
    is_secure: BoolStr;
    is_materialized: BoolStr;
  };

  FileFormat: {
    created_on: string;
    name: string;
    database_name: string;
    schema_name: string;
    type: 'CSV' | 'JSON' | 'AVRO' | 'ORC' | 'PARQUET' | 'XML';
    owner: string;
    comment: string;
  };

  Function: {
    created_on: string;
    name: string;
    schema_name: string;
    is_builtin: YorN;
    is_aggregate: YorN;
    is_ansi: YorN;
    min_num_arguments: number;
    max_num_arguments: number;
    arguments: string;
    description: string;
    catalog_name: string;
    is_table_function: YorN;
    valid_for_clustering: YorN;
    is_secure: YorN | null;
  };

  Integration: {
    created_on: string;
    name: string;
    type: string; // TODO: possible values?
    category: 'NOTIFICATION' | 'SECURITY' | 'STORAGE';
    enabled: BoolStr;
    comment: string;
  };

  ManagedAccount: {
    name: string;
    cloud: string;
    region: string;
    locator: string;
    created_on: string;
    url: string;
    is_reader: BoolStr;
    comment: string;
  };

  Pipe: {
    created_on: string;
    name: string;
    database_name: string;
    schema_name: string;
    definition: string;
    owner: string;
    notification_channel: string;
    comment: string;
  };

  Procedure: {
    created_on: string;
    name: string;
    schema_name: string;
    is_builtin: YorN;
    is_aggregate: YorN;
    is_ansi: YorN;
    min_num_arguments: number;
    max_num_arguments: number;
    arguments: string;
  };

  Region: {
    region_group: string;
    snowflake_region: string;
    cloud: string;
    region: string;
  };

  Share: {
    created_on: string;
    kind: 'INBOUND' | 'OUTBOUND';
    name: string;
    database_name: string;
    to: string;
    owner: string;
    comment: string;
  };

  Stage: {
    created_on: string;
    name: string;
    database_name: string;
    schema_name: string;
    url: string;
    has_credentials: YorN;
    has_encryption_key: YorN;
    owner: string;
    comment: string;
    region: string;
    type: string;
    cloud?: string | null;
    storage_integration?: string | null;
  };

  Stream: {
    created_on: string;
    name: string;
    database_name: string;
    schema_name: string;
    owner: string;
    comment: string;
    table_name: string;
    type: 'DELTA';
    stale: string;
    mode: 'INSERT_ONLY' | 'DEFAULT';
  };

  Task: {
    created_on: string;
    name: string;
    id: string;
    database_name: string;
    schema_name: string;
    owner: string;
    comment: string;
    warehouse: string;
    schedule: string;
    predecessors?: string | null;
    state: 'started' | 'suspended';
    definition: string;
    condition: string;
  };

  Warehouse: {
    name: string;
    state: 'STARTED' | 'SUSPENDED';
    type: 'STANDARD';
    size:
      | 'X-Small'
      | 'Small'
      | 'Medium'
      | 'Large'
      | 'X-Large'
      | '2X-Large'
      | '3X-Large'
      | '4X-Large';
    min_cluster_count?: number | null;
    max_cluster_count?: number | null;
    started_clusters?: number | null;
    running: number;
    queued: number;
    is_default: YorN;
    is_current: YorN;
    auto_suspend: number;
    auto_resume: BoolStr;
    available: string;
    provisioning: string;
    quiescing: string;
    other: string;
    created_on: string;
    resumed_on: string;
    updated_on: string;
    owner: string;
    comment: string;
    resource_monitor: string;
    scaling_policy?: string;
  };

  // TODO: figure out a better way to get Users from snowflake;
  // as of right now it requires the MANAGE GRANTS permission which
  // is too broad.
  // Maybe some kind of task that exports the contents of `SHOW USERS`
  // to another table? Will need to be executed by higher priv role.
  User: {
    name: string;
    created_on: string;
    login_name: string;
    display_name: string;
    first_name: string;
    last_name: string;
    email: string;
    mins_to_unlock: string;
    days_to_expiry: string;
    comment: string;
    disabled: BoolStr;
    must_change_password: BoolStr;
    snowflake_lock: BoolStr;
    default_warehouse: string;
    default_namespace: string;
    default_role: string;
    ext_authn_duo: BoolStr;
    ext_authn_uid: string;
    mins_to_bypass_mfa: string;
    owner: string;
    last_success_login: string;
    expires_at_time: string;
    locked_until_time: string | 'NULL';
    has_password: BoolStr;
    has_rsa_public_key: BoolStr;
  };

  // All of the `SHOW GRANT ...` types map to
  // a command signature seen here:
  // https://docs.snowflake.com/en/sql-reference/sql/show-grants.html
  // TODO: is there overlap in any of these commands? Need to make sure
  // we don't accidentally created more entities / relationships than necessary.
  // TODO: make union type of all (seen) privileges
  // output from `SHOW GRANTS;`
  GlobalGrant: {
    created_on: string;
    role: string;
    granted_to: string;
    grantee_name: string;
    granted_by: string;
  };

  // output from `SHOW GRANTS ON ACCOUNT;`
  AccountPrivilegeGrant: {
    created_on: string;
    privilege: string;
    granted_on: string;
    name: string;
    granted_to: string;
    grantee_name: string;
    grant_option: BoolStr;
    granted_by: string;
  };

  ////////////////////////////////////////////////////////////
  // START `SHOW GRANTS TO ...`                             //
  ////////////////////////////////////////////////////////////
  // output from `SHOW GRANTS TO ROLE <role name>;`
  ToRolePrivilegeGrant: {
    created_on: string;
    privilege: string;
    granted_on: string;
    name: string;
    granted_to: string;
    grantee_name: string;
    grant_option: BoolStr;
    granted_by: string;
  };

  // output from `SHOW GRANTS ON DATABASE <database name>;`
  OnDatabasePrivilegeGrant: {
    created_on: string;
    privilege: string;
    granted_on: string;
    name: string;
    granted_to: string;
    grantee_name: string;
    grant_option: BoolStr;
    granted_by: string;
    granted_by_role_type: string;
  };

  // output from `SHOW GRANTS TO USER <user name>;`
  ToUserPrivilegeGrant: {
    created_on: string;
    role: string;
    granted_to: string;
    grantee_name: string;
    granted_by: string;
  };

  // output from `SHOW GRANTS TO SHARE <share name>;`
  ToShareGrant: {
    created_on: string;
    privilege: string;
    granted_on: string;
    name: string;
    granted_to: string;
    grantee_name: string;
    grant_option: BoolStr;
  };
  ////////////////////////////////////////////////////////////
  // END `SHOW GRANTS TO ...`                               //
  ////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////
  // START `SHOW GRANTS OF ...`                             //
  ////////////////////////////////////////////////////////////
  // output from `SHOW GRANTS OF SHARE <share name>;`
  OfShareGrant: {
    created_on: string;
    share: string;
    granted_to: string;
    grantee_name: string;
    granted_by: string;
  };

  // output from `SHOW GRANTS OF ROLE <role name>;`
  OfRoleGrant: {
    created_on: string;
    role: string;
    granted_to: string;
    grantee_name: string;
    granted_by: string;
  };
  ////////////////////////////////////////////////////////////
  // END `SHOW GRANTS TO ...`                               //
  ////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////
  // START `SHOW FUTURE GRANTS IN ...`                      //
  ////////////////////////////////////////////////////////////
  // output from `SHOW FUTURE GRANTS IN SCHEMA <database name> <schema name>;`
  FutureSchemaGrant: {
    created_on: string;
    privilege: string;
    grant_on: string;
    name: string;
    grant_to: string;
    grantee_name: string;
    grant_option: BoolStr;
  };

  // output from `SHOW FUTURE GRANTS IN DATABASE <database name>;`
  FutureDatabaseGrant: {
    created_on: string;
    privilege: string;
    grant_on: string;
    name: string;
    grant_to: string;
    grantee_name: string;
    grant_option: BoolStr;
  };
  ////////////////////////////////////////////////////////////
  // END `SHOW FUTURE GRANTS IN ...`                        //
  ////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////
  // START `SHOW GRANTS ON <object-type> <object-name> ...` //
  ////////////////////////////////////////////////////////////
  // examples for object type: `USER, DATABASE, SCHEMA, SHARE, VIEW, STREAM, etc.`
  // output from `SHOW GRANTS ON <object type> <object name>;`
  OnObjectGrant: {
    created_on: string;
    privilege: string;
    granted_on: string;
    name: string;
    granted_to: string;
    grantee_name: string;
    grant_option: BoolStr;
    granted_by: string;
  };
  ////////////////////////////////////////////////////////////
  // END `SHOW GRANTS ON <object-type> <object-name> ...`   //
  ////////////////////////////////////////////////////////////

  Role: {
    created_on: string;
    name: string;
    is_default: YorN;
    is_current: YorN;
    is_inherited: YorN;
    assigned_to_users: number;
    granted_to_roles: number;
    granted_roles: number;
    owner: string;
    comment: string;
  };
};
