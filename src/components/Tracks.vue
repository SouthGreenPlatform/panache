<template>
<!-- Tot height will be determined by parent's componenent limitations-->
<div :style="tracksWrapperStyle">
  <!-- TRACKS & TOOLTIPS FOR PAV STATUS, POSITION, SIMILARITY INFO-->
  <div id="mainTracks">
    <svg ref='PanacheSvgContainer' :height="mainTracksTotHeight" :width="displayWidth">

      <!-- DEFS FOR THE WHITE TO TRANSPARENT LEGEND BACKGROUNDS -->
      <defs>
        <linearGradient v-for="gradient in bgGradients"
          :key="gradient.side"
          :id="`repeatsBgLabelGradient_${gradient.side}`"
          :x1="gradient.x1"
          :x2="gradient.x2"
          y1="0"
          y2="0"
          >
          <stop v-for="stop in stops"
            :key="`offset_${stop.offset}`"
            :offset="stop.offset"
            :stop-color="stop.color"
            :stop-opacity="stop.opacity"
            />
        </linearGradient>
      </defs>

      <!-- TRACKS OF INFORMATION -->
      <g ref='informationTracks'>
        <g v-for="(track, index) in tracks" :key="track.name" :id="track.name" :transform="writeTranslate(0, index * (blocksDimensions.height+3))">
          <rect v-for="(block, idxInArray) in filteredData"
            :key="`idxForTracks_${idxInArray}`"
            :ref="`block${idxInArray}_${track.name}`"
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

      <!-- TOOLTIP -->
      <!-- TODO: Rework tooltip so that it is not an svg anymore -->
      <g :visibility="tooltipVisibility" id="hoverTooltip">
        <rect :x="tooltipData.x - tooltipData.margin"
          :y="tooltipData.y - tooltipData.margin"
          :height="tooltipData.height + 2 * tooltipData.margin"
          :width="tooltipData.width + 2 * tooltipData.margin"
          :fill="hclToRgb(83, 4, 96)"
          fill-opacity='0.9'
          :stroke="hclToRgb(86, 5, 80)"
          stroke-opacity='0.9'
        />
        <text ref='tooltipForTracksAndPavMatrix'
          :x="tooltipData.x"
          :y="tooltipData.y"
          dominant-baseline='hanging'
          font-family='sans-serif'
          :font-size="tooltipFontSize"
          text-anchor='start'>
          {{tooltipTxtContent}}
        </text>
      </g>

    </svg>
  </div>

  <!-- SIMILARITY BOTTOM SPACE -->
  <div id='distributionInChroms'>
    <svg id='distributionInChroms_svg' :width="displayWidth">

      <!-- LINES AND BLOCKS FOR SIMILARITIES-->
      <g id='blocksStructuralVariation'>
          <g v-for="(chromName, index) in chromList"
            :key="`chrom_${chromName}`"
            :id="`duplicationBoxes_${chromName}`"
            :transform="writeTranslate(0, index * blocksDimensions.height)">
            <line class='bgLine' x1='0' :x2='displayWidth' :y1="0.5*blocksDimensions.height" :y2="0.5*blocksDimensions.height" stroke='#eeeeee' stroke-width='6px'/>
            <!-- similarity boxes are translated in order to be centered-->
            <rect v-for="(block, idxInArray) in filteredData"
              :key="`idxForStruct_${idxInArray}`"
              class='movableBoxes'
              :x="ntToPx(block.index)"
              y='0'
              :transform="writeTranslateWithOffSet( 0.5* (ntToPx(FeatureWidth(block)) - pptionBasedWidth(block, chromName) ), 0)"
              :width="pptionBasedWidth(block, chromName)"
              :height="blocksDimensions.height"
              :fill="similarityFill(block, chromName)"
              :stroke="similarityStroke(block)"
              :stroke-opacity="`${(block[`copyPptionInChr_${chromName}`] > 0 ? 0.8 : 0)}`"
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
          <rect
            :x="panel.x"
            y='0'
            :height="chromList.length * blocksDimensions.height"
            :width="chromLegendPanelWidth"
            :fill="`url(#repeatsBgLabelGradient_${panel.side})`"
          />
          <text v-for="(chromName, index) in chromList"
            :key="`duplicationBoxes_${chromName}`"
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

      <!-- TODO: ADD VERTICAL SLIDER TO GO THROUGH CHROMOSOMES-->

    </svg>
  </div>

  <!-- CANVAS FOR PRE-CALCULATION OF TOOLTIP SIZE, HIDDEN -->
  <canvas v-show='false' id='tooltipPreRenderingCanvas' ref='pavTooltipCanvas' height='50' :width="displayWidth"/>
</div>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'Tracks.vue',
  props: {
    filteredData: {
      type: Array,
      default : () => []
    },
    displayWidth: {
      type: Number,
      default : 1100
    },
    chromList: {
      type: Array,
      //Default must not be empty, so that length > 0 !
      default: () => ['chrom0', 'chrom1', 'chrom2', 'chrom3']
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
    //TODO: Remove self using arrow function instead
    let self = this;

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
      color.l = 100-(d[`copyPptionInChr_${chromName}`]*100*0.75);
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
    let chromLegendPanelWidth = longestSizeOfChromName * 10;

    return {
      blockOffset: 0,
      tooltipFontSize: 14,
      //Colors for white gradient used on labels
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
      //Directions for white gradients used on labels
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
      //Name and color scales to use on main tracks
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
      //Properties of rects used as backgrounds for similarity info
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
          xPos: chromLegendPanelWidth,
          translation: this.writeTranslate(this.displayWidth - chromLegendPanelWidth, 0)
        }
      ],
      similarityFill: simFill,
      similarityStroke: simStroke,
      blockOriginColor: d3.hcl(10,50,80),
      chromLegendPanelWidth: chromLegendPanelWidth,
      tooltipTxtContent: '',
      tooltipVisibility: 'hidden',
      tooltipMargin: 10,
      tooltipXPos: 0,
      tooltipXOffset: 20,
      tooltipYPos: 0,
      tooltipHeight: 10,
      tooltipWidth: 0,
      tooltipEventIsApplied: true,
    }
  },
  computed: {
    mainTracksTotHeight() {
      return 3 * (this.blocksDimensions.height + 3)
    },
    allChromsTotHeight() {
      return this.chromList.length * this.blocksDimensions.height
    },
    tracksWrapperStyle() {
      return {
        display: 'grid',
        'grid-template-rows': `auto minmax(1fr, ${this.allChromsTotHeight})`,
        row-gap: '3px',
      }
    },
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
        console.log({yPosOfMouse: d3.event.y});
        self.updateBlockOffset(d3.event.y);
      }))
      .on("mouseover", function() {self.eventFadeInRef('pavConditionalSlider')})
      .on("mouseout", function() {self.eventFadeOutRef('pavConditionalSlider')});

  },
  updated() {
    //Add tooltip event to all drawn blocks only when new data are to be visualized
    if (this.tooltipEventIsApplied === true) {
      return
    }

    //Wait until update is fully finished
    this.$nextTick(function() {
      //TODO: Replace self using arrow functions
      let self = this;

      //Add the mouseoer events
      self.tracks.forEach( function(track) {
        self.filteredData.forEach( function(block, idxInArray) {
          //console.log(self.$refs[`block${idxInArray}_${track.name}`]);
          //display tooltip on hovering, based on data
          d3.select(self.$refs[`block${idxInArray}_${track.name}`][0]).on('mouseover', function() {
            self.eventShowTooltip(`block${idxInArray}_${track.name}`, block)
          });

          //reset tooltip and block color
          d3.select(self.$refs[`block${idxInArray}_${track.name}`][0]).on('mouseout', function() {
            self.eventHideTooltip(`block${idxInArray}_${track.name}`)
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
    FeatureWidth(data) {
      return Number(data.FeatureStop) - Number(data.FeatureStart)
    },
    pptionBasedWidth(data, chromName) {
      let originalSize = this.ntToPx(this.FeatureWidth(data));
      let pptionalSize = (originalSize -2) * data[`copyPptionInChr_${chromName}`];

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
    computeTooltipDims(textToDisplay, fontFamily='sans-serif') {
      //Function that guesses the width of the tooltip based on how it
      //would look like on the prerendering canvas, and the font size

      let ctx = this.$refs.pavTooltipCanvas.getContext("2d");
      ctx.font = `${this.tooltipFontSize}px ${fontFamily}`;

      this.tooltipHeight = this.tooltipFontSize;
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
          maxBorder = this.mainTracksTotHeight - this.tooltipData.margin;

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

#mainTracks {
  grid-column: 1;
  grid-row: 1;
}

#distributionInChroms {
  grid-column: 1;
  grid-row: 2;
}

#distributionInChroms_svg {
  height: 100%;
}

</style>
