const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
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

//GET method endpoint to fetch all the checklists
app.get('/checklists', (req,res) => {
    //fetch all the checklists from the database
    Checklist.find().then(
        (checklists) => {
            //send the fetched checklists as a response
            res.send({checklists});
        },
        (e) => {
            //on fetch failed send the error message with a status of 400 in the GET response
            res.status(400).send(e);
    })
});

//GET method endpoint to fetch a specific chdecklist based on the id provided
app.get('/checklists/:id', (req,res) => {
    const id = req.params.id;
    //validate the id provided, if invalid send 404 Bad request
    if(!ObjectID.isValid(id)){
        res.status(404).send();
        return;
    }

    //fetch the checklist based on the id from the db
    Checklist.findById(id)
        .then(
            (checklist) => {
                //if no checklist exists for the id, send 404 with empty body
                if(!checklist){
                   return res.status(404).send();
                }
                //if checklist exists, send the fetched checklist back
                res.send({checklist});
        })
        .catch((() => {
            //if error while fetching the checklist, send status 400 with empty body
            res.status(400).send();
        }))

});

//DELETE method endpoint to delete a specific chdecklist based on the id provided
app.delete('/checklists/:id', (req,res) => {
    const id = req.params.id;
    //validate the id provided, if invalid send 404 Bad request
    if(!ObjectID.isValid(id)){
        res.status(404).send();
        return;
    }

    //delete the checklist based on the id from the db
    Checklist.findByIdAndRemove(id)
        .then(
            (checklist) => {
                //if no checklist exists for the id, send 404 with empty body
                if(!checklist){
                   return res.status(404).send();
                }
                //if checklist exists, send the fetched checklist back
                res.send({checklist});
        })
        .catch((() => {
            //if error while fetching the checklist, send status 400 with empty body
            res.status(400).send();
        }))

});

//listen on port 3000
app.listen(3000, () => {
    console.log('Started on port 3000');
});

module.exports = {
    app
}
