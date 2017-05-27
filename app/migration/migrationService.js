const migrationService = module.exports = {};

const q = require('q');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const logger = require('winston');

const Migration = require('./migration').model;
const mongoService = require('../mongoService');
const migrationIndex = require('../migrations/migrationIndex');

migrationService.applyMigrations = function (migrationDir) {
    let migrations = migrationIndex.index;
    logger.log('info', 'Checking for migrations');
    if (migrations.length <= 0) {
        logger.log('info', 'No migrations');
        return q(true);
    }

    migrations = _.sortBy(migrations, (migration) => { return migration.sequence; });

    if (migrationService.validateMigrations(migrations, migrationDir)) {
        return migrationService.getAppliedMigrations().then((migrationsOnDatabase) => {
            const migrationsToRun = migrationService.getMigrationsToBeRun(migrationsOnDatabase, migrations);
            if (migrationsToRun.length > 0) {
                logger.log(`Applying ${migrationsToRun.length} migrations`);

                const finalPromiseOfChain = _.reduce(migrationsToRun, (previousResult, currentValue) => {
                    return previousResult.then(() => {
                        return migrationService.runMigration(currentValue, migrationDir);
                    });
                },
                    q()
                );

                return finalPromiseOfChain.then(() => {
                    logger.log('Finished applying migrations');
                    return q(true);
                }).fail((error) => {
                    logger.error(`Migration process failed: ${error}`);
                    return q(false);
                });
            } else {
                logger.log('No outstanding migrations');
                return q(true);
            }
        }, () => { return false; });
    } else {
        return q.reject(false);
    }
};

migrationService.getAppliedMigrations = function () {
    return mongoService.find(Migration, {});
};

migrationService.getMigrationsToBeRun = function (appliedMigrations, definedMigrations) {
    const appliedSeq = _.map(appliedMigrations, (migration) => { return migration.sequence; });
    const definedSeq = _.map(definedMigrations, (migration) => { return migration.sequence; });
    const lastAppliedMigration = _.max(appliedSeq);
    const migrationsSeqNotApplied = _.difference(definedSeq, appliedSeq);
    const migrationsSeqToBeRun = _.filter(migrationsSeqNotApplied, (seq) => {
        return seq > lastAppliedMigration;
    });
    return _.filter(definedMigrations, (migration) => {
        return _.includes(migrationsSeqToBeRun, migration.sequence);
    });
};

migrationService.validateMigrations = function (migrations, migrationDir) {
    // check that each entry is valid (it has a sequence number and file name and it exists)
    _.each(migrations, (migration) => {
        if (!migration.sequence) {
            logger.log('info', `migration index entry:\n ${JSON.stringify(migration, null, 2)}\n Is invalid because it does not contain a sequence value`);
            process.exit(1);
        }

        if (typeof migration.sequence !== 'number') {
            logger.log('info', `migration index entry:\n ${JSON.stringify(migration, null, 2)}\n Is invalid because the sequence value is not a number`);
            process.exit(1);
        }

        if (!migration.file) {
            logger.log('info', `migration index entry: \n${JSON.stringify(migration, null, 2)}\n Is invalid because it does not contain a file value`);
            process.exit(1);
        }
        const migrationRefPath = path.join(migrationDir, migration.file);
        if (!fs.existsSync(migrationRefPath)) {
            logger.log('info', `migration index entry:\n ${JSON.stringify(migration, null, 2)}\n Is invalid because the the file ${migration.file} cannot be found`);
            process.exit(1);
        }
    });

    // check that the sequence is following a logical order
    let lastSeq = 0;
    _.each(migrations, (migration) => {
        if (migration.sequence <= lastSeq) {
            logger.log('info', 'migration index contains invalid sequence:');
            logger.log('info', `entry: \n${JSON.stringify(migration, null, 2)}\n has a sequence of ${migration.sequence} and previous entry has a sequence of ${lastSeq}`);
            process.exit(1);
        }
        lastSeq = migration.sequence;
    });

    return true;
};

migrationService.runMigration = function (migration, migrationDir) {
    const migrationRefPath = path.join(migrationDir, migration.file);
    const migrationCode = require(migrationRefPath);
    logger.log('info', `Applying migration: ${migration.file}`);
    return migrationCode.up().then(() => {
        logger.log('info', `Applied migration: ${migration.file}`);
        return mongoService.savePromise(new Migration(migration));
    }).fail((err) => {
        logger.error(`migration ${migration.file} failed`, err);
        process.exit(1);
    });
};
