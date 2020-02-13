import {thresholdBasedColor} from './colorScales.mjs';

/**
 * @fileOverview    Modules for events related to a visualization tool
 *
 * @author          Eloi Durant
 *
 * @requires        EXTERNAL:{@link https://d3js.org} Version 5.4.0.
 *                  Copyright 2018 Mike Bostock.
 */

//-----------------------------createHoverTooltip()-----------------------------

// svgContainer = svgContainer_rawBlocks
// data = d
// distance2pointer = displayedBlocksDimensions.height*2
//can be called in singleView.js with function(d) {eventsImported.createHoverTooltip(this, svgContainer_rawBlocks, d, displayedBlocksDimensions.height*2)},
function createHoverTooltip(svgObject, svgContainer, data, distance2pointer) {
  //Takes most of its code from http://bl.ocks.org/WilliamQLiu/76ae20060e19bf42d774
  //http://bl.ocks.org/phil-pedruco/9032348 was useful too

  //Creates a hollow tooltip, hidden at first
  svgContainer.append("text")
    .attr("id", "textThatDisplaysInformationOnBlock_" + data.index)
    .attr("font-family", "sans-serif")
    //At first the text is not displayed in order to get its dimensions first
    .attr("x", svgContainer.attr("width") + 1)
    //Originally, 'this' is supposed to be the svg element on which the event is called
    .attr("y", Number(d3.select(svgObject).attr("y")) + distance2pointer)
    //ATTENTION The text should not appear where the mouse pointer is, in order to not disrupt the mouseover event
//    .attr("dominant-baseline", "middle") //Vertical alignment
    .attr("text-anchor", "start"); //Can be "start", "middle", or "end"
};
//------------------------------------------------------------------------------

//--------------------------------highlightSvg()--------------------------------

function highlightSvg(svgObject) {

  let color = d3.hcl(d3.select(svgObject).style('fill'));//It's important to precise d3.hcl() to use .h .c or .l attributes

  color.h = color.h + 10; //Slight change in hue for better noticing
  color.c = color.c * 1.1; //Slight increase in chroma
  color.l += (100 - color.l) * 0.5; //Slight increase in luminance without exceeding white

  d3.select(svgObject).style('fill', color);
};
//------------------------------------------------------------------------------

//-----------------------------placeTextWithinSvg()-----------------------------

//d3.mouse() is supposed to have the text DOM object as a parameter, if I trust the 'this' from older version
function placeTextWithinSvg(txtToMove, svgContainer, axis='x') {

  //Getting the text shape, see : https://bl.ocks.org/mbostock/1160929 and http://bl.ocks.org/andreaskoller/7674031
  let bbox = txtToMove.node().getBBox(); //node returns a DOM element out of a d3 selection
  let margin = 2; //Background for the text will be a bit bigger by that margin

  //Determines if we are working on height or width
  let sizeBbox, sizeContainer, mouseCoord, offset, minBorder, maxBorder, belowBorderPos, beyondBorderPos;
  switch (axis) {

    //Working on width
    case 'x':
      sizeBbox = bbox.width;
      sizeContainer = svgContainer.attr('width');
      mouseCoord = d3.mouse(txtToMove.node())[0]; //d3.event.x works only for drag events, not for cursor coordinates*
      offset = 20;
      minBorder = margin + offset; //Leaving space for the background rectangle
      maxBorder = sizeContainer - (sizeBbox + margin);
      belowBorderPos = minBorder;
      beyondBorderPos = mouseCoord - sizeBbox - offset; //Text is now displayed on the left
      break;

    //Working on height
    case 'y':
      sizeBbox = bbox.height;
      sizeContainer = svgContainer.attr('height');
      mouseCoord = d3.mouse(txtToMove.node())[1];
      offset = sizeBbox / 2; //For a y-centered text
      //Borders are not the same since pos of a text elt is at its bottom-left
      //y-axis has not the same origin than the svgContainer !
      minBorder = margin + sizeBbox;
      maxBorder = sizeContainer - margin;
      belowBorderPos = minBorder;
      beyondBorderPos = maxBorder;
      break;
  };

  //Repositions text element to its right place depending on its size
  let potentialPos = mouseCoord + offset;
  txtToMove.attr(axis, function() {
    //If mouse too close to min border...
    if (potentialPos < minBorder) {
      return belowBorderPos;
    //If mouse too close to max border...
    } else if (potentialPos > maxBorder) {
      return beyondBorderPos;
    //If mouse within acceptable range...
    } else { return potentialPos }
  });
};
//------------------------------------------------------------------------------

//------------------------------insertTooltipBg()-------------------------------

function insertTooltipBg(txtToFrame, svgContainer) {

  let bbox = txtToFrame.node().getBBox(); //node returns a DOM element out of a d3 selection
  let margin = 2; //Background for the text will be a bit bigger by that margin

  //where.insert(what, beforeWhat)
  //beforeWhat must be a function indicating the elt before which the item must be added
  //Here we want the ID of the text element
  svgContainer.insert("rect", `#${txtToFrame.attr('id')}`)
    .attr("id", txtToFrame.attr("id") + "bg")
    .attr("x", txtToFrame.attr("x") - margin) //as bbox was created before the text was correctly placed, so we cannot use bbox.x directly
    .attr("y", bbox.y - margin)
    .attr("width", bbox.width + 2 * margin)
    .attr("height", bbox.height + 2 * margin)
    .style("fill", d3.hcl(83, 4, 96))
    .style("fill-opacity", "0.9")
    .style("stroke", d3.hcl(86, 5, 80))
    .style("stroke-opacity", "0.9");
    //How to trim elements that exceeds a certain length : https://blog.mastykarz.nl/measuring-the-length-of-a-string-in-pixels-using-javascript/
};
//------------------------------------------------------------------------------

//-----------------------------eventDisplayInfoOn()-----------------------------

export function eventDisplayInfoOn(svgObject, svgContainer, data, distance2pointer) {
  //Takes most of its code from http://bl.ocks.org/WilliamQLiu/76ae20060e19bf42d774
  //http://bl.ocks.org/phil-pedruco/9032348 was useful too

  //Specifies where to put label of text altogether with its properties
  createHoverTooltip(svgObject, svgContainer, data, distance2pointer);
  let selectedText = d3.select("#textThatDisplaysInformationOnBlock_" + data.index);

  //Keeps memory of previous color
  selectedText.attr('originColor', d3.select(svgObject).style('fill'));

  //Uses D3 to select element and change its color to highlight it
  highlightSvg(svgObject);

  //Creates case specific texts to display within tooltip
  let textToDisplay;
  switch(d3.select(svgObject.parentNode).attr("id")) { //Function that will display information depending on the selected row

    case "panChromosome_coreVSdispensable":
      textToDisplay = "This block appears in " + data.presenceCounter + " selected genome(s)" //Text content
      break;

    case "panChromosome_rainbowed":
      textToDisplay = "This block starts on position " + data.FeatureStart + " and is " + d3.format("~s")(Number(data.FeatureStop) - Number(data.FeatureStart)) + "b long" //d3.format is used to have the International System writing, with rounded values
      //ATTENTION for float values such as 1.586 for instance eval() considered the "." to be the announcement of a property (586, property of the object 1), therefore an ID error occured
      break;

    case "panChromosome_similarCount":
      textToDisplay = "This block is repeated " + eval((data.SimilarBlocks.split(";").length >= 2) ? data.SimilarBlocks.split(";").length : 0) + " time(s) within the pangenome"
      break;
  };

  selectedText.text(textToDisplay);

  //Repositions text element to its right place depending on its size
  placeTextWithinSvg(selectedText, svgContainer, 'x');
  placeTextWithinSvg(selectedText, svgContainer, 'y');

  //Adding a background to the displayed text, fitting the size
  insertTooltipBg(selectedText, svgContainer);
};
//------------------------------------------------------------------------------


//------------------------------eventDisplayInfoOff()---------------------------

//When not selected, the elements will retrieve their original colors
export function eventDisplayInfoOff(svgObject, data) {

  let textID = "#textThatDisplaysInformationOnBlock_" + data.index;

  //Uses D3 to select element, change color back to normal, recovering the saved original color
  d3.select(svgObject).style("fill", d3.select(textID).attr('originColor'));

  //Selects text by id and then removes it
  d3.select(textID).remove();  // Remove text location selecting the id thanks to #
  d3.select(textID + "bg").remove();
};
//--------------------------------------------------------------------------