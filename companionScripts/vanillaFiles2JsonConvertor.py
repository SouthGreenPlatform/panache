#!/usr/bin/env python3

import argparse
import pandas as pd
import re
import json
import sys

#####################################PARSER#####################################

PARSER = argparse.ArgumentParser()

#PARSER.add_argument(...
#"-n" (to specify shorter version of a called option),
#"argName" (or "--argName" if it has to be an optional arg),
#help="Help to display",
#type=str,
#choices = [0, 1, 2] (to restrict the range of available input values),
#default=0
#action="store_true" (if an option should not have any input; other actions exist)
#The argument --help is automatically created!
PARSER.add_argument("pavName", help="BED-like file built for Panache that should be converted into JSON format")
PARSER.add_argument("--gffName", help="If available, an additional gff file to convert alongside the main pav file into JSON format")
PARSER.add_argument("--outPav", help="Output name for the formatted pav file. '.json' extension will be added automatically. Default name is the same than the input's name.")
PARSER.add_argument("--outGff", help="Output name for the formatted gff file. '.json' extension will be added automatically. Default name is the same than the input's name.")

args = PARSER.parse_args()

################################################################################


###################################FUNCTIONS####################################

def mainFunction(pathToPav, outPavName=None, pathToGff=None, outGffName=None):
    """
    Main function converting PAV (and Gff) files into Panache-compatible JSONs.
    Called at the end of this script.
    """

    ### PAV FILE

    # Infers output name
    if outPavName is None:
        outPavName = pathToPav

    parsedPavDict, genomeNames, chromosomeNames, listOfFunctions = convertPav(pathToPav)
    writeFileAsJson(parsedPavDict, inferOutputName(outPavName))

    ### GFF FILE
    if pathToGff is not None:

        # Infers output name
        if outGffName is None:
            outGffName = pathToGff

        parsedGffDict = convertGff(pathToGff, chromosomeNames)
        writeFileAsJson(parsedGffDict, inferOutputName(outGffName), fileType='Gff')

    # Print additional info needed to set a pre-loaded instance of Panache
    print('CHROMOSOME NAMES TO USE:')
    print(chromosomeNames)
    print('GENOME NAMES TO USE:')
    print(genomeNames)

def inferOutputName(inputName):
    """
    Takes str as input and returns the same name with '.json' extension at the end.
    Won't work as intended with names that already have a '.' in the middle.
    """

    return '.'.join([inputName.split('.')[0], 'json'])

def convertPav(pavFileToParse):
    """
    Fonctions that write a parsed and transform json file compatible with Panache
    from a BED-like presence/absence matrix, also Panache-compatible
    """

    pavData = pd.read_csv(pavFileToParse, sep='\t')
    pavData.rename(columns={"#Chromosome": "Chromosome"}, inplace=True)
    pavData['Chromosome'] = pavData['Chromosome'].astype(str)

    # Defines the list/set of chromosome names
    CHROMOSOME_NAMES = set(pavData['Chromosome'].unique())

    # Defines the list of genome names
    # CAUTION This definition assumes that the PAV part is at the end of the
    # file and that all default columns exist!!!
    # This select the element with indexes that range from column *6* to the end,
    # assuming it is the PAV part.
    defaultHeaders = [
      'Chromosome',
      'FeatureStart',
      'FeatureStop',
      'Sequence_IUPAC_Plus',
      'SimilarBlocks',
      'Function'
      ]
    INITIAL_GENOMES_NAMES = [ genoName for index, genoName in enumerate(pavData.columns.values.tolist()) if index >= len(defaultHeaders)]

    # Defines the list of functions used
    # CAUTION IT WILL WORK DIFFERENTLY WITH TRUE GO TERMS!!!
    FUNCTION_DIVERSITY = list(pavData['Function'].unique())

    # Rewrite data with correct column names and bonus columns
    print('Parsing and rewriting pav blocks')
    overridePavData(pavData, INITIAL_GENOMES_NAMES, CHROMOSOME_NAMES)

    # Sort data per FeatureStart
    print('Sorting Data')
    sortDfByStartPos(pavData)

    # Group data per chromosome, to have multiple subdatasets, into a dict!!!
    print('Grouping Data')
    groupedPavDict = groupPav(pavData, CHROMOSOME_NAMES)

    return groupedPavDict, INITIAL_GENOMES_NAMES, CHROMOSOME_NAMES, FUNCTION_DIVERSITY

def overridePavData(pavDf, genoNames, chromNames):
    """
    Modifies pav dataframe to replace the current value of 'index' with 'FeatureStart'
    """

    # Initialize empty columns
    pavDf['index'] = 0
    pavDf['presenceCounter'] = 0
    for chrom in chromNames:
        pavDf[f"copyPptionInChr_{chrom}"] = 0

    # Rewrite all the rows
    for index in range(len(pavDf)):

        # Show progress on screen
        progress(index, len(pavDf), status='Parsing Pav file')

        # Former version:
        """
        progressRate = round(index/len(pavDf) * 100, 0)
        if progressRate * 10 % 100 == 0:
            print(f"Parsing progress for PAV file: {progressRate}%")
        """

        # Add positional index, to unlink postion x FeatureStart
        addIndex(pavDf, index)

        # Add presence count from pav matrix
        addBlockCount(pavDf, index, genoNames)

        # Compute proportions of block repetitions in all panchromosomes
        addCopyPption(pavDf, index, chromNames)

def progress(count, total, status=''):
    """
    Progress bar as found in https://gist.github.com/vladignatyev/06860ec2040cb497f0f3
    """
    bar_len = 60
    filled_len = int(round(bar_len * count / float(total)))

    percents = round(100.0 * count / float(total), 1)
    bar = '=' * filled_len + '-' * (bar_len - filled_len)

    sys.stdout.write('[%s] %s%s ...%s\r' % (bar, percents, '%', status))
    sys.stdout.flush()

def addIndex(df, idx):
    """
    Modifies pav dataframe to replace the current value of 'index' with 'FeatureStart'
    """
    df.loc[idx, 'index'] = df.loc[idx, 'FeatureStart']

def addBlockCount(df, idx, genoNames):
    """
    Modifies pav dataframe to replace the value of 'presenceCounter' with the
    number of genomes having the corresponding block
    """
    df.loc[idx, 'presenceCounter'] = sum([(0 if df.loc[idx, genoName] == 0 else 1) for genoName in genoNames])

def addCopyPption(df, idx, chromNames):
    """
    Overwrites the copyProportions of repeats for a block in a pav dataframe
    """

    # Per default, coocurrences are at 0 for every chromosome
    coocPerChrom = {chrom:0 for chrom in chromNames}

    # 'ChromA:123:456;' --> ['ChromA', '123', '456']
    fragmentedCoordsOfRepeats = re.findall(r"[^;:]+", df.loc[idx, 'SimilarBlocks'])

    # Compute the count distribution and max count
    computeRepeatCountPerChrom(fragmentedCoordsOfRepeats, coocPerChrom)
    maxCount = max(coocPerChrom.values())

    # Computes values of copy proportion for every chromosome
    if maxCount > 0:
        for chrom in chromNames:
            df.loc[idx, f"copyPptionInChr_{chrom}"] = coocPerChrom[chrom] / maxCount

def computeRepeatCountPerChrom(triosOfCoordsWithRepeat, dictOfCoocNbPerChrom):
    """
    Modifies the dict of the proportion count of repeats for each panchromosome.
    Does +=1 when a chrom has a repeat
    """
    for idx, chrom in enumerate(triosOfCoordsWithRepeat):
        #Check only chromosome names, ie first coord of triplets
        if idx % 3 == 0:
            if chrom in dictOfCoocNbPerChrom:
                dictOfCoocNbPerChrom[chrom] += 1

def sortDfByStartPos(df, column="FeatureStart"):
    """
    Sorts a df by ascending order of the start position of blocks
    """
    df.sort_values(by=column, inplace=True)

def groupPav(df, chromNames, column="Chromosome", isForPrint=True):
    """
    Groups the per-chromosome subdatasets into a dict of dicts, or dict of dataframes
    """
    groups = df.groupby(df[column])
    groupedPavData = {}
    #Write subgroups as dict, in record format (ie. one row after the other)
    for idx, chrom in enumerate(chromNames):
        if isForPrint:
            groupedPavData[chrom] = groups.get_group(chrom).to_dict('records')
        else:
            groupedPavData[chrom] = groups.get_group(chrom).reset_index()
        print(f"Grouped chromosome {idx+1}/{len(chromNames)}")

    return groupedPavData

def writeFileAsJson(dictOfDicts, outputName, fileType='Pav'):
    """
    Turn the dict of dicts into a proper json fstringile, and write it on the system
    """
    jsonStr = json.dumps(dictOfDicts)

    outputPavFile = open(outputName, "w")
    outputPavFile.write(jsonStr)
    outputPavFile.close()
    print(f"{fileType} Data written as JSON, in {outputName}")

def convertGff(gffFileToParse, chromNames):
    """
    Fonctions that write a parsed and transform json file compatible with Panache
    from a gff3 file.
    Reads only the "gene" and "intron" or "exon" lines. Gene names should be
    written in the last column with the "Name=" keyword
    """

    # Turns gff into a pandas dataframe
    gffData = readGff(gffFileToParse)

    # Group + sort? data according to chromosomes: { [chrom] --> pd.Dataframe }
    groupedGff = groupGff(gffData, chromNames)

    #Creates annotation data for the whole gff
    annotData = parseGffAnnotations(groupedGff)

    return annotData

def readGff(gffFileToParse):
    """
    Reads and format gff files into pandas dataframes
    """

    gffHeaders = [
        'chrom',
        'source',
        'feature',
        'start',
        'end', # Doesn't need conversion since end pos is the same between 0-/1-based coordinates
        'score',
        'strand',
        'frame',
        'attribute'
    ]

    gffData = pd.read_csv(
        gffFileToParse,
        sep='\t',
        header=0,
        names=gffHeaders,
        converters={
            'start': convStart1To0, # Needs conversion from 1-based to 0-based coordinate system
            'strand': convStrand # Needs conversion into +1 or -1
        }
    )
    # 'end' doesn't need conversion since end pos is the same between 0-/1-based coordinates

    return gffData

def convStart1To0(oneBasedStartPos):
    """
    Converts an int from a 1-based coordinate system into a 0-based coord system.
    """
    return int(oneBasedStartPos) - 1

def convStrand(strandSign):
    """
    Converts a '+' or '-' sign into +1 or -1 respectively
    """
    return int(f"{strandSign}1")

def groupGff(df, chromNames):
    """
    Groups the per-chromosome subdatasets into a dict, with chromNames as keys
    Gff data version
    """

    print("Grouping Gff data")

    groupDict = groupPav(df, chromNames, column="chrom", isForPrint=False)

    # Data are supposed to be sorted in Gff, so maybe do not do it here?
    # Then sort the subgroups per start pos
    #for chrom in chromNames:
    #    sortDfByStartPos(groupDict[chrom], column="start")

    return groupDict

def parseGffAnnotations(dictOfGff):
    """
    Parses all annotations, chrom after chrom, creating the annotation dataset
    used by Panache in the end
    """

    # Final data to return
    annotData = {}

    # A Dict to store geneName <--> { idx, stop, [overLeft, ...], [overRight, ...] }
    dictOfOverlaps = {}

    for idx, chrom in enumerate(dictOfGff.keys()):
        # Show progress on screen
        progress(idx, len(dictOfGff.keys()), status='Parsing Gff file')
        annotData[chrom] = createAnnotObjects(dictOfGff[chrom], dictOfOverlaps)

    return annotData

def createAnnotObjects(gffDataPerChrom, dictOfOverlaps):
    """
    For a given chromosome, finds all annotations and turns them into usable
    objects for Panache
    """

    # Array to fill with annotation data
    annotPerChrom = []

    # At first, no annotation is being completed
    currentAnnotation = None

    for idx, gffRow in gffDataPerChrom.iterrows():

        featureType = gffRow.feature

        # DISCLAIMER: Pattern matching, Python equivalent of JS's switch since
        # python 3.10 is not used here because I have version 3.7 and many users
        # might not have 3.10+ either anyway
        if featureType == 'gene':

            #Stores info of previous annot once a new one is reached
            if currentAnnotation != None:

                currentAnnotation['exons'] = currentGeneExons
                storeAnnotation(
                    annotDict = currentAnnotation,
                    annotArray = annotPerChrom,
                    idx = idx,
                    dictOfOverlaps=dictOfOverlaps
                )

            #Instanciates new annotation
            supInfo = extractNameAndNote(gffRow)

            print(supInfo)
            print(supInfo.keys())

            currentAnnotation = {
                'chrom': gffRow.chrom,
                'geneName': supInfo['geneName'],
                'geneStart': gffRow.start,
                'geneStop': gffRow.end,
                'geneStrand': gffRow.strand,
                'annotation': supInfo['annotation'],
            }

            # New gene implies new exon distribution
            currentGeneExons = []

        elif featureType == 'exon':

            # Registers exon position for current gene Annotation
            exon = {
              'start': gffRow.start,
              'stop': gffRow.end
            }
            currentGeneExons.append(exon)


    # Stores the last annotation of the chromosome once no other gene is found
    currentAnnotation['exons'] = currentGeneExons
    storeAnnotation(
        annotDict=currentAnnotation,
        annotArray=annotPerChrom,
        idx=idx,
        dictOfOverlaps=dictOfOverlaps
    )

    # In case the last annotation has overlaps, store them too
    clearDictOfOverlaps(annotArray=annotPerChrom, dictOfOverlaps=dictOfOverlaps)

    return annotPerChrom

def storeAnnotation(annotDict, annotArray, idx,  dictOfOverlaps):
    """
    Checks if annot has overlaps, then stores annotation "object" into
    the annotation array
    """

    # Looks through already stored annotations to find possible overlaps
    checkAnnotsForOverlaps(
        annotToCompare=annotDict,
        annotArray=annotArray,
        annotIdx=idx,
        dictOfOverlaps=dictOfOverlaps
    )

    #Adds annotation to the annotation array
    annotArray.append(annotDict)

def checkAnnotsForOverlaps(annotToCompare, annotArray, annotIdx, dictOfOverlaps):
    """
    Checks if annots have overlap with already stored annots and add this info
    to the annot object
    """

    # Check dictOfOverlaps for possible overlaps
    # CAUTION: this supposes that features are in order within the gff...
    # ... which should be the case by default
    foundOverlaps = connectOverlaps(dictOfOverlaps, annotToCompare)

    # Adds overlaps info within annotArray and cleans dictOfOverlaps
    writeAndStoreOverlaps(
        keysToRemove=foundOverlaps['keysToRemove'],
        dictOfOverlaps=dictOfOverlaps,
        annotArray=annotArray
    )

    # Adds current annotation to list of potentially overlapped segments
    dictOfOverlaps[annotToCompare['geneName']] = {
        'idx': annotIdx,
        'start': annotToCompare['geneStart'],
        'stop': annotToCompare['geneStop'],
        # we assume all previous overlaps are already registered from previous loops
        'listOfOverLeft': foundOverlaps['currentLeftOverlaps'],
        'listOfOverRight': foundOverlaps['currentRightOverlaps'],
    }

def connectOverlaps(dictOfOverlaps, annotToCompare):
    """
    Finds what the overlaps for the current annotation are (if any), and if
    previous annotations do not have overlap anymore.
    """

    # We find overlaps left/right pos based on centered glyphs
    return connectOverlaps_centerPosBased(dictOfOverlaps, annotToCompare)

def connectOverlaps_centerPosBased(dictOfOverlaps, annotToCompare):
    """
    ...in case marks are placed based on center positions
    """

    currentName = annotToCompare['geneName']
    currentStart = annotToCompare['geneStart']
    currentStop = annotToCompare['geneStop']

    currentCenter = (currentStart + currentStop) / 2

    keysToRemove = []
    currentLeftOverlaps = []
    currentRightOverlaps = []


    # Checks if previous annotations are overlapped by the current one
    for geneName, annot in dictOfOverlaps.items():

        # When a previous annotation is overlapped...
        if annot['stop'] > currentStart:
            annotCenter = (annot['start'] + annot['stop']) / 2

            #Places overlap names according to center position and saves them
            if annotCenter <= currentCenter:
                dictOfOverlaps[geneName]['listOfOverRight'].append(currentName)
                currentLeftOverlaps.append(geneName)

            else:
                dictOfOverlaps[geneName]['listOfOverLeft'].append(currentName)
                currentRightOverlaps.append(geneName)

        # When no overlap is detected, previous annotation(s) shouldn't be checked anymore
        else:
            keysToRemove.append(geneName)

    return {
        'keysToRemove': keysToRemove,
        'currentLeftOverlaps': currentLeftOverlaps,
        'currentRightOverlaps': currentRightOverlaps
    }

def writeAndStoreOverlaps(keysToRemove, dictOfOverlaps, annotArray):
    """
    Parses list of geneNames to remove from the dictOfOverlaps, add their info
    into annotArray, then delete them from dictOfOverlaps
    """

    for geneName in keysToRemove:
        idx = dictOfOverlaps[geneName]['idx']
        listOfOverLeft = dictOfOverlaps[geneName]['listOfOverLeft']
        listOfOverRight = dictOfOverlaps[geneName]['listOfOverRight']

        # Updates overlaps data within annotArray
        # Beware: idx might not be = to the pos within annot array, since it's taken from the original pandas df
        # Would 'reset_index' after getting the subgroups in groupPav be enough ?
        annotArray[idx]['leftOverlaps'] = listOfOverLeft
        annotArray[idx]['rightOverlaps'] = listOfOverRight

        # Deletes gene from the list of possible overlaps
        del dictOfOverlaps[geneName]

def clearDictOfOverlaps(annotArray, dictOfOverlaps):
    """
    Parse what remains in dictOfOverlaps and stores it into annotPerChrom
    """

    remainingOverlaps = [geneName for geneName in dictOfOverlaps.keys()]

    writeAndStoreOverlaps(
        keysToRemove=remainingOverlaps,
        dictOfOverlaps=dictOfOverlaps,
        annotArray=annotArray
    )

def extractNameAndNote(dfRow, column='attribute', gffNameKey='Name', gffAnnotKey='Note'):
    """
    Returns a {geneName=..., annotation=...} dict out of an attribute column
    """

    attributes = dfRow[column]

    geneName = None
    annotation = ''
    supInfoList = None

    supInfoList = attributes.split(';')

    # Extract every possible attribute from the last column of gff
    for attr in supInfoList:

        key, value = attr.split('=')[0], attr.split('=')[1]

        if key == gffNameKey:
            geneName = value

        elif key == gffAnnotKey:
            annotation = value

    return {'geneName': geneName, 'annotation': annotation}

################################################################################


#####################################SCRIPT#####################################

mainFunction(
    pathToPav=args.pavName,
    outPavName=args.outPav,
    pathToGff=args.gffName,
    outGffName=args.outGff
)

################################################################################