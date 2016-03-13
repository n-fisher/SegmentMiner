# SegmentMiner
SegmentMiner is an API written in Node.js that uses Strava's API in order to find athletes that ran similar routes within a set time frame (currently +/- 4 hours). This is designed to complement Strava Labs' Flyby system, as where that tracks any athletes that passed or were passed at a significant speed, this tracks any athletes that may have completed the same route but in parallel.

## Reference

#### Test Call
##### Usage
`GET /smAPI/`
##### Success 200
Returns 'Connection succesful: SegmentMiner API vXX.XX.XX'

### Competitor List
An array of People objects sorted by segment match count, then scaled variance, then time offset. 
**Attributes**

Field|Type|Description
---:|:---|:---
id|number|The ID corresponding to a Strava activity's ID
offset|number|Combined millisecond offsets between all segment starts
matchCount|number|Number of segments traversed that match the original activity's
variance|number|A version of the total offset inversely scaled by the match %

#### Retrieve all competitors along route
This API endpoint retrieves all StravAwesome activities currently stored in the DB. Calls made on opposite sides of a database refresh are not guaranteed to have the same data. 

##### Usage
`GET /smAPI/:activity_id`

##### Success
Returns a sorted array containing a Person object for every athlete found.

##### Error Object
Field|Description
---:|:---
message|Error title
errors|Object containing below information
errors.resource|The API endpoint where the error occurred
errors.field|The API endpoint field that has issues
errors.code|API endpoint error code

**In order to run, a `strava_config` json object file needs to be placed in a `data` folder in the root of the SegmentMiner directory.**
