# Pañata

This tool is used to visualise and explore pangenomes, chromosome per chromosome. It is designed to be interactive and users are encouraged to play around with the sliders and to hover on elements that seem interesting.

## Launching

Pañata is not deployed on any website yet so in order to use it the Git folder must be downloaded, and *singleView.html* must be opened in the web browser of your choice (see [here](#how-to-run-it) for a summary on how to run Pañata). Although it works well on both Mozilla Firefox and Google Chrome, the later one might need to be used with a virtual machine in order to access the file.

### Repository content

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

* **README.md** (*facultative*)

File providing information about the project, it is the one you are currently reading.

* **panFakeFileMaker.py** (*facultative*)

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

* **partOfBigFile.tsv, miniTheFakeData2Use.tsv, ... .tsv** (*facultative*)

Other fake files used for testing during development

* **canvasTest.html, canvasTest.js** (*facultative*)

Files used to test how to draw canvas through JavaScript

* **testSVG.html** (*facultative*)

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

Pañata is designed to visualise pangenomes, but there is no standard for the file format yet. Therefore *myFile.tsv* do not corresponds exactly to a universal file format either, and must have some specificities in order to work properly with Pañata. [Here](#representative-example) is an example.

### Nature of the data

*myFile.tsv* is derived from both a .bed format and a presence/absence matrix, that tells for different genomes if a certain feature belongs to them. Those presence/absence are linked to a linear reference structure (a linear pangenome or a reference genome) by setting start and stop position for every feature (thats is the .bed part). Pañata does not offer tools for converting your data into a readable file directly and only uses ready-to-read files, so they have to be built beforehand.

**The features have to be ordered depending on their FeatureStart values !**

Although it will be able to display features covering the same part of the reference sequence, it is better to use file with no overlap so that no feature will be hidden because of another one. Moreover, even if it supposed to work with completely sequenced references gaps are allowed and you can use file where features are not directly next to each other.

The file is by default structured as a tab-delimited file, but you could use any derivative (.csv...) as long as the delimiter is something else than ":" or ";". Those symbols are indeed used by Pañata to decompose elements into a column, and therefore should not be used as column delimiters. See [how to specify it](#how-to-run-it).

### Header

The header row of *myFile.tsv* is very specific and **must always start that way, with those exact column names, case-specific** :

```
#Chromosome	FeatureStart	FeatureStop	Sequence_IUPAC_Plus	SimilarBlocks	Function
```

It has to be the first line of *myFile.tsv*, and there sould be no other commented line in the entire file. Those six columns are mandatory, even if you do not have available information for them. See [how to fill them](#body) if that is your case. **Do not forget the "#" as first character !**

Added to these columns are the genome names used for comparison. They can be as much as you want it to be, as long as they are placed after the andatory columns. For instance, for a file where six genomes are compared a possible header row can be :

```
#Chromosome	FeatureStart	FeatureStop	Sequence_IUPAC_Plus	SimilarBlocks	Function	Geno1-Kenobi	Geno2	genome_3	g4	genFive	Basix
```

As long as no fancy characters (".","é","?", "/" and so on) are used, any name should work. Try to avoid digits for the first character though, it might cause trouble.

### Body

* **#Chromosome**

Corresponds to the first column of a .bed file. This should be a string, with the name of the chromosome that has the feature. It can be a word or only a number, either way works. If there is no different chromosome, just put the same name for every feature. Example of possible values :

```
1
2
chr_One
Chromosome2
chr42
```

**Please do notice that different syntaxes will be considered to be different chromosomes.**

* **FeatureStart**

Corresponds to the second column of a .bed file. It is a number giving the starting position of the feature, in nucleotides. The initial position being 0. That column must be filled with a real position, or at least an estimation. **These value must be classed in growing order**, for each chromosome.

* **FeatureStop**

Same as FeatureStart, but for the end position. That value is the first nucleotide that is not part of the feature : if two features are next to each other the first one will have the same value in FeatureStop than FeatureStart in the second one. Examples :

```
FeatureStart	FeatureStop
182	1030
1030	2250
80001	80503
```

* **Sequence_IUPAC_Plus**

It is not used yet so you can write anything you like, it will not be displayed anyway. It was supposed to be the written nucleotide sequence, in FASTA format and with IUPAC syntax (arranged for the pangenomes : possible deletion are written with lowercase characters), but it has not been used eventually. As it has not been removed yet, it is still needed along with the other columns. Examples :

```
GATTAcA NNAGcgTTATT ATGCCnAAAWGc
```

* **SimilarBlocks**

This column gives references to features with a similar sequence in the whole pangenome. For instance, if the feature is a piece of nucleotide sequence that is duplicated somewhere else in the pangenome, **the IDs of *both* features will be written in the column SimilarBlocks**. The IDs are written with a given pattern : chromosomeName:startPosition:endPosition . Moreover the IDs are separated from one another with ";", and this is why [these characters should not be used as column delimiters.](#how-to-run-it)

It is highly probable that this information will be missing from your file. If there is no way to access this similarity information, or **if a block is never repeated, use a dot sign "." instead.** Examples :

```
#Chromosome	FeatureStart	FeatureStop	...	SimilarBlocks
chr1	156	283	...	chr1:156:283;chr3:82:209	//This sequence appears two times, once in chr1 and once in chr3
chr1	542	620	...	.                       	//A feature with no similar sequence
...
chr3	82	209	...	chr1:156:283;chr3:82:209	//This is the feature with a sequence similar to the one in chr1:156:283
```

* **Function**

If the feature is linked to a biological function, it can be added here. Unfortunately it does not accept standard format yet (GO terms, for instance, *cannot be used*) but only integers. Each integer is linked to a color on screen, allowing to look for specific functions within the reference. **If the function information is not available, use the same number for every feature.** Example :

```
Function
1	//Those two have the same 'function' (it can be that they both have no or unknown function)
1	//Those two have the same 'function' (it can be that they both have no function)
2
0
```

* **Genome columns**

Those columns give the presence/absence status of a given feature for every genome. It has to be a **numeric matrix**, filled with integer. An absence is always encoded as a "0" in the matrix. Presence however, can be encoded with "1", or any other positive integer (it can be read count data if it is easier to create your file this way). **Negative values are forbidden.** Proportions (float numbers between 0 and 1) are not recommended, as the presence will be way harder to see, being linked to the opacity of displayed elements. *For a given pangenome, the display will be the same for a binary matrix and a matrix with count data, so choose the easiest to use.* Examples :

```
Geno1	Geno2	Geno3																Geno1	Geno2	Geno3
0	1	1																			0	3	7
1	1	1							will have the same display than					20	45	63
0	0	0																			0	0	0
0	0	1																			0	0	18
```

### Representative example

Here is a shortened file giving an overview of every syntaxes that can be used with Pañata :

```
#Chromosome	FeatureStart	FeatureStop	Sequence_IUPAC_Plus	SimilarBlocks	Function	Geno1	gen_2	genomeThree
1	45	56	ATCTGGaTttA	.	0	1	1	0
1	56	78	AAaTNNATCGCGTacGTCATTA	.	7	0	0	23
1	210	230	ATTCNNatTWCCAGgaGATT	.	4	16	0	17
chr2	30	43	CAGWggTGACNNT	chr2:30:43;C_Four:120:133	3	12	1	1
chr2	74	96	tTTAGAaANNNAATAAGgACTAC	chr2:74:96;C_Four:133:155;chrom-5:0:23	5	0	25	6
Chromosome3	780	789	TATacGTGN	.	0	1	1	1
C_Four	120	133	CAGWggTGACNNT	chr2:30:43;C_Four:120:133	3	0	12	13
C_Four	133	155	tTTAGAaANNNTTTAAGgACTAC	chr2:74:96;C_Four:133:155;chrom-5:0:23	5	0	0	0
chrom-5	0	23	tTTAGAaANNTTTAAGgACTACAA	chr2:74:96;C_Four:133:155;chrom-5:0:23	5	8	0	0
chrom-5	345	351	ATTACA	.	7	23	34	42
```

## Instructions

Pañata is a data visualisation and exploration tool, therefore many parts are interactive and can be choosen by users. You can find here instructions on how to use and interpret the data on display.

### Components of the interface

Pañata is mainly divided into four parts, each having its own functions : Data selection, Overview, Display Window and Display Options/legends.

![Pañata has four parts, one for each corner of your screen](imagesReadMe/Paniata_interface_4pieces.png?raw=true "Pañata interfaces")

* **Data Selection**

![You can choose the threshold of what should be consider as *core genome*, as well as the chromosome on display](imagesReadMe/Paniata_interface_DataSelection.png?raw=true "Choice of chromosome on display and core threshold")

The upper-left part of the display is dedicated to the selction of the data that should be displayed. Here you can find out or [set which chromosome is currently displayed](#changing-the-displayed-chromosome) in the display window, as well as the [threshold used to distinguish *dispensable genome* and *core genome*](#using-the-sliders). Features for which the presence proportion is under the threshold will be considered as part of the *dispensable genome* and will be painted in blue. The others are considered to be part of the *core genome* and will be painted in orange. Chroma is proportionnal to the number of genomes owning a feature : white-ish blocks means few genomes contain this feature.

* **Overview**

![A miniature of the display helps to locate the visible part of the chromosome](imagesReadMe/Paniata_interface_Overview.png?raw=true "Miniature panchromosome")

This piece is displayed in the upper-right part of the screen. It is basically a **miniature of the whole display**, with the starting position on the left and the end position on the right.

The first part is a **histogram** representing the presence/absence matrix : bar heights corresponds to the number of genomes that own the feature at this position. Colour corresponds to the linked biological function, if any.

Then are three lines giving different information about the features along the reference chromosome. First one represents the features depending on their **appartenance to *core*** (feature painted in orange) or *dispensable* (feature painted in blue) *genomes*.
Second one encodes the **origin position** of features on the reference thanks to a pseudo-rainbow colour code. This will be useful when filter options are implemented, to keep track of the initial position of a feature. Moreover, the **colour code is colour-blind proof !**
Third and last one reflects the **number of existing similar features** throughout the whole pangenome. Features that are not repeated will be coloured in pale grey, while highly repeated features will have an intense purple hue.

As those tracks are a representation of the whole display, a rectangular grey **handle** shows [which part of it is currently visible in the display window](#using-the-sliders).

Finally a **scale** shows the length in bp of the reference, so that users can see where the display window is located.

* **Display Window**

![Every column gives information about a feature, rows might correspond to a genome, a quantity, a position, or a similarity information](imagesReadMe/Paniata_interface_DisplayWindow.png?raw=true "Display Window")

This is the main display of Pañata. Every visible elements are parts of a larger display, and the handle in the Overview tells the user which part of it is currently visible. Every feature from *myFile.tsv* corresponds to a column of multiple blocks.

The top part is the graphic representation of a presence/absence matrix, features being represented as columns and genomes as rows. If a feature is present in a genome, the block at the crossroads will be filled and coloured depending on the functionnal information. If the feature is absent, however, the block will stay empty and will appear as blank.

Then are three tracks [providing information about the feature](#hovering-to-have-information). As for the Overview, the first one represents the features depending on their **appartenance to *core*** (feature painted in orange) or *dispensable* (feature painted in blue) *genomes*. The chroma encodes the proportion of genomes containing a given feature.
Second one encodes the **origin position** of features on the reference thanks to a pseudo-rainbow colour code. This will be useful when filter options are implemented, to keep track of the initial position of a feature. Moreover, the **colour code is colour-blind proof !**
Third and last one reflects the **number of existing similar features** throughout the whole pangenome. Features that are not repeated will be coloured in pale grey, while highly repeated features will have an intense purple hue.

The bottom part is a bit trickier, but is still linked to the number of similar features. The background keeps the information provided by the third track. Grey rectangles are also displayed when a similarity information is available, giving precision on the location/distribution of those similar features. Each row corresponds to a chromosome, and both the **width and the opacity of the rectangles encode the repartition of the similar features between those chromosomes**. A rectangle that has the same width than the feature block means than the majority of the similar features appear in the corresponding chromosome. The width of the other rectangles is then proportional to this and to the number of similar features in other chromosomes.

* **Display Options**

![Pañata is supposed to be self-explanatory enough so the legend is visible, and you can choose the zoom level](imagesReadMe/Paniata_interface_DisplayOptions.png?raw=true "Legend and zoom level")

It is quite self explanatory as it is the legend, along with the zoom level information. The current zoom level is represented by a bar on a gradient of all possible zoom levels. The more on the right it is, the bigger the features will be displayed.
*Do note that there might be performance issues when the number of displayed element is too high (leftmost part of the gradient).*

### Changing the displayed chromosome

Pañata offers a 'per-chromosome' view. Therefore only one (pan)chromosome is displayed at a time. In order to change it you can choose another one in the dropdown menu accessible in the Data Selection part of your screen. *If there are many features in the selected chromosome it might take a few seconds before everything is diplayed accordingly.*

### Using the sliders

There is a total of 3.5 five sliders you can play with in Pañata : three of them will always be available, the last one only appears when needed.

* **Choice of the *core*/*dispensable* threshold**

![Users can set the core threshold](imagesReadMe/Paniata_slider_dispVScore.png?raw=true "Core slider")

Available in the Data Selection corner, this slider allows the user to determine the percentage of genomes that must contain a given feature for this feature to be considered as part of the *core genome*. Features categorised as "*dispensable*" are coloured in blue on the corresponding track, while feature categorised as "*core*" are coloured in orange.
**Changes of this value are dynamically rendered in both the Display Window and the Overview.**

* **Choice of the zoom level**

![Users can set the zoom level](imagesReadMe/Paniata_slider_zoomLevel.png?raw=true "Zoom slider")

Placed in the Data Options corner, it is used to change the width of the elements within the Display Window. As too many rendered elements would lead to performance issues, the main part of the slider only allows to zoom within  a range of 1 to 150 displayed features at once. It is still possible to exceed this threshold by selecting a zoom level within the "non-optimal zone", highlighted in orange. However **those zoom levels are not suitable for data exploration**.

* **Choice of the displayed elements**

![Users can set the displayed part of the pangenome](imagesReadMe/Paniata_slider_miniatureHandle.png?raw=true "Overview handle")

By moving the handle along the tracks of the Overview, it is possible to display different part of the pangenome. Changes in position are rendered in real time (*depending on the zoom level and number of displayed elements*) in the Display Window. The inside of the handle always represents what is currently displayed in the Display Window.

* **Displaying other genome** (*facultative*)

![Users can see multiple genomes](imagesReadMe/Paniata_slider_browsingGenomes.png?raw=true "Browser slider")

In case your pangenome is composed of many different genomes, there will not be enough space to display all of their presence/absence information at once ! Therefore you can find by hovering on the right of the presence/absence matrix a hidden slider, allowing to browse the different genomes. This slider will only be displayed if there is not enough space to show every genome, and **if the mouse is hovering the rightmost part of the screen** ! That way it will not disturb the global display.

### Hovering to have information

Currently three elements can show information when the cursor moves to their position : the three main tracks. *The features for which information is given are highlighted.*

* **Number of genomes containing the feature**

![The number of genomes containing a given feature can be displayed when the corresponding track is hovered](imagesReadMe/Paniata_hovering_core.png?raw=true "Core hovering")

* **Position and feature's size**

![The position and size in bp can be displayed when the corresponding track is hovered](imagesReadMe/Paniata_hovering_rainbow.png?raw=true "Position hovering")

* **Number of similar features**

![The number of features similar to the one highlighted can be displayed when the corresponding track is hovered](imagesReadMe/Paniata_hovering_similarities.png?raw=true "Similarity hovering")

## Author

Éloi DURANT, MSc2 student, within the scope of GenomeHarvest project.
For any complementary information or request, please contact me via GitHub.

## *Shout-out*

This work would not have been the same without the help of great musics, especially :
- The album *Lys* by the band L.E.A.F, featuring Kati Ran, for lovers of Nordic and medieval-ish feels.
- Most of the songs by **Darren Korb** who does an awesome job at composing video game musics for Supergiant Games. *Transistor*, *Pyre* and *Bastion*'s Original SoundTracks have a special place in my heart.