<template>

  <FileLoader
      :labelToDisplay="'Optional Newick'"
      :allowedExtensions="['nwk', 'tree', 'txt']"
      :idBonus="'NewickFile'"
      @file-loaded="readNewickFile"
  />

</template>

<script>

import {mapActions} from "vuex";
import FileLoader from "@/components/FileLoader";

export default {
  name: 'NewickFileParser',
  components: {FileLoader},
  props: {
    genomeList: {
      type: Array,
      required: true
    },
    updateNewickTree: {
      type: Function,
      required: true
    },
    updateNewickString: {
      type: Function,
      required: true
    },
  },
  computed: {
    self() {
      return this;
    }
  },
  methods: {
    ...mapActions ([
        'pushSortModeInSortChoice',
    ]),
    /**
     * Function that read a newick file and call the parser function.
     * @param loadedFile = file returned by the FileLoader
     */
    readNewickFile(loadedFile) {
      let parser = require("biojs-io-newick"); // Use the lib biojs-io-newick
      let newickTreeData = "";
      let parsedNewickData = "";
      let file = loadedFile;
      let reader = new FileReader();
      reader.addEventListener("load", () => { // When the reader is loaded
        newickTreeData = reader.result;
        console.log({newickTreeData});
        this.updateNewickString(newickTreeData); // Update the store with the new newick data extracted from the file
        parsedNewickData = parser.parse_newick(newickTreeData); // Parse the data with the function parse_newick of the biojs-io-newick into a newick tree
        console.log({parsedNewickData});
        let list = this.recursiveSearchChild(parsedNewickData); // Push the genomes in a list in function of their position in the tree.
        console.log({list});
        this.compareNewickListToGenomeList(list); // Verify that the list is correct
      });
      reader.readAsText(file);
    },
    /**
     * Function that return a list of the genome in the order of their place in the phylogenetic tree.
     * @param data = data provided by the function readNewickFile
     * @returns {[]} = list of the genome
     */
    recursiveSearchChild(data) {
      let listGenome = []; // Initialise the list returned at the end of the research
      if (data !== null && data !== undefined) { // Verify that de the data provided is not null or undefined
        this.recursiveSearchChildAux(listGenome, data); // Lunch the recursive research of the child
        return listGenome;
      }
    },
    /**
     * Function that add in the list of the genome the name of the leaves (genomes) and search for other leaves.
     * @param data = data provided by the function recursiveSearchChild
     * @param list = list provided by the function recursiveSearchChild
     */
    recursiveSearchChildAux(list, data) {
      if (data !== null &&
          data !== undefined &&
          data.children !== undefined) { // Verify that de the data provided is not null or undefined and the existence of data's children
        for (let i = 0; i < data.children.length; i++) { // For each of data's children
          this.recursiveSearchChildAux(list, data.children[i]); // Do the same thing (recursive)
          if (data.children[i].name !== "") { // If the child as a name (its a leaf)
            list.push(data.children[i].name); // Add the genome name into the list
          }
        }
      }
    },
    /**
     * Function that verify that the list extracted from the file contains the right genomes.
     * @param list = list provided by the function readNewickFile
     */
    compareNewickListToGenomeList(list) {
      if (this.arrayCompare(this.genomeList, list)) {
        this.updateNewickTree(list); // Update updateNewickTree with the list
        this.pushSortModeInSortChoice( 'Phylogenetic tree'); // Add the choice to sort by phylogenetic tree
      }
    },
    arrayCompare(list1, list2) {
      if (Array.isArray(list1) && Array.isArray(list2) && list1.length === list2.length) { // Verify that the two parameters are Array and that they have the same length
        // Concatenate and sort the Array to have the same order in both of them
        let array1 = list1.concat().sort();
        let array2 = list2.concat().sort();

        // Compare elements in each list one by one
        for (let i = 0; i < array1.length; i++) {
          if (array2[i] !== array2[i]) { // If not equals
            return false;
          }
        }
        return true;
      } else {
        return false;
      }
    }
  },
}
</script>

<style>

</style>
