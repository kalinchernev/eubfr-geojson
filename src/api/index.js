const fs = require("fs");
const getGeoFields = require("../lib/getGeoFields");
const request = require("../lib/request");

export const handler = async event => {
  const {
    CACHE_DIR: cacheDir,
    ES_PUBLIC_ENDPOINT,
    INDEX: index,
    TYPE: type
  } = process.env;

  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
  }

  let geoFields = {};
  let results = {};
  // Response template.
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*", // Required for CORS support
      "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
    },
    body: ""
  };

  try {
    geoFields = require(`${cacheDir}/GeoFields.json`);
  } catch (e) {
    geoFields = await getGeoFields();
    fs.writeFileSync(`${cacheDir}/GeoFields.json`, JSON.stringify(geoFields));
  }

  const { path, httpMethod: method, body } = event;

  try {
    const elasticsearchRes = await request(
      {
        host: ES_PUBLIC_ENDPOINT,
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        },
        path,
        method
      },
      body
    );

    if (elasticsearchRes.hits.hits.length) {
      results = elasticsearchRes.hits.hits.map(record => {
        // Start with key fields usually needed.
        const mapped = {
          id: record._id,
          computed_key: record._source.computed_key,
          last_modified: record._source.last_modified
        };

        // Add fields which contain geolocation information.
        Object.keys(geoFields).forEach(geoField => {
          const field = geoField.split(".")[0];
          mapped[field] = record._source[field];
        });

        return mapped;
      });
      response.body = JSON.stringify(results);
    } else {
      response.body = JSON.stringify({
        message: "There were no useful results to return regarding your query."
      });
    }
    return response;
  } catch (e) {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: e.message
    });
    return response;
  }
};
