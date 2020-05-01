# Development

This integration uses the `snowflake-sdk` package, referenced as the Node.js
connector in snowflake docs to make requests and create entities and
relationships from snowflake resources.

As of 4-24-20 the only things ingested are:

- Warehouses
- Databases
- Schemas
- Tables
- Users

## Prerequisites

Aside from what is documented in the [README](../README.md), no special tooling
is required to run and test this integration.

## Provider account setup

### Deep Security

Too start, visit [snowflake.com](snowflake.com) and click "Start for free", go
through the process of setting up a trial account and make sure you're able to
login and visit the notebook they have setup for running commands against
snowflake.

## Authentication

At this point you should have 2 of the required variables for authenticating,
Username and Password. The next needed is your Account name.

You can find the account name from the notebook (worksheet) site where you can
run commands via the URL bar. The URL will look something like:

https://upa06479.us-east-1.snowflakecomputing.com/console#/internal/worksheet

The first two sub domais make up the account name, so in this case:
`upa06479.us-east-1`.

You may be wondering why the region is included, and not just a separate
configurable value, and I have no idea why go ask snowflake. I don't have all
the answers.

Then put all of the required information into the `.env` file at the root of
your project.

```bash
USERNAME=${whatever your username is}
ACCOUNT=${your account name, how to find documented above}
PASSWORD=${your password}
ROLE=ACCOUNTADMIN # you can make a custom role, but ACCOUNTADMIN is easiest for developing
```

## Setup script

**!This should be possible to run multiple times**

Below is a setup script that should create the necessary resources to make the
test assertions happy, you should be able to highlight then `"> Run"` all of the
from the notebook (worksheet) where you found your account.

```
USE ROLE ACCOUNTADMIN;
USE WAREHOUSE COMPUTE_WH;
CREATE DATABASE IF NOT EXISTS test_db comment = 'test_comment';
USE DATABASE test_db;
CREATE SCHEMA IF NOT EXISTS test_schema comment = 'test-schema';
USE SCHEMA test_schema;

CREATE OR REPLACE ROLE JUPITERONE comment = 'test_comment';
CREATE PROCEDURE IF NOT EXISTS test_procedure() RETURNS float not null LANGUAGE JAVASCRIPT COMMENT = 'test_comment'
AS
$$
    return 2.71;
$$;
CREATE STAGE IF NOT EXISTS test_stage;
CREATE TABLE IF NOT EXISTS test_table like "SNOWFLAKE_SAMPLE_DATA"."TPCDS_SF100TCL"."CALL_CENTER";
CREATE VIEW IF NOT EXISTS test_view AS select * from test_table;
CREATE STREAM IF NOT EXISTS test_stream ON TABLE test_table;
CREATE PIPE IF NOT EXISTS test_pipe as copy into "UTIL_DB"."PUBLIC"."TEST_TABLE" from @test_stage;

CREATE TASK IF NOT EXISTS test_task WAREHOUSE='COMPUTE_WH' as SELECT * FROM "SNOWFLAKE_SAMPLE_DATA"."TPCDS_SF100TCL"."CALL_CENTER";
CREATE SHARE IF NOT EXISTS test;

CREATE SECURITY INTEGRATION IF NOT EXISTS test_integration
  TYPE = EXTERNAL_OAUTH
  ENABLED = FALSE
  EXTERNAL_OAUTH_TYPE = CUSTOM
  EXTERNAL_OAUTH_ISSUER = 'http://example.com'
  EXTERNAL_OAUTH_TOKEN_USER_MAPPING_CLAIM = 'test'
  EXTERNAL_OAUTH_SNOWFLAKE_USER_MAPPING_ATTRIBUTE = 'EMAIL_ADDRESS'
  EXTERNAL_OAUTH_JWS_KEYS_URL = 'http://example.com';
GRANT MANAGE GRANTS ON ACCOUNT TO ROLE JUPITERONE;

GRANT USAGE ON FUTURE SCHEMAS IN DATABASE test_db TO ROLE jupiterone;
```
