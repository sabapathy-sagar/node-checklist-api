const mongoose = require('mongoose');

//set up the schema for Todo
const Checklist = mongoose.model('Checklist', {
    text: {
        type: String,
        required: true,
        minlength: 1,
        trim: true 
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Number,
        default: null
    }
});

module.exports = {Checklist};