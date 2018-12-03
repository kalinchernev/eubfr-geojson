const reduceToGeoFields = (inputObject, outputObject, field = "") => {
  Object.entries(inputObject).map(pair => {
    const [key, value] = pair;
    const fieldPath = field === "" ? key : `${field}.${key}`;

    if (value.type === "nested" || value.properties) {
      reduceToGeoFields(value.properties, outputObject, fieldPath);
    }

    if (value.type === "geo_point" || value.type === "geo_shape") {
      outputObject[fieldPath] = value;
    }
  });
};

module.exports = reduceToGeoFields;
