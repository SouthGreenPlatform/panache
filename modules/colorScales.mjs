/**
 * @fileOverview    Modules for color-palettes related functions
 *
 * @author          Eloi Durant
 *
 * @requires        EXTERNAL:{@link https://d3js.org} Version 5.4.0.
 *                  Copyright 2018 Mike Bostock.
 */

//-----------------------------domainPivotsMaker()------------------------------

/**
 * @function domainPivotsMaker
 * @param {numeric}  breakpointsNb  - Number of values to create
 * @param {numeric}  maxValue       - Extent of the desired numeric range
 * @return {numeric[]} List of values evenly distributed between 0 and maxValue
 */
export function domainPivotsMaker(breakpointsNb,maxValue) {
    let breakpoints = [];

    for (var i = 0; i < breakpointsNb; ++i) {
        breakpoints.push(Math.round( (i / (breakpointsNb - 1) ) * maxValue));
    }
    return(breakpoints);
};

//-----------------------------colorScaleMaker()--------------------------------

/**
 * @function colorScaleMaker
 * @param {numeric[]}  domain       - List of input breakpoints that should be linked/translated to other output values
 * @param {object[]}   range        - List of output colours, linked to those of domain
 * @param {boolean}    scaleLinear  - Boolean that tells if the scale should be Linear or Ordinal
 * This function allows to make d3 scales that link numeric values to
 * colours. A good practice is to choose from an HCL colour palette as
 * their changes are linearly percepted by a human eye, unlike the usual
 * RGB colour scheme, see: {@link https://bl.ocks.org/mbostock/3014589}.
 * "I want hue" is a great tool for choosing colours: {@link http://tools.medialab.sciences-po.fr/iwanthue/}
 */
export function colorScaleMaker(domain, range, scaleLinear = true) {
    if (scaleLinear) {
        return d3.scaleLinear()
            // Minimal and Maximal values are declared as input domain, they
            // will be linked to corresponding min/max colours.
            .domain(domain)
            // Interpolate makes mostly no difference for orange, but it is
            // visible for blue (better with it).
            // .interpolate() can be written anywhere in the scale definition
            .interpolate(d3.interpolateHcl)
            .range(range);
    } else {
        // ATTENTION As it is scale*Ordinal*, we cannot use interpolate!
        return d3.scaleOrdinal()
            .domain(domain)
            .range(range);
    };
};

//----------------------------thresholdBasedColor()-----------------------------

//Function for applying different color Scales depending on one value
/**
 * @function thresholdBasedColor
 * @param {numeric}  d               - Data numeric value that might exceed a threshold
 * @param {numeric}  threshold       - Number used for comparison with d
 * @param {object}   colorScaleLess  - d3 colorScale to apply when d < threshold
 * @param {object}   colorScaleMore  - d3 colorScale to apply when d >= threshold
 * Choose between two different colorScales to apply depending on the
 * comparison of a value against a numeric threshold.
 */
export function thresholdBasedColor(d, threshold, colorScaleLess, colorScaleMore) {
    if (d >= threshold) {
        return colorScaleMore(d);
    } return colorScaleLess(d);
};