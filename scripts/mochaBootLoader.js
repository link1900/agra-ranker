import winston from 'winston';

process.on('uncaughtException', (err) => {
    console.error(err.stack);
    process.exit(1);
});
if (winston.default.transports.console) {
    winston.remove(winston.transports.Console);
}
