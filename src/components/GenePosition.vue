<template>
  <div class="geneP">
    <vue-bootstrap-typeahead
        size="sm"
        v-model="selectedGene"
        :data="annotMapNames"
        :minMatchingChars="3"
        :maxMatches="50"
        placeholder="Search a gene name ..."
        @hit="jumpToPosition(selectedGene)"
    />
  </div>
</template>

<script>
import {mapActions, mapState} from "vuex";
import VueBootstrapTypeahead from 'vue-bootstrap-typeahead'

export default {
  name: "GenePosition",
  components: {
    VueBootstrapTypeahead,
  },
  props: {
    lastNt: {
      type: Number,
      required: true
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
    currentFirstNt: {
      type: Number,
      default: 0
    },
    chromList: {
      type: Array,
      required: true
    },
  },
  data() {
    return {
      targetedPosNt: Number(),
      selectedGene: 'GeneName',
      annotMapChrom: Array,
      search: '',
      value: [],
      searchMinChar: 3,
    }
  },
  computed: {
    ...mapState({
      annotMap: 'annotMap',
      annotMapNames: 'annotMapNames',
      annotMapSelectedChrom: 'annotMapChromInDisplay',
      selectedChrom: 'selectedChrom',
    }),
    maxFirstNt() {
      return this.lastNt - this.pxToNt(this.displayWindowWidth);
    },
    amountOfNtInHalfScreen() {
      return this.pxToNt(this.displayWindowWidth / 2);
    },
    desiredFirstNt() {
      return this.targetedPosNt - this.amountOfNtInHalfScreen;
    },
    reachableFirstNt() {
      if (0 <= this.desiredFirstNt && this.desiredFirstNt <= this.maxFirstNt) {
        return this.desiredFirstNt;
      } else if (this.desiredFirstNt < 0) {
        return 0;
      } else {
        return this.maxFirstNt;
      }
    },
    /**
     * Function that return the criteria of research.
     * @returns {string} = criteria of research
     */
    criteria() {
      // Compute the search criteria
      return this.search.trim().toLowerCase();
    },
    /**
     * Function that return the genes corresponding to the criteria of research.
     * @returns {string} = if there is gene available for the criteria
     */
    availableOptions() {
      const criteria = this.criteria; // Get the criteria
      // Filter out already selected options
      if (criteria && criteria.length >= this.searchMinChar) { // Verify if the criteria is longer than the minimum of characters expected
        const options = [...this.annotMapSelectedChrom].filter(opt => this.value.indexOf(opt) === -1); // Get the genes that correspond to the criteria
        return options.filter(opt => opt.toLowerCase().indexOf(criteria) > -1);  // Return the options available
      } else {
        return '';
      }
    },
  },
  methods: {
    ...mapActions({
      updateSelectedChromStore: 'updateSelectedChrom',
    }),
    pxToNt(pxAmount) {
      return pxAmount / this.ntWidthInPixel;
    },
    jumpToPosition(geneToReach) {
      if (this.annotMap.has(geneToReach)) {
        let geneStart = this.annotMap.get(geneToReach)[0];
        let geneChrom = this.annotMap.get(geneToReach)[2];
        if (geneStart !== undefined) {
          this.targetedPosNt = geneStart;
        }
        if (geneChrom !== this.selectedChrom) {
          this.updateSelectedChromStore(geneChrom);
        }
      }
    },
  },
  watch: {
    reachableFirstNt: function () {
      this.updateGlobalFirstNt(this.reachableFirstNt);
    },
    currentFirstNt: function () {
      this.targetedPosNt = Math.round(this.currentFirstNt + this.amountOfNtInHalfScreen);
    },
    ntWidthInPixel: function () {
      let floatTarget = (2 * this.currentFirstNt + this.pxToNt(this.displayWindowWidth)) / 2;
      this.targetedPosNt = Math.floor(floatTarget);
    },
  },
}
</script>

<style scoped>

.h31 {
  height: 31px;
}

.padLeft075 {
  padding-left: 0.75rem;;
}

.revokeBootstrapCSS {
  padding: 0px;
  border: none;
}

.noMarginBottom {
  margin-bottom: 0;
}

.geneP {
  display: inline-block;
  position: relative;
  width: 100%;
}

</style>