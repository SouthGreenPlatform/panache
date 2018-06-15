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

//Function created for the transposition of the matrix, is usefull with .reduce
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

//Creating the SVG HTML tag
var svgContainer = d3.select("body").append("svg")
									.attr("width", 1000).attr("height", 500);

//Calculating the threshold for the change in color scale in panChromosome, arbitrary value for now
var coreThreshold = 85/100*panMatrix.length;

//					I want to create a drag slider to interactively change this threshold! see https://bl.ocks.org/mbostock/6452972
/////////////////////////////////////////////////////////////////////////////////////////////////////////

//1st create a scale (linear in our case)
//and 
var sliderScale = d3.scaleLinear() //Attaches to each threshold value a position on the slider
		.domain([0, 1]) //Takes the possible treshold values as an input
		.range([0, 100]) //Ranges from and to the slider's extreme length values as an output
		.clamp(true); //.clamp(true) tells that the domains has 'closed' boundaries, that won't be exceeded

var slider = svgContainer.append("g") //slider is a subgroup of svgContainer
				.attr("class", "slider") //With the class "slider", to access it easily (more general than id which must be unique)
				.attr("transform", "translate(" + 850 + "," + svgContainer.attr("height") / 2 + ")"); //Everything in it will be translated

slider.append("line") //Addition of a svg line within the slider group, only used for "contouring" here
		.attr("class", "track")
		.attr("x1", sliderScale.range()[0]) //Calling the first boundary of sliderScale.range (ie left position)
		.attr("x2", sliderScale.range()[1]) //Calling the second boundary of sliderScale.range (ie right position)
		.attr("stroke-linecap","round") //Tells the line to have roundish tips
		.attr("stroke", "red")
		.attr("stroke-opacity", 0.3)
		.attr("stroke-width", "10px")
	.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); }) //Duplicates the "line" object in the DOM and selects the new one
		//parentNode corresponds to the closest DOM ancestor, here it is slider, which contains line
		//We cannot use cloneNode alone as it is part of the select method in here
/*		
		CETTE FONCTION EST COMPLIQUEE
		La méthode Node.appendChild() ajoute un nœud à la fin de la liste des enfants d'un nœud parent spécifié. Si l'enfant donné est une référence à un nœud existant dans le document, appendChild() le déplace  de sa position actuelle vers une nouvelle position (il n'est pas nécessaire de supprimer le noeud sur son noeud parent avant de l'ajouter à un autre).

		Cela signifie qu'un noeud ne peut pas être à deux points du document simultanément. Donc, si le nœud a déjà un parent, le nœud est d'abord retiré, puis ajouté à la nouvelle position. Le Node.cloneNode() peut être utilisé pour réaliser une copie de noeud avant de l'ajouter à son nouveau parent. Notez que les copies faites avec cloneNode ne seront pas automatiquement synchronisées.
*/

		.attr("class", "track-inset") //An inner part for the slider, overlaid over the previous one and slightly thinner to add a contour effect.
		//The newly created clone is getting the "track-inset" class, for styling with json. ATTENTION It calls the style option from the Json file I did not put in here so I added them as attributes
		.attr("stroke", "blue") //Could be cool to color it depending on the color Scales !
		.attr("stroke-width", "8px")
		.attr("stroke-opacity", 1)
	.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); }) //Cloning again
		.attr("class", "track-overlay")//This clone is getting the class "track-overlay" instead of "track-inset"
		//This will be the interactivity zone, not displayed but accessible (see how the mouse pointer changes)
//		.attr("pointer-event", "stroke") //Indicates that the event should only work when the pointer is on the stroke : https://developer.mozilla.org/fr/docs/Web/CSS/pointer-events ; might work as well without it. Can also be "auto" (for all of the surface), "none" (does not apply any mouse change), or "fill" (applies on everything but the stroke) or other
		.attr("stroke-width", "30px") //The interactivity zone is larger than the displayed lines for easier use
		.attr("stroke", "transparent") //That zone is made invisible, but is still displayed over its parents lines/slider bars
		.attr("cursor", "crosshair") //The pointer changes for a cross whenever it reaches that zone
				.call(d3.drag()	//.drag creates a new drag behavior. The returned behavior, drag, is both an object and a function, and is typically applied to selected elements via selection.call. That is our case here, where drag is called on "track-overlay"
				//For more info on call and this : https://www.w3schools.com/js/js_function_call.asp ; .call is basically a reuse method on a different object, "With call(), an object can use a method belonging to another object."
				//It is written : selection.function.call(whatItIsBeingCalledOn, arguments...)
//					.on("start.interrupt", function() { slider.interrupt(); }) //interrupt seems to be an event related to the transition the original code had (the slider's handle was moving at the very beginning), see : https://github.com/d3/d3-transition/blob/master/README.md#selection_interrupt . IT IS NOT USEFUL HERE AS I DID NOT USE THE TRANSITION
					.on("start drag", function() { dynamicColorChange(sliderScale.invert(d3.event.x)); })); //"start" is the d3.drag event for mousedown AND if it is not just a click : https://github.com/d3/d3-drag . We surely need to call d3.drag() to use this. For more about .on : https://github.com/d3/d3-selection/blob/master/README.md#selection_on
					//invert uses the same scale, but goes from range to domain, can be useful for returning data from mouse position : The container of a drag gesture determines the coordinate system of subsequent drag events, affecting event.x and event.y. The element returned by the container accessor is subsequently passed to d3.mouse or d3.touch, as appropriate, to determine the local coordinates of the pointer.

slider.insert("g", ".track-overlay") //Insertion of a subgroup before "track-overlay"
		.attr("class", "ticks") //Giving the class "ticks", for styling reasons
		.attr("font-family","sans-serif")
		.attr("font-size","10px")
		.attr("transform", "translate(0," + 18 + ")") //One more translation in order to have it right under the rest of the slider
	.selectAll("text") //We are going to link data to all text within this group
//	.data(sliderScale.ticks(5)) //Data are five tick labels based on the scale domain. See https://github.com/d3/d3-scale/blob/master/README.md#continuous_ticks for more on ticks, as it is only a suggestion and not the actual numer of displayed ticks
	.data([0, 0.25, 0.5 , 0.75, 1]) //I used my own chosen ticks as .ticks(5) wont displays it as I wish
	.enter().append("text")
			.attr("x", sliderScale) //For each tick, it's x position is calculated thanks to sliderScale(d)
			.attr("text-anchor", "middle") //Each tick is centered on its x position
			.text(function(d) { return d*100 + "%"; });



var handle = slider.insert("circle", ".track-overlay") //Tells to insert a circle element before (so that it will appear behind it) the first "track-overlay" element it finds within slider
		.attr("class", "handle") //It is given the class "handle" (useful for easier styling)
		.attr("r", 9) //The radius
		.attr("fill","#fff") //The circle is filled in white
		.attr("stroke","#000")
		.attr("stroke-opacity",0.5)
		.attr("stroke-width","1.25px");

function dynamicColorChange(h) {
	handle.attr("cx", sliderScale(h));
	coreThreshold = h*panMatrix.length;
	blocks.style("fill", function (d) {return thresholdBasedColor(d,coreThreshold,blueColorScale,orangeColorScale);});
	structureBackground.style("fill", function (d) {var color = d3.hcl(thresholdBasedColor(d, coreThreshold, blueColorScale, orangeColorScale));
		color.c = color.c*0.65; //Reducing the chroma (ie 'colorness')
		color.l += (100-color.l)*0.3; //Augmenting the lightness without exceeding white's
		return color;
	});
}



//Some code for paning and paging http://bl.ocks.org/nicolashery/9627333 ; http://bl.ocks.org/cdagli/728e1f4509671b7de16d5f7f6bfee6f0


//Creating the variables for a scalable display
/*
var w = window.innerWidth, h = window.innerHeight;
*/


//Binding the data to a DOM element, therefore creating one SVG block per data
var blocks = svgContainer.append("g").attr("id","panChromosome") //.append("g") allows grouping svg objects
							.selectAll("rect") //First an empty selection of all not yet existing rectangles
								.data(panChromosomeBlockCounts) //Joining data to the selection, one rectangle for each as there is no key. It returns 3 virtual selections : enter, update, exit. The enter selection contains placeholder for any missing element. The update selection contains existing elements, bound to data. Any remaining elements ends up in the exit selection for removal.
								.enter() //The D3.js Enter Method returns the virtual enter selection from the Data Operator. This method only works on the Data Operator because the Data Operator is the only one that returns three virtual selections. However, it is important to note that this reference only allows chaining of append, insert and select operators to be used on it.
								.append("rect"); //For each placeholder element created in the previous step, a rectangle element is inserted.
							
							//For more about joins, see : https://bost.ocks.org/mike/join/

//Color Scale, might be concatenated with another one I believe, I want hue is great, HCL might allow better color handling
//For color, see : https://bl.ocks.org/mbostock/3014589
var blueColorScale = d3.scaleLinear()
		.domain([0,10]) //We declare the min/max values, they will be linked to the min/max colors
		.interpolate(d3.interpolateHcl) //Interpolate makes mostly no difference,might be usefull later Shoul I interpol the color range instead ?
		.range([d3.hcl(246, 0,95), d3.hcl(246, 45,72)]);

var orangeColorScale = d3.scaleLinear()
		.domain([0,10]) //We declare the min/max values, they will be linked to the min/max colors
		.interpolate(d3.interpolateHcl)
		.range([d3.hcl(60, 0,95), d3.hcl(60, 60,72)]);

//Creating a function to apply different color Scale depending on one value
function thresholdBasedColor(d, threshold, colorScaleLess, colorScaleMore) {
	if (d >= threshold) {
		return colorScaleMore(d);
	} return colorScaleLess(d);
};

//Selecting all previous blocks, and determining their attributes
var blocksAttributes = blocks.attr("x", svgContainer.attr("width")*0.55)
								.attr("width", 25)
								.attr("height", svgContainer.attr("height")/panMatrix[0].length)
								.attr("y", function(i,j){return j*blocks.attr("height");}) //y position is index * block height
								.style("fill", function (d) {return thresholdBasedColor(d,coreThreshold,blueColorScale,orangeColorScale);})
								.on("mouseover", eventDisplayInfoOn) //Link to eventDisplayInfoOn whenever the pointer is on the block
								.on("mouseout", eventDisplayInfoOff); //Idem with eventDisplayInfoOff

function eventDisplayInfoOn(d, i) {		//Takes most of its code from http://bl.ocks.org/WilliamQLiu/76ae20060e19bf42d774
										//http://bl.ocks.org/phil-pedruco/9032348 was useful too

	//Uses D3 to select element and change its color based on the previously built color scales
	d3.select(this).style("fill", function(d) {
		var color = d3.hcl(thresholdBasedColor(d,coreThreshold,blueColorScale,orangeColorScale)); //It's important to precise d3.hcl() to use .h .c or .l attributes
		color.h = color.h+10; //Slight change in hue for better noticing
		color.c = color.c*1.1; //Slight increase in chroma
		color.l += (100-color.l)*0.5; //Slight increase in luminance
		return color;
	});
	//Here, d is the block value from panChromosomeBlockCounts, i is the index within it
	//To access values of a block, we need to take "this" as an argument

	//alert(d + " " + i);

	//Specifies where to put label of text altogether with its properties
	svgContainer.append("text")
				.attr("id", "t" + d + "-" + i)
				.attr("x", Number(d3.select(this).attr("x")) - Number(d3.select(this).attr("width"))/2)
				//ATTENTION The text should not appear where the mouse pointer is, in order to not disrupt the mouseover event
				.attr("y", Number(d3.select(this).attr("y")) + Number(d3.select(this).attr("height"))/2)
				.attr("font-family", "sans-serif")
				.attr("text-anchor", "end") //Can be "start", "middle", ou "end"
				.attr("dominant-baseline", "middle") //Vertical alignment, can take many different arguments
				.text(function() {
					return "This block appears in " + d + " selected genome(s)";  //Text content
				});
};

function eventDisplayInfoOff(d, i) {
	//Uses D3 to select element, change color back to normal by overwriting and not recovery
	d3.select(this).style("fill",function (d) {return thresholdBasedColor(d,coreThreshold,blueColorScale,orangeColorScale);});

	//Selects text by id and then removes it
	d3.select("#t" + d + "-" + i).remove();  // Remove text location
};

//Creating a flatten matrix, the indexes will be used for the positionning of Presence Absence (PA) blocks
var flatten = panMatrix.reduce(function(a, b) {
    return a.concat(b);
});
//console.log(flatten)

//Creation of the subgroup for the StructureLinks background
var structureBackground = svgContainer.append("g").attr("id", "structureLinksBackground")
											.selectAll("rect")
												.data(panChromosomeBlockCounts)
												.enter()
												.append("rect");

//Attributes for structureLinksBackground
var structureBackground_Attributes = structureBackground.attr("x",0)
														.attr("y", function(i,j){return j*blocks.attr("height");})
														.attr("width", Number(blocks.attr("x"))-Number(structureBackground.attr("x"))-3)
														.attr("height", blocks.attr("height"))
														.style("fill", function (d) {var color = d3.hcl(thresholdBasedColor(d, coreThreshold, blueColorScale, orangeColorScale));
															color.c = color.c*0.65; //Reducing the chroma (ie 'colorness')
															color.l += (100-color.l)*0.3; //Augmenting the lightness without exceeding white's
															return color;
														});

//Creation of the subGroup for the PA blocks
var matrixPA = svgContainer.append("g").attr("id", "presenceAbsence")
											.selectAll("rect")
												.data(flatten) //There is one rect per (genome x PA block), not just per genome
												.enter()
												.append("rect");


//ATTENTION .attr()+.attr() concatenates and does NOT an addition !!
var matrixPA_Attributes = matrixPA.attr("x", function (i,j) {
		return Number(blocks.attr("x")) + Number(blocks.attr("width")) + 10 + Math.floor(j / panChromosomeBlockCounts.length) * blocks.attr("width"); //x is incremented for each new genome
	})
									.attr("width", blocks.attr("width"))
									.attr("height", blocks.attr("height"))
									.attr("y", function(i,j){return j%panChromosomeBlockCounts.length*blocks.attr("height");}) //y is incremented for each new PA block, and is reset to 0 for each genome
									.style("fill", function (d) {return d3.interpolateGreys (d*0.80);});