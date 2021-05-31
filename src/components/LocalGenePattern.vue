<template>
  <div>
    <b-button
        id="localGenePatternDisplayButton"
        @click="sortBetweenValues"
        size="sm"
        class="buttonPanache"
        block
        variant="light">
      Sort by local patter
    </b-button>

<!--    <div class="centerT" v-show="isLocalAreaSelectedDataDisplayed">
      <p>
        {{ valueNT[0] }}
        <br>
        {{ valueNT[1] }}
      </p>
    </div>-->
  </div>
</template>

<script>
import {mapActions, mapGetters, mapState} from "vuex";
import { clusterData } from "@greenelab/hclust";
/*import { euclideanDistance } from "@greenelab/hclust";
import { averageDistance } from "@greenelab/hclust";*/

export default {
  name: "LocalGenePattern",
  data() {
    return {
      isLocalAreaSelectedDataDisplayed: false,
    }
  },
  computed: {
    ...mapState({
      localAreaSelected: 'localAreaSelected',
      firstNtToDisplay: 'firstNtToDisplay',
      currentDisplayNtWidthInPx : 'currentDisplayNtWidthInPx',
      selectedChrom: 'selectedChrom',
      fullChromData: 'fullChromData',
      genomeListInDisplay: 'genomeListInDisplay',
    }),
    ...mapGetters({
      displayWindowWidth: 'displayWindowWidth',
    }),
    valueNT() {
      return [this.pxToNt(this.localAreaSelected[0]), this.pxToNt(this.localAreaSelected[1])];
    },
  },
  methods: {
    ...mapActions([
      'updateGenomesInDisplay',
    ]),
    pxToNt(pxAmount) {
      if (pxAmount <= 0) {
        return 0;
      } else if (pxAmount >= this.displayWindowWidth) {
        return this.displayWindowWidth / this.currentDisplayNtWidthInPx + this.firstNtToDisplay;
      } else {
        return pxAmount / this.currentDisplayNtWidthInPx + this.firstNtToDisplay;
      }
    },
    sortBetweenValues() {
      let geneBetweenValues = [];
      let presencePatternList = [];
      this.isLocalAreaSelectedDataDisplayed = !this.isLocalAreaSelectedDataDisplayed;
      let selectedChromData = this.fullChromData[this.selectedChrom];
      for (let i = 0; i < selectedChromData.length; i++) {
        if (selectedChromData[i].FeatureStart >= this.valueNT[0] &&
            selectedChromData[i].FeatureStop <= this.valueNT[1]) {
          geneBetweenValues.push(selectedChromData[i]);
        }
      }
      for (let i = 0; i < this.genomeListInDisplay.length; i++) {
        presencePatternList.push([]);
      }
      for (let i = 0; i < geneBetweenValues.length; i++) {
        for (let j = 0; j < this.genomeListInDisplay.length; j++) {
          if (parseInt(geneBetweenValues[i][this.genomeListInDisplay[j]]) >= 1) {
            presencePatternList[j].push(1);
          } else {
            presencePatternList[j].push(0);
          }
        }
      }
      console.log({geneBetweenValues});
      console.log({presencePatternList});
      let clusterOrder = clusterData({ data: presencePatternList }).order;
      console.log({clusterOrder});
      let genomeListSorted = [];
      for (let i = 0; i < clusterOrder.length; i++) {
        genomeListSorted.push(this.genomeListInDisplay[clusterOrder[i]])
      }
      console.log({genomeListSorted});
      this.updateGenomesInDisplay(genomeListSorted);
    },
  }
}
</script>

<style scoped>

.centerT {
  text-align: center;
}

</style>