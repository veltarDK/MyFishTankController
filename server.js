var express = require('express');
var app = express(); // express
var mongoose = require('mongoose'); // mongoose for mongodb
var morgan = require('morgan'); // log requests to the console (express4)
var bodyParser = require('body-parser'); // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var async = require('async');
 var gpio = require('pi-gpio');
var config = require('./config');
var sensor = require('ds18x20'); // temperature sensor library
var schedule = require('node-schedule'); // cron scheduller
var moment = require('moment');
// Retrieve
// var MongoClient = require('mongodb').MongoClient;


// configuration =================

// mongoose.connect('mongodb://node:nodeuser@mongo.onmodulus.net:27017/uwO3mypu');     // connect to mongoDB database on modulus.io

app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({
    'extended': 'true'
})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
// app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

// listen (start app with node server.js) ======================================


// 
app.listen(process.env.PORT, process.env.IP, function() {
    console.log('Example server listening on port ' + process.env.PORT + ' IP ' + process.env.IP);
    Initialize();
});


function Initialize() {
    moment().format("HH:mm");

    //
    //get current time
    //
    console.log("current hour is " + moment().format("HH"));

    var c_hour = moment().format("HH");

    if (c_hour > config.SUNRISE_HOUR && c_hour < config.SUNSET_HOUR) {
        //
        console.log("determine day. " + moment().format("HH:mm"));
         OpenP1();
    }
    else {
        console.log("determine night. " + moment().format("HH:mm"));
         OpenP2();
    }
    //
    //enqueue timers
    //
    // morning rule
    var morning_rule = new schedule.RecurrenceRule();
    morning_rule.dayOfWeek = [0, new schedule.Range(1, 6)];
    morning_rule.hour = config.SUNRISE_HOUR;
    morning_rule.minute = config.SUNRISE_MINUTES;
    schedule.scheduleJob(morning_rule, function() {
         OpenP1();
        console.log('Sunrise! ;)');
    });

    //
    //evening rule
    var evening_rule = new schedule.RecurrenceRule();
    evening_rule.dayOfWeek = [0, new schedule.Range(1, 6)];
    evening_rule.hour = config.SUNRISE_HOUR;
    evening_rule.minute = config.SUNRISE_MINUTES;
    schedule.scheduleJob(evening_rule, function() {
         OpenP2();
        console.log('Sunset! ;)');
    });


//
    //15minutes temp rule
    var temp_15_rule = new schedule.RecurrenceRule();
   // temp_15_rule.dayOfWeek = [0, new schedule.Range(1, 6)];
    temp_15_rule.minute = 15;
    schedule.scheduleJob(temp_15_rule, function() {
         ReadTemp_dump2();
         ReadTemp_dump();
        console.log('getSave temp! ;)');
    });
    //
    //
    //check modules
    //
    // 
    var isLoaded = sensor.isDriverLoaded();
    console.log("Temperarure sensor library loaded: " + isLoaded);

    if (isLoaded) {
        var listOfDeviceIds = sensor.list();
        console.log("Temp sensors: " + listOfDeviceIds);
        sensor.getAll(function(err, tempObj) {
            console.log(tempObj);
        });
        //28-000002f793b9': 24.6, '28-000002f79457': 21.3 
        //
        //
    }

    // Retrieve
    // var MongoClient = require('mongodb').MongoClient;
    mongoose.connect(process.env.IP);


    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
     db.once('open', function() {
       // we're connected!
       console.log("We are connected");
        ReadTemp_dump(555);
        //

     });

console.log("Initialization - Done.")




}

 var Schema = mongoose.Schema;

 var Temp = new Schema({
   value: Number,
   time: Date
 });



//turnONp1
function OpenP1(callback) {
    // open PIN
    gpio.open(config.DAY_LIGHT_PIN, "output", WriteP1);
    console.log('pin opened. On');
}

function WriteP1(callback) {
    //gpio.setup(config.DAY_LIGHT_PIN, gpio.DIR_OUT);
    console.log('came to 2');
    gpio.write(config.DAY_LIGHT_PIN, config.RELAY_ON);
    console.log('Written to pin. On');
}




//turnOFFp1
function OpenP2(callback) {
    // open PIN
    gpio.open(config.DAY_LIGHT_PIN, "output", WriteP2);
    console.log('pin opened. Off');
}

function WriteP2(callback) {
    gpio.write(config.DAY_LIGHT_PIN, config.RELAY_OFF);
    console.log('Written to pin. Off');
}



function CloseP1(callback) {
    gpio.close(config.DAY_LIGHT_PIN, function() {
        console.log('pin closed.On');
    });
}







app.post("/api/light/day/on", function(req, res) {
    async.series(
        [
            OpenP1
        ],
        function(err, results) {
            console.log(err + " All functions finished.");
        }
    );
});


app.post("/api/light/day/off", function(req, res) {
    async.series(
        [
            OpenP2
        ],
        function(err, results) {
            console.log(err + " All functions finished.");
        }
    );

});


// 
// 
// Temp section
// 
function ReadT2(res, callback) {
    var temp = 666;
    console.log("Requested temp value is:" + temp);
    res.send(temp);
    // res = temp;
}

app.post("/api/sensor/temp/tank2", function(req, res) {
    var temp = 666;
    var t_probe = 1;
    console.log("Requested temp value is:" + temp);
    res.status = 405;
    //                res.
    res.send(t_probe + ' ' + temp);

    // async.series(
    //         [
    //          ReadT2()
    //         ], function (err, results) {
    //                 console.log(err + " All functions finished.");
    //                 }
    //         );
});

function ReadTemp_dump() {
    
    var tempModel = mongoose.model('Temp1', Temp);

    var temp1 = new tempModel();
    var mes_temp;
    sensor.get('28-000002f793b9', function (err, mes_temp) {
    console.log(mes_temp);
    
    temp1.value = mes_temp;
    temp1.time = moment().format();
    temp1.save(function(err) {
  if (err) throw err;

  console.log('Temp saved successfully!');
    });
  
  //
  //
  //
          // get all the users
    tempModel.find({}, function(err, temps) {
  if (err) throw err;

  // object of all the users
  console.log(temps);
});
});
}


function ReadTemp_dump2() {
    
    var tempModel = mongoose.model('Temp2', Temp);

    var temp1 = new tempModel();
    var mes_temp;
    sensor.get('28-000002f79457', function (err, mes_temp) {
    console.log(mes_temp);
    
    temp1.value = mes_temp;
    temp1.time = moment().format();
    temp1.save(function(err) {
  if (err) throw err;

  console.log('Temp saved successfully!');
    });
  
  //
  //
  //
          // get all the users
    tempModel.find({}, function(err, temps) {
  if (err) throw err;

  // object of all the users
  console.log(temps);
});
});
}
