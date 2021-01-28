<template>
  <div :style="wrapperStyle">

    <div class='annotCoord'>
      <div>{{geneName}}</div>
      <div>Gene's gff START: {{geneStartPos_1based}}</div>
    </div>

    <svg class='arrowLeft' width='11px' :height="6/2 + 6 + 2 + 20">
      <path
      v-if="geneStrand < 0"
        d='M 0 0 H 6 V 4 L 11 -1 L 6 -6 V -2 H 0 Z'
        fill='black'
        :transform="writeTranslate(xTranslationForArrow, 3) + ' ' + writeScale(geneStrand, 0.5)"
        />
    </svg>
    <svg class='annotSvg' :width="svgWidth" :height="6/2 + 6 + 2 + 20">
      <g :transform="writeTranslate(svgPadding, 0)">
        <g :transform="writeTranslate(0, 6/2)">
          <line
            :x1="ntToPx(geneStartPos)"
            :x2="ntToPx(geneStopPos)"
            stroke='dimgray'
            stroke-width=2
            />
          <rect v-for="exon in exonList"
            :key="exon.start"
            :x="ntToPx(exon.start)"
            :width="ntToPx(exon.stop) - ntToPx(exon.start)"
            height=6
            :fill="geneColor"
            :transform="writeTranslate(0, -(6/2))"
            />
        </g>
        <g
          ref='ticksForAnnotationCard'
          id='ticksForAnnotationCard'
          :transform="writeTranslate(0, 6/2 + 6 + 2)"/>
      </g>
    </svg>
    <svg class='arrowRight' width='11px' :height="6/2 + 6 + 2 + 20">
      <path
      v-if="geneStrand > 0"
        d='M 0 0 H 6 V 4 L 11 -1 L 6 -6 V -2 H 0 Z'
        fill='black'
        :transform="writeTranslate(xTranslationForArrow, 3) + ' ' + writeScale(geneStrand, 0.5)"
        />
    </svg>

    <div v-if="hasAnnotation" class='annotSup'>
      <div>Note: {{writtenAnnot}}</div>
    </div>

    <div v-if="hasOverlap" class='overLeft' style='color: dodgerblue;'>{{nbLeft}}</div>
    <div v-if="hasOverlap" class='annotOver'>
      <div>Overlaps:</div>
      <div v-for="name in leftOverlaps" :key="name" style='text-align: left; color: dodgerblue;'>{{name}}</div>
      <div v-for="name in rightOverlaps" :key="name" style='text-align: right; color: darkmagenta;'>{{name}}</div>
    </div>
    <div v-if="hasOverlap" class='overRight' style=' color: darkmagenta;'>{{nbRight}}</div>

  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: 'AnnotationCard',
  props: {
    svgWidth: {
      type: Number,
      default: 300
    },
    geneName: {
      type: String,
    },
    geneStartPos: {
      type: Number,
    },
    geneStopPos: {
      type: Number,
    },
    geneStrand: {
      type: Number, // +1 or -1
    },
    leftOverlaps: {
      type: Array,
      default: () => []
    },
    rightOverlaps: {
      type: Array,
      default: () => []
    },
    exonList: {
      type: Array,
      default: () => []
    },
    writtenAnnot: {
      type: String,
    },
    geneColor: {
      type: String,
      default: 'crimson'
    },
  },
  data() {
    return {
      svgPadding: 15,
     }
  },
  computed: {
    nbLeft() {
      return this.leftOverlaps.length
    },
    nbRight() {
      return this.rightOverlaps.length
    },
    drawingWidth() {
      return this.svgWidth - 2 * this.svgPadding
    },
    geneStartPos_1based() {
      return this.geneStartPos + 1
    },
    ntToPx() {
      let domStart, domStop;
      domStart = this.geneStartPos;
      domStop = this.geneStopPos;

      let scale = d3.scaleLinear()
        .domain([domStart, domStop])
        .range([0, this.drawingWidth])

      return scale
    },
    pxToNt() {
      let scale = d3.scaleLinear()
        .domain(this.ntToPx.domain())
        .range(this.ntToPx.range())

      return scale;
    },
    xTranslationForArrow() {
      let xTrans = 0;

      switch (this.geneStrand) {
        case 1:
          xTrans = 0; // drawing space length - arrow length
          break;

        case -1:
          xTrans = 11; // arrow length
          break;

        default:
          console.log('ERROR: Strand is not valid. Should be +1 or -1 but instead is:', this.geneStrand);
          break;
      }

      return xTrans;
    },
    hasAnnotation() {
      let hasIt = false;

      if (this.writtenAnnot !== '') {
        hasIt = true
      }

      return hasIt;
    },
    hasOverlap() {
      let hasIt = false;

      if (this.nbLeft + this.nbRight > 0) {
        hasIt = true
      }

      return hasIt;
    },
    //Style object to apply on upper div for a correct display
    wrapperStyle() {
      return {
        display: 'grid',
        //'row-gap': '0.5em',
        'grid-template-rows': 'auto auto auto auto',
        'grid-template-columns': `2em ${this.drawingWidth}px 2em`,
        padding: '1em',
        'background-color': 'beige',
        // "+2em" after the calc function is a hack to force the element to take the full width.
        width: `calc(2em + ${this.drawingWidth}px) + 2em`, // The space around '+' MUST be kept!
      }
    },
  },
  watch: {
    //Whenever a new scale is used, redraw ticks
    ntToPx: {
      immediate: true,
      deep: true,
      handler() {
        this.drawTicks();
      }
    }
  },
  methods: {
    writeTranslate: function(x=0, y=0) {
      return `translate(${x},${y})`
    },
    writeScale: function(x=1, y=1) {
      return `scale(${x},${y})`
    },
    drawTicks: function() {
      d3.select(this.$refs.ticksForAnnotationCard)
        .call(d3.axisBottom(this.ntToPx)
          .ticks(5)
          .tickFormat(d3.format("~s")));
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.annotCoord {
  grid-row: 1;
  grid-column: 1 / 4;
  text-align: center;
  align-self: center;
  margin-bottom: 0.5em;
}
.annotSvg {
  grid-row: 2;
  grid-column: 2;
  text-align: center;
  align-self: center;
  justify-self: center;
  margin-bottom: 0.5em;
}
.arrowLeft {
  grid-row: 2;
  grid-column: 1;
  justify-self: center;
}
.arrowRight {
  grid-row: 2;
  grid-column: 3;
  justify-self: center;
}
.annotSup {
  grid-row: 3;
  grid-column: 2;
  align-self: center;
  margin-bottom: 0.5em;
  text-align: justify;
}
.annotOver {
  grid-row: 4;
  grid-column: 2;
  align-self: center;
  text-align: center;
}
.overLeft {
  grid-row: 4;
  grid-column: 1;
  text-align: center;
}
.overRight {
  grid-row: 4;
  grid-column: 3;
  text-align: center;
}

</style>
