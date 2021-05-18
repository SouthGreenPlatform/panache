<template>
  <div>
    <b-input-group size="sm" class="mb-2">
      <b-form-input class="padLeft075" @keyup.enter="jumpToPosition(selectedGene)" v-model="selectedGene"></b-form-input>
      <b-input-group-append>
        <b-button class="h31" size="sm" variant="outline-info" @click="jumpToPosition(selectedGene)">GO</b-button>
      </b-input-group-append>
    </b-input-group>

    <b-form-group class="noMarginBottom">
      <b-form-tags id="tags-with-dropdown" v-model="value" no-outer-focus class="revokeBootstrapCSS">
        <template v-slot="{disabled}">
          <!-- SEARCH BAR -->
          <b-dropdown size="sm" variant="outline-info" class="mb-2" block menu-class="w-100">
            <template #button-content>
              Search gene name
            </template>
            <b-dropdown-form @submit.stop.prevent="() => {}">
              <b-form-group
                  label="Search genes"
                  label-for="tag-search-input"
                  label-cols-md="auto"
                  class="mb-2 displayBlock"
                  label-size="sm"
                  :disabled="disabled"
              >
                <b-form-input
                    v-model="search"
                    id="tag-search-input"
                    type="search"
                    size="sm"
                    autocomplete="off"
                ></b-form-input>
              </b-form-group>
            </b-dropdown-form>
            <b-dropdown-divider></b-dropdown-divider>
            <!-- AVAILABLE OPTIONS IN SEARCH BAR -->
            <b-dropdown-item-button
                v-for="option in availableOptions"
                :key="option"
                @click="selectedGene = option"
            >
              <div class="ellipsis">{{ option }}</div>
            </b-dropdown-item-button>
            <!-- INFORMATIONS ABOUT YOUR RESEARCH -->
            <b-dropdown-text v-if="criteria.length >= searchMinChar && availableOptions.length === 0">
              There are no tags available to select
            </b-dropdown-text>
            <b-dropdown-text v-else-if="criteria.length < searchMinChar && availableOptions.length === 0">
              The research should be at least {{ searchMinChar }} characters long
            </b-dropdown-text>
          </b-dropdown>
        </template>
      </b-form-tags>
    </b-form-group>
  </div>
</template>

<script>
import {mapActions, mapState} from "vuex";

export default {
  name: "GenePosition",
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
      selectedChrom: null,
      selectedGene: 'GeneName',
      GeneListChrom: Array,
      search: '',
      value: [],
      searchMinChar: 3,
    }
  },
  computed: {
    ...mapState({
      geneList: 'geneList',
      geneListSelectedChrom: 'geneListChromInDisplay',
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
      if (criteria.length >= this.searchMinChar) { // Verify if the criteria is longer than the minimum of characters expected
        const options = [...this.geneListSelectedChrom].filter(opt => this.value.indexOf(opt) === -1); // Get the genes that correspond to the criteria
        if (criteria && criteria.length >= this.searchMinChar) {
          // Show only options that match criteria
          return options.filter(opt => opt.toLowerCase().indexOf(criteria) > -1);  // Return the options available
        }
        // Show all options available
        return options;
      } else {
        return '';
      }
    },
  },
  methods: {
    ...mapActions({
      updateSelectedChromStore: 'updateSelectedChrom',
    }),
    updateSelectedChrom(selectedChrom) {
      this.selectedChrom = selectedChrom;
    },
    pxToNt(pxAmount) {
      return pxAmount / this.ntWidthInPixel;
    },
    jumpToPosition(geneToReach) {
      if (this.geneList.has(geneToReach)) {
        let genePosition = this.geneList.get(geneToReach)[0];
        if (genePosition !== undefined) {
          this.targetedPosNt = genePosition;
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

</style>