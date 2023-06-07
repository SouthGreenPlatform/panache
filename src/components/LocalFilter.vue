<template>
  <div>
    <div class="row border-bottom bg-light" style="position: relative">
      <b-icon icon="filter" scale="1.5" class="filters-icon"></b-icon>
      <h5 class="mt-2 text-center w-100">
        Filters
      </h5>
    </div>

    <div class="row">
      <CollapseMenu idCollapse='collapseOptionalUpload' :conditionShowPlus="fileLoaded === true">
        <template v-slot:title>
          Files
        </template>

        <template v-slot:outside>
          <div class="mb-1">
            <!-- I should check if the output is what I truly expect from those two components vs what the store needs-->
            <!-- updateFunctionDiversity is not used yet?-->
            <PavFileParser
                :updateChromNames="function(listOfChrom) { updateChromNames(listOfChrom) }"
                :updateDefaultChrom="function(chrom) { updateSelectedChrom(chrom) }"
                :updateGenoNames="function(listOfGenomes) { updateGenomesInDisplay(listOfGenomes) }"
                :updateFunctionsDiversity="function() { return }"
                :updatePavData="function(pavData) { updateFullChromData(pavData) }"
                :updatePavFileName="function(pavFileName) { updatePavFileName(pavFileName) }"
            />
          </div>
        </template>

        <template v-slot:inside>

          <div class="mb-1">
            <GffFileParser
                :chromList="chromNames"
                :updateAnnotationData="function(gffData) { updateFullGffData(gffData) }"
                :updateIsGffUploadedTRUE="function() { updateIsGffUploadedTRUE() }"
                :updateGffFileName="function(fileName) { updateGffFileName(fileName) }"
                :pushSortModeInSortChoice="function(newSortName) { pushSortModeInSortChoice(newSortName) }"
            />
          </div>

          <div class="">
            <NewickFileParser
                :genomeList="genoNames"
                :updateNewickTree="function(nwkTree) { updatePhylogenyTree(nwkTree) }"
                :updateNewickString="function(nwkString) { updatePhylogenyString(nwkString) }"
            />
          </div>

        </template>

      </CollapseMenu>
    </div>

    <DropDownChoice
        msg='Chromosome on display'
        :choices="chromNames"
        :updateCurrentChrom="function(chrom) { updateSelectedChrom(chrom) }"
        idBonus='Chrom'
    />

    <div>
      <CategoryTitle title="Jump to position"/>
      <InputPosition
          :lastNt="globalLastNt"
          :displayWindowWidth="displayWindowWidth"
          :ntWidthInPixel="ntWidthInPx"
          :currentFirstNt="firstNt"
          :chromList="chromNames"
          :updateGlobalFirstNt="function(payload) { updateFirstNtToDisplay(payload) }"/>
    </div>

    <div v-show="isGffUploaded">
      <CategoryTitle title="Jump to gene position"/>
      <GenePosition
          :lastNt="globalLastNt"
          :displayWindowWidth="displayWindowWidth"
          :ntWidthInPixel="ntWidthInPx"
          :currentFirstNt="firstNt"
          :chromList="chromNames"
          :updateGlobalFirstNt="function(payload) { updateFirstNtToDisplay(payload) }"/>
    </div>

    <SortTracks
        msg='Sort the tracks'
        :sortChoice="sortChoice"
        :updateCurrentSortMode="function(sortMode) { updateSelectedSortMode(sortMode) }"
        idBonus='SortMode'
    />

    <div v-show="selectedSortMode === 'Phylogenetic tree'">
      <CategoryTitle title="Display phylogenetic tree"/>
      <NewickTree/>
    </div>

    <div v-show="selectedSortMode === 'Gene presence status'">
      <CategoryTitle title="Filter annotation presence statuses"/>
      <SortOption_GffPresenceStatus/>
    </div>

    <div v-show="selectedSortMode === 'Local presence/absence pattern'">
      <CategoryTitle title="Local presence/absence pattern sort"/>
      <SortOption_LocalPavPattern/>
    </div>

    <CategoryTitle title="Display parameters"/>
    <CoreThreshold/>

    <CategoryTitle title="Zoom Level"/>
    <MatrixOptimizedZoom
        class='zoomSlider'
        :smallestNtWidthInPx="minNtWidthInPx"
        :largestNtWidthInPx="maxNtWidthInPx"
        :updateGlobalZoom="function(ntWidthInPx) { updateCurrentZoomLvl(ntWidthInPx) }"
    />

    <div v-show="isGffUploaded">
      <CategoryTitle title="Download data"/>
      <ExportLocalRegionAnnotated
          :pavDataOnDisplay="currentChromData"
          :pavFileName="pavFileName"
          :gffDataOnDisplay="currentGffData"
          :gffFileName="gffFileName"
          :panRegion="panRegion"
          :genomeList="genoNames"
      />
    </div>

    <!--MatrixPavZoom
        class='zoomSlider'
        :lastNt="globalLastNt"
        :displayWindowWidth="displayWindowWidth"
        :updateGlobalZoom="function(ntWidthInPx) { updateCurrentZoomLvl(ntWidthInPx) }"
    /-->

    <div class="row">
      <CollapseMenu idCollapse='collapseHollowAreaFinder'>
        <template v-slot:title>
          Hollow area finder
        </template>
        <template v-slot:inside="exportedProp">
          <HollowAreaFinder
              :visibleStatus="exportedProp.visible"
              :arrayOfPanFeatures="currentChromData"
              :lastNt="globalLastNt"
              :genoNames="genoNames"
              :nbOfGenomes="nbOfGenomes"
              :currentFirstNt="firstNt"
              :displayWindowWidth="displayWindowWidth"
              :ntWidthInPixel="ntWidthInPx"
              :updateGlobalFirstNt="function(payload) { updateFirstNtToDisplay(payload) }"
              :updateGlobalCoordOfHollowAreas="function(payload) { updateCoordsOfHollowAreas(payload) }"
          />
        </template>
      </CollapseMenu>
    </div>

    <CategoryTitle title="Legend"/>

    <PavMatrixLegend
        class="pavLegend"
    />

    <CategoryTitle title="More..."/>

    <div>
      Check out our wiki on <b-link href='https://github.com/SouthGreenPlatform/panache/wiki' target="_blank">Github</b-link>!
    </div>




  </div>
</template>

<script>

import {mapState, mapGetters, mapActions} from 'vuex';
import PavFileParser from '@/components/PavFileParser.vue';
import CoreThreshold from '@/components/CoreThreshold.vue';
import DropDownChoice from '@/components/DropDownChoice.vue';
import PavMatrixLegend from '@/components/PavMatrixLegend.vue';
import MatrixOptimizedZoom from '@/components/MatrixOptimizedZoom.vue';
//import MatrixPavZoom from '@/components/MatrixPavZoom.vue';
import HollowAreaFinder from '@/components/HollowAreaFinder.vue';
import SortTracks from "@/components/SortTracks.vue";
import GffFileParser from "@/components/GffFileParser.vue";
import NewickFileParser from "@/components/NewickFileParser.vue";
import CollapseMenu from "@/components/CollapseMenu.vue";
import NewickTree from "@/components/NewickTree.vue";
import SortOption_GffPresenceStatus from "@/components/SortOption_GffPresenceStatus.vue";
import CategoryTitle from "@/components/CategoryTitle.vue";
import InputPosition from "@/components/InputPosition.vue";
import GenePosition from "@/components/GenePosition.vue";
import SortOption_LocalPavPattern from "@/components/SortOption_LocalPavPattern.vue";
import ExportLocalRegionAnnotated from "@/components/ExportLocalRegionAnnotated.vue";
import {nonReactiveDataStore} from '@/store/non-reactive-data';

export default {
  name: 'LocalFilter',
  components: {
    SortOption_LocalPavPattern,
    GenePosition,
    InputPosition,
    CategoryTitle,
    SortOption_GffPresenceStatus,
    NewickTree,
    NewickFileParser,
    CollapseMenu,
    SortTracks,
    PavFileParser,
    GffFileParser,
    CoreThreshold,
    MatrixOptimizedZoom,
//    MatrixPavZoom,
    DropDownChoice,
    PavMatrixLegend,
    HollowAreaFinder,
    ExportLocalRegionAnnotated,
  },
  props: {},
  data() {
    return {}
  },
  computed: {
    ...mapState({
      chromNames: 'chromNames',
      chromToDisplay: 'selectedChrom',
      firstNt: 'firstNtToDisplay',
      lastNtToDisplay: 'lastNtToDisplay',
      genoNames: 'genomeListInDisplay',
      ntWidthInPx: 'currentDisplayNtWidthInPx',
      sortChoice: 'sortChoice',
      selectedSortMode: 'selectedSortMode',
      pavFileName: 'pavFileName',
      fileLoaded: 'fileLoaded',
      gffFileName: 'gffFileName',
      isGffUploaded: 'isGffUploaded',
    }),
    ...mapGetters({
      currentChromData: 'chromDataInDisplay',
      currentGffData: 'gffDataInDisplay',
      displayWindowWidth: 'displayWindowWidth',
      globalLastNt: 'lastNtOfChrom',
      maxNtWidthInPx: 'maxNtWidthInMainDisplay',
      minNtWidthInPx: 'minNtWidthForNavigabilityInMainDisplay',
      nbOfGenomes: 'nbOfGenomesInDisplay',
    }),
    panRegion() {
      return {'chrom': this.chromToDisplay, 'start': this.firstNt, 'stop': this.lastNtToDisplay}
    }
  },
  methods: {
    updateFullChromData(data) {
      nonReactiveDataStore.fullChromData = data;
    },
    //Get Actions from the store
    ...mapActions([
      'updateChromNames',
      'updateCoordsOfHollowAreas',
      'updateCurrentZoomLvl',
      'updateFirstNtToDisplay',
      // 'updateFullChromData',
      'updatePavFileName',
      'updateIsGffUploadedTRUE',
      'updateGffFileName',
      'pushSortModeInSortChoice',
      'updateFullGffData',
      'updateGenomesInDisplay',
      'updateSelectedChrom',
      'updateSelectedSortMode',
      'updatePhylogenyTree',
      'updatePhylogenyString',
    ]),
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.wrapper {
  display: grid;
  grid-template-rows: repeat(8, auto);
  row-gap: 5px;
}

.title {
  grid-row: 1;
  text-align: center;
}

.pavLoader {
  grid-row: 2;
  text-align: center;
  align-self: center;
}

.gffLoader {
  grid-row: 3;
  text-align: center;
}

.coreThreshold {
  grid-row: 4;
  text-align: center;
}

.chromChoice {
  grid-row: 5;
  text-align: center;
  padding: 0.5em;
}

.pavLegend {
  grid-row: 6;
  text-align: center;
}

.zoomSlider {
  grid-row: 7;
  text-align: center;
}

.haf {
  grid-row: 8;
  text-align: center;
}

.filters-icon {
  position: absolute;
  top: 15px;
  left: 20px
}

</style>
