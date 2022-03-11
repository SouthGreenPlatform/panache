<template>
  <FileLoader :idBonus="'PavFile'" @file-loaded="parseDataToJson"/>
</template>

<script>
import FileLoader from '@/components/FileLoader.vue';

import * as d3 from "d3";
import {mapActions} from "vuex";

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
    updateDefaultChrom: {
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
  },
  methods: {
    async parseDataToJson(loadedFile) {

      //Extract global variables for chromNames, genoNames and functions

      //Fetches the full dataset, from which chromosomal data can be used
      let pavData = await this.readDsv(loadedFile, '\t');

      //Defines the list/set of chromosome names
      let CHROMOSOME_NAMES = [...new Set(pavData.map( d => d["#Chromosome"]))];
      this.updateChromNames(CHROMOSOME_NAMES);
      this.updateDefaultChrom(CHROMOSOME_NAMES[0]);

      ///Defines the list/set of genome names
      //CAUTION This definition assumes that the PAV part is at the end of the
      //file and that all columns exist!!!
      //This select the element with indexes that range from column 6 to the end,
      //assuming it is the PAV part.
      let INITIAL_GENOMES_NAMES = Object.getOwnPropertyNames(pavData[0]).slice(6,);
      this.updateGenoNames(INITIAL_GENOMES_NAMES);
      let INITIAL_GENOMES_NAMES_SAVE = Object.getOwnPropertyNames(pavData[0]).slice(6,);
      this.updateGenomesInDisplaySave(INITIAL_GENOMES_NAMES_SAVE);

      //Defines the list of functions used
      // CAUTION IT WILL WORK DIFFERENTLY WITH TRUE GO TERMS!!!
      let functionDiversity = [...new Set(pavData.map( d => d.Function))];
      this.updateFunctionsDiversity(functionDiversity);

      //Rewrite data with correct column names and bonus columns
      let improvedData = this.rewriteDsvColumns(pavData, CHROMOSOME_NAMES);

      //Nest data according to chrom, using one of the three 'groupDataPerKey' function
      console.log('Grouping Data');
      let chromGroupedData = this.groupDataPerKey_inHouse(improvedData, 'Chromosome');

      //Sort Data based on index
      this.sortBlocksOnIndex(chromGroupedData, CHROMOSOME_NAMES);

      //Send data to store
      this.updatePavData(chromGroupedData);
      console.log('Data sent to store');
      this.updateFileLoaded(true);
    },
    async readDsv(loadedFile, delimiter='\t') {
      console.log('Converting data to JS usable data');

      let dataURL = window.URL.createObjectURL(loadedFile);

      let dataPromise = d3.dsv(delimiter, dataURL);
      let data = await dataPromise;

      console.log('Data available');

      return data;
    },
    rewriteDsvColumns(dsvData, chromNames) {
      const chromCount = chromNames.reduce((agg, name) => { agg[name] = 0; return agg;}, {});
      console.log('Rewriting pav blocks as objects', {chromNames});
      let newData = dsvData.map( d => this.turnLineIntoObject(d, chromNames, chromCount));
      return newData;

    },
    turnLineIntoObject(dataLine, chromNames, chromCount) {

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
      // delete dataLine["#Chromosome"];

      //prepares blockCount variable
      // let pavList = [0].concat(Object.values(rest));
      // let blockCount = pavList.reduce((acc, val) => {
      //   // if val > 0 or val is String, presenceStatus <-- 1
      //   let presenceStatus = (Number(val) != 0 ? 1 : 0);
      //   return acc + presenceStatus;
      // });

//


      let blockCount = Object.values(rest).reduce((acc, val) => {
        // if (/^Geno\d+$/.test(key)) {
          // if val > 0 or val is String, presenceStatus <-- 1
          let presenceStatus = (Number(val) != 0 ? 1 : 0);
          return acc + presenceStatus;
        // } else if (!['#Chromosome', 'FeatureStart', 'FeatureStop', 'Sequence_IUPAC_Plus', 'SimilarBlocks', 'Function'].includes(key)) {
        //   console.log('key', key, 'val', dataLine[key], 'acc', acc);
        // }
        // return acc;

      }, 0);

      // let blockCount = Object.values(rest).reduce((acc, val) => {
      //   // if val > 0 or val is String, presenceStatus <-- 1
      //   let presenceStatus = (val !== '1' ? 0 : 1);
      //   return acc + presenceStatus;
      // }, 0);

      // if (blockCount !== blockCount2) {


//

      // }
      //prepares calculation of copy proportion in every chromosome
      // let listOfRepeats = this. getListOfRepeats(similarBlocks);
      // let chromsWithRepeat = this.getRepeatsOrigin(listOfRepeats);


      // console.log('');
      // console.log('similarBlocks', similarBlocks);
      // console.log('listOfRepeats', listOfRepeats);
      // console.log('chromsWithRepeat', chromsWithRepeat);

      // console.log('');

      const chromsWithRepeat = similarBlocks.match(/([^;:]+)/g);
      // console.log('mySplit', mySplit);
      // console.log('firstSplit', firstSplit);
      // console.log('');

      // if (firstSplit !== chromsWithRepeat[0] || chromsWithRepeat.length > 1 || mySplit.length > 2) {

      //
      // }

      // let countOfRepeats = this.getRepeatCountPerChrom({ listOfChromWithRepeats: chromsWithRepeat, chromList: chromNames });
      let countOfRepeats = this.getRepeatCountPerChrom(chromsWithRepeat, chromNames, {...chromCount});
      let maxCount = Math.max(...Object.values(countOfRepeats));

      //writes line as a new object, with additional columns
      // let lineAsObject = Object.assign({
      //   'index': ntStart,
      //   'presenceCounter': blockCount,
      //   'Chromosome': chromOfLine
      // }, dataLine);
      dataLine.index = ntStart;
      dataLine.presenceCounter = blockCount;
      dataLine.Chromosome = chromOfLine;

      // let lineAsObject = Object.assign(dataLine, {
      //   'index': ntStart,
      //   'presenceCounter': blockCount,
      //   'Chromosome': chromOfLine,
      //   ...dataLine
      // });

      // let lineAsObject = {
      //   'index': ntStart,
      //   'presenceCounter': blockCount,
      //   'Chromosome': chromOfLine,
      //   ...dataLine
      // };

      //Adds copy proportion as new property for every chromosome
      for (let chrom of chromNames) {
        dataLine[`copyPptionInChr_${chrom}`] = maxCount > 0 ? countOfRepeats[chrom] / maxCount : 0 ; //pption;
      }
      // chromNames.forEach((chrom) => {
      //   // let pption = 0;
      //   //
      //   // if (maxCount > 0) {
      //   //   pption = countOfRepeats[chrom] / maxCount;
      //   // }
      //
      //   dataLine[`copyPptionInChr_${chrom}`] = maxCount > 0 ? countOfRepeats[chrom] / maxCount : 0 ; //pption;
      //   // lineAsObject[`copyPptionInChr_${chrom}`] = maxCount > 0 ? countOfRepeats[chrom] / maxCount : 0 ; //pption;
      //   //lineAsObject[`copyPptionInChr_${i}`] = pption;
      // });

      return dataLine;
      // return lineAsObject;
    },
    getListOfRepeats(writtenRepeats, sep=';') {
      return writtenRepeats.split(sep);
    },
    getRepeatsOrigin(listOfRepeats, sep=':') {
      // let listOfOrigins = [];
      // listOfRepeats.forEach( (copy) => {
      //   let chrom = copy.split(sep)[0];
      //   listOfOrigins.push(chrom);
      // });

      return listOfRepeats.map( copy => copy.split(sep)[0]);

      // return listOfOrigins;
    },
    getRepeatCountPerChrom(chromsWithRepeat, chromNames, dictOfCounts) {

      //initiates counts at 0
      // let dictOfCounts = {};
      // chromNames.forEach((chromName) => {
      //   dictOfCounts[chromName] = 0;
      // });

      //does +=1 when a chrom has a repeat
      for (let chromName of chromsWithRepeat) {
        if (undefined != dictOfCounts[chromName]) {
          dictOfCounts[chromName] += 1;
        }
      }
      // chromsWithRepeat.forEach((chromName) => {
      //   if (undefined != dictOfCounts[chromName]) {
      //     dictOfCounts[chromName] += 1;
      //   }
      // });

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
      for (let key of setOfKey) {
        dataGroupedPerKey[key] =
            iterable.filter(d => d[keyToNest] === key);
      }
      // setOfKey.forEach((key) => {
      //
      //   dataGroupedPerKey[key] =
      //       iterable.filter(d => d[keyToNest] === key);
      //
      //   // Deletion of the redundant property "Chromosome" which is already
      //   // determined by the main group.
      //
      //   // TODO CWS TESTING REMOVE DELETE
      //
      //   //
      //   // dataGroupedPerKey[key].forEach(d => delete d[keyToNest]);
      // });

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
    sortBlocksOnIndex(groupedData, chromList) {
      for (let chromName of chromList) {
        groupedData[chromName].sort( (a,b) => parseInt(a.index) - parseInt(b.index) );
      }
      // chromList.forEach(chromName => {
      //   // Sort the genes in every chromosomes by their index
      //   //custom sort function, cf https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#description
      //   groupedData[chromName].sort( (a,b) => parseInt(a.index) - parseInt(b.index) );
      // });
      return groupedData;
    },
    ...mapActions([
      'updateGenomesInDisplaySave',
      'updateFileLoaded'
    ]),
  },
}
</script>

<style>

</style>
