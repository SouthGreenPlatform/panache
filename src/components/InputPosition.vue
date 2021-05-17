<template>
  <div>
    <b-input-group size="sm">
      <!--<b-input-group-prepend>
        <b-dropdown :text="selectedChrom !== null ? selectedChrom : 'Chr'" variant="success">
          <b-dropdown-item v-for="chrom in chromList" :key="chrom" @click="updateSelectedChrom(chrom)">{{ chrom }}</b-dropdown-item>
        </b-dropdown>
      </b-input-group-prepend>-->
      <b-form-input class="padLeft075" @keyup.enter="jumpToPosition(selectedNt)" v-model="selectedNt"></b-form-input>
      <b-input-group-append>
        <b-button class="h31" size="sm" variant="outline-info" @click="jumpToPosition(selectedNt)">GO</b-button>
      </b-input-group-append>
    </b-input-group>
  </div>
</template>

<script>
import {mapActions} from "vuex";

export default {
  name: "InputPosition",
  props: {
    lastNt: {
      type: Number,
      required: true
    },
    displayWindowWidth: {
      type: Number,
      required: true
    },
    ntWidthInPixel: {
      type: Number,
      required: true
    },
    updateGlobalFirstNt: {
      type: Function,
      required: true
    },
    currentFirstNt: {
      type: Number,
      default: 0
    },
    chromList: {
      type: Array,
      required: true
    },
  },
  data() {
    return {
      targetedPosNt: Number(),
      selectedChrom: null,
      selectedNt: 0,
    }
  },
  computed: {
    maxFirstNt() {
      return this.lastNt - this.pxToNt(this.displayWindowWidth);
    },
    amountOfNtInHalfScreen() {
      return this.pxToNt(this.displayWindowWidth / 2);
    },
    desiredFirstNt() {
      return this.targetedPosNt - this.amountOfNtInHalfScreen;
    },
    reachableFirstNt() {
      if (0 <= this.desiredFirstNt && this.desiredFirstNt <= this.maxFirstNt) {
        return this.desiredFirstNt;
      } else if (this.desiredFirstNt < 0) {
        return 0;
      } else {
        return this.maxFirstNt;
      }
    },
  },
  methods: {
    ...mapActions({
      updateSelectedChromStore: 'updateSelectedChrom',
    }),
    updateSelectedChrom(selectedChrom) {
      this.selectedChrom = selectedChrom;
    },
    pxToNt(pxAmount) {
      return pxAmount / this.ntWidthInPixel;
    },
    jumpToPosition(destinationToReach) {
      if (destinationToReach !== undefined) {
        this.targetedPosNt = destinationToReach;
        //this.updateSelectedChromStore(this.selectedChrom);
      }
    },
  },
  watch: {
    reachableFirstNt: function () {
      this.updateGlobalFirstNt(this.reachableFirstNt);
    },
    currentFirstNt: function () {
      this.targetedPosNt = Math.round(this.currentFirstNt + this.amountOfNtInHalfScreen);
    },
    ntWidthInPixel: function () {
      let floatTarget = (2 * this.currentFirstNt + this.pxToNt(this.displayWindowWidth)) / 2;
      this.targetedPosNt = Math.floor(floatTarget);
    },
  },
}
</script>

<style scoped>

.h31 {
  height: 31px;
}

.padLeft075 {
  padding-left: 0.75rem;;
}

</style>