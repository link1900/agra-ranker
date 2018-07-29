const envConfigController = (module.exports = {});
const _ = require("lodash");

envConfigController.gatherEnvironmentVariables = function() {
  const envVarsKeys = ["AUTH0_CALLBACK_URL", "AUTH0_CLIENT_ID", "AUTH0_DOMAIN", "AUTH0_AUDIENCE"];
  const envVarObject = {};
  envVarsKeys.forEach(function(key) {
    const lookup = process.env[key];
    if (lookup != null && lookup.toString().length > 0) {
      envVarObject[key] = lookup;
    }
  });
  return envVarObject;
};

envConfigController.renderEnvironmentFile = function() {
  const start = "var envConfig = {};";
  const body = _.map(envConfigController.gatherEnvironmentVariables(), function(
    value,
    key
  ) {
    return "envConfig['" + key + "'] = '" + value + "';";
  }).join("");
  return start + body;
};

envConfigController.getEnvironmentFile = function(req, res) {
  res.header("Content-Type", "text/javascript");
  res.header("Cache-Control", "public, max-age=0, no-cache");
  res.send(envConfigController.renderEnvironmentFile());
};
