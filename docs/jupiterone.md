# Integration with JupiterOne

## Setup

JupiterOne provides a managed integration for Snowflake. The integration
connects to Snowflake and accesses resources by running commands, analyzes the
data and creates relationships between them

## Authentication and Access Control

The integration ingests resources from tables in the Snowflake system using `SHOW`
commands. The credentials provided to JupiterOne must be configured with the
[read permissions required to perform these commands](https://docs.snowflake.com/en/user-guide/security-access-control-privileges.html#schema-privileges).

## Data Model

### Entities

The following entity resources are ingested when the integration runs:

| Resources | \_type of the Entity  | \_class of the Entity   |
| --------- | --------------------- | ----------------------- |
| Warehouse | `snowflake_warehouse` | `DataStore`, `Database` |
| Database  | `snowflake_database`  | `DataStore`, `Database` |
| Schema    | `snowflake_schema`    | `DataStore`, `Database` |
| Table     | `snowflake_table`     | `DataStore`, `Database` |
| User      | `snowflake_user`      | `User`                  |

### Relationships

The following relationships are created/mapped:

| From                  | Edge    | To                   |
| --------------------- | ------- | -------------------- |
| `snowflake_warehouse` | **HAS** | `snowflake_database` |
| `snowflake_database`  | **HAS** | `snowflake_schema`   |
| `snowflake_schema`    | **HAS** | `snowflake_table`    |
