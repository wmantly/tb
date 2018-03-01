var express = require('express');
var app = express();
var server = require('http').Server( app );
var bodyParser = require('body-parser');
var request = require('request');

app.io = require( 'socket.io' )( server, {
  origins: '*:*',
} );


var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.mongo = require('./models/mongo');
app.mongo = require('./socket')(app);

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

require('./pubsub.js')(app);

app.use(function(req, res, next){
  res.locals.basePath = '/stuff/';
  next();
});

require('./routes/dir')(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

server.listen( process.argv[2] || parseInt(process.env.NODEPORT) || 30080 );
// console.log( 'Node app running on port :', port );
