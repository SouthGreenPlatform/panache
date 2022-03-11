<template>
  <div>
    <b-button
        id="localGenePatternDisplayButton"
        @click="sortBetweenValues"
        size="sm"
        class="buttonPanache"
        block
        variant="light">
      Sort by local pattern
    </b-button>
    <b-popover v-if="hasSortHappened" target="localGenePatternDisplayButton" triggers="hover" placement="top">
      <template #title class="centerT">Informations about values</template>
      <p>
        Left value : {{ leftValue }}
        <br>
        Right value : {{ rightValue }}
      </p>
    </b-popover>
  </div>
</template>

<script>
import {mapActions, mapGetters, mapState} from "vuex";
import {clusterData} from "@greenelab/hclust";
import {nonReactiveDataStore} from '@/store/non-reactive-data';

export default {
  name: "LocalGenePattern",
  data() {
    return {
      hasSortHappened: false,
      rightValue: 0,
      leftValue: 0,
    }
  },
  computed: {
    ...mapState({
      localAreaSelected: 'localAreaSelected',
      firstNtToDisplay: 'firstNtToDisplay',
      currentDisplayNtWidthInPx : 'currentDisplayNtWidthInPx',
      selectedChrom: 'selectedChrom',
      // fullChromData: 'fullChromData',
      genomeListInDisplay: 'genomeListInDisplay',
    }),
    ...mapGetters({
      displayWindowWidth: 'displayWindowWidth',
    }),
  },
  methods: {
    ...mapActions([
      'updateGenomesInDisplay',
    ]),
    /**
     * Transform the value in pixel to a value in nucleotide
     * @param pxAmount value in pixel
     * @returns {number} value in nucleotide
     */
    pxToNt(pxAmount) {
      if (pxAmount <= 0) { // Check if the value don't go in the negative (normally impossible)
        return 0;
      } else if (pxAmount >= this.displayWindowWidth) { // Check if the value is not higher than the size of the display (this is the case at the beginning)
        return this.displayWindowWidth / this.currentDisplayNtWidthInPx + this.firstNtToDisplay;
      } else { // If everything is alright
        return pxAmount / this.currentDisplayNtWidthInPx + this.firstNtToDisplay;
      }
    },

    /**
     * Sort the genomes in display by local phylogeny with the gene between the
     * two sliders (selected area) from the component PresencePatternSelector.
     */
    sortBetweenValues() {
      // Change the value of hasSortHappened to display informations
      this.hasSortHappened = true;

      // Search the genes that match the selected area
      let geneBetweenValues = [];
      let selectedChromData = nonReactiveDataStore.fullChromData[this.selectedChrom]; // Get the data of the chromosome in display
      this.leftValue = Math.round(this.pxToNt(this.localAreaSelected[0]));
      this.rightValue = Math.round(this.pxToNt(this.localAreaSelected[1]));
      for (let i = 0; i < selectedChromData.length; i++) { // Check every gene of the chromosome
        if (selectedChromData[i].FeatureStart >= this.leftValue &&
            selectedChromData[i].FeatureStop <= this.rightValue) {
          geneBetweenValues.push(selectedChromData[i]); // Add the gene to list if its in the selected area
        }
      }

      // Create a list that contain a list for avery genome and their presence/absence pattern of avery gene in geneBetweenValues
      let presencePatternList = [];
      for (let i = 0; i < this.genomeListInDisplay.length; i++) {
        presencePatternList.push([]);
      }

      // Fill presencePatternList with the data of every gene status for every genome for every gene in geneBetweenValues
      for (let i = 0; i < geneBetweenValues.length; i++) {
        for (let j = 0; j < this.genomeListInDisplay.length; j++) {
          if (parseInt(geneBetweenValues[i][this.genomeListInDisplay[j]]) === 0) { // Check if the presence status === 0
            presencePatternList[j].push(0); // If presence status === 0
          } else {
            presencePatternList[j].push(1); // If presence status >= 0
          }
        }
      }

      // Usage of the hclust library to create a cluster and order the genome by local phylogeny with the gene in geneBetweenValues
      let clusterOrder = clusterData({ data: presencePatternList, distance: this.simpleMatching, onProgress: this.displayNothing}).order;
      let genomeListSorted = []; // Create a list that will contain the genomes newly sorted
      for (let i = 0; i < clusterOrder.length; i++) {
        genomeListSorted.push(this.genomeListInDisplay[clusterOrder[i]]) // Fill the list with the genome by their order in clusterOrder
      }
      this.updateGenomesInDisplay(genomeListSorted); // Update the genomes in display with he sorted list
    }
    ,
    /**
     * Function that return the dissimilarity index between two arrays.
     * @param a first binary array
     * @param b second binary array
     * @returns {number} dissimilarity index
     */
    simpleMatching(a, b) {
      const size = Math.min(a.length, b.length); // Get the lowest array length as size for calculate (they have the same length normally)
      let nbExactMatch = 0; // Initialising of the counter of similarity index

      for (let index = 0; index < size; index++) { // For each value in the arrays
        if ((a[index] === 1 && b[index] === 1) ||
            (a[index] === 0 && b[index] === 0)) {
          nbExactMatch++; // If the array both contains an 0 or an 1, increase the counter
        }
      }

      return 1 - nbExactMatch / size; // Return the dissimilarity index
    },
    displayNothing() {
      // Do nothing
    }
  }
}
</script>

<style scoped>

.centerT {
  text-align: center;
}

</style>

<style>

.popover {
  -webkit-box-shadow: 0px 0px 9px -3px #000000;
  box-shadow: 0px 0px 9px -3px #000000;
}

</style>