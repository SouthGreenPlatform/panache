<template>
  <div class="marTop15">
    <!--  Component Slider used  -->
    <Slider
        v-model="pxBoundaries"
        :min="leftmostPixel"
        :max="rightmostPixel"
        :merge="isToolTipDisplayed ? 100000000 : -1"
        :tooltips="isToolTipDisplayed"
    />
  </div>
</template>

<script>

import Vue from "vue";
import VueCompositionAPI from '@vue/composition-api'
Vue.use(VueCompositionAPI)
import Slider from '@vueform/slider/dist/slider.vue2.js'
import { mapActions, mapState } from "vuex";

export default {
  name: "PavPatternRegionSelector",
  components: {
    Slider,
  },
  props: {
    leftmostPixel: {
      require: true,
    },
    rightmostPixel: {
      require: true,
    },
  },
  data() {
    let initialLeftBorder = this.leftmostPixel;
    let initialRightBorder = this.rightmostPixel;
    return {
      pxBoundaries: [initialLeftBorder, initialRightBorder],
      isToolTipDisplayed: false,
    }
  },
  computed: {
    ...mapState({
      firstNtToDisplay: 'firstNtToDisplay',
      currentDisplayNtWidthInPx : 'currentDisplayNtWidthInPx',
    }),

    ntBoundaries() {
      let leftCoord = this.pxToNt(this.pxBoundaries[0]);
      let rightCoord = this.pxToNt(this.pxBoundaries[1]);
      return [leftCoord, rightCoord];
    },
  },
  methods: {
    ...mapActions([
      'updateRegionForPatternSort',
    ]),

    /**
     * Convert a lentgh in pixel to a length in nucleotides
     * @param pxAmount value in pixel
     * @returns {number} value in nucleotide
     */
     pxToNt(pxAmount) {
        return Math.round(pxAmount / this.currentDisplayNtWidthInPx + this.firstNtToDisplay);
    },
  },
  watch: {
    ntBoundaries: {
      handler: function() {
        this.updateRegionForPatternSort(this.ntBoundaries)
      },
      immediate: true
    },
  }
}
</script>

<style src="@vueform/slider/themes/default.css"></style>

<style>

/*.slider-touch-area, .slider-connect {
  background-color: black;
  border-radius: 0;
}*/

.slider-connect {
  background-color: rgb(0, 188, 255);
}

</style>

<style scoped>

.marTop15 {
  margin-top: 15px;
}

</style>