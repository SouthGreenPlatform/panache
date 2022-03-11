<template>

  <FileLoader
      :labelToDisplay="'Optional gff'"
      :allowedExtensions="['gff']"
      :idBonus="'GffFile'"
      @file-loaded="parseGffToAnnotationObjects"
  />

</template>

<script>
import FileLoader from '@/components/FileLoader.vue';

import * as d3 from "d3";
import {mapActions} from "vuex";

export default {
  name: 'GffFileParser',
  components: {
    FileLoader,
  },
  props: {
    chromList: {
      type: Array,
      required: true
    },
    updateAnnotationData: {
      type: Function,
      required: true
    },
  },
  data() {
    return {
      titleOfID: 'ID',
      titleOfGeneName: 'Name',
      titleOfAnnotation: 'Note',
    }
  },
  methods: {
    ...mapActions([
      'updateIsGffUploadedTRUE',
      'pushSortModeInSortChoice',
    ]),
    parseGffToAnnotationObjects: async function(gffFile) {

      //console.log({gffFile});

      //Reading the full annotation dataset
      let gffData = await this.readTsv(gffFile);

      //console.log({gffData});

      //Overall variables
      let annotData = [];
      let currentIdx = 0;

      //Per chromosome variables
      let isNewChrom;
      let currentChrom;

      //Per annotation variabes
      let currentAnnotation;
      let currentGeneExons;

      // A Map to store geneName <--> { idx, stop, [overLeft, ...], [overRight, ...] }
      let mapOfOverlaps = new Map();

      //Creates an annotation object for each gene
      gffData.forEach((lineObj) => {

        isNewChrom = (lineObj.seqname !== currentChrom);

        if (isNewChrom) {
          //Stores last annotation of previous chrom
          if (currentAnnotation !== undefined) {
            this.storeAnnotation({
              mapOfOverlaps,
              annotObj: currentAnnotation,
              idx: currentIdx,
              annotArray: annotData,
              exons: currentGeneExons
            });
          }

          //Clears and stores the last overlaps from previous chrom
          this.clearMapOfOverlaps(annotData, mapOfOverlaps);

          //Resets variables
          currentChrom = lineObj.seqname
          currentAnnotation = undefined;
        }

        //Variables that maybe be of use within the switch
        let addInfo;
        let exon;

        switch (lineObj.feature) {

          case 'gene':

            //Stores info of previous annot once everything is recorded
            if (currentAnnotation !== undefined) {

              this.storeAnnotation({
                mapOfOverlaps,
                annotObj: currentAnnotation,
                idx: currentIdx,
                annotArray: annotData,
                exons: currentGeneExons
              });

              //Increment index
              currentIdx += 1;
            }

            //Instanciates new annotation
            addInfo = this.extractNameAndNote(lineObj)

            currentAnnotation = {
              chrom: lineObj.seqname,
              geneName: addInfo.geneName,
              geneStart: lineObj.start,
              geneStop: lineObj.end,
              geneStrand: lineObj.strand,
              annotation: addInfo.annotation,
            };

            currentGeneExons = [];
            break;

          case 'exon':
            //Registers exon for current gene Annotation
            exon = {
              start: lineObj.start,
              stop: lineObj.end
            };
            currentGeneExons.push(exon)
            break;

          default:
            break;

        }
      });

      //console.log('Last Annot is reached');
      //Stores last annotation data
      this.storeAnnotation({
        mapOfOverlaps,
        annotObj: currentAnnotation,
        idx: currentIdx,
        annotArray: annotData,
        exons: currentGeneExons
      });

      //Clears and stores the very last overlaps
      this.clearMapOfOverlaps(annotData, mapOfOverlaps);

      //console.log({annotData});

      //Group data according to chromosomes
      let groupedAnnot = this.groupDataPerKey_inHouse(annotData, 'chrom');

      //Stores annotation Array within the App
      //console.log({groupedAnnot});
      this.updateAnnotationData(groupedAnnot);
      this.updateIsGffUploadedTRUE();
      this.pushSortModeInSortChoice('Gene presence status'); // Add the choice to sort by gene presence status with a search bar
    },
    //Turns gffFile to array of objects
    readTsv: async function(gffFile) {
      console.log('Converting Gff file to usable data');

      let dataURL = window.URL.createObjectURL(gffFile);

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

      console.log('Gff data available');

      return data;
    },
    //Converts start pos of 1-based file into a 0-based start pos
    startPos_oneBasedToZeroBased: function(oneBasedStartPos) {return oneBasedStartPos - 1},
    //Only keeps gff lines that matches loaded chromosomes, therefore being displayable
    returnDisplayableGffObject: function(gffArray) {
      let chromName = gffArray[0];

      if (this.chromList.includes(chromName)) {
        return this.turnLineIntoObject(gffArray)
      } else {
        //Nothing
      }
    },
    //Extracts gff columns as objects
    turnLineIntoObject: function(gffArray) {
      return {
        seqname: gffArray[0],
        source: gffArray[1],
        feature: gffArray[2],
        start: this.startPos_oneBasedToZeroBased(+gffArray[3]), //Start Pos converted from 1-based (gff) to 0-based; converted to Number
        end: +gffArray[4], //No coords conversion needed, 1-based and 0-based stops are the same; converted to Number
        score: gffArray[5],
        strand: +`${gffArray[6]}1`,
        frame: gffArray[7],
        attribute: gffArray[8],
      }
    },
    //Returns a {geneName, annotation} object out of a gff Object
    extractNameAndNote: function(lineObj) {
      return this.findNameAndNote(lineObj.attribute)
    },
    //Returns a {geneName, annotation} object out of an attribute column
    findNameAndNote: function(attribute) {
      let geneName;
      let annotation = '';
      let addInfoList;

      addInfoList = attribute.split(';');
      addInfoList.forEach((addInfo) => {
        let keyValue = addInfo.split('=');

        switch (keyValue[0]) {

          case this.titleOfGeneName:
            geneName = keyValue[1];
            break;

          case this.titleOfAnnotation:
            annotation = keyValue[1]
            break;

          default:
            break;
        }
      })
      return {geneName, annotation};
    },
    //Checks whether annots from a Map overlap a given annot and replace its info
    checkAnnotsForOverlaps: function({mapOfOverlaps, annotToCompare, annotIdx, annotArray}) {
      let currentStart = annotToCompare.geneStart;
      let currentStop = annotToCompare.geneStop;
      let currentName = annotToCompare.geneName;

      //Check mapOfOverlaps for possible overlaps
      //CAUTION: this supposes that features are in order within the gff
      let keysToRemove, currentLeftOverlaps, currentRightOverlaps;

      ({
        keysToRemove,
        currentLeftOverlaps,
        currentRightOverlaps
      } = this.linkOverlaps({mapOfOverlaps, annotToCompare}));

      //Adds overlaps info within annotArray and cleans mapOfOverlaps
      this.writeAndStoreOverlaps({keysToRemove, mapOfOverlaps, annotArray});

      //Add current annotation to list of potentially overlapped segments
      mapOfOverlaps.set(currentName, {
        idx: annotIdx,
        start: currentStart,
        stop: currentStop,
        listOfOverLeft: currentLeftOverlaps, //we assume all previous overlaps are already registered
        listOfOverRight: currentRightOverlaps,
      });
    },
    //Finds what the overlaps for the current annotation are...
    linkOverlaps: function({mapOfOverlaps, annotToCompare}) {
      return this.linkOverlaps_centerPosBased({mapOfOverlaps, annotToCompare});
    },
    //...in case marks are placed based on center positions
    linkOverlaps_centerPosBased: function({mapOfOverlaps, annotToCompare}) {

      let currentName = annotToCompare.geneName;

      let currentStart = annotToCompare.geneStart;
      let currentStop = annotToCompare.geneStop;
      let currentCenter = (currentStart + currentStop) / 2;

      let currentLeftOverlaps = [];
      let currentRightOverlaps = [];
      let keysToRemove = [];

      mapOfOverlaps.forEach(function(mapObj, geneName) {

        //When an annotation is overlapped...
        if (mapObj.stop > currentStart) {
          let mapObjCenter = (mapObj.start + mapObj.stop) / 2;

          //Places overlap names according to center position and saves them
          if (mapObjCenter <= currentCenter) {
            mapOfOverlaps.get(geneName).listOfOverRight.push(currentName);
            currentLeftOverlaps.push(geneName);
          } else {
            mapOfOverlaps.get(geneName).listOfOverLeft.push(currentName);
            currentRightOverlaps.push(geneName);
          }
        }
        //When no overlap is detected...
        else { keysToRemove.push(geneName) }
      });

      return { keysToRemove, currentLeftOverlaps, currentRightOverlaps };
    },
    //...in case we want the real order of overlaps, not the displayed one
    linkOverlaps_blindMethod: function({mapOfOverlaps, annotToCompare}) {
      let currentStart = annotToCompare.geneStart;
      let currentName = annotToCompare.geneName;
      let currentLeftOverlaps = [];
      let currentRightOverlaps = [];
      let keysToRemove = [];

      mapOfOverlaps.forEach(function(mapObj, geneName) {
        //When an annotation is overlapped...
        if (mapObj.stop > currentStart) {
          mapOfOverlaps.get(geneName).listOfOverRight.push(currentName);
          currentLeftOverlaps.push(geneName);
        }
        //When no overlap is detected...
        else { keysToRemove.push(geneName) }
      });

      return { keysToRemove, currentLeftOverlaps, currentRightOverlaps };
    },
    //Parses list of keys from Map to add their info into annotArray, then cleans Map
    writeAndStoreOverlaps: function({keysToRemove, mapOfOverlaps, annotArray}) {

      keysToRemove.forEach( function(geneName) {

        //Affectating idx, listOf... etc by destructuring, () are required
        //For more, see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Object_destructuring
        let idx, listOfOverLeft, listOfOverRight;
        ({idx, listOfOverLeft, listOfOverRight} = mapOfOverlaps.get(geneName));

        //Updates overlaps data within annotArray
        annotArray[idx]['leftOverlaps'] = listOfOverLeft;
        annotArray[idx]['rightOverlaps'] = listOfOverRight;

        //Deletes gene from map
        mapOfOverlaps.delete(geneName);
      });
    },
    //Stores annotation Object into annotations Array
    storeAnnotation: function({mapOfOverlaps, annotObj, idx, annotArray, exons}) {
      //Looks through stored annot to find overlaps with previous annot and write them
      this.checkAnnotsForOverlaps({
                mapOfOverlaps,
                annotToCompare: annotObj,
                annotIdx: idx,
                annotArray: annotArray});

      //Stores previous annotation
      annotObj['exons'] = exons;
      annotArray.push(annotObj);
    },
    //Parse what remains in mapOfOverlaps and stores it into annotArray
    clearMapOfOverlaps: function(annotArray, mapOfOverlaps) {

      let remainingOverlaps = [...mapOfOverlaps.keys()]

      this.writeAndStoreOverlaps({
          keysToRemove: remainingOverlaps,
          mapOfOverlaps: mapOfOverlaps,
          annotArray: annotArray
      })

    },
    //Groups data under a given key
    groupDataPerKey_inHouse: function(iterable, keyToNest) {
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
    groupDataPerKey_d3v5: function(iterable, keyToNest) {
      //would return an Array shaped as follows:
      //[{"key":"key1","values":[{...}, {...}, ...]},
      // {"key":"key2","values":[{...}, {...}, ...]},
      //  ...]

      let nestedData = d3.nest()
        .key(d => d[keyToNest])
        .entries(iterable);

      return nestedData;
    },
    groupDataPerKey_d3v6: function(iterable, keyToNest) {
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
