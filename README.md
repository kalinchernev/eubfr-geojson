# EUBFR Elasticsearch Proxy

Uses API Gateway's LAMBDA_PROXY Integration Request in order map results from Elasticsearch-specific structure to GeoJSON.

## Get dependencies

```sh
$ yarn install
```

## Run local server

```sh
$ yarn start
```

## Examples

Here are a few examples for starters.

### Get projects

```sh
$ curl --request POST \
  --url http://localhost:4000/test-projects/project/_search \
  --header 'content-type: application/json' \
  --data '{
	"from" : 0, "size" : 6
}
'
```

## Deploy service

Ensure your [credentials are setup correctly](https://serverless.com/framework/docs/providers/aws/guide/credentials/), then tweak the following if necessary:

```
$ export EUBFR_ENV=
$ export EUBFR_STAGE=
$ export EUBFR_AWS_REGION=
```

Lastly, run:

```sh
$ yarn deploy
```

## Development notes

Keep the following environment variables in `serverless.yml` up to date:

```yaml
environment:
  CACHE_DIR: "/tmp"        <-- That's the only place we can cache assets temporarily in AWS Lambda.
  ES_PUBLIC_ENDPOINT: ""   <-- Take from https://eu-central-1.console.aws.amazon.com/es/home
  INDEX: test-projects     <-- Select Elasticsearch index to work with.
  TYPE: project            <-- Select Elasticsearch document type to work with.
```
