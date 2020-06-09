<template>
  <div class="canvasSvg">

    <canvas class="canvas" ref="CanvasMiniature" :width="width" :height="height"></canvas>

    <svg class="svg" :width="width" :height="height">
      <!-- Following translation should be dynamic instead -->
      <g ref='ticksForMiniature' id='miniatureTicks' style='10px sans-serif' transform='translate(0,65)'>
      </g>
      <g>
        <rect class="handle" :x="ntToCanvasPxPos(firstNtToDisplay)" :y="2*blockHeight-13" :width="widthOfHandle" height="46" style="stroke: rgb(59, 59, 59); position: absolute; fill-opacity: 0;" />
        <rect class="track-overlay" ref="overlayOfCanvas" :y="2*blockHeight-12" :width="width" :height="handleHeight" style="fill-opacity: 0;" cursor="ew-resize" />
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
      default: () => [] //Default in case data are not there at creation
    },
    firstNtToDisplay: {
      type: Number,
      default: 0
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
    width: {
      type: Number,
      default: 1100
    },
    height: {
      type: Number,
      default: 82
    },
    mainWindowWidth: {
      type: Number,
      default: 600
    },
    nbOfGenomes: {
      type: Number,
      default: 6
    },
    nbOfFunctions: {
      type: Number,
      default: 14
    },
    coreThreshold: {
      type: Number,
      default: () => 5.1 //Why TF is hardcoded, again?
    },
    rightmostNt: {
      type: Number,
      default: 41332 //Hard coded, again, come on.
    },
    colorScaleFunction :{
      type: Function,
      required: true
    },
    colorScaleCore :{
      type: Function,
      required: true
    },
    colorScaleDisp :{
      type: Function,
      required: true
    },
    colorScaleRainbow :{
      type: Function,
      required: true
    },
    colorScaleSimilarities :{
      type: Function,
      required: true
    }
  },
  data() {
    return {
      blockHeight: 14, //This should be based on outside properties
      handleHeight: 50, //This should not be hard coded
      correspondancePosColor() {
        let map = new Map();
        this.chromosomeData.forEach( function(d, i) {
          map.set(d.FeatureStart, i);
        });

        return map;
      }
    }
  },
  mounted() {
    this.drawCanvas();
    this.drawSvg();
  },
  computed: {
    amountOfNtToDisplay() {
      return this.mainWindowWidth / this.ntWidthInPxInDisplayWindow
    },
    lastNtToDisplay() {
      return Math.min(this.firstNtToDisplay + this.amountOfNtToDisplay, this.rightmostNt)
    },
    widthOfHandle() {
      return this.ntToCanvasPxPos(this.lastNtToDisplay) - this.ntToCanvasPxPos(this.firstNtToDisplay)
    }
  },
  watch: {
    //if inner lastNtToDisplay changes, this should be cascaded to the global variable
    lastNtToDisplay() {
      this.updateLastNt(this.lastNtToDisplay)
    },
    //amount changes => either lastNt changes, then see prevous watch, or firstNt has to change instead
    amountOfNtToDisplay() {
      if (this.lastNtToDisplay === this.rightmostNt) {
        this.updateFirstNt(Math.max(0, this.rightmostNt - this.amountOfNtToDisplay));
      }
    },
    //Whenever chromData change, both canvas and ticks should be redrawn
    chromosomeData() {
      this.drawCanvas();
      this.drawSvg();
    },

    //Whenever the core threshold changes, the corresponding track should be re-drawn on canvas
    coreThreshold() {
      let canvas = d3.select(this.$refs.CanvasMiniature);
      let context = canvas.node().getContext("2d");

      this.chromosomeData.forEach((d) => {

        //Definitions of the block properties
        let xPos = this.ntToCanvasPxPos(d.index);
        let trueWidth = this.ntToCanvasPxPos(Number(d.FeatureStop) - Number(d.FeatureStart));
        let blockWidth = Math.max(trueWidth, 1);
        let trackHeight = this.blockHeight;

        let histHeight = 2*trackHeight;
        let offset = histHeight + 6;

        this.drawCanvasRectForCoreTrack(d, context, xPos, offset, blockWidth, trackHeight);
      })
    }
  },
  methods: {
    drawCanvasRect(ctx, x, y, width, height) {
      //fillRect(x, y, width, height)
      ctx.fillRect(x, y, width, height)
    },
    drawCanvasRectForHist(d, ctx, x, offset, width, globalHeight) {
      //Clean edge for previous block in loop:
      //Colouring white blocks (those are used to overlay the coloured blocks
      //that have a width slightly larger than what they should have, in order
      //to show no gap within the miniature)
      context.fillStyle = "#FFF";
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
        ctx.fillStyle = this.colorScaleFunction(d["Function"]);
      }

      //height of histogram depends on the number of present blocks
      //BEWARE here height is measured from top to bottom, hence reversed calculation
      let reversedPresencePption = (this.nbOfGenomes - d.presenceCounter) / this.nbOfGenomes;
      let yPos = reversedPresencePption * globalHeight;

      this.drawCanvasRect(ctx, x, yPos, width, globalHeight - yPos);
    },
    drawCanvasRectForCoreTrack(d, ctx, x, offset, width, height) {
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
    drawCanvasRectForPosTrack(d, ctx, x, offset, width, height) {
      ctx.fillStyle = this.colorScaleRainbow(Number(d.FeatureStart));

      this.drawCanvasRect(ctx, x, offset, width, height);
    },
    drawCanvasRectForSimilTrack(d, ctx, x, offset, width, height) {
      ctx.fillStyle = this.colorScaleSimilarities(d.SimilarBlocks.split(";").length);

      this.drawCanvasRect(ctx, x, offset, width, height);
    },
    drawCanvas() {
      //Set canvas context
      let canvas = d3.select(this.$refs.CanvasMiniature)
      let context = canvas.node().getContext("2d");

      //Clear all previous drawing in case there was already one
      context.clearRect(0, 0, canvas.attr("width"), canvas.attr("height"));

      this.chromosomeData.forEach((d) => {

        //Definitions of the block properties
        let xPos = this.ntToCanvasPxPos(d.index);

        //Width is at least 1px to guarantee a proper display (no color blur applied)
        let trueWidth = this.ntToCanvasPxPos(Number(d.FeatureStop) - Number(d.FeatureStart));
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

    drawSvg() {
      let miniatureTicksScale = d3.scaleLinear()
                  .domain([0, this.rightmostNt]) //from nt space
                  .range([0, this.width]) //to px space of canvas
                  .clamp(true); //borders cannot be exceeded

      //adds graduated scale as new SVGs
      d3.select(this.$refs.ticksForMiniature)
        .call(d3.axisBottom(miniatureTicksScale)
          .ticks(20)
          .tickFormat(d3.format("~s")));

      //adds d3 event on canvas for interactivity
      let self = this;

      d3.select(self.$refs.overlayOfCanvas)
        .call(d3.drag()
          .on("start drag", function() {
            self.slidingAlongBlocks(d3.mouse(this)[0]);
          })
        );
    },

    //Updates firstNt when a user clicks on the browser bar
    slidingAlongBlocks(mouse_xPos) {

      //Borders for the accepted/available values of mouse_xPos
      //calculated for a centered handle
      let leftPxBorder = 0 + this.widthOfHandle/2;
      let rightPxBorder = this.width - this.widthOfHandle/2;

      //we change the value of the first nt to dsplay only if it is a valid one
      if ((mouse_xPos >= leftPxBorder) && (mouse_xPos <= rightPxBorder)) {
        let desiredPxLeftPos = mouse_xPos - this.widthOfHandle / 2;
        //this.lastNtToDisplay will only be updated outside of this function
        //so we cannot change its store state in here, else the value would be wrong!!!
        //cf watch on lastNtToDisplay based on firstNtToDisplay instead

      //When mouse is on the far left, stores min value instead
      } else if (mouse_xPos < leftPxBorder) {
        let desiredPxLeftPos = 0;

      //When mouse is on the far right, stores max value instead
      } else if (mouse_xPos > rightPxBorder) {
        let desiredPxLeftPos = this.width - this.widthOfHandle;
      }

      this.updateFirstNt(this.canvasPxPosToNt(desiredPxLeftPos));
    },

    //Function that returns where a nt should be placed on the canvas
    ntToCanvasPxPos(ntIndex) {
      //Checking if we can do the division
      if (this.rightmostNt === 0) {
        console.log('ERROR: rightmostNt should not be 0');
        return;
      }

      let xPosPx = Number(ntIndex) / this.rightmostNt * this.width;
      return xPosPx;
    },
    //reverse function of ntToCanvasPxPos
    canvasPxPosToNt(pxPos) {
      //Checking if we can do the division
      if (this.width === 0) {
        console.log('ERROR: canvas width should not be 0');
        return;
      }

      let ntIndex = pxPos * this.rightmostNt / this.width;
      return ntIndex;
    }
  }
}
</script>

<style >

.canvasSvg {
  position: relative;
  display: block;
  margin-top: 1.2rem;
}

.canvas {
  position: relative;
  display: inline-block;
  z-index: 1;
}

.svg {
  position: relative;
  display: inline-block;
  margin-top: -5.3rem;
  z-index: 5;
}
</style>
