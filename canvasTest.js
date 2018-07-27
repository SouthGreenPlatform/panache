//d3.dsv("\t","miniFakeDataWithAllBlocks.tsv").then(function(realPanMatrix) {
d3.dsv("\t","myFakePanData.tsv").then(function(realPanMatrix) {	
	//How to dynamically create a canvas element : https://stackoverflow.com/questions/10652513/html5-dynamically-create-canvas
	console.log(realPanMatrix);
	
	
	var improvedDataMatrix = realPanMatrix.map(function(d,i) {
		newObject = Object.assign({"index": i}, d);
		return newObject;
	});
	
	
	
	
	//--------------------------------domainPivotsMaker()---------------------------------
	
	function domainPivotsMaker(breakpointsNb,maxValue) {
		breakpoints = [];
		for (var i = 0; i < breakpointsNb; i++) {
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
	
	
	
	
	var pseudoRainbowList = [d3.rgb(0,90,200), d3.rgb(0,200,250), d3.rgb(120,50,40), d3.rgb(190,140,60), d3.rgb(240,240,50), d3.rgb(160, 250,130)]
	var pseudoRainbowColorScale = colorScaleMaker(domainPivotsMaker(pseudoRainbowList.length,Math.max(...improvedDataMatrix.map(d => Number(d.FeatureStart)))), pseudoRainbowList);
	
	
	
//-----------------------CANVAS CREATION----------------------------------------------------	
	
	var myFrenchCanvas = document.createElement('canvas');

	myFrenchCanvas.id = "myFrenchCanvas";
	myFrenchCanvas.width = 700;
	myFrenchCanvas.height = 700;
	
	var body = document.getElementsByTagName("body")[0];
	body.appendChild(myFrenchCanvas);

	// get the canvas drawing context
	const context = myFrenchCanvas.getContext('2d');
	
	// clear the canvas from previous drawing
	context.clearRect(0, 0, myFrenchCanvas.width, myFrenchCanvas.height);
	
	context.fillStyle = "rgba(255, 0, 0, 0.2)";
	context.fillRect(0, 0, 30, 20); //fillRect(x, y, width, height)
	context.strokeRect(30, 20, 30, 20); //fillRect(x, y, width, height)

	context.beginPath();//On démarre un nouveau tracé
		context.moveTo(60, 40);//On se déplace au coin inférieur gauche
		context.lineTo(90, 0);
		context.lineTo(120, 40);
		context.lineTo(60, 40);
		context.stroke();//On trace seulement les lignes.
		context.closePath();
	
	context.beginPath();//On démarre un nouveau tracé //Chaining methods will not work, it is not implemented with canvas !
		context.moveTo(0, 20);//On se déplace au coin inférieur gauche
		context.lineTo(30, 20);
		context.lineTo(15, 30);
		context.lineTo(0, 20);
		context.fill();//On trace seulement les lignes.
		context.closePath();		

	improvedDataMatrix.forEach(d => {
//		context.fillStyle = "red"
		context.fillStyle = pseudoRainbowColorScale(Number(d.FeatureStart));
//		context.fillRect(10, 0, 10, 20);
		context.fillRect(Number(d.index)*10, 0, 10, 20);
		
	});
	
	

	
});