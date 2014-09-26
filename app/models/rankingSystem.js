var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;

var allotmentCriteriaSchema = new Schema({
    field: {type: String},
    comparator:{type: String},
    value:{type: Schema.Types.Mixed},
    type:{type: String}
});

var pointAllotmentSchema = new Schema({
    criteria: {type: [allotmentCriteriaSchema]},
    points: {type: Number}
});

var RankingSystemSchema = new Schema({
    name: { type: String },
    description: {type: String},
    equalPositionResolution: {type: String},
    pointAllotments: {type: [pointAllotmentSchema]}
});

RankingSystemSchema.plugin(timestamps);

mongoose.model('RankingSystem', RankingSystemSchema);

//var a = {
//    "name": "Agra Rankings",
//    "description": "The main ranking system for agra",
//      equalPositionResolution: "splitPoints",
//    pointAllotments:[
//        {
//            criteria: [
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