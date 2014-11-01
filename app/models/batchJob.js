var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;


var BatchJob = new Schema({
    name: { type: String },
    type: { type: String },
    status: { type: String},
    metadata : { type: Schema.Types.Mixed },
    processingTime : { type : Number }
});

//Awaiting processing
//Failed - job completely failed
//Cancelled - stopped before started
//In progress - is currently in progress
//Completed - means the job completed with 100% success
//Completed with failures - means the job completed but records failed

BatchJob.plugin(timestamps);

mongoose.model('BatchJob', BatchJob);