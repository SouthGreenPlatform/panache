import {thresholdBasedColor} from '../colorScales.mjs';

/**
 * @fileOverview    Modules for drawing and display functions
 *
 * @author          Eloi Durant
 *
 * @requires        EXTERNAL:{@link https://d3js.org} Version 5.4.0.
 *                  Copyright 2018 Mike Bostock.
 */

//--------------------------------miniatureBg()---------------------------------

export function miniatureBg(canvas, canvasContext, chromData, svgWidth,
    rightmostNt, genomeNames, blockDims, coreThreshold, funcDiv, colorMap,
    funcColScale, coreColor, dispColor, rainbow, simiScale) {

    let t0 = performance.now();
    let nbOfGenomes = genomeNames.length;

    //Clear existing canvas
    canvasContext.clearRect(0, 0, canvas.attr("width"), canvas.attr("height"));

    //Drawing the function histogram
    chromData.forEach((d,i) => {

      let presenceRatio = (nbOfGenomes-d.presenceCounter)/nbOfGenomes;
      let xPos = svgWidth * Number(d.index)/rightmostNt;
      let blockWidth = svgWidth * (Number(d.FeatureStop)-Number(d.FeatureStart))/rightmostNt+1;
      let trackHeight = blockDims.height;


      //Colouring white blocks (those are used to overlay the coloured blocks that have a width slightly larger than what they should have, in order to show no gap within the miniature)
      canvasContext.fillStyle = "#FFF";
      canvasContext.fillRect(xPos,
        0,
        blockWidth,
        presenceRatio * 2*trackHeight); //fillRect(x, y, width, height)

      //Colouring the function blocks, rainbow style if there is no functionnal info
      if (funcDiv.length === 1) {
          canvasContext.fillStyle = d3.interpolateRainbow( ( colorMap.get(d["FeatureStart"])%14 )/14 )
      } else {
          canvasContext.fillStyle = funcColScale(d["Function"]);
      };

      canvasContext.fillRect(xPos,
          presenceRatio * 2*trackHeight,
          blockWidth,
          2*trackHeight - presenceRatio * 2*trackHeight); //fillRect(x, y, width, height)


      //Drawing the core/disp miniature
      //Here we chose a yes/no colorScale instead of the one used in the display, for a better readibility
      if (Number(d.presenceCounter) === 0) {
        canvasContext.fillStyle = "#fff";
      } else if (Number(d.presenceCounter) >= coreThreshold) {
        canvasContext.fillStyle = coreColor.range()[1];
      } else {
        canvasContext.fillStyle = dispColor.range()[1];
      };

      canvasContext.fillRect(xPos,
          2*trackHeight+6,
          blockWidth,
          trackHeight); //fillRect(x, y, width, height)


      //Drawing the rainbow miniature
      canvasContext.fillStyle = rainbow(Number(d.FeatureStart));

      canvasContext.fillRect(xPos,
          2*trackHeight+6 + trackHeight+1,
          blockWidth,
          trackHeight);


      //Drawing the similarity miniature
      canvasContext.fillStyle = simiScale(Number(d.SimilarBlocks.split(";").length));

      canvasContext.fillRect(xPos,
          2*trackHeight+6 + (trackHeight+1)*2,
          blockWidth,
          trackHeight);
    });

    let t1 = performance.now();

    console.log("Call to draw Miniature took " + (t0 - t1) + " milliseconds.");

};

//-----------------------------pavBlocks_genome()-------------------------------

export function pavBlocks(geno, genomeNumber, dataPart,
    nucleotideWidth, blockDims, sliderScale, handle, funcDiv, colorMap,
    funcColScale) {

    let newData = d3.select(`#presence_${geno}`).selectAll("rect")
          .data(dataPart); //There is one rect per (genome x PA block), not just per genome

    newData.exit().remove(); //Removing residual dom elements linked to unbound data

    //entered data are common for every elements of this kind, and will not need to be updated
    //Here such attributes are set
    newData.enter().append("rect")
            .attr("class", "moveableBlock")
            .attr("height", blockDims.height)
            //y is incremented for each new genome, and depends on the position of the scroll bar's handle if existing
            .attr("y", genomeNumber*blockDims.height - sliderScale.invert(Number(handle.attr("cy"))) )

        .merge(newData) //Combines enter() and 'update()' selection, to update both at once
          .attr("x", (d,i) => Number(d.index)*nucleotideWidth) //x is the position of the block within the filtered dataset (that is why index is used instead of FeatureStart), with the width of nucleotides taken into account
          .attr("width", d => (Number(d.FeatureStop)-Number(d.FeatureStart))*nucleotideWidth)
          .style("fill", (d,i) => (funcDiv.length === 1 ? d3.interpolateRainbow((colorMap.get(d["FeatureStart"])%14)/14) : funcColScale(d["Function"]))) //Do not forget the ""... Also if there is the same "function" for every block within the pangenome then each block will be painted with a rainbow color which differs from those of its neighbours
          .style("fill-opacity", d => d[`${geno}`]); //Opacity is linked to the value 0 or >=1 of every genome
};

//------------------------------trackCoreDisp()---------------------------------

export function trackCoreDisp(selectedID, dataPart, nucleotideWidth, blockDims,
    yPos, eventOn, eventOff, coreThreshold, colorScaleLess, colorScaleMore) {

    //Binding the data to a DOM element, therefore creating one SVG block per data
    let newData = d3.select(selectedID).selectAll("rect") //First an empty selection of all not yet existing rectangles
          .data(dataPart); //Joining data to the selection, one rectangle for each as there is no key. It returns 3 virtual selections : enter, update, exit. The enter selection contains placeholder for any missing element. The update selection contains existing elements, bound to data. Any remaining elements ends up in the exit selection for removal.

          //For more about joins, see : https://bost.ocks.org/mike/join/

    newData.exit().remove(); //Removing residual data

    //Selecting all previous blocks, and determining their attributes
    newData.enter() //The D3.js Enter Method returns the virtual enter selection from the Data Operator. This method only works on the Data Operator because the Data Operator is the only one that returns three virtual selections. However, it is important to note that this reference only allows chaining of append, insert and select operators to be used on it.
        .append("rect") //For each placeholder element created in the previous step, a rectangle element is inserted.
        .attr("class", "moveableBlock")
        .attr("height", blockDims.height)
        .attr("y", yPos)
        .on("mouseover", eventOn) //Link to eventDisplayInfoOn whenever the pointer is on the block
        .on("mouseout", eventOff) //Idem with eventDisplayInfoOff
      .merge(newData) //Combines enter() and 'update()' selection, to update both at once
        .attr("x", (d,i) => Number(d.index) * nucleotideWidth)
        .attr("width", d => ( Number(d.FeatureStop) - Number(d.FeatureStart) ) * nucleotideWidth)
        .style("fill", (d) => thresholdBasedColor(d.presenceCounter,coreThreshold,colorScaleLess,colorScaleMore));
};

//-------------------------------trackPosition()--------------------------------

export function trackPosition(selectedID, dataPart, nucleotideWidth, blockDims,
    yPos, eventOn, eventOff, colorScale) {

  //Binding the data to a DOM element
  let newData = d3.select(selectedID).selectAll("rect")
        .data(dataPart);

  newData.exit().remove(); //Removing residual data

  //Selecting all previous blocks, and determining their attributes
  newData.enter()
      .append("rect") //For each placeholder element created in the previous step, a rectangle element is inserted.
      .attr("class", "moveableBlock")
      .attr("height", blockDims.height)
      .attr("y", yPos)
      .on("mouseover", eventOn) //Link to eventDisplayInfoOn whenever the pointer is on the block
      .on("mouseout", eventOff) //Idem with eventDisplayInfoOff
    .merge(newData) //Combines enter() and 'update()' selection, to update both at once
      .attr("x", (d,i) => Number(d.index) * nucleotideWidth)
      .attr("width", d => (Number(d.FeatureStop) - Number(d.FeatureStart)) * nucleotideWidth)
      .style("fill", (d => colorScale(Number(d.FeatureStart))));
};

//------------------------------trackOccurences()-------------------------------

export function trackOccurences(selectedID, dataPart, nucleotideWidth, blockDims,
    yPos, eventOn, eventOff, colorScale) {

  //Binding the data to a DOM element
  let newData = d3.select(selectedID).selectAll("rect")
        .data(dataPart);

  newData.exit().remove(); //Removing residual data

  //Selecting all previous blocks, and determining their attributes
  newData.enter()
      .append("rect") //For each placeholder element created in the previous step, a rectangle element is inserted.
      .attr("class", "moveableBlock")
      .attr("height", blockDims.height)
      .attr("y", yPos)
      .on("mouseover", eventOn) //Link to eventDisplayInfoOn whenever the pointer is on the block
      .on("mouseout", eventOff) //Idem with eventDisplayInfoOff
    .merge(newData) //Combines enter() and 'update()' selection, to update both at once
      .attr("x", (d,i) => Number(d.index) * nucleotideWidth)
      .attr("width", d => (Number(d.FeatureStop) - Number(d.FeatureStart)) * nucleotideWidth)
      .style("fill", (d => colorScale(d.SimilarBlocks.split(";").length)));
};