<template>
  <div>

    <canvas ref="CanvasMiniature" :width="width" :height="height"></canvas>

    <svg class="svgAbsolute" :width="width" :height="height">
      <!-- Following translation should be dynamic instead -->
      <g ref='ticksForMiniature' id='miniatureTicks' style='10px sans-serif' transform='translate(0,65)'>
      </g>
      <g>
        <rect class="handle" :x="ntToCanvasPxPos(firstNtToDisplay)" :y="2*blockHeight-13" :width="widthOfHandle" height="46" style="stroke: rgb(59, 59, 59); position: absolute; fill-opacity: 0;" />
        <rect class="track-overlay" ref="overlayOfCanvas" :y="2*blockHeight-12" :width="width" :height="sliderHeight" style="fill-opacity: 0;" cursor="ew-resize" />
      </g>
    </svg>

  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'Canvas',
  props: {
    // Props qu'on récupère de Panache.vue
    chromosomeData: {
      type: Array,
      default: () => []
    },
    firstNtToDisplay: {
      type: Number,
      default: 0
    },
    width: {
      type: Number,
      default: 1100
    },
    height: {
      type: Number,
      default: 110
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
      default: () => 5.1
    },
    rightmostNt: {
      type: Number,
      default: 41332
    },
  },
  data() {
    return {
      blockHeight: 14,
      blockWidth: 12,
      alreadyAppend: false,
      sliderHeight: 50,
      miniWindowHandle: Function,
      correspondancePosColor: function() {
        let map = new Map();
        this.chromosomeData.forEach( function(d,i) {
          map.set(d.FeatureStart, i);
        });

        return map;
      },
      miniatureSliderScale: Function,
    }
  },
  mounted() {
    this.drawCanvas();
    this.drawSvg();
  },
  computed: {
    ntWidthInPxInDisplayWindow() {
      return this.$store.state.zoomLevel.current
    },
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

    lastNtToDisplay() {
      console.log(`lastNtToDisplay has changed and is now ${this.lastNtToDisplay}`);
      this.$store.dispatch('updateLastNtToDisplay', this.lastNtToDisplay)
    },
    amountOfNtToDisplay() {
      if (this.lastNtToDisplay === this.rightmostNt) {
        this.$store.dispatch('updateFirstNtToDisplay', Math.max([0, this.rightmostNt - this.amountOfNtToDisplay]));
        console.log('First nt to display has been updated through a watch on amountOfNtToDisplay');
      }
    },

    // Si les données du chromosome sont update on redessine la miniature
    chromosomeData: function() {
      this.drawCanvas();
      this.drawSvg();
    },

    // Si on change le core dans le filtre, on update seulement la partie de la miniature qui est update pour réduire le poids de l'opération
    coreThreshold: function() {
      let canvas = d3.select(this.$refs.CanvasMiniature);
      let context = canvas.node().getContext("2d");

      this.chromosomeData.forEach((d) => {

        let xPos = this.width * Number(d.index)/this.rightmostNt;
        let blockWidth = this.width * (Number(d.FeatureStop) - Number(d.FeatureStart))/this.rightmostNt+1;
        let trackHeight = this.blockHeight;

        if (Number(d.presenceCounter) === 0) {
          context.fillStyle = "#fff";
        } else if (Number(d.presenceCounter) >= this.coreThreshold) {
          context.fillStyle = this.$store.state.orangeColorScale.range()[1];
        } else {
          context.fillStyle = this.$store.state.blueColorScale.range()[1];
        }

        context.fillRect(xPos,
            2*trackHeight+6,
            blockWidth,
            trackHeight); //fillRect(x, y, width, height)
      })
    }
  },
  methods: {
    drawCanvas() {
      let canvas = d3.select(this.$refs.CanvasMiniature)
      let context = canvas.node().getContext("2d");

      context.clearRect(0, 0, canvas.attr("width"), canvas.attr("height"));

      this.chromosomeData.forEach((d) => {

        let presenceRatio = (this.nbOfGenomes-d.presenceCounter)/this.nbOfGenomes;
        let xPos = this.ntToCanvasPxPos(d.index);
        //+1 so that it is better drawn on the canvas (it is at least a full px)
        let blockWidth = this.ntToCanvasPxPos(Number(d.FeatureStop)-Number(d.FeatureStart)) +1;
        let trackHeight = this.blockHeight;


        //Colouring white blocks (those are used to overlay the coloured blocks that have a width slightly larger than what they should have, in order to show no gap within the miniature)
        context.fillStyle = "#FFF";
        context.fillRect(xPos,
          0,
          blockWidth,
          presenceRatio * 2*trackHeight); //fillRect(x, y, width, height)

        //Colouring the function blocks, rainbow style if there is no functionnal info
        if (this.nbOfFunctions === 1) {
            context.fillStyle = d3.interpolateRainbow( ( this.correspondancePosColor().get(d["FeatureStart"])%14 )/14 )
        } else {
            context.fillStyle = this.$store.state.functionColorScale(d["Function"]);
        }

        context.fillRect(xPos,
            presenceRatio * 2*trackHeight,
            blockWidth,
            2*trackHeight - presenceRatio * 2*trackHeight); //fillRect(x, y, width, height)


        //Drawing the core/disp miniature
        //Here we chose a yes/no colorScale instead of the one used in the display, for a better readibility
        if (Number(d.presenceCounter) === 0) {
          context.fillStyle = "#fff";
        } else if (Number(d.presenceCounter) >= this.coreThreshold) {
          context.fillStyle = this.$store.state.orangeColorScale.range()[1];
        } else {
          context.fillStyle = this.$store.state.blueColorScale.range()[1];
        }

        context.fillRect(xPos,
            2*trackHeight+6,
            blockWidth,
            trackHeight); //fillRect(x, y, width, height)


        //Drawing the rainbow miniature
        context.fillStyle = this.$store.state.pseudoRainbowColorScale(Number(d.FeatureStart));

        context.fillRect(xPos,
            2*trackHeight+6 + trackHeight+1,
            blockWidth,
            trackHeight);


        //Drawing the similarity miniature
        context.fillStyle = this.$store.state.greenColorScale(Number(d.SimilarBlocks.split(";").length));

        context.fillRect(xPos,
            2*trackHeight+6 + (trackHeight+1)*2,
            blockWidth,
            trackHeight);
      });
    },

    drawSvg() {
      let miniatureTicksScale = d3.scaleLinear()
                  .domain([0, this.rightmostNt])
                  .range([0, this.width]) // taille du canvas width
                  .clamp(true);

      // canvas + svg pour miniature
      // ajout g pour le svg
      d3.select(this.$refs.ticksForMiniature)
        .call(d3.axisBottom(miniatureTicksScale)
          .ticks(20)
          .tickFormat(d3.format("~s")));

      let self = this;

      d3.select(self.$refs.overlayOfCanvas)
        .call(d3.drag()
          .on("start drag", function() {
            self.slidingAlongBlocks(d3.mouse(this)[0]);
          })
        );
    },

    // fonction qui actualise firstNtToDisplay, et donc la position X du rectangle selon l'endroit cliqué sur la miniature
    slidingAlongBlocks(mouse_xPos) {

      //Borders for the accepted/available values of mouse_xPos
      //calculated for a centered handle
      let leftPxBorder = 0 + this.widthOfHandle/2;
      let rightPxBorder = this.width - this.widthOfHandle/2;

      //we change the value of the first nt to dsplay only if it is a valid one
      if ((mouse_xPos >= leftPxBorder) && (mouse_xPos <= rightPxBorder)) {
        let desiredPxLeftPos = mouse_xPos - this.widthOfHandle / 2;
        //console.log(`The first nt to display should be ${this.canvasPxPosToNt(desiredPxLeftPos)}`)
        this.$store.dispatch('updateFirstNtToDisplay', this.canvasPxPosToNt(desiredPxLeftPos));
        console.log(`firstNtToDisplay has changed in slidingAlongBlocks and is now ${this.firstNtToDisplay}`);
        console.log(`AND if I check in the store it's value is ${this.$store.state.firstNtToDisplay}`);
        //this.lastNtToDisplay will only be updated outside of this function
        //so we cannot change the store state in here, else the value would be wrong!!!
        //cf watch on lastNtToDisplay based on firstNtToDisplay instead


      } else if (mouse_xPos < leftPxBorder) {
        let desiredPxLeftPos = 0;
        this.$store.dispatch('updateFirstNtToDisplay', this.canvasPxPosToNt(desiredPxLeftPos));

      } else if (mouse_xPos > rightPxBorder) {
        let desiredPxLeftPos = this.width - this.widthOfHandle;
        this.$store.dispatch('updateFirstNtToDisplay', this.canvasPxPosToNt(desiredPxLeftPos));

      }
    },

    //function that returns where a nt should be placed on the canvas
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

.svgAbsolute {
  position: absolute;
  margin-top: 1.2rem;
  right: 3rem;
}

.invisibleRect {
  margin-top: 2rem;
  background-color: black;
  opacity: 0.5;
}
</style>
