var user = module.exports = {};
var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;
var crypto = require('crypto');

user.states = {
    "inactive": "Inactive",
    "active": "Active",
    "requested": "Requested Access"
};

user.definition = {
    email: {
        type: String,
        required: true
    },
    firstName: {type: String},
    lastName: {type: String},
    hashed_password: {type: String, required : true},
    provider: {type: String, required : true, default: 'local'},
    salt: String,
    state: {type: String, required: true, default: user.states.requested},
    passwordReset : {
        tokenCreated : {type: Date},
        token : {type : String},
        expirationDate : {type: Date}
    },
    facebook: {},
    twitter: {},
    github: {},
    google: {},
    linkedin: {}
};

user.schema = new Schema(user.definition);

user.schema.set('toJSON', {
    transform: function(doc, ret) {
        delete ret.hashed_password;
        delete ret.salt;
        delete ret.provider;
        delete ret.passwordReset;
        return ret;
    }
});

/**
 * Virtuals
 */
user.schema.virtual('password').set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
}).get(function() {
    return this._password;
});

/**
 * Validations
 */
var validatePresenceOf = function(value) {
    return value && value.length;
};

user.schema.path('email').validate(function(email) {
    return (typeof email === 'string' && email.length > 0);
}, 'Email cannot be blank');

user.schema.path('hashed_password').validate(function(hashed_password) {
    return (typeof hashed_password === 'string' && hashed_password.length > 0);
}, 'Password cannot be blank');


/**
 * Pre-save hook
 */
user.schema.pre('save', function(next) {
    if (this.isNew && !validatePresenceOf(this.password)){
        return next(new Error('Invalid password'));
    } else {
        return next();
    }
});

/**
 * Methods
 */
user.schema.methods = {
    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */
    authenticate: function(plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },

    /**
     * Make salt
     *
     * @return {String}
     * @api public
     */
    makeSalt: function() {
        return crypto.randomBytes(16).toString('base64');
    },

    /**
     * Encrypt password
     *
     * @param {String} password
     * @return {String}
     * @api public
     */
    encryptPassword: function(password) {
        if (!password || !this.salt) return '';
        var salt = new Buffer(this.salt, 'base64');
        return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
    }
};

user.schema.plugin(timestamps);

user.model = mongoose.model('User', user.schema);