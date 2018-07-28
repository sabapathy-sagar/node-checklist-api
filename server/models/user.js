const mongoose = require('mongoose');


//set up the schema for Users
const User = mongoose.model('User', {
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true 
    }
});

module.exports = {
    User
}