
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');

var app = module.exports = express.createServer();

var passport = require('passport'),
    users =  require('./server/controllers/users.js'),
    expressValidator = require('express-validator');

// Configuration 

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.set('view options', {
    layout: false
  });
  app.use(express.static(__dirname + '/public'));

  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(expressValidator());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(passport.initialize());
  app.use(passport.session()); // persistent login sessions
  app.use(app.router);

  require('./server/config/passport')(passport);

});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});


// permissions for third party rest methods

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,DELETE');
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    if ('OPTIONS' == req.method){
        return res.send(200);
    }
    next();
});


// Routes

app.get('/', routes.index);


// auth

  app
    .post( '/login' , passport.authenticate('local', {
      failureFlash: true
    }), users.doLogin);



 app.get("/loggedin",users.loggedin);
 app.post("/sociallogin",users.socialLogin);
 app.post("/signoutapp",users.signoutapp);
 app.get('/userById' , users.requiresToken,users.me);

 app.post('/register' , users.create);



app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
