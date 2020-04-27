<template>
    <div>
        <svg :height='height' :width='width'>
            <g transform="translate(50,50)" class="data">
                <circle 
                    v-for="c in output"
                    :key="c.id"
                    :r="c.r"
                    :cx='c.x'
                    :cy="c.y"
                    :fill="c.fill"
                    :stroke="c.stroke"
                    @click="openLocal"
                >
                </circle>
            </g>
        </svg>
    </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: 'GlobalGraph',
  props: ['tweetData'],
  data() {
      return {
          height: 600,
          width: 600
      };
  },
  created() {
      this.colourScale = d3
        .scaleOrdinal()
        .range(["#5EAFC6", "#FE9922", "#93c464", "#75739F"]);
  },
  methods: {
    packChart() {
        const packChart = d3.pack();
        packChart.size([500, 500]);
        packChart.padding(10);
        const output = packChart(this.packData).descendants();
        return output.map((d, i) => {
            const fill = this.colourScale(d.depth);
            return {
                id: i + 1,
                r: d.r,
                x: d.x,
                y: d.y,
                fill,
                stroke: "grey"
            };
        });
    },
    openLocal(event) {
        console.log(event);
    }
  },
  computed: {
      packData() {
        const nestedTweets = d3
            .nest()
            .key(d => d.user)
            .entries(this.tweetData);

        const packableTweets = { id: "All Tweets", values: nestedTweets };
        /*console.log(d3
            .hierarchy(packableTweets, d => d.values)
            .sum( d =>
                d.retweets ? d.retweets.length + d.favorites.length + 1 : 1
            ));*/
        var el = d3.select('.data')
            .selectAll('circle')
            .data(this.tweetData);
        console.log(el);
        return d3
            .hierarchy(packableTweets, d => d.values)
            .sum( d =>
                d.retweets ? d.retweets.length + d.favorites.length + 1 : 1
            );
      },

      output() {
        return this.packChart();
      }
  }
}
</script>

<style scoped>

</style>
