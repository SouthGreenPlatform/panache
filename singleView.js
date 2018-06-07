//My false data
var panMatrix = [
	[1,1,0,1,1,0,0,0,1,1,0,1],
	[1,0,1,1,1,0,1,1,1,1,0,1],
	[1,1,0,1,1,0,1,1,1,1,1,1],
	[1,0,0,1,1,1,1,0,1,1,0,1],
	[1,1,1,1,1,0,1,1,1,1,0,1],
	[1,1,0,1,1,0,1,0,1,1,0,0],
	[1,1,0,1,1,0,1,0,1,1,0,1],
	[1,1,1,1,0,0,0,0,1,1,1,0],
	[1,0,1,1,1,0,1,1,1,0,0,1],
	[1,1,0,1,1,0,1,1,1,1,0,1],
];

function transpose(a) {
    return Object.keys(a[0]).map(function(c) {
        return a.map(function(r) { return r[c]; });
    });
}

//JavaScript is not efficient to calculate this, needs for precomputation with Python?, maybe long with big matrices
var panChromosomeBlockCounts = [];

//Calculation of each column sum
for (var j = 0; j < panMatrix[0].length; j++) {
	panChromosomeBlockCounts.push(transpose(panMatrix)[j].reduce(function(acc, val) { return acc + val; }));
};
//console.log(panChromosomeBlockCounts);

//Calculating the threshold for the change in color scale in panChromosome, arbitrary value for now
var coreThreshold = 85/100*panMatrix.length;

//Creating the SVG HTML tag
var svgContainer = d3.select("body").append("svg")
									.attr("width", 1000).attr("height", 500);

//Binding the data to a DOM element, therefore creating one SVG block per data
var blocks = svgContainer.append("g").attr("id","panChromosome") //.append("g") allows grouping svg objects
							.selectAll("rect") //First an empty selection of all not yet existing rectangles
								.data(panChromosomeBlockCounts) //Joining data to the selection, one rectangle for each as there is no key. It returns 3 virtual selections : enter, update, exit. The enter selection contains placeholder for any missing element. The update selection contains existing elements, bound to data. Any remaining elements ends up in the exit selection for removal.
								.enter() //The D3.js Enter Method returns the virtual enter selection from the Data Operator. This method only works on the Data Operator because the Data Operator is the only one that returns three virtual selections. However, it is important to note that this reference only allows chaining of append, insert and select operators to be used on it.
								.append("rect") //For each placeholder element created in the previous step, a rectangle element is inserted.
							
							//For more about joins, see : https://bost.ocks.org/mike/join/

//Color Scale, might be concatenated with another one I believe, I want hue is great, HCL might allow better color handling
//For color, see : https://bl.ocks.org/mbostock/3014589
var blueColorScale = d3.scaleLinear()
		.domain([0,10]) //We declare the min/max values, they will be linked to the min/max colors
		.range(["white",  d3.hcl(246, 45,72)]);

var orangeColorScale = d3.scaleLinear()
		.domain([0,10]) //We declare the min/max values, they will be linked to the min/max colors
		.range(["white",  d3.hcl(60, 60,72)]);
							
//Selecting all previous blocks, and determining their attributes
var blocksAttributes = blocks.attr("x",svgContainer.attr("width")*0.55)
							.attr("width", 25)
							.attr("height",svgContainer.attr("height")/panMatrix[0].length)
							.attr("y", function(i,j){return j*blocks.attr("height");}) //y position is index * block height
							.style("fill", function (d) {if (d >= coreThreshold) {
								return blueColorScale(d);
								};
								return orangeColorScale(d);
							});

//Creating a flatten matrix, the indexes will be used for the positionning of Presence Absence (PA) blocks
var flatten = panMatrix.reduce(function(a, b) {
    return a.concat(b);
});
//console.log(flatten)

//Creation of the subgroup for the StructureLinks background
var structureBackground = svgContainer.append("g").attr("id","structureLinksBackground")
											.selectAll("rect")
												.data(panChromosomeBlockCounts)
												.enter()
												.append("rect");

//Attributes for structureLinksBackground
var structureBackground_Attributes = structureBackground.attr("x",0)
														.attr("y",function(i,j){return j*blocks.attr("height");})
														.attr("width",Number(blocks.attr("x"))-Number(structureBackground.attr("x")))
														.attr("height",blocks.attr("height"))
														.style("fill", blocks.attr("fill"));

//Creation of the subGroup for the PA blocks
var matrixPA = svgContainer.append("g").attr("id","presenceAbsence")
											.selectAll("rect")
												.data(flatten) //There is one rect per genome x PA block, not just per genome
												.enter()
												.append("rect");


//ATTENTION .attr()+.attr() concatenates and does NOT an addition !!
var matrixPA_Attributes = matrixPA.attr("x", function (i,j) {
		return Number(blocks.attr("x")) + Number(blocks.attr("width")) + 3 + Math.floor(j / panChromosomeBlockCounts.length) * blocks.attr("width"); //x is incremented for each new genome
	})
									.attr("width", blocks.attr("width"))
									.attr("height",blocks.attr("height"))
									.attr("y", function(i,j){return j%panChromosomeBlockCounts.length*blocks.attr("height");}) //y is incremented for each new PA block, and is reset to 0 for each genome
									.style("fill", function (d) {return orangeColorScale (d);});