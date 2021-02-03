# Panache: PANgenome Analyzer with CHromosomal Exploration
Panache is a web interface designed for the visualization of linearized sequence pangenomes. It can be used to show presence/absence information of pangenomic blocks of sequence in a browser-like display.

- [Panache: PANgenome Analyzer with CHromosomal Exploration](#panache-pangenome-analyzer-with-chromosomal-exploration)
  - [Usage](#usage)
    - [Features !!!!!!!!!!!!!](#features-)
    - [Representation !!!!!!!!!!!!](#representation-)
    - [Use cases + online trial !!!!!!!!](#use-cases--online-trial-)
  - [Installation](#installation)
  - [Additional documentation !!!!!!!!!](#additional-documentation-)
  - [Reference](#reference)
  - [Acknowledgement](#acknowledgement)
  - [License](#license)
  - [Miscellaneous](#miscellaneous)

## Usage
![Animated GIF introducing the main features of Panache](imagesReadMe/PanacheScreencast.gif?raw=true "Panache Screencast")

### Features !!!!!!!!!!!!!
à relier avec la partie screencast ?
Parler des fichiers de tests

### Representation !!!!!!!!!!!!

### Use cases + online trial !!!!!!!!

## Installation
Panache comes as a Docker container. Please make sure your machine already have Docker (version >= XXXX) and Docker-compose (version >= 1.10) installed. If not, you might install it using ```apt install docker docker-compose```.

After cloning Panache's repository, the container can be built and launched running ```bash start.sh``` (with your sudo rights enabled).
The web interface will be available after 1-2 minutes once everything is built.
Access the visualization through your [localhost](localhost:8080/) (by default a dev version will be served throught port 8080 and a prod version through port 1337).

The visualization could be served on a given IP when specified inside the nginx.conf file, instead of or alongside with localhost.

## Additional documentation !!!!!!!!!

More documentation about Panache is available in it's [wiki](linkToTheWiki). (FAQ, errors that might happen at installation..., using ssh tunnel if used with VM...)
+Redirection vers le projet de Nguyet ?

## Reference
Panache is not published within a scientific article yet.

## Acknowledgement

Panache would not have come to light without the help of Romain Basset (transition to Vue JS framework) and Mel Florance (Docker container and diverse enhancements).

## License
Panache is published under the terms of the [GNU General Public License v3.0](./LICENSE)

***

## Miscellaneous
> ***panache***, noun
> 1. an ornamental tuft (as of feathers) especially on a helmet
> *The palace guard had a panache on his helmet.*
> 2. dash or flamboyance in style and action
> *flashed his … smile and waved with the panache of a big-city mayor.* — Joe Morgenstern

definition from Merriam-Webster








----------------------------


Quelques suggestions d'écriture de ReadMe, issues (dans l'ordre) de:
1 https://www.makeareadme.com/
2 https://bulldogjob.com/news/449-how-to-write-a-good-readme-for-your-github-project
3 https://medium.com/@meakaakka/a-beginners-guide-to-writing-a-kickass-readme-7ac01da88ab3
4 https://gist.github.com/PurpleBooth/109311bb0361f32d87a2
5 https://github.com/matiassingers/awesome-readme (suggested by first link)
6 https://github.com/noffle/art-of-readme (suggested by 3rd link)

Ressources about wikis:
A https://stackoverflow.com/questions/32430473/what-are-the-main-functionality-differences-between-github-wiki-and-readme
B https://guides.github.com/features/wikis/

1----
Contenus proposés :
- Project name (should be self explanatory)
- Description (context + links to unfamiliar things; Features + Background subsections ?; what makes it different from other projects ?)
- Badges (ex which test passed... ok mais lesquels pour moi ?)
- Visuals (images or GIFs)
- Installation (with specific steps explained for newbies) with REQUIREMENTS Subsection
- Examples, short in the readme and more detailed somewhere else
- Support : where can people get aid
- Roadmap : (what is going to be added in the future)
- Contributing (are people welcome, and how should they work, with linting etc ?)
- Authors and acknowledgement
- License
- Current status of the project
2----
ReadMes are useful for reference in Google et al
Importance de mentionner les techno utilisées (Let's write down the languages we used, the libraries and its versions. )
Examples, sources (inspiration, good refs...), status...
Add `fragments of code`
Emphasis on LEGIBILITY
3----
A bit about ReadMe Driven Dev : https://tom.preston-werner.com/2010/08/23/readme-driven-development.html
+ qq exemples dont je ne suis pas fan ou qui n'apportent rien à ce que j'ai déjà lu
4----
Nothing much to add
5----
Curated list of awesome ReadMes, ce sont des exemples, avec pourquoi ils sont awesome marqué à côté
Ca redirige vers qq articles intéressants à priori mais j'ai vraiment la flemme de les lire
6----
Un des articles sur lesquels je suis tombé en partant du lien précédent. Apparemment je ferai bien de le lire malgré tout
ReadMe should not be too long, make separate doc if needed
"the documentation, not the code, defines what a module does." - Ken Williams
Name + one line description, puis usage, puis détails utiles d'implémentation, puis installation, puis License (A LA FIN SEULEMENT SI NON CONTRAIGNANT)
--> Connecting funneling, ordre idéal d'apparition de l'information, meilleur flow de pensée
C'est comme pour une intro : du général au précis
'Aggressively linkify' : make ref for modules, people, ideas...
Do not abuse badges as they add visual noise
On peut utiliser des footnotes avec markdown
*idée* faire une partie pour les derniers ajouts majeurs ?
Bonus: The README Checklist

A helpful checklist to gauge how your README is coming along:

    One-liner explaining the purpose of the module
    Necessary background context & links
    Potentially unfamiliar terms link to informative sources
    Clear, runnable example of usage
    Installation instructions
    Extensive API documentation
    Performs cognitive funneling
    Caveats and limitations mentioned up-front
    Doesn't rely on images to relay critical information
    License

A----
Grosso modo le wiki c'est surtout des infos plus poussées de dev. Penser à mettre le lien du wiki dans le read me
B----
Ressource plus complète que celle d'avant à première vue

README files are a quick and simple way for other users to learn more about your work.
Wikis on GitHub help you present in-depth information about your project in a useful way.

Your README should contain only the necessary information for developers to get started using and contributing to your project. Longer documentation is best suited for wikis, outlined below

On peut faire du syntax highlighting specific a un langage avec les wikis !
Okay. Page plutôt cool en soi.



MAINTENANT IL FAUT 'JUSTE' QUE JE REMPLISSE TOUT CA

HOW TO ADD BADGES ??? + Which?
Vue version, d3 version, docker versionS, license ? Not important now, it is not the most essential part of my ReadMe.