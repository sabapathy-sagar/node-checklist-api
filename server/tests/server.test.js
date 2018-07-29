const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Checklist} = require('./../models/checklist');

const mockChecklists = [
    {
        _id: new ObjectID(),
        text: "first checklist"
    },
    {
        _id: new ObjectID(),
        text: "sec checklist",
        completed: false
    }
]

//clear the database and insert the mock checklists before running any tests
beforeEach((done) => {
    Checklist.remove().then(() => {
        Checklist.insertMany(mockChecklists)
            .then(() => done())
    });
})

describe('POST /checklists', () => {

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

                Checklist.find({text}).then((checklists) => {
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
                    expect(checklists.length).toBe(2);
                    done();
                }).catch((e) => done(e));
            })
    });
});

describe('GET /checklists', () => {

    it('should fetch all the checklists from the db', (done) => {

        request(app)
            .get('/checklists')
            .expect(200)
            .expect((res) => {
                expect(res.body.checklists.length).toBe(2);
            })
            .end(done)
    });
});

describe('GET /checklists/id', () => {

    it('should fetch the checklist for the given id', (done) => {

        request(app)
            .get(`/checklists/${mockChecklists[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.checklist.text).toBe(mockChecklists[0].text);
            })
            .end(done)
    });

    it('should return a 404 if checklist not found', (done) => {

        request(app)
            .get(`/checklists/${new ObjectID().toHexString()}`)
            .expect(404)
            .end(done)
    });

    it('should return a 404 if the given id is not a valid ObjectID', (done) => {

        request(app)
            .get('/checklists/123')
            .expect(404)
            .end(done)
    });
});

describe('DELETE /checklists/id', () => {

    it('should delete the checklist for the given id', (done) => {

        request(app)
            .delete(`/checklists/${mockChecklists[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.checklist.text).toBe(mockChecklists[0].text);
            })
            .end((err, res) => {
                if(err){
                    return done(err);
                }
                Checklist.findById(mockChecklists[0]._id.toHexString())
                    .then((checklist) => {
                        expect(checklist).toNotExist();
                        done();
                }).catch((e) => done(e));
            })
    });

    it('should return a 404 if checklist not found', (done) => {

        request(app)
            .get(`/checklists/${new ObjectID().toHexString()}`)
            .expect(404)
            .end(done)
    });

    it('should return a 404 if the given id is not a valid ObjectID', (done) => {

        request(app)
            .get('/checklists/123')
            .expect(404)
            .end(done)
    });
});

describe('PATCH /checklists/id', () => {
    it('should update the checklist', (done) => {

        request(app)
            .patch(`/checklists/${mockChecklists[1]._id.toHexString()}`)
            .send({completed: true})
            .expect(200)
            .expect((res) => {
                expect(res.body.checklist.completed).toBe(true);
            })
            .end(done)
    })

    it('should clear completedAt when checklist is not completed', (done) => {

        request(app)
            .patch(`/checklists/${mockChecklists[1]._id.toHexString()}`)
            .send({completed: false})
            .expect(200)
            .expect((res) => {
                expect(res.body.checklist.completedAt).toBe(null);
            })
            .end(done)
    })

})