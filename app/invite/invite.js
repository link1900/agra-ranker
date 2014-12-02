var invite = module.exports = {};
var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;

invite.definition = {
    email: { type: String },
    token: {type: String},
    expiry : {type: Date}
};

invite.schema = new Schema(invite.definition);

invite.schema.set('toJSON', {
    transform: function(doc, ret) {
        delete ret.token;
        return ret;
    }
});

invite.schema.plugin(timestamps);

invite.model = mongoose.model('Invite', invite.schema);
