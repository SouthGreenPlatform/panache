<template>

    <FileLoader :idBonus="'PavFile'" @file-loaded="parseDataURLToJson"/>

</template>

<script>
import FileLoader from '@/components/FileLoader.vue';

import * as d3 from "d3";

export default {
  name: 'PavFileParser',
  components: {
    FileLoader,
  },
  props: {
    updateChromNames: {
      type: Function,
      required: true
    },
    updateGenoNames: {
      type: Function,
      required: true
    },
    updateFunctionsDiversity: {
      type: Function,
      required: true
    },
    updatePavData: {
      type: Function,
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
    async parseDataURLToJson(payload) {

      let dataURL = payload.dataURL;

      //Extract global variables for chromNames, genoNames and functions

      //Fetches the full dataset, from which chromosomal data can be used
      let pavData = await this.readDsv(dataURL);

      //Defines the list/set of chromosome names
      let CHROMOSOME_NAMES = [...new Set(pavData.map( d => d["#Chromosome"]))];
      this.updateChromNames(CHROMOSOME_NAMES);

      ///Defines the list/set of genome names
      //CAUTION This definition assumes that the PAV part is at the end of the
      //file and that all columns exist!!!
      //This select the element with indexes that range from column 6 to the end,
      //assuming it is the PAV part.
      let INITIAL_GENOMES_NAMES = Object.getOwnPropertyNames(pavData[0]).slice(6,);
      this.updateGenoNames(INITIAL_GENOMES_NAMES);

      //Defines the list of functions used
      // CAUTION IT WILL WORK DIFFERENTLY WITH TRUE GO TERMS!!!
      let functionDiversity = [...new Set(pavData.map( d => d.Function))];
      this.updateFunctionsDiversity(functionDiversity);

      //Rewrite data with correct column names and bonus columns
      let improvedData = this.rewriteDsvColumns(pavData, CHROMOSOME_NAMES);

      //Nest data according to chrom, using one of the three 'groupDataPerKey' function
      console.log('Grouping Data');
      let chromGroupedData = this.groupDataPerKey_inHouse(improvedData, 'Chromosome');

      //Send data to store
      this.updatePavData(chromGroupedData);
      console.log('Data sent to store');
    },
    async readDsv(dataURL) {
      console.log('Converting dataURL to JS usable data');

      let dataPromise = d3.dsv("\t", dataURL);
      let data = await dataPromise;

      console.log('Data available');

      return data;
    },
    rewriteDsvColumns(dsvData, chromNames) {

      console.log('Rewriting pav blocks as objects', {chromNames});
      let newData = dsvData.map( d => this.turnLineIntoObject(d, chromNames));
      return newData;

    },
    turnLineIntoObject(dataLine, chromNames) {

      //defines and affects variables by deconstructing
      let {
        '#Chromosome': chromOfLine,
        'FeatureStart': ntStart,
        'FeatureStop': ntStop, // eslint-disable-line no-unused-vars
        'Sequence_IUPAC_Plus': sequence, // eslint-disable-line no-unused-vars
        'SimilarBlocks': similarBlocks,
        'Function': geneOnto, // eslint-disable-line no-unused-vars
        ...rest //pav matrix, defined as opposed to previous variables
      } = dataLine;

      //INFO: '// eslint-disable-line no-unused-vars' tells eslint to not
      //consider any unused var on the matching line

      //removes ill-named chromosome column, it will be replaced later
      delete dataLine["#Chromosome"];

      //prepares blockCount variable
      let pavList = [0].concat(Object.values(rest));
      let blockCount = pavList.reduce(function(acc, val) {
        // if val > 0 or val is String, presenceStatus <-- 1
        let presenceStatus = (Number(val) != 0 ? 1 : 0);
        return acc + presenceStatus;
      });

      //prepares calculation of copy proportion in every chromosome
      let listOfRepeats = this. getListOfRepeats(similarBlocks);
      let chromsWithRepeat = this.getRepeatsOrigin(listOfRepeats);
      let countOfRepeats = this.getRepeatCountPerChrom({ listOfChromWithRepeats: chromsWithRepeat, chromList: chromNames });
      let maxCount = Math.max(...Object.values(countOfRepeats));

      //writes line as a new object, with additional columns
      let lineAsObject = Object.assign({
        'index': ntStart,
        'presenceCounter': blockCount,
        'Chromosome': chromOfLine
      }, dataLine);

      //Adds copy proportion as new property for every chromosome
      chromNames.forEach(function(chrom) {
        let pption = 0;

        if (maxCount > 0) {
          pption = countOfRepeats[`${chrom}`] / maxCount;
        }

        lineAsObject[`copyPptionInChr_${chrom}`] = pption;
        //lineAsObject[`copyPptionInChr_${i}`] = pption;
      });

      return lineAsObject;
    },
    getListOfRepeats(writtenRepeats, sep=';') {
      return writtenRepeats.split(sep);
    },
    getRepeatsOrigin(listOfRepeats, sep=':') {
      let listOfOrigins = [];
      listOfRepeats.forEach( function(copy) {
        let chrom = copy.split(sep)[0];
        listOfOrigins.push(chrom);
      });

      return listOfOrigins;
    },
    getRepeatCountPerChrom({ listOfChromWithRepeats, chromList }) {

      //initiates counts at 0
      let dictOfCounts = {};
      chromList.forEach(function(chromName) {
        dictOfCounts[chromName] = 0;
      });

      //does +=1 when a chrom has a repeat
      listOfChromWithRepeats.forEach(function(chromName) {
        if (undefined != dictOfCounts[chromName]) {
          dictOfCounts[chromName] += 1;
        }
      });

      return dictOfCounts;
    },
    groupDataPerKey_inHouse(iterable, keyToNest) {
      //would return an Object shaped as follows:
      //{"key1":[{...}, {...}, ...]},
      // "key2":[{...}, {...}, ...]},
      //  ...}

      let setOfKey = [...new Set(iterable.map( d => d[keyToNest]))];

      let dataGroupedPerKey = {};
      // .map() must not be used here as we do not want an array as output
      // but an object!!! (Do we?)
      setOfKey.forEach(function(key) {

        dataGroupedPerKey[key] =
          iterable.filter(d => d[keyToNest] === key);

        // Deletion of the redundant property "Chromosome" which is already
        // determined by the main group.
        dataGroupedPerKey[key].forEach(d => delete d[keyToNest]);
      });

      return dataGroupedPerKey;
    },
    groupDataPerKey_d3v5(iterable, keyToNest) {
      //would return an Array shaped as follows:
      //[{"key":"key1","values":[{...}, {...}, ...]},
      // {"key":"key2","values":[{...}, {...}, ...]},
      //  ...]

      let nestedData = d3.nest()
        .key(d => d[keyToNest])
        .entries(iterable);

      return nestedData;
    },
    groupDataPerKey_d3v6(iterable, keyToNest) {
      //would return a Map shaped as follows:
      //Map(n) {
      //  "key1" => [{...}, {...}, ...]
      //  "key2" => [{...}, {...}, ...]
      //  ...
      //}
      return d3.group(iterable, d => d[keyToNest])
    },
  },
}
</script>

<style>

</style>
