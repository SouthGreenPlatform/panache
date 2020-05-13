<template>
  <div :id='"chart"' :ref='"chart"'></div>
</template>

<script>
//import * as d3 from "d3";
import Circos from "circos";

export default {
  name: 'PanCircos',
  props: {
    layoutData: {
      type: Array,
      default: () => []
    },
    chordsData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      circosContHeight: 600,
      circosContWidth: 600,
      myCircos: '',
      layoutConfig: {
        innerRadius: 220, //size in px
        outerRadius: 240, //size in px
        cornerRadius: 0, //how rounded should the nodes be
        gap: 0.04, // in radian
        labels: {
          display: true,
          position: 'center',
          size: '20px',
          color: '#000000',
          radialOffset: 4,
        },
        ticks: {
          display: true,
          color: 'grey',
          spacing: 10000000,
          labels: true,
          labelSpacing: 10,
          labelSuffix: 'Mb',
          labelDenominator: 1000000,
          labelDisplay0: true,
          labelSize: '10px',
          labelColor: '#000000',
          labelFont: 'default',
          majorSpacing: 5,
          size: {
            minor: 2,
            major: 5,
          }
        },
        events: {}
      }
    }
  },
  watch: {
    layoutData: function() {
      console.log('Layout Data has changed');
      this.makeLayout();
      this.myCircos.render();
    },
    chordsData: function() {
      this.makeChord();
      this.myCircos.render();
    }
  },
  mounted() {
    this.createCircos(this.$refs.chart, this.circosContWidth, this.circosContHeight)
  },
  computed: {
  },
  methods: {
    createCircos(contID, width, height) {
      this.myCircos = Circos({
        container: contID,
        width: width,
        height: height,
      })
      console.log('Circos created')
    },
    makeLayout() {
      if (this.layoutData === []) {return}
      this.myCircos.layout(this.layoutData, this.layoutConfig);
    },
    makeChord() {
      if (this.chordData === []) {return}
      this.myCircos.chords('repetead-blocks', this.chordsData);
    }

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  text {
    font-size: 10px
  }
</style>
