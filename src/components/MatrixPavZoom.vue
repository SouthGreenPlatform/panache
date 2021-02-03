<template>
  <div>
    <div class="row">
      <div class="col-12">
        <svg :width="svgWidth" :height="svgHeight">
          <g ref='zoomLegend'>
            <text font-family='sans-serif' font-size='10px' text-anchor='middle'>Zoom level</text>
            <g transform='translate(0,8)'>
              <path d='M -90 11 L 90 4 V 18 Z' fill='rgb(119, 119, 119)' />
              <rect
                  x=-90
                  y=0
                  height=22
                  :width="ratioToSliderPosScale().range()[1]-ratioToSliderPosScale().range()[0]"
                  fill='rgb(255, 233, 103)'
                  fill-opacity=0.5
                  stroke='rgb(255, 158, 0)'
              />
              <text y=-3 x=-90 dominant-baseline='hanging' font-family='sans-serif' font-size='18px' fill='rgb(255, 158, 0)'>*</text>
              <line
                  y1=0
                  y2=22
                  :x1="posBasedOnRatio"
                  :x2="posBasedOnRatio"
                  stroke-width=2
                  stroke='black'
              />
              <line class='overlay' :ref="`${id}_overlay`" y1=11 y2=11 x1=-110 x2=110 stroke-width=24 stroke='transparent' cursor='ew-resize' />
            </g>
<!--            <text transform='translate(0,50)' font-family='sans-serif' font-size='10px' text-anchor="middle" dominant-baseline="hanging" fill='rgb(255, 158, 0)'>-->
<!--              <tspan>* At these zoom levels </tspan>-->
<!--              <tspan x=0 dy='1em'>lag might occur </tspan>-->
<!--            </text>-->
          </g>
        </svg>
      </div>
    </div>
    <div class="row">
      <div class="col-12 text-center" style="color: rgb(255, 158, 0)">
        <small><em>* At these zoom levels lag might occur </em></small>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'MatrixPavZoom',
  props: {
    id: {
      type: String,
      default: 'zoomLegend'
    },
    lastNt: {
      type: Number,
      required: true
    },
    acceptableAmountOfNt: {
      type: Number,
      default: undefined //default value in case data are not loaded
    },
    svgWidth: {
      type: Number,
      default: 300
      },
    svgHeight: {
      type: Number,
      default: 60
      },
    displayWindowWidth: {
      type: Number,
      required: true
    },
    updateGlobalZoom: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      ntWidthInPixel: 1, // Updates --> minEfficiency per default, or user input
      zoomHasBeenSelected: false
    }
  },
  computed: {
    defaultAmountOfNtToShow() {
      return (this.acceptableAmountOfNt === undefined ? this.lastNt/20 : this.acceptableAmountOfNt)
    },
    acceptableNtToPxRatio() {
      return this.convertToRatio(this.defaultAmountOfNtToShow);
    },
    zoomThresholds() {
      //minEfficiency should not be too big, in order to stay smaller than the max threshold
      let acceptableMinEfficiency = Math.min(1.2, this.acceptableNtToPxRatio);

      return {
        minEfficiency: acceptableMinEfficiency, // Updates --> max size under which too many elements are displayed, causing lag
        minGlobal: this.convertToRatio(this.lastNt), // Updates --> min size to see all nt at once
        max: 2 // Arbitrary value, it would not make much sense to see them bigger right now
      }
    },
    getMinEfficiencyRatio() {
      return this.zoomThresholds.minEfficiency
    },
    posBasedOnRatio() {
      return this.ratioToSliderPosScale(this.ntWidthInPixel)
    }
  },
  created() {
    //Set default zoom value depending on computed
    this.ntWidthInPixel = this.acceptableNtToPxRatio;
  },
  mounted() {
    //Applying the drag event on the track-overlay rect
    let self = this;

    d3.select(self.$refs[`${self.id}_overlay`])
      .call(d3.drag().on("start drag", function() {
        self.updateNtToPxRatio(d3.event.x)
      }));

    //Apply translation based on size so that the svg is centered
    this.centerContent();
  },
  watch: {
    //Set current zoom level to default if needed
    getMinEfficiencyRatio: function() {
      //If zoom has been manually selected, auto-update do not apply
      if (!this.zoomHasBeenSelected) {
        this.ntWidthInPixel = this.getMinEfficiencyRatio
      }
    },
    //update stored zoom level if any
    ntWidthInPixel: {
      immediate: true,
      handler: function() {
        this.updateGlobalZoom(this.ntWidthInPixel);
      }
    },
  },
  methods: {
    convertToRatio(nbOfNtToSee) {
      return this.displayWindowWidth / nbOfNtToSee
    },
    centerContent() {
      let svgToMove = d3.select(this.$refs.zoomLegend);
      let bboxSvg = svgToMove.node().getBBox();
      let xMove = ((this.svgWidth - bboxSvg.width) / 2) + -bboxSvg.x;

      svgToMove.attr('transform', `translate(${xMove},20)`);
    },

    //scale from zoom level to pos on slider
    ratioToSliderPosScale(value) {
      let self = this;
      let scale = d3.scaleLinear() //Linear Scale in two parts as low values are more important than "high" values that would not be displayed properly anyway, it has the number of features to display as an input
      .domain([self.zoomThresholds.minGlobal, self.zoomThresholds.minEfficiency, self.zoomThresholds.max]) //Last pivot is the "number" of features displayed when nt width == 10px
      .range([-90, -30, 90])
      .clamp(true);

      if (value === undefined) {
        return scale
      } else {
        return scale(value)
      }
    },
    //Assign zoom value depending on pos on the slider
    updateNtToPxRatio(mousePos) {
      this.zoomHasBeenSelected = true;
      this.ntWidthInPixel = this.ratioToSliderPosScale().invert(mousePos);
    },

  }
}
</script>


<style>

</style>
