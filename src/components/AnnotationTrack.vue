<template>
  <div id="swarm_container" :style="swarmContainerStyle">
    <svg :width="trackWidth" :height="swarm.height + swarm.marginTop">
      <g>
        <rect
          v-for="(geneAnnot, rectIdx) in squares"
          :key="geneAnnot.data.geneName"
          :ref="`annotRect_${rectIdx}`"
          :x="geneAnnot.x"
          :y="(geneAnnot.y + swarm.height - swarm.marginTop) * -1"
          :rx="selectedShape === 'circle' ? 20 : 0"
          :ry="selectedShape === 'circle' ? 20 : 0"
          :width="squareSize"
          :height="squareSize"
          stroke="white"
          stroke-width="1"
          :fill="geneAnnot.color"
          @mouseover="
            showAnnot(
              geneAnnot.data,
              rectIdx,
              ntToPx(middlePosAnnot(geneAnnot.data)),
              (geneAnnot.y + swarm.height - 40) * -1,
            )"
          @mouseout="hideAnnot"
          :transform="writeTranslate(0, (swarm.height - squareSize) * 2)"
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
      squares: [],
      squareSize: 10,
      swarm: {
        marginTop: 30,
        height: 0,
        radius: 13,
      },
      //set default values for current annotation to display
      annotCurrentContent: {
        geneName: 'FakeGene',
        geneStrand: +1,
        geneStart: 0,
        geneStop: 30,
        exons: [{
            start: 0,
            stop: 13,
          }, {
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
        transition: 'opacity 0.1.',
        'z-index': 333,
        //'pointer-events': 'none'; //let mouse events pass through
      },
      annotCardWidth: 0,
    }
  },
  watch: {
    annotToDisplay(data) {
      this.updateDataIntersection(data);
    },
    firstNtToDisplay() {
      this.updateDataIntersection(this.annotToDisplay);
    },
    lastNtToDisplay() {
      this.updateDataIntersection(this.annotToDisplay);
    }
  },
  mounted() {
    this.annotCardWidth = this.$refs.AnnotationCard.$el.offsetWidth;
  },
  computed: {
    selectedShape() {
      return this.$store.state.displayShapeSelected;
    },
    swarmContainerStyle() {
      return {
        background: '#2125290a',
        width: this.trackWidth + 'px',
        //height: '100%',
        'max-height': '80px',
        'overflow-x': 'hidden',
        'overflow-y': 'auto'
      };
    },
    ntToPx() {
      return d3.scaleLinear()
        .domain([this.firstNtToDisplay, this.lastNtToDisplay])
        .range([0, this.trackWidth])
    }
  },
  methods: {
    updateDataIntersection(data) {
      this.squares = this.prepareDataIntersection(data);
      document.querySelector("#swarm_container").scrollTop = this.swarm.height;
    },
    prepareDataIntersection(data) {
      const radius = this.swarm.radius ** 2;
      const epsilon = 1e-3;
      let height = 0;

      let squares = data.map(d => {
        return {
          x: this.ntToPx(this.middlePosAnnot(d)) - this.squareSize * 0.5,
          data: d
        }
      }).sort((a, b) => a.x - b.x);

      let head = null, tail = null;

      let intersects = (x, y) => {
        let a = head;

        while (a) {
          if (radius - epsilon > (a.x - x) ** 2 + (a.y - y) ** 2)
            return true;

          a = a.next;
        }
      }

      for (let b of squares) {
        while (head && head.x < b.x - radius)
          head = head.next;

        if (intersects(b.x, b.y = 0)) {
          let a = head;
          b.y = Infinity;

          do {
            let y = a.y + Math.sqrt(radius - (a.x - b.x) ** 2);

            if (y < b.y && !intersects(b.x, y))
              b.y = y;

            a = a.next;
          } while (a);

          if (b.y > height)
            height = b.y;
        }

        b.next = null;

        if (head === null)
          head = tail = b;
        else
          tail = tail.next = b;
      }

      this.swarm.height = height;

      return squares;
    },
    middlePosAnnot: function (annotation) {
      return (annotation.geneStart + annotation.geneStop) / 2;
    },
    writeTranslate: function (x = 0, y = 0) {
      return `translate(${x},${y})`
    },
    showAnnot: function (geneAnnot, svgIdx, xPos, yPos) {
      this.updateCurrentAnnot(geneAnnot);
      this.displayAnnot(svgIdx, xPos, yPos);
    },
    updateCurrentAnnot: function (geneAnnot) {
      //A deep copy is needed since there are inner Object / Array elements to copy
      //Following answer might not work with special cases (see https://medium.com/javascript-in-plain-english/how-to-deep-copy-objects-and-arrays-in-javascript-7c911359b089)
      //"If you do not use Dates, functions, undefined, Infinity, [NaN],
      //RegExps, Maps, Sets, Blobs, FileLists, ImageDatas, sparse Arrays,
      //Typed Arrays or other complex types within your object, a very simple
      //one liner to deep clone an object is: JSON.parse(JSON.stringify(object))”
      this.annotCurrentContent = JSON.parse(JSON.stringify(geneAnnot));
    },
    displayAnnot: function (svgIdx, xPos, yPos) {
      let coordConvMatrix = this.$refs[`annotRect_${svgIdx}`][0]
        .getScreenCTM()
        .translate(+xPos, +yPos);

      let idealLeftPos = window.pageXOffset + coordConvMatrix.e + 1.5 * this.squareSize;
      let idealTopPos = window.pageYOffset + coordConvMatrix.f + 1.5 * this.squareSize;
      let maxLeftPos = window.innerWidth - this.annotCardWidth - 20;

      let leftPos = Math.min(idealLeftPos, maxLeftPos);

      this.tooltipStyle.left = `${leftPos}px`;
      this.tooltipStyle.top = `${idealTopPos}px`;
      this.tooltipStyle.visibility = 'visible';
      this.tooltipStyle.transition = 'visibility 0.15s linear,opacity 0.15s linear';
      this.tooltipStyle.opacity = 1;
    },
    hideAnnot() {
      this.tooltipStyle.opacity = 0;
      this.tooltipStyle.visibility = 'hidden';
    }
  }
}
</script>