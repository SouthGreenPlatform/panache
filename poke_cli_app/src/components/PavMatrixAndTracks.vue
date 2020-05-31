<template>
  <svg :height="displayHeight" :width="displayWidth">
    <svg ref='pavMatrix' :height="pavMatrixHeight" :width="displayWidth">
      <g v-for="(genome, index) in genomeList" :key="genome" :id="`presence_${genome}`">
        <rect v-for="block in filteredData"
          :key="block.index"
          class='movableBlock'
          :x="ntToPx(block.index)"
          :y="applyOffset(index * blocksDimensions.height)"
          :transform="writeTranslateWithOffSet(0,0)"
          :height="blocksDimensions.height"
          :width="ntToPx(block.FeatureStop - block.FeatureStart)"
          :fill="colorScaleFunction(block.Function)"
          :opacity="calcPavBlockOpacity(block[`${genome}`])"
          @mouseover="XXXsomeConditionalEventXXX"
          @mouseout="XXXsomeConditionalEventXXX"
        />
      </g>
      <!-- related event are applied on 'mounted', could we find another way through Vue?-->
      <!-- IMPORTANT The position of the handle does not seem to work properly, to investigate!-->
      <!-- It is surely a pbl of 'blockOffset' being based on a wrong mouse position, cf y pos of line?-->
      <g v-show="heightOfTotBlocks > pavMatrixHeight" ref='pavConditionalSlider' id="fadingScrollbar" opacity='0' :transform="writeTranslate(displayWidth-10, 10)" >
        <line y1='0' :y2="blockVerticalOffsetToSliderScale.range()[1]" :stroke="hclToRgb(0,0,25)" stroke-linecap='round' stroke-opacity='0.3' stroke-width='10px'/>
        <line y1='0' :y2="blockVerticalOffsetToSliderScale.range()[1]" :stroke="hclToRgb(0,0,95)" stroke-linecap='round' stroke-width='8px'/>
        <circle :cy="blockVerticalOffsetToSliderScale(blockOffset)" r='7' :fill="hclToRgb(0,0,100)" :stroke="hclToRgb(0,0,25)" stroke-opacity='0.3' stroke-width='1.25px'/>
        <line y1='-10' :y2="`${blockVerticalOffsetToSliderScale.range()[1]+10}`" cursor='ns-resize' stroke='transparent' stroke-width='120px'/>
      </g>
    </svg>
    <g>
      <defs>
        <linearGradient v-for="gradient in bgGradients" :key="gradient.side" :id="`repeatsBgLabelGradient_${gradient.side}`" :x1="gradient.x1" :x2="gradient.x2" y1="0" y2="0">
          <stop v-for="stop in stops" :key="`offset_${stop.offset}`" :offset="stop.offset" :stop-color="stop.color" :stop-opacity="stop.opacity"/>
        </linearGradient>
      </defs>
      <g ref='informationTracks' id="informationTracks" :transform="writeTranslate(0, pavMatrixHeight+5)">
        <g v-for="(track, index) in tracks" :key="track.name" :id="track.name" :transform="writeTranslate(0, index * (blocksDimensions.height+3))">
          <rect v-for="block in filteredData"
            :key="block.index"
            :ref="`block${block.index}_${track.name}`"
            class='movableBlock'
            :x="ntToPx(block.index)"
            y='0'
            :transform="writeTranslateWithOffSet(0,0)"
            :height="blocksDimensions.height"
            :width="ntToPx(block.FeatureStop - block.FeatureStart)"
            :fill="track.colorScale(block)"
            @mouseover="function() {eventHighlightColor(`block${block.index}_${track.name}`)}"
            @mouseout="function() {eventRestoreColor(`block${block.index}_${track.name}`)}"
          />
        </g>
      </g>
      <!-- Hard written traslation could surely be improved-->
      <g id='structureInfo' :transform="writeTranslate(0, pavMatrixHeight+5 + 50)">
        <g id='blocksStructuralVariation'>
          <g v-for="(chromName, index) in chromList"
            :key="chromName"
            :id="`duplicationBoxes_${chromName}`"
            :transform="writeTranslate(0, index * blocksDimensions.height)">
            <line class='bgLine' x1='0' :x2='displayWidth' :y1="0.5*blocksDimensions.height" :y2="0.5*blocksDimensions.height" stroke='#eeeeee' stroke-width='6px'/>
            <!-- similarity boxes are translated in order to be centered-->
            <rect v-for="block in filteredData"
              :key="block.index"
              class='movableBoxes'
              :x="ntToPx(block.index)"
              y='0'
              :transform="writeTranslateWithOffSet( 0.5* ((block.FeatureStop - block.FeatureStart) - pptionBasedWidth(block, chromName) ), 0)"
              :width="pptionBasedWidth(block, chromName)"
              :height="blocksDimensions.height"
              :fill="similarityFill(block, chromName)"
              :stroke="similarityStroke(block)"
              :stroke-opacity="`${(block[`copyPptionIn_Chr${chromName}`] > 0 ? 0.8 : 0)}`"
              stroke-width='0.5'
            />
          </g>
        </g>
        <!-- Following labels could be more automatized through a data containing ids and positions depending on right/left legends /-->
        <g v-for="panel in structLegendPanels"
        :key="panel.side"
        :ref="`panChromLegend_${panel.side}`"
        :id="`panChromLegend_${panel.side}`"
        :transform="panel.translation"
        @mouseover="function() {eventHideRef(`panChromLegend_${panel.side}`)}"
        @mouseout="function() {eventShowRef(`panChromLegend_${panel.side}`)}">
          <rect :x="panel.x" y='0' :height="chromList.length * blocksDimensions.height" :width="legendPanelWidth" :fill="`url(#repeatsBgLabelGradient_${panel.side})`"/>
          <text v-for="(chromName, index) in chromList"
            :key="chromName"
            :x="panel.xPos"
            :y="index * (blocksDimensions.height)"
            dominant-baseline='hanging'
            font-family='sans-serif'
            font-size='10px'
            :text-anchor="panel.anchor"
            >
            {{chromName}}
          </text>
        </g>
      </g>
    </g>

  </svg>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'PavMatrixAndTracks.vue',
  props: {
    filteredData: {
      type: Array,
      default : () => []
    },
    displayWidth: {
      type: Number,
      default : 1100
    },
    displayHeight: {
      type: Number,
      default : 600
    },
    genomeList: {
      type: Array,
      //Defult must not be empty, so that length > 0 !
      default: () => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
    },
    chromList: {
      type: Array,
      //Defult must not be empty, so that length > 0 !
      default: () => ['chrom0', 'chrom1', 'chrom2', 'chrom3']
    },
    nbOfFunctionsOrFunctionListToGetLength: {
      type: Number,
      default: 14
    },
    colorScaleFunction : {
      type: Function,
      default: () => 'purple'
    },
    colorScaleRainbow: {
      type: Function,
      default: () => 'yellow'
    },
    colorScaleSimilarities: {
      type: Function,
      default: d3.scaleLinear().range([d3.hcl('green'), d3.hcl('green')])
    },
    coreThreshold: {
      type: Number,
      required : true
    },
    displaySizeOfNt: {
      type: Number,
      required : true
    },
    blocksDimensions: {
      type: Object,
      default: function() {
        return {width: 20, height: 10}
      }
    },
    firstNtToDisplay: {
      type: Number,
      default: 0
    }
  },
  data() {
    let self = this;

    let heightOfTotBlocks = this.blocksDimensions.height * this.genomeList.length;
    //let pavMatrixHeight = xxxxxxxxxxxxxxxxxxxxxxxxxxxx;
    let pavMatrixHeight = this.displayHeight/3;

    let colorScaleThresholdBased = function(data) {
      let value = data.presenceCounter;

      if (value >= self.coreThreshold) {
        return self.$store.state.orangeColorScale(value);
      } else {
        return self.$store.state.blueColorScale(value);
      }
    };

    let simFill = function(d, chromName) {
      let color = self.colorScaleSimilarities.range()[1];
      color.h = 180;
      //Only the lightness changes between similarity boxes
      color.l = 100-(d[`copyPptionIn_Chr${chromName}`]*100*0.75);
      return color;
    }

    let simStroke = function(d) {
      //stroke color depends on number of occurences of similarities
      let color = d3.hcl(self.colorScaleSimilarities(d.SimilarBlocks.split(";").length));
      color.l -= 20;
      color.h = 180;
      return color;
    }

    let longestSizeOfChromName = Math.max(...this.chromList.map( d => d.length));
    let legendPanelWidth = longestSizeOfChromName * 10;

    return {
      heightOfTotBlocks:heightOfTotBlocks,
      pavMatrixHeight: pavMatrixHeight,
      blockVerticalOffsetToSliderScale: d3.scaleLinear() //Attaches to each threshold value a position on the slider
        .domain([0, heightOfTotBlocks - pavMatrixHeight]) //The offset should not allow hiding the bottom of the matrix, hence '- pavMatrixHeight'
        .range([0, pavMatrixHeight - 20]) //The scrolling bar will have the same height than the PA matrix svg, minus 20px
        .clamp(true),
      blockOffset: 0,
      stops: [
        {
          offset: 0,
          color: 'white',
          opacity: 1
        },
        {
          offset: 0.6,
          color: 'white',
          opacity: 1
        },
        {
          offset: 1,
          color: 'white',
          opacity: 0
        },
      ],
      bgGradients: [
        {
          side: 'left',
          x1: 0,
          x2: 1,
        },
        {
          side: 'right',
          x1: 1,
          x2: 0,
        },
      ],
      tracks: [
        {
          name: 'coreVSdispensable',
          colorScale: colorScaleThresholdBased
        },
        {
          name: 'rainbowed',
          colorScale: function(d) {
            return this.colorScaleRainbow(d.FeatureStart)
          }
        },
        {
          name: 'similarCount',
          colorScale: function(d) {
            return this.colorScaleSimilarities(d.SimilarBlocks.split(";").length)
          }
        }
      ],
      structLegendPanels: [
        {
          side: 'left',
          anchor: 'start',
          xPos: 0,
          translation: this.writeTranslate(0,0)
        },
        {
          side: 'right',
          anchor: 'end',
          xPos: legendPanelWidth,
          translation: this.writeTranslate(this.displayWidth-legendPanelWidth,0)
        }
      ],
      similarityFill: simFill,
      similarityStroke: simStroke,
      blockOriginColor: d3.hcl(10,50,80),
      legendPanelWidth: legendPanelWidth,
    }
  },
  computed: {
  },
  watch: {
    filteredData: function() {
      console.log('FilteredData has changed !')
    }
  },
  mounted() {
    //Applying the drag event on the track-overlay rect
    let self = this;
    d3.select(this.$refs['pavConditionalSlider'])
      .call(d3.drag().on("start drag", function() {
        self.updateBlockOffset(d3.event.y)
      }))
      .on("mouseover", function() {self.eventShowRef('pavConditionalSlider')})
      .on("mouseout", function() {self.eventHideRef('pavConditionalSlider')});

    //this.translateContent();
  },
  methods: {
    updateBlockOffset(mousePos) {
      this.blockOffset = this.blockVerticalOffsetToSliderScale.invert(mousePos)
    },
    applyOffset(initialPos) {
      return initialPos - this.blockOffset
    },
    ntToPx(ntAmount) {
      return ntAmount * this.displaySizeOfNt
    },
    calcPavBlockOpacity(pavEntry) {
      //pavEntry can be a Number or a String (eg. a genome name)
      if (isNaN(Number(pavEntry))) {
        //pavEntry not being a Number --> it is a String --> it is present
        return 1;
      } else {
        //pavEntry is either 0, 1 , a float in between or a higher Number
        //if >1, opacity will be set to 1 anyway
        return pavEntry;
      }
    },
    pptionBasedWidth(data, chromName) {
      let originalSize = this.ntToPx(data.FeatureStop - data.FeatureStart);
      let pptionalSize = (originalSize -2) * data[`copyPptionIn_Chr${chromName}`];

      return pptionalSize;
    },
    writeTranslate(x=0,y=0) {
      return `translate(${x},${y})`
    },
    writeTranslateWithOffSet(x=0, y=0) {
      let offsetX = this.ntToPx(this.firstNtToDisplay);
      return this.writeTranslate(x - offsetX, y)
    },
    hclToRgb(h, c, l) {
      let color = d3.hcl(h,c,l);
      return `${d3.rgb(color)}`
    },
    XXXsomeConditionalEventXXX() {
      //Do something
    },
    eventHideRef(refName) {
      d3.select(this.$refs[refName])
        .transition()
        .attr('opacity', 0)
    },
    eventShowRef(refName) {
      d3.select(this.$refs[refName])
        .transition()
        .attr('opacity', 1)
    },
    eventHighlightColor(refName) {
      //We have to select the first element of the ref, else it is not the svg...
      let svgToChange = d3.select(this.$refs[refName][0]);
      let color = d3.hcl(svgToChange.attr('fill'));//It's important to precise d3.hcl() to use .h .c or .l attributes

      // Copying the attributes in a new object, to get rid of pointer troubles
      this.blockOriginColor = d3.hcl(color.h, color.c, color.l);

      color.h = color.h + 10; //Slight change in hue for better noticing
      color.c = color.c * 1.1; //Slight increase in chroma
      color.l += (100 - color.l) * 0.5; //Slight increase in luminance without exceeding white

      svgToChange.attr('fill', color);
    },
    eventRestoreColor(refName) {
      //We have to select the first element of the ref, else it is not the svg...
      let svgToChange = d3.select(this.$refs[refName][0]);

      svgToChange.attr('fill', this.blockOriginColor);
    },
    XXXTooltipXXX() {
      //Do something
    }
  }
}
</script>

<style>

</style>
