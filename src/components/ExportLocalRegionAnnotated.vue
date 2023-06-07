<template>
  <div>
    <button @click="saveFile">Export Local Data</button>
  </div>
</template>

<script>
//import * as d3 from "d3";

export default {
  name: 'FileLoader',
  props: {
    pavDataOnDisplay: {
      type: Array, // [ {#Chromosome, Chromosome, FeatureStart, FeatureStop, Function, Sequence_IUPAC_Plus, SimilarBlocks, genoName1, genoName2, ...}, {...}]
    },
    pavFileName: {
      type: String,
    },
    gffDataOnDisplay: {
      type: Array, // [ {annotation, exons: [{start, stop}, {...}], geneName, annotStart, annotStop, geneStrand, leftOverlaps, rightOverlaps}, {...}]
    },
    gffFileName: {
      type: String,
    },
    panRegion: {
      type: Object, // {chrom, start, stop}
    },
    genomeList: {
      type: Array,
    },
  },
  data() {
    let covMap = new Map();
    return {
      annotCoverageMatrix: covMap,
      roundingAccuracy: 100,
      scoreShouldBeRounded: true,
      bkptOn: true, //for dev logging purposes
      //TODO: Correct pav file and reajust block coordinates (that are 1 based and note 0 based)
      //TODO: Enable download only once gff data are uploaded
      //TODO: make the button pretty
    }
  },
  computed: {
    delimiter() {
      return '\t'
    },
    endOfLine() {
      return '\r\n';
    },
    exportFileName() {
      return `panacheExport_${this.panRegion.chrom}-${this.roundedStart}-${this.roundedStop}.tsv`;
    },
    header() {
      let row0 = `Panache PAV x GFF export`;
      let row1 = `PAV: ${this.pavFileName}`;
      let row2 = `Genes: ${this.gffFileName}`;
      let row3 = `Region: ${this.panRegion.chrom} from ${this.roundedStart} to ${this.roundedStop}`;
      return {row0, row1, row2, row3};
    },
    roundedStart() {
      return Math.round(this.panRegion.start)
    },
    roundedStop() {
      return Math.round(this.panRegion.stop)
    },
  },
  methods: {
    /**
     * Function writing a file containing, for each visible annotation, its presenceRate per genome
     * and saving it on the user's computer.
     */
    saveFile: function() {

      console.log(this.panRegion);
      console.log(this.panRegion.start);
      console.log(Math.round(this.panRegion.start));

      console.log({
        'pavData': this.pavDataOnDisplay, // [ {#Chromosome, Chromosome, FeatureStart, FeatureStop, Function, Sequence_IUPAC_Plus, SimilarBlocks, genoName1, genoName2, ...}, {...}]
        'pavFile': this.pavFileName,
        'gffData': this.gffDataOnDisplay, // [ {annotation, exons: [{start, stop}, {...}], geneName, annotStart, annotStop, geneStrand, leftOverlaps, rightOverlaps}, {...}]
        'gffFile': this.gffFileName, //Does not work somehow
        'currentRegion': this.panRegion // {chrom, start, stop}
      });

      let file = new Blob([this.writeExportFile()], { type: 'text/plain' });
      let fileUrl = window.URL.createObjectURL(file);

      //Create temporary link to downloadable file
      let link = document.createElement('a');
      link.href = fileUrl;
      link.download = this.exportFileName;
      link.style.display = 'none'; //hide the link from the web page

      //Download the file
      document.body.appendChild(link);
      link.click(); //Trigger the download action on the newly created link
      document.body.removeChild(link);

      //Clean the URL created for the occasion
      window.URL.revokeObjectURL(fileUrl);
    },
    /**
     * Function that writes a matrix with coverage score of each annotation for the
     * considered region. Turns it into a string along with commented headers.
     * Stores the newly created coverage matrix, if it had not been stored already.
     * @returns {String} = String looking like below:
     * # Panache PAV x GFF export
     * # PAV: ${this.pavFileName}
     * # Genes: ${this.gffFileName}
     * # Region: ${this.panRegion.chrom} from ${this.panRegion.start} to ${this.panRegion.stop}
     * annotID | meanCoverage   annotStart   annotStop | genoA | genoB | ...
     * gene1   | 100          | 16544      | 25789     | 100   | 100   |
     * gene2   | 98           | 445        | 756       | 100   | 95    |
     * ...
     */
    writeExportFile: function() {
      let headerArray = Object.values(this.header).map(value => `# ${value}`);

      // mapOfAnnot useful to retrieve annot properties per annotName when writing
      let mapOfAnnot = this.gffDataOnDisplay.reduce((newMap, annot) => {
        let { geneName, ...rest } = annot;
        newMap.set(geneName, rest);
        return newMap;
      }, new Map());

      //The component sotres all coverage matrices in a Map, it can retrieve it if already existing
      let scoreMatrix;
      if (this.annotCoverageMatrix.get(this.panRegion.chrom) != undefined) {
        scoreMatrix = this.annotCoverageMatrix.get(this.panRegion.chrom);
      } else {
        scoreMatrix = this.buildAnnotScoreMatrix(mapOfAnnot, this.computePresenceRates_ofChrom());
        this.annotCoverageMatrix.set(this.panRegion.chrom, scoreMatrix);
      }

      //Gather only visible data
      let localMatrix = scoreMatrix.filter( row => {
        let annotStart = row[2];
        let annotStop = row[3];

        let isMatching = this.isElementInRegion(annotStart, annotStop, this.panRegion.start, this.panRegion.stop);

        return isMatching;
      });

      let stringifiedScoreMatrix = localMatrix.map(row => [...row].join(this.delimiter));

      return [...headerArray, ...stringifiedScoreMatrix].join(this.endOfLine);
    },
    /**
     * Function adapted from SortOption_GffPresenceStatus.vue, which
     * computes a presence score for every annot in the current region,
     * that score being the proportion of length spanned by the annot being present
     * according to the PAV data.
     * @returns {Map} = mapOfScores[annotName] --> Map{genome1: score%, genome2: score%...}
     */
    computePresenceRates_ofChrom: function() {
      // Map that stores for each annotation the rate of their length found within at least one panBlock, per genome
      let mapOfScores = new Map();

      //For each annotation visible on screen
      this.gffDataOnDisplay.forEach( geneAnnot => {
        let mapOfScorePerGenome = this.computePresenceRates_ofAnnot(geneAnnot);
        mapOfScores.set(geneAnnot.geneName, mapOfScorePerGenome);
      });

      return mapOfScores;
    },
    /**
     * Function that returns a Map where each genome is associated with a presence score
     * for the current annotation, based on all panBlocks spanning its width.
     * @param geneAnnot = object, an annotation to consider and rate
     * @returns {Map} = mapOfScorePerGenome.get(genoName) --> presenceRate%
     */
    computePresenceRates_ofAnnot: function(geneAnnot) {
      let mapOfScorePerGenome = new Map();
      let annotStart = geneAnnot.geneStart;
      let annotStop = geneAnnot.geneStop;

      let { spannedBlocks, arrayOfBreakpoints, intervalLengths } = this.getBlocksSpannedByAnnotAndBkpts(annotStart, annotStop);

      let mapOfAbsenceProfiles = this.computeAbsenceProfiles(spannedBlocks, arrayOfBreakpoints);

      this.genomeList.forEach( genoName => {
        let presenceProfile = this.getPresenceProfile(mapOfAbsenceProfiles.get(genoName));
        mapOfScorePerGenome.set(genoName, this.presenceRate(presenceProfile, intervalLengths));
      });

      return mapOfScorePerGenome;
    },
    /**
     * Function that returns all the panBlocks overlaped by a given annotation
     * as well as the coordinates of breakpoints within that annot, corresponding
     * to the borders of said panBlocks when they are contained within the annot.
     * @param annotStart = integer, start coordinates of the annotation
     * @param annotStop = integer, end coordinates of the annotation
     * @returns {Array} = [panBlock_A, ..., panBlock_M]
     * @returns {Array} = [AnnotStart, BKPT_1, ..., BKPT_N, AnnotStop]
     * @returns {Array} = [Interval_0_length, ... Interval_N_length]
     */
    getBlocksSpannedByAnnotAndBkpts: function(annotStart, annotStop) {
      // Find the blocks for which we should check the pav status
      // Here the condition is that at least a part of the block(s) should
      // overlap the annotation
      let setOfBreakpoints = new Set([annotStart]);
      let spannedBlocks = this.pavDataOnDisplay.filter( block => {

        let isMatching = this.isElementInRegion(block.FeatureStart, block.FeatureStop, annotStart, annotStop);

        // Keep track of the breakpoints within the annotation, made
        // by the borders of PAV blocks
        if (isMatching) {
          setOfBreakpoints.add(Math.max(block.FeatureStart, annotStart));
          setOfBreakpoints.add(Math.min(block.FeatureStop, annotStop));
        }

        return isMatching
      });

      // Create the ordered array of breakpoints / intervals starting points

        //Example:
        //  Annot |------------------------------------------------------------|
        //        |         |                   |                    |
        //        <BKPT_A--><BKPT_B------------><BKPT_C-------------><BKPT_D--->
        //
        //  1.1   __________11111111111111111111________________________________
        //  1.2   222222222222222222222222222222222222222222222222222___________    an overlapping block, still on genome 1
        //  2.1   ______________________________________________________________
        //  2.2   444444444444444444444444444444444444444444444444444___________

      let arrayOfBreakpoints = Array.from(setOfBreakpoints).sort((a, b) => a - b); // Sort in increasing order

      let intervalLengths = [];
      for (let i = 0; i < arrayOfBreakpoints.length - 1; i++) {
        intervalLengths.push(arrayOfBreakpoints[i+1] - arrayOfBreakpoints[i])
      }

      arrayOfBreakpoints.pop(); // Final breakpoint is useless since it does not start any interval to check
      this.pauseLog({spannedBlocks, arrayOfBreakpoints, intervalLengths});

      return {spannedBlocks, arrayOfBreakpoints, intervalLengths};
    },
    /**
     * Function that returns a Map of the 'complete absence profile' of all genomes
     * based on the PAV status of panBlocks along the different intervals within
     * an annotation. Example of an absence profile for a given genome:
     *            Annot  |-----------------------------------------------------|
     *                   |         |            |                    |
     *                   <BKPT_A--><BKPT_B-----><BKPT_C-------------><BKPT_D--->
     *
     *        Profile 0  [    1    ,      1     ,          1         ,    1    ]
     * 
     *   PAV of block A  |         |     ABS    |         ABS        |   ABS   |
     *                        x0         x1               x1              x1
     * -> NEW Profile 1  [    0    ,      1     ,          1         ,    1    ]
     * 
     *   PAV of block B  |         |            |         ABS        |         |
     * -> NEW Profile 2  [    0    ,      0     ,          1         ,    0    ]
     * 
     *   PAV of block C  |   ABS   |            |         ABS        |         |
     * -> NEW Profile 3  [    0    ,      0     ,          1         ,    0    ]
     * 
     * The final profile stores, for one genome, the interval(s) that are not even
     * ounce found present in the blocks spanning this area.
     * Here, BKPT_C is always empty.
     * 
     * @param spannedBlocks = array, the panblocks overlapping the current annotation
     * @param arrayOfBreakpoints = array, integers tagging the first coordinate of an interval
     * @returns {Map} = mapOfAbsenceProfiles.get(genoName) -> [0, 0, 1, ..., 0] // the complete absence profile
     */
    computeAbsenceProfiles: function(spannedBlocks, arrayOfBreakpoints) {

      let mapOfAbsenceProfiles = new Map();

      this.genomeList.forEach( genoName => {

        let absenceProfile = new Array(arrayOfBreakpoints.length).fill(1);

        spannedBlocks.forEach( block => {
          // Is the block present in the genome checked? 0 absence score if true, 1 for false.
          let absenceScoreOfPanblockForGeno = ( Number(block[`${genoName}`]) != 0 ? 0 : 1 );

          // Update the absence profile based on new block info
          arrayOfBreakpoints.forEach( (bkpt, index) => {
            // Does the [breakpoint, nextBreakpoint[ interval has the block?
            let isPanblockLocatedInThisInterval = (block.FeatureStart <= bkpt) || (bkpt < block.FeatureStop );
            if ( isPanblockLocatedInThisInterval ) {
              absenceProfile[index] = absenceProfile[index] * absenceScoreOfPanblockForGeno;
            }
          });
        });

        //mapOfAbsenceProfiles.set(genoName, mapOfAbsenceProfiles);
        mapOfAbsenceProfiles.set(genoName, absenceProfile);
      });

      return mapOfAbsenceProfiles;
    },
    /**
     * Function that takes a complete absence profile and returns
     * a partial presence profile, ie. a profile describing the intervals
     * where a presence has been spotted at least once. It mirrors the
     * complete absence profile.
     * @param absenceProfile = array, 1 encodes complete absence, 0 partial presence
     * @returns {Array} = [0, 0, 1, ... 1] where 0 encode complete absence instead
     */
    getPresenceProfile: function(absenceProfile) {
      let presenceProfile = [];

      // Turn 0 into 1 and 1 into 0
      absenceProfile.forEach( absenceScore => {
        presenceProfile.push( Math.abs(absenceScore - 1) )
      })

      return presenceProfile;
    },
    /**
     * Function that returns all the panBlocks overlaped by a given annotation
     * as well as the coordinates of breakpoints within that annot, corresponding
     * to the borders of said panBlocks when they are contained within the annot.
     * @param presenceProfile = array, chunks of annotation found present at least once in all overlapping panBlocks
     * @param intervalLengths = integer, lengths of all annotation chunks
     * @returns {Number} = portion of the annotation found present in at least one panBlock, in percent;
     */
    presenceRate: function(presenceProfile, intervalLengths) {
      let presentPortion = 0;
      let totalLength = intervalLengths.reduce( (tempSum, value) => tempSum + value, 0 );

      intervalLengths.forEach( (length, i) => {
        presentPortion += length * presenceProfile[i] ;
      })

      let presenceRate = presentPortion / totalLength * 100;
      return presenceRate;
    },
    /**
     * Function that create a score matrix of coverage / presence rate
     * @param mapOfAnnot = Map, linking annotName to the rest of the annotation object
     * @param presenceRatesOfRegion = String, name of an annotation
     * @returns {Array} = [ header, [annotName, meanCoverage, annotStart, annotStop, coverGenoA, coverGenoB, ...], ... ]
     */
    buildAnnotScoreMatrix: function(mapOfAnnot, presenceRatesOfRegion) {
      let headerRow = ['annotID', 'meanCoverage', 'annotStart', 'annotStop', ...this.genomeList];

      let scoreMatrix = [];

      if (this.scoreShouldBeRounded) {
        presenceRatesOfRegion.forEach( (annotScores, annotName) => {
          scoreMatrix.push(this.getRoundedAnnotRow(mapOfAnnot, annotName, annotScores));
        });
      } else {
        presenceRatesOfRegion.forEach( (annotScores, annotName) => {
          scoreMatrix.push(this.getAnnotRow(mapOfAnnot, annotName, annotScores));
        });
      }

      scoreMatrix.sort(this.scoreMatrixCompare);

      return [headerRow, ...scoreMatrix];
    },
    /**
     * Function that create a score matrix row for an annotation, with raw scores
     * @param mapOfAnnot = Map, linking annotName to the rest of the annotation object
     * @param annotName = String, name of an annotation
     * @param annotScores = Map, linking genomes to a coverage score for the current annotation
     * @returns {Array} = [annotName, meanCoverage, annotStart, annotStop, coverGenoA, coverGenoB, ...]
     */
    getAnnotRow: function(mapOfAnnot, annotName, annotScores) {
      // Get the scores
      let arrayOfScores = [];
      this.genomeList.forEach( genoName => {
        arrayOfScores.push(annotScores.get(genoName))
      })

      // Get the first columns of the file
      let meanPercent = arrayOfScores.reduce( (tempSum, value) => tempSum + value, 0 ) / arrayOfScores.length;
      let firstColumns = [
        annotName,
        meanPercent,
        mapOfAnnot.get(annotName).annotStart,
        mapOfAnnot.get(annotName).annotStop
      ];

      return [...firstColumns, ...arrayOfScores];
    },
    /**
     * Function that create a score matrix row for an annotation, with rounded scores
     * @param mapOfAnnot = Map, linking annotName to the rest of the annotation object
     * @param annotName = String, name of an annotation
     * @param annotScores = Map, linking genomes to a coverage score for the current annotation
     * @returns {Array} = [annotName, meanCoverage, annotStart, annotStop, coverGenoA, coverGenoB, ...]
     */
    getRoundedAnnotRow: function(mapOfAnnot, annotName, annotScores) {
      // Get the scores
      let arrayOfScores = [];
      this.genomeList.forEach( genoName => {
        arrayOfScores.push( this.roundScore(annotScores.get(genoName)) );
      });

      // Get the first columns of the file
      let meanPercent = this.roundScore( arrayOfScores.reduce( (tempSum, value) => tempSum + value, 0 ) / arrayOfScores.length );
      let firstColumns = [
        annotName,
        meanPercent,
        mapOfAnnot.get(annotName).geneStart,
        mapOfAnnot.get(annotName).geneStop
      ];

      return [...firstColumns, ...arrayOfScores];
    },
    /**
     * Function that rounds a float based on an inner rounding accuracy
     * @param score = Number, float value to round
     * @returns {Number}
     */
    roundScore: function(score) {
      return Math.round( this.roundingAccuracy * score ) / this.roundingAccuracy;
    },
    /**
     * Function for Array.sort(), sorting rows of a score Matrix with the highest
     * score top, or alphabetically based on the annotation name if the scores
     * are equal
     * @param a = Array, first element to compare
     * @param b = Array, second element to compare
     * @returns {Number}
     */
    scoreMatrixCompare: function(a, b) {
      let scoreA = a[1];
      let nameA = a[0];
      let scoreB = b[1];
      let nameB = b[0];

      if (scoreA == scoreB) {
        return nameA.localeCompare(nameB); //alphabetical sort based on local language
      } else {
        return scoreB - scoreA; // Higher scores top
      }
    },
    isElementInRegion: function(start, stop, leftBorder, rightBorder) {

        let elementStartIsInRegion = ( leftBorder <= parseInt(start) ) && ( parseInt(start) <= rightBorder );
        let elementStopIsInRegion = ( leftBorder <= parseInt(stop) ) && ( parseInt(stop) <= rightBorder );
        let elementSpansRegion = ( parseInt(start) <= leftBorder) && ( rightBorder <= parseInt(stop) );

        let isMatching = (elementStartIsInRegion || elementStopIsInRegion || elementSpansRegion);

        return isMatching
    },
    pauseLog: function(toLog) {
      if (this.bkptOn) {
        console.log(toLog);
        this.bkptOn = false;
      }
    },
  },
  watch: {
    // Watch panRegion chrom changes to retrieve coverage data
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.wrapperFileLoader {
  display: grid;
  grid-template-rows: repeat(2, auto);
  overflow: hidden;
}

.loaderLabel {
  grid-row: 1;
  text-align: center;
  align-self: center;
  margin-bottom: 0;
}

.loaderInput {
  grid-row: 2;
  align-self: center;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
}

</style>
