const scriptStarter = module.exports = {};
const serverHelper = require('../app/serverHelper.js');

scriptStarter.runSetup = async () => {
    let serverConfig = {};
    serverConfig = await serverHelper.setupExceptionHandling(serverConfig);
    serverConfig = await serverHelper.setupLogging(serverConfig);
    serverConfig = await serverHelper.loadConfig(serverConfig);
    serverConfig = await serverHelper.checkEnvs(serverConfig);
    serverConfig = await serverHelper.setupDatabaseConnection(serverConfig);
    return serverConfig;
};
