<template>
  <div>
    <div class="row">
      <div class="col-12">
        <form>
          <div class="form-group row mb-1">
            <label class="col-8 property-label" for="HA_pavRate">
              <small>Absence rate (0-1)</small>
            </label>
            <div class="col-4 input-group-sm">
              <input
                  class="form-control"
                  v-model.number="paramAbsenceRate"
                  type="number"
                  id="HA_pavRate"
                  min="0"
                  max="1"
                  step="0.01">
            </div>
          </div>
          <div class="form-group row">
            <label class="col-8 property-label" for="HA_consBlocks">
              <small>Number of consecutive blocks</small>
            </label>
            <div class="col-4 input-group-sm">
              <input
                  class="form-control"
                  v-model.number="paramConsecutiveBlock"
                  type="number"
                  id="HA_consBlocks"
                  min="1"
                  step="1">
            </div>
          </div>
        </form>
      </div>
    </div>

    <div v-show="!(paramAbsenceRate === 0 && paramConsecutiveBlock === 0)">
      <div class="row">
        <div class="col-12">
          <div class="alert alert-info p-1 text-center">
            <small>There are <b>{{ nbOfRegionsFound }}</b> regions matching these criteria</small>
          </div>
        </div>
      </div>

      <div class="row text-center">
        <div class="col-6 border-right pb-2">
          <h6 class="mb-0 font-weight-bold">{{ nbOfRegionsBefore }}</h6>
          <small>Before</small>
        </div>
        <div class="col-6">
          <h6 class="mb-0 font-weight-bold">{{ nbOfRegionsAfter }}</h6>
          <small>After</small>
        </div>
      </div>
      <hr class="mt-0 mb-2">
      <div class="row text-center">
        <div class="col-12">
          <h6 class="mb-0 font-weight-bold">{{ targetedPosNt }}</h6>
          <small>Targeted position</small>
        </div>
      </div>

      <div class="row mt-2">
        <div class="col-6 pr-0">
          <div class="input-group input-group-sm mb-3">
            <div class="input-group-prepend">
              <button
                  :class="{'btn btn-secondary btn-sm': true, 'not-allowed': leftmostAreaIsReached}"
                  @click="skipBackward"
                  :disabled="leftmostAreaIsReached">
                <b-icon icon="skip-backward-fill"></b-icon>
              </button>
            </div>
            <div class="input-group-text distance-area-msg noBorderRadius">
              <small>{{ distanceToPreviousAreaMsg }}</small>
            </div>
            <div class="input-group-prepend">
              <button
                  :class="{'btn btn-secondary btn-sm': true, 'not-allowed': leftmostAreaIsReached}"
                  @click="goBackward"
                  :disabled="leftmostAreaIsReached">
                <b-icon icon="play-fill" rotate="180"></b-icon>
              </button>
            </div>
          </div>
        </div>
        <div class="col-6 pl-0">
          <div class="input-group input-group-sm mb-3">
            <div class="input-group-prepend">
              <button
                  :class="{'btn btn-secondary btn-sm': true, 'not-allowed': rightmostAreaIsReached}"
                  class="noBorderRadius"
                  @click="goForward"
                  :disabled="rightmostAreaIsReached">
                <b-icon icon="play-fill"></b-icon>
              </button>
            </div>
            <div class="input-group-text distance-area-msg noBorderRadius">
              <small>{{ distanceToNextAreaMsg }}</small>
            </div>
            <div class="input-group-prepend">
              <button
                  :class="{'btn btn-secondary btn-sm': true, 'not-allowed': rightmostAreaIsReached}"
                  class="borderRadius-right"
                  @click="skipForward"
                  :disabled="rightmostAreaIsReached">
                <b-icon icon="skip-forward-fill"></b-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!--    <div class='inputWrapper'>-->
    <!--      <label class='textLabel labelAbs' for='HA_pavRate'>Absence rate (0-1):</label>-->
    <!--      <input class='textLabel inputNumber inputAbs' v-model.number="paramAbsenceRate" type='number' id='HA_pavRate'-->
    <!--             min='0' max='1' step=0.01>-->
    <!--      <label class='textLabel labelBlocks' for='HA_consBlocks'>Number of consecutive blocks:</label>-->
    <!--      <input class='textLabel inputNumber inputBlocks' v-model.number="paramConsecutiveBlock" type='number'-->
    <!--             id='HA_consBlocks' min='1' step=1>-->
    <!--    </div>-->
    <!--    <div class='areasFoundWrapper'>-->
    <!--      &lt;!&ndash;      <p class='textLabel nbTotal'>There are {{ nbOfRegionsFound }} regions matching these criteria</p>&ndash;&gt;-->
    <!--      &lt;!&ndash;      <p class='textLabel nbBefore'>{{ nbOfRegionsBefore }} before</p>&ndash;&gt;-->
    <!--      &lt;!&ndash;      <p class='textLabel nbAfter'>{{ nbOfRegionsAfter }} after</p>&ndash;&gt;-->
    <!--      &lt;!&ndash;      <p class='textLabel targetedPos'>Targeted position: {{ targetedPosNt }}</p>&ndash;&gt;-->
    <!--      <button class='jumpButton skipLeft' v-on:click="skipBackward" :disabled="leftmostAreaIsReached">&laquo;</button>-->
    <!--      <div class='textLabel distanceLeft'>{{ distanceToPreviousAreaMsg }} :</div>-->
    <!--      <button class='jumpButton goLeft' v-on:click="goBackward" :disabled="leftmostAreaIsReached">&lsaquo;</button>-->
    <!--      <button class='jumpButton goRight' v-on:click="goForward" :disabled="rightmostAreaIsReached">&rsaquo;</button>-->
    <!--      <div class='textLabel distanceRight'>: {{ distanceToNextAreaMsg }}</div>-->
    <!--      <button class='jumpButton skipRight' v-on:click="skipForward" :disabled="rightmostAreaIsReached">&raquo;</button>-->
    <!--    </div>-->
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
    genoNames: {
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
    updateGlobalCoordOfHollowAreas: {
      type: Function,
      required: true
    },
    nbOfAreasToSkip: { //Nb of Area to skip when using the >> or << buttons
      type: Number,
      default: 5
    },
    visibleStatus: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      paramAbsenceRate: 0.8, //Default value of v-model MUST NOT BE declared in the template
      paramConsecutiveBlock: 2,
      targetedPosNt: Number(), //Linked to center of screen if possible,
      targetIsChangedInternally: false,
      sparseArrayOfNext: [],
      sparseArrayOfPrevious: [],
    }
  },
  computed: {
    //Array with same indices as original dataset, for count of consecutive absent blocks
    arrayOfConsecutivenessOfAbs() {
      let genoNames = this.genoNames


      //arrayOfConsecutivenessPerGeno is an array as long as the original dataset
      //Each index (ie block) is associated with a map that links every genome to
      //its corresponding consecTracer object
      let arrayOfConsecutivenessPerGeno = new Array(this.arrayOfPanFeatures.length);

      //Explore dataset to find matching hollow areas
      this.arrayOfPanFeatures.forEach( (d, i) => {

        let mapFromGenoToConsec = new Map();

        //Map a consecTracer to every genome
        genoNames.forEach( (name) => {

          let previousCount;
          let oldStartPos;

          //Different behaviours if its the middle of the algorithm...
          if (i > 0) {
            let previousConsecInfo = arrayOfConsecutivenessPerGeno[i - 1].get(name);
            previousCount = previousConsecInfo.nbOfConsecutiveAbsentBlocks;
            oldStartPos = previousConsecInfo.startPosOfConsecutiveness;
            //... or if there is no previous data, at the very beginning
          } else {
            previousCount = 0;
            oldStartPos = 0;
          }

          let newCount;
          let newStartPos;

          //When a genome has an absent block, register its consecutiveness
          if (d[name] == 0) {
            newCount = previousCount + 1;
          } else {
            newCount = 0;
          }

          //Store new startPos only when no consecutiveness is detected
          if (newCount <= 1) {
            newStartPos = Number(d.index) //Should be FeatureStart?
          } else {
            newStartPos = oldStartPos
          }

          let consecTracer = {
            nbOfConsecutiveAbsentBlocks: newCount,
            startPosOfConsecutiveness: newStartPos,
          };

          mapFromGenoToConsec.set(name, consecTracer);
        });

        arrayOfConsecutivenessPerGeno[i] = mapFromGenoToConsec;
      })

      //console.log({consecutivenessArray: arrayOfConsecutivenessPerGeno});
      return arrayOfConsecutivenessPerGeno;
    },
    hollowAreasCoordinates() {
      let self = this;
      let paramAbsenceRate = this.paramAbsenceRate;
      let paramConsecutiveBlock = this.paramConsecutiveBlock;
      let arrayOfConsecutivenessOfAbs = this.arrayOfConsecutivenessOfAbs;
      //Store for continuity profiles here
      let continuityStore = new Map();
      let lastCheckedPosition = 0;
      let lastFeatureWidth;
      let continuityProfilesThatEnd = new Map();
      let mapOfHollowCoordinates = new Map();

      this.arrayOfPanFeatures.forEach(function (d, i) {

        //Build the consecutiveness profile for each block
        let consecProfile = new Map();

        self.genoNames.forEach(function (name) {
          let genoToConsider = arrayOfConsecutivenessOfAbs[i].get(name)

          //Tag genomes which validate the min consecutive number of absent blocks
          if (genoToConsider.nbOfConsecutiveAbsentBlocks >= paramConsecutiveBlock) {
            let startPos = genoToConsider.startPosOfConsecutiveness;
            consecProfile.set(name, startPos);
          }
        });

        //If the consecProfile does not match the absence rate, all continuity
        //profiles must be registered as 'ending'
        if (consecProfile.size / self.nbOfGenomes < paramAbsenceRate) {
          continuityStore.forEach(function (value, key) {
            continuityProfilesThatEnd.set(key, value);
          })
          //Else the valid consecutiveness profile mark the beginning of a
          //potential hollow area. It can also mark the end of previous areas.
        } else {

          //Update continuities when possible...
          continuityStore.forEach(function (value, key) {
            let continuityProfile = value;
            let removedContinuities = [];
            continuityProfile.forEach(function (startPos, genoName) {
              if (!consecProfile.has(genoName)) {
                removedContinuities.push(genoName);
              }
            });

            //Check if continuities still check absence parameter.
            //If not, register continuityProfile for storage and deletion, without modification...
            let nbOfValidConsecutivGeno = continuityProfile.size - removedContinuities.length;
            if (nbOfValidConsecutivGeno / self.nbOfGenomes < paramAbsenceRate) {
              continuityProfilesThatEnd.set(key, value);
              //...Else update continuity profiles without the useless entries
            } else {
              removedContinuities.forEach(function (genoName) {
                continuityProfile.delete(genoName);
              })
            }
          });

          //...then register the consecutiveness profile as a new continuity profile
          let newContinuityProfile = consecProfile;
          continuityStore.set(Number(d.index), newContinuityProfile); //Profile is associated to where it has been found
        }

        //Check the ending continuity profiles, as they mark end of hollow areas
        //First find which profile mark the beginning...
        let profileToStoreAsArea = undefined;
        if (continuityProfilesThatEnd.size >= 1) {
          let posOfFirstEncounter = [...continuityProfilesThatEnd.keys()].reduce((acc, posOfEncounter) => Math.min(acc, posOfEncounter));
          profileToStoreAsArea = continuityStore.get(posOfFirstEncounter);
        }

        //...Then store start and end pos of hollow area...
        if (profileToStoreAsArea != undefined) {
          let endOfHollowArea = lastCheckedPosition + lastFeatureWidth;
          let maxStartPos = Math.max(...profileToStoreAsArea.values());
          mapOfHollowCoordinates.set(maxStartPos, endOfHollowArea);
        }

        //...Finally remove continuity profiles that won't be used anymore
        continuityProfilesThatEnd.forEach(function (value, key) {
          let keyOfProfileToDelete = key;
          continuityStore.delete(keyOfProfileToDelete);
        });
        continuityProfilesThatEnd.clear();

        //Update the lastCheckedPosition and lastFeatureWidth
        lastCheckedPosition = Number(d.index);
        lastFeatureWidth = Number(d.FeatureStop - d.FeatureStart);
      });

      //Store profiles that might not have been ended by the last data
      if (continuityStore.size > 0) {
        let posOfFirstEncounter = Math.min(...continuityStore.keys());
        let profileToStoreAsArea = continuityStore.get(posOfFirstEncounter);
        let maxStartPos = Math.max(...profileToStoreAsArea.values());
        //Stop is supposed to be lastNt in that case, since area reached the end
        let endOfHollowArea = lastCheckedPosition + lastFeatureWidth;
        mapOfHollowCoordinates.set(maxStartPos, endOfHollowArea);
      }

      //Eventually...
      //console.log({mapOfCoords: mapOfHollowCoordinates});
      return mapOfHollowCoordinates;

    },
    emptySparseArrayOfPos() {
      return new Array(this.lastNt + 1)
    },
    sparseArrayOfMatChingIndices() {

      //Reset Array as empty for every position
      let sparseArray = this.emptySparseArrayOfPos.slice();

      //Assign starting index of hollow areas in the sparse array
      [...this.hollowAreasCoordinates.keys()].forEach(function (startingIdx) {
        sparseArray[startingIdx] = startingIdx;
      })

      return sparseArray;
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
      } else {
        return undefined
      }
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
      return this.targetAPosition({jumpForward: false})
    },
    distanceToPreviousArea() {
      if (this.previousAreaPosNt != undefined) {
        return this.targetedPosNt - this.previousAreaPosNt
      } else {
        return undefined
      }
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
    reachableFirstNt: function () {
      if (this.targetIsChangedInternally) {
        this.updateGlobalFirstNt(this.reachableFirstNt);
      }
    },
    currentFirstNt: function () {

      //If window is moved through jump buttons
      if (this.targetIsChangedInternally) {
        this.targetIsChangedInternally = false

        //If window is moved through other outside process
      } else {
        this.targetedPosNt = Math.round(this.currentFirstNt + this.amountOfNtInHalfScreen)
      }
    },
    hollowAreasCoordinates: function () {
      this.updateGlobalCoordOfHollowAreas(this.hollowAreasCoordinates);
    },
    ntWidthInPixel: function () {
      //The change is external so this.targetIsChangedInternally is false
      //I can change targetedPos freely
      console.log('TargetedPos changed as the size of nt to display changed');
      let floatTarget = (2 * this.currentFirstNt + this.pxToNt(this.displayWindowWidth)) / 2;
      this.targetedPosNt = Math.floor(floatTarget);
    },
    targetedPosNt() {
      if (this.visibleStatus) {
        this.sparseArrayOfNext = this.sparseArrayOfMatChingIndices.slice(this.targetedPosNt, this.sparseArrayOfMatChingIndices.length);
        this.sparseArrayOfPrevious = this.sparseArrayOfMatChingIndices.slice(0, this.targetedPosNt + 1);
      }
    },
    sparseArrayOfMatChingIndices() {
      if (this.visibleStatus) {
        this.sparseArrayOfNext = this.sparseArrayOfMatChingIndices.slice(this.targetedPosNt, this.sparseArrayOfMatChingIndices.length);
        this.sparseArrayOfPrevious = this.sparseArrayOfMatChingIndices.slice(0, this.targetedPosNt + 1);
      }
    }
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
      sparseArray.some(function (d, i) {
        let isNotBeginning = (i != 0);
        if (isNotBeginning) {
          startPosNt = d
        }
        return (i != 0);
      })

      //Will return undefined if no next position is found
      return startPosNt;
    },
    targetAPosition({nbOfJumps = 1, jumpForward = true}) {

      let sparseToParse;
      let destinationToReach;

      if (!jumpForward) {
        sparseToParse = this.sparseArrayOfPrevious_reversed
      } else {
        sparseToParse = this.sparseArrayOfNext
      }

      for (let n = 1; n <= nbOfJumps; n++) {
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
      //console.log({destinationToReach: destinationToReach});
    },
    goForward() {
      let destinationToReach = this.targetAPosition({});
      this.jumpToPosition(destinationToReach);
    },
    skipForward() {
      let destinationToReach = this.targetAPosition({nbOfJumps: this.nbOfAreasToSkip});
      this.jumpToPosition(destinationToReach);
    },
    goBackward() {
      let destinationToReach = this.targetAPosition({jumpForward: false});
      this.jumpToPosition(destinationToReach);
    },
    skipBackward() {
      let destinationToReach = this.targetAPosition({nbOfJumps: this.nbOfAreasToSkip, jumpForward: false});
      this.jumpToPosition(destinationToReach);
    },

  }
}
</script>


<style>

.borderRadius-left {
  border-top-left-radius: .25rem;
  border-bottom-left-radius: .25rem;
}

.borderRadius-right {
  border-top-right-radius: .25rem !important;
  border-bottom-right-radius: .25rem !important;
}

.noBorderRadius {
  border-radius: 0px !important;
}

.textLabel {
  font: 10px sans-serif;
}

.distance-area-msg {
  flex-grow: 1;
  justify-content: center;
  padding: 0 !important;
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

.not-allowed {
  cursor: not-allowed !important;
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
  justify-self: center;
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
  justify-self: center;
  align-self: center;
}

.jumpButton {
  font: 1em sans-serif;
  width: 1.5em;
  height: 1.5em;
  padding: 0 0;
  text-align: center;
}

.property-label {
  margin-bottom: 0;
  line-height: 31px;
}

</style>
