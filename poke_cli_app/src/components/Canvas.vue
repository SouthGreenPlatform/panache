<template>
  <div>

    <canvas ref="CanvasMiniature" :width="width" :height="height"></canvas>

    <svg ref="svgOnCanvas" class="svgAbsolute" :width="width" :height="height">
      <g>
        <rect class="handle" :width="sliderWidth" height="46" :x="0" :y="2*blockHeight-13" style="stroke: rgb(59, 59, 59); position: absolute; fill-opacity: 0;" />
        <rect class="track-overlay" ref="tracker" :y="2*blockHeight-12" :width="width" :height="sliderHeight" style="fill-opacity: 0;" cursor="ew-resize" />
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
    width: {
      type: Number,
      default: 1100
    },
    height: {
      type: Number,
      default: 110
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
    maxPositionInNucleotide: {
      type: Number,
      default: 41332
    },
    sliderWidth: {
      type: Number,
      default: 55
    },
    chromList: {
      type: Array,
      default: () => ['chrom0', 'chrom1', 'chrom2', 'chrom3']
    }
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
      rightmostNt: Number
    }
  },
  mounted() {
    this.drawCanvas();
    this.drawSvg();
  },
  computed: {
  },
  watch: {
    sliderWidth() {
      let slider = d3.select(this.$refs.svgOnCanvas).select("rect").attr("class", "handle");
      this.$store.state.localHandle = slider;
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
        let blockWidth = this.width * (Number(d.FeatureStop)-Number(d.FeatureStart))/this.rightmostNt+1;
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

        this.rightmostNt = Number(this.chromosomeData[this.chromosomeData.length-1].index);

        let presenceRatio = (this.nbOfGenomes-d.presenceCounter)/this.nbOfGenomes;
        let xPos = this.width * Number(d.index)/this.rightmostNt;
        let blockWidth = this.width * (Number(d.FeatureStop)-Number(d.FeatureStart))/this.rightmostNt+1;
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
                  .domain([0, this.maxPositionInNucleotide])
                  .range([0, this.width]) // taille du canvas width
                  .clamp(true); 

      // canvas + svg pour miniature
      // ajout g pour le svg
      d3.select(this.$refs.svgOnCanvas)
        .append("g") 
        .attr("id","miniatureTicks")
        .style("font", "10px sans-serif")
        .attr("transform", "translate(" + 0 + "," + 65 + ")")
        .call(d3.axisBottom(miniatureTicksScale)
          .ticks(20)
          .tickFormat(d3.format("~s")));

      let self = this;

      d3.select(self.$refs.tracker)
        .call(d3.drag()
          .on("start drag", function() { self.slidingAlongBlocks(d3.mouse(this)[0]);
      }));
    },

    // fonction qui actualise la position du rectangle de slide en fonction de la position cliqué sur la miniature
    slidingAlongBlocks(mouse_xPosition) {
      let slider = d3.select(this.$refs.svgOnCanvas).select("rect").attr("class", "handle");
      
      if (mouse_xPosition >= (0 + this.sliderWidth/2 -2) && mouse_xPosition <= (this.width - this.sliderWidth/2 +2)) {
        slider.attr("x", mouse_xPosition - this.sliderWidth/2);
        this.$store.state.firstNtDisplay = (mouse_xPosition - this.sliderWidth/2) / this.width * this.rightmostNt;
      }

      this.$store.state.localHandle = slider;
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
