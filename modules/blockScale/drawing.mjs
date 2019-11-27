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