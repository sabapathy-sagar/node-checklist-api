const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Checklist} = require('./../../models/checklist');
const {User} = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [
    {
        _id: userOneId,
        email: 'a@a.com',
        password: 'abc1234',
        tokens: [
            {
                access: 'auth',
                token: jwt.sign({_id:userOneId, access:'auth'}, 'abc123').toString()
            }
        ]
    },
    {
        _id: userTwoId,
        email: 'b@b.com',
        password: 'xyz1234'
    }
]

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

const populateChecklists = (done) => {
    Checklist.remove({}).then(() => {
        return Checklist.insertMany(mockChecklists)
    }).then(() => done());
}

const populateUsers = (done) => {
    User.remove({}).then(() => {
      var userOne = new User(users[0]).save();
      var userTwo = new User(users[1]).save();
  
      return Promise.all([userOne, userTwo])
    }).then(() => done());
  };

module.exports = {
    mockChecklists,
    populateChecklists,
    users,
    populateUsers
}

