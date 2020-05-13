import {domainPivotsMaker, colorScaleMaker, thresholdBasedColor} from './modules/colorScales.mjs';
import * as drawBlock from './modules/blockLevel/drawing.mjs';
import * as eventsImported from './modules/events.mjs';

var fileSelector = d3.select("body")
  .append("input")
  .attr("type","file")
  .attr("id","fileSelector")
  .on("change", eventFileSelection);

function eventFileSelection() {
  if (window.File && window.FileReader && window.FileList && window.Blob) {
  } else {
    alert('The File APIs are not fully supported in this browser.');
  }

  let inputFile = d3.event.target.files[0];
  let reader = new FileReader();

  //lancement du render
  reader.onload = function(event) {
	  renderD3Visualisation(event.target.result);
  }
  reader.readAsDataURL(inputFile);
}

// point de départ dessin de tout
function renderD3Visualisation(file_URL) {
  d3.dsv("\t",file_URL).then(function(realPanMatrix) {

    d3.select("#fileSelector").remove();

	  const CHROMOSOME_NAMES =
      [...new Set(realPanMatrix.map( d => d["#Chromosome"]))];

    const INITIAL_GENOMES_NAMES = Object.getOwnPropertyNames(realPanMatrix[0])
      .slice(6,);

    var functionDiversity = [...new Set(realPanMatrix.map( d => d.Function))];

    //nettoyage du jeu de donnée
    var improvedDataMatrix = realPanMatrix.map(function(d,i) {
     
      const {"#Chromosome" : Chromosome, FeatureStart, FeatureStop,
        Sequence_IUPAC_Plus,SimilarBlocks, Function, ...rest} = d;
      delete d["#Chromosome"];

      let panChrBlockCount = [0].concat(Object.values(rest))
        .reduce((acc, val) => acc + (Number(val) != 0 ? 1 : 0));
      let newObject = Object.assign({"index": FeatureStart,
        "presenceCounter": panChrBlockCount, "Chromosome": Chromosome}, d);

      let concernedChromosomes = [];
      d.SimilarBlocks.split(";")
        .forEach(copy => concernedChromosomes.push(copy.split(":")[0]));

      let countAsProperty = {};
      CHROMOSOME_NAMES.forEach(chromName => countAsProperty[`${chromName}`] = 0);
      concernedChromosomes.forEach(function(chromName) {
        if (undefined != countAsProperty[chromName]) {
          countAsProperty[chromName] += 1;
        }
      });

      let maxCount = Math.max(...Object.values(countAsProperty));
      for (let i = 0; i < CHROMOSOME_NAMES.length; ++i) {
        newObject[`copyPptionIn_Chr${i}`] =
          (maxCount > 0 ? countAsProperty[`${CHROMOSOME_NAMES[i]}`]/maxCount : 0);
      }

      return newObject;
    });

    console.log(improvedDataMatrix);

    var dataGroupedPerChromosome = {};
    CHROMOSOME_NAMES.forEach(function(chr) {
      dataGroupedPerChromosome[`${chr}`] =
        improvedDataMatrix.filter(data => data.Chromosome === chr);
      dataGroupedPerChromosome[`${chr}`].forEach(d => delete d.Chromosome);
    });

    var currentChromInView =
      Object.getOwnPropertyNames(dataGroupedPerChromosome)[0];

    if (functionDiversity.length === 1) {
      var correspondancePosColor = new Map();
      dataGroupedPerChromosome[`${currentChromInView}`].forEach( function(d,i) {
        correspondancePosColor.set(d.FeatureStart, i);
      });
    };

    var currentWidestFeatureLength =
      Math.max(...dataGroupedPerChromosome[`${currentChromInView}`]
        .map( d => Number(d.FeatureStop) - Number(d.FeatureStart) ));

    var maxPositionInNucleotide = Math.max(...dataGroupedPerChromosome[`${currentChromInView}`].map(d => Number(d.FeatureStop)));

    var blueColorScale = colorScaleMaker([0, INITIAL_GENOMES_NAMES.length],
      [d3.hcl(246, 0, 95), d3.hcl(246, 65, 70)]);

    var orangeColorScale = colorScaleMaker([0, INITIAL_GENOMES_NAMES.length],
      [d3.hcl(60, 0, 95), d3.hcl(60, 65, 70)]);

    var highestRepNumber =
      Math.max(...dataGroupedPerChromosome[`${currentChromInView}`]
        .map(d => d.SimilarBlocks.split(";").length));

    var greenColorScale = colorScaleMaker([1, highestRepNumber],
      [d3.hcl(120, 2, 97), d3.hcl(125, 85, 54)]);

    var pseudoRainbowList = [d3.rgb(0, 90, 200), d3.rgb(0, 200, 250),
      d3.rgb(120, 50, 40), d3.rgb(190, 140, 60), d3.rgb(240, 240, 50),
      d3.rgb(160, 250,130)];

    var lastBlockStart =
      Math.max(...dataGroupedPerChromosome[`${currentChromInView}`]
        .map(d => Number(d.FeatureStart)));

    var pivotsForRainbow =
      domainPivotsMaker(pseudoRainbowList.length, lastBlockStart);

    var pseudoRainbowColorScale =
      colorScaleMaker(pivotsForRainbow, pseudoRainbowList);

    var colorsForFunctions =
      domainPivotsMaker(functionDiversity.length, functionDiversity.length)
      .map(intNum => d3.interpolateRainbow(intNum / (functionDiversity.length + 1)));

    var functionColorScale =
      colorScaleMaker(functionDiversity, colorsForFunctions, false);

    var coreThreshold = 85/100 * INITIAL_GENOMES_NAMES.length;

    const WINDOW_WIDTH = window.innerWidth, WINDOW_HEIGHT = window.innerHeight;

    var displayedBlocksDimensions = {width:12, height:14};

    function svgContainerMaker(id, height, width, left, top, position = "absolute", where = "body") {
      let mySelection = d3.select(where)
        .append("svg")
        .attr("id", id)
        .attr("class", "svgContainer")
        .attr("height", height)
        .attr("width", width)
        .style("left", left + "px")
        .style("position", position)
        .style("top", top + "px");
      return mySelection;
    };

    var svgContainer_coreSlider = svgContainerMaker(
      "svgContainer_coreSlider",
      95,
      210,
      0,
      5
    );

    var svgContainer_browsingSlider = svgContainerMaker(
      "svgContainer_browsingSlider",
      95,
      WINDOW_WIDTH - Number(svgContainer_coreSlider.attr("width")) - 10,
      svgContainer_coreSlider.attr("width"),
      5
    );

    var svgContainer_genomesTree = svgContainerMaker(
      "svgContainer_genomesTree",

      (displayedBlocksDimensions.height * INITIAL_GENOMES_NAMES.length <= (WINDOW_HEIGHT * 0.95 - svgContainer_coreSlider.attr("height")) / 3 ? displayedBlocksDimensions.height * INITIAL_GENOMES_NAMES.length : (WINDOW_HEIGHT * 0.95 - svgContainer_coreSlider.attr("height")) / 3),

      svgContainer_coreSlider.attr("width"),

      svgContainer_coreSlider.style("left").split("px")[0],
      Number(svgContainer_coreSlider.attr("height")) + 5
    );
    var svgContainer_presenceAbsenceMatrix = svgContainerMaker(
      "svgContainer_presenceAbsenceMatrix",
      svgContainer_genomesTree.attr("height"),
      svgContainer_browsingSlider.attr("width"),
      svgContainer_browsingSlider.style("left").split("px")[0],
      svgContainer_genomesTree.style("top").split("px")[0]
    );

    var svgContainer_legends = svgContainerMaker(
      "svgContainer_legends",
      WINDOW_HEIGHT * (1 - 0.05) - svgContainer_coreSlider.attr("height") - svgContainer_genomesTree.attr("height"),
      svgContainer_coreSlider.attr("width"),
      svgContainer_coreSlider.style("left").split("px")[0],
      Number(svgContainer_coreSlider.attr("height"))+Number(svgContainer_genomesTree.attr("height"))+10
    );

    var svgContainer_rawBlocks = svgContainerMaker(
      "svgContainer_rawBlocks",
      svgContainer_legends.attr("height"),
      svgContainer_browsingSlider.attr("width"),
      svgContainer_browsingSlider.style("left").split("px")[0],
      svgContainer_legends.style("top").split("px")[0]
    );

    function ntWidthDependingOnFeatureNb(WINDOW_WIDTH, nbFeature2Display, dataset) {
      let meanWidthOfFeatures =
        dataset.map( d => Number(d.FeatureStop) - Number(d.FeatureStart))
        .reduce( (acc, val) => acc + val) / dataset.length;
      let widthOfNucleotide = WINDOW_WIDTH / (nbFeature2Display * meanWidthOfFeatures);
      return widthOfNucleotide;
    };

    function featureNbDependingOnNtWidth(WINDOW_WIDTH, nucleotideWidth, dataset) {
      let meanWidthOfFeatures =
        dataset.map( d => Number(d.FeatureStop) - Number(d.FeatureStart))
        .reduce( (acc, val) => acc + val) / dataset.length;
        let nbOfFeatures = WINDOW_WIDTH /(nucleotideWidth * meanWidthOfFeatures);
      return nbOfFeatures;
    };
    
    var currentNucleotidesWidthInPixel = {};

    currentNucleotidesWidthInPixel.minGlobal =
      Number(svgContainer_presenceAbsenceMatrix.attr("width")) / maxPositionInNucleotide;

    let ntWidthFor150Features =
      ntWidthDependingOnFeatureNb(Number(svgContainer_presenceAbsenceMatrix.attr("width")),
      150,
      dataGroupedPerChromosome[`${currentChromInView}`]
    );
    currentNucleotidesWidthInPixel.minEfficiency =
      (ntWidthFor150Features > currentNucleotidesWidthInPixel.minGlobal ? ntWidthFor150Features : currentNucleotidesWidthInPixel.minGlobal * 1.001 );

    currentNucleotidesWidthInPixel.max = 10;

    let ntWidthForTenthOfTheFeatures =
      ntWidthDependingOnFeatureNb(Number(svgContainer_presenceAbsenceMatrix.attr("width")),
      0.1*dataGroupedPerChromosome[`${currentChromInView}`].length,
      dataGroupedPerChromosome[`${currentChromInView}`]
    );
    currentNucleotidesWidthInPixel.effective =
      ( ntWidthForTenthOfTheFeatures < currentNucleotidesWidthInPixel.minEfficiency ? currentNucleotidesWidthInPixel.minEfficiency : ntWidthForTenthOfTheFeatures );

    var coreSliderGradient = svgContainer_rawBlocks.append("defs")
                      .append("linearGradient")
                      .attr("id", "coreSliderGradient")
                      .attr("x1", 0)
                      .attr("x2", 1)
                      .attr("y1", 0)
                      .attr("y2", 0);

    coreSliderGradient.append("stop")
              .attr("offset", 0)
              .attr("stop-color", blueColorScale.range()[0])
            .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
              .attr("class", "hueSwingingPointLeft")
              .attr("offset", coreThreshold/INITIAL_GENOMES_NAMES.length)
              .attr("stop-color", blueColorScale(coreThreshold))
            .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
              .attr("class", "hueSwingingPointRight")
              .attr("stop-color", orangeColorScale(coreThreshold))
            .select(function() { return this.parentNode; }).append("stop")
              .attr("offset", 1)
              .attr("stop-color", orangeColorScale.range()[1]);

    var repeatsBgLabelGradient = svgContainer_rawBlocks.select("defs")
                      .append("linearGradient")
                      .attr("id", "repeatsBgLabelGradient_Left")
                      .attr("x1", 0)
                      .attr("x2", 1)
                      .attr("y1", 0)
                      .attr("y2", 0);

    repeatsBgLabelGradient.append("stop")
              .attr("offset", 0)
              .attr("stop-color", "white")
            .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
              .attr("offset", 0.6)
              .attr("stop-color", "white")
            .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
              .attr("offset", 1)
              .attr("stop-color", "#ffffff00");

    svgContainer_rawBlocks.select("defs")
                .append("linearGradient")
                .attr("href", "#repeatsBgLabelGradient_Left")
                .attr("id", "repeatsBgLabelGradient_Right")
                .attr("x1", 1)
                .attr("x2", 0);

    var blocksDisplay = svgContainer_rawBlocks.append("g")
                      .attr("id", "blocksDisplay")

    var browsingBlocksDimensions = {width:(svgContainer_browsingSlider.attr("width")/dataGroupedPerChromosome[`${currentChromInView}`].length)+1, height:10, borderSpace:1}
 
    
// creation du slider en haut a gauche
    var coreSliderScale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, 100])
        .clamp(true); 

    var coreSlider = svgContainer_coreSlider.append("g")
                    .attr("transform", "translate(" + (svgContainer_coreSlider.attr("width")-coreSliderScale.range()[1]) / 2 + "," + 34 + ")"); //Everything in it will be translated

    var coreSliderArea = d3.area()
      .x(function(d) { return d[0]; })
      .y0(function(d) { return d[1]; })
      .y1(function(d) { return d[2]; })
      .curve(d3.curveMonotoneY); 

    coreSlider.append("path")
        .datum([[coreSliderScale.range()[0]-4,0,0],[coreSliderScale.range()[0],4,-4],[coreSliderScale.range()[1],4,-4],[coreSliderScale.range()[1]+4,0,0]])
        .attr("fill", "url(#coreSliderGradient)") 
        .attr("d", coreSliderArea)
        .attr("stroke", "#000")
        .attr("stroke-opacity", 0.3)

    coreSlider.append("circle").attr("r",4).attr("cx",(coreSliderScale.range()[0]-4)-4*2.5).attr("cy",0).style("fill",blueColorScale.range()[1]);
    coreSlider.append("circle").attr("r",4).attr("cx",(coreSliderScale.range()[1]+4)+4*2.5).attr("cy",0).style("fill",orangeColorScale.range()[1]);

    coreSlider.append("line")
      .attr("class", "track-overlay") 
      .attr("x1", coreSliderScale.range()[0]) 
      .attr("x2", coreSliderScale.range()[1]) 
      .attr("stroke-linecap","round") 
      .attr("stroke-width", "30px") 
      .attr("stroke", "transparent") 
      .attr("cursor", "crosshair") 
        .call(d3.drag()  
          .on("start drag", function() { eventDynamicColorChange(coreSliderScale.invert(d3.event.x)); })); 

    var coreHandle = coreSlider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 7)
        .attr("fill", "#fff")
        .attr("stroke", "#000")
        .attr("cx", coreThreshold/INITIAL_GENOMES_NAMES.length*100)
        .attr("stroke-opacity", 0.3)
        .attr("stroke-width", "1.25px");

    coreSlider.insert("g", ".track-overlay")
        .attr("class", "tick")
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px")
        .attr("transform", "translate(0 18)")
        .append("text").attr("x", coreHandle.attr("cx")).attr("text-anchor", "middle").text(coreHandle.attr("cx")+"%");

    coreSlider.insert("text", ".track-overlay")
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px")
        .attr("transform", "translate("+coreSliderScale.range()[1]/2+",0)")
        .attr("dy","-1.3em")
        .attr("text-anchor", "middle")
        .append("tspan")
          .text("to be part of ")
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
          .text("Core")
          .style("fill",d3.hcl(60,65,70))
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
          .attr("x", 0)
          .text("Minimal Presence ratio")
          .attr("dy","-1.2em")
          .style("fill", "black");


          // gere le filtre qui change les couleurs des blocs bleu et orange, recup info du slider a gauche de la miniature
    function eventDynamicColorChange(slidePercent) {
      coreHandle.attr("cx", coreSliderScale(slidePercent));
      coreThreshold = slidePercent*INITIAL_GENOMES_NAMES.length;
      d3.select(".tick").select("text").attr("x", coreSliderScale(slidePercent)).text(Math.round(slidePercent*100) + "%");
      d3.select(".hueSwingingPointLeft").attr("offset", coreThreshold/INITIAL_GENOMES_NAMES.length).attr("stop-color", blueColorScale(coreThreshold));
      d3.select(".hueSwingingPointRight").attr("offset", coreThreshold/INITIAL_GENOMES_NAMES.length).attr("stop-color", orangeColorScale(coreThreshold));
      d3.select("#panChromosome_coreVSdispensable").selectAll("rect").style("fill", function (d) {return thresholdBasedColor(d.presenceCounter,coreThreshold,blueColorScale,orangeColorScale);});


      bgBrowser_miniContext.fillStyle = "#fff";
      bgBrowser_miniContext.fillRect(0,2*browsingBlocksDimensions.height+6, svgContainer_browsingSlider.attr("width"), browsingBlocksDimensions.height);

      dataGroupedPerChromosome[`${currentChromInView}`].forEach(d => {
        bgBrowser_miniContext.fillStyle = (Number(d.presenceCounter) === 0 ? "#fff" : (Number(d.presenceCounter) >= coreThreshold ? orangeColorScale.range()[1] : blueColorScale.range()[1]));
        bgBrowser_miniContext.fillRect(svgContainer_browsingSlider.attr("width") * Number(d.index)/maxPositionInNucleotide,2*browsingBlocksDimensions.height+6, svgContainer_browsingSlider.attr("width") * (Number(d.FeatureStop)-Number(d.FeatureStart))/maxPositionInNucleotide+1, browsingBlocksDimensions.height);
      });
    };
    
    var foreignObject_Browser = d3.select("body").append("div")
        .attr("width", svgContainer_browsingSlider.attr("width"))
        .attr("height", browsingBlocksDimensions.height*6 + browsingBlocksDimensions.borderSpace*(6-1))
        .attr("class","UFO")
        .style("top", svgContainer_browsingSlider.style('top'))
        .style("left", svgContainer_browsingSlider.style('left'))
        .style("position", "absolute")
        .style("z-index", -1);

        // position du slider rectangle
    var browsingHandleDimensions = {strokeWidth:3};
    browsingHandleDimensions.height = browsingBlocksDimensions.height*3 + browsingBlocksDimensions.borderSpace*(3-1) + Number(browsingHandleDimensions.strokeWidth)*2;

    browsingHandleDimensions.width = svgContainer_browsingSlider.attr("width") * (svgContainer_rawBlocks.attr("width")/(maxPositionInNucleotide*currentNucleotidesWidthInPixel.effective));

    var miniatureSliderScale = d3.scaleLinear() 
                  .domain([0, maxPositionInNucleotide*currentNucleotidesWidthInPixel.effective - svgContainer_rawBlocks.attr("width")]) 
                  .range([0+browsingHandleDimensions.width/2, svgContainer_browsingSlider.attr("width")-browsingHandleDimensions.width/2]) 
                  .clamp(true); 

    var bgBrowser_miniCanvas = foreignObject_Browser.append("xhtml:canvas")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", foreignObject_Browser.attr("width"))
      .attr("height", (browsingBlocksDimensions.height + browsingBlocksDimensions.borderSpace)*6);

    var bgBrowser_miniContext = bgBrowser_miniCanvas.node().getContext("2d");

    //premier render de la miniature
    drawBlock.miniatureBg(
      bgBrowser_miniCanvas,
      bgBrowser_miniContext,
      dataGroupedPerChromosome[`${currentChromInView}`],
      svgContainer_browsingSlider.attr("width"),
      maxPositionInNucleotide,
      INITIAL_GENOMES_NAMES,
      browsingBlocksDimensions,
      coreThreshold,
      functionDiversity,
      correspondancePosColor,
      functionColorScale,
      orangeColorScale,
      blueColorScale,
      pseudoRainbowColorScale,
      greenColorScale);


    var chromSlider = svgContainer_browsingSlider.append("g");

    chromSlider.append("rect")
      .attr("class", "track-overlay")
      .attr("width", svgContainer_browsingSlider.attr("width"))
      .attr("height", 40)
      .attr("y",2*browsingBlocksDimensions.height+6 -4)
      .style("fill-opacity",0)
      .attr("cursor", "ew-resize")
        .call(d3.drag()
          .on("start drag", function() { slidingAlongBlocks(miniatureSliderScale.invert(d3.event.x)); }));
         
    var miniWindowHandle = chromSlider.insert("rect", ".track-overlay")
        .attr("class", "handle")
        .style("stroke", d3.hcl(0,0,25))
        .style("stroke-width", browsingHandleDimensions.stroke)
        .attr("width", browsingHandleDimensions.width) 
        .attr("height", browsingHandleDimensions.height) 
        .attr("x", 0)
        .attr("y", 2*browsingBlocksDimensions.height+6 - 3)
        .style("position", "absolute")
        .style("fill-opacity", 0);


        // fenetre principale, matrice colorée
    function drawingDisplay_Window(fullChrData, maxWidth, handle, genomesList, chromList, nucleotideWidth){
      
      let underThresholdArray = fullChrData.filter( d => (Number(d.index) <= miniatureTicksScale.invert(handle.attr("x")) && (Number(d.index) >= miniatureTicksScale.invert(handle.attr("x"))-maxWidth) ));

      let elementsWithIndexesWithinWindow = fullChrData.filter( d => ( (Number(d.index) >= miniatureTicksScale.invert(Number(handle.attr("x"))) ) && (Number(d.index) <= miniatureTicksScale.invert(Number(handle.attr("x"))+Number(handle.attr("width"))) ) ));

      let dataFiltered2View = [fullChrData[0]];

      if (underThresholdArray.length != 0) {
        dataFiltered2View = [underThresholdArray[underThresholdArray.length-1]]; 
      };
      elementsWithIndexesWithinWindow.forEach( d => dataFiltered2View.push(d) ); 

      genomesList.forEach((geno, genomeNumber) => drawBlock.pavBlocks(geno,
        genomeNumber,
        dataFiltered2View,
        nucleotideWidth,
        displayedBlocksDimensions,
        presenceAbsenceMatrixSliderScale,
        scrollingBar_PresenceAbsenceHandle,
        functionDiversity,
        correspondancePosColor,
        functionColorScale));

      drawBlock.trackCoreDisp("#panChromosome_coreVSdispensable",
        dataFiltered2View,
        nucleotideWidth,
        displayedBlocksDimensions,
        0,
        function(d) {eventsImported.eventDisplayInfoOn(this, svgContainer_rawBlocks, d)},
        function(d) {eventsImported.eventDisplayInfoOff(this, d)},
        coreThreshold,
        blueColorScale,
        orangeColorScale)

      drawBlock.trackPosition("#panChromosome_rainbowed",
        dataFiltered2View,
        nucleotideWidth,
        displayedBlocksDimensions,
        Number(d3.select("#panChromosome_coreVSdispensable").selectAll("rect").attr("y")) + displayedBlocksDimensions.height + 3,
        function(d) {eventsImported.eventDisplayInfoOn(this, svgContainer_rawBlocks, d)},
        function(d) {eventsImported.eventDisplayInfoOff(this, d)},
        pseudoRainbowColorScale);

      drawBlock.trackOccurences("#panChromosome_similarCount",
        dataFiltered2View,
        nucleotideWidth,
        displayedBlocksDimensions,
        Number(d3.select("#panChromosome_rainbowed").selectAll("rect").attr("y")) + displayedBlocksDimensions.height + 3,
        function(d) {eventsImported.eventDisplayInfoOn(this, svgContainer_rawBlocks, d)},
        function(d) {eventsImported.eventDisplayInfoOff(this, d)},
        greenColorScale);
      for (let chr = 0; chr < chromList.length; ++chr) {drawingDisplay_similarityBoxes(chr, dataFiltered2View, nucleotideWidth);};
    };


    function slidingAlongBlocks(xPosition_displayedPixel) {
      let mouse_xPosition = Number(miniatureSliderScale(xPosition_displayedPixel));

      miniWindowHandle.attr("x", mouse_xPosition - browsingHandleDimensions.width/2);

      drawingDisplay_Window(dataGroupedPerChromosome[`${currentChromInView}`], currentWidestFeatureLength, miniWindowHandle, INITIAL_GENOMES_NAMES, CHROMOSOME_NAMES, currentNucleotidesWidthInPixel.effective);

      d3.selectAll(".moveableBlock").attr("x", d => Number(d.index) * currentNucleotidesWidthInPixel.effective - xPosition_displayedPixel);
      for (let chr = 0; chr < CHROMOSOME_NAMES.length; ++chr) {
        d3.select(`#duplicationBoxes_Chr${chr}`).selectAll("rect")
          .attr("x", d => Number(d.index)*currentNucleotidesWidthInPixel.effective - xPosition_displayedPixel  + (Number(d.FeatureStop)-Number(d.FeatureStart))*currentNucleotidesWidthInPixel.effective/2 - 0.5*(d[`copyPptionIn_Chr${chr}`]*((Number(d.FeatureStop)-Number(d.FeatureStart))*currentNucleotidesWidthInPixel.effective-2)));

        }; 
    };
    
    var miniatureTicksScale = d3.scaleLinear() 
                  .domain([0, maxPositionInNucleotide])
                  .range([0, svgContainer_browsingSlider.attr("width")]) 
                  .clamp(true); 

    svgContainer_browsingSlider.append("g") 
                  .attr("id","miniatureTicks")
                  .style("font", "10px sans-serif")
                  .attr("transform", "translate(" + 0 + "," + 65 + ")")
                  .call(d3.axisBottom(miniatureTicksScale)
                    .ticks(20)
                    .tickFormat(d3.format("~s")));



    svgContainer_legends.append("g").attr("id","legend_matrixPA_title")
            .append("text").attr("font-family", "sans-serif").attr("font-size", "10px")
              .attr("y","1em")
              .attr("x",svgContainer_legends.attr("width")/2).attr("text-anchor", "middle")
              .text("One column represents one panBlock")

    svgContainer_legends.append("g").attr("id", "legend_matrixPA_blocks")
                .append("g").attr("id","legend_matrixSchema");


    d3.select("#legend_matrixSchema").append("g")
            .append("text").attr("font-family", "sans-serif").attr("font-size", "10px")
              .attr("y", 7).attr("dominant-baseline", "middle")
              .attr("x", 45)
              .text("A")
            .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
              .text("B")
              .attr("y", 21)
            .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
              .text("C")
              .attr("y", 35);


    d3.select("#legend_matrixSchema").append("g").attr("transform", "translate(10,0)")
                .append("path").attr("d","M 45 0 H 57 V 14 H 45 Z M 45 14 H 57 V 28 H 45 Z M 45 28 H 57 V 42 H 45 Z").attr("fill", (d,i) => (functionDiversity.length === 1 ? d3.rgb(131, 245, 87) : functionColorScale(1)))
              .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
                .attr("d","M 57 28 H 69 V 42 H 57 Z").attr("fill", (d,i) => (functionDiversity.length === 1 ? d3.rgb(80, 105, 217) : functionColorScale(8)))
              .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
                .attr("d","M 69 14 H 81 V 28 H 69 Z M 69 28 H 81 V 42 H 69 Z").attr("fill", (d,i) => (functionDiversity.length === 1 ? d3.rgb(184, 60, 176) : functionColorScale(6)))
              .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
                .attr("d","M 81 0 H 93 V 14 H 81 Z M 81 14 H 93 V 28 H 81 Z").attr("fill", (d,i) => (functionDiversity.length === 1 ? d3.rgb(56, 241, 122) : functionColorScale(4)))
              .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
                .attr("d","M 93 28 H 105 V 42 H 93 Z").attr("fill", (d,i) => (functionDiversity.length === 1 ? d3.rgb(110, 64, 170) : functionColorScale(5)));
                

    d3.select("#legend_matrixPA_blocks").append("g").attr("id","legend_matrixMeanings").attr("transform", "translate(130,0)")
                    .append("text").attr("font-family", "sans-serif").attr("font-size", "10px")
                      .attr("y", 7).attr("dominant-baseline", "middle")
                      .text("Filled : Presence")
                      .attr("x", d3.select("#legend_matrixMeanings").node().getBBox().width/2).attr("text-anchor", "middle")
                    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
                      .text("Empty : Absence")
                      .attr("y", 22)
                    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
                      .text("Colour : Function")
                      .attr("y", 37);

    d3.select("#legend_matrixPA_blocks").attr("transform","translate("+ eval( Number(svgContainer_legends.attr("width"))/2 - 0.5*d3.select("#legend_matrixPA_blocks").node().getBBox().width - d3.select("#legend_matrixPA_blocks").node().getBBox().x ) +",30)")

    svgContainer_legends.append("g").attr("id", "legend_zoomLevel")
        .attr("transform", "translate("+eval(Number(svgContainer_legends.attr("width"))/2)+","+eval(30 + 20 + d3.select("#legend_matrixSchema").node().getBBox().height) +")")
        .append("text").attr("font-family", "sans-serif").attr("font-size", "10px")
          .text("Zoom level").attr("text-anchor", "middle");

    var zoomSlider = d3.select("#legend_zoomLevel").append("g").attr("transform","translate(0,8)");

    var zoomScale = d3.scaleLinear()
                .domain([dataGroupedPerChromosome[`${currentChromInView}`].length, 150, featureNbDependingOnNtWidth(Number(svgContainer_presenceAbsenceMatrix.attr("width")), currentNucleotidesWidthInPixel.max, dataGroupedPerChromosome[`${currentChromInView}`])])
                .range([-90, -30, 90])
                .clamp(true);

    zoomSlider.append("path").attr("d", "M -90 11 L 90 4 V 18 Z").style("fill", d3.hcl(0,0,50));
    zoomSlider.append("rect").attr("x", -90).attr("y",0).attr("height", 22).attr("width", zoomScale.range()[1]-zoomScale.range()[0])
        .style("fill-opacity", 0.5).style("fill", d3.hcl(70,80,100))
        .attr("stroke", d3.hcl(70,100,75));
    zoomSlider.append("line").attr("y1",0).attr("y2",22).attr("x1", zoomScale(featureNbDependingOnNtWidth(Number(svgContainer_presenceAbsenceMatrix.attr("width")), currentNucleotidesWidthInPixel.effective, dataGroupedPerChromosome[`${currentChromInView}`]))).attr("x2", zoomScale(featureNbDependingOnNtWidth(Number(svgContainer_presenceAbsenceMatrix.attr("width")), currentNucleotidesWidthInPixel.effective, dataGroupedPerChromosome[`${currentChromInView}`]))).attr("stroke-width", 2).attr("stroke","black");
    zoomSlider.append("text").attr("y",-3).attr("x", -90).attr("dominant-baseline", "hanging")
      .attr("font-family", "sans-serif").attr("font-size", "18px")
      .style("fill", d3.hcl(70,100,75))
      .text("*");

    zoomSlider.append("line").attr("class", "overlay")
        .attr("y1", 11).attr("y2", 11).attr("x1", -110).attr("x2", 110)
        .attr("stroke-width", 24).attr("stroke","transparent").attr("cursor", "ew-resize")
        .call(d3.drag()
          .on("start drag", function() { eventChangingZoom(zoomScale.invert(d3.event.x)); }));

    function eventChangingZoom(nbOfFeatures) {
      zoomSlider.select("line").attr("x1", zoomScale(nbOfFeatures)).attr("x2", zoomScale(nbOfFeatures));

      currentNucleotidesWidthInPixel.effective = ntWidthDependingOnFeatureNb(Number(svgContainer_presenceAbsenceMatrix.attr("width")), nbOfFeatures, dataGroupedPerChromosome[`${currentChromInView}`]);

      browsingHandleDimensions.width = svgContainer_browsingSlider.attr("width") * (svgContainer_rawBlocks.attr("width")/(maxPositionInNucleotide*currentNucleotidesWidthInPixel.effective));
      miniWindowHandle.attr("width", browsingHandleDimensions.width);

      miniatureSliderScale.range([0+browsingHandleDimensions.width/2, svgContainer_browsingSlider.attr("width")-browsingHandleDimensions.width/2]);
      miniatureSliderScale.domain([0, maxPositionInNucleotide*currentNucleotidesWidthInPixel.effective - svgContainer_rawBlocks.attr("width")]);

      if (Number(miniWindowHandle.attr("x"))+Number(miniWindowHandle.attr("width")) > Number(svgContainer_browsingSlider.attr("width"))) {
        miniWindowHandle.attr("x", Number(svgContainer_browsingSlider.attr("width"))-Number(miniWindowHandle.attr("width")));
      };

      drawingDisplay_Window(dataGroupedPerChromosome[`${currentChromInView}`], currentWidestFeatureLength, miniWindowHandle, INITIAL_GENOMES_NAMES, CHROMOSOME_NAMES, currentNucleotidesWidthInPixel.effective);

      d3.selectAll(".moveableBlock").attr("x", d => Number(d.index) * currentNucleotidesWidthInPixel.effective - miniatureSliderScale.invert(Number(miniWindowHandle.attr("x"))+Number(miniWindowHandle.attr("width"))/2) );
      for (let chr = 0; chr < CHROMOSOME_NAMES.length; ++chr) {
        d3.select(`#duplicationBoxes_Chr${chr}`).selectAll("rect")
          .attr("x", d => Number(d.index)*currentNucleotidesWidthInPixel.effective - miniatureSliderScale.invert(Number(miniWindowHandle.attr("x"))+Number(miniWindowHandle.attr("width"))/2) + (Number(d.FeatureStop)-Number(d.FeatureStart))*currentNucleotidesWidthInPixel.effective/2 - 0.5*(d[`copyPptionIn_Chr${chr}`]*((Number(d.FeatureStop)-Number(d.FeatureStart))*currentNucleotidesWidthInPixel.effective-2)));
      };
    };

    d3.select("#legend_zoomLevel")
      .append("text").attr("font-family", "sans-serif").attr("font-size", "10px").attr("text-anchor", "middle")
        .style("fill", d3.hcl(70,100,75)).attr("y", 50)
        .append("tspan").attr("x", 0)
          .text("* At these zoom levels")
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
          .text("lag might occur")
          .attr("dy","1em");

    svgContainer_coreSlider.append("g").attr("id","ChromSelectionGroup").append("text").attr("id","ChromSelectionLabel")
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px")
        .attr("dy", "1.2em")
        .attr("text-anchor", "start")
        .attr("dominant-baseline", "middle")
        .text("Chromosome on display:");

    var foreignObject_Dropdown = d3.select("#ChromSelectionGroup").append("foreignObject")
        .attr("height", 26)
        .attr("x", d3.select("#ChromSelectionLabel").node().getBBox().width +2)
        .attr("class","UFO");

    var dropdownChromChoice = foreignObject_Dropdown.append("xhtml:select").attr("id","dropdownChromChoice").style("font", "10px sans-serif");

    CHROMOSOME_NAMES.forEach(function(d,i) {
      dropdownChromChoice.append("option").attr("value",d).text(d);
    });

    d3.select("#ChromSelectionGroup").attr("transform", "translate("+ 0 +","+0+")");
    foreignObject_Dropdown.attr("width", d3.select("#dropdownChromChoice").node().offsetWidth);
    d3.select("#ChromSelectionGroup").attr("transform", "translate("+ eval((Number(svgContainer_coreSlider.attr("width")) - d3.select("#ChromSelectionLabel").node().getBBox().width-d3.select("#dropdownChromChoice").node().offsetWidth)/2) +","+60+")"); //eval is useful for the interpretation of the JS code within the string

    // changement de chromosome via drop down
    dropdownChromChoice.on("change", function(d) {

      currentChromInView = dropdownChromChoice.node().value; 

      currentWidestFeatureLength = Math.max(...dataGroupedPerChromosome[`${currentChromInView}`].map( d => Number(d.FeatureStop) - Number(d.FeatureStart)));
      maxPositionInNucleotide = Math.max(...dataGroupedPerChromosome[`${currentChromInView}`].map(d => Number(d.FeatureStop)));

      if (functionDiversity.length === 1) {
        correspondancePosColor = new Map();
        dataGroupedPerChromosome[`${currentChromInView}`].forEach( function(d,i) {
          correspondancePosColor.set(d.FeatureStart, i);
        });
      };

      currentNucleotidesWidthInPixel.minGlobal = Number(svgContainer_presenceAbsenceMatrix.attr("width"))/maxPositionInNucleotide;
      currentNucleotidesWidthInPixel.minEfficiency = ( ntWidthDependingOnFeatureNb(Number(svgContainer_presenceAbsenceMatrix.attr("width")), 150, dataGroupedPerChromosome[`${currentChromInView}`]) > currentNucleotidesWidthInPixel.minGlobal ? ntWidthDependingOnFeatureNb(Number(svgContainer_presenceAbsenceMatrix.attr("width")), 150, dataGroupedPerChromosome[`${currentChromInView}`]) : currentNucleotidesWidthInPixel.minGlobal*1.001 );
      if (currentNucleotidesWidthInPixel.effective < currentNucleotidesWidthInPixel.minGlobal) { currentNucleotidesWidthInPixel.effective = currentNucleotidesWidthInPixel.minGlobal }; //Changing the zoom value only if it exceeds the total length of the new chromosome

      greenColorScale.domain([1,Math.max(...dataGroupedPerChromosome[`${currentChromInView}`].map(d => d.SimilarBlocks.split(";").length))]);
      pseudoRainbowColorScale.domain(domainPivotsMaker(pseudoRainbowList.length,Math.max(...dataGroupedPerChromosome[`${currentChromInView}`].map(d => Number(d.FeatureStart)))));

      browsingHandleDimensions.width = svgContainer_browsingSlider.attr("width") * (svgContainer_rawBlocks.attr("width")/(maxPositionInNucleotide*currentNucleotidesWidthInPixel.effective));

      miniatureSliderScale.domain([0, maxPositionInNucleotide*currentNucleotidesWidthInPixel.effective - svgContainer_rawBlocks.attr("width")]);
      miniatureSliderScale.range([0+browsingHandleDimensions.width/2, svgContainer_browsingSlider.attr("width")-browsingHandleDimensions.width/2]);
      miniatureTicksScale.domain([0, maxPositionInNucleotide]);

      zoomSlider.select("line").attr("x1", zoomScale(featureNbDependingOnNtWidth(Number(svgContainer_presenceAbsenceMatrix.attr("width")), currentNucleotidesWidthInPixel.effective, dataGroupedPerChromosome[`${currentChromInView}`]))).attr("x2", zoomScale(featureNbDependingOnNtWidth(Number(svgContainer_presenceAbsenceMatrix.attr("width")), currentNucleotidesWidthInPixel.effective, dataGroupedPerChromosome[`${currentChromInView}`])))

      //rerender de la miniature apres changement de chromosome
      drawBlock.miniatureBg(
        bgBrowser_miniCanvas,
        bgBrowser_miniContext,
        dataGroupedPerChromosome[`${currentChromInView}`],
        svgContainer_browsingSlider.attr("width"),
        maxPositionInNucleotide,
        INITIAL_GENOMES_NAMES,
        browsingBlocksDimensions,
        coreThreshold,
        functionDiversity,
        correspondancePosColor,
        functionColorScale,
        orangeColorScale,
        blueColorScale,
        pseudoRainbowColorScale,
        greenColorScale);

      miniWindowHandle.attr("width", browsingHandleDimensions.width);
      miniWindowHandle.attr("x", 0);
      d3.select("#miniatureTicks").call(d3.axisBottom(miniatureTicksScale).ticks(20).tickFormat(d3.format("~s")));

      //For the display window
      drawingDisplay_Window(dataGroupedPerChromosome[`${currentChromInView}`], currentWidestFeatureLength, miniWindowHandle, INITIAL_GENOMES_NAMES, CHROMOSOME_NAMES, currentNucleotidesWidthInPixel.effective);
    });

    INITIAL_GENOMES_NAMES.forEach(function(geno, genomeNumber) {
      var matrixPA = svgContainer_presenceAbsenceMatrix.append("g").attr("id", `presence_${geno}`);

      var genomeLabels = svgContainer_genomesTree.append("text").attr("id", `${geno}_label`).attr("font-family", "sans-serif").attr("font-size", "10px")
            .attr("y", (d,i) => (genomeNumber+0.5)*displayedBlocksDimensions.height).attr("dominant-baseline", "middle") 
            .attr("x",svgContainer_genomesTree.attr("width")-3).attr("text-anchor", "end")
            .text(d => `${geno}`);
    });

    var presenceAbsenceMatrixSliderScale = d3.scaleLinear() 
        .domain([0, displayedBlocksDimensions.height*INITIAL_GENOMES_NAMES.length-svgContainer_presenceAbsenceMatrix.attr("height")]) 
        .range([0, svgContainer_presenceAbsenceMatrix.attr("height")-20]) 
        .clamp(true); 

    var presenceAbsenceScrollingSlider = svgContainer_presenceAbsenceMatrix.append("g").attr("class","fadingScrollingBar")
                    .style("opacity", 0)
                    .style("display", (displayedBlocksDimensions.height*INITIAL_GENOMES_NAMES.length > svgContainer_presenceAbsenceMatrix.attr("height") ? "block" : "none")) //The scroll bar will always exist, but will be displayable only if there is something to scroll (ie size of the image > size of the svgContainer)
                    .attr("transform", "translate(" + eval(svgContainer_presenceAbsenceMatrix.attr("width")-10) + "," + 10 + ")"); 

    presenceAbsenceScrollingSlider.append("line")
      .attr("y1", 0)
      .attr("y2", presenceAbsenceMatrixSliderScale.range()[1])
      .attr("stroke-linecap","round")
      .attr("stroke-width", "10px")
      .attr("stroke", d3.hcl(0,0,25))
      .attr("stroke-opacity", 0.3);

    presenceAbsenceScrollingSlider.append("line")
      .attr("y1", 0)
      .attr("y2", presenceAbsenceMatrixSliderScale.range()[1])
      .attr("stroke-linecap","round")
      .attr("stroke-width", "8px")
      .attr("stroke", d3.hcl(0,0,95));

    var scrollingBar_PresenceAbsenceHandle = presenceAbsenceScrollingSlider.append("circle")
        .attr("r", 7)
        .attr("fill", d3.hcl(0,0,100)) 
        .attr("stroke", d3.hcl(0,0,25))
        .attr("cy", 0)
        .attr("stroke-opacity", 0.3)
        .attr("stroke-width", "1.25px");

    presenceAbsenceScrollingSlider.append("line")
      .attr("y1", -10)
      .attr("y2", presenceAbsenceMatrixSliderScale.range()[1]+10)
      .attr("stroke-width", "120px")
      .attr("stroke", "transparent")
      .attr("cursor", "ns-resize")
        .call(d3.drag()
            .on("start drag", function() { eventScrollingPresenceAbsence(presenceAbsenceMatrixSliderScale.invert(d3.event.y)); }))
        .on("mouseover", function() {d3.selectAll(".fadingScrollingBar").transition().style("opacity",1)})
        .on("mouseout", function() {d3.selectAll(".fadingScrollingBar").transition().style("opacity",0)});

    function eventScrollingPresenceAbsence(yPositionOfTop) {

      scrollingBar_PresenceAbsenceHandle.attr("cy", presenceAbsenceMatrixSliderScale(yPositionOfTop) ); //Position change for the handle

      INITIAL_GENOMES_NAMES.forEach(function(geno, genomeNumber) {
        svgContainer_presenceAbsenceMatrix.select(`#presence_${geno}`).selectAll("rect")
            .attr("y", (d,i) => genomeNumber*displayedBlocksDimensions.height - yPositionOfTop); //Of course this y position will not be exactly the same if the genomes are clustered with space between them

        svgContainer_genomesTree.select(`#${geno}_label`)
              .attr("y", (d,i) => (genomeNumber+0.5)*displayedBlocksDimensions.height - yPositionOfTop); //idem
      });
    };

    blocksDisplay.append("g").attr("id","panChromosome_coreVSdispensable"); 

    blocksDisplay.append("g").attr("id","panChromosome_rainbowed");

   
    blocksDisplay.append("g").attr("id","panChromosome_similarCount");

    ["Left","Right"].forEach( function(position) {

      svgContainer_rawBlocks.append("g").attr("class","fadingLabel")
                        .attr("cursor", "default")
                        .attr("id",`panChromLegend_${position}`)
                        .on("mouseover", function() {d3.select(this).transition().style("opacity",0)})
                        .on("mouseout", function() {d3.select(this).transition().style("opacity",1)});

      d3.select(`#panChromLegend_${position}`).append("rect")
                            .attr("x",0)
                            .attr("class","panChrom_FadingBg")
                            .attr("y", (d,i) => (3+3)*displayedBlocksDimensions.height +3 +3)
                            .attr("height", (d,i) => CHROMOSOME_NAMES.length*displayedBlocksDimensions.height)
                            .attr("width", Math.max(...CHROMOSOME_NAMES.map( d => d.length))*10)
                            .style("fill",`url(#repeatsBgLabelGradient_${position})`);

      CHROMOSOME_NAMES.forEach(function(chrom, chromosomeNumber) {
        d3.select(`#panChromLegend_${position}`).append("text")
                              .attr("id", `${chrom}_label`)
                              .attr("font-family", "sans-serif")
                              .attr("font-size", "10px")
                              .attr("y", (d,i) => (chromosomeNumber+3+3+0.5)*displayedBlocksDimensions.height+3+2+2)
                              .attr("dominant-baseline", "middle")
                              .attr("x",0)
                              .text(d => `${chrom}`);
      });
    });

    d3.select("#panChromLegend_Right").select("rect").attr("x", svgContainer_rawBlocks.attr("width")-d3.select(".panChrom_FadingBg").attr("width"));
    d3.select("#panChromLegend_Right").selectAll("text")
                      .attr("x",svgContainer_rawBlocks.attr("width"))
                      .attr("text-anchor", "end");

    function drawingDisplay_similarityBoxes(chr, dataPart, nucleotideWidth) {

      let newData = d3.select(`#duplicationBoxes_Chr${chr}`).selectAll("rect")
            .data(dataPart);

      newData.exit().remove();

      newData.enter()
          .append("rect")
          .attr("class", "moveableBoxes")
          .attr("y", (d,i) => Number(d3.select("#panChromosome_similarCount").select("rect").attr("y")) + (4+chr)*displayedBlocksDimensions.height) //Each line corresponds to a chromosome
          .attr("height", d => displayedBlocksDimensions.height )
          .style("stroke-width", 0.5)
        .merge(newData)
          .attr("x", d => (Number(d.FeatureStop)-Number(d.FeatureStart))*nucleotideWidth/2 + Number(d.index)*nucleotideWidth - (d[`copyPptionIn_Chr${chr}`]*((Number(d.FeatureStop)-Number(d.FeatureStart))*nucleotideWidth-2)) /2 ) 
          .attr("width", d => d[`copyPptionIn_Chr${chr}`]*((Number(d.FeatureStop)-Number(d.FeatureStart))*nucleotideWidth-2)) 
          .style("fill", function(d) {
            let color = d3.hcl(greenColorScale.range()[1]);
            color.h = 180;
            color.l = 100-(d[`copyPptionIn_Chr${chr}`]*100*0.75);
            return color;
          })
          .style("stroke", function(d) {
            let color = d3.hcl(greenColorScale(d.SimilarBlocks.split(";").length));
            color.l = color.l-20;
            color.h = 180;
            return color;
          })
          .style("stroke-opacity", d => (d[`copyPptionIn_Chr${chr}`] > 0 ? 0.8 : 0) );
    };

    CHROMOSOME_NAMES.forEach(function(chrom, chromosomeNumber) {
      var panchromLines = blocksDisplay.append("rect").attr("class","bgLines")
                              .attr("x",0)
                              .attr("height",6)
                              .attr("y", (d,i) => (chromosomeNumber+3+3)*displayedBlocksDimensions.height+3+3 + 0.5*(displayedBlocksDimensions.height-d3.select(".bgLines").attr("height")) )
                              .attr("width", svgContainer_rawBlocks.attr("width"))
                              .style("fill","#eeeeee")

      var copyBoxes = blocksDisplay.append("g").attr("id", `duplicationBoxes_Chr${chromosomeNumber}`);
    });

    drawingDisplay_Window(dataGroupedPerChromosome[`${currentChromInView}`], currentWidestFeatureLength, miniWindowHandle, INITIAL_GENOMES_NAMES, CHROMOSOME_NAMES, currentNucleotidesWidthInPixel.effective);

  });
};
