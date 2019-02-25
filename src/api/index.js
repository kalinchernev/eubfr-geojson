const fs = require("fs");
const getGeoFields = require("../lib/getGeoFields");
const request = require("../lib/request");

export const handler = async event => {
  // Extract only what we need from proxy request.
  const { path, httpMethod: method, body } = event;

  const {
    CACHE_DIR: cacheDir,
    EUBFR_ES_ENDPOINT,
    EUBFR_ES_INDEX: index,
    EUBFR_ES_TYPE: type
  } = process.env;

  // Create cache directory.
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
  }

  let geoFields = {};
  const centroidFields = [];
  const geojson = {
    type: "FeatureCollection",
    features: []
  };
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

  // We support only fields with centroids (points) for the time being.
  Object.keys(geoFields).forEach(geoField => {
    if (geoField.includes("centroid")) {
      centroidFields.push(geoField);
    }
  });

  try {
    const elasticsearchRes = await request(
      {
        host: EUBFR_ES_ENDPOINT,
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        },
        path: `/${index}/${type}${path}`,
        method
      },
      body
    );

    if (
      elasticsearchRes.hits &&
      elasticsearchRes.hits.hits &&
      elasticsearchRes.hits.hits.length
    ) {
      elasticsearchRes.hits.hits.forEach(record => {
        centroidFields.forEach(centroidField => {
          const field = centroidField.split(".")[0];
          const locations = record._source[field];

          locations.forEach(location => {
            // This one is null if not present.
            if (location.centroid) {
              const { lon, lat } = location.centroid;
              geojson.features.push({
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [lon, lat]
                },
                properties: {
                  id: record._id,
                  computed_key: record._source.computed_key,
                  last_modified: record._source.last_modified,
                  ...location
                }
              });
            }
          });
        });
      });

      response.body = JSON.stringify(geojson);
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
