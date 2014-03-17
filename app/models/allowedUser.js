var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;


var AllowedUserSchema = new Schema({
    email: { type: String }
});

AllowedUserSchema.plugin(timestamps);

mongoose.model('AllowedUser', AllowedUserSchema);