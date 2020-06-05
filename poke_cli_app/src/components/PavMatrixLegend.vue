<template>
  <svg id="svgContainer_pavLegends" class="svgContainer" :height="height" :width="width" style="position: absolute">
    <g id="legend_matrixPA_title">
      <text font-family="sans-serif" font-size="10px" y="1em" :x="width/2" text-anchor="middle">One column represents one panBlock</text>
    </g>
    <g id="legend_matrixPA_blocks">
      <g id="legend_matrixSchema">
        <g>
          <text v-for="gName in genomeLabels" :key="gName.text" x='45' :y="gName.yPos" font-family='sans-serif' font-size='10px' dominant-baseline='middle'>{{gName.text}}</text>
        </g>
        <g transform="translate(10,0)">
          <path v-for="column in pavPaths" :key="column.index" :d="column.directions" :fill="column.colour" />
        </g>
      </g>
      <g id="legend_matrixMeanings" transform="translate(130,0)">
        <text v-for="label in meaningLabels" :key="label.text.split(' ')[0]" x=41 :y="label.yPos" font-family='sans-serif' font-size='10px' dominant-baseline='middle' text-anchor='middle'>{{label.text}}</text>
      </g>
    </g>
  </svg>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'PavMatrixLegend',
  props: {
    width: {
      type: Number,
      default: 300
    },
    height: {
      type: Number,
      default: 100
    }
  },
  data() {
    return {
      genomeLabels: [
        {
          yPos: 7,
          text: 'A'
        },
        {
          yPos: 21,
          text: 'B'
        },
        {
          yPos: 35,
          text: 'C'
        }
      ],
      meaningLabels: [
        {
          yPos: 7,
          text: 'Filled : Presence'
        },
        {
          yPos: 22,
          text: 'Empty : Absence'
        },
        {
          yPos: 37,
          text: 'Colour => Function'
        }
      ],
      pavPaths: [
        {
          index:0,
          directions: 'M 45 0 H 57 V 14 H 45 Z M 45 14 H 57 V 28 H 45 Z M 45 28 H 57 V 42 H 45 Z',
          colour: 'rgb(131, 245, 87)'
        },
        {
          index:1,
          directions: 'M 57 28 H 69 V 42 H 57 Z',
          colour: 'rgb(80, 105, 217)'
        },
        {
          index:2,
          directions: 'M 69 14 H 81 V 28 H 69 Z M 69 28 H 81 V 42 H 69 Z',
          colour: 'rgb(184, 60, 176)'
        },
        {
          index:3,
          directions: 'M 81 0 H 93 V 14 H 81 Z M 81 14 H 93 V 28 H 81 Z',
          colour: 'rgb(56, 241, 122)'
        },
        {
          index:4,
          directions: 'M 93 28 H 105 V 42 H 93 Z',
          colour: 'rgb(110, 64, 170)'
        }
      ]
    }
  },
  mounted() {
    let matrixMeanings = d3.select("#legend_matrixMeanings")
    let meaningsBbox = matrixMeanings.node().getBBox();

    matrixMeanings.selectAll('text').attr('x', meaningsBbox.width/2)

    let blocksBbox = d3.select("#legend_matrixPA_blocks").node().getBBox();
    let xBlocks = 0.5*(this.width - blocksBbox.width) - blocksBbox.x;

    d3.select("#legend_matrixPA_blocks").attr('transform', `translate(${xBlocks},30)`);

  }
}
</script>

<style >
</style>
