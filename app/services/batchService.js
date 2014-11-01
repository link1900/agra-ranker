var batchService = module.exports = {};

var _ = require('lodash');
var uuid = require('node-uuid');
var mongoose = require('mongoose');
var BatchJob = mongoose.model('BatchJob');
var constants = require('../constants');
var helper = require('../helper');
var mongoHelper = require('../mongoHelper');
var greyhoundService = require('../greyhound/greyhoundService');
var q = require('q');
var csv = require('csv');
var grid = require('gridfs-stream');
var gfs = grid(mongoose.connection.db);

batchService.states = {
    standby : 0,
    processing : 1,
    searching: 2,
    inactive : 3
};

batchService.batchTypes = {
    importGreyhoundCSV : "Import greyhound csv"
};

batchService.batchHandlers = {};

batchService.processes = [
    {
        id: uuid.v4(),
        name: "batch processor one",
        state : batchService.states.standby
    }
];

batchService.startBatchProcessors = function(){
    batchService.loadBatchHandlers();
    batchService.processes.forEach(function(process){
        console.log("["+process.name+"]" + " has been started");
        setInterval(batchService.processorTick, 5000, process);
    });

    console.log("[failed batch job checker]" + " has been started");
    setInterval(batchService.failedBatchJobChecker, 10000);
};

batchService.loadBatchHandlers = function(){
    batchService.batchHandlers[batchService.batchTypes.importGreyhoundCSV] = batchService.processGreyhoundCSV;
};

/**
 * Finds all in progress batch jobs and check they are being processed by a processor.
 * If no processor claims the batch job mark it as failed.
 */
batchService.failedCheckerState = batchService.states.standby;

batchService.failedBatchJobChecker = function(){
    if (batchService.failedCheckerState == batchService.states.standby){
        batchService.failedCheckerState = batchService.states.processing;
        //make debug console.log("[failed batch job checker] started looking for stuck batch jobs");
        mongoHelper.find(BatchJob, {status: constants.batchTypes.inProgress}).then(function(batchesInProgress){
            var proms = batchesInProgress.map(function(batchInProgress){
                if(!batchService.doesAnyProcessContainBatch(batchInProgress)){
                    //batch in progress that is not in a processor. mark it as failed
                    batchInProgress.status = constants.batchTypes.failed;
                    return helper.savePromise(batchInProgress).then(function(result){
                        console.log("[failed batch job checker] has marked batch job " +
                            " id: " + batchInProgress._id +
                            " name: " + batchInProgress.name +
                            " as Failed because nothing is processing it");
                        return result;
                    }, function(updateFailure){
                        batchService.failedCheckerState = batchService.states.standby;
                        console.log("[failed batch job checker] had an error trying to update a batch job to failed", updateFailure);
                    });
                } else {
                    return q(true);
                }
            });
            q.all(proms).then(function(){
                batchService.failedCheckerState = batchService.states.standby;
                //make debug console.log("[failed batch job checker] finished looking for stuck batch jobs");
            }, function(someError){
                console.log("[failed batch job checker] has had an error", someError);
                batchService.failedCheckerState = batchService.states.standby;
            });
        }, function(err){
            console.log("[failed batch job checker] has had an error", err);
            batchService.failedCheckerState = batchService.states.standby;
        });
    } else {
        console.log("[failed batch job checker] is busy did not fire at this time");
    }
};

batchService.doesAnyProcessContainBatch = function(batch){
    return _.any(batchService.processes, function(process){
         return batchService.doesProcessContainBatch(process, batch);
     });
};

batchService.doesProcessContainBatch = function(process, batch){
    return process.state == batchService.states.processing &&
        process.processingBatch != null &&
        _.isEqual(process.processingBatch._id, batch._id);
};

batchService.processorTick = function(processor){
    if (processor.state == batchService.states.standby){
        batchService.executeProcessor(processor);
    } else {
        console.log(processor.name + " is busy");
    }
};

batchService.executeProcessor = function(processor){
    processor.state = batchService.states.searching;
    //find a batch that requires processing
    var query = {status: constants.batchTypes.awaitingProcessing};
    var update = {status: constants.batchTypes.inProgress};
    var options = {sort : {createdAt : 1}};
    BatchJob.findOneAndUpdate(query, update, options, function(err, batchToProcess) {
        if (err) {
            console.log(processor.name + " had an error reading batch", err);
        } else if (batchToProcess != null) {
            console.log(processor.name + " started processing batch job " + batchToProcess.name);
            processor.state = batchService.states.processing;
            processor.processingBatch = batchToProcess;
            batchService.processBatch(processor.processingBatch).then(function(){
                console.log(processor.name + " finished processing batch job " + batchToProcess.name);
                batchToProcess.status = constants.batchTypes.completed;
                helper.savePromise(batchToProcess).then(function(){
                    batchService.clearProcessor(processor);
                }, function(){
                    console.log(processor.name + " had an error updating batch", err);
                    batchService.clearProcessor(processor);
                });
            }, function(batchProcessError){
                console.log(processor.name + " had an error processing batch job ", batchProcessError);
                batchToProcess.status = constants.batchTypes.failed;
                helper.savePromise(batchToProcess).then(function(){
                    batchService.clearProcessor(processor);
                }, function(){
                    console.log(processor.name + " had an error updating batch", err);
                    batchService.clearProcessor(processor);
                });
            });
        } else {
            //make debug console.log(processor.name + " found no batch jobs to process");
            batchService.clearProcessor(processor);
        }
    });
};

batchService.clearProcessor = function(processor){
    delete processor.processingBatch;
    processor.state = batchService.states.standby;
};

batchService.processBatch = function(batchJob){
    if (_.contains(_.keys(batchService.batchHandlers), batchJob.type)){
        return batchService.batchHandlers[batchJob.type](batchJob);
    } else {
        return q.reject("unknown batch of type: " + batchJob.type);
    }
};

batchService.processGreyhoundCSV = function(batchJob){
    var deferred = q.defer();
    if (batchJob.type != null &&
        batchJob.type == batchService.batchTypes.importGreyhoundCSV &&
        batchJob.metadata != null &&
        batchJob.metadata.fileId != null){
        //find the file and stream it in
        var fileReadStream = gfs.createReadStream({_id: batchJob.metadata.fileId});

        fileReadStream.on('error', function(fileReadError){
            console.log("error streaming from gridfs", fileReadError);
            deferred.reject(fileReadError);
        });

        var parser = csv.parse();

        parser.on('error', function(parserError){
            console.log("error parsing csv", parserError);
            deferred.reject(parserError);
        });

        var transformer = csv.transform(function(record, callback){
            var newGreyhound = greyhoundService.rawCsvArrayToGreyhound(record);
            greyhoundService.processGreyhoundImportObject(newGreyhound).then(function(){
                callback();
            }, function(importError){
                console.log("error import greyhound csv", importError);
                callback();
            });
        });

        transformer.on('error', function(transformError){
            console.log("error transforming csv", transformError);
            deferred.reject(transformError);
        });

        transformer.on('finish', function(){
            console.log("batch job is complete finish");
            deferred.resolve({results: true});
        });

        fileReadStream.pipe(parser).pipe(transformer);
    } else {
        deferred.reject({error: "batch job does not contain enough data to process"});
    }
    return deferred.promise;
};