# EUBFR Elasticsearch Proxy

Uses API Gateway's LAMBDA_PROXY Integration Request in order map results from Elasticsearch-specific structure to GeoJSON.

## Get dependencies

```sh
$ yarn install
```

## Configure runtime variables

There are a few variables you need to set for scripts to work correctly:

```sh
$ export EUBFR_ES_ENDPOINT=
$ export EUBFR_ES_INDEX=
$ export EUBFR_ES_TYPE=
```

Where `EUBFR_ES_ENDPOINT` contains a value taken from Amazon Elasticsearch's `Endpoint`, apply without the `https` protocol.

## Run local server

```sh
$ yarn start
```

## Examples

Here are a few examples for starters. Keep in mind that `index` and `type` are automatically detected and used from your environment variables, as described in the [notes](#development-notes)

So, use `protocol://host/_search` instead of `protocol://host/index/type/_search`.

### Get a few records

```sh
$ curl --request POST \
  --url http://localhost:4000/_search \
  --header 'content-type: application/json' \
  --data '{
	"from" : 0, "size" : 6
}
'
```

### Get records from a specific producer

```sh
$ curl --request POST \
  --url http://localhost:4000/_search \
  --header 'content-type: application/json' \
  --data '{
	"query": {
		"wildcard" : { "computed_key" : "eac/*" }
	}
}'
```

## Deploy service

Ensure your [credentials are setup correctly](https://serverless.com/framework/docs/providers/aws/guide/credentials/), then tweak the following if necessary:

```sh
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
  EUBFR_ES_ENDPOINT: ""   <-- Take from https://eu-central-1.console.aws.amazon.com/es/home
  EUBFR_ES_INDEX: test-projects     <-- Select Elasticsearch index to work with.
  EUBFR_ES_TYPE: project            <-- Select Elasticsearch document type to work with.
```

## Constraints

This proxy service exists with the sole purpose of formatting response documents from Elasticsearch as a GeoJSON.

In order to achieve its purpose, the service makes the following assumptions, which are also constraints for what it can achieve matching expectations:

- Resulting documents should contain geolocation information. More specifically, it has to be in a field called `project_locations`, with a property `centroid` which is of type [geo point](https://www.elastic.co/guide/en/elasticsearch/reference/current/geo-point.html).
- Resulting documents formatted by the service should be in the standard/default response structure of Elasticsearch, i.e. `response.hits.hits`. If aggregations are used, which changes the shape of the response, these structures are not formatted as GeoJSON.
