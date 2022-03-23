import Vue from 'vue'
import Vuex from 'vuex'
import * as d3 from 'd3'
import {nonReactiveDataStore} from '@/store/non-reactive-data';

Vue.use(Vuex)


// The store gives access to some variables through the whole app^
// Values in here are mainly default values, to update depending on user inputs
export default new Vuex.Store({
  state: {
    coreThresholdSlide: 85, // Minimal presence ratio to be part of core, should be turn into a % !

    optionPanelWidth: 300,
    yOffsetOfPavBlocks: 0,

    displayIsLoading: false, //Whether a dataset is loading
    fileLoaded: false, // Reflect if the main file is loaded
    isGffUploaded: false, // Detect if a GFF file has been uploaded

    genomeListInDisplay: [ 'Gen1', 'Gen2', 'Gen3', 'Gen4', 'Gen5', 'Gen6' ], //List of every genome name, same order as within the initial dataset
    annotMap: new Map(), // List of every gene present in the genomes in display
    annotMapChromInDisplay: [ 'Gen1', 'Gen2', 'Gen3', 'Gen4', 'Gen5', 'Gen6' ],
    annotMapNames: [ 'Gen1', 'Gen2', 'Gen3', 'Gen4', 'Gen5', 'Gen6' ],

    // fullChromData: [], //Chromosomal dataset
    fullGffData: [], //Gff linked to the displayed pav data
    ntWidthInPxThresholds: new Map(), // map[chromosome] -> {min: i, max: j}

    currentDisplayNtWidthInPx: 0.5, // Updates --> minEfficiency per default, or user input
    minNbOfFeaturesToDisplay: 10,
    maxNbOfFeaturesToDisplay: 200,

    // Coords of the first and last nt to display on the block level vis
    firstNtToDisplay: 0,
    lastNtToDisplay: 1200,
    chromNames: ['0', '1', '2', '3'],
    selectedChrom: '0', // Stores the id of the chrom to display at the block level vis
    coordsOfHollowAreas: new Map(),
    localAreaSelected: [0, 10000],

    // Color scales used throughout the app
    colorsForPositionColorScale: [
      [0.17642634,0.09835639,0.08618555],
      [0.18231057,0.10054915,0.08071249],
      [0.18810282,0.1027363 ,0.07516485],
      [0.19386281,0.10489561,0.06935399],
      [0.19960413,0.10702021,0.06323693],
      [0.20534374,0.1090968 ,0.05680382],
      [0.21169145,0.11066012,0.05020889],
      [0.21883076,0.11153004,0.04366557],
      [0.22655297,0.11180818,0.03744291],
      [0.23465466,0.11161199,0.03201775],
      [0.24297592,0.1110444 ,0.02739996],
      [0.2514559 ,0.11013794,0.0234498 ],
      [0.26000982,0.10895355,0.02003114],
      [0.26861778,0.10749818,0.01703769],
      [0.27726066,0.10577773,0.01439111],
      [0.28592959,0.10378772,0.01202455],
      [0.29461524,0.10152244,0.0098878 ],
      [0.30332248,0.09895736,0.00794198],
      [0.31205682,0.09606114,0.00615882],
      [0.32080174,0.0928264 ,0.00450486],
      [0.32947471,0.08930611,0.00332926],
      [0.33816035,0.08534346,0.00263868],
      [0.34680685,0.08095051,0.00259408],
      [0.35535682,0.07615513,0.00338034],
      [0.36376204,0.07098635,0.00515086],
      [0.3719397 ,0.06555507,0.00814242],
      [0.37980245,0.06003264,0.01260744],
      [0.38727619,0.05463191,0.01879129],
      [0.39431605,0.04957072,0.02691015],
      [0.4009155 ,0.04502323,0.03714606],
      [0.40709775,0.04110443,0.04894956],
      [0.41289967,0.03788166,0.0609675 ],
      [0.41834453,0.03551595,0.0731913 ],
      [0.42351265,0.03381557,0.08547185],
      [0.42840152,0.03279731,0.09793144],
      [0.43308514,0.03225857,0.11042674],
      [0.43755677,0.03221533,0.12307121],
      [0.4418593 ,0.03254358,0.13580194],
      [0.44601929,0.03316017,0.14860745],
      [0.45008958,0.03389665,0.16142157],
      [0.45408642,0.03467205,0.17430629],
      [0.45800929,0.03548295,0.1872751 ],
      [0.46186553,0.03629548,0.20033599],
      [0.46565524,0.03710383,0.21349418],
      [0.46937859,0.03790138,0.22675448],
      [0.47302406,0.03872919,0.24012078],
      [0.47659658,0.03956239,0.2535949 ],
      [0.48010268,0.04036825,0.26717813],
      [0.48354268,0.04112368,0.28087212],
      [0.48691539,0.04183397,0.29467757],
      [0.49020414,0.04256455,0.30859435],
      [0.49342743,0.0432334 ,0.32262346],
      [0.49658576,0.04383269,0.33676574],
      [0.49967968,0.04435406,0.35102201],
      [0.5026976 ,0.04484032,0.36539148],
      [0.50564287,0.04527103,0.37987504],
      [0.50852511,0.04559752,0.39447554],
      [0.51134499,0.04580798,0.40919487],
      [0.51410319,0.04588911,0.42403548],
      [0.51678086,0.0459148 ,0.43899386],
      [0.51939642,0.04579077,0.45407769],
      [0.52195238,0.04549038,0.46929093],
      [0.5244495 ,0.04499142,0.48463792],
      [0.52688858,0.04426798,0.50012327],
      [0.5292533 ,0.04337509,0.51574541],
      [0.53154106,0.0423306 ,0.53148317],
      [0.5336897 ,0.04149026,0.54727513],
      [0.53568097,0.04094333,0.56312764],
      [0.5374962 ,0.04082173,0.57901709],
      [0.53907855,0.04157399,0.59482405],
      [0.54044587,0.04304944,0.61059275],
      [0.54157813,0.04535546,0.62629133],
      [0.54242075,0.04885025,0.64179095],
      [0.5429633 ,0.05347554,0.65707149],
      [0.54320844,0.05907286,0.67212162],
      [0.54307903,0.06596642,0.68676403],
      [0.54259886,0.07379172,0.70102585],
      [0.54174265,0.08250528,0.71482814],
      [0.54046269,0.09216486,0.72803567],
      [0.53880405,0.1023704 ,0.74071684],
      [0.53668376,0.11335892,0.75264768],
      [0.53416666,0.12471614,0.76394029],
      [0.5312139 ,0.1365069 ,0.77446814],
      [0.52783991,0.14859478,0.78422964],
      [0.52407848,0.1608173 ,0.79326985],
      [0.51988238,0.17327893,0.80144706],
      [0.51533335,0.18571137,0.80893176],
      [0.51041006,0.19816764,0.8156468 ],
      [0.50512871,0.21059076,0.82162437],
      [0.49961814,0.2226491 ,0.82726616],
      [0.49393387,0.23422607,0.83281827],
      [0.48805524,0.24539617,0.83829232],
      [0.48196292,0.25621572,0.84370215],
      [0.47565755,0.26674824,0.84897198],
      [0.46910214,0.27702196,0.85416774],
      [0.46229667,0.28709057,0.85919288],
      [0.45520076,0.29697091,0.86411095],
      [0.44781787,0.30670656,0.86881015],
      [0.44010262,0.31630879,0.87334865],
      [0.43204869,0.32580806,0.87764207],
      [0.42362825,0.33522023,0.88167647],
      [0.41480752,0.34456019,0.88543887],
      [0.40557422,0.35384559,0.88885905],
      [0.39590579,0.36308922,0.89188965],
      [0.38577251,0.37229626,0.8945105 ],
      [0.37515452,0.38147442,0.89666812],
      [0.36403727,0.39062747,0.89830738],
      [0.35241218,0.39975554,0.89937267],
      [0.34028573,0.40885911,0.89978321],
      [0.32774601,0.41797826,0.8991943 ],
      [0.31489336,0.4270851 ,0.89753184],
      [0.30183453,0.43613376,0.89482344],
      [0.28869227,0.44507876,0.89112025],
      [0.27560214,0.45387733,0.88649421],
      [0.26270977,0.46249127,0.88103465],
      [0.25016417,0.47088925,0.87484202],
      [0.23811487,0.47904725,0.86802324],
      [0.22670868,0.48694846,0.86068757],
      [0.21608401,0.49458347,0.8529415 ],
      [0.2063666 ,0.50194947,0.84488553],
      [0.19771231,0.50904954,0.8365752 ],
      [0.19021232,0.51588837,0.82810857],
      [0.18390295,0.52247738,0.8195749 ],
      [0.17881832,0.52882827,0.81104458],
      [0.17509376,0.53495416,0.80249005],
      [0.17265187,0.54086404,0.79403204],
      [0.17177095,0.54655529,0.78560156],
      [0.17222337,0.55205238,0.77726762],
      [0.17378938,0.55738389,0.76903378],
      [0.17615781,0.5625653 ,0.76103937],
      [0.17914899,0.56762051,0.75326618],
      [0.18266994,0.57256808,0.74566267],
      [0.18650704,0.57742312,0.73829103],
      [0.19052921,0.58220065,0.73115649],
      [0.19463624,0.58691389,0.72425595],
      [0.19874207,0.59157556,0.71758078],
      [0.2027727 ,0.59619866,0.71111095],
      [0.20666646,0.60079145,0.70485514],
      [0.21036859,0.60536655,0.69878047],
      [0.21383434,0.60993141,0.69288722],
      [0.21703845,0.61449516,0.68714133],
      [0.21996153,0.61906626,0.68150522],
      [0.22254682,0.62365144,0.67599211],
      [0.22476981,0.62825681,0.67058603],
      [0.22661044,0.63288775,0.66526987],
      [0.22805095,0.6375496 ,0.66002049],
      [0.22911487,0.64224818,0.65475941],
      [0.22975881,0.64698618,0.64950678],
      [0.22996577,0.65176568,0.64425639],
      [0.22973091,0.65658846,0.63898731],
      [0.22908511,0.66145888,0.633606  ],
      [0.22799277,0.66637563,0.62814781],
      [0.22644956,0.67133787,0.62260447],
      [0.22447166,0.67634798,0.61690542],
      [0.22205678,0.68140528,0.61102881],
      [0.21920519,0.68650279,0.60501797],
      [0.21592408,0.69164357,0.59879279],
      [0.21221225,0.69682632,0.59232659],
      [0.20807403,0.70204245,0.58567137],
      [0.20351938,0.70729546,0.57872665],
      [0.19853559,0.7125807 ,0.57151082],
      [0.19297502,0.71791548,0.563899  ],
      [0.18736914,0.72323644,0.55609352],
      [0.18135604,0.72858401,0.54791023],
      [0.17503579,0.73394633,0.53934841],
      [0.16874894,0.73928864,0.53052084],
      [0.16221828,0.74463942,0.52127794],
      [0.15551845,0.74999172,0.51160687],
      [0.14919422,0.7553015 ,0.50166172],
      [0.14293243,0.76060095,0.49125951],
      [0.13688751,0.76588208,0.48038901],
      [0.13126027,0.77113592,0.46904268],
      [0.12665233,0.77632937,0.45733152],
      [0.12293983,0.78148205,0.44510257],
      [0.12041924,0.78658423,0.43234127],
      [0.11939937,0.79162558,0.41903081],
      [0.12016703,0.79659625,0.40513365],
      [0.12296906,0.80148512,0.3906048 ],
      [0.12798741,0.80627794,0.37542319],
      [0.13530683,0.81096052,0.3595318 ],
      [0.14493781,0.81551718,0.34283617],
      [0.15683341,0.81992783,0.3252577 ],
      [0.17092108,0.82416942,0.30667053],
      [0.18725351,0.82820547,0.28692367],
      [0.20607812,0.83196768,0.26613155],
      [0.22716994,0.83543043,0.24373714],
      [0.25118731,0.83845906,0.22007302],
      [0.27835195,0.84093886,0.19504902],
      [0.30915572,0.84267867,0.16950859],
      [0.34375101,0.84344521,0.1470234 ],
      [0.37952925,0.84338851,0.13169818],
      [0.41312776,0.8430636 ,0.11962236],
      [0.44439317,0.84261247,0.10967043],
      [0.47365705,0.84207448,0.10170971],
      [0.50122104,0.84147287,0.09557267],
      [0.52730117,0.84082975,0.09108893],
      [0.5520863 ,0.84015992,0.08805999],
      [0.57571187,0.83947955,0.08628059],
      [0.5984306 ,0.83876498,0.08571771],
      [0.62024267,0.83805002,0.08601515],
      [0.64132847,0.83731432,0.08713087],
      [0.6617087 ,0.83657747,0.08879406],
      [0.68154212,0.83581308,0.09102677],
      [0.70081731,0.83504384,0.0935644 ],
      [0.71960798,0.83426307,0.09635359],
      [0.73802098,0.83344911,0.09939363],
      [0.75604119,0.83261963,0.10253069],
      [0.77371416,0.83177012,0.10572508],
      [0.79108075,0.83089579,0.10894464],
      [0.80817675,0.82999198,0.11216386],
      [0.82520898,0.82898286,0.11559134],
      [0.84180466,0.82798314,0.12145705],
      [0.85793986,0.82700858,0.12984017],
      [0.87355958,0.82608794,0.14072229],
      [0.88849692,0.82529345,0.15429343],
      [0.90262078,0.82468925,0.17048182],
      [0.91591918,0.82430062,0.1886849 ],
      [0.92799674,0.82430227,0.20933263],
      [0.93899864,0.82466733,0.23134369],
      [0.94855199,0.8255696 ,0.25503363],
      [0.95691108,0.82693626,0.27933229],
      [0.96383914,0.82888118,0.30447136],
      [0.9696757 ,0.83128424,0.32960239],
      [0.97438825,0.83416405,0.35482606],
      [0.97816184,0.837449  ,0.37986434],
      [0.98117066,0.84106727,0.40455346],
      [0.98351136,0.84497726,0.42885981],
      [0.98522297,0.84915749,0.45286664],
      [0.98643285,0.85355284,0.47648966],
      [0.98723284,0.85812222,0.49970632],
      [0.98768023,0.86283839,0.52253782],
      [0.98783333,0.86767609,0.5449683 ],
      [0.98773128,0.87261545,0.56704047],
      [0.98742681,0.87763574,0.58871847],
      [0.98689619,0.88274066,0.6101195 ],
      [0.98620131,0.88790594,0.63119967],
      [0.98536245,0.89311878,0.65202299],
      [0.98446129,0.89833094,0.67275778],
      [0.98364812,0.90349566,0.69317492],
      [0.98293006,0.90861379,0.71327027],
      [0.98230891,0.91368719,0.73305505],
      [0.98179014,0.91871705,0.75252767],
      [0.98138155,0.92370426,0.7716784 ],
      [0.98108842,0.92865014,0.79050515],
      [0.98091034,0.9335567 ,0.80902385],
      [0.9808577 ,0.9384243 ,0.82721719],
      [0.98093473,0.94325398,0.84508915],
      [0.98114547,0.94804635,0.86264793],
      [0.98149213,0.9528014 ,0.8799146 ],
      [0.98204349,0.95751162,0.89670823],
      [0.98276416,0.96217738,0.91320821],
      [0.98375748,0.96678161,0.92919764],
      [0.98509826,0.97129629,0.944697  ],
      [0.98706941,0.97563829,0.95945595],
      [0.99025795,0.97969714,0.97233822],
      [0.99339633,0.98403048,0.98290965]
    ], //colors that will be used for the position track
    greenColorScale: d3.scaleLinear().range([d3.hcl('green'), d3.hcl('green')]),
    blueColorScale: d3.scaleLinear().range([d3.hcl('blue'), d3.hcl('blue')]),
    orangeColorScale: d3.scaleLinear().range([d3.hcl('orange'), d3.hcl('orange')]),

    displayShapeSelected: 'square',

    // Values to the sort functionality
    sortChoice: ['None', 'Alphanumeric', 'Reverse alphanumeric', 'Local presence/absence pattern'], // Sorting methods available to sort the genomes
    genomeListInDisplaySave: ['Gen1', 'Gen2', 'Gen3', 'Gen4', 'Gen5', 'Gen6'], // Save of the initial order of the genomes
    selectedSortMode: 'None', // Sorting mode by default (change when the user select an other method
    newickTreeDataString: "", // Value extracted from the Newick file uploaded
    newickTreeData: [], // Array that contain the data exported from the Newick file uploaded
    isNewickTreeDisplayed: false, // Detect if the Newick tree is displayed

    colorScaleMaker: (domain, range, scaleLinear = true) => {
      if (scaleLinear) {
        return d3.scaleLinear()
            .domain(domain)
            .interpolate(d3.interpolateHcl)
            .range(range);
      } else {
          return d3.scaleOrdinal()
              .domain(domain)
              .range(range);
      }
    },
    domainPivotsMaker: (breakpointsNb, maxValue) => {
      let breakpoints = [];
      for (var i = 0; i < breakpointsNb; ++i) {
          breakpoints.push(Math.round( (i / (breakpointsNb - 1) ) * maxValue));
      }
      return(breakpoints);
    },

  },
  getters: {
    nbOfGenomesInDisplay: state => {
      return state.genomeListInDisplay.length
    },
    chromDataInDisplay: state => {
      const fullChromData = nonReactiveDataStore.fullChromData;

      //console.log('Within chromDataInDisplay', {chromNames: state.chromNames, fullSet: fullChromData, selectedChrom:state.selectedChrom, firstChrom:fullChromData[state.selectedChrom]})
      if (fullChromData[state.selectedChrom] === undefined || fullChromData[state.selectedChrom][0] === undefined) {
        return [] //default value
      }

      let chromData = fullChromData[state.selectedChrom];

      //console.log({chromData});
      return chromData;
    },
    gffDataInDisplay: state => {
      if (state.fullGffData[state.selectedChrom] === undefined || state.fullGffData[state.selectedChrom][0] === undefined) {
        return [] //default value
      }
      return state.fullGffData[state.selectedChrom];
    },
    lastNtOfChrom: (state, getters) => {
      //console.log('Within lastNtOfChrom', {chromInDisplay: getters.chromDataInDisplay});
      if (getters.chromDataInDisplay === undefined || getters.chromDataInDisplay[0] === undefined) {
        return 10000 //default value
      }
      return Math.max(...getters.chromDataInDisplay.map(d => Number(d.FeatureStop)));
    },
    lastBlockStartOfChrom: (state, getters) => {
      if (getters.chromDataInDisplay === undefined || getters.chromDataInDisplay[0] === undefined) {
        return 9450 //default value
      }
      return Math.max(...getters.chromDataInDisplay.map(d => Number(d.FeatureStart)))
    },
    ntWidthThresholdsCouple: (state, getters) => {
      let ntCouple = {};

      //If values are already stored, get them...
      if (state.ntWidthInPxThresholds.has(state.selectedChrom)) {
        ntCouple = state.ntWidthInPxThresholds.get(state.selectedChrom);
      //...else compute them and store them into the map
      } else {
        //Default values when no dataset is loaded
        let minNtWidth = 0.5;
        let maxNtWidth = 2;

        //ntWidthInPx = (displayWidthInPx x totNumberOfFeatures) / (nbOfFeaturesToDisplay x LastNt)
        if (getters.chromDataInDisplay !== undefined && getters.chromDataInDisplay[0] !== undefined) {
          //CAUTION: Seing fewer features means that they should appear bigger, hence linked to maxNtWidth
          //Same applies to minNtWidth and max nb of features.
          minNtWidth = (getters.displayWindowWidth * getters.chromDataInDisplay.length) / ( state.maxNbOfFeaturesToDisplay * getters.lastNtOfChrom);
          maxNtWidth = (getters.displayWindowWidth * getters.chromDataInDisplay.length) / ( state.minNbOfFeaturesToDisplay * getters.lastNtOfChrom);

          //Store value in map for future calls
          state.ntWidthInPxThresholds.set(state.selectedChrom, ntCouple);
        }

        ntCouple['min'] = minNtWidth;
        ntCouple['max'] = maxNtWidth;

      }
      return ntCouple;
    },
    minNtWidthForNavigabilityInMainDisplay: (state, getters) => {
      return getters.ntWidthThresholdsCouple['min'];
    },
    maxNtWidthInMainDisplay: (state, getters) => {
      return getters.ntWidthThresholdsCouple['max'];
    },
    rgbColorsForPositionColorScale: (state) => {
      return [...state.colorsForPositionColorScale.map(d => d3.rgb(Math.round(d[0]*255), Math.round(d[1]*255), Math.round(d[2]*255))) ];
    },
    pivotsForPosRainbow: (state, getters) => {
      return state.domainPivotsMaker(state.colorsForPositionColorScale.length, getters.lastBlockStartOfChrom);
    },
    positionRainbowColorScale: (state, getters) => {
      return state.colorScaleMaker(getters.pivotsForPosRainbow, getters.rgbColorsForPositionColorScale);
    },
    functionDiversity: (state, getters) => {
      return [...new Set(getters.chromDataInDisplay.map( d => d['Function']))]
    },
    functionColorScale: (state, getters) => {
      if (getters.functionDiversity !== undefined) {

        let nbOfFunctions = getters.functionDiversity.length;
        //For now Functions are supposed to be int, we construct a dedicated domain
        let arrayOfInt = state.domainPivotsMaker(nbOfFunctions, nbOfFunctions);
        //+1 so that there is no full circle in the rainbow
        let arrayOfColors = arrayOfInt.map(intNum => d3.interpolateRainbow(intNum / (nbOfFunctions + 1)));

        return state.colorScaleMaker(getters.functionDiversity, arrayOfColors, false);
      }

      return d3.scaleLinear().range([d3.hcl('purple'), d3.hcl('purple')]);
    },
    //Rainbow of color in case function diversity is 1
    correspondancePosColor: (state, getters) => {
      let colorMap = new Map();
      getters.chromDataInDisplay.forEach( (d, i) => {
        colorMap.set(d['FeatureStart'], d3.interpolateRainbow( (i%14) /14))
      });

      return colorMap;
    },
    //Function that automatically detects which color to return for a given data block
    colorForFunctionElement: (state, getters) => {
      let functionToReturn;

      if (getters.functionDiversity.length >= 2) {
        functionToReturn = (dataObject) => {
          return getters.functionColorScale(dataObject['Function'])
        }
      } else {
        functionToReturn = (dataObject) => {
          return getters.correspondancePosColor.get(dataObject['FeatureStart'])
        }
      }

      return functionToReturn;
    },
    //Based on size of display
    displayWindowWidth: state => {

      //TODO: Have an adaptative -80 for the borders, not a hardcoded value?
      return window.innerWidth - state.optionPanelWidth - 80
    },
  },
  mutations: {
    TURN_LOADING_ON(state) {
      state.displayIsLoading = true
    },
    TURN_LOADING_OFF(state) {
      state.displayIsLoading = false
    },
    SET_FILE_LOADED_TRUE(state) {
      state.fileLoaded = true
    },
    SET_FILE_LOADED_FALSE(state) {
      state.fileLoaded = false
    },
    SET_CHROM_NAMES(state, payload) {
      state.chromNames = payload
      console.log(state.chromNames)
    },
    SET_GENOMES_IN_DISPLAY(state, payload) {
      state.genomeListInDisplay = [...payload];
      console.log("Display updated : " + state.genomeListInDisplay);
    },
    SET_GENOMES_IN_DISPLAY_SAVE(state, payload) {
      state.genomeListInDisplaySave = [...payload]
      console.log("Save updated : " + state.genomeListInDisplaySave)
    },
    // SET_FULL_CHROM_DATA(state, payload) {
    //   fullChromData = payload;
    // },
    SET_FULL_GFF_DATA(state, payload) {
      state.fullGffData = payload;
      for (let i = 0; i < state.chromNames.length; i++) {
        state.fullGffData[state.chromNames[i]].sort((a,b) => { // Sort the genes in every chromosomes by their start (number)
          if (a.geneStart < b.geneStart) {
            return -1;
          } else if (a.geneStart > b.geneStart) {
            return 1;
          } else {
            return 0;
          }
        });
      }
      // Extraction of the every genes, their position and their chromosome in a Map <---> { name, [positon , chromosome] }
      let arrayGeneNameListUnSort = new Map();
      let annotMapSelectedChrom = [];
      for (let i = 0; i < state.chromNames.length; i++) {
        for (let j = 0; j < state.fullGffData[state.chromNames[i]].length; j++) {
          let gene = state.fullGffData[state.chromNames[i]][j];
          arrayGeneNameListUnSort.set(gene.geneName, [gene.geneStart, gene.geneStop, state.chromNames[i]]);
          if (state.chromNames[i] === state.selectedChrom) { // Put the genes of the selected chromosome in an other list
            annotMapSelectedChrom.push(gene.geneName);
          }
          state.annotMapNames.push(gene.geneName)
        }
      }
      state.annotMap = new Map([...arrayGeneNameListUnSort].sort()); // Sort the Map by alphabetical order.
      state.annotMapChromInDisplay = [...annotMapSelectedChrom]; // Update the list of the displayed chromosome's genes
      //console.log('Annot Map updated', {'annotMap': state.annotMap});
    },
    SET_NEWICK_TREE_DATA(state, payload) {
      state.newickTreeData = payload
    },
    SET_NEWICK_TREE_DATA_STRING(state, payload) {
      state.newickTreeDataString = payload
    },
    SET_SELECTED_CHROM(state, payload) {
      state.selectedChrom = payload;
      if (state.isGffUploaded) {
        let annotMap = [];
        for (let i = 0; i < state.fullGffData[state.selectedChrom].length; i++) {
          let gene = state.fullGffData[state.selectedChrom][i];
          annotMap.push(gene.geneName);
        }
        state.annotMapChromInDisplay = [...annotMap];
      }
    },
    SET_NEW_FIRST_NT_OF_DISPLAY(state, payload) {
      state.firstNtToDisplay = payload
    },
    SET_NEW_LAST_NT_OF_DISPLAY(state, payload) {
      state.lastNtToDisplay = payload
    },
    SET_GLOBAL_LAST_NT(state, payload) {
      state.lastNtOfChrom = payload
    },
    SET_NEW_CURRENT_ZOOM(state, payload) {
      state.currentDisplayNtWidthInPx = payload
    },
    SET_NEW_COORDS_OF_HOLLOW_AREAS(state, payload) {
      state.coordsOfHollowAreas = payload
    },
    SET_DISPLAY_SHAPE_SELECTED(state, payload) {
      state.displayShapeSelected = payload;
    },
    SET_SELECTED_SORT_MODE(state, payload) {
      state.selectedSortMode = payload
    },
    PUSH_IN_SORT_CHOICE(state, payload) {
      if (!state.sortChoice.includes(payload)) {
        state.sortChoice.push(payload);
      }
    },
    SET_Y_OFF_SET_OF_PAV_BLOCK(state, payload) {
      state.yOffsetOfPavBlocks = payload
    },
    SET_GFF_UPLOADED_TRUE(state) {
      state.isGffUploaded = true
    },
    TURN_NEWICK_TREE_DISPLAYED_ON(state) {
      state.isNewickTreeDisplayed = true
    },
    TURN_NEWICK_TREE_DISPLAYED_OFF(state) {
      state.isNewickTreeDisplayed = false
    },
    SET_LOCAL_AREA_SELECTED(state, payload) {
      state.localAreaSelected = payload
    },
  },
  // Functions to call within the app to apply mutations to the store, asynch
  actions: {
    updateDisplayLoadingStatus({commit, state}) {
      if (state.displayIsLoading === true) {
        commit('TURN_LOADING_OFF')
      } else {
        commit('TURN_LOADING_ON')
      }
    },
    updateFileLoaded({commit}, value) {
      if (value === false) {
        commit('SET_FILE_LOADED_FALSE')
      } else if (value === true) {
        commit('SET_FILE_LOADED_TRUE')
      }
    },
    updateChromNames({commit}, chromList) {
      commit('SET_CHROM_NAMES', chromList)
    },
    updateGenomesInDisplay({commit}, genoList) {
      commit('SET_GENOMES_IN_DISPLAY', genoList)
    },
    updateGenomesInDisplaySave({commit}, genoList) {
      commit('SET_GENOMES_IN_DISPLAY_SAVE', genoList)
    },
    // updateFullChromData({commit}, pavData) {
    //   commit('SET_FULL_CHROM_DATA', pavData)
    // },
    updateFullGffData({commit}, gffData) {
      commit('SET_FULL_GFF_DATA', gffData)
    },
    //ntWidthThresholds shaped as {'chromosome': 'chr1', 'minNtWidth': 0.5, 'maxNtWidth': 2}
    //addNtThresholdsToMap({commit}, ntWidthThresholds) {
    //  commit('ADD_NT_THRESHOLDS_TO_MAP', ntWidthThresholds)
    //},
    updateSelectedChrom({commit}, selectedChrom) {
      commit('SET_SELECTED_CHROM', selectedChrom)
    },
    updateFirstNtToDisplay({commit}, ntIndex) {
      commit('SET_NEW_FIRST_NT_OF_DISPLAY', ntIndex)
    },
    updateLastNtToDisplay({commit}, ntIndex) {
      commit('SET_NEW_LAST_NT_OF_DISPLAY', ntIndex)
    },
    updateLastNtOfChrom({commit}, ntIndex) {
      commit('SET_GLOBAL_LAST_NT', ntIndex)
    },
    updateCurrentZoomLvl({commit}, ntWidthInPx) {
      commit('SET_NEW_CURRENT_ZOOM', ntWidthInPx)
    },
    updateCoordsOfHollowAreas({commit}, mapOfCoords) {
      commit('SET_NEW_COORDS_OF_HOLLOW_AREAS', mapOfCoords)
    },
    updateDisplayShapeSelected({commit}, shape) {
      commit('SET_DISPLAY_SHAPE_SELECTED', shape);
    },
    updateSelectedSortMode({commit}, selectedSortMode) {
      commit('SET_SELECTED_SORT_MODE', selectedSortMode)
    },
    updatePhylogenyTree({commit}, newickTreeData) {
      commit('SET_NEWICK_TREE_DATA', newickTreeData)
    },
    updatePhylogenyString({commit}, newickTreeDataString) {
      commit('SET_NEWICK_TREE_DATA_STRING', newickTreeDataString)
    },
    pushSortModeInSortChoice({commit}, sortMode) {
      commit('PUSH_IN_SORT_CHOICE', sortMode)
    },
    updateYOffsetOfPavBlocks({commit}, size) {
      commit('SET_Y_OFF_SET_OF_PAV_BLOCK', size)
    },
    updateIsGffUploadedTRUE({commit, state}) {
      if (state.isGffUploaded === false) {
        commit('SET_GFF_UPLOADED_TRUE')
      }
    },
    updateIsNewickTreeDisplayed({commit, state}) {
      if (state.isNewickTreeDisplayed === true) {
        commit('TURN_NEWICK_TREE_DISPLAYED_OFF')
      } else {
        commit('TURN_NEWICK_TREE_DISPLAYED_ON')
      }
    },
    updateLocalAreaSelected({commit}, coordinates) {
      commit('SET_LOCAL_AREA_SELECTED', coordinates)
    },
  },
})