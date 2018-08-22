# Pañata

This tool is used to visualise and explore pangenomes, chromosome per chromosome. It is designed to be interactive and users are encouraged to play around with the sliders and to hover on elements that seem interesting.

## Launching

Pañata is not deployed on any website yet so in order to use it the Git folder must be downloaded, and *singleView.html* must be opened in the web browser of your choice (see [here](#how-to-run-it) for a summary on how to run Pañata). Although it works well on both Mozilla Firefox and Google Chrome, the later one might need to be used with a virtual machine in order to access the file.

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

JavaScript file used to create all the display. It works with D3.js and uses a .tsv file to display visual insights of it. See [below](#file-format-specifications) for more information about the file format in use.
The first line must be changed according to the file on display :

```
d3.dsv("\t","a/path/to/myFile.tsv").then(function(realPanMatrix) {

    ...

};
```

It is possible to specify another delimiter if the input file is not tab-delimited, but **":" and ";" must not be used** for this.

* **mediumFakeDataWithAllBlocks.tsv, or myFile.tsv**

*singleView.js* visualises the data inside a value-separated file. You can try it with one of the test files (*mediumFakeDataWithAllBlocks.tsv*) but the best is to try with your own *myFile.tsv* file. It has to be a delimited file, either comma- or tab- separated will work fine as long as it is specified in the first line of *singleView.js*. **See [below](#file-format-specifications) for details about the file format.**

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

Once everything is loaded, just play around with it, or see [the instructions](#instructions) to learn how to use it !

## File format specifications

Pañata is designed to visualise pangenomes, but there is no standard for the file format yet. Therefore *myFile.tsv* do not corresponds exactly to a universal file format either, and must have some specificities in order to work properly with Pañata.

### Nature of the data

*myFile.tsv* is derived from both a .bed format and a presence/absence matrix, that tells for different genomes if a certain feature belongs to them. Those presence/absence are linked to a linear reference structure (a linear pangenome or a reference genome) by setting start and stop position for every feature (thats is the .bed part). Pañata does not offer tools for converting your data into a readable file directly and only uses ready-to-read files, so they have to be built beforehand.

**The features have to be ordered depending on their FeatureStart values !**

Although it will be able to display features covering the same part of the reference sequence, it is better to use file with no overlap so that no feature will be hidden because of another one. Moreover, even if it supposed to work with completely sequenced references gaps are allowed and you can use file where features are not directly next to each other.

The file is by default structured as a tab-delimited file, but you could use any derivative (.csv...) as long as the delimiter is something else than ":" or ";". Those symbols are indeed used by Pañata to decompose elements into a column, and therefore should not be used as column delimiters. See [how to specify it](#how-to-run-it).

### Header

The header row of *myFile.tsv* is very specific and **must always start that way, with those exact column names, case-specific** :
```
#Chromosome FeatureStart    FeatureStop Sequence_IUPAC_Plus SimilarBlocks   Function
```
It has to be the first line of *myFile.tsv*, and there sould be no other commented line in the entire file. Those six columns are mandatory, even if you do not have available information for them. See [how to fill them](#body) if that is your case. **Do not forget the "#" as first character !**

Added to these columns are the genome names used for comparison. They can be as much as you want it to be, as long as they are placed after the andatory columns. For instance, for a file where six genomes are compared a possible header row can be :

```
#Chromosome FeatureStart    FeatureStop Sequence_IUPAC_Plus SimilarBlocks   Function    Geno1-Kenobi   Geno2   genome_3    g4 genFive  Basix
```
As long as no fancy characters (".","é","?", "/" and so on) are used, any name should work. Try to avoid digits for the first character though, it might cause trouble.

### Body

* #Chromosome
Corresponds to the first column of a .bed file. This should be a string, with the name of the chromosome that has the feature. It can be a word or only a number, either way works. If there is no different chromosome, just put the same name for every feature. Example of possible values :
```
1
2
chr_One
Chromosome2
chr42
```

* FeatureStart
Corresponds to the second column of a .bed file. It is a number giving the starting position of the feature, in nucleotides. The initial position being 0. That column must be filled with a real position, or at least an estimation. **These value must be classed in growing order**, for each chromosome.

* FeatureStop
Same as FeatureStart, but for the end position. That value is the first nucleotide that is not part of the feature : if two features are next to each other the first one will have the same value in FeatureStop than FeatureStart in the second one. Examples :

```
FeatureStart FeatureStop
182 1030
1030    2250
80001   80503
```

* Sequence_IUPAC_Plus
It is not used yet so you can write anything you like, it will not be displayed anyway. It was supposed to be the written nucleotide sequence, in FASTA format and with IUPAC syntax (arranged for the pangenomes : possible deletion are written with lowercase characters), but it has not been used eventually. As it has not been removed yet, it is still needed along with the other columns. Examples :

```
GATTAcA NNAGcgTTATT ATGCCnAAAWGc
```

* SimilarBlocks


* Function


* Genome columns


## Instructions
### Components of the interface
### Changing the displayed chromosome
### Using the sliders
### Hovering to have information

## Author

## Shout-out
