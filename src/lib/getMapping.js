const request = require("./request");

const getMapping = async ({ index, type }) => {
  const { ES_PUBLIC_ENDPOINT } = process.env;

  let mapping = {};
  const endpoint = `${ES_PUBLIC_ENDPOINT}/${index}/_mapping/${type}`;

  try {
    mapping = await request(endpoint, {
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
