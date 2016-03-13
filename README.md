# StravAwesome
StravAwesome is an API written in NodeJS that uses Strava's API in order to break down uploaded Triathlon files. Strava users tend to upload triathlons as one continuous file and the API partitions this activity into the three respective race components for a triathlon (swim, bike, run). Each component may then be uploaded as separate segments to Strava. In addition to partitioning the components, our API also determines transition time between the race components.

## Reference

#### Test Call
##### Usage
`GET /api/`
##### Success 200
Returns 'Connection succesful: StravAwesome API vXX.XX.XX'

### Activity

**Attributes**

Field|Type|Description
---:|:---|:---
id|integer|The ID corresponding to a Strava activity's ID
swim|object|[A Strava activity object](https://strava.github.io/api/v3/activities)
ride|object|[A Strava activity object](https://strava.github.io/api/v3/activities)
run|object|[A Strava activity object](https://strava.github.io/api/v3/activities)

#### Retrieve all activities
This API endpoint retrieves all StravAwesome activities currently stored in the DB. Calls made on opposite sides of a database refresh are not guaranteed to have the same data. 

##### Usage
`GET /api/activity/`

##### Success 200
Returns an object containing every Activity with their strava ID as their property name.

##### Error 4xx
Field|Description
---:|:---
ActivityNotFound|The Strava activity with the same ID could not be found
BadActivity|The activity was found but couldn't be parsed as a triathlon
BadParameter|The provided parameter was not an integer or was poorly formatted
AuthError|An error occurred with authentication or permissions
TheWorstKindOfError|An unexpected error has occured

#### Retrieve an activity
This API endpoint retrieves a StravAwesome activity from a ID provided. If such an activity doesn't exist, it then attempts to create a StravAwesome activity object from the Strava activity ID provided. 

##### Usage
`GET /api/activity/:id`

##### Parameters
Field|Type|Description
---:|:---|:---
id|integer|The Strava activity ID number

##### Success 200
Returns the corresponding Activity object

##### Error 4xx
Field|Description
---:|:---
ActivityNotFound|The Strava activity with the same ID could not be found
BadActivity|The activity was found but couldn't be parsed as a triathlon
BadParameter|The provided parameter was not an integer or was poorly formatted
AuthError|An error occurred with authentication or permissions
TheWorstKindOfError|An unexpected error has occured



#### Retrieve an activity's transition times
This API endpoint retrieves the transition times of a StravAwesome activity from a ID provided. If such an activity doesn't exist, it then attempts to create a StravAwesome activity object from the Strava activity ID provided and then return such transition times.

A newer version of this function is currently in development, and is viewable in Activity_Test.js
##### Usage
`GET /api/activity/:id/transitions`

##### Parameters
Field|Type|Description
---:|:---|:---
id|integer|The Strava activity ID number

##### Success 200
Returns an object containing an integer swimToRide and integer rideToRun to respectively indicate the amount of seconds between finishing a swim and starting a ride, and the seconds between finishing a ride and starting a run.
Field|Type
---:|:---
swimToRide|transition's start time, end time, and duration
bikeToRun|transition's start time, end time, and duration
##### Error 4xx
Field|Description
---:|:---
ActivityNotFound|The Strava activity with the same ID could not be found
BadActivity|The activity was found but couldn't be parsed as a triathlon
BadParameter|The provided parameter was not an integer or was poorly formatted
AuthError|An error occurred with authentication or permissions
TheWorstKindOfError|An unexpected error has occured
