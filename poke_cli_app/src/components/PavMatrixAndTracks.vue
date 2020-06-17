<template>
<div>
  <svg ref='PanacheSvgContainer' :height="displayHeight" :width="displayWidth">
    <!-- SVG CONTAINER FOR THE PAV MATRIX -->
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
      <!-- VERTICAL SLIDER FOR THE PAV MATRIX -->
      <g v-show="heightOfTotBlocks > pavMatrixHeight" ref='pavConditionalSlider' id="fadingScrollbar" opacity='0' :transform="writeTranslate(displayWidth-10, 10)" >
        <line y1='0' :y2="blockVerticalOffsetToSliderScale.range()[1]" :stroke="hclToRgb(0,0,25)" stroke-linecap='round' stroke-opacity='0.3' stroke-width='10px'/>
        <line y1='0' :y2="blockVerticalOffsetToSliderScale.range()[1]" :stroke="hclToRgb(0,0,95)" stroke-linecap='round' stroke-width='8px'/>
        <circle :cy="blockVerticalOffsetToSliderScale(blockOffset)" r='7' :fill="hclToRgb(0,0,100)" :stroke="hclToRgb(0,0,25)" stroke-opacity='0.3' stroke-width='1.25px'/>
        <line y1='-10' :y2="`${blockVerticalOffsetToSliderScale.range()[1]+10}`" cursor='ns-resize' stroke='transparent' stroke-width='120px'/>
      </g>
    </svg>
    <g>
    <!-- DEFS FOR THE WHITE TO TRANSPARENT LEGEND BACKGROUNDS -->
      <defs>
        <linearGradient v-for="gradient in bgGradients" :key="gradient.side" :id="`repeatsBgLabelGradient_${gradient.side}`" :x1="gradient.x1" :x2="gradient.x2" y1="0" y2="0">
          <stop v-for="stop in stops" :key="`offset_${stop.offset}`" :offset="stop.offset" :stop-color="stop.color" :stop-opacity="stop.opacity"/>
        </linearGradient>
      </defs>
      <!-- TRACKS OF INFORMATION -->
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
            :width="ntToPx(FeatureWidth(block))"
            :fill="track.colorScale(block)"
          />
        </g>
      </g>
      <!-- SIMILARITY BOXES -->
      <!-- Hard written traslation could surely be improved-->
      <g id='structureInfo' :transform="writeTranslate(0, pavMatrixHeight+5 + 55)">
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
              :transform="writeTranslateWithOffSet( 0.5* (ntToPx(FeatureWidth(block)) - pptionBasedWidth(block, chromName) ), 0)"
              :width="pptionBasedWidth(block, chromName)"
              :height="blocksDimensions.height"
              :fill="similarityFill(block, chromName)"
              :stroke="similarityStroke(block)"
              :stroke-opacity="`${(block[`copyPptionIn_Chr${chromName}`] > 0 ? 0.8 : 0)}`"
              stroke-width='0.5'
            />
          </g>
        </g>
        <!-- LEGENDS AND BG PANELS FOR CHROMOSOME NAMES -->
        <!-- Following labels could be more automatized through a data containing ids and positions depending on right/left legends /-->
        <g v-for="panel in structLegendPanels"
        :key="panel.side"
        :ref="`panChromLegend_${panel.side}`"
        :id="`panChromLegend_${panel.side}`"
        :transform="panel.translation"
        @mouseover="function() {eventFadeOutRef(`panChromLegend_${panel.side}`)}"
        @mouseout="function() {eventFadeInRef(`panChromLegend_${panel.side}`)}">
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
    <!-- TOOLTIP -->
    <g :visibility="tooltipVisibility" id="hoverTooltip">
      <rect :x="tooltipData.x - tooltipData.margin"
      :y="tooltipData.y - tooltipData.margin"
      :height="tooltipData.height + 2 * tooltipData.margin"
      :width="tooltipData.width + 2 * tooltipData.margin"
      :fill="hclToRgb(83, 4, 96)"
      fill-opacity='0.9'
      :stroke="hclToRgb(86, 5, 80)"
      stroke-opacity='0.9'/>
      <text ref='tooltipForTracksAndPavMatrix'
        :x="tooltipData.x"
        :y="tooltipData.y"
        dominant-baseline='hanging'
        font-family='sans-serif'
        text-anchor='start'>
        {{tooltipTxtContent}}
      </text>
    </g>

  </svg>
  <canvas v-show='false' id='tooltipPreRenderingCanvas' ref='pavTooltipCanvas' height='50' :width="displayWidth"/>
</div>
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
        return {width: 20, height: 14}
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
      let color = d3.hcl(self.colorScaleSimilarities.range()[1]);
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
          name: 'panChrom_coreVSdispensable',
          colorScale: colorScaleThresholdBased
        },
        {
          name: 'panChrom_rainbowed',
          colorScale: function(d) {
            return self.colorScaleRainbow(d.FeatureStart)
          }
        },
        {
          name: 'panChrom_similarCount',
          colorScale: function(d) {
            return self.colorScaleSimilarities(d.SimilarBlocks.split(";").length)
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
      tooltipTxtContent: '',
      tooltipVisibility: 'hidden',
      tooltipMargin: 2,
      tooltipXPos: 0,
      tooltipXOffset: 20,
      tooltipYPos: 0,
      tooltipHeight: 10,
      tooltipWidth: 0,
      tooltipEventIsApplied: true,
    }
  },
  computed: {
    tooltipData() {
      return {
        x: this.tooltipXPos,
        y: this.tooltipYPos,
        height: this.tooltipHeight,
        width: this.tooltipWidth,
        margin: this.tooltipMargin,
        offset: this.tooltipXOffset
      }
    },
  },
  watch: {
    filteredData() {
      this.tooltipEventIsApplied = false
    },
  },
  mounted() {
    //Applying the drag event on the track-overlay rect
    let self = this;
    d3.select(this.$refs['pavConditionalSlider'])
      .call(d3.drag().on("start drag", function() {
        self.updateBlockOffset(d3.event.y)
      }))
      .on("mouseover", function() {self.eventFadeInRef('pavConditionalSlider')})
      .on("mouseout", function() {self.eventFadeOutRef('pavConditionalSlider')});

  },
  updated() {
    if (this.tooltipEventIsApplied === true) {
      return
    }

    //Wait until update is fully finished
    this.$nextTick(function() {

      let self = this;

      //Add the mouseoer events
      self.tracks.forEach( function(track) {
        self.filteredData.forEach( function(block) {
          //console.log(self.$refs[`block${block.index}_${track.name}`]);
          //display tooltip on hovering, based on data
          d3.select(self.$refs[`block${block.index}_${track.name}`][0]).on('mouseover', function() {
            self.eventShowTooltip(`block${block.index}_${track.name}`, block)
          });

          //reset tooltip and block color
          d3.select(self.$refs[`block${block.index}_${track.name}`][0]).on('mouseout', function() {
            self.eventHideTooltip(`block${block.index}_${track.name}`)
          });
        });
      });
    });

    this.tooltipEventIsApplied = true;
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
    FeatureWidth(data) {
      return Number(data.FeatureStop) - Number(data.FeatureStart)
    },
    pptionBasedWidth(data, chromName) {
      let originalSize = this.ntToPx(this.FeatureWidth(data));
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
    selectSvgFromRefs(refName) {
      let ref = this.$refs[refName];
      let svgToSelect;

      if (Array.isArray(ref)) {
        svgToSelect = ref[0]
      } else {
        svgToSelect = ref
      }

      return svgToSelect;
    },
    eventFadeOutRef(refName) {
      let svgToSelect = this.selectSvgFromRefs(refName);

      d3.select(svgToSelect)
        .transition()
        .attr('opacity', 0);
    },
    eventFadeInRef(refName) {
      let svgToSelect = this.selectSvgFromRefs(refName);

      d3.select(svgToSelect)
        .transition()
        .attr('opacity', 1);
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
    computeTooltipText(refName, data) {
      let svgSelected = this.$refs[refName][0];
      let parentNodeId = d3.select(svgSelected.parentNode).attr("id");
      let textToDisplay;

      switch(true) { //Function that will display information depending on the selected row

        case ("panChrom_coreVSdispensable" === parentNodeId):
          textToDisplay = "This block appears in " + data.presenceCounter + " selected genome(s)" //Text content
          break;

        case ("panChrom_rainbowed" === parentNodeId):
          textToDisplay = "This block starts on position " + data.FeatureStart + " and is " + d3.format("~s")(this.FeatureWidth(data)) + "b long" //d3.format is used to have the International System writing, with rounded values
          //ATTENTION for float values such as 1.586 for instance eval() considered the "." to be the announcement of a property (586, property of the object 1), therefore an ID error occured
          break;

        case ("panChrom_similarCount" === parentNodeId):
          textToDisplay = "This block is repeated " + eval((data.SimilarBlocks.split(";").length >= 2) ? data.SimilarBlocks.split(";").length : 0) + " time(s) within the pangenome"
          break;

        case (/^presence_/.test(parentNodeId) ): {
          //Gets the genome name, to retrieve the correct PAV info from *data*
          let genomeName = `${parentNodeId}`.split('presence_')[1];
          textToDisplay = data[genomeName]; //Displays what's in the PAV matrix for the corresponding genome
          break;
        }

        default:
          textToDisplay = 'ERROR Switch case has not been identified';
      }

      this.tooltipTxtContent = textToDisplay;
    },
    computeTooltipDims(textToDisplay, fontFamily='sans-serif', fontSizePx=10) {
      //Function that guesses the width of the tooltip based on how it
      //would look like on the prerendering canvas, and the font size

      let ctx = this.$refs.pavTooltipCanvas.getContext("2d");
      ctx.font = `${fontSizePx}px ${fontFamily}`;

      this.tooltipHeight = fontSizePx+2;
      this.tooltipWidth = ctx.measureText(textToDisplay).width;
    },
    calculateTooltipPos(axis) {
      let mouseCoord, offsetFromMouse, minBorder, maxBorder, belowBorderPos, beyondBorderPos;
      let mousePosRefSystem = this.$refs.PanacheSvgContainer;

      switch (axis) {

        //Working on width
        case 'x':
          mouseCoord = d3.mouse(mousePosRefSystem)[0]; //d3.event.x works only for drag events, not for cursor coordinates*

          offsetFromMouse = 20;
          minBorder = this.tooltipData.margin + offsetFromMouse; //Leaving space for the background rectangle
          maxBorder = this.displayWidth - (this.tooltipData.width + this.tooltipData.margin);

          belowBorderPos = minBorder;
          //Text is now displayed on the left
          //beyondBorderPos IS NOT the maxBorder
          beyondBorderPos = mouseCoord - this.tooltipData.width - offsetFromMouse;
          break;

        //Working on height
        case 'y':
          mouseCoord = d3.mouse(mousePosRefSystem)[1];

          offsetFromMouse = this.tooltipData.height / 2; //For a y-centered text
          //Borders are not the same since pos of a text elt is at its bottom-left
          //y-axis has not the same origin than the svgContainer !
          minBorder = this.tooltipData.margin + this.tooltipData.height;
          maxBorder = this.displayHeight - this.tooltipData.margin;

          belowBorderPos = minBorder;
          beyondBorderPos = maxBorder;
          break;
      }

      //Repositions text element to its right place depending on its size
      let potentialPos = mouseCoord + offsetFromMouse;

      let chosenPos;

      //If mouse too close to min border...
      if (potentialPos < minBorder) {
        chosenPos = belowBorderPos;
      //If mouse too close to max border...
      } else if (potentialPos > maxBorder) {
        chosenPos = beyondBorderPos;
      //If mouse within acceptable range...
      } else { chosenPos = potentialPos }

      return chosenPos;
    },
    eventShowTooltip(refName, data) {
      this.computeTooltipText(refName, data);
      this.computeTooltipDims(this.tooltipTxtContent);

      this.tooltipXPos = this.calculateTooltipPos('x');
      this.tooltipYPos = this.calculateTooltipPos('y');

      this.eventHighlightColor(refName);

      this.tooltipVisibility = 'visible';
    },
    eventHideTooltip(refName) {
      this.tooltipVisibility = 'hidden';
      this.tooltipTxtContent = '';
      this.eventRestoreColor(refName);
    },
  }
}
</script>

<style>
</style>
