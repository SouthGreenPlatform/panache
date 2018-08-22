# Pañata

This tool is used to visualise and explore pangenomes, chromosome per chromosome. It is designed to be interactive and users are encouraged to play around with the sliders and to hover on elements that seem interesting.

## Launching

Pañata is not deployed on any website yet so in order to use it the Git folder must be downloaded, and *singleView.html* must be opened in the web browser of your choice (see [here](###-How-to-run-it) for a summary on how to run Pañata). Although it works well on both Mozilla Firefox and Google Chrome, the later one might need to be used with a virtual machine in order to access the file.

### File content

Many files are still part of the project for testing and development purposes so they are not all mandatory. Here are their descriptions and some information about their use, in order of usefulness.

* **d3js**

Pañata is a visualisation tool written in JavaScript and is heavily based on the library D3.js by *Mike Bostock*. D3.js **v5** has been used, and some functions are not supported in versions older than D3.js v4. For instance many linear scales are created with the v5 syntax :

```
var myLinearScale_v5 = d3.scaleLinear().domain([0,1]).range([0,100]);
//Scale that takes a proportion as an input and returns its equivalent in percentage
```

Such writing is not compatible with the v3 syntax (see the example below), causing the display to fail :

```
var myLinearScale_v3 = d3.scale.linear().domain([0,1]).range([0,100]);
```

Tests on v4 have not been made, so using D3.js v5 instead is highly recommended. Moreover only d3.min.js is imported so every other files can be discarded.


* **singleView.html**

Html file that calls the script. It is **the file that should be opened in the web browser**. In order to work properly, the path to *singleView.js* has to be set :

```
<body>
    <script type="text/javascript" src="a/path/to/singleView.js"></script>
</body>
```

* **singleView.js**

JavaScript file used to create all the display. It works with D3.js and uses a .tsv file to display visual insights of it. See [below](##File-format-specifications) for more information about the file format in use.
The first line must be changed according to the file on display :

```
d3.dsv("\t","a/path/to/myFile.tsv").then(function(realPanMatrix) {

    ...

};
```

It is possible to specify another delimiter if the input file is not tab-delimited, but **":" and ";" must not be used** for this.

* **mediumFakeDataWithAllBlocks.tsv, or myFile.tsv**

*singleView.js* visualises the data inside a value-separated file. You can try it with one of the test files (*mediumFakeDataWithAllBlocks.tsv*) but the best is to try with your own *myFile.tsv* file. It has to be a delimited file, either comma- or tab- separated will work fine as long as it is specified in the first line of *singleView.js*. **See [below](##File-format-specifications) for details about the file format.**

* README.md (*facultative*)

File providing information about the project, it is the one you are currently reading.

* panFakeFileMaker.py (*facultative*)

Executable working with **Python v3** to create ready-to-run fake data files that can be visualised with Pañata. In command line you can use it this way :

```
python panFakeFileMaker.py numberOfFeatures numberOfChromosomes
```
where numberOfFeatures and numberOfChromosomes are integers choosen by the user, to set the size of the fake file. Using this will create or overwrite a file called *myFakePanData.tsv*


Each feature will corresponds to one line, and is linked to one chromosome. As only one chromosome is visualised at a time, both command lines below will lead to a file with the same amount of data displayed at once :

```
python panFakeFileMaker.py 10000 5
python panFakeFileMaker.py 2000 1
```

* partOfBigFile.tsv, miniTheFakeData2Use.tsv, ... .tsv (*facultative*)

Other fake files used for testing during development

* canvasTest.html, canvasTest.js (*facultative*)

Files used to test how to draw canvas through JavaScript

* testSVG.html (*facultative*)

File used to test how to draw SVGs and to try things with their properties

### How to run it

First of all the path to the data file that will be on displayed must be written on the first (uncommented) line of *singleView.js* :
```
d3.dsv("\t","a/path/to/myFile.tsv").then(function(realPanMatrix) {

    ...

};
```
The first parameter corresponds to the file delimiter. It is possible to change it to match those of your own file, however **":" and ";" must not be used !**

Pañata can be launched by opening singleView.html in the web browser of your choice. It has been developped under Mozilla Firefox, but works on Google Chrome too. Support by Microsoft Edge is unknown, and Internet Explorer cannot run it (*obviously*).
If you want to try it with Google Chrome you might have to open it through a virtual machine, as Google Chrome does not allow to open .html files directly.

If your data file is really big (hundred thousands of features per chromosome or more), it might take a little time before everything is displayed, just wait a few seconds. It is the drawing of the miniature canvas that is time consuming. This will reload everytime you change the displayed chromosome, but navigating should be fast once it is loaded.

Once everything is loaded, just play around with it, or see [the instructions](##Instructions) to learn how to use it !

## File format specifications
### Nature of the data
(Do not forget to talk about data with holes)
### Header
### Body

## Instructions
### Components of the interface
### Changing the displayed chromosome
### Using the sliders
### Hovering to have information

## Author

## Shout-out
