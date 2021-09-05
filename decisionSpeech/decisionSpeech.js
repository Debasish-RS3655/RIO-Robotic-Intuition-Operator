
const WordPOS = require('wordpos');
const wordpos = new WordPOS();
const verbList = require('./baseVerbs.json');
const decisionIndicators = require('./decisionIndicators.json');
const prepositionList = require('./prepositions.json');
const pronounList = require('./pronouns.json');
const compoundList = require('./compound-words.json');
/* e.g. formats
would you like to dance
will you dance
do you like to dance
will you dance now or later
will you dance with him or me
will you dance ballet or hip-hop
do you dance
will you dance with me
would you like to dance with me
do you like to dance with me
*/
async function main(givenSpeech) {
    var returnObj = {
        verbs: null,
        objects: null
    }
    if (givenSpeech.includes(" you ")) {
        
        let firstPartString = givenSpeech.slice(0, givenSpeech.indexOf('you')).toLowerCase();
        var includesDescisionInd = false;
        for (var x = 0; x < decisionIndicators.length; x++) {
            if (firstPartString.includes(decisionIndicators[x])) {
                
                givenSpeech = givenSpeech.replace(decisionIndicators[x], "");
                includesDescisionInd = true;
                break;
            }
        }
        
        if (includesDescisionInd == true) {
            
            let wordArray = getArrayFromStr(givenSpeech)        
            let verbsDetected = new Array(0);
            verbList.forEach(el => {
                wordArray.forEach(element => {
                    if (el == element)
                        verbsDetected.push(el);
                })
            })
            
            if (verbsDetected.length != 0) {
                let mainVerb = new Array(0);            
                let objVerbs = new Array(0);            
                if (verbsDetected.length == 1) mainVerb = verbsDetected;
                
                else {
                    verbsDetected.forEach(el => {
                        let isObjectVerb = false;
                        const wordArrayIndex = getIndex(el, wordArray);
                        let wordBefore = wordArray[wordArrayIndex - 1];
                        for (var i = 0; i < prepositionList.length; i++) {
                            if (prepositionList[i] == wordBefore) {
                                isObjectVerb = true;
                                break;
                            }
                        }
                        if (isObjectVerb == true) objVerbs.push(el);
                        else mainVerb.push(el);
                    })
                    console.log("Main verb: ", mainVerb);
                    console.log("Object verbs: ", objVerbs);
                    
                    if (mainVerb.length > 1) {
                        for (var i = 1; i < mainVerb.length; i++) {
                            objVerbs.push(mainVerb[i]);
                        }
                        mainVerb.length = 1;        
                    }
                }
                
                let arrayAfterMainVerb = wordArray.slice(getIndex(mainVerb[0], wordArray) + 1);
                
                if (arrayAfterMainVerb.length == 0) {
                    returnObj.verbs = mainVerb;
                    returnObj.objects = [];         
                    return returnObj;
                }
                
                else {
                    
                    var orPresent = false;
                    let orIndex;
                    for (x = 0; x < arrayAfterMainVerb.length; x++) {
                        if (arrayAfterMainVerb[x] == 'or') {
                            orPresent = true;
                            orIndex = x;
                            break;
                        }
                    }
                    
                    if (orPresent == true) {
                        let detectedObjects = new Array(0);     
                        
                        let afterOrArray = arrayAfterMainVerb.slice(orIndex + 1);
                        let filteredObject = filterPrep(afterOrArray);
                        detectedObjects.push(filteredObject.join(" "));
                        
                        let beforeOrArray = arrayAfterMainVerb.slice(0, orIndex);
                        
                        
                        beforeOrArray.forEach((el, i) => {
                            objVerbs.forEach(element => {
                                if (el == element) {
                                    beforeOrArray[i] = null;        
                                    detectedObjects.push(el);       
                                }
                            })
                        })
                        let nounsDetected = new Array(0);
                        for (x = 0; x < beforeOrArray.length; x++) {
                            if (beforeOrArray[x] !== null)
                                if (await wordpos.isNoun(beforeOrArray[x].toLowerCase()))
                                    nounsDetected.push(beforeOrArray[x]);
                        }
                        
                        beforeOrArray.forEach(el => {
                            if (el !== null)
                                if (checkPronoun(el) == true || el.charAt(0) == el.charAt(0).toUpperCase())
                                    nounsDetected.push(el);
                        });
                        for (var i = 0; i < nounsDetected.length; i++) {
                            let index = getIndex(nounsDetected[i], beforeOrArray);
                            
                            let isAdj = await wordpos.isAdjective(nounsDetected[i]);
                            if (index !== undefined && isAdj == false) {
                                
                                if (index !== 0) {
                                    
                                    let wordBefore = beforeOrArray[index - 1]
                                    let wordBeforeIsAdj = false;
                                    if (wordBefore !== null)
                                        wordBeforeIsAdj = await wordpos.isAdjective(wordBefore);
                                    if (wordBeforeIsAdj == true) {
                                        
                                        let compound = checkCompound(beforeOrArray[index], beforeOrArray[index + 1], beforeOrArray[index + 2]);
                                        switch (compound) {
                                            case 1: 
                                                detectedObjects.push(beforeOrArray[index - 1] + " " + beforeOrArray[index]);
                                                beforeOrArray[index - 1] = null;
                                                beforeOrArray[index] = null;
                                                break;
                                            case 2: 
                                                detectedObjects.push(beforeOrArray[index - 1] + " " + beforeOrArray[index] + " " + beforeOrArray[index + 1]);
                                                beforeOrArray[index - 1] = null;
                                                beforeOrArray[index] = null;
                                                beforeOrArray[index + 1] = null;
                                                break;
                                            case 3: 
                                                detectedObjects.push(beforeOrArray[index - 1] + " " + beforeOrArray[index] + " " + beforeOrArray[index + 1] + " " + beforeOrArray[index + 2]);
                                                beforeOrArray[index - 1] = null;
                                                beforeOrArray[index] = null;
                                                beforeOrArray[index + 1] = null;
                                                beforeOrArray[index + 2] = null;
                                                break;
                                        }
                                    }
                                    
                                    else {
                                        let compound = checkCompound(beforeOrArray[index], beforeOrArray[index + 1], beforeOrArray[index + 2]);
                                        switch (compound) {
                                            case 1:
                                                detectedObjects.push(beforeOrArray[index]);
                                                beforeOrArray[index] = null;
                                                break;
                                            case 2:
                                                detectedObjects.push(beforeOrArray[index] + " " + beforeOrArray[index + 1]);
                                                beforeOrArray[index] = null;
                                                beforeOrArray[index + 1] = null;
                                                break;
                                            case 3:
                                                detectedObjects.push(beforeOrArray[index] + " " + beforeOrArray[index + 1] + " " + beforeOrArray[index + 2]);
                                                beforeOrArray[index] = null;
                                                beforeOrArray[index + 1] = null;
                                                beforeOrArray[index + 2] = null;
                                                break;
                                        }
                                    }
                                }
                                
                                else {
                                    let compound = checkCompound(beforeOrArray[index], beforeOrArray[index + 1], beforeOrArray[index + 2]);
                                    switch (compound) {
                                        case 1:
                                            detectedObjects.push(beforeOrArray[index]);
                                            beforeOrArray[index] = null;
                                            break;
                                        case 2:
                                            let object = beforeOrArray[index] + beforeOrArray[index + 1];
                                            detectedObjects.push(object);
                                            beforeOrArray[index] = null;
                                            beforeOrArray[index + 1] = null;
                                            break;
                                        case 3:
                                            object = beforeOrArray[index] + beforeOrArray[index + 1] + beforeOrArray[index + 2];
                                            detectedObjects.push(object);
                                            beforeOrArray[index] = null;
                                            beforeOrArray[index + 1] = null;
                                            beforeOrArray[index + 2] = null;
                                            break;
                                    }
                                }
                            }
                        }
                        returnObj.verbs = mainVerb;
                        returnObj.objects = detectedObjects;
                        return returnObj;
                    }
                    
                    else {
                        
                        let filteredArray = filterPrep(arrayAfterMainVerb);
                        returnObj.verbs = mainVerb;
                        returnObj.objects = [filteredArray.join(" ")];
                        return returnObj;
                    }
                }
            }
            else {
                console.error("Not a decision speech: has no verb in the sentence.")
                return null;
            }
        }
        
        else {
            console.error("Not a decision speech: does not include decision indicators.")
            return null;
        }
    }
    
    else {
        console.error("Not a decision speech: Does not include 'you'")
        return null;
    }
}
module.exports.decisionSpeech = main;
function checkCompound(word1, word2, word3) {
    if (word1 == null || word1 == undefined) word1 = "";
    if (word2 == null || word2 == undefined) word2 = "";
    if (word3 == null || word3 == undefined) word3 = "";
    
    for (var x = 0; x < compoundList.length; x++) {
        if (compoundList[x] == word1 + ' ' + word2 + ' ' + word3) {
            return 3;
        }
    }
    
    for (x = 0; x < compoundList.length; x++) {
        if (compoundList[x] == word1 + ' ' + word2) {
            return 2;
        }
    }
    
    return 1;
}
function checkPronoun(word) {
    for (var x = 0; x < pronounList.length; x++) {
        if (word == pronounList[x])
            return true;
    }
    return false;
}
function filterPrep(givenArray) {
    
    var filteredArray = new Array(0);       
    givenArray.forEach(el => {
        let isAPrep = false;
        for (var x = 0; x < prepositionList.length; x++) {
            if (el == prepositionList[x]) {
                isAPrep = true;
                break;
            }
        }
        if (isAPrep == false) filteredArray.push(el)
    })
    return filteredArray;
}
function getIndex(element, array) {
    let index = undefined;
    for (var i = 0; i < array.length; i++) {
        if (element == array[i]) {
            index = i;
            break;
        }
    }
    return index;
}
function getArrayFromStr(speech) {
    var wordArray = new Array(0);
    var tempSpeech = speech + " ";
    for (var i = 0, lastIndex = 0; i <= tempSpeech.length - 1; i++) {
        if (tempSpeech.charAt(i) == " ") {
            wordArray.push(tempSpeech.slice(lastIndex, i));             
            lastIndex = i + 1;
        }
    }
    return wordArray;
}