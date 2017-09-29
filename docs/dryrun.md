# Dry runs

When performing a dry run, no modification will be applied to the
database, but the response (including error responses)
will be the same as if it did.

Every action (except `find`) can perform a dry run by using the `dryrun`
argument, e.g.:

```graphql
mutation {
  delete_user(filter: {id: "1"}, dryrun: true) {
    id
  }
}
```