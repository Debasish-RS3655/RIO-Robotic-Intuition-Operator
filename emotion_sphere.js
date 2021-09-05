
"use-strict"
const weight1_6_valued = 0.015873;
const weight2_6_valued = 0.031746;
const weight3_6_valued = 0.063492;
const weight4_6_valued = 0.126984;
const weight5_6_valued = 0.253968;
const weight6_6_valued = 0.507936;
const weight1_5_valued = 0.0322580645161290;
const weight2_5_valued = 0.0645161290322580;
const weight3_5_valued = 0.1290322580645161;
const weight4_5_valued = 0.2580645161290322;
const weight5_5_valued = 0.5161290322580645;
const weight1_4_valued = 0.0666666666666667;
const weight2_4_valued = 0.1333333333333333;
const weight3_4_valued = 0.2666666666666667;
const weight4_4_valued = 0.5333333333333333;
const weight1_3_valued = 0.14285714285714285;
const weight2_3_valued = 0.28571428571428571;
const weight3_3_valued = 0.57142857142857142;
const weight1_2_valued = 0.3819610809;
const weight2_2_valued = 0.61803;
const weight1_1_valued = 1;
const shortTermPeriods = 2;             
const repeatStimulusMode = false;       
const likenessStimulusMode = false;     
const guiltSkipConstant = 2;            
const LimitMinPersonalitySim = 0.2;    
const LimitMinLikeness = 0.4;           
const defaultAngerState = 0,
    defaultJoyState = 0,
    defaultSadnessState = 0,
    defaultFearState = 0,
    defaultSurpriseState = 0,
    defaultDisgustState = 0;
let sadnessState = defaultSadnessState,
    joyState = defaultJoyState,
    fearState = defaultFearState,
    disgustState = defaultDisgustState,
    angerState = defaultAngerState,
    surpriseState = defaultSurpriseState
var previousSpeaker;
var sameSpeakerIndex = 1;                   
let backendObjectsReceived = new Array();   
let shortTermObjects = new Array(0);        
let guilt_sitmuli_array = [];               
const normalEmotionalIntensity = 0.6;       
var agentBigFive = {
    openness: 0.3,
    conscientiousness: 0.3,
    extraversion: 0.3,
    agreeableness: 0.3,
    neuroticism: 0.3
}
const testMode = false;                     
const fetch = require('node-fetch');
const verbalNeutralisedCoeff = 1;          
const othersNeutralisedCoeff = 1;          
const sameSpeakerIndexNeutralCoeff = 1;    
const repeatToleranceLim = 20;             
const repeatNeutralisedCoeff = 1;          
const emotionalProcessingLimit = 7 - 2;    
const minimumChange = 0.1;                
let undeterminedStimulus = {
    "label": "undeterminedStimulus_",
    "anger": 0,
    "joy": 0,
    "sadness": 0,
    "fear": 0,
    "disgust": 0,
    "surprise": 0,
    "timesOccurred": 1,                    
    "totalTimesUsed": 1,
    "isProhibited": false,                 
    "openness": 0,
    "conscientiousness": 0,                
    "extraversion": 0,
    "agreeableness": 0,
    "neuroticism": 0,
    "relatedStimuli": {},
    "relatedPeople": {},
    "relatedTasks": {},
    "time": null,
    "indexUnderLabel": 0,
    "type": 'other',
    "likeness": LimitMinLikeness,                       
    "personaltiy": agentBigFive,
    "change": 0,
    "arrayOfChange": []
}
var objectsDetected = new Array(0);         
const iterationDelay = 1000;                
const sleep = ms => new Promise(res => setTimeout(res, ms));
function setEmotions(sadness, joy, fear, disgust, anger, surprise) {
    sadnessState = sadness;
    joyState = joy;
    fearState = fear;
    disgustState = disgust;
    angerState = anger;
    surpriseState = surprise
}
function getEmotions() {
    return {
        sadness: sadnessState,
        joy: joyState,
        fear: fearState,
        disgust: disgustState,
        anger: angerState,
        surprise: surpriseState
    }
}
function getShortTermObjects() {
    let shortTermNames = new Array(0);
    shortTermObjects.forEach(el => {
        shortTermNames.push(el.label)
    })
    return shortTermNames;
}
async function emotion() {
    console.log("Emotion Sphere is running.");
    
    while (true) {
        if (testMode == true) {
            
            await fetch('http://127.0.0.1:4800/database', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({
                    type: 'startingEmotion',
                    data: [sadnessState, joyState, fearState, disgustState, angerState, surpriseState].slice(),
                })
            })
        }
        const currentTime = new Date().getTime();     
        if (backendObjectsReceived.length !== 0) {
            backendObjectsReceived.forEach(backendObj => {
                console.log("Likeness for speaker: ", backendObj.likeness);
                console.log("Personality of speaker: ", backendObj.personality);
                let thisObjects = new Array(0);
                
                backendObj.objects.forEach(el => {
                    let thisObject = el;
                    thisObject['type'] = backendObj.type;
                    thisObject['likeness'] = backendObj.likeness;
                    
                    thisObject['personality'] = Object.assign({}, backendObj.personality);
                    thisObject['change'] = 0;
                    
                    thisObject['arrayOfChange'] = [];
                    thisObjects.push(thisObject);
                })
                console.log("Objects type from backend: ", backendObj.type);
                objectsDetected = objectsDetected.concat(thisObjects);            
                if (backendObj.type == 'verbal') {
                    
                    if (backendObj.speaker == previousSpeaker && backendObj.speaker !== undefined)
                        sameSpeakerIndex++;
                    else {
                        previousSpeaker = backendObj.speaker;
                        sameSpeakerIndex = 1;
                    }
                    
                    if (likenessStimulusMode == true) {
                        if (typeof backendObj.likeness == 'number') {
                            const d = 5;       
                            let likeness_coeff_stimulus = {
                                "label": 'likeness_coeff_stimulus',
                                "anger": angerState * (100 - d * backendObj.likeness) / 100,
                                "joy": joyState * (100 + d * backendObj.likeness) / 100,
                                "sadness": sadnessState * (100 - d * backendObj.likeness) / 100,
                                "fear": fearState * (100 - d * backendObj.likeness) / 100,
                                "disgust": disgustState * (100 - d * backendObj.likeness) / 100,
                                
                                "surprise": surpriseState * (100 - d * backendObj.likeness) / 100,
                                "timesOccurred": sameSpeakerIndex,      
                                "totalTimesUsed": 1,
                                "isProhibited": false,
                                "openness": agentBigFive.openness,
                                "conscientiousness": agentBigFive.conscientiousness,
                                "extraversion": agentBigFive.extraversion,
                                "agreeableness": agentBigFive.agreeableness,
                                "neuroticism": agentBigFive.neuroticism,
                                "time": currentTime,
                                "indexUnderLabel": 0,
                                "type": "other",
                                "likeness": 1,
                                "personality": agentBigFive,
                                "change": 0,
                                "arrayOfChange": []
                            }
                            objectsDetected.push(likeness_coeff_stimulus);
                        }
                        else console.error("Emotion Sphere Error: likeness property of input verbal object is invalid.");
                    }
                }
            })
            backendObjectsReceived.length = 0;
        }
        const objectsLength = objectsDetected.length;
        for (var d = 0; d < objectsLength; d++) {
            
            
            objectsDetected[d].timesOccurred = 1;       
            objectsDetected[d].time = currentTime;
            
            for (var k = 0; k < shortTermObjects.length; k++) {
                if (objectsDetected[d].label == shortTermObjects[k].label && objectsDetected[d].indexUnderLabel == shortTermObjects[d].indexUnderLabel) {
                    shortTermObjects[k].timesOccurred = shortTermObjects[k].timesOccurred + 1;
                    objectsDetected[d].timesOccurred = shortTermObjects[k].timesOccurred;
                }
            }
            
            
            if (objectsDetected[d].timesOccurred >= repeatToleranceLim && repeatStimulusMode == true) {
                
                const m = 4;
                const incrementAmt = objectsDetected[d].timesOccurred + 1 - repeatToleranceLim;
                let repeatedAngerLvl = angerState * (100 + m * incrementAmt) / 100;
                let repeatedJoyLvl = joyState * (100 - m * incrementAmt) / 100;
                let repeatedSadnessLvl = sadnessState * (100 - m * incrementAmt) / 100;
                let repeatedFearLvl = fearState * (100 - m * incrementAmt) / 100;
                let repeatedDisgustLvl = disgustState * (100 + m * incrementAmt) / 100;
                let repeatedSurpriseLvl = surpriseState * (100 - m * incrementAmt) / 100;
                if (repeatedAngerLvl > 1) repeatedAngerLvl = 1;
                if (repeatedJoyLvl < 0) repeatedJoyLvl = 0;
                if (repeatedSadnessLvl < 0) repeatedSadnessLvl = 0;
                if (repeatedFearLvl < 0) repeatedFearLvl = 0;
                if (repeatedDisgustLvl > 1) repeatedDisgustLvl = 1;
                if (repeatedSurpriseLvl < 0) repeatedSurpriseLvl = 0;
                let repeatedObj = {
                    "label": objectsDetected[d].label + "_repeated_",
                    "anger": repeatedAngerLvl,
                    "joy": repeatedJoyLvl,
                    "sadness": repeatedSadnessLvl,
                    "fear": repeatedFearLvl,
                    "disgust": repeatedDisgustLvl,
                    "surprise": repeatedSurpriseLvl,
                    "timesOccurred": 1,
                    "personality": Object.assign({}, objectsDetected[d].personality),
                    "likeness": objectsDetected[d].likeness,
                    "indexUnderLabel": objectsDetected[d].indexUnderLabel,
                    "change": 0,
                    "arrayOfChange": []
                }
                objectsDetected.push(repeatedObj);
                let indexInSTM = getSTMindex(objectsDetected[d].label);
                if (indexInSTM !== null) shortTermObjects[indexInSTM] = Object.assign({}, objectsDetected[d]);
                else console.error(objectsDetected[d], " is present and not present in STM at the same time!");
            }
        }
        
        if (objectsDetected.length < emotionalProcessingLimit) {
            let checkedAll = false;
            let start = 0;
            while (objectsDetected.length < emotionalProcessingLimit && checkedAll == false) {
                for (var i = start; i < shortTermObjects.length; i++) {
                    var present = false;
                    for (var j = 0; j < objectsDetected.length; j++) {
                        if (shortTermObjects[i].label == objectsDetected[j].label && shortTermObjects[i].indexUnderLabel == objectsDetected[j].indexUnderLabel) {
                            present = true;
                            break;
                        }
                    }
                    if (present == false) {
                        
                        
                        shortTermObjects[i].timesOccurred++;
                        objectsDetected.push(Object.assign({}, shortTermObjects[i]));
                        console.log("Object ", shortTermObjects[i].label, " is retrieved from short term memory.");
                        start = i + 1;
                        break;
                    }
                }
                if (i == shortTermObjects.length) checkedAll = true;
            }
        }
        objectsDetected.push(Object.assign({}, undeterminedStimulus));  
        
        for (var i = 0; i < objectsDetected.length;) {
            if (objectsDetected[i].label.includes("_guilt_stimulus_")) {
                let searchString = objectsDetected[i].label + "_guilt_stimulus_";
                var exists = false;
                for (var dh = 0; dh < guilt_sitmuli_array.length; dh++) {
                    if (guilt_sitmuli_array[dh].label == searchString) {
                        exists = true;
                        break;
                    }
                }
                
                if (exists == false) {
                    let guiltStimulusObj = Object.assign({}, objectsDetected[i]);
                    
                    guiltStimulusObj['timesSkipped'] = 0;
                    
                    console.log("Included guilt object ", objectsDetected[i].label, " into the guilt stimulus array.")
                    guilt_sitmuli_array.push(guiltStimulusObj);
                }
                else {
                    console.log("Guilt object ", objectsDetected[i].label, " not included in guilt stimulus array as it already exists.");
                }
                objectsDetected.splice(i, 1);       
            }
            else i++;
        }
        
        const currentIntensity = weightedAverage([sadnessState, joyState, fearState, disgustState, angerState, surpriseState]);
        console.log("current intensity: ", currentIntensity);
        if (currentIntensity <= normalEmotionalIntensity) {
            
            for (var dh = 0; dh < guilt_sitmuli_array.length; dh++) {
                
                let itExists = false;
                let searchString = guilt_sitmuli_array[dh].label.slice(0, guilt_sitmuli_array[dh].label.indexOf("_guilt_stimulus_"));
                console.log("Search guilt string: ", searchString);
                
                if (guilt_sitmuli_array[dh].timesSkipped >= guiltSkipConstant) {
                    
                    for (var kg = 0; kg < shortTermObjects.length; kg++) {
                        if (shortTermObjects[kg].label == searchString || shortTermObjects[kg].label == searchString + '_anticipated_stimulus_') {
                            itExists = true;
                            break;
                        }
                    }
                    if (itExists == false) {
                        for (var jp = 0; jp < objectsDetected.length; jp++) {
                            if (objectsDetected[jp] == searchString || objectsDetected[jp] == searchString + '_anticipated_stimulus_') {
                                itExists = true;
                                break
                            }
                        }
                        
                        if (itExists == false) {
                            console.log("Included guilt object ", guilt_sitmuli_array[dh].label, " into the current stimuli array.");
                            objectsDetected.push(Object.assign({}, guilt_sitmuli_array[dh]));
                            
                            guilt_sitmuli_array.splice(dh, 1);
                            dh--;
                        }
                    }
                }
                else {
                    guilt_sitmuli_array[dh].timesSkipped += 1;
                }
                
            }
        }
        let currentStimuliInfluence = [];                               
        
        for (var i = 0; i < objectsDetected.length; i++) {
            
            if (objectsDetected[i].sadness == undefined || objectsDetected[i].sadness == null || Number.isNaN(objectsDetected[i].sadness)) {
                console.error("Emotion Sphere Error: sadness of ", objectsDetected[i].label, " is invalid: ", objectsDetected[i].sadness)
                objectsDetected[i].sadness = defaultSadnessState;
            }
            if (objectsDetected[i].joy == undefined || objectsDetected[i].joy == null || Number.isNaN(objectsDetected[i].joy)) {
                console.error("Emotion sphere Error: joy of ", objectsDetected[i].label, " is invalid: ", objectsDetected[i].joy);
                objectsDetected[i].joy = defaultJoyState;
            }
            if (objectsDetected[i].fear == undefined || objectsDetected[i].fear == null || Number.isNaN(objectsDetected[i].fear)) {
                console.error("Emotion sphere Error: fear of ", objectsDetected[i].label, " is invalid: ", objectsDetected[i].fear);
                objectsDetected[i].fear = defaultFearState;
            }
            if (objectsDetected[i].disgust == undefined || objectsDetected[i].disgust == null || Number.isNaN(objectsDetected[i].disgust)) {
                console.error("Emotion sphere Error: disgust of ", objectsDetected[i].label, " is invalid: ", objectsDetected[i].disgust);
                objectsDetected[i].fear = defaultDisgustState;
            }
            if (objectsDetected[i].anger == undefined || objectsDetected[i].anger == null || Number.isNaN(objectsDetected[i].anger)) {
                console.error("Emotion sphere Error: anger of ", objectsDetected[i].label, " is invalid: ", objectsDetected[i].anger);
                objectsDetected[i].fear = defaultAngerState;
            }
            if (objectsDetected[i].surprise == undefined || objectsDetected[i].surprise == null || Number.isNaN(objectsDetected[i].surprise)) {
                console.error("Emotion sphere Error: surprise of ", objectsDetected[i].label, " is invalid: ", objectsDetected[i].surprise);
                objectsDetected[i].fear = defaultSurpriseState;
            }
            
            function PersonalityDiffScaledScore(givenObj) {
                
                
                const weightedArray = [weight1_5_valued, weight2_5_valued, weight3_5_valued, weight4_5_valued, weight5_5_valued];
                
                let opennessDiff = Math.abs(agentBigFive.openness - givenObj.openness);
                let conscientiousnessDiff = Math.abs(agentBigFive.conscientiousness - givenObj.conscientiousness);
                let extraversionDiff = Math.abs(agentBigFive.extraversion - givenObj.extraversion);
                let agreeablenessDiff = Math.abs(agentBigFive.agreeableness - givenObj.agreeableness);
                let neuroticismDiff = Math.abs(agentBigFive.neuroticism - givenObj.neuroticism);
                let persDiffArray = [opennessDiff, conscientiousnessDiff, extraversionDiff, agreeablenessDiff, neuroticismDiff];
                let leng = persDiffArray.length;
                
                for (var i = 0; i < leng - 1; i++) {
                    for (var j = i + 1; j < leng; j++) {
                        if (persDiffArray[i] > persDiffArray[j]) {
                            let temp = persDiffArray[i];
                            persDiffArray[i] = persDiffArray[j];
                            persDiffArray[j] = temp;
                        }
                    }
                }
                let weightedAvg = 0;
                for (var i = 0; i < persDiffArray.length; i++) {
                    weightedAvg += persDiffArray[i] * weightedArray[i];
                }
                
                return map(weightedAvg, 0, 1, 1, 0);
            }
            
            
            
            const alpha = (objectsDetected[i].label !== 'undeterminedStimulus_') ?
                PersonalityDiffScaledScore(objectsDetected[i]) * objectsDetected[i].likeness : LimitMinPersonalitySim * LimitMinLikeness;
            
            
            const rho = (objectsDetected[i].label !== 'undeterminedStimulus_') ? objectsDetected[i].timesOccurred : 1;
            let gamma = 2;  
            
            
            
            if (testMode == false && repeatStimulusMode == true && objectsDetected[i].label.includes("_repeated_")) {
                let orgStimIndex = getTriggerIndex(objectsDetected[i].label.replace("_repeated_", ""));
                if (orgStimIndex == null) console.error("Emotion sphere Error: original stimulus does not exist for the repeated stimulus ", objectsDetected[i].label);
                gamma = repeatNeutralisedCoeff;
            }
            
            else if (objectsDetected[i].label == 'personality_coeff_stimulus' || objectsDetected[i].label == 'likeness_coeff_stimulus') {
                gamma = sameSpeakerIndexNeutralCoeff;
            }
            else if (objectsDetected[i].label.includes('_personStim_') || objectsDetected[i].label.includes('pose_stimulus_')) {
                gamma = 1000;
            }
            
            else if (objectsDetected[i].label.includes("_anticipated_stimulus_")) {
                gamma = 2;
            }
            else if (objectsDetected[i].label.includes("_probable_stimulus_")) {
                gamma = objectsDetected[i].gamma;       
            }
            
            else if (objectsDetected[i].hasOwnProperty('type')) {
                if (objectsDetected[i].type == 'verbal')
                    gamma = verbalNeutralisedCoeff;
                else if (objectsDetected[i].type == 'other')
                    gamma = othersNeutralisedCoeff;
                else console.error("Emotion Sphere Error: The type property for ", objectsDetected[i].label, " is invalid.");
            }
            else {
                console.error("Error: emotion sphere main alteration: objectsDetected array is invalid.");
                return;
            }
            
            
            let includesSadness = true,
                includesJoy = true,
                includesFear = true,
                includesDisgust = true,
                includesAnger = true,
                includesSurprise = true;
            if (objectsDetected[i].sadness == 'system_sadness_') {
                includesSadness = false;
                objectsDetected[i].sadness = sadnessState;
            }
            if (objectsDetected[i].joy == 'system_joy_') {
                includesJoy = false;
                objectsDetected[i].joy = joyState;
            }
            if (objectsDetected[i].fear == 'system_fear_') {
                includesFear = false;
                objectsDetected[i].fear = fearState;
            }
            if (objectsDetected[i].disgust == 'system_disgust_') {
                includesDisgust = false;
                objectsDetected[i].disgust = disgustState;
            }
            if (objectsDetected[i].anger == 'system_anger_') {
                includesAnger = false;
                objectsDetected[i].anger = angerState;
            }
            if (objectsDetected[i].surprise == 'system_surprise_') {
                includesSurprise = false;
                objectsDetected[i].surprise = surpriseState;
            }
            
            let sigmaSadness = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(objectsDetected[i].sadness - sadnessState));
            let sigmaJoy = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(objectsDetected[i].joy - joyState));
            let sigmaFear = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(objectsDetected[i].fear - fearState));
            let sigmaDisgust = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(objectsDetected[i].disgust - disgustState));
            let sigmaAnger = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(objectsDetected[i].anger - angerState));
            let sigmaSurprise = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(objectsDetected[i].surprise - surpriseState));
            
            let origSadness = sadnessState;
            let origJoy = joyState;
            let origFear = fearState;
            let origDisgust = disgustState;
            let origAnger = angerState;
            let origSurprise = surpriseState;
            
            
            sadnessState = (objectsDetected[i].sadness >= sadnessState) ? sadnessState + sigmaSadness : sadnessState - sigmaSadness;
            joyState = (objectsDetected[i].joy >= joyState) ? joyState + sigmaJoy : joyState - sigmaJoy;
            fearState = (objectsDetected[i].fear >= fearState) ? fearState + sigmaFear : fearState - sigmaFear;
            disgustState = (objectsDetected[i].disgust >= disgustState) ? disgustState + sigmaDisgust : disgustState - sigmaDisgust;
            angerState = (objectsDetected[i].anger >= angerState) ? angerState + sigmaAnger : angerState - sigmaAnger;
            surpriseState = (objectsDetected[i].surprise >= surpriseState) ? surpriseState + sigmaSurprise : surpriseState - sigmaSurprise;
            
            if (sadnessState > 1) sadnessState = 1;
            if (joyState > 1) joyState = 1;
            if (fearState > 1) fearState = 1;
            if (disgustState > 1) disgustState = 1;
            if (angerState > 1) angerState = 1;
            if (surpriseState > 1) surpriseState = 1;
            
            if (sadnessState < 0) sadnessState = 0;
            if (joyState < 0) joyState = 0;
            if (fearState < 0) fearState = 0;
            if (disgustState < 0) disgustState = 0;
            if (angerState < 0) angerState = 0;
            if (surpriseState < 0) surpriseState = 0;
            
            let sadnessChange = Math.abs(sadnessState - origSadness);
            let joyChange = Math.abs(joyState - origJoy);
            let fearChange = Math.abs(fearState - origFear);
            let disgustChange = Math.abs(disgustState - origDisgust);
            let angerChange = Math.abs(angerState - origAnger);
            let surpriseChange = Math.abs(surpriseState - origSurprise);
            let influenceWeightedArray = [];
            if (includesSadness) influenceWeightedArray.push(sadnessChange);
            if (includesJoy) influenceWeightedArray.push(joyChange);
            if (includesFear) influenceWeightedArray.push(fearChange);
            if (includesDisgust) influenceWeightedArray.push(disgustChange);
            if (includesAnger) influenceWeightedArray.push(angerChange);
            if (includesSurprise) influenceWeightedArray.push(surpriseChange);
            
            const currentInfluence = weightedAverage(influenceWeightedArray);
            console.log("Current influence: ", currentInfluence);
            objectsDetected[i].arrayOfChange.unshift(currentInfluence);
            if (objectsDetected[i].arrayOfChange.length > shortTermPeriods) {
                
                objectsDetected[i].arrayOfChange.pop();
            }
            
            function addAllChanges(givenArray) {
                let sum = 0;
                for (var dh = 0; dh < givenArray.length; dh++) {
                    sum += givenArray[dh];
                }
                return sum;
            }
            
            const sumOfChanges = addAllChanges(objectsDetected[i].arrayOfChange);
            
            const saveInfluence = sumOfChanges / objectsDetected[i].arrayOfChange.length;
            console.log("Influence over the last 2 periods: ", saveInfluence)
            objectsDetected[i].change = saveInfluence;
            if (testMode == true) {
                
                let thisTestObj = {
                    beforeAlteration: [origSadness, origJoy, origFear, origDisgust, origAnger, origSurprise].slice(),
                    afterAlteration: [sadnessState, joyState, fearState, disgustState, angerState, surpriseState].slice(),
                    stimulusName: objectsDetected[i].label,
                    influence: objectsDetected[i].change,
                }
                currentStimuliInfluence.push(thisTestObj);
            }
            
            for (var m = 0; m < shortTermObjects.length; m++) {
                if (shortTermObjects[m].label == objectsDetected[i].label && shortTermObjects[m].indexUnderLabel == objectsDetected[i].indexUnderLabel) {
                    
                    for (var d = 0; d <= 5; d++) {
                        shortTermObjects[m].change = objectsDetected[i].change;
                        shortTermObjects[m].arrayOfChange = objectsDetected[i].arrayOfChange.slice();
                    }
                    descendingSort();
                    break;
                }
            }
            
            if (m == shortTermObjects.length && objectsDetected[i].label !== 'undeterminedStimulus_') {
                if (objectsDetected[i].timesOccurred == 1) {
                    if (shortTermObjects.length < emotionalProcessingLimit) {
                        
                        shortTermObjects.push(Object.assign({}, objectsDetected[i]));
                        console.log("Included object: ", objectsDetected[i].label, " into the short term memory.");
                        descendingSort();
                    }
                    else {
                        
                        for (var d = 0; d < shortTermObjects.length; d++) {
                            if (objectsDetected[i].change >= shortTermObjects[d].change) {
                                shortTermObjects.splice(d, 0, Object.assign({}, objectsDetected[i]));
                                break;
                            }
                        }
                        if (shortTermObjects.length > emotionalProcessingLimit) {
                            console.log("Forgotten object ", shortTermObjects[shortTermObjects.length - 1].label, " from the short term memory due to emotional processing overload.");
                            shortTermObjects.pop();
                        }
                    }
                }
                else {
                    console.error("Currently detected object: ", objectsDetected[i].label, " has invalid times occurred value.");
                }
            }
            function descendingSort() {                     
                
                function swap(arr, firstIndex, secondIndex) {
                    var temp = arr[firstIndex];
                    arr[firstIndex] = arr[secondIndex];
                    arr[secondIndex] = temp;
                }
                var leng = shortTermObjects.length;
                for (var i = 0; i < leng; i++) {
                    for (var j = 0, stop = leng - i; j < stop - 1; j++) {
                        if (shortTermObjects[j].change > shortTermObjects[j + 1].change)
                            swap(shortTermObjects, j, j + 1);
                    }
                }
            }
            
            if (Number.isNaN(sadnessState)) {
                console.error("Emotion sphere error: System sadness becomes invalid at the occurence of ", objectsDetected[i].label);
                sadnessState = defaultSadnessState;
            }
            if (Number.isNaN(joyState)) {
                console.error("Emotion sphere error: System joy becomes invalid at the occurence of ", objectsDetected[i].label);
                joyState = defaultJoyState;
            }
            if (Number.isNaN(fearState)) {
                console.error("Emotion sphere error: System fear becomes invalid at the occurence of ", objectsDetected[i].label);
                fearState = defaultFearState;
            }
            if (Number.isNaN(disgustState)) {
                console.error("Emotion sphere error: System disgust becomes invalid at the occurence of ", objectsDetected[i].label);
                disgustState = defaultDisgustState;
            }
            if (Number.isNaN(angerState)) {
                console.error("Emotion sphere error: System anger becomes invalid at the occurence of ", objectsDetected[i].label);
                angerState = defaultAngerState;
            }
            if (Number.isNaN(surpriseState)) {
                console.error("Emotion sphere error: System surprise becomes invalid at the occurence of ", objectsDetected[i].label);
                surpriseState = defaultSurpriseState;
            }
        }
        
        for (var i = shortTermObjects.length - 1; i >= 0; i--) {
            
            if (shortTermObjects[i].change < minimumChange) {
                console.log("Object :", shortTermObjects[i].label, " has been forgotten from short term memory for its negligible influence.");
                shortTermObjects.pop();
            }
        }
        if (objectsDetected.length !== 0)
            objectsDetected.length = 0;         
        if (testMode == true) {
            
            if (currentStimuliInfluence.length !== 0) {
                await fetch('http://127.0.0.1:4800/database', {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: "POST",
                    body: JSON.stringify({
                        type: 'currentStimuliInfluence',
                        data: currentStimuliInfluence.slice(),
                    })
                })
            }
            if (shortTermObjects.length !== 0) {
                
                let shortTermObjInclination = [];
                for (var i = 0; i < shortTermObjects.length; i++) {
                    shortTermObjInclination.push({
                        stimulusName: shortTermObjects[i].label,
                        influence: shortTermObjects[i].change
                    })
                }
                await fetch('http://127.0.0.1:4800/database', {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: "POST",
                    body: JSON.stringify({
                        type: 'shortTermObjects',
                        data: shortTermObjInclination,
                    })
                })
            }
            
            await fetch('http://127.0.0.1:4800/database', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({
                    type: 'endingEmotion',
                    data: [sadnessState, joyState, fearState, disgustState, angerState, surpriseState].slice(),
                })
            })
        }
        await sleep(iterationDelay);            
    }
    
    
    
    
}
function getTriggerIndex(givenName) {
    var index = null;
    for (var i = 0; i < objectsDetected.length; i++) {
        if (givenName == objectsDetected[i].label) {
            index = i;
            break;
        }
    }
    return index;
}
function getSTMindex(givenName) {
    var index = null;
    for (var i = 0; i < shortTermObjects.length; i++) {
        if (givenName == shortTermObjects[i].label) {
            index = i;
            break;
        }
    }
    return index;
}
function songEmotion(em) {
    const song_const = 0.1;
    switch (em) {
        case "audio_sadness":
            sadnessState = (sadnessState + sadnessState + song_const) / 2;
            break;
        case "audio_joy":
            joyState = (joyState + joyState + song_const) / 2;
            break;
        case "audio_fear":
            fearState = (fearState + fearState + song_const) / 2;
            break;
        case "audio_disgust":
            disgustState = (disgustState + disgustState + song_const) / 2;
            break;
        case "audio_anger":
            angerState = (angerState + angerState + song_const) / 2;
            break;
        case "audio_surprise":
            surpriseState = (surpriseState + surpriseState + song_const) / 2;
            break;
    }
}
function map(x, in_min, in_max, out_min, out_max) {
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
function setPersonalityTraits(givenTraits) {
    agentBigFive = Object.assign({}, givenTraits);
}
function inputFunc(givenObject) {
    backendObjectsReceived.push(givenObject);
}
function timesInSTM(givObj) {
    for (var i = 0; i < shortTermObjects.length; i++) {
        if (givObj.label == shortTermObjects[i].label && givObj.indexUnderLabel == shortTermObjects[i].indexUnderLabel) {
            return shortTermObjects[i].timesOccurred;
        }
    }
    return 0;
}
function weightedAverage(givenArray, type) {
    
    
    let weightedArray = [];
    switch (givenArray.length) {
        case 1: weightedArray = [weight1_1_valued];
            break;
        case 2: weightedArray = [weight1_2_valued, weight2_2_valued];
            break;
        case 3: weightedArray = [weight1_3_valued, weight2_3_valued, weight3_3_valued];
            break;
        case 4: weightedArray = [weight1_4_valued, weight2_4_valued, weight3_4_valued, weight4_4_valued];
            break;
        case 5: weightedArray = [weight1_5_valued, weight2_5_valued, weight3_5_valued, weight4_5_valued, weight5_5_valued];
            break;
        case 6: weightedArray = [weight1_6_valued, weight2_6_valued, weight3_6_valued, weight4_6_valued, weight5_6_valued, weight6_6_valued];
            break;
        default: console.error("Emotion sphere error: givenArray for weight determination is invalid: ", givenArray.length);
    }
    
    let leng = givenArray.length;
    for (var i = 0; i < leng - 1; i++) {
        for (var j = i + 1; j < leng; j++) {
            if (givenArray[i] > givenArray[j]) {
                let temp = givenArray[i];
                givenArray[i] = givenArray[j];
                givenArray[j] = temp;
            }
        }
    }
    let ThisweightedAverage = 0;
    for (var dh = 0; dh < givenArray.length; dh++) {
        ThisweightedAverage += givenArray[dh] * weightedArray[dh];
    }
    
    return ThisweightedAverage;
}
module.exports.setEmotions = setEmotions;
module.exports.getEmotions = getEmotions;
module.exports.getShortTermObjects = getShortTermObjects;
module.exports.emotion = emotion;
module.exports.songEmotion = songEmotion;
module.exports.input = inputFunc;
module.exports.timesInSTM = timesInSTM;
module.exports.setPersonalityTraits = setPersonalityTraits;