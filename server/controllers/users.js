var User = require('../models/user');
var jwt = require('jwt-simple');
var moment = require('moment');
var app = require("../../app");
var jwtTokenSecret = "YOUR_SECRET_STRING";


// ********************** local application methods ************************//

// cheking whether user logged in or not
exports.loggedin = function(req, res, next) {
    res.send(req.isAuthenticated() ? req.user : '0');
}

// logout function
exports.logout = function(req, res, next) {
    req.logout();
    res.status(200).send("");
}


// return the logged in user
exports.me = function(req, res) {
    res.json(req.user || null);
};



// user creation function
exports.create = function(req, res, next) {
    console.log('came to the create request');
    var user = new User(req.body);
    user.provider = 'local';

    // because we set our user.provider to local our models/user.js validation will always be true
    req.assert('name', 'You must enter a name').notEmpty();
    req.assert('email', 'You must enter a valid email address').isEmail();
    req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
    req.assert('username', 'Username cannot be more than 20 characters').len(1, 20);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send(errors);
    }
    console.log(2);

    // Hard coded for now. Will address this with the user permissions system in v0.3.5
    user.roles = ['authenticated'];
    user.save(function(err) {
        if (err) {
            switch (err.code) {
                case 11000:
                    res.status(400).send([{
                        msg: 'Email already taken',
                        param: 'email'
                    }]);
                    break;
                case 11001:
                    res.status(400).send([{
                        msg: 'Username already taken',
                        param: 'username'
                    }]);
                    break;
                default:
                    var modelErrors = [];

                    if (err.errors) {

                        for (var x in err.errors) {
                            modelErrors.push({
                                param: x,
                                msg: err.errors[x].message,
                                value: err.errors[x].value
                            });
                        }

                        res.status(400).send(modelErrors);
                    }
            }

            return res.status(400);
        }
        // log in the user
        req.logIn(user, function(err) {
            if (err) return next(err);
            if (req.body.thirdparty) {
                var token = generateToken(user);
                res.send({
                    user: user,
                    token: token
                });
            } else {
                return res.redirect('/');
            }
        });
        res.status(200);
    });
}


// login the user externally
exports.doLogin = function(req, res) {
    if (req.body.thirdparty) {
        var token = generateToken(req.user);
        res.send({
            user: req.user,
            token: token
        });
    } else {
        res.send({
            user: req.user,
        });
    }
}


// ******************************** third party application methods *******************//


// function to generate token for _id of given user document 
var generateToken = function(user) {
    var expires = moment().add(7, 'days').valueOf();
    var sec = Date.now().valueOf()
    var token = jwt.encode({
        iss: user._id,
        exp: expires
    }, jwtTokenSecret);

    return token;
};


// clear the token
var clearToken = function(req, done) {
    User.update({
        _id: req.body.id
    }, {
        token: {
            jwt: '',
            createdAt: ''
        }
    })
        .exec(function(err, user) {
            if (err) console.log(err);
            else {
                done(null, user);
            };

        });
};



// validate the user using jwt token 
exports.requiresToken = function(req, res, next) {
    var decoded = jwt.decode(req.query.token, jwtTokenSecret);

    // time limit validation
    if (decoded.exp <= Date.now()) {
        res.end('Access token has expired', 400);
    }

    // user _id validation
    if (decoded.iss) {
        User
            .findOne({
                _id: decoded.iss
            })
            .exec(function(err, user) {
                if (err) return res.send(401, 'User is not authorized');
                if (!user) return res.status(401).send('User is not authorized');
                req.user = user;
                next();
            });

    } else return res.send(401, 'User is not authorized');

};


// function for log in function
exports.facebookLogin = function(req, res) {
    console.log('came to facebooklogin');
    User.findOne({
        email: req.body.email
    }).exec(function(err, user) {
        if (user) {
            var token = generateToken(user);
            res.send({
                user: user,
                token: token
            });

        } else {
            console.log('came to no user');
            var user = new User(req.body);
            user.provider = 'facebook';

            // Hard coded for now. Will address this with the user permissions system in v0.3.5
            user.roles = ['authenticated'];
            user.save(function(err) {
                if (err) {
                    console.log(err);
                    switch (err.code) {
                        case 11000:
                            res.status(400).send([{
                                msg: 'Email already taken',
                                param: 'email'
                            }]);
                            break;
                        case 11001:
                            res.status(400).send([{
                                msg: 'Username already taken',
                                param: 'username'
                            }]);
                            break;
                        default:
                            var modelErrors = [];

                            if (err.errors) {

                                for (var x in err.errors) {
                                    modelErrors.push({
                                        param: x,
                                        msg: err.errors[x].message,
                                        value: err.errors[x].value
                                    });
                                }

                                res.status(400).send(modelErrors);
                            }
                    }

                    return res.status(400);
                }
                console.log(user);
                var token = generateToken(user);
                res.send({
                    user: user,
                    token: token
                });

            });
            res.status(200);

        }
    });

}

// logout for third party app
exports.signoutapp = function(req, res) {
    clearToken(req, function(err, user) {
        if (err) res.status(400).send(err);
        else {
            res.send({
                message: 'success'
            });
        }
    });
};
