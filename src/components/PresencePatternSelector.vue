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
import { mapActions } from "vuex";

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
  methods: {
    ...mapActions([
      'updateLocalAreaSelected',
    ]),
  },
  watch: {
    value() {
      this.updateLocalAreaSelected(this.value);
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