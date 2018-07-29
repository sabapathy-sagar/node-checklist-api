const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

describe('POST /todos', () => {

    //clear the database before running any tests
    beforeEach((done) => {
        Todo.remove({}).then(() => done());
    })

    it('should create a new todo', (done) => {
        const text = "dummy todo";

        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err,res) => {
                if(err){
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((e) => done(e));
            })
    });

    it('should not create a todo with invalid body data', (done) => {
        const text = null;

        request(app)
            .post('/todos')
            .send({text})
            .expect(400)
            .end((err,res) => {
                if(err){
                    return done(err);
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(0);
                    done();
                }).catch((e) => done(e));
            })
    });
});