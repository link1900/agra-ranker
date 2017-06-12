import { expect } from 'chai';
import mongoose from 'mongoose';
import { createMongoLoader, createLoaderForMongooseModel } from '../../common/mongoDataLoaderHelper';
import { clearMongoDatabase } from '../../common/mongoHelper';

const Schema = mongoose.Schema;
const TestEntity = mongoose.model('TestEntity', new Schema({ name: { type: String } }));

describe('mongoDataLoaderHelperTests', () => {
    beforeEach(() => {
        return clearMongoDatabase();
    });

    async function setupData() {
        const testEntity1 = await new TestEntity({
            name: 'someEntityName1'
        }).save();

        const testEntity2 = await new TestEntity({
            name: 'someEntityName2'
        }).save();

        return {
            testEntity1,
            testEntity2
        };
    }

    describe('#createMongoLoader', () => {
        it('mongo loader can run queries', async () => {
            const { testEntity1 } = await setupData();
            const mongoLoader = createMongoLoader();
            const result = await mongoLoader.load({ model: TestEntity, query: { name: 'someEntityName1' } });
            expect(result).to.not.equal(null);
            expect(result.length).to.equal(1);
            expect(result[0]._id.toString()).to.equal(testEntity1._id.toString());
            return true;
        });
    });

    describe('#createLoaderForMongooseModel', () => {
        it('#query', async () => {
            const { testEntity1 } = await setupData();
            const mongoLoader = createMongoLoader();
            const testEntityLoader = createLoaderForMongooseModel(mongoLoader, TestEntity);
            const result = await testEntityLoader.query({ name: 'someEntityName1' });
            expect(result).to.not.equal(null);
            expect(result.length).to.equal(1);
            expect(result[0]._id.toString()).to.equal(testEntity1._id.toString());
        });

        it('#load', async () => {
            const { testEntity1 } = await setupData();
            const mongoLoader = createMongoLoader();
            const testEntityLoader = createLoaderForMongooseModel(mongoLoader, TestEntity);
            const result = await testEntityLoader.load(testEntity1._id.toString());
            expect(result).to.not.equal(null);
            expect(result._id.toString()).to.equal(testEntity1._id.toString());
        });

        it('#loadMany', async () => {
            const { testEntity1, testEntity2 } = await setupData();
            const mongoLoader = createMongoLoader();
            const testEntityLoader = createLoaderForMongooseModel(mongoLoader, TestEntity);
            const result = await testEntityLoader.loadMany([testEntity1._id.toString(), testEntity2._id.toString()]);
            expect(result).to.not.equal(null);
            expect(result.length).to.equal(2);
        });

        it('#create', async () => {
            const mongoLoader = createMongoLoader();
            const testEntityLoader = createLoaderForMongooseModel(mongoLoader, TestEntity);
            const result = await testEntityLoader.create({ name: 'createdTestEntity' });
            expect(result).to.not.equal(null);
            expect(result.name).to.equal('createdTestEntity');
            const lookup = await TestEntity.find({ name: 'createdTestEntity' });
            expect(lookup[0]._id.toString()).to.equal(result._id.toString());
        });

        it('#update', async () => {
            const { testEntity1 } = await setupData();
            const mongoLoader = createMongoLoader();
            const testEntityLoader = createLoaderForMongooseModel(mongoLoader, TestEntity);
            testEntity1.name = 'updatedTestEntity';
            const result = await testEntityLoader.update(testEntity1);
            expect(result).to.not.equal(null);
            expect(result.name).to.equal('updatedTestEntity');
            expect(result._id.toString()).to.equal(testEntity1._id.toString());
            const lookup = await TestEntity.find({ name: 'updatedTestEntity' });
            expect(lookup[0]._id.toString()).to.equal(result._id.toString());
        });
    });
});
