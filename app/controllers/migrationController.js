'use strict';

var controller = module.exports = {};

var mongoose = require('mongoose');
var Migration = mongoose.model('Migration');
var _ = require('lodash');
var helper = require('../helper');
var mongoHelper = require('../mongoHelper');
var q = require('q');
var path = require('path');
var fs = require('fs');
var migrationIndex = require('../migrations/migrationIndex');

controller.applyMigrations = function(migrationDir) {
    var migrations = migrationIndex.index;
    console.log("Checking for migrations");
    if (migrations.length <= 0){
        console.log("migration index does not list any migrations for " + app.name + " skipping migrations");
        return false;
    }

    migrations = _.sortBy(migrations, function(migration){ return migration.sequence; });

    if (controller.validateMigrations(migrations, migrationDir)){
        return controller.getAppliedMigrations().then(function(migrationsOnDatabase){
            var migrationsToRun = controller.getMigrationsToBeRun(migrationsOnDatabase, migrations);
            if (migrationsToRun.length > 0){
                console.log("Applying " + migrationsToRun.length + " migrations");

                var finalPromiseOfChain = _.reduce(migrationsToRun, function(previousResult, currentValue) {
                        return previousResult.then(function(){
                            return controller.runMigration(currentValue, migrationDir);
                        });
                    },
                    q()
                );

                return finalPromiseOfChain.then(function(){
                    console.log("Finished applying migrations");
                    return q(true);
                }).fail(function(error){
                    console.error("Migration process failed: " + error);
                    return q(false);
                });
            } else {
                console.log("No outstanding migrations");
                return q(true);
            }
        }, function(){return false});
    } else {
        return q.reject(false);
    }
};

controller.getAppliedMigrations = function(){
    var query = Migration.find({});
    return mongoHelper.find(Migration, {});
};

controller.getMigrationsToBeRun = function(appliedMigrations, definedMigrations){
    var appliedSeq = _.map(appliedMigrations, function(migration){return migration.sequence;});
    var definedSeq = _.map(definedMigrations, function(migration){return migration.sequence;});
    var lastAppliedMigration = _.max(appliedSeq);
    var migrationsSeqNotApplied = _.difference(definedSeq,appliedSeq);
    var migrationsSeqToBeRun = _.filter(migrationsSeqNotApplied, function(seq){
        return seq > lastAppliedMigration;
    });
    return _.filter(definedMigrations, function(migration){
        return _.contains(migrationsSeqToBeRun, migration.sequence);
    });
};

controller.validateMigrations = function(migrations, migrationDir){
    //check that each entry is valid (it has a sequence number and file name and it exists)
    _.each(migrations, function(migration){
        if (!migration.sequence){
            console.log("migration index entry:\n " + JSON.stringify(migration, null, 2) + "\n Is invalid because it does not contain a sequence value");
            process.exit(1);
        }

        if (typeof migration.sequence !== 'number'){
            console.log("migration index entry:\n " + JSON.stringify(migration, null, 2) + "\n Is invalid because the sequence value is not a number");
            process.exit(1);
        }

        if (!migration.file){
            console.log("migration index entry: \n" + JSON.stringify(migration, null, 2) + "\n Is invalid because it does not contain a file value");
            process.exit(1);
        }
        var migrationRefPath = path.join(migrationDir, migration.file);
        if (!fs.existsSync(migrationRefPath)){
            console.log("migration index entry:\n " + JSON.stringify(migration, null, 2) + "\n Is invalid because the the file " + migration.file + " cannot be found");
            process.exit(1);
        }
    });

    //check that the sequence is following a logical order
    var lastSeq = 0;
    _.each(migrations, function(migration){
        if (migration.sequence <= lastSeq){
            console.log("migration index contains invalid sequence:");
            console.log("entry: \n" + JSON.stringify(migration, null, 2) + "\n has a sequence of " + migration.sequence + " and previous entry has a sequence of " + lastSeq);
            process.exit(1);
        }
        lastSeq = migration.sequence;
    });

    return true;
};

controller.runMigration = function(migration, migrationDir){
    var migrationRefPath = path.join(migrationDir, migration.file);
    var migrationCode = require(migrationRefPath);
    return migrationCode.up().then(function(){
        console.log("Applying migration: " + migration.file);
        return mongoHelper.savePromise(new Migration(migration));
    }).fail(function(){
        console.error("migration " + migration + " failed");
        process.exit(1);
    });
};