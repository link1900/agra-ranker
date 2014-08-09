var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;

var placingFilterSchema = new Schema({
    field: {type: String},
    comparator:{type: String},
    value:{type: Schema.Types.Mixed}
});

var pointDefinitionSchema = new Schema({
    filters: {type: [placingFilterSchema]},
    points: {type: Number}
});

var RankingSystemSchema = new Schema({
    name: { type: String },
    description: {type: String},
    matchingStrategy: {type: String},
    pointDefinitions: {type: [pointDefinitionSchema]}
});

RankingSystemSchema.plugin(timestamps);

mongoose.model('RankingSystem', RankingSystemSchema);

//var a = {
//    "name": "Agra Rankings",
//    "description": "The main ranking system for agra",
//      matchingStrategy: "split,
//    pointDefinitions:[
//        {
//            filters: [
//                {field: "placing", "comparator": "=", "value": "1"},
//                {field: "race.date", "comparator": ">=", "value": "##currentFinancialYear.start"},
//                {field: "race.date", "comparator": "<=", "value": "##currentFinancialYear.end"},
//                {field: "race.groupLevel.name", "comparator": "=", "value": "Group 1"},
//                {field: "distanceMeters", "comparator": "<", "value": "715"},
//                {field: "disqualified", "comparator": "=", "value": false}
//            ],
//            points: 70
//        }
//    ]
//};