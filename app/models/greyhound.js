var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var GreyhoundSchema = new Schema({
  name: { type: String },
  sire: { type: Schema.Types.ObjectId},
  dam: { type: Schema.Types.ObjectId }
});

mongoose.model('Greyhound', GreyhoundSchema);