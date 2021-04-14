<template>

    <FileLoader
      :labelToDisplay="'Optional Newick'"
      :idBonus="'NewickFile'"
      @file-loaded="parseFileToNewickObjects"
    />

</template>

<script>
import FileLoader from '@/components/FileLoader.vue';

import * as d3 from "d3";

export default {
  name: 'NewickFileParser',
  components: {
    FileLoader,
  },
  props: {
    genomeList: {
      type: Array,
      required: true
    },
  },
  data() {
    return {

    }
  },
  computed: {
    self() {
      return this;
    }
  },
  methods: {
    parseFileToNewickObjects: async function(newickFile) {

      // eslint-disable-next-line no-undef, no-unused-vars
      let tree = new Newick("test", []);
      console.log(tree);
      let newickData = await this.readNewick(newickFile);

      console.log(newickData);
    },
    // Turns newickFile to array of objects
    readNewick: async function(newickFile) {
      console.log('Converting Newick file to usable data');

      let dataURL = window.URL.createObjectURL(newickFile);

      //CAUTION : I must use the fetch API first, not the dsv one
      //let dataPromise = d3.tsvParseRows(dataURL, this.returnDisplayableGffObject);
      //TODO: check if I could extract the dsv directly from a file object instead of dataURL
      let blobPromise = d3.blob(dataURL);
      let blob = await blobPromise;
      let textBlob = await blob.text();
      //console.log({textBlob});

      let dataPromise = d3.tsvParseRows(textBlob, this.returnDisplayableGffObject);
      let data = await dataPromise;

      //Removes first line (not useful if chrom filtering is applied)
      //data.shift();

      console.log('Newick data available');

      return data;
    },
    returnDisplayableGffObject: function(newickArray) {
      let chromName = newickArray[0];
      if (this.chromList.includes(chromName)) {
        return this.turnLineIntoObject(newickArray)
      } else {
        //Nothing
      }
    },
    //Extracts gff columns as objects
    turnLineIntoObject: function(newickArray) {
      return {
        seqname: newickArray[0],
        source: newickArray[1],
        feature: newickArray[2],
        start: this.startPos_oneBasedToZeroBased(+newickArray[3]), //Start Pos converted from 1-based (gff) to 0-based; converted to Number
        end: +newickArray[4], //No coords conversion needed, 1-based and 0-based stops are the same; converted to Number
        score: newickArray[5],
        strand: +`${newickArray[6]}1`,
        frame: newickArray[7],
        attribute: newickArray[8],
      }
    },
  },
}
</script>

<style>

</style>
