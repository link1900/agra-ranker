var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;


var GreyhoundSchema = new Schema({
  name: { type: String },
  sireRef: { type: Schema.Types.ObjectId },
  damRef: { type: Schema.Types.ObjectId }
});

GreyhoundSchema.plugin(timestamps);

mongoose.model('Greyhound', GreyhoundSchema);