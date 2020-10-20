<template>
  <div class='pavLegendWrapper'>
    <div class='titleLegend'>One column represents one panBlock</div>
    <svg id="svgContainer_pavLegends" class="pavSchema" height=42 width=80>
      <g>
        <text v-for="gName in genomeLabels"
          :key="gName.text"
          x='0'
          :y="gName.yPos"
          font-family='sans-serif'
          font-size='10px'
          dominant-baseline='middle'>
            {{gName.text}}
        </text>
      </g>
      <g transform="translate(10,0)">
        <path v-for="column in pavPaths"
          :key="column.index"
          :d="column.directions"
          :fill="column.colour"
          :transform="writeTranslate(column.index * 14, 0)"
        />
      </g>
    </svg>
    <div v-for="label in meaningLabels"
      :key="label.text.split(' ')[0]"
      :class="label.class"
      font-family='sans-serif'
      font-size='10px'>
        {{label.text}}
      </div>
  </div>
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
          class: 'filledMeaning',
          text: 'Filled : Presence'
        },
        {
          class: 'emptyMeaning',
          text: 'Empty : Absence'
        },
        {
          class: 'colorMeaning',
          text: 'Color => Function'
        }
      ],
      pavPaths: [
        {
          index:0,
          directions: 'M 0 0 H 14 V 14 H 0 Z M 0 14 H 14 V 28 H 0 Z M 0 28 H 14 V 42 H 0 Z',
          colour: 'rgb(131, 245, 87)'
        },
        {
          index:1,
          directions: 'M 0 28 H 14 V 42 H 0 Z',
          colour: 'rgb(80, 105, 217)'
        },
        {
          index:2,
          directions: 'M 0 14 H 14 V 28 H 0 Z M 0 28 H 14 V 42 H 0 Z',
          colour: 'rgb(184, 60, 176)'
        },
        {
          index:3,
          directions: 'M 0 0 H 14 V 14 H 0 Z M 0 14 H 14 V 28 H 0 Z',
          colour: 'rgb(56, 241, 122)'
        },
        {
          index:4,
          directions: 'M 0 28 H 14 V 42 H 0 Z',
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
  },
  methods: {
    writeTranslate(x=0,y=0) {
      return `translate(${x},${y})`
    },
  }
}
</script>

<style scoped>

.pavLegendWrapper {
  display: grid;
  grid-template-rows: 2fr 1fr 1fr 1fr;
  grid-template-columns: auto auto;
  text-align: center;
  font-family: sans-serif;
  font-size: 10px;
  padding: 0;
}

.titleLegend {
  grid-row: 1;
  grid-column: 1 / 3;
  align-self: center;
  text-align: center;
}

.pavSchema {
  grid-row: 2 / 5;
  grid-column: 1;
  align-self: center;
  text-align: center;
  justify-self: center;
}

.filledMeaning {
  grid-row: 2;
  grid-column: 2;
  align-self: center;
  text-align: center;
}

.emptyMeaning {
  grid-row: 3;
  grid-column: 2;
  align-self: center;
  text-align: center;
}

.colorMeaning {
  grid-row: 4;
  grid-column: 2;
  align-self: center;
  text-align: center;
}

</style>
