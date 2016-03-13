/*
   RESTful interface for SegmentMiner API. The program is called
   via HTTP request and responds with the data or an error code.
//TODO: Be a badass and make this script also interact with console
 */
const PORT       = 8080;
var express      = require('express');        // call express
var bodyParser   = require('body-parser');
var app          = express();                 // define our app using express
var port         = process.env.PORT || 8080;
var router       = express.Router();
var SegmentMiner = require('./SegmentMiner');

// configure app to use bodyParser() to let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// middleware logger
router.use(function(req, res, next) {
      console.log("\nRequest made: " + req.method + " " + req.url);
      next();
      });

// route GET requests with the activity ID to the driver's main function.
router.route('/:activity_id').get(function(req, res) {
      new SegmentMiner(req.params.activity_id, function(err, payload) {
         if (err) {
            console.log("Error: " + err + "\n" + payload);
            res.send(payload);
            return;
         }
         else
            res.json(payload);
      });
   });

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
      res.json({ message: 'Connection succesful: SegmentMiner API v1.0.0' });
      });


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/smAPI', router);

// START THE SERVER
app.listen(port);
console.log('Port ' + port + ' opened.');
