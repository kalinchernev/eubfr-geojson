const fs = require("fs");

const getMapping = require("./getMapping");
const reduceToGeoFields = require("./reduceToGeoFields");

const getGeoFields = async () => {
  const { INDEX: index, TYPE: type } = process.env;

  let mapping = {};
  const geoFields = {};

  try {
    mapping = require("./.cache/Mapping.json");
  } catch (e) {
    mapping = await getMapping({ index, type });
    fs.writeFileSync("./.cache/Mapping.json", JSON.stringify(mapping));
  }

  const { properties } = mapping[index].mappings[type];

  reduceToGeoFields(properties, geoFields);

  return geoFields;
};

module.exports = getGeoFields;
