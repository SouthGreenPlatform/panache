#!/usr/bin/env python3

import argparse
import pandas as pd
import re
import json

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
    pavData.Chromosome = pavData.Chromosome.astype(str)

    # Defines the list/set of chromosome names
    CHROMOSOME_NAMES = set(pavData.Chromosome.unique())

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
    FUNCTION_DIVERSITY = list(pavData.Function.unique())

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
        progressRate = round(index/len(pavDf) * 100, 0)
        if progressRate * 10 % 100 == 0:
            print(f"Parsing progress for PAV file: {progressRate}%")

        # Add positional index, to unlink postion x FeatureStart
        addIndex(pavDf, index)

        # Add presence count from pav matrix
        addBlockCount(pavDf, index, genoNames)

        # Compute proportions of block repetitions in all panchromosomes
        addCopyPption(pavDf, index, chromNames)

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

def sortDfByStartPos(df):
    """
    Sorts a df by ascending order of the start position of blocks
    """
    df.sort_values(by=['FeatureStart'], inplace=True)

def groupPav(df, chromNames):
    """
    Groups the per-chromosome subdatasets into a dict of dicts
    """
    groups = df.groupby(df.Chromosome)
    groupedPavData = {}
    #Write subgroups as dict, in record format (ie. one row after the other)
    for idx, chrom in enumerate(chromNames):
        groupedPavData[chrom] = groups.get_group(chrom).to_dict('records')
        print(f"Grouped chromosome {idx+1}/{len(chromNames)}")

    return groupedPavData

def writePavAsJson(dictOfDicts, outputPavName):
    """
    Turn the dict of dicts into a proper json fstringile, and write it on the system
    """
    jsonStr = json.dumps(dictOfDicts)

    outputPavFile = open(outputPavName, "w")
    outputPavFile.write(jsonStr)
    outputPavFile.close()
    print(f"Pav Data written as JSON, in {outputPavName}")

################################################################################


#####################################SCRIPT#####################################

### PAV FILE

# Infers output name
if args.outPav is None:
    args.outPav = args.pavName

parsedPavDict, genomeNames, chromosomeNames, listOfFunctions = convertPav(args.pavName)
writePavAsJson(parsedPavDict, inferOutputName(args.outPav))

################################################################################