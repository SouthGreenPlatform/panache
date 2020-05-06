<template>
    <div>
        <svg :height='height' :width='width'>
            <!-- DATA POINTS -->
            <!--g transform="translate(50,50)" class="data"-->
            <g class="data">
                <circle
                    v-for="genome in pcaCoordinates"
                    :key="genome.key"
                    :ref="`${genome.key}_Point`"
                    :r="radius(genome.key)"
                    :cx="newCoordX(genome.V1)"
                    :cy="newCoordY(genome.V2)"
                    :fill="circleColor(genome.key)"
                    :stroke="stroke(genome.key)"
                    @mouseover="condShowName(genome.key)"
                    @mouseout="condHideName(genome.key)"
                >
                </circle>
                <text
                  v-for="genome in pcaCoordinates"
                  :key="`${genome.key}_Name`"
                  :ref="`${genome.key}_Name`"
                  :x="newCoordX(genome.V1)-10"
                  :y="newCoordY(genome.V2)-10"
                  :display="'none'"
                  >
                  {{genome.key}}
                </text>
                <text
                  v-for="genome in extractRef(pcaCoordinates, refGenomes)"
                  :key="`${genome.key}_NameRef`"
                  :x="newCoordX(genome.V1)-10"
                  :y="newCoordY(genome.V2)-10"
                  >
                  {{genome.key}}
                </text>
            </g>
            <!-- AXES -->
            <g ref='xAxis' :transform='`translate(0, ${height - pad})`' />
            <text :x="width-20" :y="height-10" >V1</text>
            <g ref='yAxis' :transform='`translate(${pad}, 0)`' />
            <text :x="0" :y="15" >V2</text>
        </svg>
    </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: 'GenomeACP',
  props: {
    pcaCoordinates: {
      type: Array,
      default: () => []
    }
  },
  data() {
      return {
          height: 600,
          width: 600,
          pad: 40,
          radius: function(key) {
            return (this.refGenomes.includes(key) ? 5 : 4)
          },
          colorScale: function() {
            return d3.scaleOrdinal()
              .domain(this.cropGroups)
              .range(this.colForCropGroups)
              .unknown('grey')
            },
          circleColor: function(key) {
            return (this.refGenomes.includes(key) ? "red" : "grey")
          },
          stroke: function(key) {
            return (this.refGenomes.includes(key) ? "black" : "none")
          },
          extremeX: [],
          extremeY: [],
          refGenomes: ["W22", "CI6621", "XPFF003", "B6Y7Y391", "B7T1C128", "AX5707", "B104"],
          cropGroups: ['Amarillo Dentado',
                      'Argentinian Flint',
                      'Argentinian Lancaster',
                      'Early IX/XI',
                      'European Northern Flint',
                      'Iodent',
                      'Lancaster',
                      'MRI',
                      'OH7_PHR03',
                      'Stiff Stalk Synth',
                      'Suwan',
                      'TS_Chang7-2',
                      'external'],
          colForCropGroups: ["#f2f80c",
                            "#2f1b00",
                            "#5a00a6",
                            "#009a23",
                            "#0177f4",
                            "#d0001e",
                            "#005181",
                            "#eff4ac",
                            "#bb0056",
                            "#004c18",
                            "#ff65b9",
                            "#6f0100",
                            "#e0a8ff"]
      };
  },
  watch: {
    pcaCoordinates: function() {
      this.setMinMaxX();
      this.setMinMaxY();
      this.updateScaleX();
      this.updateScaleY();
      this.renderAxes();
    }
  },
  mounted() {
    this.renderLegend(this.cropGroups)
  },
  computed: {
  },
  methods: {
    getMinMax(axis, coordDF=this.pcaCoordinates) {
        let minMax = [];
        coordDF.reduce(function(acc, val) {
            acc[0] = ( ( acc[0] === undefined || val[`V${axis}`] < acc[0] ) ? val[`V${axis}`] : acc[0] )
            acc[1] = ( ( acc[1] === undefined || val[`V${axis}`] > acc[1] ) ? val[`V${axis}`] : acc[1] )
            return acc;
        }, minMax);
        return minMax;
    },
    setMinMaxX() {
      console.log('MinMaxX updated')
      this.extremeX = this.getMinMax(1)
    },
    setMinMaxY() {
      this.extremeY = this.getMinMax(2)
    },
    updateScaleX() {
      this.scaleX = d3.scaleLinear()
                        .domain(this.extremeX)
                        .range([0 + 1.5*this.pad, this.width - 0.5*this.pad])
    },
    updateScaleY() {
      this.scaleY = d3.scaleLinear()
                        .domain(this.extremeY)
                        //Invertes range as D3 y scale is upside down
                        .range([this.height - 1.5*this.pad, 0 + 0.5*this.pad])
    },
    newCoordX(oldCoord) {
      return this.scaleX(oldCoord)
    },
    newCoordY(oldCoord) {
      return this.scaleY(oldCoord)
    },
    extractRef(d=[], refIds=[]) {
      if (!d[0]) return;

      let filteredList = [];
      for (let i=0; i<d.length; ++i) {
        if (refIds.includes(d[i].key)) {
          filteredList.push(d[i])
        }
      }
      return filteredList;
    },
    renderAxes() { //Stolen from https://github.com/sxywu/vue-d3-example/blob/master/src/components/AreaChart.vue
      if (!this.scaleX) return

      let xAxisTicks = d3.axisBottom().scale(this.scaleX).tickFormat(this.format)
      let yAxisTicks = d3.axisLeft().scale(this.scaleY)

      //About $refs, check: https://vuejs.org/v2/guide/components-edge-cases.html#Accessing-Child-Component-Instances-amp-Child-Elements
      d3.select(this.$refs.xAxis).call(xAxisTicks)
      d3.select(this.$refs.yAxis).call(yAxisTicks)
    },
    renderLegend(legendList) {
      let legendColor = this.colForCropGroups;
      let legendGroup = d3.select('svg').append('g').attr('id', 'legends');
      let leftSpace = 25;
      let rightSpace = 5;
      let interLineSpace = 20;
      let legendRadius = this.radius('notARef');

      let lastRight = 0;
      let yPos = 0;

      for (let i=0; i<legendList.length; ++i) {
        let currentGroup = legendGroup.append('g');
        let newX = lastRight + leftSpace;

        let newCircle = currentGroup.append('circle')
          .attr('cx', newX)
          .attr('cy', yPos)
          .attr('r', legendRadius)
          //.attr('fill', 'cyan');
          .attr('fill', legendColor[i]);
          console.log(legendList[i])
          console.log(this.cropGroups)
          console.log(this.colorScale)

        let newText = currentGroup.append('text')
          .text(legendList[i])
          .attr('x', newX + rightSpace + legendRadius)
          .attr('y', yPos)
          .style('dominant-baseline', 'central')
          .on('click', function (d, i) {
            console.log(legendList[i]);
            console.log(d);
          });

        let currentBBox = currentGroup.node().getBBox();

        if (newX + currentBBox.width > this.width - leftSpace) {
          yPos += interLineSpace;

          newCircle.attr('cx', leftSpace)
            .attr('cy', yPos);
          newText.attr('x', leftSpace + rightSpace + legendRadius)
            .attr('y', yPos);

          currentBBox = currentGroup.node().getBBox();
        }
        lastRight = currentBBox.x + currentBBox.width;
      }

      let legendBBox = legendGroup.node().getBBox();
      d3.select('svg').attr('height', this.height + legendBBox.height)

      legendGroup.attr('transform',`translate(0, ${this.height} )`);


      /// + put event on every group, to highlight all corresponding circles
    },
    showName(key) {
      let refToCatch = `${key}_Name`;
      this.$refs[refToCatch][0].setAttribute('display', 'inline');
    },
    hideName(key) {
      let refToCatch = `${key}_Name`;
      this.$refs[refToCatch][0].setAttribute('display', 'none');
    },
    condShowName(key) {
      if (!this.refGenomes.includes(key)) {
        this.showName(key)
      }
    },
    condHideName(key) {
      if (!this.refGenomes.includes(key)) {
        this.hideName(key)
      }
    },
    highlightLgend() {
       
    }
  }
}
</script>

<style>

</style>