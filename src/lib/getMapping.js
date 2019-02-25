const request = require("./request");

const getMapping = async ({ index, type }) => {
  const { EUBFR_ES_ENDPOINT } = process.env;

  let mapping = {};

  try {
    mapping = await request({
      host: EUBFR_ES_ENDPOINT,
      path: `/${index}/_mapping/${type}`,
      method: "GET",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json"
      }
    });
  } catch (e) {
    throw e;
  }

  return mapping;
};

module.exports = getMapping;
