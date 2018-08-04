const {User} = require('./../models/user');

//a middleware to check if the user exists for a given token
const authenticate = (req, res, next) => {
    //grab the token string from the request header
    const token = req.header('x-auth');

    User.findByToken(token).then((user) => {
        if(!user){
            return Promise.reject();
        }

        //add user and token to the request object
        req.user = user;
        req.token = token;
        //call the next function to continue
        next();
    }).catch((e) => {
        //send a 401 unauthorized error
        res.status(401).send();
    });
};

module.exports = {
    authenticate
}