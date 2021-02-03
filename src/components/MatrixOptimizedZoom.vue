<template>
  <div>
    <div class="row">
      <div class="col-12">
      <!--By default, range inputs “snap” to integer values. To change this, you can specify a step value. In the example below, we double the number of steps by using step="0.5"-->
        <input type="range"
          :id="id"
          :min="smallestNtWidthInPx"
          :max="largestNtWidthInPx"
          :v-model="ntWidthInPixel"
          :step="stepBetweenNtWidthInPx"
          type="number"
        >
      </div>
    </div>
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
    smallestNtWidthInPx: {
      type: Number,
      required: true,
    },
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

    let defaultNtWidthInPx;
    defaultNtWidthInPx = (this.smallestNtWidthInPx + this.largestNtWidthInPx) / 2;

    return {
      defaultNtWidthInPx: defaultNtWidthInPx,
      //Whenever the props change, the zoom value will be reset to the default value
      //TODO: think about whether it is a good behaviour
      ntWidthInPixel: defaultNtWidthInPx,
    }
  },

  computed: {
    stepBetweenNtWidthInPx() {
      return 0.1 * this.smallestNtWidthInPx
    },
  },

  created() {
  },
  mounted() {
  },

  watch: {

    //update stored zoom level if any
    ntWidthInPixel: {
      immediate: true,
      handler: function() {
        this.updateGlobalZoom(this.ntWidthInPixel);
      }
    },
  },

  methods: {
  },
}
</script>


<style>

</style>
