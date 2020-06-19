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
      default: undefined //default value in case data are not loaded
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
    },
    updateGlobalZoom: {
      type: Function,
      required: true
    }
  },
  data() {
    let defaultAmount = (this.acceptableAmountOfNt === undefined ? this.lastNt/20 : this.acceptableAmountOfNt);
    let defaultRatio = this.convertToRatio(defaultAmount);
    console.log('Default ratio for zoom is:');
    console.log(defaultRatio);
    //Does this change everytime this.lastNt changes?

    return {
      acceptableNtToPxRatio: defaultRatio,
      ntWidthInPixel: defaultRatio, // Updates --> minEfficiency per default, or user input
    }
  },
  computed: {
    zoomThresholds() {
      return {
        minEfficiency: this.acceptableNtToPxRatio, // Updates --> max size under which too many elements are displayed, causing lag
        minGlobal: this.convertToRatio(this.lastNt), // Updates --> min size to see all nt at once
        max: 2 // Arbitrary value, it would not make much sense to see them bigger right now
      }
    },
    getCurrentRatio() {
      return this.ntWidthInPixel
    },
    getMinRatio() {
      return this.zoomThresholds.minGlobal
    },
    posBasedOnRatio() {
      return this.ratioToSliderPosScale(this.getCurrentRatio)
    }
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
    getCurrentRatio: function() {
      console.log('Ratio has changed to ...');
      console.log(this.getCurrentRatio);
      this.updateGlobalZoom(this.getCurrentRatio);
      console.log('Corresponding pos in px is supposed to be...');
      console.log(this.ratioToSliderPosScale(this.getCurrentRatio));
      console.log('since the max value associated with the righmost px is...');
      console.log(this.zoomThresholds.max);
      console.log('Indeed the max pos of domain is...');
      console.log(this.ratioToSliderPosScale().domain());
      console.log('Which is linked to this max pos of range...');
      console.log(this.ratioToSliderPosScale().range());
    },
    acceptableNtToPxRatio: function() {
      console.log('minEfficiency has changed')
    },
    lastNt: function() {
      console.log('lastNt has changed in zoom component:');
      console.log(this.lastNt)
    },
    displayWindowWidth: {
      immediate: true,
      handler: function() {
        console.log('Value of display window in Zoom component');
        console.log(this.displayWindowWidth);
      }
    }
  },
  methods: {
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
    updateNtToPxRatio(mousePos) {
      this.ntWidthInPixel = this.ratioToSliderPosScale().invert(mousePos);
    },
    convertToRatio(nbOfNtToSee) {
      return this.displayWindowWidth / nbOfNtToSee
    },
    centerContent() {
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
