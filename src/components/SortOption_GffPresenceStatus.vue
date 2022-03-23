<template>
  <div>
<!--    <b-form-group label="Tagged input using dropdown" label-for="tags-with-dropdown">-->
    <b-form-group class="noMarginBottom">
      <b-form-tags id="tags-with-dropdown" v-model="tagNames" no-outer-focus class="revokeBootstrapCSS">
        <template v-slot="{ tags, disabled, addTag, removeTag }">
          <!-- SEARCH BAR -->
          <b-dropdown size="sm" variant="outline-secondary" class="mb-2" block menu-class="w-100">
            <template #button-content>
              <b-icon icon="tag-fill"></b-icon> Select annotation(s)
            </template>
            <b-dropdown-form @submit.stop.prevent="() => {}">
              <b-form-group
                  label="Search annotations"
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
                v-for="option in matchingAnnotNames"
                :key="option"
                @click="onOptionClick({ option, addTag })"
            >
              <div class="ellipsis">{{ option }}</div>
            </b-dropdown-item-button>
            <!-- INFORMATIONS ABOUT YOUR RESEARCH -->
            <b-dropdown-text v-if="searchCriteria.length >= searchMinChar && matchingAnnotNames.length === 0">
              There are no tags available to select
            </b-dropdown-text>
            <b-dropdown-text v-else-if="searchCriteria.length < searchMinChar && matchingAnnotNames.length === 0">
              The research should be at least {{ searchMinChar }} characters long
            </b-dropdown-text>
          </b-dropdown>

          <!-- SORTING BUTTON -->
          <b-button v-show="tagNames.length > 0"
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

          <!-- LIST OF THE ANNOT TAGS THAT ARE SELECTED AS FILTER(S) -->
          <div :key="componentKey">
            <b-input-group v-for="tag in tags" :key="tag" size="sm" v-show="mapOfPresenceStatus.has(tag)" :prepend="mapOfPresenceStatus.get(tag) ? 'Presence' : 'Absence'" class="mb-2 tagCustomCSS">
              <b-input-group-prepend is-text>
                <!-- CHECKBOX TO CHANGE THE DESIRED PRESENCE STATUS OF THE ANNOT -->
                <b-form-checkbox
                    switch
                    class="mr-n2 noBorderLeft"
                    :class="'noBorderLeft'"
                    :checked="mapOfPresenceStatus.get(tag)"
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
  name: "SortOption_GffPresenceStatus",
  data() {
    return {
      search: '',
      tagNames: [], //TODO Rename, is it the possible names for annots? Name from bootstrap tags?
      searchMinChar: 3,
      mapOfPresenceStatus: new Map(),
      hasSearchHappened: false,
      popupDiv: [],
      componentKey: 0,
    }
  },
  computed: {
    ...mapState({
      annotMap: 'geneList', //TODO change to annot in store
      genomeList: 'genomeListInDisplay',
    }),
    /**
     * Function that returns the research criteria.
     * @returns {string} = research criteria
     */
    searchCriteria() {
      // Compute the search criteria
      return this.search.trim().toLowerCase();
    },
    /**
     * Function that returns the named annotations matching to the research criteria.
     * @returns {Array} = list of all matching annotation names, empty if none found
     */
    matchingAnnotNames() {
      let criteria = this.searchCriteria;

      if (criteria.length >= this.searchMinChar) {
        // From annotMap, get names matching the search criteria
        let matchingNames = [...this.annotMap.keys()].filter(opt => opt.toLowerCase().indexOf(criteria) > -1);

        // Filter out already selected options
        return matchingNames.filter(opt => this.tagNames.indexOf(opt) === -1);

      } else { return [] }
    },
  },
  methods: {
    ...mapActions([
      'updateGenomesInDisplay',
    ]),
    /**
     * Add a named annot to tags (a Bootstrap.Vue list).
     * @param option = Named annot to add
     * @param addTag = function addTag of Bootstrap.Vue
     */
    onOptionClick({ option, addTag }) {
      addTag(option); // Add the annot to the tag list
      this.search = ''; // Empty the search bar
    },
    /**
     * Sort the genomes based on their scores.
     */
    sortByTags() {

      let scorePerGenome = this.applyScoresToGenomes();

       // Sort the ranking Map in function of their number of points.
      let rankGenomes = new Map([...scorePerGenome.entries()].sort((a, b) => b[1] - a[1]));

      // Update the popup displaying the scores
      this.popupDiv = []; // Clear previous info
      this.genomeList.forEach( genome => {
        this.popupDiv.push(genome + " (" + Math.round(rankGenomes.get(genome) / this.mapOfPresenceStatus.size * 100) + "%)");
      });

      // Update the store with the new genome order
      this.updateGenomesInDisplay([...rankGenomes.keys()]);
      this.hasSearchHappened = true; // Enables the info popup to appear on screen
    },
    /**
     * Update the status of research of an annotation.
     * @param annot = The annot to which you want to update the status
     */
    updateStatus(annot) {
      this.mapOfPresenceStatus.set(annot, !this.mapOfPresenceStatus.get(annot))
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
    /**
     * XXXXX
     * @returns {Map} = mapOfScores[genome] --> score
     */
    applyScoresToGenomes() {
      // Map that stores the scores of each genome depending on how well they match the tags
      let mapOfScores = new Map();

      // Initializing at 0
      for (let i = 0; i < this.genomeList.length; i++) {
        mapOfScores.set(this.genomeList[i], 0)
      }

      // Ranks genomes according to their matching score with the choosen tags
      this.mapOfPresenceStatus.forEach( (desiredPavStatus, annotName) => {

        let annotObj = this.annotMap.get(annotName);
        let annotPosition = annotObj[0];
        let annotChrom = annotObj[1];
        let chromPavBlocks = [...nonReactiveDataStore.fullChromData[annotChrom]]; // Get the list of PAV blocks found in annotChrom

        chromPavBlocks.forEach( block => {

          // Checks if position matches
          if (parseInt(block.FeatureStart) - 1 === annotPosition) {

            this.genomeList.forEach( geno => {
              //Checks if there a match between desired and actual presence/absence statuses
              let actualPavStatus = parseInt(block[geno]);

              if ((desiredPavStatus && actualPavStatus > 0) ||
                  (!desiredPavStatus && actualPavStatus === 0)) {

                 // Increment the score accordingly
                mapOfScores.set(geno, mapOfScores.get(geno) + 1);
              }
            });

          }
        });
      });

      return mapOfScores
    },
  },
  watch: {
    tagNames() {

      let currentTags = [...this.tagNames];

      // In Map, remove keys from deleted tags
      this.mapOfPresenceStatus.forEach( (val, key) => {

        if (currentTags.includes(key)) {
          let idxToDel = currentTags.indexOf(key);
          currentTags.splice(idxToDel, 1);

        } else {
          this.mapOfPresenceStatus.delete(key);
        }

      });

      // Add new (key, value) according to new tag
      currentTags.forEach( (annotName) => {
        this.mapOfPresenceStatus.set(annotName, true);
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