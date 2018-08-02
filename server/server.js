require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');

const {ObjectID} = require('mongodb');
const mongoose = require('./db/mongoose');

const {Checklist} = require('./models/checklist');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');

//port number on which the app is running
const port = process.env.PORT;

//create an express application
const app = express();

//middleware to use json format for http request body
app.use(bodyParser.json());

//POST method endpoint for creating checklists
app.post('/checklists', (req,res) => {

    //a mongoose checklist instance to set the text data of the checklist
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

//PATCH method endpoint to update a checklist based on the id provided
app.patch('/checklists/:id', (req,res) => {
    const id = req.params.id;

    //grab the text and completed attributes from the request body
    const body = _.pick(req.body, ['text', 'completed']);

    //validate the id provided, if invalid send 404 Bad request
    if(!ObjectID.isValid(id)){
        res.status(404).send();
        return;
    }

    //set the completedAt property by checking the completed property
    if(_.isBoolean(body.completed) && body.completed){
        body.completedAt = new Date().getTime();
    } else {
        completed = false;
        completedAt = null;
    }  

    //update the checklist with the new values
    Checklist.findByIdAndUpdate(id, {$set: body}, {new: true})
        .then((checklist) => {
            if(!checklist){
                return res.status(404).send();
            }

            res.send({checklist});
        })
        .catch((e) => {
            res.status(400).send();
        });
})

//POST method endpoint for adding users
app.post('/users', (req, res) => {

    const body = _.pick(req.body, ['email', 'password']);

    //create a new instance of an User with email and password properties
    var user = new User(body);

    //save the User data to the db
    user.save()
        .then(() => {
            //generate auth token
            return user.generateAuthToken()
        })
        .then((token) => {
        //on successful save, send the saved user data as a POST response with token in the header
        res.header('x-auth',token).send(user);
        })
        .catch((e) => {
            //on saving failed send the error message with a status of 400 in the POST response
            res.status(400).send(e);
        })
        
}) 

//GET method to get user's data based on the token, which makes use of the
//authenticate middleware for authenticating the user
app.get('/users/me', authenticate, (req,res) => {
    res.send(req.user);
})


//listen on port 3000
app.listen(port, () => {
    console.log(`Started on ${port}`);
});

module.exports = {
    app
}
