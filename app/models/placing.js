var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;

var PlacingSchema = new Schema({
    placing: { type: Number },
    raceRef: {type: Schema.Types.ObjectId},
    greyhoundRef: {type: Schema.Types.ObjectId}
});

PlacingSchema.plugin(timestamps);

mongoose.model('Placing', PlacingSchema);