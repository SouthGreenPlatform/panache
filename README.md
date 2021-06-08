# Panache: PANgenome Analyzer with CHromosomal Exploration
Panache is a web-based interface designed for the visualization of linearized pangenomes. It can be used to show presence/absence information of pangenomic blocks of sequence or genes in a browser-like display.

![Snapshot of banana data in Panache](imagesReadMe/panacheBanana_clipped.png?raw=true "Banana data in Panache")

## Live demo
An instance of Panache is currently running at [https://panache.ird.fr/](https://panache.ird.fr/) where anyone can upload its own data.

To see an instance with an existing dataset (Banana Pangenome by Rijzaani H. et al, 2021), you can visit the [Banana Genome Hub](https://banana-genome-hub.southgreen.fr/content/panache).

## Citation
Eloi Durant,  François Sabot, Matthieu Conte and Mathieu Rouard. Panache: a Web Viewer for Linearized Pangenomes. BioRxiv. 2021.04.27.441597; doi: https://doi.org/10.1101/2021.04.27.441597 

## Installation

### With Docker
Panache comes with a Docker container. Please make sure your machine already have Docker and Docker-compose (version >= 1.10) installed. If not, you might install it using ```apt install docker docker-compose```.

After cloning Panache's repository, the container can be built and launched running ```bash start.sh``` (with your sudo rights enabled; this will both create a build version and serve it with nginx).
The web interface will be available after 1-2 minutes once everything is built.
Access the visualization through your [localhost](localhost:8080/) (by default a dev version will be served throught port 8080 and a prod version through port 1337).

The visualization could be served on a custom IP when specified inside the nginx.conf file, instead of (or alongside with) localhost.

### Without Docker

If you wish to use another web server directly with the production version of files instead, you will have to run ```npm install```, followed with ```npm install @vue/cli```. Finally make sure to run ```npm run build``` to have the production version files available, they will be all stored in the directory called 'dist', ready to be served.

## Main features and documentation

![Animated GIF introducing the main features of Panache](imagesReadMe/panacheScreencast.gif?raw=true "Panache Screencast")

Panache offers an interactive view of a presence/absence matrix of genomes and 'pangenome blocks'---such blocks being either sequences or gene. This matrix can be explored similarly to genome browsers, by clicking on the desired location on the miniature.

More descriptive documentation (FAQ, feature description, linearization...) is available at Panache's [wiki](https://github.com/SouthGreenPlatform/panache/wiki).

## Representation
Panache was built to display linear representations of pangenomes instead of graph-like display.
With every block ordered on a single string, it becomes easier to parse the representation with human eyes and makes sense of per-node data. It also makes a good baseline for additional information or metadata, that can be layed out on dedicated spaces without overloading the rest of the visualization.

![Visual explanation of pangenome linearization](imagesReadMe/pangenomeLinearization.png?raw=true "Pangenome linearization")

## Data inputs
File examples can be find in the `public` folder, and detailed information are available in the [Files and Formats](https://github.com/SouthGreenPlatform/panache/wiki/Files-&-formats) section of the wiki

## Full Documentation

See the [Wiki](https://github.com/SouthGreenPlatform/panache/wiki) for full documentation, examples and other information.

## Acknowledgement

Panache would not have come to light without the help of Romain Basset (transition to Vue JS framework) and Mel Florance (Docker container and various enhancements).
Thank you to Gaetan Droc for setting up Panache on the Banana Genome Hub.

## License
Panache is published under the terms of the [MIT LICENSE](./LICENSE)

---

## Miscellaneous
> ***panache***, noun
> 1. an ornamental tuft (as of feathers) especially on a helmet  
> *The palace guard had a panache on his helmet.*
>
> 2. dash or flamboyance in style and action  
> *flashed his … smile and waved with the* panache *of a big-city mayor.* — Joe Morgenstern

*Definition from Merriam-Webster*
