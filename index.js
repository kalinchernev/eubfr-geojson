const fs = require("fs");
require("dotenv").config();

const getGeoFields = require("./lib/getGeoFields");

(async () => {
  let geoFields = {};

  try {
    geoFields = require("./.cache/GeoFields.json");
  } catch (e) {
    geoFields = await getGeoFields();
    fs.writeFileSync("./.cache/GeoFields.json", JSON.stringify(geoFields));
  }

  console.log(geoFields);
})();
