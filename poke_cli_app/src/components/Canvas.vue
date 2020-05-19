<template>
  <div class="whiteBlockCanvas shadow-lg pt-4 mt-2">

    <canvas ref="CanvasMiniature" :width="width" :height="height"></canvas>

  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'Canvas',
  props: {
    chromosomeData: {
      type: Array,
      default: () => []
    },
    width: {
      type: Number,
      default: 1100
    },
    height: {
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
    colorScaleFunction : {
      type: Function,
      default: () => 'purple'
    },
    coreThreshold: {
      type: Function,
      default: () => 'red'
    },
    colorScaleCore: {
      type: Function,
      default: () => 'blue'
    },
    colorScaleDisp: {
      type: Function,
      default: () => 'black'
    },
    colorScaleRainbow: {
      type: Function,
      default: () => 'yellow'
    },
    colorScaleSimilarities: {
      type: Function,
      default: () => 'green'
    }
  },
  data() {
    return {
      blockHeight: 14,
      blockWidth: 12,
      correspondancePosColor: function() {
        let map = new Map();
        this.chromosomeData.forEach( function(d,i) {
          map.set(d.FeatureStart, i);
        });

        return map;
      }
    }
  },
  mounted() {
    this.drawCanvas();
  },
  watch: {
    chromosomeData: function() {
      this.drawCanvas();
    }
  },
  methods: {
    drawCanvas() {
      let canvas = d3.select(this.$refs.CanvasMiniature)
      let context = canvas.node().getContext("2d");

      context.clearRect(0, 0, canvas.attr("width"), canvas.attr("height"));

      this.chromosomeData.forEach((d) => {

        let rightmostNt = Number(this.chromosomeData[this.chromosomeData.length-1].index);

        let presenceRatio = (this.nbOfGenomes-d.presenceCounter)/this.nbOfGenomes;
        let xPos = this.width * Number(d.index)/rightmostNt;
        let blockWidth = this.width * (Number(d.FeatureStop)-Number(d.FeatureStart))/rightmostNt+1;
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
            context.fillStyle = this.colorScaleFunction(d["Function"]);
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
          context.fillStyle = this.colorScaleCore.range()[1];
        } else {
          context.fillStyle = this.colorScaleDisp.range()[1];
        }

        context.fillRect(xPos,
            2*trackHeight+6,
            blockWidth,
            trackHeight); //fillRect(x, y, width, height)


        //Drawing the rainbow miniature
        context.fillStyle = this.colorScaleRainbow(Number(d.FeatureStart));

        context.fillRect(xPos,
            2*trackHeight+6 + trackHeight+1,
            blockWidth,
            trackHeight);


        //Drawing the similarity miniature
        context.fillStyle = this.colorScaleSimilarities(Number(d.SimilarBlocks.split(";").length));

        context.fillRect(xPos,
            2*trackHeight+6 + (trackHeight+1)*2,
            blockWidth,
            trackHeight);
      });
    }
  }
}
</script>

<style >

.whiteBlockCanvas {
  background-color: white;
  width: 73rem;
  height: 45rem;
  border-radius: 50px;
  margin-left: 21rem;
}
</style>
