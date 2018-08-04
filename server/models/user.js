const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

//when using instance or model methods, do not use arrow functions.
//Arrow functions do not have access to the other attributes and methods on the object through the 'this' binding

//override the instance method toJSON in order not to send the token in the POST response
UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email']);
};

//a new instance method in the UserSchema to generate token
UserSchema.methods.generateAuthToken = function () {
//instance methods get called with the individual document
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

  user.tokens = user.tokens.concat([{access, token}]);

  return user.save().then(() => {
    return token;
  });
};

//a new model method findByToken to get the token
UserSchema.statics.findByToken = function(token){
    //model methods get called with the model 
    var User = this;
    var decode;
    
    try{
        decode = jwt.verify(token, 'abc123');
    } catch(e){
        //on error return a promise that always rejects
        return Promise.reject();
    }

    return User.findOne({
        '_id': decode._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
}

//a new model method to get user data based on email & password (credentials)
UserSchema.statics.findByCredentials = function(email, password) {
  var User = this;

  return User.findOne({email})
    .then((user) => {
      if(!user){
        return Promise.reject();
      }

      return new Promise((resolve, reject) => {
        //compare if password received from POST is the same as the hashed password stored in the db
        bcrypt.compare(password, user.password, (err, res) => {
          if(res){
            return resolve(user);
          }
          return reject();
        })
        
      })

    });
}

//mongoose middleware to encrypt password before saving it to the db
UserSchema.pre('save', function(next){
  var user = this;
    //encrypt only the password
    if(user.isModified('password')){
        bcrypt.genSalt(10, (err,salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            })
        })
    } else {
        //program execution will not continue if next() not called
        next();
    }

})

var User = mongoose.model('User', UserSchema);

module.exports = {User}
