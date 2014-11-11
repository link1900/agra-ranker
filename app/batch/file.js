var file = module.exports = {};
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

file.definition = {
    "filename": { type: String },
    "length" : {type: Number},
    "chunkSize" : {type: Number},
    "uploadDate" : {type: Date},
    "aliases" : { type: String },
    "metadata" : { type: String },
    "md5" : { type: String }
};

file.schema = new Schema(file.definition);

file.model = mongoose.model('fs.file', file.schema);
