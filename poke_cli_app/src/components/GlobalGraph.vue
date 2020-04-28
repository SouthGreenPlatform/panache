<template>
    <div class="barChart"></div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: 'GlobalGraph',
  props: ['tweetData'],
  data() {
      return {  
        width: 500,
        hieght: 500,
        json: "./users.json",
        jsonData: []
      };
  },
  mounted() {
      this.testJson();
  },
  methods: {
      // extract data from the json in order to have an array to manipulate
      // we have to await in async to have the json well loaded before extracting data from it
      async testJson() {
          this.jsonData = await d3.json(this.json);
          this.getData();
      },

      getData: function() {
        var margin = { top: 20, right: 20, bottom: 50, left: 70 },
            width = 500 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        var x = d3
            .scaleBand()
            .range([0, width])
            .padding(0.1);

        var y = d3.scaleLinear().range([height, 0]);

        // Append the svg object to the div with class barChart in order to display the bar chart in our component, not outside
        var svg = d3
            .select(".barChart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // format the data
        this.jsonData.forEach(function(d) {
            d.tweets = +d.tweets;
        });

        x.domain(
            this.jsonData.map(function(d) {
                return d.user;
            })
        );

        y.domain([
            0,
            d3.max(this.jsonData, function(d) {
                return d.tweets;
            })
        ]);

        // append the rectangle for the bar chart
        svg.selectAll(".bar")
            .data(this.jsonData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", function(d) {
                return x(d.user);
            })
            .attr("width", x.bandwidth())
            .attr("y", function(d) {
                return y(d.tweets);
            })
            .attr("height", function(d) {
                return height - y(d.tweets);
            })
            .on("click", this.onBarClick);

        // add the x axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // add the title for the x axis
        svg.append("text")
            .attr("transform", "translate(" + (width/2) + ", " + (height + margin.top + 20) + ")")
            .style("text-anchor", "middle")
            .text("User");

        // add the y axis
        svg.append("g").call(d3.axisLeft(y));

        // add the title for the y axis
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1rem")
            .style("text-anchor", "middle")
            .text("Tweets");
    },

    onBarClick: function(data) {
        console.log(data.user);
        this.$emit('clicked', data.user);
    },
  },  

  computed: {
      
  }
};
</script>

<style lang="scss">
    .bar{
        fill: steelblue;
    }
</style>