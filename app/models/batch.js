var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;


var Batch = new Schema({
    name: { type: String },
    type: { type: String },
    status: { type: String},
    processTime : { type : Number },
    successCount: { type: Number },
    failureCount : {type: Number}
});

//Awaiting processing - job has yet to be started
//Failed - job completely failed
//Cancelled - stopped before started
//In progress - is currently in progress
//Completed - means the job completed with 100% success
//Completed with failures - means the job completed but records failed

Batch.plugin(timestamps);

mongoose.model('Batch', Batch);