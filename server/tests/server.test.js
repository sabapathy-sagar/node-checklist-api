const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Checklist} = require('./../models/checklist');

describe('POST /checklists', () => {

    //clear the database before running any tests
    beforeEach((done) => {
        Checklist.remove({}).then(() => done());
    })

    it('should create a new checklist', (done) => {
        const text = "dummy checklist";

        request(app)
            .post('/checklists')
            .send({text})
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err,res) => {
                if(err){
                    return done(err);
                }

                Checklist.find().then((checklists) => {
                    expect(checklists.length).toBe(1);
                    expect(checklists[0].text).toBe(text);
                    done();
                }).catch((e) => done(e));
            })
    });

    it('should not create a checklist with invalid body data', (done) => {
        const text = null;

        request(app)
            .post('/checklists')
            .send({text})
            .expect(400)
            .end((err,res) => {
                if(err){
                    return done(err);
                }
                Checklist.find().then((checklists) => {
                    expect(checklists.length).toBe(0);
                    done();
                }).catch((e) => done(e));
            })
    });
});