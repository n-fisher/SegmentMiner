/* Segment Miner v1.0
 * @author: Nicholas Fisher
 */

// Person object for stat collection
var Person       = require('./Person');
// Strava API module
var strava       = require('strava-v3');

// Add findIndex to Array's prototype
if (!Array.prototype.findIndex) {
   Array.prototype.findIndex = function(predicate) {
      if (this === null) {
         throw new TypeError('Array.prototype.findIndex called on null or undefined');
      }
      if (typeof predicate !== 'function') {
         throw new TypeError('predicate must be a function');
      }
      var list = Object(this);
      var length = list.length >>> 0;
      var thisArg = arguments[1];
      var value;

      for (var i = 0; i < length; i++) {
         value = list[i];
         if (predicate.call(thisArg, value, i, list)) {
            return i;
         }
      }
      return -1;
   };
}

// Main function that makes processing engine calls
function SegmentMiner(activityID, callback) {
   // Entries are person objects
   var personList = [];

   // Identical to Strava API v3.0 Activity object
   var activity = {};

   // List of segment IDs corresponding to above Activity in listed order
   var segmentList = [];

   // Counter to hold post-processing
   var postCount = 0;

   var callback = callback;
   // Process Strava Activity with input I
   strava.activities.get({"id": activityID, "include_all_efforts": true}, processActivity);

   // Private functions
   // Callback fn for activity get
   function processActivity(err, payload) {
      console.log('Processing ID ' + activityID);
      // Handle errors and assign the object's activity
      console.log(payload);
      if(err || payload.errors != undefined) {
         callback(err, payload);
         return;
      }
      activity = payload;
      console.log('Retrieved activity named ' + activity.name);

      // Compile the associated segments into a list
      effortsToList();
      console.log("Tracking "  + segmentList.length  + " segments.\nMining:");

      console.log("Tracking Competitors with:\n>1 Match | >90% Matches | 100% Matches | Total Competitors");
      // Populate personList with each segment's participants that day
      for(var i = 0; i < segmentList.length; i++)
         effortRetrieve(segmentList[i], 1);
   }

   function postProcess(err, payload) {
      // Handle errors
      if(err) {
         callback(err, payload);
         return;
      }
      else if(++postCount == segmentList.length) {
         console.log("Postprocessing");
         // Compute the similarity values for all Person objects
         for(var i = 0; i < personList.length; i++)
            personList[i].computeDifference(activity.segment_efforts.length);

         // Sort list from most similar to least, by match count then variance then offset
         personList.sort(function(a,b){
               if(a.matchCount - b.matchCount != 0)
                  return b.matchCount - a.matchCount;
               else if(a.variance - b.variance != 0)
                  return a.variance - b.variance;
               else return a.offset - b.offset;
                  });
         console.log("Total matches: " + personList.length);

         // callback with the sorted person list
         callback(false, personList);
         console.log("Done, response sent.\n");
      }
   }

   // helper functions
   // Converts segment effort lists to segment ID lists
   function effortsToList() {
      for(var i = 0; i < activity.segment_efforts.length; i++)
         segmentList.push(activity.segment_efforts[i].segment.id);
   }

   // Add and keep updated stats about people who recorded the same segment +/- 6 hours
   function effortRetrieve(segmentID, page) {
      // 4h in milliseconds
      var sixHours = 1000 * 60 * 60 * 6;
      var time = Date.parse(activity.start_date_local);

      // Get effort list based off time and segment; handle errors
      strava.segments.listEfforts({"id": segmentID,
            "per_page": 200,
            "page": page,
            "start_date_local": new Date(time - sixHours).toISOString(),
            "end_date_local": new Date(time + sixHours).toISOString()
            }, segmentMine, page);
   }

   function segmentMine(err, payload, page)
   {
      var segmentID;
      var effortList = [];

      //handle errors
      if (err)
         callback(err, payload);
      else {
         effortList = payload;
         var popped;
         // Add athletes to list, or update existing entries
         while((popped = effortList.pop()) != undefined) {
            segmentID = popped.segment.id;
            var personIndex = personList.findIndex(function(element){return element.id == popped.athlete.id});
            // create a new Person if there is no match already in the list
            if(personIndex == -1) {
               var person = new Person();
               person.id = popped.athlete.id;
               person.offset = Math.abs(Date.parse(popped.start_date_local) - Date.parse(activity.start_date_local));
               person.matchCount = 1;
               personList.push(person);
               // remove any duplicate entries
               effortList = effortList.filter(function(effort){return effort.athlete.id != popped.athlete.id});
            }
            // increment existing matches
            else {
               personList[personIndex].matchCount++;
               personList[personIndex].offset += Math.abs(Date.parse(popped.start_date_local) - Date.parse(activity.start_date_local));
            }
         }
         // If no more pages forward to PP
         if (payload.length != 200) {
            console.log("Mined segment " + segmentID + ": " + personList.filter(function(p){return p.matchCount > 1}).length 
                  + ' | ' + personList.filter(function(p){return p.matchCount/postCount > .9}).length + ' | ' + personList.filter(function(p){return p.matchCount == postCount}).length + ' | ' + personList.length);
            postProcess(false);
         }
         // Else explore the next page
         else
            retrieveSegment(segmentID, page + 1);
      }
   }
}

module.exports = SegmentMiner;
