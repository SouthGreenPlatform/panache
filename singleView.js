//Fetching data and applying the visualisation to it, I will have to clean the code a bit later
//d3.dsv("\t","theFakeData2Use.tsv").then(function(realPanMatrix) {
d3.dsv("\t","miniFakeDataWithAllBlocks.tsv").then(function(realPanMatrix) { //This is a JavaScript promise, that returns value under certain conditions
	//console.log(realPanMatrix); //Array(71725) [ {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, … ]
	//I have to think about how to work with this JSON format

	//The real data I would like to work with, fetched from the csv file
	//ATTENTION I have to check/change the numbers for the lines index, the header names...
	//console.log(realPanMatrix[0]); //Object { Cluster: "OG0026472", Musac: "0", Maban: "1", Mabur: "1", Mazeb: "0", Musba: "0" }
	//console.log(realPanMatrix[0][1]); Does not work
	//console.log(realPanMatrix.Cluster); //undefined
	//console.log(realPanMatrix["Cluster"]); //undefined
	//realPanMatrix.forEach(function(realPanMatrix) {console.log(realPanMatrix.Cluster)}); //prints cluster for each line !
	
	
	
	//https://bl.ocks.org/pstuffa/3393ff2711a53975040077b7453781a9 This uses buttons it can be nice
	
	//Extracting column from array of objects, see : https://stackoverflow.com/questions/19590865/from-an-array-of-objects-extract-value-of-a-property-as-array
	
	
	//TO SIMPLIFY EXTRACTION OF DATA SEE THIS ABSOLUTELY !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	//https://www.dashingd3js.com/using-json-to-simplify-code
	//https://stackoverflow.com/questions/4020796/finding-the-max-value-of-an-attribute-in-an-array-of-objects LOOKING FOR THE MAX WITHIN PROPERTY
	//We could look for existing ways of updating data in the DOM
	//TO SIMPLIFY EXTRACTION OF DATA SEE THIS ABSOLUTELY !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	
	//-----------------------------------nbChromosomes------------------------------------
	
	const nbChromosomes = Math.max(...realPanMatrix.map(obj => Number(obj.ID_Position.split(":")[0])))+1;
	//------------------------------------------------------------------------------------
	
	//---------------------------------initialPptyNames-----------------------------------
	//ATTENTION This assume that the PA part is at the end of the file !!!	
	initialPptyNames = Object.getOwnPropertyNames(realPanMatrix[0]).slice(4,) //This select the element with indexes that range from 4 to the end
	//See : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyNames
	//And : https://www.w3schools.com/jsref/jsref_slice_array.asp
	//------------------------------------------------------------------------------------
	console.log(initialPptyNames);
	
	//---------------------------------functionDiversity----------------------------------
	
	//In JS 'Set()' can store unique elements, see : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
	//Pay attention to the uppercased first letter !
	//Bonus : what is 'let' : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let
	var functionDiversity = [...new Set(realPanMatrix.map( d => d.Function))];
	//ATTENTION IT WILL WORK DIFFERENTLY WITH TRUE GO TERMS !!!
	//------------------------------------------------------------------------------------
	console.log(functionDiversity);
	
	//---------------------------------improvedDataMatrix---------------------------------
	
	var improvedDataMatrix = realPanMatrix.map(function(d,i) {
		//Attributing the presence/absence matrix to "rest" by destructuring, see : http://www.deadcoderising.com/2017-03-28-es6-destructuring-an-elegant-way-of-extracting-data-from-arrays-and-objects-in-javascript/
		//This way we just have to precise the non-genome columns, the rest will be determined automatically no matter the number of genomes
		const {ID_Position, Sequence_IUPAC_Plus,SimilarBlocks, Function, ...rest} = d; //It has to be the property names
		var panChrBlockCount = Object.values(rest).map(value => Number(value)).reduce((acc, val) => acc + val); // .values() transforms properties into an array, map creates a new array built from calling a function on all its elements. The values must be converted as they are imported as string,else it would disrupt the display of the core/dispensable panChromosome
		//map is really useful, see : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
		//return Object.values(rest).forEach(function(a) {a = Number(a);}); Does not work !
		
		newObject = Object.assign({"index": i, "presenceCounter": panChrBlockCount}, d);
		
		//Encoding the proportion of duplicates in each chromosome
		
		concernedChromosomes = [];
		d.SimilarBlocks.split(";").forEach(copy => concernedChromosomes.push(copy.split(":")[0])); //Extracting the first piece of ID for each copy. Can be a number or "."
		countAsProperty = {};
		for (var i = 0; i < nbChromosomes; i++) { //Sets the base value to 0 for the properties "0", "1", "2"... etc
			countAsProperty[String(i)] = 0
		};
//		concernedChromosomes.forEach(chrom => if (countAsProperty[chrom] != undefined) countAsProperty[chrom] += 1;); //It does not accept the if statement in this one line statement
		concernedChromosomes.forEach(function(chrom) {
			if (countAsProperty[chrom] != undefined) {
				countAsProperty[chrom] += 1; //Counts the occurences for each chromosome
			};
		});
		maxCount = Math.max(...Object.values(countAsProperty)); //The ... is mandatory to tell that we work with an array
		for (var i = 0; i < nbChromosomes; i++) {
			newObject[`copyPptionIn_Chr${i}`] = (maxCount > 0 ? countAsProperty[`${i}`]/maxCount : 0); //Encode the pption as ppty instead of the raw count, not sure if this is better
		}; //For variables within string, see Template Literals : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
		
		return newObject;
	});
	//------------------------------------------------------------------------------------	
	console.log(improvedDataMatrix); //ATTENTION WE MUST WORK ON A copy OF THE ARRAY, ELSE THE REST WILL NOT BE DEFINED PROPERLY IN another potential matrix
	//We can use this : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign

	//See those too : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
	//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values
	
	//----------------------------------transpose()---------------------------------------
	
	//Function created for the transposition of the matrix, is usefull with .reduce
	function transpose(a) {
		return Object.keys(a[0]).map(function(c) {
			return a.map(function(r) { return r[c]; });
		});
	}
	//------------------------------------------------------------------------------------
	
	//--------------------------------domainPivotsMaker()---------------------------------
	
	function domainPivotsMaker(breakpointsNb,maxValue) {
		breakpoints = [];
		for (var i = 0; i < breakpointsNb; i++) {
//			breakpoints.push(Math.round((1+maxValue/breakpointsNb/(breakpointsNb-1))*i));
			breakpoints.push(Math.round((i/(breakpointsNb-1))*maxValue));
		};
		return(breakpoints);
	};
	//------------------------------------------------------------------------------------
	
	//--------------------------------colorScaleMaker()-----------------------------------
	
	//Color Scale, "I want hue" is great for choosing colors, HCL might allow better color handling
	//For color, see : https://bl.ocks.org/mbostock/3014589
	function colorScaleMaker(domain, range, scaleLinear = true) {
		if (scaleLinear) {
			return d3.scaleLinear()
						.domain(domain) //We declare the min/max values as input domain, they will be linked to the min/max colors
						.interpolate(d3.interpolateHcl) //Interpolate makes mostly no difference for orange, but it is visible for blue (better with it)
						.range(range); //No need to interpolate after range instead of before
		} else {
			return d3.scaleOrdinal()
						.domain(domain) //We declare the min/max values as input domain, they will be linked to the min/max colors
						.range(range); //ATTENTION As it is scaleOrdinal, we cannot use interpolate !
		};
	};
	//------------------------------------------------------------------------------------
	
	//---------------------------------blueColorScale-------------------------------------
	
	var blueColorScale = colorScaleMaker([0, initialPptyNames.length], [d3.hcl(246,0,95), d3.hcl(246,65,70)]);
	//------------------------------------------------------------------------------------
	
	//--------------------------------orangeColorScale------------------------------------
	
	var orangeColorScale = colorScaleMaker([0, initialPptyNames.length], [d3.hcl(60,0,95), d3.hcl(60,65,70)]);
	//------------------------------------------------------------------------------------

	//--------------------------------purpleColorScale------------------------------------
	
	var purpleColorScale = colorScaleMaker([1,Math.max(...improvedDataMatrix.map(d => d.SimilarBlocks.split(";").length))], [d3.hcl(325,2,97), d3.hcl(325,86,54)]);
	//------------------------------------------------------------------------------------
	
	//------------------------------pseudoRainbowColorScale-------------------------------
	
	//ATTENTION THE RAINBOW STILL WORKS BUT AS IT DEPENDS ON THE LENGTH IT PUTS THE FIRST BLOCKS AS THE SAME COLOR, WITH THE FINAL ONE BEING AT THE OPPOSITE ON THE RANGE OF VALUE
	
	//See https://codepen.io/thetallweeks/pen/QNvoNW for more about multiple colors linear scales
	//For info about color blindness https://knightlab.northwestern.edu/2016/07/18/three-tools-to-help-you-make-colorblind-friendly-graphics/
	var pseudoRainbowList = [d3.rgb(0,90,200), d3.rgb(0,200,250), d3.rgb(120,50,40), d3.rgb(190,140,60), d3.rgb(240,240,50), d3.rgb(160, 250,130)]
	var pseudoRainbowColorScale = colorScaleMaker(domainPivotsMaker(pseudoRainbowList.length,Math.max(...improvedDataMatrix.map(d => Number(d.ID_Position.split(":")[1])))), pseudoRainbowList);
//	var pseudoRainbowColorScale = colorScaleMaker(domainPivotsMaker(pseudoRainbowList.length,Math.max(...Number(improvedDataMatrix.ID_Position.split(":")[1]))), pseudoRainbowList); //Does not work, we have to find another way of extracting the maximum
	
	//max is the highest first nt position of a block, WITHIN A K
	//Each color in the range has a pivot position defined in the domain thanks to domainPivotsMaker
	//------------------------------------------------------------------------------------
	
	//-------------------------------functionColorScale----------------------------------- //Can be improved, cd PanVis !!
	
	var colorsForFunctions = domainPivotsMaker(functionDiversity.length,functionDiversity.length).map(intNum => d3.interpolateRainbow(intNum/(functionDiversity.length+1))); //There is +1 in the division so that it will not do a full cyclic rainbow
	var functionColorScale = colorScaleMaker(functionDiversity, colorsForFunctions, false);
	//------------------------------------------------------------------------------------
	console.log(colorsForFunctions);
	console.log(functionColorScale("9"),functionColorScale.range(),functionColorScale.domain());
	
	//Creating the SVG DOM tag
	var svgContainer = d3.select("body").append("svg")
										.attr("width", 1000).attr("height", 500);

	//----------------------------------coreThreshold-------------------------------------
	
	//Calculating the threshold for the change in color scale in core/dispensable panChromosome, arbitrary for the starting display
	var coreThreshold = 85/100*initialPptyNames.length; //ATTENTION It is not a percentage but the minimum number of genomes from the pangenome required for a block to be part of the core genome
	//------------------------------------------------------------------------------------

	//Creating a color gradient for the slider shape
	//ATTENTION The gradient CANNOT be applied on pure horizontal nor vertical "line" DOM objects
	//Here you can find a demo on how to avoid it : http://jsfiddle.net/yv92f9k2/ perhaps, I used a path instead of a line here
	//How to handle dynamic color change for the gradient : http://bl.ocks.org/nbremer/b1fbcc0ff00abe8893a087d85fc8005b
	var sliderGradient = svgContainer.append("defs")
										.append("linearGradient")
										.attr("id", "sliderGradient")
										.attr("x1", 0)
										.attr("x2", 1)
										.attr("y1", 0)
										.attr("y2", 0);

	sliderGradient.append("stop") //ATTENTION The order of the stops prevales on their offset
					.attr("offset", 0) //Relative position of the stop on the gradient
					.attr("stop-color", blueColorScale.range()[0]) //Color that should be displayed at that stop
				.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); }) //Duplicates the "stop" object in the DOM and selects the new one
					.attr("class", "hueSwingingPointLeft") //Class that is used later for dynamic changes
					.attr("offset", coreThreshold/initialPptyNames.length)
					.attr("stop-color", blueColorScale(coreThreshold))
				.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
					.attr("class", "hueSwingingPointRight")
					.attr("stop-color", orangeColorScale(coreThreshold))
				.select(function() { return this.parentNode; }).append("stop")
					.attr("offset", 1)
					.attr("stop-color", orangeColorScale.range()[1]);



	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	//Creation of a slider for choosing the core threshold ! see https://bl.ocks.org/mbostock/6452972 for slider example
	/////////////////////////////////////////////////////////////////////////////////////////////////////////


	//1st create a scale that links value to a position in pixel
	var sliderScale = d3.scaleLinear() //Attaches to each threshold value a position on the slider
			.domain([0, 1]) //Takes the possible treshold values as an input
			.range([0, 100]) //Ranges from and to the slider's extreme length values as an output
			.clamp(true); //.clamp(true) tells that the domains has 'closed' boundaries, that won't be exceeded

	//Translation of the whole slider object wherever it is required
	var slider = svgContainer.append("g") //slider is a subgroup of svgContainer
					.attr("class", "slider") //With the class "slider", to access it easily (more general than id which must be unique)
					.attr("transform", "translate(" + 850 + "," + svgContainer.attr("height") / 2 + ")"); //Everything in it will be translated

	//Creation of a function for the path determining the slider shape (as horizontal lines do not the job if mapped to a gradient)
	var sliderArea = d3.area()
		.x(function(d) { return d[0]; })
		.y0(function(d) { return d[1]; }) //2nd elements are considered as the lower baseline of the shape
		.y1(function(d) { return d[2]; }) //3rd elements are considered as the upper baseline of the shape
		.curve(d3.curveMonotoneY); //Style of the curve, see https://github.com/d3/d3-shape/blob/master/README.md#curves

	//Creation of the SVG for the slider
	slider.append("path")
			.datum([[sliderScale.range()[0]-4,0,0],[sliderScale.range()[0],4,-4],[sliderScale.range()[1],4,-4],[sliderScale.range()[1]+4,0,0]])
			.attr("fill", "url(#sliderGradient)") //The gradient is used to fill the shape
			.attr("d", sliderArea) //Calls the sliderArea function on the input data given to the path
			.attr("stroke", "#000")
			.attr("stroke-opacity", 0.3)

	//Addition of the interactive zone
	slider.append("line")
		.attr("class", "track-overlay") //This will be the interactivity zone, not displayed but accessible (see how the mouse pointer changes)
	//	.attr("pointer-event", "stroke") //Indicates that the event should only work when the pointer is on the stroke : https://developer.mozilla.org/fr/docs/Web/CSS/pointer-events ; might work as well without it, as the interactive object is already nothing but a stroke. Can also be "auto" (for all of the surface), "none" (does not apply any mouse change), or "fill" (applies on everything but the stroke) or other
		.attr("x1", sliderScale.range()[0]) //Calling the first boundary of sliderScale.range (ie left position)
		.attr("x2", sliderScale.range()[1]) //Calling the second boundary of sliderScale.range (ie right position)
		.attr("stroke-linecap","round") //The line will not have straight tips
		.attr("stroke-width", "30px") //The interactivity zone is larger than the displayed lines for easier use
		.attr("stroke", "transparent") //That zone is made invisible, but is still displayed over its parents lines/slider bars
		.attr("cursor", "crosshair") //The pointer changes for a cross whenever it reaches that zone
			.call(d3.drag()	//.drag creates a new drag behavior. The returned behavior, drag, is both an object and a function, and is typically applied to selected elements via selection.call. That is our case here, where drag is called on "track-overlay"
			//For more info on call and this : https://www.w3schools.com/js/js_function_call.asp ; .call is basically a reuse method on a different object, "With call(), an object can use a method belonging to another object."
			//It is written : selection.function.call(whatItIsBeingCalledOn, arguments...)
	//			.on("start.interrupt", function() { slider.interrupt(); }) //interrupt seems to be an event related to the transition the original code had (the slider's handle was moving at the very beginning), see : https://github.com/d3/d3-transition/blob/master/README.md#selection_interrupt . ATTENTION It is not useful here as I did not use the transition from the original code
				.on("start drag", function() { eventDynamicColorChange(sliderScale.invert(d3.event.x)); })); //"start" is the d3.drag event for mousedown AND if it is not just a click : https://github.com/d3/d3-drag . We surely need to call d3.drag() to use this. For more about .on : https://github.com/d3/d3-selection/blob/master/README.md#selection_on
				//invert uses the same scale, but goes from range to domain, can be useful for returning data from mouse position : The container of a drag gesture determines the coordinate system of subsequent drag events, affecting event.x and event.y. The element returned by the container accessor is subsequently passed to d3.mouse or d3.touch, as appropriate, to determine the local coordinates of the pointer.

	//Creation of the handle circle, thats translates the interaction into visual movement
	var handle = slider.insert("circle", ".track-overlay") //Tells to insert a circle element before (so that it will appear behind it) the first "track-overlay" class element it finds within slider
			.attr("class", "handle") //It is given the class "handle" (useful for easier/universal styling when used with css format)
			.attr("r", 7) //The radius
			.attr("fill", "#fff") //The circle is filled in white
			.attr("stroke", "#000")
			.attr("cx", coreThreshold/initialPptyNames.length*100)
			.attr("stroke-opacity", 0.3)
			.attr("stroke-width", "1.25px");

	//Creation of the tick label that will give coreTreshold percent value in real time
	slider.insert("g", ".track-overlay") //Insertion of a subgroup before "track-overlay"
			.attr("class", "tick") //Giving the class "ticks", for styling reasons
			.attr("font-family", "sans-serif")
			.attr("font-size", "10px")
			.attr("transform", "translate(0 18)") //One more translation in order to have it right under the rest of the slider
			.append("text").attr("x", handle.attr("cx")).attr("text-anchor", "middle").text(handle.attr("cx")+"%"); //Text value based on coreThreshold

	slider.insert("text", ".track-overlay")
			.attr("font-family", "sans-serif")
			.attr("font-size", "10px")
			.attr("transform", "translate("+sliderScale.range()[1]/2+",0)") //Keeping the value outside of quotes is neede for its calculation
			.attr("dy","-2.5em") //A vertical translation depending on the font size (2em --> two times the font size, enough space for two lines)
			.attr("text-anchor", "middle")
			.append("tspan")
				.text("Minimal Presence ratio")
				.attr("x", 0) //Needed for the carriage return
			.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
				.text("to be part of Core")
				.attr("dy","1.2em");

	//Function called when dragging the slider's handle, its input "slidePercent" is derived from the pointer position
	function eventDynamicColorChange(slidePercent) {
		handle.attr("cx", sliderScale(slidePercent)); //Position change for the handle
		coreThreshold = slidePercent*initialPptyNames.length; //Updates the value of coreThreshold
		d3.select(".tick").select("text").attr("x", sliderScale(slidePercent)).text(Math.round(slidePercent*100) + "%"); //Position change for the label
		d3.select(".hueSwingingPointLeft").attr("offset", coreThreshold/initialPptyNames.length).attr("stop-color", blueColorScale(coreThreshold)); //The gradient is dynamically changed to display different hues for each extremity of the slider
		d3.select(".hueSwingingPointRight").attr("offset", coreThreshold/initialPptyNames.length).attr("stop-color", orangeColorScale(coreThreshold));
		blocks.style("fill", function (d) {return thresholdBasedColor(d.presenceCounter,coreThreshold,blueColorScale,orangeColorScale);}); //Updates the core/dispensable panChromosome blocks' colours
	};


	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	//End of the slider creation
	/////////////////////////////////////////////////////////////////////////////////////////////////////////



	//Some code for paning and paging http://bl.ocks.org/nicolashery/9627333 ; http://bl.ocks.org/cdagli/728e1f4509671b7de16d5f7f6bfee6f0


	//Creating the variables for a scalable display
	/*
	var w = window.innerWidth, h = window.innerHeight;
	*/

	//-------------------------------thresholdBasedColor()--------------------------------
	
	//Creating a function to apply different color Scale depending on one value
	function thresholdBasedColor(d, threshold, colorScaleLess, colorScaleMore) {
		if (d >= threshold) {
			return colorScaleMore(d);
		} return colorScaleLess(d);
	};	
	//------------------------------------------------------------------------------------
	
	//--------------------------structureBackground & attributes--------------------------
	
	//Creation of the subgroup for the StructureBackground
	var structureBackground = svgContainer.append("g").attr("id", "structureBackground")
														.selectAll("rect")
															.data(improvedDataMatrix)
															.enter()
															.append("rect");

	//Attributes for structureBackground
	var structureBackground_Attributes = structureBackground.attr("x",0)
															.attr("y", function(d,i){return i*12;})
															.attr("width", (nbChromosomes+3)*14)
															.attr("height", 12)
															.style("fill", function (d) {var color = d3.hcl(purpleColorScale(d.SimilarBlocks.split(";").length));
																color.c = color.c*0.65; //Reducing the chroma (ie 'colorness')
																color.l += (100-color.l)*0.3; //Augmenting the lightness without exceeding white's
																return color;
															});
	//------------------------------------------------------------------------------------

	//------------------------------copyCircles & attributes------------------------------
	
	//Creation of the subgroup for the the repeated blocks (cf improvedDataMatrix[`copyPptionIn_Chr${chr}`])
	for (var chr = 0; chr < nbChromosomes; chr++) {
		var copyCircles = svgContainer.append("g").attr("id", `duplicationCircles_Chr${chr}`)
													.selectAll("circle")
														.data(improvedDataMatrix)
														.enter()
														.append("circle");
		
		var copyCircles_Attributes = copyCircles.attr("cx", function(d,i) {return (0.5+chr)*14}) //14 is the stable block width, I should declare blockWidth and Block height variables for further use
												.attr("cy", function(d,i){return (0.5+i)*12;}) //Depends on the data index, and 12, which is the blocks height
												.attr("r", (d => d[`copyPptionIn_Chr${chr}`]*(5-1)+1)) //Depends on the data value; rmax = 5, rmin = 1
												.style("fill", d3.hcl(0,0,25))
												.style("fill-opacity", d => (d[`copyPptionIn_Chr${chr}`] > 0 ? 1 : 0.20));//A one line 'if' statement
	};

	//------------------------------------------------------------------------------------

	//-----------------------------similarBlocks & attributes-----------------------------
	
	//Binding the data to a DOM element, therefore creating one SVG block per data
	var similarBlocks = svgContainer.append("g").attr("id","panChromosome_similarCount")
								.selectAll("rect")
									.data(improvedDataMatrix)
									.enter()
									.append("rect");

	//Selecting all previous blocks, and determining their attributes
	var similarBlocks_Attributes = similarBlocks.attr("x", Number(structureBackground.attr("width")))
									.attr("width", 14)
									.attr("height", 12)
									.attr("y", function(d,i){return i*similarBlocks.attr("height");}) //y position is index * block height
									.style("fill", (d => purpleColorScale(d.SimilarBlocks.split(";").length)));
//									.style("fill", (d => purpleColorScale((d.SimilarBlocks.split(";").length != 1 ? d.SimilarBlocks.split(";").length : 0))));
	//------------------------------------------------------------------------------------

	//-----------------------------rainbowBlocks & attributes-----------------------------
	
	//Binding the data to a DOM element, therefore creating one SVG block per data
	var rainbowBlocks = svgContainer.append("g").attr("id","panChromosome_Rainbowed")
								.selectAll("rect")
									.data(improvedDataMatrix)
									.enter()
									.append("rect");

	//Selecting all previous blocks, and determining their attributes
	var rainbowBlocks_Attributes = rainbowBlocks.attr("x", Number(similarBlocks.attr("x"))+Number(similarBlocks.attr("width"))+3)
									.attr("width", 14)
									.attr("height", 12)
									.attr("y", function(d,i){return i*rainbowBlocks.attr("height");}) //y position is index * block height
									.style("fill", (d => pseudoRainbowColorScale(Number(d.ID_Position.split(":")[1]))));
	//------------------------------------------------------------------------------------
	
	//---------------------------------blocks & attributes--------------------------------
	
	//Binding the data to a DOM element, therefore creating one SVG block per data
	var blocks = svgContainer.append("g").attr("id","panChromosome_coreVSdispensable") //.append("g") allows grouping svg objects
								.selectAll("rect") //First an empty selection of all not yet existing rectangles
									.data(improvedDataMatrix)//Joining data to the selection, one rectangle for each as there is no key. It returns 3 virtual selections : enter, update, exit. The enter selection contains placeholder for any missing element. The update selection contains existing elements, bound to data. Any remaining elements ends up in the exit selection for removal.
									.enter() //The D3.js Enter Method returns the virtual enter selection from the Data Operator. This method only works on the Data Operator because the Data Operator is the only one that returns three virtual selections. However, it is important to note that this reference only allows chaining of append, insert and select operators to be used on it.
									.append("rect"); //For each placeholder element created in the previous step, a rectangle element is inserted.
								
								//For more about joins, see : https://bost.ocks.org/mike/join/

	//Selecting all previous blocks, and determining their attributes
	var blocks_Attributes = blocks.attr("x", Number(rainbowBlocks.attr("x"))+Number(rainbowBlocks.attr("width"))+3)
									.attr("width", 14)
									.attr("height", 12)
									.attr("y", function(d,i){return i*blocks.attr("height");}) //y position is index * block height
									.style("fill", function (d) {return thresholdBasedColor(d.presenceCounter,coreThreshold,blueColorScale,orangeColorScale);})
									.on("mouseover", eventDisplayInfoOn) //Link to eventDisplayInfoOn whenever the pointer is on the block
									.on("mouseout", eventDisplayInfoOff); //Idem with eventDisplayInfoOff
	//------------------------------------------------------------------------------------

	//--------------------------------eventDisplayInfoOn()--------------------------------
	
	function eventDisplayInfoOn(d, i) {		//Takes most of its code from http://bl.ocks.org/WilliamQLiu/76ae20060e19bf42d774
											//http://bl.ocks.org/phil-pedruco/9032348 was useful too

		//Uses D3 to select element and change its color based on the previously built color scales
		d3.select(this).style("fill", function(d) {
			var color = d3.hcl(thresholdBasedColor(d.presenceCounter,coreThreshold,blueColorScale,orangeColorScale)); //It's important to precise d3.hcl() to use .h .c or .l attributes
			color.h = color.h+10; //Slight change in hue for better noticing
			color.c = color.c*1.1; //Slight increase in chroma
			color.l += (100-color.l)*0.5; //Slight increase in luminance
			return color;
		});
		//Here, d is a block object from improvedDataMatrix, i is its index within the array
		//To access values of a block, we need to take "this" as an argument

		//alert(d + " " + i);

		//Specifies where to put label of text altogether with its properties
		svgContainer.append("text")
					.attr("id", "t" + d.presenceCounter + "-" + i)
					.attr("x", Number(d3.select(this).attr("x")) + Number(d3.select(this).attr("width"))*1.5)
					//ATTENTION The text should not appear where the mouse pointer is, in order to not disrupt the mouseover event
					.attr("y", Number(d3.select(this).attr("y")) + Number(d3.select(this).attr("height"))/2)
					.attr("font-family", "sans-serif")
					.attr("text-anchor", "start") //Can be "start", "middle", or "end"
					.attr("dominant-baseline", "middle") //Vertical alignment, can take many different arguments
					.text(function() {
						return "This block appears in " + d.presenceCounter + " selected genome(s)";  //Text content
					});

		//Getting the text shape, see : https://bl.ocks.org/mbostock/1160929 and http://bl.ocks.org/andreaskoller/7674031
		var bbox = d3.select("#t" + d.presenceCounter + "-" + i).node().getBBox(); //Do not know exactly why but node() is needed

		svgContainer.insert("rect", "#t" + d.presenceCounter + "-" + i)
		.attr("id", "t" + d.presenceCounter + "-" + i + "bg")
			.attr("x", bbox.x - 2)
			.attr("y", bbox.y - 2)
			.attr("width", bbox.width + 4)
			.attr("height", bbox.height + 4)
			.style("fill", d3.hcl(83, 4, 96))
			.style("fill-opacity", "0.8")
			.style("stroke", d3.hcl(86, 5, 80))
			.style("stroke-opacity", "0.9");
	};
	//------------------------------------------------------------------------------------

	//---------------------------------eventDisplayInfoOff()------------------------------
	
	function eventDisplayInfoOff(d, i) {
		//Uses D3 to select element, change color back to normal by overwriting and not recovery
		d3.select(this).style("fill",function (d) {return thresholdBasedColor(d.presenceCounter,coreThreshold,blueColorScale,orangeColorScale);});

		//Selects text by id and then removes it
		d3.select("#t" + d.presenceCounter + "-" + i).remove();  // Remove text location slecting the id thanks to #
		d3.select("#t" + d.presenceCounter + "-" + i + "bg").remove();
	};
	//------------------------------------------------------------------------------------

	//--------------------------------matrixPA & attributes-------------------------------	
	
	//Creation of the subGroup for the PA blocks
	//Creation of the subgroup for the the repeated blocks (cf improvedDataMatrix[`copyPptionIn_Chr${chr}`])
	//ATTENTION The for ... in statement does not work well when oreder is important ! Prefer .forEach method instead when working on arrays
	//See : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in
	initialPptyNames.forEach(function(geno, genomeNumber) {
		var matrixPA = svgContainer.append("g").attr("id", `presence_${geno}`)
												.selectAll("rect")
													.data(improvedDataMatrix) //There is one rect per (genome x PA block), not just per genome
													.enter()
													.append("rect");
													
		//ATTENTION There should be a simpler way to encode now, like linking PA directly to a block from PanK
		//ATTENTION .attr()+.attr() concatenates and does NOT an addition !!
		var matrixPA_Attributes = matrixPA.attr("x", function (d,i) {
												return Number(blocks.attr("x")) + Number(blocks.attr("width")) + 10 + genomeNumber*blocks.attr("width"); //x is incremented for each new genome
											})
											.attr("width", blocks.attr("width"))
											.attr("height", blocks.attr("height"))
											.attr("y", (d,i) => i*blocks.attr("height")) //y is incremented for each new PA block, and is reset to 0 for each genome
											.style("fill", d => functionColorScale(d["Function"])) //Do not forget the ""...
											.style("fill-opacity", d => d[`${geno}`]);
	});
	//------------------------------------------------------------------------------------
});