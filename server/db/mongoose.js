const mongoose = require('mongoose');

const databaseUrl = process.env.NODE_ENV === "test" ? 'mongodb://localhost:27017/ChecklistAppTest' : 'mongodb://localhost:27017/ChecklistApp';

mongoose.Promise = global.Promise;
mongoose.connect(databaseUrl);

module.exports = {
    mongoose
}