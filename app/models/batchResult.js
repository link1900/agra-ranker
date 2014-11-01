var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;


var BatchResult = new Schema({
    batchRef: { type: Schema.Types.ObjectId },
    status: { type: String },
    processingTime: { type: Number },
    recordNumber: {type: Number },
    metadata: { type: Schema.Types.Mixed }
});

//statuses
//Failed - record failed
//Success - record succeed


BatchResult.plugin(timestamps);

mongoose.model('BatchResult', BatchResult);