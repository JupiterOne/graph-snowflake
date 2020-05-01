# Authentication

- `account`, `user`, and `password` for authenticating, OAuth v2 flow
  (abstracted away by connector)

# Access Control

- Will need custom role with specific priveleges
- pretty much needs top level permissions,
- E.G. Manage Grants to grab users

# Misc

- SDK: https://www.npmjs.com/package/snowflake-sdk
  - appears to be entirely callback based, but should be able to use promisify /
    stream interface
  - may be able to reverse engineer logic in here for just what we need
- `SHOW {resource}` appears to be the SQL commands that will give us info needed

- need to execute certain `SHOW {resource}` commands at different levels.
  - E.G. `SHOW PIPES;` will show nothing if you dont have a database selected
