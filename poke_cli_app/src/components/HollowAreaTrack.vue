<template>

  <svg class="" :width="svgWidth" :height="svgHeight">
    <g v-for="(coordsTriplet) in wideEnoughCoordsOnly"
      :key="coordsTriplet[0]"
      :transform="writeTranslateWithOffSet(ntToPx(coordsTriplet[0]), 0)"
      :fill="coordsTriplet[2]"
      >
      <path :d="`M 0 0 L 2 0 L 2 ${trackHeight} L 0 ${trackHeight-4} Z`" />
      <rect
        x='0'
        y='0'
        :width="ntToPx(coordsTriplet[1]-coordsTriplet[0])"
        :height="rectHeightDependingOnOverlaps.get(coordsTriplet[0])"
      />
      <path :d="`M 0 0 L -2 0 L -2 ${trackHeight} L 0 ${trackHeight-4} Z`" :transform="writeTranslate(ntToPx(coordsTriplet[1]-coordsTriplet[0]), 0)"/>
    </g>
  </svg>

</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'HollowAreaTrack',
  props: {
    //input data should be of format [[start, stop (,color)], ...]
    coordsStartStop: {
      type: Array,
      default: () => [] //Default in case data are not there on creation
    },
    firstNtToDisplay: {
      type: Number,
      default: 0 //Default position
    },
    displaySizeOfNt: {
      type: Number,
      required: true
    },
    svgWidth: {
      type: Number,
      default: 600
    },
    trackHeight: {
      type: Number,
      default: 14 //should be an even number
    },
    gapHeight: {
      type: Number,
      default: 2
    },
    overlapingHeight: {
      type: Number,
      default: 50
    },

  },
  data() {
    return {
      smallestWidthVisible: 15,
    }
  },
  beforeMount() {
  },
  mounted() {
  },
  computed: {
    svgHeight: function() {
      return this.trackHeight + this.gapHeight + this.overlapingHeight
    },
    //Attribute color to links if needed
    coordsTripleWithColor: function() {
      let coloredCoords = [];

      let rainbowScale = d3.interpolateRainbow;
      let n = 0;

      this.coordsStartStop.forEach( function(tuple) {
        if (tuple[2] != undefined || d3.color(tuple[2]) != null) {
          coloredCoords.push(tuple);
        } else {
          let triple = tuple;
          let color = rainbowScale( (n % 4) / 4);
          triple[2] = color;
          coloredCoords.push(triple);
          n += 1;
        }
      })

      console.log({coloredCoords});
      return coloredCoords;
    },
    //Filter out coords too small to be correctly seen on screen
    wideEnoughCoordsOnly: function() {
      let validCoords = [];
      let self = this;

      this.coordsTripleWithColor.forEach( function(tuple) {
        let width = self.ntToPx(tuple[1] - tuple[0]);
        if ( width >= self.smallestWidthVisible) {
          validCoords.push(tuple);
        }
      })

      console.log({validCoords});

      return validCoords;
    },
    //Coords arrays must be sorted beforehand
    rectHeightDependingOnOverlaps: function() {
      let overlapsToCompare = new Map();
      let previousStop = 0;
      let arrayOfOverlapCount = [];
      let mapOfDesiredHeights = new Map();

      //Check all neighbouring Stop N-1 and Start N couple to find overlaps
      this.coordsTripleWithColor.forEach( function(coords, index) {
        let currentStart = coords[0];

        //First check if old coords are still overlaped
        overlapsToCompare.forEach( function(overlaped, index) {
          if (overlaped.stop > currentStart) {
            overlaped.overlapCounter += 1;
          } else {
            arrayOfOverlapCount[index] = overlaped.overlapCounter;
            overlapsToCompare.delete(index);
          }
        })

        //Then check if previous coords are overlaped
        //<= since stop is included in the holow region, not excluded
        if (currentStart <= previousStop && index >= 1) {
          let overlapObject = {
            stop: previousStop,
            overlapCounter: 1,
          };
          overlapsToCompare.set(index - 1, overlapObject);
        } else {
          arrayOfOverlapCount[index - 1] = 0;
        }
      })

      //Eventually store unrecorded areas (last one + those it overlaps)
      overlapsToCompare.forEach( function(overlaped, index) {
        arrayOfOverlapCount[index] = overlaped.overlapCounter;
      });
      arrayOfOverlapCount.push(0); //for last area not consider within the loop

      //Link startPos to stroke widths
      if (arrayOfOverlapCount.length != this.coordsTripleWithColor.length) {
        console.log('ERROR: arrayOfOverlapCount does not have same length than original dataset')
      } else {
        let maxHalfWidth = (this.svgHeight / 2) - 1;
        let maxNbOfOverlaps = Math.max(...[arrayOfOverlapCount]);

        //If there are too many overlaps, size must be adapted TODO
        if (maxNbOfOverlaps > maxHalfWidth) {
          console.log('A Hollow Area might have too many overlaps to be properly rendered')
        //Else we can use the overlap count directly
        }

        this.coordsTripleWithColor.forEach( function(coords, index) {
          let overlapsNb = arrayOfOverlapCount[index];
          let desiredHeight = 2 + 2 * overlapsNb;
          mapOfDesiredHeights.set(coords[0], desiredHeight);
        })
      }

      return mapOfDesiredHeights;
    }
  },
  watch: {
    coordsStartStop: function() {
      console.log({coordStartStopChanged: this.coordsStartStop});
    }
  },
  methods: {
    ntToPx(ntAmount) {
      return ntAmount * this.displaySizeOfNt
    },
    writeTranslate(x=0,y=0) {
      return `translate(${x},${y})`
    },
    writeTranslateWithOffSet(x=0, y=0) {
      let offsetX = this.ntToPx(this.firstNtToDisplay);
      return this.writeTranslate(x - offsetX, y)
    },
  }
}
</script>


<style>

</style>
