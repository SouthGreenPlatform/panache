<template>

<div>
  <div class='inputWrapper'>
    <label class='textLabel labelAbs' for='HA_pavRate'>Absence rate (0-1):</label>
    <input class='textLabel inputNumber inputAbs' v-model.number="paramAbsenceRate" type='number' id='HA_pavRate' min='0' max='1' step=0.01>
    <label class='textLabel labelBlocks' for='HA_consBlocks'>Number of consecutive blocks:</label>
    <input class='textLabel inputNumber inputBlocks' v-model.number="paramConsecutiveBlock" type='number' id='HA_consBlocks' min='1' step=1>
  </div>
  <div class='areasFoundWrapper'>
    <p class='textLabel nbTotal' >There are {{nbOfRegionsFound}} regions matching these criteria</p>
    <p class='textLabel nbBefore' >{{nbOfRegionsBefore}} before</p>
    <p class='textLabel nbAfter' >{{nbOfRegionsAfter}} after</p>
    <p class='textLabel targetedPos' >Targeted position: {{targetedPosNt}}</p>
    <button class='jumpButton skipLeft' v-on:click="skipBackward" :disabled="leftmostAreaIsReached">&laquo;</button>
    <div class='textLabel distanceLeft' >{{distanceToPreviousAreaMsg}} :</div>
    <button class='jumpButton goLeft' v-on:click="goBackward" :disabled="leftmostAreaIsReached">&lsaquo;</button>
    <button class='jumpButton goRight' v-on:click="goForward" :disabled="rightmostAreaIsReached">&rsaquo;</button>
    <div class='textLabel distanceRight' >: {{distanceToNextAreaMsg}}</div>
    <button class='jumpButton skipRight' v-on:click="skipForward" :disabled="rightmostAreaIsReached">&raquo;</button>
  </div>
</div>

</template>

<script>
export default {
  name: 'HollowAreaFinder',
  props: {
    arrayOfPanFeatures: {
      type: Array,
      default: () => []
    },
    lastNt: {
      type: Number,
      required: true
    },
    nbOfGenomes: {
      type: Number,
      required: true
    },
    currentFirstNt: {
      type: Number,
      default: 0
    },
    displayWindowWidth: {
      type: Number,
      required: true
    },
    ntWidthInPixel: {
      type: Number,
      required: true
    },
    updateGlobalFirstNt: {
      type: Function,
      required: true
    },
    nbOfAreasToSkip: { //Nb of Area to skip when using the >> or << buttons
      type: Number,
      default: 5
    },
  },
  data() {
    return {
      paramAbsenceRate: 0.80, //Default value of v-model MUST NOT BE declared in the template
      paramConsecutiveBlock: 1,
      targetedPosNt: Number(), //Linked to center of screen if possible,
      targetIsChangedInternally: false,
    }
  },
  computed: {
    emptySparseArrayOfPos() {
      return new Array(this.lastNt + 1)
    },
    sparseArrayOfMatChingIndices() {
      let self = this;

      //Reset Array as empty for every position
      let sparseArray = this.emptySparseArrayOfPos.slice();

      let nbOfConsecutiveMatchingBlock = 0;
      let isWithinBlock = false;
      let blockIsAlreadyStored = false;
      let startingIdx = Number;

      this.arrayOfPanFeatures.forEach( function(d) {

        //If a block has the right amount of absence...
        if (d.presenceCounter <= self.maxDesiredNbOfPresentBlock) {
          nbOfConsecutiveMatchingBlock += 1;

          //...its index is saved if it is the first one of its area
          if (!isWithinBlock) {
            isWithinBlock = true;
            startingIdx = Number(d.index); //Converted into number for further calculation, just in case
          }

          //...the first index of the serie is stored when nb of consecutive blocks is reached
          if ((nbOfConsecutiveMatchingBlock >= self.paramConsecutiveBlock ) && (!blockIsAlreadyStored)) {
            sparseArray[startingIdx] = startingIdx;
            blockIsAlreadyStored = true;
          }

        //Else the serie of matching blocks is reset
        } else {

          if (isWithinBlock) {
            isWithinBlock = false;
            blockIsAlreadyStored = false;
            nbOfConsecutiveMatchingBlock = 0;
          }

        }
      })

      return sparseArray;
    },
    sparseArrayOfNext() { //Shallow copy of next portion
      return this.sparseArrayOfMatChingIndices.slice(this.targetedPosNt, this.sparseArrayOfMatChingIndices.length)
    },
    sparseArrayOfPrevious() { //Shallow copy of previous portion
      return this.sparseArrayOfMatChingIndices.slice(0, this.targetedPosNt + 1)
    },
    sparseArrayOfPrevious_reversed() {
      let shallowCopy = this.sparseArrayOfPrevious.slice();
      shallowCopy.reverse();
      return shallowCopy;
    },
    minDesiredNbOfAbsentBlock() {
      return this.paramAbsenceRate * this.nbOfGenomes
    },
    maxDesiredNbOfPresentBlock() {
      return this.nbOfGenomes - this.minDesiredNbOfAbsentBlock
    },
    maxFirstNt() {
      return this.lastNt - this.pxToNt(this.displayWindowWidth)
    },
    amountOfNtInHalfScreen() {
      return this.pxToNt(this.displayWindowWidth / 2)
    },
    desiredFirstNt() { //Maybe there the half screen should be rounded?
      return this.targetedPosNt - this.amountOfNtInHalfScreen
    },
    reachableFirstNt() {
      if (0 <= this.desiredFirstNt && this.desiredFirstNt <= this.maxFirstNt) {
        return this.desiredFirstNt
      } else if (this.desiredFirstNt < 0) {
        return 0
      } else {
        return this.maxFirstNt
      }
    },
    nbOfRegionsFound() {
      return this.lengthOfSparse(this.sparseArrayOfMatChingIndices)
    },
    nbOfRegionsAfter() {
      return this.lengthOfSparse(this.sparseArrayOfNext.slice(1)) //targetedPos excepted
    },
    nextAreaPosNt() {
      return this.targetAPosition({})
    },
    distanceToNextArea() {
      if (this.nextAreaPosNt != undefined) {
        return this.nextAreaPosNt - this.targetedPosNt
      } else { return undefined }
    },
    rightmostAreaIsReached() {
      return (this.distanceToNextArea === 0 || this.distanceToNextArea == undefined)
    },
    distanceToNextAreaMsg() {
      if (this.rightmostAreaIsReached) {
        return 'None'
      } else {
        return `+${this.distanceToNextArea}`
      }
    },
    nbOfRegionsBefore() {
      return this.lengthOfSparse(this.sparseArrayOfPrevious_reversed.slice(1)) //targetedPos excepted
    },
    previousAreaPosNt() {
      return this.targetAPosition({jumpForward:false})
    },
    distanceToPreviousArea() {
      if (this.previousAreaPosNt != undefined) {
        return this.targetedPosNt - this.previousAreaPosNt
      } else { return undefined }
    },
    leftmostAreaIsReached() {
      return (this.distanceToPreviousArea === 0 || this.distanceToPreviousArea == undefined)
    },
    distanceToPreviousAreaMsg() {
      if (this.leftmostAreaIsReached) {
        return 'None'
      } else {
        return `-${this.distanceToPreviousArea}`
      }
    },
  },
  watch: {
    reachableFirstNt: function() {
      if (this.targetIsChangedInternally) {
        this.updateGlobalFirstNt(this.reachableFirstNt)
      }
    },
    maxDesiredNbOfPresentBlock: function() {
      console.log({minNb:this.minDesiredNbOfAbsentBlock, maxNb:this.maxDesiredNbOfPresentBlock})
    },
    sparseArrayOfPrevious_reversed: function() {
      console.log({allArray:this.sparseArrayOfMatChingIndices, next:this.sparseArrayOfNext, prev:this.sparseArrayOfPrevious, prevRev: this.sparseArrayOfPrevious_reversed});
    },
    currentFirstNt: function() {

      //If window is moved through jump buttons
      if (this.targetIsChangedInternally) {
        this.targetIsChangedInternally = false

      //If window is moved through other outside process
      } else {
        this.targetedPosNt = Math.round(this.currentFirstNt + this.amountOfNtInHalfScreen)
      }
    },
  },
  methods: {
    ntToPx(ntAmount) {
      return ntAmount * this.ntWidthInPixel
    },
    pxToNt(pxAmount) {
      return pxAmount / this.ntWidthInPixel
    },
    lengthOfSparse(sparseArray) {
      return sparseArray.reduce(c => c + 1, 0)
    },
    findNextFilledInSparse(sparseArray) {
      //Returns the value for the next non-empty idx of sparseArray

      //sparseArray should be in the following form:
      //idx :   [ currentIdx, idx+1,  idx+2,  ...,    *nextStartIdx*,   ...             ]
      //values: [ doNotCare,  empty,  empty,  empty,  *posOfInterest*,  empty/doNotCare ]

      let startPosNt;

      //Get first filled value which is not that of the very first index
      //'some' stops at first 'true' encountered, here it is whenever the index is not the first one
      sparseArray.some(function(d, i) {
        let isNotBeginning = (i != 0);
        if (isNotBeginning) {
          startPosNt = d
        }
        return (i != 0);
      })

      //Will return undefined if no next position is found
      return startPosNt;
    },
    targetAPosition({nbOfJumps=1, jumpForward=true}) {

      let sparseToParse;
      let destinationToReach;

      if (!jumpForward) {
        sparseToParse = this.sparseArrayOfPrevious_reversed
      } else {
        sparseToParse = this.sparseArrayOfNext
      }

      for (let n=1; n <= nbOfJumps; n++) {
        let nextPosition = this.findNextFilledInSparse(sparseToParse)

        if (nextPosition != undefined) {
          destinationToReach = nextPosition
          sparseToParse = sparseToParse.slice(sparseToParse.indexOf(destinationToReach))
        } else { //Whenever undefined is encountered, no need to check the 'rest'
          break;
        }

      }
      return destinationToReach; //Can be undefined
    },
    jumpToPosition(destinationToReach) {
      if (destinationToReach != undefined) {
        this.targetedPosNt = destinationToReach
        this.targetIsChangedInternally = true
      }
      console.log({destinationToReach: destinationToReach});
    },
    goForward() {
      let destinationToReach = this.targetAPosition({});
      this.jumpToPosition(destinationToReach);
    },
    skipForward() {
      let destinationToReach = this.targetAPosition({nbOfJumps:this.nbOfAreasToSkip});
      this.jumpToPosition(destinationToReach);
    },
    goBackward() {
      let destinationToReach = this.targetAPosition({jumpForward:false});
      this.jumpToPosition(destinationToReach);
    },
    skipBackward() {
      let destinationToReach = this.targetAPosition({nbOfJumps:this.nbOfAreasToSkip, jumpForward:false});
      this.jumpToPosition(destinationToReach);
    },

  }
}
</script>


<style>

.textLabel {
  font: 10px sans-serif;
}

.inputNumber {
  width: 5em;
}

.inputWrapper {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  column-gap: 10px;
}
.areasFoundWrapper {
  display: grid;
  grid-template-columns: 50px 1fr 30px 30px 1fr 50px;
  grid-template-rows: repeat(4, 1fr);
}


.labelAbs {
  grid-column: 1 / 3;
  grid-row: 1;
  text-align: right;
  align-self: center;
}
.inputAbs {
  grid-column: 3;
  grid-row: 1;
  text-align: left;
  align-self: center;
}
.labelBlocks {
  grid-column: 1 / 3;
  grid-row: 2;
  text-align: right;
  align-self: center;
}
.inputBlocks {
  grid-column: 3;
  grid-row: 2;
  text-align: left;
  align-self: center;
}
.nbTotal {
  grid-column: 1 / 7;
  grid-row: 1;
  text-align: center;
  align-self: center;
}
.nbBefore {
  grid-column: 1 / 3;
  grid-row: 2;
  text-align: right;
  align-self: center;
}
.nbAfter {
  grid-column: 5 / 7;
  grid-row: 2;
  text-align: left;
  align-self: center;
}
.targetedPos {
  grid-column: 1 / 7;
  grid-row: 3;
  text-align: center;
  align-self: center;
}
.skipLeft {
  grid-column: 1;
  grid-row: 4;
  text-align: left;
  align-self: center;
}
.distanceLeft {
  grid-column: 2;
  grid-row: 4;
  text-align: right;
  justify-self: end;
  align-self: center;
}
.goLeft {
  grid-column: 3;
  grid-row: 4;
  text-align: center;
  justify-self: end;
  align-self: center;
}
.goRight {
  grid-column: 4;
  grid-row: 4;
  text-align: center;
  justify-self: start;
  align-self: center;
}
.distanceRight {
  grid-column: 5;
  grid-row: 4;
  text-align: left;
  justify-self: left;
  align-self: center;
}
.skipRight {
  grid-column: 6;
  grid-row: 4;
  text-align: right;
  align-self: center;
}

.jumpButton {
  font: 1em sans-serif;
  width: 1.5em;
  height: 1.5em;
  padding: 0 0;
  text-align: center;
}

</style>
