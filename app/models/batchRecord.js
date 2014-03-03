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

BatchRecord.plugin(timestamps);

mongoose.model('BatchRecord', BatchRecord);