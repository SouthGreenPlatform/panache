<template>
  <div>
    <svg class="" :width="trackWidth" :height="trackHeight">
      <g >
        <rect v-for="(geneAnnot, rectIdx) in annotToDisplay"
          :key="geneAnnot.geneName"
          :ref="`annotRect_${rectIdx}`"
          :x="ntToPx(middlePosAnnot(geneAnnot))"
          :y="yPosOf(geneAnnot)"
          :width="squareSize"
          :height="squareSize"
          :fill="geneAnnot.color"
          @click="toggleStroke"
          @mouseover="function() {
            showAnnot(
              geneAnnot,
              rectIdx,
              ntToPx(middlePosAnnot(geneAnnot)),
              yPosOf(geneAnnot),
            )}"
          @mouseout="function() { hideAnnot(self) }"
          :transform="writeTranslate(0, (trackHeight - squareSize)/2)"
        />
      </g>
    </svg>
    <AnnotationCard
      ref='AnnotationCard'
      :style="tooltipStyle"
      :geneName="annotCurrentContent.geneName"
      :geneStartPos="annotCurrentContent.geneStart"
      :geneStopPos="annotCurrentContent.geneStop"
      :geneStrand="annotCurrentContent.geneStrand"
      :leftOverlaps="annotCurrentContent.leftOverlaps"
      :rightOverlaps="annotCurrentContent.rightOverlaps"
      :exonList="annotCurrentContent.exons"
      :writtenAnnot="annotCurrentContent.annotation"
    />
  </div>

</template>

<script>
import * as d3 from 'd3';
import AnnotationCard from '@/components/AnnotationCard.vue';

export default {
  name: 'AnnotationTrack',
  components: {
    AnnotationCard,
  },
  props: {
    annotToDisplay: {
      type: Array,
      default: () => [] //Default in case data are not there on creation
    },
    firstNtToDisplay: {
      type: Number,
      default: 0 //Default position
    },
    lastNtToDisplay: {
      type: Number,
      default: 1200 //Default position
    },
    trackWidth: {
      type: Number,
      default: 600
    },
    trackHeight: {
      type: Number,
      default: 20 //should be an even number
    },
  },
  data() {
    return {
      squareSize: 10,
      //set default values for current annotation to display
      annotCurrentContent: {
        geneName: 'FakeGene',
        geneStrand: +1,
        geneStart: 0,
        geneStop: 30,
        exons: [
          {
            start: 0,
            stop: 13,
          },
          {
            start: 23,
            stop: 30,
          },
        ],
        exonColor: 'crimson',
        annotation: '',
        leftOverlaps: [],
        rightOverlaps: [],
      },
      //Style object to apply on upper div for a correct display
      tooltipStyle: {
        left: '0px',
        top: '0px',
        visibility: 'hidden',
        position: 'absolute',
        opacity: 0,
        transition: 'opacity 0.1s',
        //'pointer-events': 'none'; //let mouse events pass through
      },
      annotCardWidth: 0,
    }
  },
  beforeMount() {
  },
  mounted() {
    //Store width of AnnotationCard html object, will be useful in displayAnnot()
    let width = this.$refs.AnnotationCard.$el.offsetWidth;
    this.annotCardWidth = width;
  },
  computed: {
    ntToPx() {
      let firstNt, lastNt;
      firstNt = this.firstNtToDisplay;
      lastNt = this.lastNtToDisplay;

      let firstPx, lastPx;
      firstPx = 0;
      lastPx = this.trackWidth;

      let scale = d3.scaleLinear()
        .domain([firstNt, lastNt])
        .range([firstPx, lastPx])

      return scale;
    },
    self() {
      return this;
    },
  },
  methods: {
    middlePosAnnot: function(annotation) {
      return (annotation.geneStart + annotation.geneStop) / 2;
    },
    writeTranslate: function(x=0,y=0) {
      return `translate(${x},${y})`
    },
    yPosOf: function() {
      // TODO : à adapter pour gérer les overlaps physiques de marques d'annot
      return 0;
    },
    showAnnot: function(geneAnnot, svgIdx, xPos, yPos) {
      this.updateCurrentAnnot(geneAnnot);
      this.displayAnnot(svgIdx, xPos, yPos);
    },
    updateCurrentAnnot: function(geneAnnot) {
      //A deep copy is needed since there are inner Object / Array elements to copy
      //Following answer might not work with special cases (see https://medium.com/javascript-in-plain-english/how-to-deep-copy-objects-and-arrays-in-javascript-7c911359b089)
      //"If you do not use Dates, functions, undefined, Infinity, [NaN],
      //RegExps, Maps, Sets, Blobs, FileLists, ImageDatas, sparse Arrays,
      //Typed Arrays or other complex types within your object, a very simple
      //one liner to deep clone an object is: JSON.parse(JSON.stringify(object))”
      this.annotCurrentContent = JSON.parse(JSON.stringify(geneAnnot));
    },
    displayAnnot: function(svgIdx, xPos, yPos) {
      let coordConvMatrix = this.$refs[`annotRect_${svgIdx}`][0].getScreenCTM()
        .translate(+xPos, +yPos);

      let idealLeftPos = window.pageXOffset + coordConvMatrix.e + 1.5 * this.squareSize;
      let idealTopPos = window.pageYOffset + coordConvMatrix.f + 1.5 * this.squareSize;
      let maxLeftPos = window.innerWidth - this.annotCardWidth;

      let leftPos = Math.min(idealLeftPos, maxLeftPos);

      this.tooltipStyle.left = `${leftPos}px`;
      this.tooltipStyle.top = `${idealTopPos}px`;
      this.tooltipStyle.visibility = 'visible';
      this.tooltipStyle.opacity = 1;
    },
    hideAnnot: function() {
      this.tooltipStyle.opacity = 0;
      this.tooltipStyle.visibility = 'hidden';
    },
    toggleStroke: function() {
      return
    },
  }
}
</script>


<style>

</style>
