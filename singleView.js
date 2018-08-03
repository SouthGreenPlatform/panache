//Fetching data and applying the visualisation to it, I will have to clean the code a bit later
//d3.dsv("\t","theFakeData2Use.tsv").then(function(realPanMatrix) {
d3.dsv("\t","miniFakeDataWithAllBlocks.tsv").then(function(realPanMatrix) {
//d3.dsv("\t","mediumFakeDataWithAllBlocks.tsv").then(function(realPanMatrix) { //This is a JavaScript promise, that returns value under certain conditions
	console.log(realPanMatrix); //Array(71725) [ {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, … ]
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
	
//	const nbChromosomes = Math.max(...realPanMatrix.map(obj => Number(obj.ID_Position.split(":")[0])))+1;
	const nbChromosomes = [...new Set(realPanMatrix.map( d => d["#Chromosome"]))].length
	//------------------------------------------------------------------------------------
	
	//-------------------------------initialGenomesNames----------------------------------
	//ATTENTION This assume that the PA part is at the end of the file !!!
	initialGenomesNames = Object.getOwnPropertyNames(realPanMatrix[0]).slice(6,) //This select the element with indexes that range from 6 to the end
	//See : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyNames
	//And : https://www.w3schools.com/jsref/jsref_slice_array.asp
	//------------------------------------------------------------------------------------
//	console.log(initialGenomesNames);
	
	//---------------------------------functionDiversity----------------------------------
	
	//In JS 'Set()' can store unique elements, see : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
	//Pay attention to the uppercased first letter !
	//Bonus : what is 'let' : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let
	var functionDiversity = [...new Set(realPanMatrix.map( d => d.Function))];
	//ATTENTION IT WILL WORK DIFFERENTLY WITH TRUE GO TERMS !!!
	//------------------------------------------------------------------------------------
//	console.log(functionDiversity);
	
	//---------------------------------improvedDataMatrix---------------------------------
	
	var improvedDataMatrix = realPanMatrix.map(function(d,i) {
		//Attributing the presence/absence matrix to "rest" by destructuring, see : http://www.deadcoderising.com/2017-03-28-es6-destructuring-an-elegant-way-of-extracting-data-from-arrays-and-objects-in-javascript/
		//This way we just have to precise the non-genome columns, the rest will be determined automatically no matter the number of genomes
//		const {ID_Position, Sequence_IUPAC_Plus,SimilarBlocks, Function, ...rest} = d; //It has to be the property names
		const {"#Chromosome" : Chromosome, FeatureStart, FeatureStop, Sequence_IUPAC_Plus,SimilarBlocks, Function, ...rest} = d; //It has to be the property names
		delete d["#Chromosome"];
		
		//INVALID NAME, this could help, maybe https://stackoverflow.com/questions/38762715/how-to-destructure-object-properties-with-key-names-that-are-invalid-variable-na/38762787
//		var panChrBlockCount = Object.values(rest).map(value => Number(value)).reduce((acc, val) => acc + val); // .values() transforms properties into an array, map creates a new array built from calling a function on all its elements. The values must be converted as they are imported as string,else it would disrupt the display of the core/dispensable panChromosome
		var panChrBlockCount = Object.values(rest).map(value => Number(value)).reduce((acc, val) => acc + (val != 0 ? val/val : 0)); // The Presence/Absence matrix can now work with numbers higher than 1, they just are divided by themselves for the sake of the count
		//map is really useful, see : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
		//return Object.values(rest).forEach(function(a) {a = Number(a);}); Does not work !
		
		newObject = Object.assign({"index": i, "presenceCounter": panChrBlockCount, "Chromosome": Chromosome}, d);
		
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
	
	var blueColorScale = colorScaleMaker([0, initialGenomesNames.length], [d3.hcl(246,0,95), d3.hcl(246,65,70)]);
	//------------------------------------------------------------------------------------
	
	//--------------------------------orangeColorScale------------------------------------
	
	var orangeColorScale = colorScaleMaker([0, initialGenomesNames.length], [d3.hcl(60,0,95), d3.hcl(60,65,70)]);
	//------------------------------------------------------------------------------------

	//--------------------------------purpleColorScale------------------------------------
	
	var purpleColorScale = colorScaleMaker([1,Math.max(...improvedDataMatrix.map(d => d.SimilarBlocks.split(";").length))], [d3.hcl(325,2,97), d3.hcl(325,86,54)]);
	//------------------------------------------------------------------------------------
	
	//------------------------------pseudoRainbowColorScale-------------------------------
	
	//See https://codepen.io/thetallweeks/pen/QNvoNW for more about multiple colors linear scales
	//For info about color blindness https://knightlab.northwestern.edu/2016/07/18/three-tools-to-help-you-make-colorblind-friendly-graphics/
	var pseudoRainbowList = [d3.rgb(0,90,200), d3.rgb(0,200,250), d3.rgb(120,50,40), d3.rgb(190,140,60), d3.rgb(240,240,50), d3.rgb(160, 250,130)]
//	var pseudoRainbowColorScale = colorScaleMaker(domainPivotsMaker(pseudoRainbowList.length,Math.max(...improvedDataMatrix.map(d => Number(d.ID_Position.split(":")[1])))), pseudoRainbowList);
	var pseudoRainbowColorScale = colorScaleMaker(domainPivotsMaker(pseudoRainbowList.length,Math.max(...improvedDataMatrix.map(d => Number(d.FeatureStart)))), pseudoRainbowList);
//	var pseudoRainbowColorScale = colorScaleMaker(domainPivotsMaker(pseudoRainbowList.length,Math.max(...Number(improvedDataMatrix.ID_Position.split(":")[1]))), pseudoRainbowList); //Does not work, we have to find another way of extracting the maximum
	
	//max is the highest first nt position of a block, WITHIN A CHROMOSOME
	//Each color in the range has a pivot position defined in the domain thanks to domainPivotsMaker
	//------------------------------------------------------------------------------------
	
	//-------------------------------functionColorScale----------------------------------- //Can be improved, cf PanVis !!
	
	var colorsForFunctions = domainPivotsMaker(functionDiversity.length,functionDiversity.length).map(intNum => d3.interpolateRainbow(intNum/(functionDiversity.length+1))); //There is +1 in the division so that it will not do a full cyclic rainbow
	var functionColorScale = colorScaleMaker(functionDiversity, colorsForFunctions, false);
	//------------------------------------------------------------------------------------
//	console.log(colorsForFunctions);
//	console.log(functionColorScale("9"),functionColorScale.range(),functionColorScale.domain());

	//---------------------------------coreThreshold--------------------------------------
	
	//Calculating the threshold for the change in color scale in core/dispensable panChromosome, arbitrary for the starting display
	var coreThreshold = 85/100*initialGenomesNames.length; //ATTENTION It is not a percentage but the minimum number of genomes from the pangenome required for a block to be part of the core genome
	//------------------------------------------------------------------------------------	
	
	//---------------------------windowWidth, windowHeight--------------------------------
	
	//Creating the constants for a scalable display
	const windowWidth = window.innerWidth, windowHeight = window.innerHeight;
	//------------------------------------------------------------------------------------
	
	//More about d3 selection : https://bost.ocks.org/mike/selection/

	//----------------------------svgContainer_coreSlider---------------------------------
	//Creating the SVG DOM tag
	var svgContainer_coreSlider = d3.select("body").append("svg").attr("id", "svgContainer_coreSlider")
										.attr("width", windowWidth*0.20).attr("height", windowHeight*0.20); //Full proportions won't display correctly
	//------------------------------------------------------------------------------------
	
	//--------------------------svgContainer_browsingSlider-------------------------------
	//Creating the SVG DOM tag
	var svgContainer_browsingSlider = d3.select("body").append("svg").attr("id", "svgContainer_browsingSlider")
										.attr("width", windowWidth*0.75).attr("height", windowHeight*0.20); //Full proportions won't display correctly
	//------------------------------------------------------------------------------------
	
	//---------------------------svgContainer_labelsAndTree-------------------------------
	//Creating the SVG DOM tag
	var svgContainer_labelsAndTree = d3.select("body").append("svg").attr("id", "svgContainer_labelsAndTree")
										.attr("width", windowWidth*0.20).attr("height", windowHeight*0.75); //Full proportions won't display correctly
	//------------------------------------------------------------------------------------

	//---------------------------svgContainer_presenceAbsenceMatrix-------------------------------
	//Creating the SVG DOM tag
	var svgContainer_presenceAbsenceMatrix = d3.select("body").append("svg").attr("id", "svgContainer_presenceAbsenceMatrix")
										.attr("width", windowWidth*0.20).attr("height", windowHeight*0.75); //Full proportions won't display correctly
	//------------------------------------------------------------------------------------

	//---------------------------svgContainer_legends-------------------------------
	//Creating the SVG DOM tag
	var svgContainer_legends = d3.select("body").append("svg").attr("id", "svgContainer_legends")
										.attr("width", windowWidth*0.20).attr("height", windowHeight*0.75); //Full proportions won't display correctly
	//------------------------------------------------------------------------------------

	//-----------------------------svgContainer_rawBlocks---------------------------------
	//Creating the SVG DOM tag
	var svgContainer_rawBlocks = d3.select("body").append("svg").attr("id", "svgContainer_rawBlocks")
										.attr("width", windowWidth*0.75).attr("height", windowHeight*0.75); //Full proportions won't display correctly
	//------------------------------------------------------------------------------------
	
	
	
	
	//--------------------------------coreSliderGradient----------------------------------
	
	//Creating a color gradient for the slider shape
	//ATTENTION The gradient CANNOT be applied on pure horizontal nor vertical "line" DOM objects
	//Here you can find a demo on how to avoid it : http://jsfiddle.net/yv92f9k2/ perhaps, I used a path instead of a line here
	//How to handle dynamic color change for the gradient : http://bl.ocks.org/nbremer/b1fbcc0ff00abe8893a087d85fc8005b
	var coreSliderGradient = svgContainer_rawBlocks.append("defs")
										.append("linearGradient")
										.attr("id", "coreSliderGradient")
										.attr("x1", 0) //x1, x2, y1, y2 determine the direction of the gradient
										.attr("x2", 1)
										.attr("y1", 0)
										.attr("y2", 0);

	coreSliderGradient.append("stop") //ATTENTION The order of the stops prevales on their offset, they therefore have to be declared in the intended order of appearance
						.attr("offset", 0) //Relative position of the stop on the gradient
						.attr("stop-color", blueColorScale.range()[0]) //Color that should be displayed at that stop
					.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); }) //Duplicates the "stop" object in the DOM and selects the new one
						.attr("class", "hueSwingingPointLeft") //Class that is used later for dynamic changes
						.attr("offset", coreThreshold/initialGenomesNames.length)
						.attr("stop-color", blueColorScale(coreThreshold))
					.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
						.attr("class", "hueSwingingPointRight")
						.attr("stop-color", orangeColorScale(coreThreshold))
					.select(function() { return this.parentNode; }).append("stop")
						.attr("offset", 1)
						.attr("stop-color", orangeColorScale.range()[1]);
	//------------------------------------------------------------------------------------

/*	//-----------------------------------slidersGroup-------------------------------------
						
	var slidersGroup = svgContainer_browsingSlider.append("g")
										.attr("id", "slidersGroup")
	//------------------------------------------------------------------------------------
*/	
	//-----------------------------------blocksDisplay------------------------------------
	var blocksDisplay = svgContainer_rawBlocks.append("g")
										.attr("id", "blocksDisplay")
	//------------------------------------------------------------------------------------
	
	//-----------------------------displayedBlocksDimensions------------------------------
	
	var displayedBlocksDimensions = {width:12, height:14}
	//------------------------------------------------------------------------------------
	
	//------------------------------browsingBlocksDimensions------------------------------
	
	var browsingBlocksDimensions = {width:(svgContainer_browsingSlider.attr("width")/improvedDataMatrix.length)+1, height:10, borderSpace:1}
	//+1 so that the rectangles overlap and leave no space giving a filling of transparency
	//------------------------------------------------------------------------------------
	
	
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	//Creation of a slider for choosing the core threshold ! see https://bl.ocks.org/mbostock/6452972 for slider example
	/////////////////////////////////////////////////////////////////////////////////////////////////////////


	//----------------------------------coreSliderScale-----------------------------------
	
	//1st create a scale that links value to a position in pixel
	var coreSliderScale = d3.scaleLinear() //Attaches to each threshold value a position on the slider
			.domain([0, 1]) //Takes the possible treshold values as an input
			.range([0, 100]) //Ranges from and to the slider's extreme length values as an output
			.clamp(true); //.clamp(true) tells that the domains has 'closed' boundaries, that won't be exceeded
	//------------------------------------------------------------------------------------
	
	//-------------------------------------coreSlider-------------------------------------
	
	//Translation of the whole slider object wherever it is required
	var coreSlider = svgContainer_coreSlider.append("g") //coreSlider is nested in svgContainer_coreSlider
//									.attr("class", "slider") //With the class "slider", to access it easily (more general than id which must be unique)
									.attr("transform", "translate(" + (svgContainer_coreSlider.attr("width")-coreSliderScale.range()[1]) / 2 + "," + svgContainer_coreSlider.attr("height") / 2 + ")"); //Everything in it will be translated
	//------------------------------------------------------------------------------------

	//---------------------------------coreFillingGradient---------------------------------
	
	//Creation of a function for the path determining the slider shape (as horizontal lines do not the job if mapped to a gradient)
	var coreSliderArea = d3.area()
		.x(function(d) { return d[0]; })
		.y0(function(d) { return d[1]; }) //2nd elements are considered as the lower baseline of the shape
		.y1(function(d) { return d[2]; }) //3rd elements are considered as the upper baseline of the shape
		.curve(d3.curveMonotoneY); //Style of the curve, see https://github.com/d3/d3-shape/blob/master/README.md#curves

	//Creation of the SVG for the slider
	coreSlider.append("path")
			.datum([[coreSliderScale.range()[0]-4,0,0],[coreSliderScale.range()[0],4,-4],[coreSliderScale.range()[1],4,-4],[coreSliderScale.range()[1]+4,0,0]])
			.attr("fill", "url(#coreSliderGradient)") //The gradient is used to fill the shape
			.attr("d", coreSliderArea) //Calls the sliderArea function on the input data given to the path
			.attr("stroke", "#000")
			.attr("stroke-opacity", 0.3)
	//------------------------------------------------------------------------------------
	
	//---------Some colour circles at the extremities to keep track of the colour---------
	
	coreSlider.append("circle").attr("r",4).attr("cx",(coreSliderScale.range()[0]-4)-4*2.5).attr("cy",0).style("fill",blueColorScale.range()[1]);
	coreSlider.append("circle").attr("r",4).attr("cx",(coreSliderScale.range()[1]+4)+4*2.5).attr("cy",0).style("fill",orangeColorScale.range()[1]);
	//------------------------------------------------------------------------------------
	
	//------------------------------------coreOverlay-------------------------------------

	//Addition of the interactive zone
	coreSlider.append("line")
		.attr("class", "track-overlay") //This will be the interactivity zone, not displayed but accessible (see how the mouse pointer changes)
	//	.attr("pointer-event", "stroke") //Indicates that the event should only work when the pointer is on the stroke : https://developer.mozilla.org/fr/docs/Web/CSS/pointer-events ; might work as well without it, as the interactive object is already nothing but a stroke. Can also be "auto" (for all of the surface), "none" (does not apply any mouse change), or "fill" (applies on everything but the stroke) or other
		.attr("x1", coreSliderScale.range()[0]) //Calling the first boundary of coreSliderScale.range (ie left position)
		.attr("x2", coreSliderScale.range()[1]) //Calling the second boundary of coreSliderScale.range (ie right position)
		.attr("stroke-linecap","round") //The line will not have straight tips
		.attr("stroke-width", "30px") //The interactivity zone is larger than the displayed lines for easier use
		.attr("stroke", "transparent") //That zone is made invisible, but is still displayed over its parents lines/slider bars
		.attr("cursor", "crosshair") //The pointer changes for a cross whenever it reaches that zone, see https://www.w3schools.com/jsref/prop_style_cursor.asp for more cursor options
			.call(d3.drag()	//.drag creates a new drag behavior. The returned behavior, drag, is both an object and a function, and is typically applied to selected elements via selection.call. That is our case here, where drag is called on "track-overlay"
			//For more info on call and this : https://www.w3schools.com/js/js_function_call.asp ; .call is basically a reuse method on a different object, "With call(), an object can use a method belonging to another object."
			//It is written : selection.function.call(whatItIsBeingCalledOn, arguments...)
	//			.on("start.interrupt", function() { slider.interrupt(); }) //interrupt seems to be an event related to the transition the original code had (the slider's handle was moving at the very beginning), see : https://github.com/d3/d3-transition/blob/master/README.md#selection_interrupt . ATTENTION It is not useful here as I did not use the transition from the original code
				.on("start drag", function() { eventDynamicColorChange(coreSliderScale.invert(d3.event.x)); })); //"start" is the d3.drag event for mousedown AND if it is not just a click : https://github.com/d3/d3-drag . We surely need to call d3.drag() to use this. For more about .on : https://github.com/d3/d3-selection/blob/master/README.md#selection_on
				//invert uses the same scale, but goes from range to domain, can be useful for returning data from mouse position : The container of a drag gesture determines the coordinate system of subsequent drag events, affecting event.x and event.y. The element returned by the container accessor is subsequently passed to d3.mouse or d3.touch, as appropriate, to determine the local coordinates of the pointer.
	//------------------------------------------------------------------------------------
	
	//-------------------------------------coreHandle-------------------------------------
	
	//Creation of the handle circle, thats translates the interaction into visual movement
	var coreHandle = coreSlider.insert("circle", ".track-overlay") //Tells to insert a circle element before (as it is insert and not append) the first "track-overlay" class element it finds within coreSlider (so that it will appear behind it)
			.attr("class", "handle") //It is given the class "handle" (useful for easier/universal styling when used with css format)
			.attr("r", 7) //The radius
			.attr("fill", "#fff") //The circle is filled in white
			.attr("stroke", "#000")
			.attr("cx", coreThreshold/initialGenomesNames.length*100)
			.attr("stroke-opacity", 0.3)
			.attr("stroke-width", "1.25px");
	//------------------------------------------------------------------------------------

	//--------------------------------------coreTicks-------------------------------------
	
	//Creation of the tick label that will give coreTreshold percent value in real time
	coreSlider.insert("g", ".track-overlay") //Insertion of a subgroup before "track-overlay"
			.attr("class", "tick") //Giving the class "ticks", for styling reasons
			.attr("font-family", "sans-serif")
			.attr("font-size", "10px")
			.attr("transform", "translate(0 18)") //One more translation in order to have it right under the rest of the slider
			.append("text").attr("x", coreHandle.attr("cx")).attr("text-anchor", "middle").text(coreHandle.attr("cx")+"%"); //Text value based on coreThreshold
	//------------------------------------------------------------------------------------
	
	//--------------------------------------coreLabel-------------------------------------
	
	coreSlider.insert("text", ".track-overlay")
			.attr("font-family", "sans-serif")
			.attr("font-size", "10px")
			.attr("transform", "translate("+coreSliderScale.range()[1]/2+",0)") //Keeping the value outside of quotes is neede for its calculation
			.attr("dy","-2.5em") //A vertical translation depending on the font size (2em --> two times the font size, enough space for two lines)
			.attr("text-anchor", "middle")
			.append("tspan")
				.text("Minimal Presence ratio")
				.attr("x", 0) //Needed for the carriage return
			.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
				.text("to be part of Core")
				.attr("dy","1.2em");
	//------------------------------------------------------------------------------------
	
	//------------------------------eventDynamicColorChange()-----------------------------
	
	//Function called when dragging the slider's handle, its input "slidePercent" is derived from the pointer position
	function eventDynamicColorChange(slidePercent) {
		coreHandle.attr("cx", coreSliderScale(slidePercent)); //Position change for the handle
		coreThreshold = slidePercent*initialGenomesNames.length; //Updates the value of coreThreshold
		console.log(coreThreshold);
		d3.select(".tick").select("text").attr("x", coreSliderScale(slidePercent)).text(Math.round(slidePercent*100) + "%"); //Position change for the label
		d3.select(".hueSwingingPointLeft").attr("offset", coreThreshold/initialGenomesNames.length).attr("stop-color", blueColorScale(coreThreshold)); //The gradient is dynamically changed to display different hues for each extremity of the slider
		d3.select(".hueSwingingPointRight").attr("offset", coreThreshold/initialGenomesNames.length).attr("stop-color", orangeColorScale(coreThreshold));
		blocks.style("fill", function (d) {return thresholdBasedColor(d.presenceCounter,coreThreshold,blueColorScale,orangeColorScale);}); //Updates the core/dispensable panChromosome blocks' colours
		
		//Updating the colours of the miniature browser
		improvedDataMatrix.forEach(d => {
			bgBrowser_miniContext.fillStyle = (Number(d.presenceCounter) === 0 ? "#fff" : (Number(d.presenceCounter) >= coreThreshold ? orangeColorScale.range()[1] : blueColorScale.range()[1]));
			bgBrowser_miniContext.fillRect(Number(d.index)*svgContainer_browsingSlider.attr("width")/improvedDataMatrix.length,0, browsingBlocksDimensions.width, browsingBlocksDimensions.height);
		});
	};
	//------------------------------------------------------------------------------------
	
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	//End of the core slider creation
	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	
	//-------------------------------foreignObject_Browser--------------------------------
	
	//Foreign object allows to incorporate objects that are not SVGs into an SVG window
	//https://gist.github.com/mbostock/1424037
	var foreignObject_Browser = svgContainer_browsingSlider.append("foreignObject")
			.attr("width", svgContainer_browsingSlider.attr("width"))
			.attr("height", browsingBlocksDimensions.height*3 + browsingBlocksDimensions.borderSpace*(3-1))
			.attr("x", 0)
//			.attr("y", 0 - foreignObject_Browser.attr("height")/2) //It has to be centered depending on the canvas and miniature count
			.attr("y", 0 - (browsingBlocksDimensions.height*3 + browsingBlocksDimensions.borderSpace*(3-1))/2) //It has to be centered depending on the canvas and miniature count
			.attr("transform", "translate(" + 0 + "," + svgContainer_browsingSlider.attr("height") / 2 + ")") //The foreign object is centered within svgContainer_browsingSlider
			.attr("class","UFO");
	//------------------------------------------------------------------------------------
	
	//------------------------------browsingHandleDimensions------------------------------
	
	var browsingHandleDimensions = {strokeWidth:3};
	browsingHandleDimensions.height = Number(foreignObject_Browser.attr("height")) + Number(browsingHandleDimensions.strokeWidth)*2; //Normal height + contour
	browsingHandleDimensions.width = svgContainer_browsingSlider.attr("width") * (svgContainer_rawBlocks.attr("width")/(displayedBlocksDimensions.width*Number(improvedDataMatrix.length))); // = SliderWidth * displayWindowWidth/(nbBlocks * BlocksWidth)
	//------------------------------------------------------------------------------------
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	//Creation of a miniature chromosome slider !
	/////////////////////////////////////////////////////////////////////////////////////////////////////////

	//-------------------------------miniatureSliderScale---------------------------------
	
	//Creation of a scale that links value to a position in pixel
	var miniatureSliderScale = d3.scaleLinear() //Attaches to each threshold value a position on the slider
								.domain([0, displayedBlocksDimensions.width*improvedDataMatrix.length - svgContainer_rawBlocks.attr("width")]) //Must be the min and max block positions, with a gap in order to always show blocks, and not empty background when the slider is at the maximum position
								.range([0+browsingHandleDimensions.width/2, svgContainer_browsingSlider.attr("width")-browsingHandleDimensions.width/2]) //Ranges from and to the slider's extreme length values/positions as an output
								//ATTENTION The slider positions correspond to the center of the handle !
								//The margins are dependant of the handle width, which depends on the number of blocks and the window's width
								.clamp(true); //.clamp(true) tells that the domains has 'closed' boundaries, that won't be exceeded
	//------------------------------------------------------------------------------------
	
	//Canvas creation for background of SVG, code from http://bl.ocks.org/boeric/aa80b0048b7e39dd71c8fbe958d1b1d4
	
	//-------------------------------------miniCanvas-------------------------------------
	
	//Addition of the first canvas to the foreignObject
	var bgBrowser_miniCanvas = foreignObject_Browser.append("xhtml:canvas")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", foreignObject_Browser.attr("width"))
		.attr("height", (browsingBlocksDimensions.height + browsingBlocksDimensions.borderSpace)*3);

	//The context of canvas is needed for drawing
	var bgBrowser_miniContext = bgBrowser_miniCanvas.node().getContext("2d");
	
	improvedDataMatrix.forEach(d => {
		bgBrowser_miniContext.fillStyle = (Number(d.presenceCounter) === 0 ? "#fff" : (Number(d.presenceCounter) >= coreThreshold ? orangeColorScale.range()[1] : blueColorScale.range()[1])); //Here we chose a yes/no colorScale instead of the one used in the display, for a better readibility
		bgBrowser_miniContext.fillRect(Number(d.index)*svgContainer_browsingSlider.attr("width")/improvedDataMatrix.length,0, browsingBlocksDimensions.width, browsingBlocksDimensions.height); //fillRect(x, y, width, height)
//		bgBrowser_miniContext.fillRect(Number(d.index)*svgContainer_browsingSlider.attr("width")/improvedDataMatrix.length,0, 10, 10); //fillRect(x, y, width, height)
	});
	
	improvedDataMatrix.forEach(d => {
		bgBrowser_miniContext.fillStyle = pseudoRainbowColorScale(Number(d.FeatureStart));
		bgBrowser_miniContext.fillRect(Number(d.index)*svgContainer_browsingSlider.attr("width")/improvedDataMatrix.length, browsingBlocksDimensions.height+1, browsingBlocksDimensions.width, browsingBlocksDimensions.height);
	});
	
	improvedDataMatrix.forEach(d => {
		bgBrowser_miniContext.fillStyle = purpleColorScale(Number(d.SimilarBlocks.split(";").length));
		bgBrowser_miniContext.fillRect(Number(d.index)*svgContainer_browsingSlider.attr("width")/improvedDataMatrix.length, (browsingBlocksDimensions.height+1)*2, browsingBlocksDimensions.width, browsingBlocksDimensions.height);
	});
	//------------------------------------------------------------------------------------
	

	//-----------------------------------chromSlider--------------------------------------
	
	//Translation of the whole slider object wherever it is required
	var chromSlider = svgContainer_browsingSlider.append("g") //chromSlider is a group within svgContainer_browsingSlider, embedded after the foreign object so that it will appear over it
//									.attr("class", "slider") //With the class "slider", to access it easily (more general than id which must be unique)
									.attr("transform", "translate(" + 0 + "," + svgContainer_browsingSlider.attr("height") / 2 + ")"); //Everything in it will be translated		
	//------------------------------------------------------------------------------------

	//--------------------------------miniatureOverlay------------------------------------
	//Addition of the interactive zone
	chromSlider.append("rect")
		.attr("class", "track-overlay") //Interactivity zone
//		.attr("width", miniatureSliderScale.range()[1])
		.attr("width", svgContainer_browsingSlider.attr("width")) //Clamping should work, not allowing to exceed the position even if the draging zone is wider
		.attr("height", 40)
		.attr("y",0-chromSlider.select(".track-overlay").attr("height")/2) //The "." asks to select the first matching element with the written class. Doing this we can center ther overlay
		.style("fill-opacity",0)
		.attr("cursor", "ew-resize") //The pointer changes for a double edged arrow whenever it reaches that zone
			.call(d3.drag()
				.on("start drag", function() { slidingAlongBlocks(miniatureSliderScale.invert(d3.event.x)); }));
				//invert uses the same scale, but goes from range to domain, can be useful for returning data from mouse position : The container of a drag gesture determines the coordinate system of subsequent drag events, affecting event.x and event.y. The element returned by the container accessor is subsequently passed to d3.mouse or d3.touch, as appropriate, to determine the local coordinates of the pointer.	
	//------------------------------------------------------------------------------------
	
	
	//--------------------------------miniatureHandle-------------------------------------
	//Creation of the mini window handle, thats translates the interaction into visual movement
	var miniWindowHandle = chromSlider.insert("rect", ".track-overlay")
			.attr("class", "handle")
			.style("stroke", d3.hcl(0,0,25))
			.style("stroke-width", browsingHandleDimensions.stroke)
			.attr("width", browsingHandleDimensions.width) //Reminder : the attributes have to be converted in numbers before being added + the width depends on the number of slider shown
			.attr("height", browsingHandleDimensions.height) //ATTENTION The slider should be cut at its extremities so that we always have a full display. IE if position cursor = 0, there is no blank on top of the blocks, and if position = end there is no blank at the bottom
			//Plus the width should be proportionnal to the zoom level and the number of blocks on display and therefore the total number of blocks
			.attr("x", 0)
			.attr("y", 0 - browsingHandleDimensions.height/2)
			.style("fill-opacity", 0);
	//------------------------------------------------------------------------------------

	//------------------------------slidingAlongBlocks()----------------------------------
	//Function called when dragging the slider's handle, its input "xBlockPosition" is derived from the pointer position
	function slidingAlongBlocks(xBlockPosition) {
		miniWindowHandle.attr("x", Number(miniatureSliderScale(xBlockPosition))-browsingHandleDimensions.width/2); //Position change for the handle ATTENTION The scale is useful for not exceeding the max coordinates
		blocksDisplay.selectAll(".moveableBlock").attr("x", d => d.index*displayedBlocksDimensions.width - xBlockPosition);
		blocksDisplay.selectAll(".moveableCircle").attr("cx", d => (d.index+0.5)*displayedBlocksDimensions.width - xBlockPosition);
	};
	//------------------------------------------------------------------------------------
	
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	//End of the browsing slider
	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	//Some code for enter, update and exit things :
	// http://bl.ocks.org/alansmithy/e984477a741bc56db5a5
	// http://d3indepth.com/enterexit/
	// http://synthesis.sbecker.net/articles/2012/07/09/learning-d3-part-2
	
	//Some code for paning and paging http://bl.ocks.org/nicolashery/9627333 ; http://bl.ocks.org/cdagli/728e1f4509671b7de16d5f7f6bfee6f0
	
	//Code for working with canvas and data
	//https://bocoup.com/blog/d3js-and-canvas (2014)
	//https://www.visualcinnamon.com/2015/11/learnings-from-a-d3-js-addict-on-starting-with-canvas.html (2015)
	//https://engineering.mongodb.com/post/d3-round-two-how-to-blend-html5-canvas-with-svg-to-speed-up-rendering (2016)
	
	//How to superimposed canvas and svg
	//http://bl.ocks.org/sxv/4485778
	//http://bl.ocks.org/boeric/aa80b0048b7e39dd71c8fbe958d1b1d4 Embedded canvas in svg
	//Example of foreignObject : https://gist.github.com/jebeck/10699411
	//and the MDN explanations : https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject
	//Using Canvas in SVG : http://www.svgopen.org/2009/papers/12-Using_Canvas_in_SVG/ (2009)
	
	//How to position different div within the same space
	//https://stackoverflow.com/questions/2941189/how-to-overlay-one-div-over-another-div
	
	//More about CSS positions : https://developer.mozilla.org/en-US/docs/Web/CSS/position




	//-------------------------------thresholdBasedColor()--------------------------------
	
	//Creating a function to apply different color Scale depending on one value
	function thresholdBasedColor(d, threshold, colorScaleLess, colorScaleMore) {
		if (d >= threshold) {
			return colorScaleMore(d);
		} return colorScaleLess(d);
	};	
	//------------------------------------------------------------------------------------
	
	//----------------------------matrixPA, attributes & labels---------------------------
	
	//Creation of the subGroup for the PA blocks
	//Creation of the subgroup for the the repeated blocks (cf improvedDataMatrix[`copyPptionIn_Chr${chr}`])
	//ATTENTION The for ... in statement does not work well when order is important ! Prefer .forEach method instead when working on arrays
	//See : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in
	initialGenomesNames.forEach(function(geno, genomeNumber) {
		var matrixPA = blocksDisplay.append("g").attr("id", `presence_${geno}`)
												.selectAll("rect")
													.data(improvedDataMatrix) //There is one rect per (genome x PA block), not just per genome
													.enter()
													.append("rect");
													
		//ATTENTION .attr()+.attr() concatenates and does NOT an addition !!
		var matrixPA_Attributes = matrixPA.attr("class", "moveableBlock")
//											.attr("x", function (d,i) {
//												return Number(blocks.attr("x")) + Number(blocks.attr("width")) + 10 + genomeNumber*blocks.attr("width"); //x is incremented for each new genome
//											})
											.attr("x", (d,i) => d.index*displayedBlocksDimensions.width) //x is incremented for each new PA block, and is reseted to 0 for each genome 'geno'
											.attr("width", displayedBlocksDimensions.width)
											.attr("height", displayedBlocksDimensions.height)
//											.attr("y", (d,i) => i*blocks.attr("height")) //y is incremented for each new PA block, and is reset to 0 for each genome
											.attr("y", (d,i) => genomeNumber*displayedBlocksDimensions.height) //y is incremented for each new genome
											.style("fill", d => functionColorScale(d["Function"])) //Do not forget the ""...
											.style("fill-opacity", d => d[`${geno}`]); //Opacity is linked to the value 0 or 1 of every genome
		
		var genomeLabels = svgContainer_labelsAndTree.append("text").attr("id", `${geno} label`).attr("font-family", "sans-serif").attr("font-size", "10px")
					.attr("y", (d,i) => (genomeNumber+0.5)*displayedBlocksDimensions.height).attr("dominant-baseline", "middle") //As y is the baseline for the text, we have to add the block height once more, /2 to center the label
					.attr("x",svgContainer_labelsAndTree.attr("width")-3).attr("text-anchor", "end")
					.text(function() {
						return `${geno}`;
					});
	});

	//------------------------------------------------------------------------------------
	
	//---------------------------------blocks & attributes--------------------------------
	
	//Binding the data to a DOM element, therefore creating one SVG block per data
	var blocks = blocksDisplay.append("g").attr("id","panChromosome_coreVSdispensable") //.append("g") allows grouping svg objects
								.selectAll("rect") //First an empty selection of all not yet existing rectangles
									.data(improvedDataMatrix)//Joining data to the selection, one rectangle for each as there is no key. It returns 3 virtual selections : enter, update, exit. The enter selection contains placeholder for any missing element. The update selection contains existing elements, bound to data. Any remaining elements ends up in the exit selection for removal.
									.enter() //The D3.js Enter Method returns the virtual enter selection from the Data Operator. This method only works on the Data Operator because the Data Operator is the only one that returns three virtual selections. However, it is important to note that this reference only allows chaining of append, insert and select operators to be used on it.
									.append("rect"); //For each placeholder element created in the previous step, a rectangle element is inserted.
								
								//For more about joins, see : https://bost.ocks.org/mike/join/

	//Selecting all previous blocks, and determining their attributes
	var blocks_Attributes = blocks.attr("class", "moveableBlock")
//									.attr("x", Number(rainbowBlocks.attr("x"))+Number(rainbowBlocks.attr("width"))+3)
									.attr("x", (d,i) => d.index*displayedBlocksDimensions.width) //y position is index * block height
									.attr("width", displayedBlocksDimensions.width)
									.attr("height", displayedBlocksDimensions.height)
//									.attr("y", function(d,i){return i*blocks.attr("height");}) //y position is index * block height
									.attr("y", initialGenomesNames.length*displayedBlocksDimensions.height + 6)
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
			color.l += (100-color.l)*0.5; //Slight increase in luminance without exceeding white
			return color;
		});
		//Here, d is a block object from improvedDataMatrix, i is its index within the array
		//To access values of a block, we need to take "this" as an argument

		//alert(d + " " + i);

		//Specifies where to put label of text altogether with its properties
		svgContainer_rawBlocks.append("text")
					.attr("id", "t" + d.presenceCounter + "-" + d.index)
					.attr("font-family", "sans-serif")
					.attr("x", svgContainer_rawBlocks.attr("width")+1) //At first the text is not displayed in order to get its dimensions first
					.attr("y", Number(d3.select(this).attr("y")) + displayedBlocksDimensions.height*2)
					//ATTENTION The text should not appear where the mouse pointer is, in order to not disrupt the mouseover event
					.attr("dominant-baseline", "middle") //Vertical alignment, can take many different arguments other than "middle"
					.attr("text-anchor", "start") //Can be "start", "middle", or "end"
					.text(function() {
						return "This block appears in " + d.presenceCounter + " selected genome(s)";  //Text content
					});
		
		//Getting the text shape, see : https://bl.ocks.org/mbostock/1160929 and http://bl.ocks.org/andreaskoller/7674031
		var bbox = d3.select("#t" + d.presenceCounter + "-" + d.index).node().getBBox(); //Do not know exactly why but node() is needed
		
		d3.select("#t" + d.presenceCounter + "-" + d.index).attr("x", function(d) {
																	if (d3.mouse(this)[0] < bbox.width/2 + 2) { //d3.event.x works only for drag events, not for cursor coordinates
																		return 2; //Leaving space for the background rectangle
																	} else if (d3.mouse(this)[0] > svgContainer_rawBlocks.attr("width") - (bbox.width/2+2)){
																		return svgContainer_rawBlocks.attr("width") - (bbox.width+2);
																	} else { return d3.mouse(this)[0] - bbox.width/2 }
																});

		svgContainer_rawBlocks.insert("rect", "#t" + d.presenceCounter + "-" + d.index)
			.attr("id", "t" + d.presenceCounter + "-" + d.index + "bg")
				.attr("x", d3.select("#t" + d.presenceCounter + "-" + d.index).attr("x") - 2) //as bbox was created before the text was correctly placed, we cannot use bbox.x
				.attr("y", bbox.y - 2)
				.attr("width", bbox.width + 4)
				.attr("height", bbox.height + 4)
				.style("fill", d3.hcl(83, 4, 96))
				.style("fill-opacity", "0.9")
				.style("stroke", d3.hcl(86, 5, 80))
				.style("stroke-opacity", "0.9");
	};
	//How to trim elements that exceeds a certain length : https://blog.mastykarz.nl/measuring-the-length-of-a-string-in-pixels-using-javascript/
	//------------------------------------------------------------------------------------

	//---------------------------------eventDisplayInfoOff()------------------------------
	
	function eventDisplayInfoOff(d, i) {
		//Uses D3 to select element, change color back to normal by overwriting and not recovery
		d3.select(this).style("fill",function (d) {return thresholdBasedColor(d.presenceCounter,coreThreshold,blueColorScale,orangeColorScale);});

		//Selects text by id and then removes it
		d3.select("#t" + d.presenceCounter + "-" + d.index).remove();  // Remove text location slecting the id thanks to #
		d3.select("#t" + d.presenceCounter + "-" + d.index + "bg").remove();
	};
	//------------------------------------------------------------------------------------
	
	//-----------------------------rainbowBlocks & attributes-----------------------------
	
	//Binding the data to a DOM element, therefore creating one SVG block per data
	var rainbowBlocks = blocksDisplay.append("g").attr("id","panChromosome_Rainbowed")
								.selectAll("rect")
									.data(improvedDataMatrix)
									.enter()
									.append("rect");

	//Selecting all previous blocks, and determining their attributes
	var rainbowBlocks_Attributes = rainbowBlocks.attr("class", "moveableBlock")
//									.attr("x", Number(similarBlocks.attr("x"))+Number(similarBlocks.attr("width"))+3)
									.attr("x", (d,i) => d.index*displayedBlocksDimensions.width) //x position is index * block width
									.attr("width", displayedBlocksDimensions.width)
									.attr("height", displayedBlocksDimensions.height)
//									.attr("y", function(d,i){return i*rainbowBlocks.attr("height");}) //y position is index * block height
									.attr("y", Number(blocks.attr("y")) + displayedBlocksDimensions.height + 3)
//									.style("fill", (d => pseudoRainbowColorScale(Number(d.ID_Position.split(":")[1]))));
									.style("fill", (d => pseudoRainbowColorScale(Number(d.FeatureStart))));
	//------------------------------------------------------------------------------------	
	
	//-----------------------------similarBlocks & attributes-----------------------------
	
	//Binding the data to a DOM element, therefore creating one SVG block per data
	var similarBlocks = blocksDisplay.append("g").attr("id","panChromosome_similarCount")
								.selectAll("rect")
									.data(improvedDataMatrix)
									.enter()
									.append("rect");

	//Selecting all previous blocks, and determining their attributes
	var similarBlocks_Attributes = similarBlocks.attr("class", "moveableBlock")
//									.attr("x", Number(structureBackground.attr("width")))
									.attr("x", (d,i) => d.index*displayedBlocksDimensions.width) //x position is index * block width
									.attr("width", displayedBlocksDimensions.width)
									.attr("height", displayedBlocksDimensions.height)
//									.attr("y", function(d,i){return i*similarBlocks.attr("height");}) //y position is index * block height
									.attr("y", Number(rainbowBlocks.attr("y")) + displayedBlocksDimensions.height + 3)
									.style("fill", (d => purpleColorScale(d.SimilarBlocks.split(";").length)));
//									.style("fill", (d => purpleColorScale((d.SimilarBlocks.split(";").length != 1 ? d.SimilarBlocks.split(";").length : 0))));
	//------------------------------------------------------------------------------------
	
	//--------------------------structureBackground & attributes--------------------------
	
	//Creation of the subgroup for the StructureBackground
	var structureBackground = blocksDisplay.append("g").attr("id", "structureBackground")
														.selectAll("rect")
															.data(improvedDataMatrix)
															.enter()
															.append("rect");

	//Attributes for structureBackground
	var structureBackground_Attributes = structureBackground.attr("class", "moveableBlock")
															.attr("x", (d,i) => d.index*displayedBlocksDimensions.width)
															.attr("y", Number(similarBlocks.attr("y")) + displayedBlocksDimensions.height)
															.attr("width", displayedBlocksDimensions.width)
															.attr("height", (nbChromosomes+3)*displayedBlocksDimensions.height)
															.style("fill", function (d) {var color = d3.hcl(purpleColorScale(d.SimilarBlocks.split(";").length));
																color.c = color.c*0.65; //Reducing the chroma (ie 'colorness')
																color.l += (100-color.l)*0.3; //Augmenting the lightness without exceeding white's
																return color;
															});
	//------------------------------------------------------------------------------------

	//------------------------------copyCircles & attributes------------------------------
	
	//Creation of the subgroup for the the repeated blocks (cf improvedDataMatrix[`copyPptionIn_Chr${chr}`])
	//Here we could do a forEach loop with every Chr name or ID
	for (var chr = 0; chr < nbChromosomes; chr++) {
		var copyCircles = blocksDisplay.append("g").attr("id", `duplicationCircles_Chr${chr}`)
													.selectAll("circle")
														.data(improvedDataMatrix)
														.enter()
														.append("circle");
		
		var copyCircles_Attributes = copyCircles.attr("class", "moveableCircle")
												.attr("cy", (d,i) => Number(structureBackground.attr("y")) + ((3+0.5)+chr)*displayedBlocksDimensions.height) //3+0.5 as there is space between the central panChromosome and the pption information : 3 rows of free space, plus 0.5 for centering the circles
												.attr("cx", (d,i) => (d.index+0.5)*displayedBlocksDimensions.width) //Depends on the data index, and the blocks width; the 0.5 centers the circle within a block
												.attr("r", (d => d[`copyPptionIn_Chr${chr}`]*((displayedBlocksDimensions.width/2-1)-1)+1)) //Depends on the data value; rmax = displayedBlocksDimensions.width/2-1, rmin = 1
												.style("fill", d3.hcl(0,0,25))
												.style("fill-opacity", d => (d[`copyPptionIn_Chr${chr}`] > 0 ? 1 : 0.20));//A one line 'if' statement
	};
	//------------------------------------------------------------------------------------

});