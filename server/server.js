const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('./db/mongoose');
const {Checklist} = require('./models/checklist');
const {User} = require('./models/user');

//create an express application
const app = express();

//middleware to use json format for http request body
app.use(bodyParser.json());

//POST method endpoint for creating checklists
app.post('/checklists', (req,res) => {

    //a mongoose todo instance to set the text data of the checklist
    const checklist = new Checklist({
        text: req.body.text
    });

    //save the checklist text data to mongodb
    checklist.save()
        .then(
            (doc) => {
                //on saving success send the saved checklist in the POST  response 
                res.send(doc);
        }, 
            (e) => {
                    //on saving failed send the error message with a status of 400 in the POST response
                res.status(400).send(e);
    })
});

//listen on port 3000
app.listen(3000, () => {
    console.log('Started on port 3000');
});

module.exports = {
    app
}
