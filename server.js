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
var winston = require('winston');
//
/////////////////////////////////////
//
//      Logger
//
/////////////////////////////////////
var logger = new(winston.Logger)({
    transports: [
        new(winston.transports.Console)({
            colorize: true,
            handleExceptions: true,
            json: false,
            timestamp: function() {
                return moment().format("MM-DD-YYYY HH:mm:ss");
            },
            formatter: function(options) {
                // Return string will be passed to logger.
                return '{' + options.timestamp() + '} [' + options.level.toUpperCase() + '] ' + (undefined !== options.message ? options.message : '') +
                    (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '');
            }
        }),
        new(winston.transports.File)({
            filename: 'serverLog.log',
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false,
            timestamp: function() {
                return moment().format("MM-DD-YYYY HH:mm:ss");
            },
            formatter: function(options) {
                // Return string will be passed to logger.
                return '{' + options.timestamp() + '} [' + options.level.toUpperCase() + '] ' + (undefined !== options.message ? options.message : '') +
                    (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '');
            }

        })
    ]
});
logger.stream = {
    write: function(message, encoding) {
        logger.info(message);
    }
};
//
////////////////////////////////////////////////////////////////////////////////
//
// configuration
//
////////////////////////////////////////////////////////////////////////////////


app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

app.use(require("morgan")("combined", {
    "stream": logger.stream
}));
app.use(bodyParser.urlencoded({
    'extended': 'true'
})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
// app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

// listen (start app with node server.js) ======================================


//
app.listen(process.env.PORT, process.env.IP, function() {
    logger.info('Example server listening on port ' + process.env.PORT + ' IP ' + process.env.IP);
    Initialize();
});


function Initialize() {
    moment().format("HH:mm");

    //
    //get current time
    //
    logger.info("current hour is " + moment().format("HH"));

    var c_hour = moment().format("HH");

    if (c_hour > config.SUNRISE_HOUR && c_hour < config.SUNSET_HOUR) {
        //
        logger.info("determine day. " + moment().format("HH:mm"));
        // OpenP1();
    }
    else {
        logger.info("determine night. " + moment().format("HH:mm"));
        // OpenP2();
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
        logger.info('Sunrise! ;)');
    });

    //
    //evening rule
    var evening_rule = new schedule.RecurrenceRule();
    evening_rule.dayOfWeek = [0, new schedule.Range(1, 6)];
    evening_rule.hour = config.SUNRISE_HOUR;
    evening_rule.minute = config.SUNRISE_MINUTES;
    schedule.scheduleJob(evening_rule, function() {
        OpenP2();
        logger.info('Sunset! ;)');
    });


    //
    //15minutes temp rule
    var temp_15_rule = new schedule.RecurrenceRule();
    // temp_15_rule.dayOfWeek = [0, new schedule.Range(1, 6)];
    temp_15_rule.minute = new schedule.Range(0, 59, 15);
    schedule.scheduleJob(temp_15_rule, function() {
        ReadTemp_dump2();
        ReadTemp_dump();
        logger.debug('15 minutes rule fired!');
        logger.info('getSave temp! ;)');
    });
    //
    //
    //check modules
    //
    //
    var isLoaded = sensor.isDriverLoaded();
    logger.info("Temperarure sensor library loaded: " + isLoaded);

    if (isLoaded) {
        var listOfDeviceIds = sensor.list();
        logger.info("Temp sensors: " + listOfDeviceIds);
        sensor.getAll(function(err, tempObj) {
            logger.info(err, tempObj);
        });
        //28-000002f793b9': 24.6, '28-000002f79457': 21.3
        //
        //
    }

    // Retrieve
    // var MongoClient = require('mongodb').MongoClient;
    mongoose.connect('mongodb://'+process.env.IP);


    var db = mongoose.connection;
    db.on('connecting', function() {
        logger.info("trying to establish a connection to mongo");
    });

    db.on('connected', function() {
        logger.info("connection to mongo established successfully");
    });

    db.on('error', function(err) {
        logger.error('connection to mongo failed ' + err);
    });

    db.on('disconnected', function() {
        logger.info('mongo db connection closed');
    })

    logger.info("Initialization - Done.")




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
    logger.info('pin ' + config.DAY_LIGHT_PIN + ' opened. On');
}

function WriteP1(callback) {
    //gpio.setup(config.DAY_LIGHT_PIN, gpio.DIR_OUT);
    logger.info('came to 2');
    gpio.write(config.DAY_LIGHT_PIN, config.RELAY_ON);
    logger.info('Written to pin. On');
}




//turnOFFp1
function OpenP2(callback) {
    // open PIN
    gpio.open(config.DAY_LIGHT_PIN, "output", WriteP2);
    logger.info('pin opened. Off');
}

function WriteP2(callback) {
    gpio.write(config.DAY_LIGHT_PIN, config.RELAY_OFF);
    logger.info('Written to pin. Off');
}



function CloseP1(callback) {
    gpio.close(config.DAY_LIGHT_PIN, function() {
        logger.info('pin closed.On');
    });
}







app.post("/api/light/day/on", function(req, res) {
    async.series(
        [
            OpenP1
        ],
        function(err, results) {
            logger.info(err + " All functions finished.");
        }
    );
});


app.post("/api/light/day/off", function(req, res) {
    async.series(
        [
            OpenP2
        ],
        function(err, results) {
            logger.info(err + " All functions finished.");
        }
    );

});


//
//
// Temp section
//
function ReadT2(res, callback) {
    var temp = 666;
    logger.info("Requested temp value is:" + temp);
    res.send(temp);
    // res = temp;
}

app.post("/api/sensor/temp/tank2", function(req, res) {
    var temp = 666;
    var t_probe = 1;
    logger.info("Requested temp value is:" + temp);
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
    sensor.get('28-000002f793b9', function(err, mes_temp) {
        logger.info('temp sensor 1 returned: ' + mes_temp);

        temp1.value = mes_temp;
        temp1.time = moment().format();
        temp1.save(function(err) {
            if (err) throw err;

            logger.info('Temp saved successfully!');
        });

        //
        //
        //
        // get all the users
        // tempModel.find({}, function(err, temps) {
        //     if (err) throw err;

        //     // object of all the users
        //     logger.info(temps);
        // });
    });
}


function ReadTemp_dump2() {

    var tempModel = mongoose.model('Temp2', Temp);

    var temp1 = new tempModel();
    var mes_temp;
    sensor.get('28-000002f79457', function(err, mes_temp) {
        logger.info('temp sensor 1 returned: ' + mes_temp);

        temp1.value = mes_temp;
        temp1.time = moment().format();
        temp1.save(function(err) {
            if (err) throw err;

            logger.info('Temp 2 saved successfully!');
        });

        //
        //
        //
        // get all the users
        // tempModel.find({}, function(err, temps) {
        //     if (err) throw err;

        //     // object of all the users
        //     logger.info(temps);
        // });
    });
}
