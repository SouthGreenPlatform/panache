<template>
  <div>
<!--    <b-form-group label="Tagged input using dropdown" label-for="tags-with-dropdown">-->
    <b-form-group class="noMarginBottom">
      <b-form-tags id="tags-with-dropdown" v-model="value" no-outer-focus class="revokeBootstrapCSS">
        <template v-slot="{ tags, disabled, addTag, removeTag }">
          <!-- SEARCH BAR -->
          <b-dropdown size="sm" variant="outline-secondary" class="mb-2" block menu-class="w-100">
            <template #button-content>
              <b-icon icon="tag-fill"></b-icon> Choose gene
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
                @click="onOptionClick({ option, addTag })"
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

          <!-- SORTING BUTTON -->
          <b-button v-show="value.length > 0"
                    block
                    class="mb-2 buttonPanache"
                    size="sm"
                    @click="sortByTags">
            Sort with tags
          </b-button>

          <!-- POPUP OF INFORMATIONS ABOUT THE GENOMES -->
          <div v-show="hasSearchHappened">
            <b-button
                class="mb-2 buttonPanache"
                size="sm"
                block
                id="popover-target-1">
              Informations about search
            </b-button>
            <b-popover target="popover-target-1" triggers="hover" placement="top">
              <template #title>Search criteria percentages</template>
              <div v-for="genomeInfo in popupDiv" :key="genomeInfo">
                {{ genomeInfo }}
              </div>
            </b-popover>
          </div>

          <!-- LIST OF THE TAGS (GENE) YOU WANT TO USE AS FILTER -->
          <div :key="componentKey">
            <b-input-group v-for="tag in tags" :key="tag" size="sm" v-show="presenceMap.has(tag)" :prepend="presenceMap.get(tag) ? 'Presence' : 'Absence'" class="mb-2 tagCustomCSS">
              <b-input-group-prepend is-text>
                <!-- CHECKBOX TO CHANGE THE STATUS OF THE GENE IN THE FILTER -->
                <b-form-checkbox
                    switch
                    class="mr-n2 noBorderLeft"
                    :class="'noBorderLeft'"
                    :checked="presenceMap.get(tag)"
                    @change="updateStatus(tag)"
                    :id="'switch_' + tag">
                </b-form-checkbox>
              </b-input-group-prepend>
              <b-form-input class="inputTag" disabled aria-label="Large text input with switch" :placeholder="tag"></b-form-input>
              <b-input-group-append is-text>
                <b-icon icon="x" @click="removeTag(tag)" class="cursorP"/>
              </b-input-group-append>
            </b-input-group>
          </div>
        </template>
      </b-form-tags>
    </b-form-group>
  </div>
</template>

<script>
import {mapActions, mapState} from "vuex";
import {nonReactiveDataStore} from '@/store/non-reactive-data';

export default {
  name: "GeneSearchBar",
  data() {
    return {
      search: '',
      value: [],
      searchMinChar: 3,
      presenceMap: new Map(),
      hasSearchHappened: false,
      popupDiv: [],
      componentKey: 0
    }
  },
  computed: {
    ...mapState({
      geneList: 'geneList',
      genomeList: 'genomeListInDisplay',
      // fullChromData: 'fullChromData',
    }),
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
        const options = [...this.geneList.keys()].filter(opt => this.value.indexOf(opt) === -1); // Get the genes that match to the criteria from geneList
        return options.filter(opt => opt.toLowerCase().indexOf(criteria) > -1);  // Return the options available
      } else {
        return '';
      }
    },
  },
  methods: {
    ...mapActions([
      'updateGenomesInDisplay',
    ]),
    /**
     * Add an gene to tags (a Bootstrap.Vue list).
     * @param option = Gene in that you want to add
     * @param addTag = function addTag of Bootstrap.Vue
     */
    onOptionClick({ option, addTag }) {
      addTag(option); // Add the gene to le tags list
      this.search = ''; // Empty the search bar
    },
    /**
     * Sort the genome in function of the genes in the filter.
     */
    sortByTags() {
      let rankGenomes = new Map; // Create a map to rank the genomes in function on their correspondance with the tags
      for (let i = 0; i < this.genomeList.length; i++) {
        rankGenomes.set(this.genomeList[i], 0); // Set the Map with 0
      }

      // Ranks genomes according to their correspondence with the gene in filter
      for (let i = 0; i < this.presenceMap.size; i++) { // For each gene in tags (for each filter applied)
        let gene = this.geneList.get([...this.presenceMap.keys()][i]); // Get the gene informations from geneList
        let geneStatus = [...this.presenceMap.values()][i]; // Get the gene's status
        let genePosition = gene[0]; // Get the gene's position
        let geneChrom = gene[1]; // Get the gene's chromosome
        let geneListChrom = [...nonReactiveDataStore.fullChromData[geneChrom]]; // Get the gene's chromosome's gene list
        for (let j = 0; j < geneListChrom.length; j++) { // Full gene list exploration
          if (parseInt(geneListChrom[j].FeatureStart) - 1 === genePosition) { // Verify if the gene position match the gene.FeatureStart in the gene list
            for (let k = 0; k < this.genomeList.length; k++) { // If that the case then : full genome list exploration
              let genomeK = this.genomeList[k]; // Variable for the genome with index K of the list of genomes
              let presenceStatus = parseInt(geneListChrom[j][genomeK]); // Get the presence status of the gene for genomeK
              if ((geneStatus && presenceStatus > 0) ||
                  (!geneStatus && presenceStatus === 0)) { // If the gene is actually present or absent and match the status requested
                rankGenomes.set(genomeK, rankGenomes.get(genomeK) + 1); // Increase the points of correspondence of the genome
              }
            }
          }
        }
      }
      rankGenomes = new Map([...rankGenomes.entries()].sort((a, b) => b[1] - a[1])); // Sort the ranking Map in function of their number of points.

      // Update the of popup that give informations about the points
      this.popupDiv = []; // Empty the popup that give informations about the points
      for (let i = 0; i < this.genomeList.length; i++) {
        let genome = [...rankGenomes.keys()][i];
        // Add informations about the correspondence for each genome in the popup.
        this.popupDiv.push(genome + " (" + Math.round(rankGenomes.get(genome) / this.presenceMap.size * 100) + "%)");
      }

      // Update the genomes in display with the sorted list
      this.updateGenomesInDisplay([...rankGenomes.keys()]); // Update the order of the genome in the store in function of their rank.
      this.hasSearchHappened = true; // Turn hasSearchHappened to true to allow the popup to appear on Panache
    },
    /**
     * Update the status of research of a gene.
     * @param gene = The gene to which you want to update the status
     */
    updateStatus(gene) {
      this.presenceMap.set(gene, !this.presenceMap.get(gene))
      this.hasSearchHappened = false; // Turn hasSearchHappened to false to not misinform the user and hide the popup
      this.forceRerender();
    },
    /**
     * Function that force area with componentKey as key to rerender.
     */
    forceRerender() {
      this.componentKey += 1;
      if (this.componentKey > 2) { // To avoid a large number
        this.componentKey = 0;
      }
    },
  },
  watch: {
    value() {
      let newValues = [...this.value];
      // In Map, remove keys from deleted tags
      this.presenceMap.forEach( (val, key) => {
        if (newValues.includes(key)) {
          let idxToDel = newValues.indexOf(key);
          newValues.splice(idxToDel, 1);
        } else {
          this.presenceMap.delete(key);
        }
      });

      // Add new (key, value) according to new tag
      newValues.forEach( (geneName) => {
        this.presenceMap.set(geneName, true);
      });
    }
  }
}

</script>

<style scoped>

.width100P {
  width: 100%;
}

.revokeBootstrapCSS {
  padding: 0px;
  border: none;
}

.displayBlock {
  display: block;
}

.noMarginBottom {
  margin-bottom: 0;
}

.ellipsis {
  text-overflow: ellipsis;
  overflow: hidden;
}

.noBordeRight{
  border-right: none;
}

.noBorderLeft {
  border-left: none;
}

.test {
  display: inline;
}

.cursorP {
  cursor: pointer;
}

.inputTag {
  color: #495057;
  background-color: white;
  height: 34px !important;
}

.inputTag::placeholder {
  color: #495057;
}

</style>

<style>

.tagCustomCSS .input-group-prepend:first-child .input-group-text {
  width: 78px !important;
}

</style>