var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;


var GreyhoundSchema = new Schema({
  name: { type: String },
  sire: { type: Schema.Types.ObjectId},
  dam: { type: Schema.Types.ObjectId }
});

GreyhoundSchema.plugin(timestamps);

mongoose.model('Greyhound', GreyhoundSchema);