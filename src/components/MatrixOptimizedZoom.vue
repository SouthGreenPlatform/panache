<template>
  <div>
    <b-input-group size="sm" prepend="–" append="+" class="mb-2 noBorder">
      <b-form-input class="noBorder" type="range" :id="id" :min="smallestNtWidthInPx" :max="largestNtWidthInPx" :step="stepBetweenNtWidthInPx" v-model="ntWidthInPixel"></b-form-input>
    </b-input-group>
  </div>
</template>

<script>

export default {
  name: 'MatrixOptimizedZoom',
  props: {
    id: {
      type: String,
      default: 'zoomLegend'
    },
    //nt width for panning
    smallestNtWidthInPx: {
      type: Number,
      required: true,
    },
    //nt width for details
    largestNtWidthInPx: {
      type: Number,
      required: true,
    },
    updateGlobalZoom: {
      type: Function,
      required: true
    }
  },

  data() {
    return {
      ntWidthInPixel: this.largestNtWidthInPx,
    }
  },
  computed: {
    defaultNtWidthInPx() {
      return (this.smallestNtWidthInPx + this.largestNtWidthInPx) / 2;
    },
    stepBetweenNtWidthInPx() {
      return 0.1 * this.smallestNtWidthInPx;
    },
    numericalNtWidthToStore() {
      return Number(this.ntWidthInPixel);
    }
  },
  created() {
  },
  mounted() {
  },
  watch: {
    defaultNtWidthInPx: {
      handler: function() {
        //Whenever the props change, the zoom value will be reset to the default value
        this.ntWidthInPixel = this.defaultNtWidthInPx;
      }
    },
    //update stored zoom level if any
    numericalNtWidthToStore: {
      immediate: true,
      handler: function() {
        this.updateGlobalZoom(this.numericalNtWidthToStore);
      }
    },

  },
  methods: {
  },
}
</script>

<style scoped>

.row {
  justify-content: center;
}

</style>

<style>

.noBorder  {
  border: none !important;
}

.zoomSlider > .input-group > .input-group-append > .input-group-text, .zoomSlider > .input-group > .input-group-prepend > .input-group-text {
  border: none !important;
  background-color: white !important;
}

</style>
