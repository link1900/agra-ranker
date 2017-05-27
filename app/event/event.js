const event = module.exports = {};
const mongoose = require('mongoose');
const timestamps = require('mongoose-concrete-timestamps');
const Schema = mongoose.Schema;

event.definition = {
    type: { type: String },
    data: { type: Schema.Types.Mixed },
    userRef: { type: String }
};

event.schema = new Schema(event.definition, { capped: 100000 });

event.schema.plugin(timestamps);

if (mongoose.models.Event) {
    event.model = mongoose.model('Event');
} else {
    event.model = mongoose.model('Event', event.schema);
}
