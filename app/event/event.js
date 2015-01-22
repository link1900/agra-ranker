var event = module.exports = {};
var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;

event.definition = {
    type: {type: String},
    data : {type: Schema.Types.Mixed},
    userRef : {type: String}
};

event.schema = new Schema(event.definition);

event.schema.plugin(timestamps);

event.model = mongoose.model('Event', event.schema);
