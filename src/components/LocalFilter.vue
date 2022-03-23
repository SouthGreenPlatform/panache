<template>
  <div>
    <div class="row border-bottom bg-light" style="position: relative">
      <b-icon icon="filter" scale="1.5" class="filters-icon"></b-icon>
      <h5 class="mt-2 text-center w-100">
        Filters
      </h5>
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
      <LocalGenePattern/>
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

import CoreThreshold from '@/components/CoreThreshold.vue';
import DropDownChoice from '@/components/DropDownChoice.vue';
import PavMatrixLegend from '@/components/PavMatrixLegend.vue';
import MatrixOptimizedZoom from '@/components/MatrixOptimizedZoom.vue';
import HollowAreaFinder from '@/components/HollowAreaFinder.vue';
import SortTracks from "@/components/SortTracks";
import CollapseMenu from "@/components/CollapseMenu";
import NewickTree from "@/components/NewickTree";
import SortOption_GffPresenceStatus from "@/components/SortOption_GffPresenceStatus";
import CategoryTitle from "@/components/CategoryTitle";
import InputPosition from "@/components/InputPosition";
import GenePosition from "@/components/GenePosition";
import LocalGenePattern from "@/components/LocalGenePattern";
import {nonReactiveDataStore} from '@/store/non-reactive-data';

import {mapState, mapGetters, mapActions} from 'vuex';

import * as d3 from "d3";

export default {
  name: 'LocalFilter',
  components: {
    CoreThreshold,
    MatrixOptimizedZoom,
    DropDownChoice,
    PavMatrixLegend,
    HollowAreaFinder,
    SortTracks,
    CollapseMenu,
    NewickTree,
    SortOption_GffPresenceStatus,
    CategoryTitle,
    InputPosition,
    GenePosition,
    LocalGenePattern,
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
  mounted() {
    //Pre-load vis with bananaGenomeHub data
    this.updateBananaData();
  },
  methods: {
    updateFullChromData(data) {
      nonReactiveDataStore.fullChromData = data;
    },
    //regEx to automatically determine the order of genomes within a newick string
    autoExtractGenoOrderFromNewick(newickStr) {
      let regExNwk = /([a-zA-Z][\w.-]*)/g;
      return newickStr.match(regExNwk);
    },
    //Get Actions from the store
    ...mapActions([
      'updateDisplayLoadingStatus',
      'updateChromNames',
      'updateCoordsOfHollowAreas',
      'updateCurrentZoomLvl',
      'updateFirstNtToDisplay',
      // 'updateFullChromData',
      'updateFullGffData',
      'updateGenomesInDisplay',
      'updateSelectedChrom',
      'updateSelectedSortMode',
      'updateGenomesInDisplaySave',
      'updateFileLoaded',
      'updateIsGffUploadedTRUE',
      'pushSortModeInSortChoice',
      'updatePhylogenyTree',
      'updatePhylogenyString',
    ]),
    async updateBananaData() {

      //Enable loadingSpinner in Panache view
      this.updateDisplayLoadingStatus();

      //Send parameters not directly extracted from the data files
      this.updateChromNames([
        'chr01', 'chr02', 'chr03', 'chr04', 'chr05', 'chr06', 'chr07', 'chr08',
        'chr09', 'chr10', 'chr11', 'chrUn_random'
        ]);
      this.updateGenomesInDisplay([
        'Bile', 'BSK30', 'Calcutta', 'Ensete01', 'EnseteBedadit', 'EnseteDerea',
        'FHIA', 'Itinerans', 'Kole', 'Lidi', 'MasKirana', 'Pahang', 'PKW',
        'Tanduk', 'TongkatLangitMaluku'
      ]);
      this.updateGenomesInDisplaySave([
        'Bile', 'BSK30', 'Calcutta', 'Ensete01', 'EnseteBedadit', 'EnseteDerea',
        'FHIA', 'Itinerans', 'Kole', 'Lidi', 'MasKirana', 'Pahang', 'PKW',
        'Tanduk', 'TongkatLangitMaluku'
      ]);

      //Send datasets to store
      let pavDataPromise = d3.json('./bananachePAV_preformatted.json');
      let gffDataPromise = d3.json('./bananacheGFF_preformatted.json');

      let [pavData, gffData] = await Promise.all( [pavDataPromise, gffDataPromise] );

      //Section dedicated to sending the pav updates to the store
      this.updateFullChromData(pavData);
      this.updateSelectedChrom('chr01');
      this.updateFileLoaded(true); //Useful for the loading spinner? But it uses updateDisplayLoadingStatus...
      console.log('PAV FILE HAS BEEN LOADED AND CHROMDATA IS SET')

      //Section dedicated to sending the gff updates to the store
      this.updateFullGffData(gffData);
      this.updateIsGffUploadedTRUE(); //Useful for...? Why has at a difference syntaxe than for PAV?
      this.pushSortModeInSortChoice('Gene presence status'); // Add the choice to sort by gene presence status with a search bar

      //Section dedicated to the newick phylogeny sent to the store
      let newickStr = '((Ensete01,(EnseteDerea,EnseteBedadit)),((TongkatLangitMaluku,(Itinerans,(PKW,(((FHIA,(Bile,Tanduk)),((Kole,MasKirana),(Calcutta,(Lidi,(Pahang,BSK30)))))))))));';
      let phyloOrder = this.autoExtractGenoOrderFromNewick(newickStr);

      this.updatePhylogenyTree(phyloOrder);
      this.updatePhylogenyString(newickStr);
      this.pushSortModeInSortChoice('Phylogenetic tree'); // Add the choice to sort by phylogenetic tree

      //Disable loadingSpinner in Panache view
      this.updateDisplayLoadingStatus();

    }
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
