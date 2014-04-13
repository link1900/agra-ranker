var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;

var MigrationSchema = new Schema({
    file: {type: String},
    sequence: {type: Number}
});

MigrationSchema.plugin(timestamps);

mongoose.model('Migration', MigrationSchema);