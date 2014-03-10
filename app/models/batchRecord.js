var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;


var BatchRecord = new Schema({
    batchRef: { type: Schema.Types.ObjectId },
    type: { type: String },
    rawData: { type: Schema.Types.Mixed },
    status: { type: String },
    processTime: { type: Number },
    recordNumber: {type: Number },
    resultRef: { type: Schema.Types.ObjectId }
});

//'Awaiting processing' - record has yet to be started
//Failed - record failed
//Success - record succeed
//In progress - is currently in progress


BatchRecord.plugin(timestamps);

mongoose.model('BatchRecord', BatchRecord);