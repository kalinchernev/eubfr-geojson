const fs = require("fs");

const getMapping = require("./getMapping");
const reduceToGeoFields = require("./reduceToGeoFields");

const getGeoFields = async () => {
  const { INDEX: index, TYPE: type, CACHE_DIR: cacheDir } = process.env;

  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
  }

  let mapping = {};
  const geoFields = {};

  try {
    mapping = require(`${cacheDir}/Mapping.json`);
  } catch (e) {
    mapping = await getMapping({ index, type });
    fs.writeFileSync(`${cacheDir}/Mapping.json`, JSON.stringify(mapping));
  }

  const { properties } = mapping[index].mappings[type];

  reduceToGeoFields(properties, geoFields);

  return geoFields;
};

module.exports = getGeoFields;
