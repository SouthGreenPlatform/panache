#!/usr/bin/python

import random
import sys
import csv

blockPopSize = int(sys.argv[1])
chrPopSize = int(sys.argv[2])
iupacCodeFrequent = 'ATGC' #I need to choose the four first with higher probability
iupacCodeMedium = 'RYKMSW'
iupacCodeRare = 'BDHVN'
listID = []

with open('myFakePanData.tsv', 'wb') as csvfile:
	writer = csv.writer(csvfile, delimiter='\t')
	
	#Encoding the ID/Position -------------------------------------------------
	startPosition = 0
	chromosomeIndex = 0
	blockIndex = 0
	while (blockIndex <= blockPopSize):
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
	similarityNumber = random.randint(3,int(blockPopSize/4))
	similarBlocks = []
	for duplication in range(similarityNumber+1):
		#Limiting the max number of similar blocks for a given similarity
		affectedBlocksNumber = random.randint(2,chrPopSize+1)
		simIndex = 0
		siblings = []
		while (simIndex <= affectedBlocksNumber):
			choosenBlock = random.choice(availableBlocks)
			availableBlocks.remove(choosenBlock)
			siblings.append(choosenBlock)
			simIndex += 1
			
		similarBlocks.append(siblings)
		
	#Writing the header row ---------------------------------------------------
	writer.writerow(['ID-Position'] + ['Sequence IUPAC+'] + ['SimilarBlocks'] + ['Function'] + ['Gen1'] + ['Gen2'] + ['Gen3'] + ['Gen4'] + ['Gen5'] + ['Gen6'])
	for i in listID:
		seqCode = ""
		seqLength = int(i.split(":")[2])-int(i.split(":")[1])
		for nt in range(seqLength+1):
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
		linkedChr = "."
		index = 0
		notPresent = (i not in similarBlocks[index])
		while (index < len(similarBlocks)) and (notPresent):
			notPresent = (i not in similarBlocks[index])
			if (not notPresent):
				linkedChr = str(similarBlocks[index])
			index += 1
		writer.writerow([i] + [seqCode] + [linkedChr] + [random.randint(0,9)] + [random.randint(0,1)] + [random.randint(0,1)] + [random.randint(0,1)] + [random.randint(0,1)] + [random.randint(0,1)] + [random.randint(0,1)])