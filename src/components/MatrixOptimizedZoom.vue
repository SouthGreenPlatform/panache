<template>
  <div>
    <div class="row">
      <div class="col-12">
      <!--By default, range inputs “snap” to integer values. To change this, you can specify a step value. In the example below, we double the number of steps by using step="0.5"-->
        <input
          type="range"
          :id="id"
          :min="smallestNtWidthInPx"
          :max="largestNtWidthInPx"
          v-model="ntWidthInPixel"
          :step="stepBetweenNtWidthInPx"
        >
        <input
          type="range"
          :id="'idboo'"
          min=0
          max=150
          v-model="fakeModel"
          step="2"
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
      fakeModel: 4
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
        console.warn({ntWidthUpdates: this.numericalNtWidthToStore});
        this.updateGlobalZoom(this.numericalNtWidthToStore);
      }
    },
    fakeModel: {
      immediate: true,
      handler: function() {
        console.warn({fakeModel: this.fakeModel});
        console.warn({fakeModel: Number(this.fakeModel)});
      }
    },

    smallestNtWidthInPx: {
      immediate: true,
      handler: function() {
        console.log({minOfRange: this.smallestNtWidthInPx});
      }
    },
    largestNtWidthInPx: {
      immediate: true,
      handler: function() {
        console.log({maxOfRange: this.largestNtWidthInPx});
      }
    },
  },

  methods: {
  },
}
</script>


<style>

</style>
