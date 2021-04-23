<template>

  <FileLoader
      :labelToDisplay="'Optional Newick'"
      :allowedExtension="['nwk']"
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
    genomeListNewickTree: {
      type: Array,
    },
  },
  computed: {
    self() {
      return this;
    }
  },
  methods: {
    ...mapActions ([
        'updateNewickTreeData',
        'pushSortModeInSortChoice',
    ]),
    readNewickFile(loadedFile) {
      let parser = require("biojs-io-newick");
      let newickTreeData = "";
      let parsedNewickData = "";
      let file = loadedFile;
      let reader = new FileReader();
      reader.addEventListener("load", () => {
        newickTreeData = reader.result;
        console.log(newickTreeData);
        parsedNewickData = parser.parse_newick(newickTreeData);
        console.log(parsedNewickData);
        let list = this.recursiveSearchChild(parsedNewickData).reverse();
        console.log(list);
        this.compareNewickListToGenomeList(list);
      });
      reader.readAsText(file);
    },
    recursiveSearchChild(data) {
      let listGenome = [];
      if (data !== null && data !== undefined) {
        this.recursiveSearchChildAux(listGenome, data);
        return listGenome;
      }
    },
    recursiveSearchChildAux(list, data) {
      if (data !== null && data !== undefined && data.children !== undefined) {
        for (let i = 0; i < data.children.length; i++) {
          this.recursiveSearchChildAux(list, data.children[i]);
          if (data.children[i].name !== "") {
            list.push(data.children[i].name);
          }
        }
      }
    },
    compareNewickListToGenomeList(list) {
      console.log(this.genomeList);
      if (this.arrayCompare(this.genomeList, list)) {
        console.log("Ready to sort !");
        this.updateNewickTreeData(list);
        this.pushSortModeInSortChoice( 'Phylogenetic tree');
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
