<template>
  <div>
    <div class="row">
      <div class="col-1">-</div>
      <div class="col-9">
        <!--By default, range inputs “snap” to integer values. To change this, you can specify a step value. -->
        <input
          type="range"
          :id="id"
          :min="smallestNtWidthInPx"
          :max="largestNtWidthInPx"
          v-model="ntWidthInPixel"
          :step="stepBetweenNtWidthInPx"
        >
        <!-- CAUTION: v-model on range element returns a String object! -->
      </div>
      <div class="col-1">+</div>
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
        //TODO: think about whether it is a good behaviour
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

.row{
  justify-content: center;
}

</style>
