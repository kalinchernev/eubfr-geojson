const https = require("https");

/**
 * Promisified version of node core https.request.
 * Supports only `https.request(options)` signature, NOT `https.request(url[, options])`
 * @see https://nodejs.org/api/https.html#https_https_request_options_callback
 * @param  {Object} options         Maps to https.request's options.
 * @param  {Any} [payload=null]     Use with POST requests.
 * @return {Object}                 JSON response.
 */
const request = (options, payload = null) =>
  new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let body = [];

      if (res.statusCode < 200 || res.statusCode >= 300) {
        reject(new Error(`statusCode=${res.statusCode}`));
      }

      res.on("data", chunk => {
        body.push(chunk);
      });

      res.on("end", () => {
        try {
          body = JSON.parse(Buffer.concat(body).toString());
        } catch (e) {
          reject(e);
        }

        resolve(body);
      });
    });

    req.on("error", err => reject(err));

    if (payload) {
      req.write(payload);
    }
    req.end();
  });

module.exports = request;
