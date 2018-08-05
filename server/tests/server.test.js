const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Checklist} = require('./../models/checklist');
const {User} = require('./../models/user');
const {mockChecklists, populateChecklists, users, populateUsers} = require('./seed/seed');

//before running any tests, clear the database and then save the mock users in the db
beforeEach(populateUsers);

//before running any tests, clear the database and insert the mock checklists 
beforeEach(populateChecklists);



describe('POST /checklists', () => {

    it('should create a new checklist', (done) => {
        const text = "dummy checklist";

        request(app)
            .post('/checklists')
            .set('x-auth', users[0].tokens[0].token)
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
            .set('x-auth', users[0].tokens[0].token)
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

    it('should fetch all the checklists of an user from the db', (done) => {

        request(app)
            .get('/checklists')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.checklists.length).toBe(1);
            })
            .end(done)
    });
});

describe('GET /checklists/:id', () => {

    it('should fetch the checklist for the given id', (done) => {

        request(app)
            .get(`/checklists/${mockChecklists[0]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.checklist.text).toBe(mockChecklists[0].text);
            })
            .end(done)
    });

    it('should not fetch the checklist for another user', (done) => {

        request(app)
            .get(`/checklists/${mockChecklists[0]._id.toHexString()}`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(404)
            .end(done)
    });

    it('should return a 404 if checklist not found', (done) => {

        request(app)
            .get(`/checklists/${new ObjectID().toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done)
    });

    it('should return a 404 if the given id is not a valid ObjectID', (done) => {

        request(app)
            .get('/checklists/123')
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done)
    });
});

describe('DELETE /checklists/:id', () => {

    xit('should delete the checklist for the given id', (done) => {

        request(app)
            .delete(`/checklists/${mockChecklists[1]._id.toHexString()}`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.checklist.text).toBe(mockChecklists[1].text);
            })
            .end((err, res) => {
                if(err){
                    return done(err);
                }
                Checklist.findById(mockChecklists[1]._id.toHexString())
                    .then((checklist) => {
                        expect(checklist).toNotExist();
                        done();
                }).catch((e) => done(e));
            })
    });

    it('should return a 404 if checklist not found', (done) => {

        request(app)
            .get(`/checklists/${new ObjectID().toHexString()}`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(404)
            .end(done)
    });

    it('should return a 404 if the given id is not a valid ObjectID', (done) => {

        request(app)
            .get('/checklists/123')
            .set('x-auth', users[1].tokens[0].token)
            .expect(404)
            .end(done)
    });
});

xdescribe('PATCH /checklists/id', () => {
    it('should update the checklist', (done) => {

        request(app)
            .patch(`/checklists/${mockChecklists[1]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
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

describe('POST users/login', () => {
    it('should login user and return an auth token', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: users[1].password
            })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist();
            })
            .end((err, res) => {
                if(err){
                    return done(err);
                }

                User.findById(users[1]._id).then((user) => {
                    expect(user.tokens[1]).toInclude({
                        access: 'auth',
                        token: res.header['x-auth']
                    });
                    done();
                }).catch((e) => done(e))
            })
    })

    it('should reject invalid login', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: '1@1.com',
                password: 'blabla'
            })
            .expect(400)
            .end(done)

    })
})

describe('DELETE users/me/token', () => {
    it('should delete the token from the tokens array', (done) => {

        request(app)
            .delete('/users/me/token')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .end((err, res) => {
                if(err){
                    return done(err);
                }

                User.findById(users[0]._id).then((user) => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch((e) => done(e))
            })
    })

    it('should return 401 error if token not found', (done) => {

        request(app)
            .delete('/users/me/token')
            .set('x-auth', 'blabalabla')
            .expect(401)
            .end(done)
    })
})