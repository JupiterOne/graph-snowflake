# Integration with JupiterOne

## Snowflake + JupiterOne Integration Benefits

- Visualize Snowflake cloud resources in the JupiterOne graph.
- Map Snowflake users to employees in your JupiterOne account.
- Monitor visibility and governance of your Snowflake cloud environment by
  leveraging hundreds of out of the box queries.
- Monitor changes to Snowflake cloud resources using JupiterOne alerts.

## How it Works

- JupiterOne periodically fetches Snowflake cloud resources to update the graph.
- Write JupiterOne queries to review and monitor updates to the graph.
- Configure alerts to take action when the JupiterOne graph changes.

## Requirements

- JupiterOne requires the full name of your Snowflake account. JupiterOne also requires
 a user's username and password, and the default security role to assume once connected to the session.
- You must have permission in JupiterOne to install new integrations.

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
