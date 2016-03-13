// Person Object
var Class = function() {
   this.id = 0;
   this.offset = 0;
   this.matchCount = 0;
   this.variance = 0;
};

Class.prototype = {
   id : 0,
   // Disabled until API access can support name finding
   //name : "",
   offset : 0,
   matchCount : 0,
   variance : 0,
   computeDifference: function(segCount) {
      // Inversely scales the offset by the match ratio to give similar tracks better indices
      this.variance = Math.round(this.offset * Math.pow(1 - (this.matchCount / segCount), 2));
   }
};

module.exports = Class;
