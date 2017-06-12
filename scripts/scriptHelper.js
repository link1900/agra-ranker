const serverHelper = require('../app/serverHelper.js');

export async function runScriptSetup() {
    process.on('uncaughtException', (err) => {
        console.error(err.stack);
        process.exit(1);
    });

    let serverConfig = {};
    serverConfig = await serverHelper.setupExceptionHandling(serverConfig);
    serverConfig = await serverHelper.setupLogging(serverConfig);
    serverConfig = await serverHelper.loadConfig(serverConfig);
    serverConfig = await serverHelper.checkEnvs(serverConfig);
    serverConfig = await serverHelper.setupDatabaseConnection(serverConfig);
    return serverConfig;
}

export function runScript(scriptFunction) {
    scriptFunction().then(() => {
        process.exit(0);
    }).catch((err) => {
        console.error(err);
        process.exit(1);
    });
}
