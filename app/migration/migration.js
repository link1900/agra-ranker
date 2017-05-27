const migration = module.exports = {};

const mongoose = require('mongoose');
const timestamps = require('mongoose-concrete-timestamps');
const Schema = mongoose.Schema;

migration.definition = {
    file: { type: String },
    sequence: { type: Number }
};

migration.schema = new Schema(migration.definition);

migration.schema.plugin(timestamps);

migration.model = mongoose.model('Migration', migration.schema);
