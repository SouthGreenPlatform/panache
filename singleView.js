import {domainPivotsMaker, colorScaleMaker, thresholdBasedColor} from './modules/colorScales.mjs';
import * as drawBlock from './modules/blockLevel/drawing.mjs';
import * as eventsImported from './modules/events.mjs';

/**
 * @fileOverview    Pangenome visualizer using JavaScript.
 *
 * @author          Eloi Durant
 *
 * @requires        EXTERNAL:{@link https://d3js.org} Version 5.4.0.
 *                  Copyright 2018 Mike Bostock.
 */



/** {@link https://developer.mozilla.org/fr/docs/Web/API/File/Using_files_from_web_applications} */
/** Adapted from {@link https://stackoverflow.com/questions/28584548//how-to-get-a-filename-in-html-and-use-it-in-d3-js-javascript} */
var fileSelector = d3.select("body")
  .append("input")
  .attr("type","file")
  .attr("id","fileSelector")
  .on("change", eventFileSelection);

// Single file handler.
function eventFileSelection() {
  // Check for the various File API support.
  if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Great success! All the File APIs are supported.
  } else {
    alert('The File APIs are not fully supported in this browser.');
  }

  /* The variable <tt>inputFile</tt> is a FileList object which will be used to
     update the current file given in the input box on any change event.
     ATTENTION: Do not forget the <tt>d3</tt> in
     <tt>d3.event.target.files[0]</tt>.
  */
  var inputFile = d3.event.target.files[0];
  // About FileReader: https://developer.mozilla.org/fr/docs/Web/API/FileReader,
  // allows an asynchronous reading.
  var reader = new FileReader();

  // Manages the load event, i.e. anytime a reading operation is correctly done,
  // see https://developer.mozilla.org/en-US/docs/Web/API/FileReader/onload .
  reader.onload = function(event) {
	  // .target is a reference to the object that dispatched the selected file.
	  // .result gives what has been read (here an URL as determined below).
	  // Drupal.pangenome.renderD3Visualisation(event.target.result);
	  renderD3Visualisation(event.target.result);
  }
  // Read in the file as a data URL.
  reader.readAsDataURL(inputFile);
}

// Fetching data and applying the visualisation to it
// Drupal.pangenome.renderD3Visualisation = function (file_URL) {
function renderD3Visualisation(file_URL) {
  // Interesting files to use while developping:
  // "PanChromosome/allGenes_Bar.bedPAV"
  // "PanChromosome/mediumFakeDataWithAllBlocks.tsv"

  //This is a JavaScript promise, that returns value under certain conditions
  d3.dsv("\t",file_URL).then(function(realPanMatrix) {

  	// The input button for choosing a file is removed before rendering.
    d3.select("#fileSelector").remove();
    /*
      console.log(realPanMatrix); //Array(71725) [ {…}, {…}, {…}, {…}, {…}, … ]
        console.log(realPanMatrix[0]);
        --> Object { Cluster: "OG0026472", Musac: "0", ... , Musba: "0" }
        console.log(realPanMatrix[0][1]);
        --> Does not work.
        realPanMatrix.forEach(function(realPanMatrix) {
          console.log(realPanMatrix.Cluster)
      });
      --> prints cluster for each line !
    */

    /** Palette examples with handful buttons {@link /https://bl.ocks.org/pstuffa/3393ff2711a53975040077b7453781a9} */

	  /**
	   * ATTENTION: As d3 can read object properties there is no need to extract
  	 * columns! The comment is still here as it can be a useful reminder.
  	 * Extracting column from array of objects,
  	 * see {@link https://stackoverflow.com/questions/19590865/from-an-array-of-objects-extract-value-of-a-property-as-array}
	   */

    /**
  	 * Extracting information from data thanks to the json format:
     * {@link https://www.dashingd3js.com/using-json-to-simplify-code}
  	 * Looking for Maximal value of a certain property:
  	 * {@link https://stackoverflow.com/questions/4020796/finding-the-max-value-of-an-attribute-in-an-array-of-objects}
  	 */

    //----------------------------CHROMOSOME_NAMES------------------------------

    /**
     * In JS 'Set()' can store unique elements, see:
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set}
     * Pay attention to the uppercased first letter --> it is a Constructor!
     * Bonus: what is 'let' ? (baby don't hurt meee, don't hurt me, no more !):
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let}
     */
	  const CHROMOSOME_NAMES =
      [...new Set(realPanMatrix.map( d => d["#Chromosome"]))];
    // const CHROMOSOME_NAMES.length = Math.max(...realPanMatrix.map(obj => Number(obj.ID_Position.split(":")[0])))+1;

    //--------------------------------------------------------------------------

    //-------------------------INITIAL_GENOMES_NAMES----------------------------

    /**
     * ATTENTION This definition assumes that the PAV part is at the end of the
     * file and that all columns exist!!!
     * This select the element with indexes that range from 6 to the end,
     * assuming it is the PAV.
     * See: {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyNames}
     * And: {@link https://www.w3schools.com/jsref/jsref_slice_array.asp}
     */
    const INITIAL_GENOMES_NAMES = Object.getOwnPropertyNames(realPanMatrix[0])
      .slice(6,);
    //--------------------------------------------------------------------------

    //----------------------------functionDiversity-----------------------------

    // ATTENTION IT WILL WORK DIFFERENTLY WITH TRUE GO TERMS!!!
    var functionDiversity = [...new Set(realPanMatrix.map( d => d.Function))];
    //--------------------------------------------------------------------------

    //----------------------------improvedDataMatrix----------------------------

    var improvedDataMatrix = realPanMatrix.map(function(d,i) {
      /**
       *  Attributing the presence/absence matrix to "rest" by destructuring,
       * see : {@link http://www.deadcoderising.com/2017-03-28-es6-destructuring-an-elegant-way-of-extracting-data-from-arrays-and-objects-in-javascript/}
       * Destructuring defines multiple constants that are part of an original
       * object/array...
       * This way we just have to say which are the non-genome columns, the
       * rest will be determined automatically no matter the number of genomes.
	     * Chromosome, FeatureStart, FeatureStop, Sequence_IUPAC_Plus etc... are
       * newly defined constant, this way Chromosome can be taken back into
       * newObject later on, even if '#Chromosome' is removed from d.
       */
  	  // const {ID_Position, Sequence_IUPAC_Plus,SimilarBlocks, Function, ...rest} = d; //It has to be the property names
      const {"#Chromosome" : Chromosome, FeatureStart, FeatureStop,
        Sequence_IUPAC_Plus,SimilarBlocks, Function, ...rest} = d;
      /**
       * '#Chromosome' is removed to be rewrote later on, because the # sign
       * gives an INVALID NAME error that does not exists if the property is
       * called 'Chromosome' instead, this could help: {@link https://stackoverflow.com/questions/38762715/how-to-destructure-object-properties-with-key-names-that-are-invalid-variable-na/38762787}
       */
      delete d["#Chromosome"];

      /**
       * <tt>panChrBlockCount</tt> is, for a given block, the number of genomes
       * that possess it.
       * .values() transforms properties into an array, .map() creates a new
       * array built from calling a function on all its elements.
       * .map() is really useful, see: {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map}
       * The values must be converted with Number() as they are imported as
       * string, else it would disrupt the display of the core/dispensable
       * panChromosome.
       * The Presence/Absence matrix can now work with numbers higher than 1,
       * they just are divided by themselves when != 0 in order to have a binary
       * PAV matrix, so that the count really is the number of genomes owning a
       * given block.
       * @type {number|string}
       */
      //We adapt the panChrBlockCount to named value of Presence (gene-ids) or Absence (0)
      let panChrBlockCount = [0].concat(Object.values(rest))
        .reduce((acc, val) => acc + (Number(val) != 0 ? 1 : 0));
      // return Object.values(rest).forEach(function(a) {a = Number(a);});
      // --> Does not work !

      /**
       * <tt>newObject</tt> is a copy of the original object from the dataset,
       * with added properties:
       * - 'Chromosome': a rewriting of the former '#Chromosome' property
       * - 'index': will be used to place and order blocks
       * - 'presenceCounter': number of genomes that own this block
       * Its creation is based on .assign(): {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign}
       */
      let newObject = Object.assign({"index": FeatureStart,
        "presenceCounter": panChrBlockCount, "Chromosome": Chromosome}, d);

      /**
       * Encoding the proportion of duplicates in each chromosome. It begins
       * with the extraction of the first piece of ID
       * *for each copy of the block* which can be a chromosome identifier or
       * ".".
       * Reminder: d.SimilarBlocks can takes two forms
       * - .                                                      if there is no copy
       * - chromID_1:start_1:stop_1;chromID_2:start_2:stop_2...   location of every known copy
      */
      let concernedChromosomes = [];
      d.SimilarBlocks.split(";")
        .forEach(copy => concernedChromosomes.push(copy.split(":")[0]));

      let countAsProperty = {};
      // Sets the base value to 0 for the properties "0", "1", "2"... etc, one
      // number being one chromosome.
      CHROMOSOME_NAMES.forEach(chromName => countAsProperty[`${chromName}`] = 0);
      //concernedChromosomes.forEach(chrom => if (countAsProperty[chrom] != undefined) countAsProperty[chrom] += 1;);
      concernedChromosomes.forEach(function(chromName) {
        /* The if statement must be on another line than the function
           declaration. It is mandatory to check if it is not undefined
           because concernetChromosome can be ["."], but there is no chrom
           named "." within countAsProperty!
           If a chromosome has one copy or more of the considered block, then
           every occurence is added to the count.
        */
        if (undefined != countAsProperty[chromName]) {
          countAsProperty[chromName] += 1;
        }
      });

      // Calculation of the proportions from the occurence count
      //The ... is mandatory to tell that we work with an array
      let maxCount = Math.max(...Object.values(countAsProperty));
      for (var i = 0; i < CHROMOSOME_NAMES.length; ++i) {
        /**
         * For variables within string, see Template Literals:
         * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals}
         */
        newObject[`copyPptionIn_Chr${i}`] =
          (maxCount > 0 ? countAsProperty[`${CHROMOSOME_NAMES[i]}`]/maxCount : 0);
      }

      return newObject;
    });
    //--------------------------------------------------------------------------
    console.log(improvedDataMatrix);

    /**
     * ATTENTION We must work on a copy of the original array, else the rest
     * will not be defined properly in another potential matrix.
     * Useful links for the creation of the new matrices:
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from}
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values}
     */

    //------------------------dataGroupedPerChromosome--------------------------

    /**
     * @type {object}
     * dataGroupedPerChromosome is an improved version of the original dataset,
     * but where everything is divided between chromosomes.
     */
    var dataGroupedPerChromosome = {};
    // .map() must not be used here as we do not want an array as output
    // but an object!!!
    CHROMOSOME_NAMES.forEach(function(chr) {
      /** Filter depending on the chr name, see: {@link https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Array/filter} */
      dataGroupedPerChromosome[`${chr}`] =
        improvedDataMatrix.filter(data => data.Chromosome === chr);
      // Deletion of the redundant property "Chromosome" which is already
      // determined by the main group.
      dataGroupedPerChromosome[`${chr}`].forEach(d => delete d.Chromosome);
    });
    //--------------------------------------------------------------------------

    //---------------------------currentChromInView-----------------------------

    var currentChromInView =
      Object.getOwnPropertyNames(dataGroupedPerChromosome)[0];
    //--------------------------------------------------------------------------

    //-------------------------correspondancePosColor---------------------------

    if (functionDiversity.length === 1) {
      var correspondancePosColor = new Map();
      dataGroupedPerChromosome[`${currentChromInView}`].forEach( function(d,i) {
        correspondancePosColor.set(d.FeatureStart, i);
      });
    };
    //--------------------------------------------------------------------------


    //-----------------------currentWidestFeatureLength-------------------------

    var currentWidestFeatureLength =
      Math.max(...dataGroupedPerChromosome[`${currentChromInView}`]
        .map( d => Number(d.FeatureStop) - Number(d.FeatureStart) ));
    //--------------------------------------------------------------------------

    //-------------------------maxPositionInNucleotide--------------------------

    // What is the last nucleotide to show ?
    var maxPositionInNucleotide = Math.max(...dataGroupedPerChromosome[`${currentChromInView}`].map(d => Number(d.FeatureStop)));
    //--------------------------------------------------------------------------

    //----------------------------blueColorScale--------------------------------

    var blueColorScale = colorScaleMaker([0, INITIAL_GENOMES_NAMES.length],
      [d3.hcl(246, 0, 95), d3.hcl(246, 65, 70)]);
    //--------------------------------------------------------------------------

    //---------------------------orangeColorScale-------------------------------

    var orangeColorScale = colorScaleMaker([0, INITIAL_GENOMES_NAMES.length],
      [d3.hcl(60, 0, 95), d3.hcl(60, 65, 70)]);
    //--------------------------------------------------------------------------

    //---------------------------greenColorScale--------------------------------

    //var greenColorScale = colorScaleMaker([1,Math.max(...dataGroupedPerChromosome[`${currentChromInView}`].map(d => d.SimilarBlocks.split(";").length))], [d3.hcl(325,2,97), d3.hcl(325,86,54)]);
    var highestRepNumber =
      Math.max(...dataGroupedPerChromosome[`${currentChromInView}`]
        .map(d => d.SimilarBlocks.split(";").length));
    var greenColorScale = colorScaleMaker([1, highestRepNumber],
      [d3.hcl(120, 2, 97), d3.hcl(125, 85, 54)]);
    //--------------------------------------------------------------------------

    //-------------------------pseudoRainbowColorScale--------------------------

    /**
     * See {@link https://codepen.io/thetallweeks/pen/QNvoNW} for more about multiple colors linear scales
     * For info about color blindness {@link https://knightlab.northwestern.edu/2016/07/18/three-tools-to-help-you-make-colorblind-friendly-graphics/}
     */
    var pseudoRainbowList = [d3.rgb(0, 90, 200), d3.rgb(0, 200, 250),
      d3.rgb(120, 50, 40), d3.rgb(190, 140, 60), d3.rgb(240, 240, 50),
      d3.rgb(160, 250,130)];
//    var pseudoRainbowColorScale = colorScaleMaker(domainPivotsMaker(pseudoRainbowList.length,Math.max(...dataGroupedPerChromosome[`${currentChromInView}`].map(d => Number(d.ID_Position.split(":")[1])))), pseudoRainbowList);
    /**
     * max will reach for the max FeatureStart position, for a given chromosome
     * Each color in the range (given by pseudoRainbowList) has a pivot position
     * defined in the domain thanks to domainPivotsMaker.
     */
    var lastBlockStart =
      Math.max(...dataGroupedPerChromosome[`${currentChromInView}`]
        .map(d => Number(d.FeatureStart)));

    var pivotsForRainbow =
      domainPivotsMaker(pseudoRainbowList.length, lastBlockStart);

    var pseudoRainbowColorScale =
      colorScaleMaker(pivotsForRainbow, pseudoRainbowList);
//    var pseudoRainbowColorScale = colorScaleMaker(domainPivotsMaker(pseudoRainbowList.length,Math.max(...Number(dataGroupedPerChromosome[`${currentChromInView}`].ID_Position.split(":")[1]))), pseudoRainbowList); //Does not work, we have to find another way of extracting the maximum

    //
    //--------------------------------------------------------------------------

    //--------------------------functionColorScale------------------------------

    // Can be improved, cf PanViz !!
    // There is +1 in the division so that it will not do a full cyclic rainbow.
    // This function must be changed with a new ecoding of biological functions
    var colorsForFunctions =
      domainPivotsMaker(functionDiversity.length, functionDiversity.length)
      .map(intNum => d3.interpolateRainbow(intNum / (functionDiversity.length + 1)));
    var functionColorScale =
      colorScaleMaker(functionDiversity, colorsForFunctions, false);
    //--------------------------------------------------------------------------

    //----------------------------coreThreshold---------------------------------

    /* Calculating the threshold for the change in color scale in
    core/dispensable panChromosome, arbitrary for the starting display.
    ATTENTION It is not a percentage but the minimum number of genomes from the
    pangenome required for a block to be considered part of the core genome
    */
    var coreThreshold = 85/100 * INITIAL_GENOMES_NAMES.length;
    //--------------------------------------------------------------------------

    //---------------------WINDOW_WIDTH, WINDOW_HEIGHT--------------------------

    //Creating the constants for a scalable display
    const WINDOW_WIDTH = window.innerWidth, WINDOW_HEIGHT = window.innerHeight;
    //--------------------------------------------------------------------------

    //-----------------------displayedBlocksDimensions--------------------------

    var displayedBlocksDimensions = {width:12, height:14};
    //--------------------------------------------------------------------------

    /** More about d3 selection: {@link https://bost.ocks.org/mike/selection/} */


    //-------------------------svgContainerMaker()------------------------------

    /**
     * @function svgContainerMaker
     * @param {string}  id  - which id to give to the new SVG container
     * @param {numeric}  heiht  - height of the SVG container
     * @param {numeric}  width  - width of the SVG container
     * @param {numeric|string}  left  - left margin in px
     * @param {numeric|string}  top  - top margin in px
     * @param {string}  position  - whether the position should be absolute, or relative to a parent DOM element
     * @param {string}  where  - which DOM element to select for the insertion of a SVG container
     * @return {...} ...
     */
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
    //--------------------------------------------------------------------------

    //-----------------------svgContainer_coreSlider----------------------------
    //Creating the SVG DOM tag
    var svgContainer_coreSlider = svgContainerMaker(
      "svgContainer_coreSlider",
      95,
      210,
      //Styling the SVGs makes them still even if the window's size changes
      0,
      5
    );
    //--------------------------------------------------------------------------

    //----------------------svgContainer_browsingSlider-------------------------
    //Creating the SVG DOM tag
    var svgContainer_browsingSlider = svgContainerMaker(
      "svgContainer_browsingSlider",
      95,
      // The width is taken from the remaining width of the window
      WINDOW_WIDTH - Number(svgContainer_coreSlider.attr("width")) - 10,
      svgContainer_coreSlider.attr("width"),
      5
    );
    //--------------------------------------------------------------------------

    //-----------------------svgContainer_genomesTree---------------------------
    //Creating the SVG DOM tag
    var svgContainer_genomesTree = svgContainerMaker(
      "svgContainer_genomesTree",
      /*
       The height depends on the height of the previous SVG, the number of
       genomes (INITIAL_GENOMES_NAMES.length) and a maximum threshold so that it
       will not take more than a third of the remaining display window. The idea
       is that this svg should not exceed a third of the overall window.
     */

      // ATTENTION If the genomes are clustered with spaces (cf clustered
      // heatmaps) the height will change and some will not be fully displayed.
      // (genomesHeight <= remainingHeight/3 ? genomesHeight : remainingHeight/3)
      (displayedBlocksDimensions.height * INITIAL_GENOMES_NAMES.length <= (WINDOW_HEIGHT * 0.95 - svgContainer_coreSlider.attr("height")) / 3 ? displayedBlocksDimensions.height * INITIAL_GENOMES_NAMES.length : (WINDOW_HEIGHT * 0.95 - svgContainer_coreSlider.attr("height")) / 3),
      // Width of the left colmun, given by svgContainer_coreSlider.
      svgContainer_coreSlider.attr("width"),
      /*
       The left value need to be split because it is taken from another
       svgContainer, therefore written with "px" at the end while we just want
       the numeric value.
       For more about split(), see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split
      */
      svgContainer_coreSlider.style("left").split("px")[0],
      Number(svgContainer_coreSlider.attr("height")) + 5
    );
    //--------------------------------------------------------------------------

    //------------------svgContainer_presenceAbsenceMatrix----------------------
    var svgContainer_presenceAbsenceMatrix = svgContainerMaker(
      "svgContainer_presenceAbsenceMatrix",
      // Same height than the previous container, svgContainer_genomesTree.
      svgContainer_genomesTree.attr("height"),
      // Width of the right column, given by svgContainer_browsingSlider.
      svgContainer_browsingSlider.attr("width"),
      // Aligned on the right column, given by svgContainer_browsingSlider.
      svgContainer_browsingSlider.style("left").split("px")[0],
      // Same top value than the previous container, svgContainer_genomesTree.
      svgContainer_genomesTree.style("top").split("px")[0]
    );
    //--------------------------------------------------------------------------

    //-------------------------svgContainer_legends-----------------------------
    //Creating the SVG DOM tag
    var svgContainer_legends = svgContainerMaker(
      "svgContainer_legends",
      // 95% of total height minus the heights of previous SVGs
      WINDOW_HEIGHT * (1 - 0.05) - svgContainer_coreSlider.attr("height") - svgContainer_genomesTree.attr("height"),
      svgContainer_coreSlider.attr("width"),
      svgContainer_coreSlider.style("left").split("px")[0],
      /*
       eval() calculates the inner numeric sum within a string, but it is not
       mandatory here. However, "Number()" is !!
      */
      Number(svgContainer_coreSlider.attr("height"))+Number(svgContainer_genomesTree.attr("height"))+10
    );
    //--------------------------------------------------------------------------

    //------------------------svgContainer_rawBlocks----------------------------
    //Creating the SVG DOM tag
    var svgContainer_rawBlocks = svgContainerMaker(
      "svgContainer_rawBlocks",
      svgContainer_legends.attr("height"),
      svgContainer_browsingSlider.attr("width"),
      svgContainer_browsingSlider.style("left").split("px")[0],
      svgContainer_legends.style("top").split("px")[0]
    );
    //--------------------------------------------------------------------------

    //----------------------ntWidthDependingOnFeatureNb()-----------------------

    function ntWidthDependingOnFeatureNb(WINDOW_WIDTH, nbFeature2Display, dataset) {
      // = Width of the display window / (nb of displayed features * mean width of features);
      let meanWidthOfFeatures =
        dataset.map( d => Number(d.FeatureStop) - Number(d.FeatureStart))
        .reduce( (acc, val) => acc + val) / dataset.length;
      let widthOfNucleotide = WINDOW_WIDTH / (nbFeature2Display * meanWidthOfFeatures);
      return widthOfNucleotide;
    };
    //--------------------------------------------------------------------------

    //----------------------featureNbDependingOnNtWidth()-----------------------

    function featureNbDependingOnNtWidth(WINDOW_WIDTH, nucleotideWidth, dataset) {
      let meanWidthOfFeatures =
        dataset.map( d => Number(d.FeatureStop) - Number(d.FeatureStart))
        .reduce( (acc, val) => acc + val) / dataset.length;
        let nbOfFeatures = WINDOW_WIDTH /(nucleotideWidth * meanWidthOfFeatures);
      return nbOfFeatures;
    };
    //--------------------------------------------------------------------------

    //---------------------currentNucleotidesWidthInPixel-----------------------

    /*
     currentNucleotidesWidthInPixel is an object containing different values:
     minGlobal     is the minimum width a nucleotide can have, when the
                   panChromosome is visible in its entirety.
     minEfficiency is a width threshold: if the nucleotides have a width lower
                   than this threshold, then too many features will be displayed
                   and the visualizer will run very slowly. It is set for a
                   number of 150 features, and cannot exceed the minGlobal (for
                   instance if there are less than 150 features).
                   ATTENTION!!! It depends on the total number of displayed
                   elements! The more genomes/chromosomes there are, the slower
                   it will get to display the same amount of features!
     max           is the max width a nucleotide can have.
     effective     is the width which is currently used for the display. The
                   default value cannot be less than the minEfficiency value.
     */
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

    //--------------------------------------------------------------------------

    //---------------------------coreSliderGradient-----------------------------

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
              .attr("offset", coreThreshold/INITIAL_GENOMES_NAMES.length)
              .attr("stop-color", blueColorScale(coreThreshold))
            .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
              .attr("class", "hueSwingingPointRight")
              .attr("stop-color", orangeColorScale(coreThreshold))
            .select(function() { return this.parentNode; }).append("stop")
              .attr("offset", 1)
              .attr("stop-color", orangeColorScale.range()[1]);
    //--------------------------------------------------------------------------

    //--------------------------------repeatsBgLabelGradient----------------------------------

    //Creating a white to transparent gradient for the repetition labels
    var repeatsBgLabelGradient = svgContainer_rawBlocks.select("defs")
                      .append("linearGradient")
                      .attr("id", "repeatsBgLabelGradient_Left")
                      .attr("x1", 0) //x1, x2, y1, y2 determine the direction of the gradient
                      .attr("x2", 1)
                      .attr("y1", 0)
                      .attr("y2", 0);

    repeatsBgLabelGradient.append("stop")
              .attr("offset", 0) //Relative position of the stop on the gradient
              .attr("stop-color", "white") //Color that should be displayed at that stop
            .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
              .attr("offset", 0.6)
              .attr("stop-color", "white")
            .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
              .attr("offset", 1)
              .attr("stop-color", "#ffffff00"); //The fourth part is for the opacity

    //Copy of the previous gradient, for the rightmost part of the screen
    svgContainer_rawBlocks.select("defs")
                .append("linearGradient")
                .attr("href", "#repeatsBgLabelGradient_Left")
                .attr("id", "repeatsBgLabelGradient_Right")
                .attr("x1", 1)
                .attr("x2", 0);//rotate() is not enough to reverse the gradient so new x's must be defined
    //--------------------------------------------------------------------------

    //-----------------------------------blocksDisplay------------------------------------
    var blocksDisplay = svgContainer_rawBlocks.append("g")
                      .attr("id", "blocksDisplay")
    //--------------------------------------------------------------------------

    //------------------------------browsingBlocksDimensions------------------------------

    var browsingBlocksDimensions = {width:(svgContainer_browsingSlider.attr("width")/dataGroupedPerChromosome[`${currentChromInView}`].length)+1, height:10, borderSpace:1}
    //+1 so that the rectangles overlap and leave no space giving a filling of transparency
    //The width is not used anymore, I believe
    //--------------------------------------------------------------------------



    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Creation of a slider for choosing the core threshold ! see https://bl.ocks.org/mbostock/6452972 for slider example
    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    //----------------------------------coreSliderScale-----------------------------------

    //1st create a scale that links value to a position in pixel
    var coreSliderScale = d3.scaleLinear() //Attaches to each threshold value a position on the slider
        .domain([0, 1]) //Takes the possible treshold values as an input
        .range([0, 100]) //Ranges from and to the slider's extreme length values as an output
        .clamp(true); //.clamp(true) tells that the domains has 'closed' boundaries, that won't be exceeded
    //--------------------------------------------------------------------------

    //-------------------------------------coreSlider-------------------------------------

    //Translation of the whole slider object wherever it is required
    var coreSlider = svgContainer_coreSlider.append("g") //coreSlider is nested in svgContainer_coreSlider
//                    .attr("class", "slider") //With the class "slider", to access it easily (more general than id which must be unique)
                    .attr("transform", "translate(" + (svgContainer_coreSlider.attr("width")-coreSliderScale.range()[1]) / 2 + "," + 34 + ")"); //Everything in it will be translated
    //--------------------------------------------------------------------------

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
    //--------------------------------------------------------------------------

    //---------Some colour circles at the extremities to keep track of the colour---------

    coreSlider.append("circle").attr("r",4).attr("cx",(coreSliderScale.range()[0]-4)-4*2.5).attr("cy",0).style("fill",blueColorScale.range()[1]);
    coreSlider.append("circle").attr("r",4).attr("cx",(coreSliderScale.range()[1]+4)+4*2.5).attr("cy",0).style("fill",orangeColorScale.range()[1]);
    //--------------------------------------------------------------------------

    //------------------------------------coreOverlay-------------------------------------

    //Addition of the interactive zone
    coreSlider.append("line")
      .attr("class", "track-overlay") //This will be the interactivity zone, not displayed but accessible (see how the mouse pointer changes)
    //  .attr("pointer-event", "stroke") //Indicates that the event should only work when the pointer is on the stroke : https://developer.mozilla.org/fr/docs/Web/CSS/pointer-events ; might work as well without it, as the interactive object is already nothing but a stroke. Can also be "auto" (for all of the surface), "none" (does not apply any mouse change), or "fill" (applies on everything but the stroke) or other
      .attr("x1", coreSliderScale.range()[0]) //Calling the first boundary of coreSliderScale.range (ie left position)
      .attr("x2", coreSliderScale.range()[1]) //Calling the second boundary of coreSliderScale.range (ie right position)
      .attr("stroke-linecap","round") //The line will not have straight tips
      .attr("stroke-width", "30px") //The interactivity zone is larger than the displayed lines for easier use
      .attr("stroke", "transparent") //That zone is made invisible, but is still displayed over its parents lines/slider bars
      .attr("cursor", "crosshair") //The pointer changes for a cross whenever it reaches that zone, see https://www.w3schools.com/jsref/prop_style_cursor.asp for more cursor options
        .call(d3.drag()  //.drag creates a new drag behavior. The returned behavior, drag, is both an object and a function, and is typically applied to selected elements via selection.call. That is our case here, where drag is called on "track-overlay"
        //For more info on call and this : https://www.w3schools.com/js/js_function_call.asp ; .call is basically a reuse method on a different object, "With call(), an object can use a method belonging to another object."
        //It is written : selection.function.call(whatItIsBeingCalledOn, arguments...)
    //      .on("start.interrupt", function() { slider.interrupt(); }) //interrupt seems to be an event related to the transition the original code had (the slider's handle was moving at the very beginning), see : https://github.com/d3/d3-transition/blob/master/README.md#selection_interrupt . ATTENTION It is not useful here as I did not use the transition from the original code
          .on("start drag", function() { eventDynamicColorChange(coreSliderScale.invert(d3.event.x)); })); //"start" is the d3.drag event for mousedown AND if it is not just a click : https://github.com/d3/d3-drag . We surely need to call d3.drag() to use this. For more about .on : https://github.com/d3/d3-selection/blob/master/README.md#selection_on
          //invert uses the same scale, but goes from range to domain, can be useful for returning data from mouse position : The container of a drag gesture determines the coordinate system of subsequent drag events, affecting event.x and event.y. The element returned by the container accessor is subsequently passed to d3.mouse or d3.touch, as appropriate, to determine the local coordinates of the pointer.
    //--------------------------------------------------------------------------

    //-------------------------------------coreHandle-------------------------------------

    //Creation of the handle circle, thats translates the interaction into visual movement
    var coreHandle = coreSlider.insert("circle", ".track-overlay") //Tells to insert a circle element before (as it is insert and not append) the first "track-overlay" class element it finds within coreSlider (so that it will appear behind it)
        .attr("class", "handle") //It is given the class "handle" (useful for easier/universal styling when used with css format)
        .attr("r", 7) //The radius
        .attr("fill", "#fff") //The circle is filled in white
        .attr("stroke", "#000")
        .attr("cx", coreThreshold/INITIAL_GENOMES_NAMES.length*100)
        .attr("stroke-opacity", 0.3)
        .attr("stroke-width", "1.25px");
    //--------------------------------------------------------------------------

    //--------------------------------------coreTicks-------------------------------------

    //Creation of the tick label that will give coreTreshold percent value in real time
    coreSlider.insert("g", ".track-overlay") //Insertion of a subgroup before "track-overlay"
        .attr("class", "tick") //Giving the class "ticks", for styling and calling reasons
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px")
        .attr("transform", "translate(0 18)") //One more translation in order to have it right under the rest of the slider
        .append("text").attr("x", coreHandle.attr("cx")).attr("text-anchor", "middle").text(coreHandle.attr("cx")+"%"); //Text value based on coreThreshold
    //--------------------------------------------------------------------------

    //--------------------------------------coreLabel-------------------------------------

    coreSlider.insert("text", ".track-overlay")
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px")
        .attr("transform", "translate("+coreSliderScale.range()[1]/2+",0)") //Keeping the value outside of quotes is neede for its calculation
        .attr("dy","-1.3em") //A vertical translation depending on the font size (2em --> two times the font size, enough space for two lines)
        .attr("text-anchor", "middle")
        .append("tspan")
          .text("to be part of ")
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
          .text("Core")
          .style("fill",d3.hcl(60,65,70))
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); }) //The first line is created after as I do not want the previous tspan to have the same x attribute when cloning
          .attr("x", 0) //Needed for the correct carriage return
          .text("Minimal Presence ratio")
          .attr("dy","-1.2em")
          .style("fill", "black");
    //--------------------------------------------------------------------------

    //------------------------------eventDynamicColorChange()-----------------------------

    //Function called when dragging the slider's handle, its input "slidePercent" is derived from the pointer position
    function eventDynamicColorChange(slidePercent) {
      coreHandle.attr("cx", coreSliderScale(slidePercent)); //Position change for the handle
      coreThreshold = slidePercent*INITIAL_GENOMES_NAMES.length; //Updates the value of coreThreshold
//      console.log(coreThreshold);
      d3.select(".tick").select("text").attr("x", coreSliderScale(slidePercent)).text(Math.round(slidePercent*100) + "%"); //Position change for the label
      d3.select(".hueSwingingPointLeft").attr("offset", coreThreshold/INITIAL_GENOMES_NAMES.length).attr("stop-color", blueColorScale(coreThreshold)); //The gradient is dynamically changed to display different hues for each extremity of the slider
      d3.select(".hueSwingingPointRight").attr("offset", coreThreshold/INITIAL_GENOMES_NAMES.length).attr("stop-color", orangeColorScale(coreThreshold));
      d3.select("#panChromosome_coreVSdispensable").selectAll("rect").style("fill", function (d) {return thresholdBasedColor(d.presenceCounter,coreThreshold,blueColorScale,orangeColorScale);}); //Updates the core/dispensable panChromosome blocks' colours

      //Updating the colours of the miniature browser
      bgBrowser_miniContext.fillStyle = "#fff";
      bgBrowser_miniContext.fillRect(0,2*browsingBlocksDimensions.height+6, svgContainer_browsingSlider.attr("width"), browsingBlocksDimensions.height); //Applying a white background on the line before drawing it again

      dataGroupedPerChromosome[`${currentChromInView}`].forEach(d => {
        bgBrowser_miniContext.fillStyle = (Number(d.presenceCounter) === 0 ? "#fff" : (Number(d.presenceCounter) >= coreThreshold ? orangeColorScale.range()[1] : blueColorScale.range()[1])); //Here we chose a yes/no colorScale instead of the one used in the display, for a better readibility
        bgBrowser_miniContext.fillRect(svgContainer_browsingSlider.attr("width") * Number(d.index)/maxPositionInNucleotide,2*browsingBlocksDimensions.height+6, svgContainer_browsingSlider.attr("width") * (Number(d.FeatureStop)-Number(d.FeatureStart))/maxPositionInNucleotide+1, browsingBlocksDimensions.height); //fillRect(x, y, width, height)
      });
    };
    //--------------------------------------------------------------------------


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    //End of the core slider creation
    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    //-------------------------------foreignObject_Browser--------------------------------

    //Foreign object allows to incorporate objects that are not SVGs into an SVG window
    //https://gist.github.com/mbostock/1424037
//ATTENTION Chrome dislikes foreignObjects, which causes bugs on the miniature (but it is fine with Mozilla). I had to change it to a div instead...
    var foreignObject_Browser = d3.select("body").append("div")
        .attr("width", svgContainer_browsingSlider.attr("width"))
        .attr("height", browsingBlocksDimensions.height*6 + browsingBlocksDimensions.borderSpace*(6-1))
        //.attr("x", 0) as this attribute only exists in svg it is not useful here, idem for y
//        .attr("y", 0 - foreignObject_Browser.attr("height")/2) //It has to be centered depending on the canvas and miniature count
//        .attr("y", 0 - (browsingBlocksDimensions.height*3 + browsingBlocksDimensions.borderSpace*(3-1))/2) //It has to be centered depending on the canvas and miniature count
        //.attr("y", 0) //It has to be centered depending on the canvas and miniature count
        //.attr("transform", "translate(" + 0 + "," + svgContainer_browsingSlider.attr("height") / 2 + ")") //The foreign object is centered within svgContainer_browsingSlider
        .attr("class","UFO")
        .style("top", svgContainer_browsingSlider.style('top'))
        .style("left", svgContainer_browsingSlider.style('left'))
        .style("position", "absolute") //z-index can only work with positionned elements
        .style("z-index", -1); //Asks to put the foreignObject behind the rest, necessary to a good display with Chrome !
    //--------------------------------------------------------------------------

    //------------------------------browsingHandleDimensions------------------------------

    var browsingHandleDimensions = {strokeWidth:3};
    browsingHandleDimensions.height = browsingBlocksDimensions.height*3 + browsingBlocksDimensions.borderSpace*(3-1) + Number(browsingHandleDimensions.strokeWidth)*2; //Normal height + contour
//    browsingHandleDimensions.width = svgContainer_browsingSlider.attr("width") * (svgContainer_rawBlocks.attr("width")/(displayedBlocksDimensions.width*Number(dataGroupedPerChromosome[`${currentChromInView}`].length))); // = SliderWidth * displayWINDOW_WIDTH/(nbBlocks * BlocksWidth)
    browsingHandleDimensions.width = svgContainer_browsingSlider.attr("width") * (svgContainer_rawBlocks.attr("width")/(maxPositionInNucleotide*currentNucleotidesWidthInPixel.effective)); // = SliderWidth * displayWINDOW_WIDTH/(total size of display; here it is max(FeatureStop) as we consider 1 nt with a width of 1 px)
    //--------------------------------------------------------------------------

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Creation of a miniature chromosome slider !
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    //-------------------------------miniatureSliderScale---------------------------------

    //Creation of a scale that links value to a position in pixel
    var miniatureSliderScale = d3.scaleLinear() //Attaches to each threshold value a position on the slider
//                  .domain([0, displayedBlocksDimensions.width*dataGroupedPerChromosome[`${currentChromInView}`].length - svgContainer_rawBlocks.attr("width")]) //Must be the min and max block positions, with a gap in order to always show blocks, and no empty background when the slider is at the maximum position
                  .domain([0, maxPositionInNucleotide*currentNucleotidesWidthInPixel.effective - svgContainer_rawBlocks.attr("width")]) //From 0 to the last pixel to show at the left of the display window
                  .range([0+browsingHandleDimensions.width/2, svgContainer_browsingSlider.attr("width")-browsingHandleDimensions.width/2]) //Ranges from and to the slider's extreme length values/positions as an output
                  //ATTENTION The slider positions correspond to the center of the handle !
                  //The margins are dependant of the handle width, which depends on the number of blocks and the window's width
                  .clamp(true); //.clamp(true) tells that the domains has 'closed' boundaries, that won't be exceeded
    //--------------------------------------------------------------------------

    //Canvas creation for background of SVG, code from http://bl.ocks.org/boeric/aa80b0048b7e39dd71c8fbe958d1b1d4

    //-------------------------------------miniCanvas-------------------------------------

//Addition of the first canvas to the foreignObject
    var bgBrowser_miniCanvas = foreignObject_Browser.append("xhtml:canvas")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", foreignObject_Browser.attr("width"))
      .attr("height", (browsingBlocksDimensions.height + browsingBlocksDimensions.borderSpace)*6);

    //The context of canvas is needed for drawing
    var bgBrowser_miniContext = bgBrowser_miniCanvas.node().getContext("2d");

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

    //--------------------------------------------------------------------------


    //-----------------------------------chromSlider--------------------------------------

    //Translation of the whole slider object wherever it is required
    var chromSlider = svgContainer_browsingSlider.append("g") //chromSlider is a group within svgContainer_browsingSlider, embedded after the foreign object so that it will appear over it
//                    .attr("class", "slider") //With the class "slider", to access it easily (more general than id which must be unique)
                    //.attr("transform", "translate(" + 0 + "," + svgContainer_browsingSlider.attr("height") / 2 + ")"); //Everything in it will be translated
    //--------------------------------------------------------------------------

    //--------------------------------miniatureOverlay------------------------------------
    //Addition of the interactive zone
    chromSlider.append("rect")
      .attr("class", "track-overlay") //Interactivity zone
//      .attr("width", miniatureSliderScale.range()[1])
      .attr("width", svgContainer_browsingSlider.attr("width")) //Clamping should work, not allowing to exceed the position even if the draging zone is wider
      .attr("height", 40)
      .attr("y",2*browsingBlocksDimensions.height+6 -4) //y position is the y position of the first miniature line, minus 4 as height = 40 = (10*3 + 2*1) + 8
      .style("fill-opacity",0)
      .attr("cursor", "ew-resize") //The pointer changes for a double edged arrow whenever it reaches that zone
        .call(d3.drag()
          .on("start drag", function() { slidingAlongBlocks(miniatureSliderScale.invert(d3.event.x)); }));
          //invert uses the same scale, but goes from range to domain, can be useful for returning data from mouse position : The container of a drag gesture determines the coordinate system of subsequent drag events, affecting event.x and event.y. The element returned by the container accessor is subsequently passed to d3.mouse or d3.touch, as appropriate, to determine the local coordinates of the pointer.
    //--------------------------------------------------------------------------


    //--------------------------------miniWindowHandle------------------------------------
    //Creation of the mini window handle, that translates the interaction into visual movement
    var miniWindowHandle = chromSlider.insert("rect", ".track-overlay")
        .attr("class", "handle")
        .style("stroke", d3.hcl(0,0,25))
        .style("stroke-width", browsingHandleDimensions.stroke)
        .attr("width", browsingHandleDimensions.width) //Reminder : the attributes have to be converted in numbers before being added + the width depends on the number of slider shown
        .attr("height", browsingHandleDimensions.height) //ATTENTION The slider should be cut at its extremities so that we always have a full display. IE if position cursor = 0, there is no blank on top of the blocks, and if position = end there is no blank at the bottom
        //Plus the width should be proportionnal to the zoom level and the number of blocks on display and therefore the total number of blocks
        .attr("x", 0)
        .attr("y", 2*browsingBlocksDimensions.height+6 - 3)
        .style("position", "absolute")
        .style("fill-opacity", 0);
    //--------------------------------------------------------------------------

    //ATTENTION THE HANDLE IS NOT RENDERED CORRECTLY WITH CHROME UNDER CERTAIN CONDITIONS (CF WINDOW WIDTH) and appears behind the canvas

    //About z-index:
    //https://developer.mozilla.org/en-US/docs/Web/CSS/z-index
    //http://www.dwuser.com/education/content/z-index-property-how-to-control-stacking-in-your-pages/
    //https://philipwalton.com/articles/what-no-one-told-you-about-z-index/

    //Depending on the canvas size the handle is rendered before or after : 997 < size <= 8193  => ca va bugguer

    //Something about stacking context
    //https://svgwg.org/svg2-draft/single-page.html#render-EstablishingStackingContex
    //https://developer.mozilla.org/fr/docs/Web/CSS/Comprendre_z-index/Empilement_de_couches

    //----------------------------drawingDisplay_Window()---------------------------------

    function drawingDisplay_Window(fullChrData, maxWidth, handle, genomesList, chromList, nucleotideWidth){
      //Draws the svg elements, but they have to be repositionned afterwards

      //Searching for the element on the far right of the non-displayed elements, which index is not within the display window thresholds, but whose width makes that it has to be displayed too.
      let underThresholdArray = fullChrData.filter( d => (Number(d.index) <= miniatureTicksScale.invert(handle.attr("x")) && (Number(d.index) >= miniatureTicksScale.invert(handle.attr("x"))-maxWidth) )); //Array of all the elements on the left side of the display window, and whose width are necessarily inferior or equal to the max feature size; it is the same with or without *nucleotideWidth so it is not necessary to write it

      let elementsWithIndexesWithinWindow = fullChrData.filter( d => ( (Number(d.index) >= miniatureTicksScale.invert(Number(handle.attr("x"))) ) && (Number(d.index) <= miniatureTicksScale.invert(Number(handle.attr("x"))+Number(handle.attr("width"))) ) )); //Here too *nucleotideWidth is unnecessary
//      console.log(elementsWithIndexesWithinWindow);

      let dataFiltered2View = [fullChrData[0]]; //ATTENTION It HAS to be an array for the sake of exit() and enter()

      //First element of the data is either the very first element of complete data set, or the righmost element within those that have an index smaller than the left threshold and that could be wide enough to be displayed anyway
      if (underThresholdArray.length != 0) {
        dataFiltered2View = [underThresholdArray[underThresholdArray.length-1]]; //the leftmost element to display, IF THE ARRAY IS ORDERED, ELSE Math.max() HAS TO BE USED ON EVERY NON DISPLAYED ELEMENTS!
      };
//      console.log(dataFiltered2View);
      //Selecting only the elements that would be visible within the display window, others are ignored and therefore will not be created
      elementsWithIndexesWithinWindow.forEach( d => dataFiltered2View.push(d) ); //Push everything that belongs to the display window within the data to render, no matter if it is empty as if an array is empty nothing can be pushed anyway

      //Drawing of the SVG for each element
      //PAV Matrix
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
      //Core / Disp track
      drawBlock.trackCoreDisp("#panChromosome_coreVSdispensable",
        dataFiltered2View,
        nucleotideWidth,
        displayedBlocksDimensions,
        0,
        function(d) {eventsImported.eventDisplayInfoOn(this, svgContainer_rawBlocks, d, displayedBlocksDimensions.height * 2)},
        function(d) {eventsImported.eventDisplayInfoOff(this, d)},
        coreThreshold,
        blueColorScale,
        orangeColorScale)
      //Position track
      drawBlock.trackPosition("#panChromosome_rainbowed",
        dataFiltered2View,
        nucleotideWidth,
        displayedBlocksDimensions,
        Number(d3.select("#panChromosome_coreVSdispensable").selectAll("rect").attr("y")) + displayedBlocksDimensions.height + 3,
        function(d) {eventsImported.eventDisplayInfoOn(this, svgContainer_rawBlocks, d, displayedBlocksDimensions.height * 2)},
        function(d) {eventsImported.eventDisplayInfoOff(this, d)},
        pseudoRainbowColorScale);
      //Occurences track
      drawBlock.trackOccurences("#panChromosome_similarCount",
        dataFiltered2View,
        nucleotideWidth,
        displayedBlocksDimensions,
        Number(d3.select("#panChromosome_rainbowed").selectAll("rect").attr("y")) + displayedBlocksDimensions.height + 3,
        function(d) {eventsImported.eventDisplayInfoOn(this, svgContainer_rawBlocks, d, displayedBlocksDimensions.height * 2)},
        function(d) {eventsImported.eventDisplayInfoOff(this, d)},
        greenColorScale);
//      for (var chr = 0; chr < chromList.length; ++chr) {drawingDisplay_similarityCircles(chr, dataFiltered2View);}; //Similarity proportions
      for (var chr = 0; chr < chromList.length; ++chr) {drawingDisplay_similarityBoxes(chr, dataFiltered2View, nucleotideWidth);};
    };
    //--------------------------------------------------------------------------

    //------------------------------slidingAlongBlocks()----------------------------------
    //Function called when dragging the slider's handle, its input "xPosition_displayedPixel" is derived from the pointer position, through miniatureSliderScale
    function slidingAlongBlocks(xPosition_displayedPixel) {
      let mouse_xPosition = Number(miniatureSliderScale(xPosition_displayedPixel));

      miniWindowHandle.attr("x", mouse_xPosition - browsingHandleDimensions.width/2); //Position change for the handle ATTENTION The scale is useful for not exceeding the max coordinates

      drawingDisplay_Window(dataGroupedPerChromosome[`${currentChromInView}`], currentWidestFeatureLength, miniWindowHandle, INITIAL_GENOMES_NAMES, CHROMOSOME_NAMES, currentNucleotidesWidthInPixel.effective); //Updating the visible SVG elements

      d3.selectAll(".moveableBlock").attr("x", d => Number(d.index) * currentNucleotidesWidthInPixel.effective - xPosition_displayedPixel);
      for (var chr = 0; chr < CHROMOSOME_NAMES.length; ++chr) {
        d3.select(`#duplicationBoxes_Chr${chr}`).selectAll("rect")
          .attr("x", d => Number(d.index)*currentNucleotidesWidthInPixel.effective - xPosition_displayedPixel  + (Number(d.FeatureStop)-Number(d.FeatureStart))*currentNucleotidesWidthInPixel.effective/2 - 0.5*(d[`copyPptionIn_Chr${chr}`]*((Number(d.FeatureStop)-Number(d.FeatureStart))*currentNucleotidesWidthInPixel.effective-2)));
//          .attr("x", d => (Number(d.index) - Number(xPosition_displayedPixel)) * currentNucleotidesWidthInPixel.effective + (Number(d.FeatureStop)-Number(d.FeatureStart))*currentNucleotidesWidthInPixel.effective/2 - 0.5*(d[`copyPptionIn_Chr${chr}`]*((Number(d.FeatureStop)-Number(d.FeatureStart))*currentNucleotidesWidthInPixel.effective-2)));
        }; //d => (Number(d.FeatureStop)-Number(d.FeatureStart))/2 + Number(d.index) - (d[`copyPptionIn_Chr${chr}`]*(Number(d.FeatureStop)-Number(d.FeatureStart)-2) )/2
//      d3.selectAll(".moveableCircle").attr("cx", d => Number(d.index) - xPosition_displayedPixel + (Number(d.FeatureStop)-Number(d.FeatureStart))/2);
    };
    //--------------------------------------------------------------------------

    //--------------------------------miniatureTicksScale---------------------------------

    //As miniatureSliderScale is cut at its tail for display reasons, it cannot be used as the scale for the ticks that will appear with the miniature
    var miniatureTicksScale = d3.scaleLinear() //Attaches to each threshold value a position on the slider
                  .domain([0, maxPositionInNucleotide])
                  .range([0, svgContainer_browsingSlider.attr("width")]) //Ranges from and to the miniature's extreme length values/positions as an output
                  .clamp(true); //.clamp(true) tells that the domains has 'closed' boundaries, that won't be exceeded, not sure if it is useful for a ticks axis

    svgContainer_browsingSlider.append("g") //Code adapted from https://bl.ocks.org/mbostock/9764126
                  .attr("id","miniatureTicks")
                  .style("font", "10px sans-serif")
                  .attr("transform", "translate(" + 0 + "," + 65 + ")") //Along with the rest of this svgContainer, this will have to be fixed with absolute px values
                  //.attr("font-family", "sans-serif").attr("font-size", "10px")
                  //.attr("class", "axis")
                  .call(d3.axisBottom(miniatureTicksScale)
                    .ticks(20) //More about ticks and axes here https://github.com/d3/d3-axis
                    .tickFormat(d3.format("~s"))); //More about format of numbers with D3 https://github.com/d3/d3-format
    //--------------------------------------------------------------------------


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    //End of the browsing slider
    /////////////////////////////////////////////////////////////////////////////////////////////////////////





    //Some code for enter, update and exit things :
    // http://bl.ocks.org/alansmithy/e984477a741bc56db5a5
    //https://bost.ocks.org/mike/join/
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



    //-----------------------------------legend_matrixPA----------------------------------

    //Text legend for the PA matrix
    svgContainer_legends.append("g").attr("id","legend_matrixPA_title")
            .append("text").attr("font-family", "sans-serif").attr("font-size", "10px")
              .attr("y","1em")
              .attr("x",svgContainer_legends.attr("width")/2).attr("text-anchor", "middle")
              .text("One column represents one panBlock")
//Uncomment when clustering is available !!!!
/*            .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
              .text("and genomes are clustered by ...")
              .attr("y","2em");
*/

    svgContainer_legends.append("g").attr("id", "legend_matrixPA_blocks")
                .append("g").attr("id","legend_matrixSchema");

//Uncomment when clustering is available !!!!
/*    //Drawing the false tree for the legend
    d3.select("#legend_matrixSchema").append("g")//.attr("id","legend_matrixPA_tree")
                .append("path").attr("d","M 0 25.5 H 15 M 15 37 H 43 M 15 14 H 25 M 25 21 H 43 M 25 7 H 43 M 15 14 V 37 M 25 7 V 21")
                .attr("stroke", "black"); //ATTENTION A H or V instruction does not ask for a difference but for a x or y absolute coordinate
*/

    //Adding the names of the genomes next to the legend tree
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
//Uncomment when clustering is available !!!!
/*            .attr("y", 37);

    //Drawing multiple blocks for the legend, not using canvas but paths
    d3.select("#legend_matrixSchema").append("g").attr("transform", "translate(10,0)")
                .append("path").attr("d","M 45 0 H 57 V 14 H 45 Z M 45 14 H 57 V 28 H 45 Z M 45 30 H 57 V 44 H 45 Z").attr("fill", functionColorScale(1))
              .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
                .attr("d","M 57 30 H 69 V 44 H 57 Z").attr("fill", functionColorScale(8))
              .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
                .attr("d","M 69 14 H 81 V 28 H 69 Z M 69 30 H 81 V 44 H 69 Z").attr("fill", functionColorScale(6))
              .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
                .attr("d","M 81 0 H 93 V 14 H 81 Z M 81 14 H 93 V 28 H 81 Z").attr("fill", functionColorScale(4))
              .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
                .attr("d","M 93 30 H 105 V 44 H 93 Z").attr("fill", functionColorScale(5));
                //ATTENTION The colours depends on the values accepted by functionColorScale, if it is linked to GO number this have to be modified
*/

//Erase these paths when blocks are clustered !
    //Drawing multiple blocks for the legend, not using canvas but paths
    d3.select("#legend_matrixSchema").append("g").attr("transform", "translate(10,0)")
                .append("path").attr("d","M 45 0 H 57 V 14 H 45 Z M 45 14 H 57 V 28 H 45 Z M 45 28 H 57 V 42 H 45 Z").attr("fill", functionColorScale(1))
              .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
                .attr("d","M 57 28 H 69 V 42 H 57 Z").attr("fill", functionColorScale(8))
              .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
                .attr("d","M 69 14 H 81 V 28 H 69 Z M 69 28 H 81 V 42 H 69 Z").attr("fill", functionColorScale(6))
              .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
                .attr("d","M 81 0 H 93 V 14 H 81 Z M 81 14 H 93 V 28 H 81 Z").attr("fill", functionColorScale(4))
              .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
                .attr("d","M 93 28 H 105 V 42 H 93 Z").attr("fill", functionColorScale(5));
                //ATTENTION The colours depends on the values accepted by functionColorScale, if it is linked to GO number this have to be modified

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
    //--------------------------------------------------------------------------

    //----------------------------------legend_zoomLevel----------------------------------

    //Group for the zoom slider and its legend
    svgContainer_legends.append("g").attr("id", "legend_zoomLevel")
        .attr("transform", "translate("+eval(Number(svgContainer_legends.attr("width"))/2)+","+eval(30 + 20 + d3.select("#legend_matrixSchema").node().getBBox().height) +")")
        .append("text").attr("font-family", "sans-serif").attr("font-size", "10px")
          .text("Zoom level").attr("text-anchor", "middle");

    var zoomSlider = d3.select("#legend_zoomLevel").append("g").attr("transform","translate(0,8)");

    //Scale use for the zoom slider
    var zoomScale = d3.scaleLinear() //Linear Scale in two parts as low values are more important than "high" values that would not be displayed properly anyway, it has the number of features to display as an input
                .domain([dataGroupedPerChromosome[`${currentChromInView}`].length, 150, featureNbDependingOnNtWidth(Number(svgContainer_presenceAbsenceMatrix.attr("width")), currentNucleotidesWidthInPixel.max, dataGroupedPerChromosome[`${currentChromInView}`])]) //Last pivot is the "number" of features displayed when nt width == 10px
                .range([-90, -30, 90]) //Ranges from and to the miniature's extreme length values/positions as an output
                .clamp(true); //.clamp(true) tells that the domains has 'closed' boundaries, that won't be exceeded, not sure if it is useful for a ticks axis

    //Drawing the zoom slider
    zoomSlider.append("path").attr("d", "M -90 11 L 90 4 V 18 Z").style("fill", d3.hcl(0,0,50));
    zoomSlider.append("rect").attr("x", -90).attr("y",0).attr("height", 22).attr("width", zoomScale.range()[1]-zoomScale.range()[0]) //That width depends on the efficiency limit, arbitrarily set to 150 for now
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
      zoomSlider.select("line").attr("x1", zoomScale(nbOfFeatures)).attr("x2", zoomScale(nbOfFeatures)); //as the first line of zoomSlider is the one we want, there is no use to specify more

      //Updating the value of the nucleotideWidth
      currentNucleotidesWidthInPixel.effective = ntWidthDependingOnFeatureNb(Number(svgContainer_presenceAbsenceMatrix.attr("width")), nbOfFeatures, dataGroupedPerChromosome[`${currentChromInView}`]);

      //Changing the size of the miniWindowHandle
      browsingHandleDimensions.width = svgContainer_browsingSlider.attr("width") * (svgContainer_rawBlocks.attr("width")/(maxPositionInNucleotide*currentNucleotidesWidthInPixel.effective));
      miniWindowHandle.attr("width", browsingHandleDimensions.width);

      //Updating the range of SliderScale
      miniatureSliderScale.range([0+browsingHandleDimensions.width/2, svgContainer_browsingSlider.attr("width")-browsingHandleDimensions.width/2]);
      miniatureSliderScale.domain([0, maxPositionInNucleotide*currentNucleotidesWidthInPixel.effective - svgContainer_rawBlocks.attr("width")]);

      //Changing the x position so that the handle will not exceed the miniature dimensions
      if (Number(miniWindowHandle.attr("x"))+Number(miniWindowHandle.attr("width")) > Number(svgContainer_browsingSlider.attr("width"))) {
        //Changing the x position so that the handle will not exceed the miniature dimensions
        miniWindowHandle.attr("x", Number(svgContainer_browsingSlider.attr("width"))-Number(miniWindowHandle.attr("width")));
      };

      //Updating the blocks that have to be displayed
      drawingDisplay_Window(dataGroupedPerChromosome[`${currentChromInView}`], currentWidestFeatureLength, miniWindowHandle, INITIAL_GENOMES_NAMES, CHROMOSOME_NAMES, currentNucleotidesWidthInPixel.effective);

      //And their positions
      //Using Number(miniWindowHandle.attr("x"))+Number(miniWindowHandle.attr("width"))/2 as it is the position of the center of the windowHandle that gives the position of the first pixel to display, through miniatureSliderScale
      d3.selectAll(".moveableBlock").attr("x", d => Number(d.index) * currentNucleotidesWidthInPixel.effective - miniatureSliderScale.invert(Number(miniWindowHandle.attr("x"))+Number(miniWindowHandle.attr("width"))/2) );
      for (var chr = 0; chr < CHROMOSOME_NAMES.length; ++chr) {
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
    //--------------------------------------------------------------------------



    //About Dropdown menu with javascript and D3 js : http://bl.ocks.org/feyderm/e6cab5931755897c2eb377ccbf9fdf18
    //Other example : https://codepen.io/tarsusi/pen/reovOV
    // Properties of a "select" object : https://www.w3schools.com/jsref/dom_obj_select.asp
    //Styling a dropdown menu only with CSS : https://codepen.io/ericrasch/pen/zjDBx

    svgContainer_coreSlider.append("g").attr("id","ChromSelectionGroup").append("text").attr("id","ChromSelectionLabel")
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px")
//        .attr("transform", "translate("+ eval(Number(svgContainer_coreSlider.attr("width"))/3*2-1) +","+72+")") //Keeping the value outside of quotes is needed for its calculation
        .attr("dy", "1.2em")
        .attr("text-anchor", "start")
        .attr("dominant-baseline", "middle")
        .text("Chromosome on display:");

//    d3.select("#ChromSelectionLabel").node().getBBox();


    //------------------------------foreignObject_Dropdown--------------------------------

    //Foreign object allows to incorporate objects that are not SVGs into an SVG window
    //https://gist.github.com/mbostock/1424037
    var foreignObject_Dropdown = d3.select("#ChromSelectionGroup").append("foreignObject")
//        .attr("width", svgContainer_coreSlider.attr("width")/2 -1)
//        .attr("width", 40) //33 - 16 = 17 px for the arrow
        .attr("height", 26)
//        .attr("x", svgContainer_coreSlider.attr("width")/3*2 +1)
        .attr("x", d3.select("#ChromSelectionLabel").node().getBBox().width +2)
//        .attr("y", 0 - foreignObject_Browser.attr("height")/2) //It has to be centered depending on the canvas and miniature count
//        .attr("y", 0 - (browsingBlocksDimensions.height*3 + browsingBlocksDimensions.borderSpace*(3-1))/2) //It has to be centered depending on the canvas and miniature count
//        .attr("y", 60) //It has to be centered depending on the canvas and miniature count
        //.attr("transform", "translate(" + 0 + "," + svgContainer_browsingSlider.attr("height") / 2 + ")") //The foreign object is centered within svgContainer_browsingSlider
        .attr("class","UFO");
    //--------------------------------------------------------------------------

    //---------------------------------dropdownChromChoice--------------------------------

    var dropdownChromChoice = foreignObject_Dropdown.append("xhtml:select").attr("id","dropdownChromChoice").style("font", "10px sans-serif");

    //A possible solution to styling the options according to the select element : https://stackoverflow.com/questions/41244238/firefox-dropdown-option-font-size-not-being-rendered

    CHROMOSOME_NAMES.forEach(function(d,i) {
      dropdownChromChoice.append("option").attr("value",d).text(d);
    });

    //Centering the label and 'select' group
    d3.select("#ChromSelectionGroup").attr("transform", "translate("+ 0 +","+0+")"); //offsetWidth is only defined AFTER the group transformation for some reasons...
    foreignObject_Dropdown.attr("width", d3.select("#dropdownChromChoice").node().offsetWidth); //offsetWitdh is the automatic width of the 'select' element
    d3.select("#ChromSelectionGroup").attr("transform", "translate("+ eval((Number(svgContainer_coreSlider.attr("width")) - d3.select("#ChromSelectionLabel").node().getBBox().width-d3.select("#dropdownChromChoice").node().offsetWidth)/2) +","+60+")"); //eval is useful for the interpretation of the JS code within the string


    dropdownChromChoice.on("change", function(d) {

      //Updating var currentChromInView
      currentChromInView = dropdownChromChoice.node().value; //Accessing the value registered by the dropdown menu
//      console.log(currentChromInView);

      //Updating information directly dependant of currentChromInView
      currentWidestFeatureLength = Math.max(...dataGroupedPerChromosome[`${currentChromInView}`].map( d => Number(d.FeatureStop) - Number(d.FeatureStart)));
      maxPositionInNucleotide = Math.max(...dataGroupedPerChromosome[`${currentChromInView}`].map(d => Number(d.FeatureStop)));

      //Updating the correspondance position / color if no info of function
      if (functionDiversity.length === 1) {
        correspondancePosColor = new Map();
        dataGroupedPerChromosome[`${currentChromInView}`].forEach( function(d,i) {
          correspondancePosColor.set(d.FeatureStart, i);
        });
      };

      //Updating the zoom information
      currentNucleotidesWidthInPixel.minGlobal = Number(svgContainer_presenceAbsenceMatrix.attr("width"))/maxPositionInNucleotide;
      currentNucleotidesWidthInPixel.minEfficiency = ( ntWidthDependingOnFeatureNb(Number(svgContainer_presenceAbsenceMatrix.attr("width")), 150, dataGroupedPerChromosome[`${currentChromInView}`]) > currentNucleotidesWidthInPixel.minGlobal ? ntWidthDependingOnFeatureNb(Number(svgContainer_presenceAbsenceMatrix.attr("width")), 150, dataGroupedPerChromosome[`${currentChromInView}`]) : currentNucleotidesWidthInPixel.minGlobal*1.001 );
      //currentNucleotidesWidthInPixel.minEfficiency = ( ntWidthDependingOnFeatureNb(Number(svgContainer_presenceAbsenceMatrix.attr("width")), 150, dataGroupedPerChromosome[`${currentChromInView}`]) > currentNucleotidesWidthInPixel.minGlobal ? ntWidthDependingOnFeatureNb(Number(svgContainer_presenceAbsenceMatrix.attr("width")), 150, dataGroupedPerChromosome[`${currentChromInView}`]) : currentNucleotidesWidthInPixel.minGlobal*0.999 );
      if (currentNucleotidesWidthInPixel.effective < currentNucleotidesWidthInPixel.minGlobal) { currentNucleotidesWidthInPixel.effective = currentNucleotidesWidthInPixel.minGlobal }; //Changing the zoom value only if it exceeds the total length of the new chromosome

      //Updating every display property/function depending on currentChromInView
      greenColorScale.domain([1,Math.max(...dataGroupedPerChromosome[`${currentChromInView}`].map(d => d.SimilarBlocks.split(";").length))]);
      pseudoRainbowColorScale.domain(domainPivotsMaker(pseudoRainbowList.length,Math.max(...dataGroupedPerChromosome[`${currentChromInView}`].map(d => Number(d.FeatureStart)))));
//      browsingBlocksDimensions.width = svgContainer_browsingSlider.attr("width")/dataGroupedPerChromosome[`${currentChromInView}`].length)+1;
      browsingHandleDimensions.width = svgContainer_browsingSlider.attr("width") * (svgContainer_rawBlocks.attr("width")/(maxPositionInNucleotide*currentNucleotidesWidthInPixel.effective));
//      console.log(browsingHandleDimensions.width);
//      browsingHandleDimensions.nucleotideMargin = maxPositionInNucleotide / dataGroupedPerChromosome[`${currentChromInView}`].length *2;
//      console.log(browsingHandleDimensions.nucleotideMargin);
      miniatureSliderScale.domain([0, maxPositionInNucleotide*currentNucleotidesWidthInPixel.effective - svgContainer_rawBlocks.attr("width")]);
      miniatureSliderScale.range([0+browsingHandleDimensions.width/2, svgContainer_browsingSlider.attr("width")-browsingHandleDimensions.width/2]);
      miniatureTicksScale.domain([0, maxPositionInNucleotide]);

      //Displaying everything that changed again
      //For the zoomSlider
      zoomSlider.select("line").attr("x1", zoomScale(featureNbDependingOnNtWidth(Number(svgContainer_presenceAbsenceMatrix.attr("width")), currentNucleotidesWidthInPixel.effective, dataGroupedPerChromosome[`${currentChromInView}`]))).attr("x2", zoomScale(featureNbDependingOnNtWidth(Number(svgContainer_presenceAbsenceMatrix.attr("width")), currentNucleotidesWidthInPixel.effective, dataGroupedPerChromosome[`${currentChromInView}`])))

      //For the miniature
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
    //--------------------------------------------------------------------------

    //----------------------------matrixPA, attributes & labels---------------------------

    //Creation of the subGroup for the PA blocks
    //Creation of the subgroup for the the repeated blocks (cf dataGroupedPerChromosome[`${currentChromInView}`][`copyPptionIn_Chr${chr}`])
    //ATTENTION The for ... in statement does not work well when order is important ! Prefer .forEach method instead when working on arrays
    //See : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in

    INITIAL_GENOMES_NAMES.forEach(function(geno, genomeNumber) {
      var matrixPA = svgContainer_presenceAbsenceMatrix.append("g").attr("id", `presence_${geno}`);

      var genomeLabels = svgContainer_genomesTree.append("text").attr("id", `${geno}_label`).attr("font-family", "sans-serif").attr("font-size", "10px")
            .attr("y", (d,i) => (genomeNumber+0.5)*displayedBlocksDimensions.height).attr("dominant-baseline", "middle") //As y is the baseline for the text, we have to add the block height once more, /2 to center the label
            .attr("x",svgContainer_genomesTree.attr("width")-3).attr("text-anchor", "end")
            .text(d => `${geno}`);
    });

    //--------------------------------------------------------------------------

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Creation of a slider for scrolling the PA Matrix
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    //The slider will be created only if needed, supposes that the svg size will not change, though

    //--------------------------presenceAbsenceMatrixSliderScale--------------------------

    //1st create a scale that links a value to a position in pixel
    var presenceAbsenceMatrixSliderScale = d3.scaleLinear() //Attaches to each threshold value a position on the slider
        .domain([0, displayedBlocksDimensions.height*INITIAL_GENOMES_NAMES.length-svgContainer_presenceAbsenceMatrix.attr("height")]) //Assuming that the total height of the display is 'displayedBlocksDimensions.height*INITIAL_GENOMES_NAMES.length'; this corresponds to the y position of the top of the svgContainer
        .range([0, svgContainer_presenceAbsenceMatrix.attr("height")-20]) //The scrolling bar will have approximately the same height than the PA matrix svg
        .clamp(true); //.clamp(true) tells that the domains has 'closed' boundaries, that won't be exceeded
    //--------------------------------------------------------------------------

    //---------------------------presenceAbsenceScrollingSlider---------------------------

    var presenceAbsenceScrollingSlider = svgContainer_presenceAbsenceMatrix.append("g").attr("class","fadingScrollingBar")
//                    .style("position", "relative").style("z-index",10) //The slider group is positionned in order to have an effective z-index, that will show it in front of every other object within svgContainer_presenceAbsenceMatrix (as the PA blocks do not have any z-index). That's theory, in practice I create it after the creation of the subgroup for the PA matrix and it is just fine
                    .style("opacity", 0)
                    .style("display", (displayedBlocksDimensions.height*INITIAL_GENOMES_NAMES.length > svgContainer_presenceAbsenceMatrix.attr("height") ? "block" : "none")) //The scroll bar will always exist, but will be displayable only if there is something to scroll (ie size of the image > size of the svgContainer)
                    .attr("transform", "translate(" + eval(svgContainer_presenceAbsenceMatrix.attr("width")-10) + "," + 10 + ")"); //Everything in it will be translated
    //--------------------------------------------------------------------------

    //---------------------------presenceAbsenceScrollingBar------------------------------

    //Drawing of the line for the scrolling bar
    //The contour
    presenceAbsenceScrollingSlider.append("line")//.attr("class","fadingScrollingBar") //That class will be used to react to a hovering event
      .attr("y1", 0)
      .attr("y2", presenceAbsenceMatrixSliderScale.range()[1])
      .attr("stroke-linecap","round")
      .attr("stroke-width", "10px")
//      .style("position", "absolute") //I still don't get how this works, it seems a bit random OH GOSH THE OPACITY THAT IS WHY
//      .style("z-index", 10)
      .attr("stroke", d3.hcl(0,0,25))
      .attr("stroke-opacity", 0.3);

    //The fill
    presenceAbsenceScrollingSlider.append("line")//.attr("class","fadingScrollingBar")
      .attr("y1", 0)
      .attr("y2", presenceAbsenceMatrixSliderScale.range()[1])
      .attr("stroke-linecap","round")
      .attr("stroke-width", "8px")
      .attr("stroke", d3.hcl(0,0,95));
    //--------------------------------------------------------------------------

    //-------------------------scrollingBar_PresenceAbsenceHandle-------------------------

    //Creation of the handle circle, thats translates the interaction into visual movement
    var scrollingBar_PresenceAbsenceHandle = presenceAbsenceScrollingSlider.append("circle")//.attr("id", "scrollingBar_PA_Handle")//.attr("class","fadingScrollingBar")
        .attr("r", 7) //The radius
        .attr("fill", d3.hcl(0,0,100)) //The circle is filled in white
        .attr("stroke", d3.hcl(0,0,25))
        .attr("cy", 0)
        .attr("stroke-opacity", 0.3)
        .attr("stroke-width", "1.25px");
//        .style("visibility","hidden");
    //--------------------------------------------------------------------------

    //------------------------------presenceAbsenceOverlay--------------------------------

    //Addition of the interactive zone
    presenceAbsenceScrollingSlider.append("line")
      .attr("y1", -10)
      .attr("y2", presenceAbsenceMatrixSliderScale.range()[1]+10) //The interactivity zone will have the same height than svgContainer_presenceAbsenceMatrix
      //.attr("stroke-linecap","round")
      .attr("stroke-width", "120px") //As the line is centered, this width is /2 if we consider only the space to the left of the slider
      .attr("stroke", "transparent") //That zone is made invisible, but is still displayed over its parent lines/slider bars
      .attr("cursor", "ns-resize") //The pointer changes for a double-edged arrow whenever it reaches that zone
        .call(d3.drag()
            .on("start drag", function() { eventScrollingPresenceAbsence(presenceAbsenceMatrixSliderScale.invert(d3.event.y)); }))
        .on("mouseover", function() {d3.selectAll(".fadingScrollingBar").transition().style("opacity",1)})
        .on("mouseout", function() {d3.selectAll(".fadingScrollingBar").transition().style("opacity",0)});
        //About transitions : http://bl.ocks.org/Kcnarf/9e4813ba03ef34beac6e
    //--------------------------------------------------------------------------

    //---------------------------eventScrollingPresenceAbsence()--------------------------

    //Function called when dragging the slider's handle, its input "yPositionOfTop" is derived from the pointer position
    function eventScrollingPresenceAbsence(yPositionOfTop) {
      /*if (isScrolling === true) {
        console.log("Je bouuuuge pas");
        scrollingBar_PresenceAbsenceHandle.attr("cy", presenceAbsenceMatrixSliderScale(yPositionOfTop) -10); //Position change for the handle, -10 as the scrolling slider scale does not start at 0, and only when the function is called when scrolling the slider
      };*/
      scrollingBar_PresenceAbsenceHandle.attr("cy", presenceAbsenceMatrixSliderScale(yPositionOfTop) ); //Position change for the handle

      INITIAL_GENOMES_NAMES.forEach(function(geno, genomeNumber) {
        svgContainer_presenceAbsenceMatrix.select(`#presence_${geno}`).selectAll("rect")
            .attr("y", (d,i) => genomeNumber*displayedBlocksDimensions.height - yPositionOfTop); //Of course this y position will not be exactly the same if the genomes are clustered with space between them

        svgContainer_genomesTree.select(`#${geno}_label`)
              .attr("y", (d,i) => (genomeNumber+0.5)*displayedBlocksDimensions.height - yPositionOfTop); //idem
      });
    };
    //--------------------------------------------------------------------------

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    //End of the PA Matrix scrolling bar
    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    //---------------------------------blocks & attributes--------------------------------

    //Binding the data to a DOM element, therefore creating one SVG block per data
    blocksDisplay.append("g").attr("id","panChromosome_coreVSdispensable"); //.append("g") allows grouping svg objects

    //--------------------------------------------------------------------------

    //Binding the data to a DOM element, therefore creating one SVG block per data
    blocksDisplay.append("g").attr("id","panChromosome_rainbowed");

    //--------------------------------------------------------------------------

    //Binding the data to a DOM element, therefore creating one SVG block per data
    blocksDisplay.append("g").attr("id","panChromosome_similarCount");

    //--------------------------------------------------------------------------


    //Creation of the fading legend blocks for the bottom part

    //ATTENTION This was not fully working as I forgot a ";" on the previous line !!!! Remember to ALWAYS put them !
    ["Left","Right"].forEach( function(position) {

      svgContainer_rawBlocks.append("g").attr("class","fadingLabel")
                        .attr("cursor", "default")
                        .attr("id",`panChromLegend_${position}`)
                        .on("mouseover", function() {d3.select(this).transition().style("opacity",0)})
                        .on("mouseout", function() {d3.select(this).transition().style("opacity",1)});
      //This was not working because I forgot an ";" before the .forEach() line

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


    //----------------------------similarityBoxes & attributes----------------------------

    //Creation of the repeats blocks
    function drawingDisplay_similarityBoxes(chr, dataPart, nucleotideWidth) {

      //Binding the data to a DOM element
      let newData = d3.select(`#duplicationBoxes_Chr${chr}`).selectAll("rect")
            .data(dataPart);

      newData.exit().remove(); //Removing residual data

      //Selecting all previous blocks, and determining their attributes
      newData.enter()
          .append("rect")
          .attr("class", "moveableBoxes")
          .attr("y", (d,i) => Number(d3.select("#panChromosome_similarCount").select("rect").attr("y")) + (4+chr)*displayedBlocksDimensions.height) //Each line corresponds to a chromosome
          //.style("fill", d3.hcl(0,0,25))
          //As the color will now depend on the x index, it will be styled within "merge", idem for the stroke
          .attr("height", d => displayedBlocksDimensions.height )
          //.style("stroke", d3.hcl(0,0,25))
          .style("stroke-width", 0.5)
//          .on("mouseover", eventDisplayInfoOn) //Link to eventDisplayInfoOn whenever the pointer is on the block
//          .on("mouseout", eventDisplayInfoOff) //Idem with eventDisplayInfoOff
        .merge(newData) //Combines enter() and 'update()' selection, to update both at once
          .attr("x", d => (Number(d.FeatureStop)-Number(d.FeatureStart))*nucleotideWidth/2 + Number(d.index)*nucleotideWidth - (d[`copyPptionIn_Chr${chr}`]*((Number(d.FeatureStop)-Number(d.FeatureStart))*nucleotideWidth-2)) /2 ) //Depends on the data index and the block's width, those boxes are centered !
          .attr("width", d => d[`copyPptionIn_Chr${chr}`]*((Number(d.FeatureStop)-Number(d.FeatureStart))*nucleotideWidth-2)) //The width can be equal to 0, but cannot exceed the total width of the block (margin of 1px); should be modified depending on the zoom
          //.style("fill", d => greenColorScale(d.SimilarBlocks.split(";").length))
          .style("fill", function(d) {
            //let color = d3.hcl(greenColorScale(d.SimilarBlocks.split(";").length));
            let color = d3.hcl(greenColorScale.range()[1]);
            color.h = 180; //In order to turn it turquoise
            color.l = 100-(d[`copyPptionIn_Chr${chr}`]*100*0.75);
            return color;
          })
          //.style("fill-opacity", d => d[`copyPptionIn_Chr${chr}`]*0.75) //The filling is directly dependant to the repartition of the similarities
          .style("stroke", function(d) {
            let color = d3.hcl(greenColorScale(d.SimilarBlocks.split(";").length));
            color.l = color.l-20;
            color.h = 180; //In order to turn it turquoise
            return color;
          })
          .style("stroke-opacity", d => (d[`copyPptionIn_Chr${chr}`] > 0 ? 0.8 : 0) ); //The stroke will be displayed only if there is filling, and always has the same opacity so that even chrom with few repetitions will be visible
    };
    //--------------------------------------------------------------------------

    //Creation of the DOM group for the repetitions boxes, and the background lines
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