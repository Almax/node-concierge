import { expect } from 'chai';
import db from '../src/data/connection';

describe('Knex data sanitisation tests', () => {
    it('should sanitise where clauses to create identical statements', () => {
        var query1 = `select * from \"testTable\" where \"someColumn\" = 'someValue\\'; drop table \\'users\\';'`;
        var query2 = db('testTable').select().where('someColumn', `someValue'; drop table 'users';`);
        expect(query1).to.equal(query2.toString());
    });
});
