<template>
  <div class="canvasSvg" :style="containerDiv">

    <canvas class="canvas" ref="CanvasMiniature" :width="miniatureWidth" :height="canvasHeight"></canvas>

    <svg class="superimposedSvg" :width="miniatureWidth" :height="canvasHeight">
      <g :transform="writeTranslate(svgPadding, 0)">
        <!-- Following translation should be dynamic instead -->
        <g ref='ticksForMiniature' id='miniatureTicks' style='10px sans-serif' transform='translate(0,65)'>
        </g>
        <g>
          <rect class="handle" :x="ntToDrawingPxPos(firstNtToDisplay)" y=1 :width="widthOfHandle" :height="5*blockHeight +9" style="stroke: rgb(59, 59, 59); fill-opacity: 0;" />
          <rect class="track-overlay" ref="overlayOfCanvas" :y="2*blockHeight-12" :width="drawingWidth" :height="handleHeight" style="fill-opacity: 0;" cursor="ew-resize" />
        </g>
      </g>
    </svg>

  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'Canvas',
  props: {
    chromosomeData: {
      type: Array,
      default: () => [] //Default in case data are not there on creation
    },
    firstNtToDisplay: {
      type: Number,
      default: 0 //Default position
    },
    updateFirstNt: {
      type: Function,
      required: true
    },
    updateLastNt: {
      type: Function,
      required: true
    },
    ntWidthInPxInDisplayWindow: {
      type: Number,
      required: true
    },
    miniatureWidth: {
      type: Number,
      default: 40 //should be calculated automatically from available space
    },
    canvasHeight: {
      type: Number,
      default: 90 //Must be enough to show 5*blockHeight + interspace + ticks
    },
    mainWindowWidth: {
      type: Number,
      default: 600 //Should depend on available window space
    },
    nbOfGenomes: {
      type: Number,
      default: 6 //Replaced when real data are loaded
    },
    nbOfFunctions: {
      type: Number,
      default: 14 //Replaced when real data are loaded
    },
    coreThreshold: {
      type: Number,
      default: 3 //Replaced when real data are loaded + should be turned into a %
    },
    rightmostNt: {
      type: Number,
      default: 10000 //Replaced when real data are loaded
    },
    colorScaleFunction: {
      type: Function,
      required: true
    },
    colorScaleCore: {
      type: Function,
      required: true
    },
    colorScaleDisp: {
      type: Function,
      required: true
    },
    colorScaleRainbow: {
      type: Function,
      required: true
    },
    colorScaleSimilarities: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      blockHeight: 10, //This should be based on outside properties?
      handleHeight: 50, //This should not be hard coded but based on track sizes
      correspondancePosColor() {
        let map = new Map();
        this.chromosomeData.forEach( function(d, i) {
          map.set(d.FeatureStart, i);
        });

        return map;
      },
      svgPadding: 10,
    }
  },
  mounted() {
    this.drawCanvas();
    this.drawSvg();

    //adds d3 event superimposed on canvas for interactivity
    let self = this;

    d3.select(self.$refs.overlayOfCanvas)
      .call(d3.drag()
        .on("start drag", function() {
          self.slidingAlongBlocks(d3.mouse(this)[0]);
        })
      );
  },
  computed: {
    amountOfNtToDisplay() {
      return this.mainWindowWidth / this.ntWidthInPxInDisplayWindow
    },
    lastNtToDisplay() {
      return Math.min(this.firstNtToDisplay + this.amountOfNtToDisplay, this.rightmostNt)
    },
    widthOfHandle() {
      return this.ntToDrawingPxPos(this.lastNtToDisplay) - this.ntToDrawingPxPos(this.firstNtToDisplay)
    },
    drawingWidth() {
      return this.miniatureWidth - 2 * this.svgPadding
    },
    miniatureTicksScale() {
      let scale = d3.scaleLinear()
                    .domain([0, this.rightmostNt]) //from nt space
                    .range([0, this.drawingWidth]) //to px space of drawn canvas
                    .clamp(true); //borders cannot be exceeded

      return scale;
    },

    //Style object to apply on upper div for a correct display
    containerDiv() {
      return {
        display: 'inline-block',
        width: `${this.miniatureWidth}px`,
        height: `${this.canvasHeight}px`,
      }
    }
  },
  watch: {
    //if inner lastNtToDisplay changes, this should be cascaded to the global variable
    lastNtToDisplay: {
      immediate: true,
      handler: function() {
        this.updateLastNt(this.lastNtToDisplay)
      }
    },
    //amount changes => either lastNt changes, then see prevous watch, or firstNt has to change instead
    amountOfNtToDisplay: function() {
      if (this.lastNtToDisplay === this.rightmostNt) {
        this.updateFirstNt(Math.max(0, this.rightmostNt - this.amountOfNtToDisplay));
      }
    },
    //Whenever chromData change, both canvas and ticks should be redrawn
    chromosomeData: function() {
      this.drawCanvas();
    },
    //Whenever the core threshold changes, the corresponding track should be re-drawn on canvas
    coreThreshold: function() {
      let canvas = d3.select(this.$refs.CanvasMiniature);
      let context = canvas.node().getContext("2d");

      this.chromosomeData.forEach((d) => {

        //Definitions of the block properties
        let xPos = this.ntToDrawingPxPos_withPadding(d.index);
        let trueWidth = this.ntToDrawingPxPos(Number(d.FeatureStop) - Number(d.FeatureStart));
        let blockWidth = Math.max(trueWidth, 1);
        let trackHeight = this.blockHeight;

        let histHeight = 2*trackHeight;
        let offset = histHeight + 6;

        this.drawCanvasRectForCoreTrack(d, context, xPos, offset, blockWidth, trackHeight);
      })
    },
    //Ticks scale should be redrawn only when maxPosInNt changes
    rightmostNt: function() {
      this.miniatureTicksScale.domain([0, this.rightmostNt]);
      this.drawSvg();
    }
  },
  methods: {
    writeTranslate: function(x=0, y=0) {
      return `translate(${x},${y})`
    },
    drawCanvasRect: function(ctx, x, y, width, height) {
      //fillRect(x, y, width, height)
      ctx.fillRect(x, y, width, height)
    },
    drawCanvasRectForHist: function(d, ctx, x, offset, width, globalHeight) {
      //Clean edge for previous block in loop:
      //Colouring white blocks (those are used to overlay the coloured blocks
      //that have a width slightly larger than what they should have, in order
      //to show no gap within the miniature)
      ctx.fillStyle = "#FFF";
      this.drawCanvasRect(ctx, x, offset, width, globalHeight);

      //Colouring the function blocks, rainbow style if there is no functionnal info
      if (this.nbOfFunctions === 1) {
        //How many different colors should be used
        let nbOfColors = 14;
        //index based color number, between 1 and nbOfColors
        let colorNumber = this.correspondancePosColor().get(d["FeatureStart"]) % nbOfColors;
        //percent of the chosen colorNumber compared to the full set of colors
        let colorRatio = colorNumber / nbOfColors;
        //Apply associated color
        ctx.fillStyle = d3.interpolateRainbow( colorRatio );
      } else {
        ctx.fillStyle = this.colorScaleFunction(d);
      }

      //height of histogram depends on the number of present blocks
      //BEWARE here height is measured from top to bottom, hence reversed calculation
      let reversedPresencePption = (this.nbOfGenomes - d.presenceCounter) / this.nbOfGenomes;
      let yPos = reversedPresencePption * globalHeight;

      this.drawCanvasRect(ctx, x, yPos, width, globalHeight - yPos);
    },
    drawCanvasRectForCoreTrack: function(d, ctx, x, offset, width, height) {
      //Here we chose a yes/no colorScale instead of the one used in the display, for a better readibility
      if (Number(d.presenceCounter) === 0) {
          ctx.fillStyle = "#fff";
        } else if (Number(d.presenceCounter) >= this.coreThreshold) {
          ctx.fillStyle = this.colorScaleCore.range()[1];
        } else {
          ctx.fillStyle = this.colorScaleDisp.range()[1];
        }

      this.drawCanvasRect(ctx, x, offset, width, height);
    },
    drawCanvasRectForPosTrack: function(d, ctx, x, offset, width, height) {
      ctx.fillStyle = this.colorScaleRainbow(Number(d.FeatureStart));

      this.drawCanvasRect(ctx, x, offset, width, height);
    },
    drawCanvasRectForSimilTrack: function(d, ctx, x, offset, width, height) {
      ctx.fillStyle = this.colorScaleSimilarities(d.SimilarBlocks.split(";").length);

      this.drawCanvasRect(ctx, x, offset, width, height);
    },
    drawCanvas: function() {
      //Set canvas context
      let canvas = d3.select(this.$refs.CanvasMiniature)
      let context = canvas.node().getContext("2d");

      //Clear all previous drawing in case there was already one
      context.clearRect(0, 0, this.miniatureWidth, this.canvasHeight);

      this.chromosomeData.forEach((d) => {

        //Definitions of the block properties
        let xPos = this.ntToDrawingPxPos_withPadding(d.index);

        //Width is at least 1px to guarantee a proper display (no color blur applied)
        let trueWidth = this.ntToDrawingPxPos(Number(d.FeatureStop) - Number(d.FeatureStart));
        let blockWidth = Math.max(trueWidth, 1);

        let trackHeight = this.blockHeight;

        let offset;

        //Drawing a histogram of PAV matrix
        this.drawCanvasRectForHist(d, context, xPos, 0, blockWidth, 2*trackHeight);
        offset = 2*trackHeight;

        //Drawing the core/disp miniature
        offset += 6;
        this.drawCanvasRectForCoreTrack(d, context, xPos, offset, blockWidth, trackHeight);

        //Drawing the rainbow miniature
        offset += trackHeight+1;
        this.drawCanvasRectForPosTrack(d, context, xPos, offset, blockWidth, trackHeight);

        //Drawing the similarity miniature
        offset += trackHeight+1;
        this.drawCanvasRectForSimilTrack(d, context, xPos, offset, blockWidth, trackHeight);

      });
    },
    /**
     * Draws the SVG ticks for the miniature in the dedicated g element
    */
    drawSvg: function() {
      d3.select(this.$refs.ticksForMiniature)
        .call(d3.axisBottom(this.miniatureTicksScale)
          .ticks(20)
          .tickFormat(d3.format("~s")));
    },

    //Updates firstNt when a user clicks on the browser bar
    slidingAlongBlocks: function(mouse_xPos) {

      //Borders for the accepted/available values of mouse_xPos
      //calculated for a centered handle
      let leftPxBorder = 0 + this.widthOfHandle/2;
      let rightPxBorder = this.drawingWidth - this.widthOfHandle/2;
      let desiredPxLeftPos;

      //we change the value of the first nt to dsplay only if it is a valid one
      if ((mouse_xPos >= leftPxBorder) && (mouse_xPos <= rightPxBorder)) {
        desiredPxLeftPos = mouse_xPos - this.widthOfHandle / 2;
        //this.lastNtToDisplay will only be updated outside of this function
        //so we cannot change its store state in here, else the value would be wrong!!!
        //cf watch on lastNtToDisplay based on firstNtToDisplay instead

      //When mouse is on the far left, stores min value instead
      } else if (mouse_xPos < leftPxBorder) {
        desiredPxLeftPos = 0;

      //When mouse is on the far right, stores max value instead
      } else if (mouse_xPos > rightPxBorder) {
        desiredPxLeftPos = this.drawingWidth - this.widthOfHandle;
      }

      this.updateFirstNt(this.drawingPxPosToNt(desiredPxLeftPos));
    },

    //Function that returns where a nt should be placed on the canvas's drawing
    ntToDrawingPxPos: function(ntIndex) {
      //Checking if we can do the division
      if (this.rightmostNt === 0) {
        console.error('ERROR: rightmostNt should not be 0');
        return;
      }

      //xPos depends on drawn area, which is not directly miniatureWidth but
      //drawingWidth since it includes the 'padding'
      let xPosPx = Number(ntIndex) / this.rightmostNt * this.drawingWidth;

      return xPosPx;
    },
    //Function that returns the pixel position of a nt, padding included
    //CAUTION: This should not be used for width values
    ntToDrawingPxPos_withPadding: function(ntIndex) {
      let pxPosWhenNoPad = this.ntToDrawingPxPos(ntIndex);
      let pxPosWithPad = pxPosWhenNoPad + this.svgPadding;

      return pxPosWithPad;
    },
    //reverse function of ntToDrawingPxPos
    drawingPxPosToNt: function(pxPos) {
      //Checking if we can do the division
      if (this.drawingWidth === 0) {
        console.error('ERROR: drawingWidth should not be 0');
        return;
      }

      let ntIndex = pxPos * this.rightmostNt / this.drawingWidth;
      return ntIndex;
    }
  }
}
</script>

<!--Here again are too many hardcoded values!!!/-->
<style scoped>

.canvas {
  position: absolute;
  display: block;
  z-index: 0;
}
.superimposedSvg {
  position: absolute;
  display: block;
  z-index: 1;
}

</style>
