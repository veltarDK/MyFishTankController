var express = require('express');
var app = express();                                // express
var mongoose = require('mongoose');                 // mongoose for mongodb
var morgan = require('morgan');                     // log requests to the console (express4)
var bodyParser = require('body-parser');            // pull information from HTML POST (express4)
var methodOverride = require('method-override');    // simulate DELETE and PUT (express4)
var async = require('async');
var gpio = require('pi-gpio');
var config = require('./config');
var sensor = require('ds18x20');                    // temperature sensor library


// configuration =================

    // mongoose.connect('mongodb://node:nodeuser@mongo.onmodulus.net:27017/uwO3mypu');     // connect to mongoDB database on modulus.io

    app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    // app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());

    // listen (start app with node server.js) ======================================

// 
sensor.isDriverLoaded(function (err, isLoaded) {
    console.log("Temperarure sensor library loaded: "+  isLoaded);
});
var listOfDeviceIds = sensor.list();
console.log("Temp sensors: " + listOfDeviceIds);

// 
app.listen(process.env.PORT, process.env.IP, function () {
  console.log('Example server listening on port ' + process.env.PORT  + ' IP ' + process.env.IP);
});

sensor.getAll(function (err, tempObj) {
    console.log(tempObj);
});



//turnONp1
function OpenP1(callback)
                        {
                                // open PIN
                                gpio.open(config.DAY_LIGHT_PIN, "output", WriteP1);
                                console.log('pin opened. On');
                        }

function WriteP1(callback)
                        {
//gpio.setup(config.DAY_LIGHT_PIN, gpio.DIR_OUT);
                                console.log('came to 2');
                                gpio.write(config.DAY_LIGHT_PIN, config.RELAY_ON);
                                console.log('Written to pin. On');
                        }




//turnOFFp1
function OpenP2(callback)
                        {
                                // open PIN
                                gpio.open(config.DAY_LIGHT_PIN, "output", WriteP2);
                                console.log('pin opened. Off');
                        }

function WriteP2(callback)
                        {
                                gpio.write(config.DAY_LIGHT_PIN, config.RELAY_OFF);
                                console.log('Written to pin. Off');
                        }



function CloseP1(callback)
                        {
                                gpio.close(config.DAY_LIGHT_PIN,  function(){
				           console.log('pin closed.On');
});
                        }







app.post("/api/light/day/on", function(req, res)
{
	async.series(
		[
		 OpenP1
		], function (err, results) {
			console.log(err + " All functions finished.");
			}
		);
});


app.post("/api/light/day/off", function(req, res) 
{ 
        async.series(
                [
                 OpenP2
                ], function (err, results) {
                        console.log(err + " All functions finished.");
                        }
                );

});