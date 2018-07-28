const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

//create an express application
const app = express();

//middleware to use json format for http request body
app.use(bodyParser.json());

//POST method endpoint for creating todos
app.post('/todos', (req,res) => {

    //a mongoose todo instance to set the text data of the todo
    const todo = new Todo({
        text: req.body.text
    });

    //save the text data to mongodb
    todo.save()
        .then((
            (doc) => {
                console.log('succ', doc);
                //on saving success send the saved todo in the POST  response 
                res.send(doc);
        }, 
            (e) => {
                console.log('err', e);
                //on saving failed send the error message with a status of 400 in the POST response
                res.status(400).send(e);
    }))
});

//listen on port 3000
app.listen(3000, () => {
    console.log('Started on port 3000');
});