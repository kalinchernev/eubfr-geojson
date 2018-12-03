const request = require("./request");

const getMapping = async ({ index, type }) => {
  const { ES_PUBLIC_ENDPOINT } = process.env;

  let mapping = {};

  try {
    mapping = await request({
      host: ES_PUBLIC_ENDPOINT,
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
