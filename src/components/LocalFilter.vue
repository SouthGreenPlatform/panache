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
            />
          </div>
        </template>
        <template v-slot:inside>
          <div class="mb-1">
            <GffFileParser
                :chromList="chromNames"
                :updateAnnotationData="function(gffData) { updateFullGffData(gffData) }"
            />
          </div>
          <div class="">
            <NewickFileParser
                :genomeList="genoNames"
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

    <CategoryTitle title="Display parameters"/>

    <!-- TODO: Extract the shape choice from the core threshold component... -->
    <CoreThreshold/>

    <CategoryTitle title="Zoom Level"/>

    <MatrixOptimizedZoom
        class='zoomSlider'
        :smallestNtWidthInPx="minNtWidthInPx"
        :largestNtWidthInPx="maxNtWidthInPx"
        :updateGlobalZoom="function(ntWidthInPx) { updateCurrentZoomLvl(ntWidthInPx) }"
    />

    <!--MatrixPavZoom
        class='zoomSlider'
        :lastNt="globalLastNt"
        :displayWindowWidth="displayWindowWidth"
        :updateGlobalZoom="function(ntWidthInPx) { updateCurrentZoomLvl(ntWidthInPx) }"
    /-->

    <CategoryTitle title="Hollow area finder"/>

    <HollowAreaFinder
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

    <CategoryTitle title="Legend"/>

    <PavMatrixLegend
        class="pavLegend"
    />
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
import SortTracks from "@/components/SortTracks";
import GffFileParser from "@/components/GffFileParser";
import NewickFileParser from "@/components/NewickFileParser";
import CollapseMenu from "@/components/CollapseMenu";
import NewickTree from "@/components/NewickTree";
import CategoryTitle from "@/components/CategoryTitle";
import InputPosition from "@/components/InputPosition";
import GenePosition from "@/components/GenePosition";

export default {
  name: 'LocalFilter',
  components: {
    GenePosition,
    InputPosition,
    CategoryTitle,
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
  },
  props: {},
  data() {
    return {}
  },
  computed: {
    ...mapState({
      chromNames: 'chromNames',
      firstNt: 'firstNtToDisplay',
      genoNames: 'genomeListInDisplay',
      ntWidthInPx: 'currentDisplayNtWidthInPx',
      sortChoice: 'sortChoice',
      selectedSortMode: 'selectedSortMode',
      isGffUploaded: 'isGffUploaded',
      fileLoaded: 'fileLoaded',
    }),
    ...mapGetters({
      currentChromData: 'chromDataInDisplay',
      currentGffData: 'gffDataInDisplay',
      displayWindowWidth: 'displayWindowWidth',
      globalLastNt: 'lastNtOfChrom',
      maxNtWidthInPx: 'maxNtWidthInMainDisplay',
      minNtWidthInPx: 'minNtWidthForNavigabilityInMainDisplay',
      nbOfGenomes: 'nbOfGenomesInDisplay',
    })
  },
  methods: {
    //Get Actions from the store
    ...mapActions([
      'updateChromNames',
      'updateCoordsOfHollowAreas',
      'updateCurrentZoomLvl',
      'updateFirstNtToDisplay',
      'updateFullChromData',
      'updateFullGffData',
      'updateGenomesInDisplay',
      'updateSelectedChrom',
      'updateSelectedSortMode',
      'updateNewickTreeData',
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
