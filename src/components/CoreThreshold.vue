<template>
  <div>
    <div v-show="isGffUploaded" class="row mb-1">
      <div class="col-12 text-muted text-center">
        <div class="row">
          <div class="col-12">
            <!-- TODO: Extract the shape choice from the core threshold component... -->
            <small>Shape type</small>
          </div>
        </div>
        <div class="row">
          <div class="col-6 pr-0">
            <svg
              :width="shapeSize * 2"
              :height="shapeSize * 2"
              @click="selectShape('square')"
              class="float-right mr-0">
              <title>{{ 'square' | capitalize}}</title>
              <rect
                :x="shapeSize * 0.5"
                :y="shapeSize * 0.5"
                :width="shapeSize"
                :height="shapeSize"
                :fill="shapeFillColor"
                stroke-width="3"
                :stroke="selectedShape === 'square' ? shapeStrokeColorSelected : shapeStrokeColor">
              </rect>
            </svg>
          </div>
          <div class="col-6 pl-0">
            <svg
              :width="shapeSize * 2"
              :height="shapeSize * 2"
              @click="selectShape('circle')"
              class="float-left ml-0">
              <title>{{ 'circle' | capitalize}}</title>
              <circle
                :cx="(shapeSize * 2) * 0.5"
                :cy="(shapeSize * 2) * 0.5"
                :r="shapeSize * 0.5"
                :fill="shapeFillColor"
                stroke-width="3"
                :stroke="selectedShape === 'circle' ? shapeStrokeColorSelected : shapeStrokeColor">
              </circle>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-12 text-center text-muted">
        <small><em>Minimal Presence ratio to be part of <span :style="{color: rightColorScale.range()[1]}">Core</span></em></small>
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <svg :width="width" :height="height" :id="id">
          <defs>
            <linearGradient id='coreSliderGradient' x1="0" x2="1" y1="0" y2="0">
              <stop v-for="stop in stops" :key="stop.key" :offset="stopDynamicPpties(stop.key).offset" :stop-color="stopDynamicPpties(stop.key).color" :class="stop.class"></stop>
            </linearGradient>
          </defs>

          <text ref="coreSliderLegend" :transform="`translate(${width/2}, 0)`" font-family='sans-serif' font-size='10px' text-anchor="middle" dominant-baseline="hanging">
<!--            <tspan>Minimal Presence ratio </tspan>-->
<!--            <tspan x=0 dy='1.2em'>to be part of </tspan>-->
<!--            <tspan :fill="rightColorScale.range()[1]">Core</tspan>-->
          </text>

          <g ref="coreSliderSVGs">
            <path :d="makeArea(pathData)" stroke='#000' stroke-opacity=0.3 :fill="'url(#coreSliderGradient)'"/>
            <circle v-for="relPos in ['left', 'right']" :key="relPos" :cx="cxPos(relPos)" :r="4" :style="circleFill(relPos)"/>
            <circle :cx="thresholdToPxScale(threshold)" r=7 fill='#fff' stroke='#000' stroke-opacity=0.3 stroke-width="1.25px" class='handle'/>
            <g transform="translate(0,18)" class='ticks' font-family='sans-serif' font-size='10px'>
              <text :x="thresholdToPxScale(threshold)" text-anchor="middle">{{thresholdAsPercent}}</text>
            </g>
            <line :x1="pxToThresholdScale.domain()[0]" :x2="pxToThresholdScale.domain()[1]" stroke-width="30px" stroke-linecap="round" stroke="transparent" cursor="crosshair" class='track-overlay' :ref="`${id}_track-overlay`"/>
          </g>

        </svg>
      </div>
    </div>

  </div>
</template>

<script>
import * as d3 from "d3";
import {mapState} from "vuex";

export default {
  name: 'CoreThreshold',
  props: {
    leftColorScale: {
      type: Function,
      default: d3.scaleLinear()
                  .domain([0, 1])
                  //.interpolateHcl()
                  .range([d3.hcl(246, 0, 95), d3.hcl(246, 65, 70)])
    },
    rightColorScale: {
      type: Function,
      default: d3.scaleLinear()
                      .domain([0, 1])
                      //.interpolateHcl()
                      .range([d3.hcl(60, 0, 95), d3.hcl(60, 65, 70)])
    },
    id: {
      type: String,
      default: () => 'svgContainer_coreThreshold'
    }
  },
  data() {
    let [leftPx, rightPx] = [0, 100];

    return {
      shapeSize: 15,
      shapeFillColor: 'black',
      shapeStrokeColor: 'white',
      shapeStrokeColorSelected: '#fd7e14',
      threshold: 0.85,
      width: 300,
      height: 40,
      leftPosPixel: leftPx,
      rightPosPixel: rightPx,
      pxToThresholdScale: d3.scaleLinear() //Attaches to each threshold value a position on the slider
        .domain([leftPx, rightPx]) //Takes the slider's extreme length values as an input
        .range([0, 1]) //Ranges from and to the possible treshold values as an output
        .clamp(true), //.clamp(true) tells that the domains has 'closed' boundaries, that won't be exceeded,
      stops: [
        {key:'farLeft', class:''},
        {key:'centerLeft', class:"hueSwingingPointLeft"},
        {key:'centerRight', class:"hueSwingingPointRight"},
        {key:'farRight', class:''}
      ],
      pathData: [
        [leftPx - 4, 0, 0],
        [leftPx, 4, -4],
        [rightPx, 4, -4],
        [rightPx + 4, 0, 0]
      ]
    }
  },
  computed: {
    thresholdAsPercent() {return `${Math.round(this.threshold*100)}%`},
    selectedShape() {
      return this.$store.state.displayShapeSelected;
    },
    ...mapState({
      isGffUploaded: 'isGffUploaded',
    }),
  },
  methods: {
    selectShape(type) {
        this.$store.dispatch('updateDisplayShapeSelected', type);
    },
    makeArea: d3.area()
        .x(function(d) { return d[0] })
        .y0(function(d) { return d[1] }) //2nd elements are considered as the lower baseline of the shape
        .y1(function(d) { return d[2] }) //3rd elements are considered as the upper baseline of the shape
        .curve(d3.curveMonotoneY), //Style of the curve, see https://github.com/d3/d3-shape/blob/master/README.md#curves
    cxPos(position) {
      let pos = 0;

      switch (position) {
        case 'left':
          pos = (this.leftPosPixel - 4) - 4*2.5; //slider extremity + 2.5* circle's radius
          break;
        case 'right':
          pos = (this.rightPosPixel + 4) + 4*2.5;
          break;

        default:
          console.log('Position of circle is neither "left" nor "right":', position);
        break;
      }

      return pos;
    },
    circleFill(position) {
      let fill = 'black';

      switch (position) {
        case 'left':
          fill = this.leftColorScale.range()[1];
          break;
        case 'right':
          fill = this.rightColorScale.range()[1];
          break;

        default:
          console.log('Position of circle is neither "left" nor "right"');
          break;
      }

      return `fill:${fill}`;
    },
    stopDynamicPpties(stopKey) {
      let offset, color;

      switch (stopKey) {
        case 'farLeft':
          offset = 0;
          color = this.leftColorScale.range()[0];
          break;

        case 'centerLeft':
          offset = this.threshold;
          color = this.leftColorScale(this.threshold);
          break;

        case 'centerRight':
          offset = this.threshold;
          color = this.rightColorScale(this.threshold);
          break;

        case 'farRight':
          offset = 1;
          color = this.rightColorScale.range()[1];
          break;

        default:
          console.log('stopKey of gradient has not been found');
          break;
      }

      let properties = {offset: offset, color: color};
      return properties;
    },
    thresholdToPxScale(value) {
      return this.pxToThresholdScale.invert(value);
    },
    updateThreshold(mousePos) {
      this.threshold = this.pxToThresholdScale(mousePos);
      if(mousePos >= 0 && mousePos <= 100){
        this.$store.state.coreThresholdSlide = mousePos; // on enregistre en variable globale la valeur du slider pour modifier le canvas
       //console.log(this.$store.state.coreThresholdSlide);
      }
    },
    translateContent() {
      let svgToMove = d3.select(this.$refs.coreSliderSVGs);
      let bboxSvg = svgToMove.node().getBBox();
      let xMove = ((this.width - bboxSvg.width) / 2) + - bboxSvg.x;

      let bboxLegend = d3.select(this.$refs.coreSliderLegend).node().getBBox();
      let yMove =bboxLegend.y + bboxLegend.height + 15;

      svgToMove.attr('transform', `translate(${xMove},${yMove})`);
    }
  },
  watch: {
    threshold: function() {
      //console.log(this.threshold);
    }
  },
  mounted() {
    //Applying the drag event on the track-overlay rect
    let self = this;
    d3.select(this.$refs[`${this.id}_track-overlay`])
      .call(d3.drag().on("start drag", function() {
        self.updateThreshold(d3.event.x)
      }));

    this.translateContent();
  },
  filters: {
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.substr( 1, str.length);
    }
  }
}
</script>


<style>

</style>
