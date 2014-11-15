var allowedUser = module.exports = {};

var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;

allowedUser.definition = {
    email: { type: String }
};

allowedUser.schema = new Schema(allowedUser.definition);

allowedUser.schema.plugin(timestamps);

allowedUser.model = mongoose.model('AllowedUser', allowedUser.schema);