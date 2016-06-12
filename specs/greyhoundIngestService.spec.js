var testHelper = require('./testHelper');
var assert = require('assert');
var _ = require('lodash');
var greyhoundIngestService = require('../app/greyhound/greyhoundIngestService');

describe("greyhoundIngestService", function () {
    before(function (done) {
        testHelper.setup(done);
    });

    describe("#getYoungest", function () {
        var greyhounds = [{
            "status": "Retired",
            "color": "Brindle",
            "gender": "dog",
            "dateOfBirth": new Date("1986-02-03T13:00:00.000Z"),
            "sireName": "GEORGE BALE",
            "damName": "CENDREE",
            "nameAssignedAt": new Date("1988-04-12T14:00:00.000Z"),
            "ref": {
                "source": "fasttrack",
                "id": "-470995",
                "url": "https://fasttrack.grv.org.au/Dog/Details/-470995"
            }
        }, {
            "status": "Racing",
            "color": "Black",
            "gender": "dog",
            "dateOfBirth": new Date("2014-03-02T13:00:00.000Z"),
            "sireName": "BELLA INFRARED",
            "damName": "FYNA BALE",
            "nameAssignedAt": new Date("2015-11-25T13:00:00.000Z"),
            "ref": {
                "source": "fasttrack",
                "id": "839590074",
                "url": "https://fasttrack.grv.org.au/Dog/Details/839590074"
            }
        }];

        it("returns correct for retired and young greyhound", function () {
            return greyhoundIngestService.getYoungest(greyhounds).then(function (result) {
                assert.equal(result.sireName, 'BELLA INFRARED');
            });
        });

        it("returns correct for old and young greyhound", function () {
            var oldYoung = _.cloneDeep(greyhounds);
            oldYoung[0].status = "Racing";
            return greyhoundIngestService.getYoungest(oldYoung).then(function (result) {
                assert.equal(result.sireName, 'BELLA INFRARED');
            });
        });

        it("returns use date of birth when nameAssignedAt the same", function () {
            var sameDates = _.cloneDeep(greyhounds);
            sameDates[0].nameAssignedAt = sameDates[1].nameAssignedAt;
            return greyhoundIngestService.getYoungest(greyhounds).then(function (result) {
                assert.equal(result.sireName, 'BELLA INFRARED');
            });
        });

        it("returns use last when there are no dates", function () {
            var noDates = _.cloneDeep(greyhounds);
            noDates[0].nameAssignedAt = undefined;
            noDates[1].nameAssignedAt = undefined;
            return greyhoundIngestService.getYoungest(greyhounds).then(function (result) {
                assert.equal(result.sireName, 'BELLA INFRARED');
            });
        });
    });
});