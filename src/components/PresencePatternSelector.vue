<template>
  <div class="marTop15">
    <!--  Component Slider used  -->
    <Slider
        v-model="value"
        :min="minValue"
        :max="maxValue"
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
import { mapActions, mapGetters, mapState } from "vuex";

export default {
  name: "PresencePatternSelector",
  components: {
    Slider,
  },
  props: {
    minValue: {
      require: true,
    },
    maxValue: {
      require: true,
    },
  },
  data() {
    return {
      value: [0, 10000],
      isToolTipDisplayed: false,
    }
  },
  computed: {
    ...mapState({
      firstNtToDisplay: 'firstNtToDisplay',
      currentDisplayNtWidthInPx : 'currentDisplayNtWidthInPx',
    }),
    ...mapGetters({
      displayWindowWidth: 'displayWindowWidth',
    }),

    boundaries() {
      let leftCoord = Math.round(this.pxToNt(this.value[0]));
      let rightCoord = Math.round(this.pxToNt(this.value[1]));
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
      if (pxAmount <= 0) { // Make sure the var is not negative
        return 0;
      } else if (pxAmount >= this.displayWindowWidth) { // Check if the value is not higher than the size of the display (this is the case at the beginning)
        return this.displayWindowWidth / this.currentDisplayNtWidthInPx + this.firstNtToDisplay; // TODO: check if this case makes sense
      } else {
        return pxAmount / this.currentDisplayNtWidthInPx + this.firstNtToDisplay;
      }
    },
  },
  watch: {
    value() {
      this.updateRegionForPatternSort(this.boundaries);
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