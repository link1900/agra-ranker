var migration = module.exports = {};

var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;

migration.definition = {
    file: {type: String},
    sequence: {type: Number}
};

migration.schema = new Schema(migration.definition);

migration.schema.plugin(timestamps);

migration.model = mongoose.model('Migration', migration.schema);