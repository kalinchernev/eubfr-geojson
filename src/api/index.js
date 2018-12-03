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

  try {
    geoFields = require(`${cacheDir}/GeoFields.json`);
  } catch (e) {
    geoFields = await getGeoFields();
    fs.writeFileSync(`${cacheDir}/GeoFields.json`, JSON.stringify(geoFields));
  }

  const { path, httpMethod: method, body } = event;

  try {
    const results = await request(
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

    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Required for CORS support
        "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
      },
      body: JSON.stringify(results)
    };

    return response;
  } catch (e) {
    throw e;
  }
};
