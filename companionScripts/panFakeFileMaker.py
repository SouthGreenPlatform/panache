#!/usr/bin/python

import random
import sys
import csv
import re

blockPopSize = int(sys.argv[1])
chrPopSize = int(sys.argv[2])
iupacCodeFrequent = 'ATGC' #I need to choose the four first with higher probability
iupacCodeMedium = 'RYKMSW'
iupacCodeRare = 'BDHVN'
listID = []

def sequenceEncoder(ntSeqLength):
	"""
	"""
	seqCode = ""
	for nt in range(ntSeqLength):
		ntProbability = random.random()
		if (ntProbability < 0.5):
			nt2Add = random.choice(iupacCodeFrequent)
		elif (ntProbability < 0.9):
			nt2Add = random.choice(iupacCodeMedium)
		else:
			nt2Add = random.choice(iupacCodeRare)
		if (random.random() > 0.1):
			seqCode += nt2Add
		else:
			seqCode += nt2Add.lower()
	return seqCode

#with open('myFakePanData.tsv', 'wb') as csvfile:
#The previous line works with python 2., while python 3. needs strings as input instead of bytes , cf https://stackoverflow.com/questions/34283178/typeerror-a-bytes-like-object-is-required-not-str-in-python-and-csv
with open('myFakePanData.tsv', 'w') as csvfile:
	writer = csv.writer(csvfile, delimiter='\t')
	
	#Encoding the ID/Position -------------------------------------------------
	startPosition = 0
	chromosomeIndex = 0
	blockIndex = 0
	while (blockIndex < blockPopSize):
		seqLength = random.randint(10,21)
		seqStart = startPosition
		seqStop = seqStart + seqLength
		startPosition = seqStop + 1
		blockID = str(chromosomeIndex) + ':' + str(seqStart) + ':' + str(seqStop)
		
		listID.append(blockID)
		
		blockIndex +=1
		#Encoding similar chromosome lengths
		if (len(listID) > blockPopSize*(chromosomeIndex+1)/chrPopSize):
			chromosomeIndex += 1
			startPosition = 0
			
	#Linking the ID of similar blocks -----------------------------------------
	availableBlocks = list(listID)
	#Limiting the number of similarities to a certain amount
	similarityNumber = random.randint(3,int(round(blockPopSize/7)))
	similarBlocks = []
	for duplication in range(similarityNumber+1):
		#Limiting the max number of similar blocks for a given similarity
		affectedBlocksNumber = random.randint(2,chrPopSize+1)
		simIndex = 0
		siblings = []
		siblingsLength = []
		while (simIndex <= affectedBlocksNumber):
			choosenBlock = random.choice(availableBlocks)
			availableBlocks.remove(choosenBlock)
			siblings.append(choosenBlock)
			siblingsLength.append(int(choosenBlock.split(":")[2])-int(choosenBlock.split(":")[1]))
			simIndex += 1
		
		#Creating the longest "base" sequence ---------------------------------
		maxSiblingsLength = max(siblingsLength)
		seqCode = sequenceEncoder(maxSiblingsLength)
				
		siblings.append(seqCode)
		
		similarBlocks.append(siblings)
	#print(similarBlocks)
		
	#Writing the header row ---------------------------------------------------
	writer.writerow(['#Chromosome'] + ['FeatureStart'] + ['FeatureStop'] + ['Sequence_IUPAC_Plus'] + ['SimilarBlocks'] + ['Function'] + ['Gen1'] + ['Gen2'] + ['Gen3'] + ['Gen4'] + ['Gen5'] + ['Gen6'])
	
	for i in listID:
		#Writing fake sequences in IUPAC+ code --------------------------------
		seqLength = int(i.split(":")[2])-int(i.split(":")[1])+1

		#Giving the list of linked ID for a given block -----------------------
		linkedChr = "."		
		index = 0
		absent = (i not in similarBlocks[index])
		while (index < len(similarBlocks)) and (absent):
			absent = (i not in similarBlocks[index])
			if (not absent):
				linkedChr = str(similarBlocks[index][0:-1])
				linkedChr = re.sub(r"\[|\]|'","",linkedChr)
				
				linkedChr = re.sub(r", ",";",linkedChr)
				
				#Writing sequence based on an exisitng one --------------------
				seqCode = similarBlocks[index][-1]
				#print("original Seq : " + seqCode + " ; ID :" + i + " ; seqLength : " + str(seqLength))
				while (len(seqCode) > seqLength):
					popIndex = random.randint(0,len(seqCode))
					
					seqCode = seqCode[:popIndex] + seqCode[popIndex+1:]
				
			index += 1
		
		#Writing sequence from scratch ----------------------------------------
		if (absent):
		
			seqCode = sequenceEncoder(seqLength)
		
		#Writing all rows of fake data ----------------------------------------
		writer.writerow([i.split(":")[0]] + [i.split(":")[1]] + [int(i.split(":")[2])+1] + [seqCode] + [linkedChr] + [random.randint(0,9)] + [random.randint(0,1)] + [random.randint(0,1)] + [random.randint(0,1)] + [random.randint(0,1)] + [random.randint(0,1)] + [random.randint(0,1)])