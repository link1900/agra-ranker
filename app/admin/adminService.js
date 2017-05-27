const adminService = module.exports = {};

const _ = require('lodash');
const q = require('q');
const mongoose = require('mongoose');

const raceService = require('../race/raceService');
const greyhoundService = require('../greyhound/greyhoundService');
const placingService = require('../placing/placingService');
const Setting = require('../setting/setting').model;
const mongoService = require('../mongoService');

const Ranking = mongoose.model('Ranking');
const Score = mongoose.model('Score');
const RankingSystem = mongoose.model('RankingSystem');


adminService.removeAllGreyhounds = function () {
    return placingService.removeAll({}).then(() => {
        return greyhoundService.removeAll({});
    });
};

adminService.removeAllRaces = function () {
    return placingService.removeAll({}).then(() => {
        return raceService.removeAll({});
    });
};

adminService.removeAllRankingSystems = function () {
    return mongoService.dropCollection(Ranking).then(() => {
        return mongoService.dropCollection(RankingSystem);
    });
};

adminService.removeAllRankings = function () {
    return mongoService.dropCollection(Score).then(() => {
        return mongoService.dropCollection(Ranking);
    });
};

adminService.setupSireRankingSystem = function () {
    // sire
    const sireRanking = {
        name: 'Sire',
        description: 'Sire based rankings',
        equalPositionResolution: 'splitPoints',
        groupBy: {
            label: 'greyhound.sireName',
            field: 'greyhound.sireRef'
        },
        pointAllotments: [],
        commonCriteria: [
            { field: 'race.disqualified', comparator: '=', value: false, type: 'Boolean' },
            { field: 'greyhound.sireRef', comparator: 'exists', value: true, type: 'Boolean' }
        ]
    };

    // sprint group
    const group1Sire = [{ field: 'race.groupLevelName', comparator: '=', value: 'Group 1', type: 'Text' }];
    const group2Sire = [{ field: 'race.groupLevelName', comparator: '=', value: 'Group 2', type: 'Text' }];
    const group3Sire = [{ field: 'race.groupLevelName', comparator: '=', value: 'Group 3', type: 'Text' }];
    sireRanking.pointAllotments = sireRanking.pointAllotments
        .concat(adminService.generateAllotmentSet([70, 35, 20, 15, 10, 8, 7, 6], group1Sire))
        .concat(adminService.generateAllotmentSet([40, 25, 15, 10, 8, 7, 6, 5], group2Sire))
        .concat(adminService.generateAllotmentSet([25, 16, 12, 8, 6, 5, 4, 3], group3Sire));

    return mongoService.saveAll([new RankingSystem(sireRanking)]);
};

adminService.setupDamRankingSystem = function () {
    // dam
    const damRanking = {
        name: 'Dam',
        description: 'Dam based rankings',
        equalPositionResolution: 'splitPoints',
        groupBy: {
            label: 'greyhound.damName',
            field: 'greyhound.damRef'
        },
        pointAllotments: [],
        commonCriteria: [
            { field: 'race.disqualified', comparator: '=', value: false, type: 'Boolean' },
            { field: 'greyhound.damRef', comparator: 'exists', value: true, type: 'Boolean' }
        ]
    };

    // dam group
    const group1Dam = [{ field: 'race.groupLevelName', comparator: '=', value: 'Group 1', type: 'Text' }];
    const group2Dam = [{ field: 'race.groupLevelName', comparator: '=', value: 'Group 2', type: 'Text' }];
    const group3Dam = [{ field: 'race.groupLevelName', comparator: '=', value: 'Group 3', type: 'Text' }];
    damRanking.pointAllotments = damRanking.pointAllotments
        .concat(adminService.generateAllotmentSet([6, 4, 3, 1, 1, 1, 1, 1], group1Dam))
        .concat(adminService.generateAllotmentSet([4, 3, 2, 1, 1, 1, 1, 1], group2Dam))
        .concat(adminService.generateAllotmentSet([4, 3, 2, 1, 1, 1, 1, 1], group3Dam));
    return mongoService.saveAll([new RankingSystem(damRanking)]);
};

adminService.setupDefaultRankingSystem = function () {
    const agraRanker = {
        name: 'Greyhounds',
        description: 'The main ranking system for agra',
        equalPositionResolution: 'splitPoints',
        groupBy: {
            label: 'greyhound.name',
            field: 'greyhoundRef'
        },
        pointAllotments: [],
        commonCriteria: [
            { field: 'race.disqualified', comparator: '=', value: false, type: 'Boolean' }
        ]
    };

    // sprint group
    const baseSprint = [{ field: 'race.distanceMeters', comparator: '<', value: 595, type: 'Number' }];
    const group1Sprint = [{ field: 'race.groupLevelName', comparator: '=', value: 'Group 1', type: 'Text' }].concat(baseSprint);
    const group2Sprint = [{ field: 'race.groupLevelName', comparator: '=', value: 'Group 2', type: 'Text' }].concat(baseSprint);
    const group3Sprint = [{ field: 'race.groupLevelName', comparator: '=', value: 'Group 3', type: 'Text' }].concat(baseSprint);
    agraRanker.pointAllotments = agraRanker.pointAllotments
        .concat(adminService.generateAllotmentSet([70, 35, 20, 15, 10, 8, 7, 6], group1Sprint))
        .concat(adminService.generateAllotmentSet([40, 25, 15, 10, 8, 7, 6, 5], group2Sprint))
        .concat(adminService.generateAllotmentSet([25, 16, 12, 8, 6, 5, 4, 3], group3Sprint));

    // stay groups
    const baseStay = [{ field: 'race.distanceMeters', comparator: '>=', value: 595, type: 'Number' }];
    const group1Stay = [{ field: 'race.groupLevelName', comparator: '=', value: 'Group 1', type: 'Text' }].concat(baseStay);
    const group2Stay = [{ field: 'race.groupLevelName', comparator: '=', value: 'Group 2', type: 'Text' }].concat(baseStay);
    const group3Stay = [{ field: 'race.groupLevelName', comparator: '=', value: 'Group 3', type: 'Text' }].concat(baseStay);
    agraRanker.pointAllotments = agraRanker.pointAllotments
        .concat(adminService.generateAllotmentSet([50, 25, 16, 12, 8, 6, 4, 2], group1Stay))
        .concat(adminService.generateAllotmentSet([30, 20, 12, 8, 6, 4, 2, 1], group2Stay))
        .concat(adminService.generateAllotmentSet([20, 14, 10, 6, 4, 3, 2, 1], group3Stay));

    return mongoService.saveAll([new RankingSystem(agraRanker)]);
};

adminService.setupRankingSystemDefaults = function () {
    return adminService.removeAllRankingSystems()
        .then(adminService.setupDefaultRankingSystem)
        .then(adminService.setupSireRankingSystem)
        .then(adminService.setupDamRankingSystem)
        .then(() => {
            return adminService.setupDefaultSettings();
        });
};

adminService.setupDefaultSettings = function () {
    const settings = { settingType: 'system' };

    return mongoService.findOne(RankingSystem, { name: 'Greyhounds' }).then((one) => {
        if (one != null && one._id != null) {
            settings.defaultRankingSystem = one._id.toString();
            return mongoService.dropCollection(Setting).then(() => {
                return mongoService.saveAll([new Setting(settings)]);
            });
        } else {
            return q();
        }
    });
};

adminService.generateAllotmentSet = function (pointArray, defaultCriteria) {
    return pointArray.map((pointValue, index) => {
        const newCriteria = defaultCriteria.slice();
        newCriteria.push({ field: 'placing', comparator: '=', value: (index + 1).toString(), type: 'Text' });
        return {
            points: pointValue,
            criteria: newCriteria
        };
    });
};

adminService.getAllCounts = function () {
    const proms = [
        greyhoundService.count().then((count) => {
            return { greyhound: count };
        }),
        placingService.count().then((count) => {
            return { placing: count };
        }),
        raceService.count().then((count) => {
            return { race: count };
        }),
        mongoService.getCollectionCount(RankingSystem).then((count) => {
            return { rankingSystem: count };
        })
    ];

    return q.allSettled(proms).then((results) => {
        const counts = results.map((promResult) => { return promResult.value; });
        return counts.reduce((previousValue, currentValue) => {
            return _.merge(previousValue, currentValue);
        }, {});
    });
};
