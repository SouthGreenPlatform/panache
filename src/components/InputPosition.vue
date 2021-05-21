<template>
  <div>
    <b-input-group size="sm">
      <b-input-group-prepend>
        <b-dropdown size="sm" :text="selectedChrom !== null ? selectedChrom : 'Chr'">
          <b-dropdown-item v-for="chrom in chromList" :key="chrom" @click="updateSelectedChrom(chrom)">{{ chrom }}</b-dropdown-item>
        </b-dropdown>
      </b-input-group-prepend>
      <b-form-input class="padLeft075" @keyup.enter="jumpToPosition(selectedNt)" v-model="selectedNt"></b-form-input>
      <b-input-group-append>
        <b-button size="sm" class="h31 buttonPanache" @click="jumpToPosition(selectedNt)">GO</b-button>
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
        if (this.selectedChrom !== null) {
          this.updateSelectedChromStore(this.selectedChrom);
        }
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

.btn-secondary {
  color: #495057;
  background-color: #fff;
  border-color: #ced4da;
}

.dropdown .b-dropdown .btn-group + button {
  color: #495057;
  background-color: #fff;
  border: 1px solid #ced4da;
  border-radius: .25rem;
  transition: .2s;
}

</style>

<style>

.buttonPanache, .b-form-tags > .b-dropdown > .btn {
  color: #495057;
  background-color: #fff;
  border: 1px solid #ced4da;
  border-radius: .25rem;
  transition: .2s;
}

.buttonPanache:hover, .b-form-tags > .b-dropdown > .btn:hover {
  background-color: #e9ecef;
  color: #495057;
  border-color: #ced4da;
}

.buttonPanache:active, .b-form-tags > .b-dropdown > .btn:active {
  color: #495057 !important;
  background-color: #e9ecef !important;
  border-color: #ced4da !important;
}

.buttonPanache:focus, .b-form-tags > .b-dropdown > .btn:focus {
  color: #495057 !important;
  background-color: #e9ecef !important;
  border-color: #ced4da !important;
}

.input-group > .input-group-prepend > .btn-group > .btn {
  color: #495057;
  background-color: #fff;
  border-color: #ced4da;
}

.input-group > .input-group-prepend > .btn-group > .btn:hover {
  background-color: #e9ecef;
}

.input-group > .input-group-prepend > .btn-group > .btn:active {
  color: #495057;
  background-color: #e9ecef;
  border-color: #ced4da;
}

</style>