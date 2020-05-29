<template>
  <svg :width="svgWidth" :height="svgHeight">
    <g ref='zoomLegend'>
      <text font-family='sans-serif' font-size='10px' text-anchor='middle'>Zoom level</text>
      <g transform='translate(0,8)'>
        <path d='M -90 11 L 90 4 V 18 Z' fill='rgb(119, 119, 119)' />
        <rect x=-90 y=0 height=22 :width="ratioToSliderPosScale().range()[1]-ratioToSliderPosScale().range()[0]" fill='rgb(255, 233, 103)' fill-opacity=0.5 stroke='rgb(255, 158, 0)' />
        <text y=-3 x=-90 dominant-baseline='hanging' font-family='sans-serif' font-size='18px' fill='rgb(255, 158, 0)'>*</text>
        <line y1=0 y2=22 :x1="posBasedOnRatio" :x2="posBasedOnRatio" stroke-width=2 stroke='black' />
        <line class='overlay' :ref="`${id}_overlay`" y1=11 y2=11 x1=-110 x2=110 stroke-width=24 stroke='transparent' cursor='ew-resize' />
      </g>
      <text transform='translate(0,50)' font-family='sans-serif' font-size='10px' text-anchor="middle" dominant-baseline="hanging" fill='rgb(255, 158, 0)'>
        <tspan>* At these zoom levels </tspan>
        <tspan x=0 dy='1em'>lag might occur </tspan>
      </text>
    </g>
  </svg>

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
      default: undefined
    },
    svgWidth: {
      type: Number,
      default: 300
      },
    svgHeight: {
      type: Number,
      default: 100
      },
    displayWindowWidth: {
      type: Number,
      required: true
    }
  },
  data() {
    let defaultAmount = (this.acceptableAmountOfNt === undefined ? this.lastNt/20 : this.acceptableAmountOfNt);
    let defaultRatio = this.convertToRatio(defaultAmount);

    return {
      acceptableNtToPxRatio: defaultRatio,
      ntWidthInPixel: {
        current: defaultRatio,
        minEfficiency: defaultRatio,
        minGlobal: this.convertToRatio(this.lastNt),
        max: 2
      }
    }
  },
  computed: {
    getCurrentRatio() {
      return this.ntWidthInPixel.current
    },
    posBasedOnRatio() {
      return this.ratioToSliderPosScale(this.getCurrentRatio)
    },
    drawDisplay_windows() {
      return this.$store.state.localHandle;
    }
  },
  mounted() {
    //Applying the drag event on the track-overlay rect
    let self = this;

    d3.select(self.$refs[`${self.id}_overlay`])
      .call(d3.drag().on("start drag", function() {
        self.updateNtToPxRatio(d3.event.x)
      }));

    this.translateContent();
  },
  watch: {
    getCurrentRatio() {
      console.log(`New size of nt in px is: ${this.getCurrentRatio}`);
      this.$store.state.zoomLevel = this.ntWidthInPixel;
    },

    drawDisplay_windows: function(){
      this.$store.state.zoomLevel = this.ntWidthInPixel;
    }
  },
  methods: {
    ratioToSliderPosScale(value) {
      let self = this;
      let scale = d3.scaleLinear() //Linear Scale in two parts as low values are more important than "high" values that would not be displayed properly anyway, it has the number of features to display as an input
      .domain([self.ntWidthInPixel.minGlobal, self.ntWidthInPixel.minEfficiency, self.ntWidthInPixel.max]) //Last pivot is the "number" of features displayed when nt width == 10px
      .range([-90, -30, 90])
      .clamp(true);

      if (value===undefined) {
        return scale
      } else {
        return scale(value)
      }
    },
    updateNtToPxRatio(mousePos) {
      this.ntWidthInPixel.current = this.ratioToSliderPosScale().invert(mousePos);
    },
    convertToRatio(nbOfNtToSee) {
      return this.displayWindowWidth / nbOfNtToSee
    },
    translateContent() {
      console.log(this.svgWidth);
      let svgToMove = d3.select(this.$refs.zoomLegend);
      let bboxSvg = svgToMove.node().getBBox();
      let xMove = ((this.svgWidth - bboxSvg.width) / 2) + -bboxSvg.x;

      svgToMove.attr('transform', `translate(${xMove},20)`);
    },
  }
}
</script>


<style>

</style>
