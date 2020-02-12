import {thresholdBasedColor} from './colorScales.mjs';

/**
 * @fileOverview    Modules for events related to a visualization tool
 *
 * @author          Eloi Durant
 *
 * @requires        EXTERNAL:{@link https://d3js.org} Version 5.4.0.
 *                  Copyright 2018 Mike Bostock.
 */

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
    .attr("dominant-baseline", "middle") //Vertical alignment
    .attr("text-anchor", "start"); //Can be "start", "middle", or "end"
};
//------------------------------------------------------------------------------

export function eventDisplayInfoOn(svgObject, svgContainer, data, distance2pointer, threshold, colorScaleLess, colorScaleMore) {
  //Takes most of its code from http://bl.ocks.org/WilliamQLiu/76ae20060e19bf42d774
  //http://bl.ocks.org/phil-pedruco/9032348 was useful too
  //    console.log(d3.select(this.parentNode).attr("id"));

  //Specifies where to put label of text altogether with its properties
  createHoverTooltip(svgObject, svgContainer, data, distance2pointer);

  //Keeps memory of previous color
  d3.select("#textThatDisplaysInformationOnBlock_"+data.index).attr('originColor', d3.select(svgObject).style('fill'));


  switch(d3.select(svgObject.parentNode).attr("id")) { //Function that will display information depending on the selected row

    case "panChromosome_coreVSdispensable":

      //Uses D3 to select element and change its color based on the previously built color scales
      d3.select(svgObject).style("fill", function(d) {
        let color = d3.hcl(thresholdBasedColor(d.presenceCounter,threshold, colorScaleLess, colorScaleMore)); //It's important to precise d3.hcl() to use .h .c or .l attributes
        color.h = color.h+10; //Slight change in hue for better noticing
        color.c = color.c*1.1; //Slight increase in chroma
        color.l += (100-color.l)*0.5; //Slight increase in luminance without exceeding white
        return color;
      });
      //Here, d is a block object from dataGroupedPerChromosome[`${currentChromInView}`], i is its index within the array
      //To access values of a block, we need to take "this" as an argument

      d3.select("#textThatDisplaysInformationOnBlock_"+data.index).text("This block appears in " + data.presenceCounter + " selected genome(s)"); //Text content

      break;
/*
    case "panChromosome_rainbowed":

      d3.select(this).style("fill", function(d) {
      var color = d3.hcl(pseudoRainbowColorScale(Number(d.index)));
      color.c = color.c*1.1;
      color.l += (100-color.l)*0.5;
      return color;
      });

      //          console.log("#textThatDisplaysInformationOnBlock_"+d.index);
      //          console.log("This block starts on position " + d.FeatureStart);
      //          console.log(" and is " + d3.format("~s")(Number(d.FeatureStop) - Number(d.FeatureStart)) + "b long");

      d3.select("#textThatDisplaysInformationOnBlock_"+d.index).text("This block starts on position " + d.FeatureStart + " and is " + d3.format("~s")(Number(d.FeatureStop) - Number(d.FeatureStart)) + "b long"); //d3.format is used to have the International System writing, with rounded values
      //ATTENTION for float values such as 1.586 for instance eval() considered the "." to be the announcement of a property (586, property of the object 1), therefore an ID error occured

      break;

    case "panChromosome_similarCount":

      d3.select(this).style("fill", function(d) {
      var color = d3.hcl(greenColorScale(Number(d.SimilarBlocks.split(";").length)));
      color.h = color.h+10;
      color.c = color.c*1.1;
      color.l += (100-color.l)*0.5;
      return color;
      });

      d3.select("#textThatDisplaysInformationOnBlock_"+d.index).text("This block is repeated " + eval((d.SimilarBlocks.split(";").length >= 2) ? d.SimilarBlocks.split(";").length : 0) + " time(s) within the pangenome");

      break;
*/
    };

    //Getting the text shape, see : https://bl.ocks.org/mbostock/1160929 and http://bl.ocks.org/andreaskoller/7674031
    let bbox = d3.select("#textThatDisplaysInformationOnBlock_"+data.index).node().getBBox(); //Do not know exactly why but node() is needed

    d3.select("#textThatDisplaysInformationOnBlock_"+data.index).attr("x", function(d) {
                    if (d3.mouse(this)[0] < bbox.width/2 + 2) { //d3.event.x works only for drag events, not for cursor coordinates
                      return 2; //Leaving space for the background rectangle
                    } else if (d3.mouse(this)[0] > svgContainer.attr("width") - (bbox.width/2+2)){
                      return svgContainer.attr("width") - (bbox.width+2);
                    } else { return d3.mouse(this)[0] - bbox.width/2 }
                  });

    svgContainer.insert("rect", "#textThatDisplaysInformationOnBlock_"+data.index)
    .attr("id", "textThatDisplaysInformationOnBlock_"+data.index + "bg")
    .attr("x", d3.select("#textThatDisplaysInformationOnBlock_"+data.index).attr("x") - 2) //as bbox was created before the text was correctly placed, so we cannot use bbox.x directly
    .attr("y", bbox.y - 2)
    .attr("width", bbox.width + 4)
    .attr("height", bbox.height + 4)
    .style("fill", d3.hcl(83, 4, 96))
    .style("fill-opacity", "0.9")
    .style("stroke", d3.hcl(86, 5, 80))
    .style("stroke-opacity", "0.9");
    //How to trim elements that exceeds a certain length : https://blog.mastykarz.nl/measuring-the-length-of-a-string-in-pixels-using-javascript/


  };
//------------------------------------------------------------------------------

//-----------------------------eventDisplayInfoOn()-----------------------------
/*
function eventDisplayInfoOn(d, i) {    //Takes most of its code from http://bl.ocks.org/WilliamQLiu/76ae20060e19bf42d774
      //http://bl.ocks.org/phil-pedruco/9032348 was useful too
  //    console.log(d3.select(this.parentNode).attr("id"));


  //Specifies where to put label of text altogether with its properties
  svgContainer_rawBlocks.append("text")
  .attr("id", "textThatDisplaysInformationOnBlock_"+d.index)
  .attr("font-family", "sans-serif")
  .attr("x", svgContainer_rawBlocks.attr("width")+1) //At first the text is not displayed in order to get its dimensions first
  .attr("y", Number(d3.select(this).attr("y")) + displayedBlocksDimensions.height*2)
  //ATTENTION The text should not appear where the mouse pointer is, in order to not disrupt the mouseover event
  .attr("dominant-baseline", "middle") //Vertical alignment, can take many different arguments other than "middle"
  .attr("text-anchor", "start") //Can be "start", "middle", or "end"



  switch(d3.select(this.parentNode).attr("id")) { //Function that will display information depending on the selected row
  case "panChromosome_coreVSdispensable":

  //Uses D3 to select element and change its color based on the previously built color scales
  d3.select(this).style("fill", function(d) {
  var color = d3.hcl(thresholdBasedColor(d.presenceCounter,coreThreshold,blueColorScale,orangeColorScale)); //It's important to precise d3.hcl() to use .h .c or .l attributes
  color.h = color.h+10; //Slight change in hue for better noticing
  color.c = color.c*1.1; //Slight increase in chroma
  color.l += (100-color.l)*0.5; //Slight increase in luminance without exceeding white
  return color;
  });
  //Here, d is a block object from dataGroupedPerChromosome[`${currentChromInView}`], i is its index within the array
  //To access values of a block, we need to take "this" as an argument

  d3.select("#textThatDisplaysInformationOnBlock_"+d.index).text("This block appears in " + d.presenceCounter + " selected genome(s)"); //Text content

  break;

  case "panChromosome_rainbowed":

  d3.select(this).style("fill", function(d) {
  var color = d3.hcl(pseudoRainbowColorScale(Number(d.index)));
  color.c = color.c*1.1;
  color.l += (100-color.l)*0.5;
  return color;
  });

  //          console.log("#textThatDisplaysInformationOnBlock_"+d.index);
  //          console.log("This block starts on position " + d.FeatureStart);
  //          console.log(" and is " + d3.format("~s")(Number(d.FeatureStop) - Number(d.FeatureStart)) + "b long");

  d3.select("#textThatDisplaysInformationOnBlock_"+d.index).text("This block starts on position " + d.FeatureStart + " and is " + d3.format("~s")(Number(d.FeatureStop) - Number(d.FeatureStart)) + "b long"); //d3.format is used to have the International System writing, with rounded values
  //ATTENTION for float values such as 1.586 for instance eval() considered the "." to be the announcement of a property (586, property of the object 1), therefore an ID error occured

  break;

  case "panChromosome_similarCount":

  d3.select(this).style("fill", function(d) {
  var color = d3.hcl(greenColorScale(Number(d.SimilarBlocks.split(";").length)));
  color.h = color.h+10;
  color.c = color.c*1.1;
  color.l += (100-color.l)*0.5;
  return color;
  });

  d3.select("#textThatDisplaysInformationOnBlock_"+d.index).text("This block is repeated " + eval((d.SimilarBlocks.split(";").length >= 2) ? d.SimilarBlocks.split(";").length : 0) + " time(s) within the pangenome");

  break;

  };

  //Getting the text shape, see : https://bl.ocks.org/mbostock/1160929 and http://bl.ocks.org/andreaskoller/7674031
  var bbox = d3.select("#textThatDisplaysInformationOnBlock_"+d.index).node().getBBox(); //Do not know exactly why but node() is needed

  d3.select("#textThatDisplaysInformationOnBlock_"+d.index).attr("x", function(d) {
                  if (d3.mouse(this)[0] < bbox.width/2 + 2) { //d3.event.x works only for drag events, not for cursor coordinates
                    return 2; //Leaving space for the background rectangle
                  } else if (d3.mouse(this)[0] > svgContainer_rawBlocks.attr("width") - (bbox.width/2+2)){
                    return svgContainer_rawBlocks.attr("width") - (bbox.width+2);
                  } else { return d3.mouse(this)[0] - bbox.width/2 }
                });

  svgContainer_rawBlocks.insert("rect", "#textThatDisplaysInformationOnBlock_"+d.index)
  .attr("id", "textThatDisplaysInformationOnBlock_"+d.index + "bg")
  .attr("x", d3.select("#textThatDisplaysInformationOnBlock_"+d.index).attr("x") - 2) //as bbox was created before the text was correctly placed, so we cannot use bbox.x directly
  .attr("y", bbox.y - 2)
  .attr("width", bbox.width + 4)
  .attr("height", bbox.height + 4)
  .style("fill", d3.hcl(83, 4, 96))
  .style("fill-opacity", "0.9")
  .style("stroke", d3.hcl(86, 5, 80))
  .style("stroke-opacity", "0.9");
  //How to trim elements that exceeds a certain length : https://blog.mastykarz.nl/measuring-the-length-of-a-string-in-pixels-using-javascript/


};
//------------------------------------------------------------------------------
*/
//When not selected the elements will retrieve their original colors
//------------------------------eventDisplayInfoOff()---------------------------

export function eventDisplayInfoOff(svgObject, data) {

  //Uses D3 to select element, change color back to normal, recovering the saved original color
  d3.select(svgObject).style("fill", d3.select("#textThatDisplaysInformationOnBlock_" + data.index).attr('originColor'));

  //Selects text by id and then removes it
  d3.select("#textThatDisplaysInformationOnBlock_" + data.index).remove();  // Remove text location selecting the id thanks to #
  d3.select("#textThatDisplaysInformationOnBlock_" + data.index + "bg").remove();
};
//--------------------------------------------------------------------------