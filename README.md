# Panache: PANgenome Analyzer with CHromosomal Exploration
Panache is a web-based interface designed for the visualization of linearized pangenomes. It can be used to show presence/absence information of pangenomic blocks of sequence or genes in a browser-like display.

- [Panache: PANgenome Analyzer with CHromosomal Exploration](#panache-pangenome-analyzer-with-chromosomal-exploration)
  - [Usage](#usage)
    - [Main features](#main-features)
      - [Presence/absence summary and custom core threshold !!!!!!!!](#presenceabsence-summary-and-custom-core-threshold-)
      - [Gff Annotation !!!!!!!!](#gff-annotation-)
      - [Information au survol !!!!!!!!](#information-au-survol-)
      - [SAUT DE PUCE !!!!!!!!](#saut-de-puce-)
    - [Representation](#representation)
    - [Use cases + online trial !!!!!!!!](#use-cases--online-trial-)
  - [Installation](#installation)
  - [Additional documentation](#additional-documentation)
  - [Reference](#reference)
  - [Acknowledgement](#acknowledgement)
  - [License](#license)
  - [Miscellaneous](#miscellaneous)

## Usage

![Animated GIF introducing the main features of Panache](imagesReadMe/panacheScreencast.gif?raw=true "Panache Screencast")

### Main features

Panache offers an interactive view of a presence/absence matrix of genomes x 'pangenome blocks', such blocks being either sequences or gene. This matrix can be explored similarly to genome browsers, and all available features are documented in the project's [wiki](linkToTheWiki).

#### Presence/absence summary and custom core threshold !!!!!!!!

petit Gif bi-partite du changement de threshold

The presence/absence status of a block is summarized on a dedicated track right below the matrix. Nodes are given hues depending on their labels as part of the '*core*' or '*variable*' genomes. In order to give more flexibility, the threshold between core and variable genomes can be manually adjusted to better fit your own definition. Changes are reflected on the fly.

#### Gff Annotation !!!!!!!!

petit Gif d'une annotation

An additional gff file of annotation can be added to the view and complete the presence/absence matrix. Gene annotation can be displayed as gene cards on hovering.

#### Information au survol !!!!!!!!

petit Gif d'une info au survol

Supplementary tracks can display additional information on hovering, completing the visual cues conveyed by color. As of now, three tracks are available :
- orange/blue categorization of *core*/*variable* genomes
- hues associated with position on the linear reference system used
- lightness associated with the number of occurences of a block elsewhere in the pangenome (if provided)

#### SAUT DE PUCE !!!!!!!!

### Representation
Panache was built to display linear representations of pangenomes. Graph genomes may be effective representations of pangenomes for computers and algorithms but are not quite human-friendly when it comes to readability and exploration. The more variation there is, the more edges and nodes appear, and this can quickly lead to overlaps and loops within the graph, leading to the infamous '*[hairball effect](https://eagereyes.org/techniques/graphs-hairball)*'.

[//]: # (It is less prominent in genome graphs than in classic node-link diagrams, as DNA sequences impose an overall sense of succession, but can happen quickly depending on the methods used to generate the graph (influencing the number of nodes and their lengths) and on the number of genomes. Moreover, graph are unorganized by nature. The arrangement of nodes and links and their connections matter more than their positions in space. This allows for better flexibility, but is also harder to explore and understand. People who have tried Bandage for instance may have noticed that the colors and spatial positions of the nodes within a graph are randomized everytime a file is loaded.)

By offering a linear-*ized* representation, our aim is to make pangenomes more understandable and explorable. With every block ordered on a single string, it becomes easier to parse the representation with human eyes and to compare per-node data. It also makes a good baseline for additional information or metadata, that can be layed out on dedicated spaces without overloading the rest of the visualization.

![Visual explanation of pangenome linearization](imagesReadMe/pangenomeLinearization.png?raw=true "Pangenome linearization")

### Use cases + online trial !!!!!!!!
Parler des fichiers de tests
Is an online trial version available ?

## Installation
Panache comes as a Docker container. Please make sure your machine already have Docker (version >= XXXX) and Docker-compose (version >= 1.10) installed. If not, you might install it using ```apt install docker docker-compose```.

After cloning Panache's repository, the container can be built and launched running ```bash start.sh``` (with your sudo rights enabled).
The web interface will be available after 1-2 minutes once everything is built.
Access the visualization through your [localhost](localhost:8080/) (by default a dev version will be served throught port 8080 and a prod version through port 1337).

The visualization could be served on a custom IP when specified inside the nginx.conf file, instead of (or alongside with) localhost.

## Additional documentation

More descriptive documentation (FAQ, feature description, linearization...) is available at Panache's [wiki](linkToTheWiki).

[//]: # (FAQ, errors that might happen at installation..., using ssh tunnel if used with VM... +Nguyet's project)

## Reference
A paper for Panache is currently being written. The corresponding reference will be updated when available.

## Acknowledgement

Panache would not have come to light without the help of Romain Basset (transition to Vue JS framework) and Mel Florance (Docker container and various enhancements).

## License
Panache is published under the terms of the [GNU General Public License v3.0](./LICENSE)

---

## Miscellaneous
> ***panache***, noun
> 1. an ornamental tuft (as of feathers) especially on a helmet  
> *The palace guard had a panache on his helmet.*
>
> 2. dash or flamboyance in style and action  
> *flashed his … smile and waved with the* panache *of a big-city mayor.* — Joe Morgenstern

*Definition from Merriam-Webster*
