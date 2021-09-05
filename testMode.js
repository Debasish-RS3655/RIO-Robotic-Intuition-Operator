
const app = require('express')();
const bodyParser = require('body-parser');
const fs = require('fs');
const fetch = require('node-fetch');
app.use(bodyParser.json());
var responseUnitArray = [];
var responseUnit = {
    startingEmotion: null,          
    endingEmotion: null,            
    shortTermObjects: null,         
    currentStimuliInfluence: null,  
    perceptionChangeObjects: null,  
    decisionObjects: null,          
    prohibitedChosen: null,         
    postureResponse: null,          
    verbalResponse: null            
};
var cycle = 0;
function responseUnitClear() {
    responseUnit.startingEmotion = null;                    
    responseUnit.endingEmotion = null;                      
    responseUnit.shortTermObjects = null;                   
    responseUnit.currentStimuliInfluence = null;            
    responseUnit.perceptionChangeObjects = null;            
    responseUnit.decisionObjects = null;                    
    responseUnit.prohibitedChosen = null;                   
    responseUnit.postureResponse = null;                    
    responseUnit.verbalResponse = null;                     
}
async function cycleControl() {
    
    
    
    const basicEmStimIntroStep = 1;                                 
    let basicEmStimIntroStepDone = false;
    const SecondPersonIntroduceStep_likedSpeaker = 3;               
    let SecondPersonIntroduceStep_likedSpeakerDone = false;
    const FirstPersonIntroduceStep_dislikedSpeaker = 5;             
    let FirstPersonIntroduceStep_dislikedSpeakerDone = false;
    const X1conditionStep_dislikedSpeaker = 10;                     
    let X1conditionStep_dislikedSpeakerDone = false;
    const X2conditionStep_likedSpeaker = 15;                        
    let X2conditionStep_likedSpeakerDone = false;
    const postureResponse_positiveMood = 17;                        
    let postureResponse_positiveMoodDone = false;
    const decisionMakingStep_positiveMood_dislikedSpeaker = 22;     
    let decisionMakingStep_positiveMood_dislikedSpeakerDone = false;
    const decisionMakingStep_positiveMood_likedSpeaker = 25;        
    let decisionMakingStep_positiveMood_likedSpeakerDone = false;
    const Z1conditionStep_dislikedSpeaker = 30;                     
    let Z1conditionStep_dislikedSpeakerDone = false;
    const Z2conditionStep_likedSpeaker = 35;                        
    let Z2conditionStep_likedSpeakerDone = false;
    const postureResponse_neutralMood = 37;                         
    let postureResponse_neutralMoodDone = false;
    const decisionMakingStep_neutralMood_dislikedSpeaker = 37;      
    let decisionMakingStep_neutralMood_dislikedSpeakerDone = false;
    const decisionMakingStep_neutralMood_likedSpeaker = 40;         
    let decisionMakingStep_neutralMood_likedSpeakerDone = false;
    const Y1conditionStep_dislikedSpeaker = 55;                     
    let Y1conditionStep_dislikedSpeakerDone = false;
    const Y2conditionStep_likedSpeaker = 60;                        
    let Y2conditionStep_likedSpeakerDone = false;
    const postureResponse_negativeMood = 62;                        
    let postureResponse_negativeMoodDone = false;
    const decisionMakingStep_negativeMood_dislikedSpeaker = 62;     
    let decisionMakingStep_negativeMood_dislikedSpeakerDone = false;
    const decisionMakingStep_negativeMood_likedSpeaker = 65;        
    let decisionMakingStep_negativeMood_likedSpeakerDone = false;
    
    const endStep = 75;                                             
    const sleep = ms => new Promise(req => setTimeout(req, ms));
    const iterationDelay = 500;
    console.log("Testing started.");
    while (true) {
        
        if (cycle == basicEmStimIntroStep && basicEmStimIntroStepDone == false) {
            basicEmStimIntroStepDone = true;
            fetch('http://127.0.0.1:5000/test_basicEmotionStimulus', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                
                
                body: JSON.stringify({
                    sadness: {
                        "label": "sadness__",
                        "anger": 1,
                        "joy": 0,
                        "sadness": 1,
                        "fear": 1,
                        "disgust": 1,
                        "surprise": 0,
                        "timesOccurred": 1,
                        "totalTimesUsed": 1,
                        "isProhibited": false,
                        "openness": 0.5,
                        "conscientiousness": 0.5,
                        "extraversion": 0.5,
                        "agreeableness": 0.5,
                        "neuroticism": 0.5,
                        "relatedTasks": {},
                        "relatedStimuli": {},
                        "relatedPeople": {},
                        "time": 1598462682053,
                        "indexUnderLabel": 0
                    },
                    joy: {
                        "label": "joy__",
                        "anger": 0,
                        "joy": 1.0,
                        "sadness": 0,
                        "fear": 0,
                        "disgust": 0,
                        "surprise": 1.0,
                        "timesOccurred": 1,
                        "totalTimesUsed": 1,
                        "isProhibited": false,
                        "openness": 0.5,
                        "conscientiousness": 0.5,
                        "extraversion": 0.5,
                        "agreeableness": 0.5,
                        "neuroticism": 0.5,
                        "relatedTasks": {},
                        "relatedStimuli": {},
                        "relatedPeople": {},
                        "time": 1598462682053,
                        "indexUnderLabel": 0
                    },
                    fear: {
                        "label": "fear__",
                        "anger": 1,
                        "joy": 0,
                        "sadness": 1,
                        "fear": 1,
                        "disgust": 1,
                        "surprise": 0,
                        "timesOccurred": 1,
                        "totalTimesUsed": 1,
                        "isProhibited": false,
                        "openness": 0.5,
                        "conscientiousness": 0.5,
                        "extraversion": 0.5,
                        "agreeableness": 0.5,
                        "neuroticism": 0.5,
                        "relatedTasks": {},
                        "relatedStimuli": {},
                        "relatedPeople": {},
                        "time": 1598462682053,
                        "indexUnderLabel": 0
                    },
                    disgust: {
                        "label": "disgust__",
                        "anger": 1,
                        "joy": 0,
                        "sadness": 1,
                        "fear": 1,
                        "disgust": 1,
                        "surprise": 0,
                        "timesOccurred": 1,
                        "totalTimesUsed": 1,
                        "isProhibited": false,
                        "openness": 0.5,
                        "conscientiousness": 0.5,
                        "extraversion": 0.5,
                        "agreeableness": 0.5,
                        "neuroticism": 0.5,
                        "relatedTasks": {},
                        "relatedStimuli": {},
                        "relatedPeople": {},
                        "time": 1598462682053,
                        "indexUnderLabel": 0
                    },
                    anger: {
                        "label": "anger__",
                        "anger": 1,
                        "joy": 0,
                        "sadness": 1,
                        "fear": 1,
                        "disgust": 1,
                        "surprise": 0,
                        "timesOccurred": 1,
                        "totalTimesUsed": 1,
                        "isProhibited": false,
                        "openness": 0.5,
                        "conscientiousness": 0.5,
                        "extraversion": 0.5,
                        "agreeableness": 0.5,
                        "neuroticism": 0.5,
                        "relatedTasks": {},
                        "relatedStimuli": {},
                        "relatedPeople": {},
                        "time": 1598462682053,
                        "indexUnderLabel": 0
                    },
                    surprise: {
                        "label": "surprise__",
                        "anger": 0,
                        "joy": 1.0,
                        "sadness": 0,
                        "fear": 0.0,
                        "disgust": 0,
                        "surprise": 1.0,
                        "timesOccurred": 1,
                        "totalTimesUsed": 1,
                        "isProhibited": false,
                        "openness": 0.5,
                        "conscientiousness": 0.5,
                        "extraversion": 0.5,
                        "agreeableness": 0.5,
                        "neuroticism": 0.5,
                        "relatedTasks": {},
                        "relatedStimuli": {},
                        "relatedPeople": {},
                        "time": 1598462682053,
                        "indexUnderLabel": 0
                    }
                })
            })
            console.log("Conditioned to the test basic emotion stimuli.");
        }
        
        if (cycle == FirstPersonIntroduceStep_dislikedSpeaker && FirstPersonIntroduceStep_dislikedSpeakerDone == false) {
            FirstPersonIntroduceStep_dislikedSpeakerDone = true;
            const personObj = require('./testMode/speaker.json').speaker1;
            fetch('http://127.0.0.1:5000/test_introduceSpeaker', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    person: personObj
                })
            })
        }
        
        if (cycle == SecondPersonIntroduceStep_likedSpeaker && SecondPersonIntroduceStep_likedSpeakerDone == false) {
            SecondPersonIntroduceStep_likedSpeakerDone = true;
            
            const personObj = require('./testMode/speaker.json').speaker2;
            fetch('http://127.0.0.1:5000/test_introduceSpeaker', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    person: personObj
                })
            })
        }
        
        
        if (cycle == X1conditionStep_dislikedSpeaker && X1conditionStep_dislikedSpeakerDone == false) {
            X1conditionStep_dislikedSpeakerDone = true;
            
            const personName = 'speaker1';
            const emotions = [0.1, 1.0, 0.1, 0.1, 0.1, 1.0];
            const label = "x1";
            const isProhibited = true;
            conditionStimulus(label, emotions, personName, isProhibited);
            console.log("disliked speaker conditioning done for: ", label);
        }
        
        if (cycle == X2conditionStep_likedSpeaker && X2conditionStep_likedSpeakerDone == false) {
            X2conditionStep_likedSpeakerDone = true;
            
            const personName = 'speaker2';
            const emotions = [0.1, 1.0, 0.1, 0.1, 0.1, 1.0];
            const label = "x2";
            const isProhibited = true;
            conditionStimulus(label, emotions, personName, isProhibited);
            console.log("disliked speaker conditioning for: ", label);
        }
        
        if (cycle == postureResponse_positiveMood && postureResponse_positiveMoodDone == false) {
            postureResponse_positiveMoodDone = true;
            console.log("Posture positive mood request is being sent.");
            await fetch('http://127.0.0.1:5000/test_postureResponse', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({ postureResponse: true })
            })
        }
        
        if (cycle == decisionMakingStep_positiveMood_dislikedSpeaker && decisionMakingStep_positiveMood_dislikedSpeakerDone == false) {
            decisionMakingStep_positiveMood_dislikedSpeakerDone = true;
            console.log("Deciding for the disliked speaker in the positive mood.");
            await fetch('http://127.0.0.1:5000/test_decisionMaking', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({ options: ['x1'], speaker: 'speaker1' })
            })
                .then(d => d.json())
                .then(data => {
                    console.log("decision made: ", data);
                    
                    responseUnit.decisionObjects = Object.assign({}, data);
                })
        }
        
        if (cycle == decisionMakingStep_positiveMood_likedSpeaker && decisionMakingStep_positiveMood_likedSpeakerDone == false) {
            decisionMakingStep_positiveMood_likedSpeakerDone = true;
            console.log("Deciding for the liked speaker in the positive mood.");
            await fetch('http://127.0.0.1:5000/test_decisionMaking', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({ options: ['x2'], speaker: 'speaker2' })
            })
                .then(d => d.json())
                .then(data => {
                    console.log("decision made: ", data);
                    
                    responseUnit.decisionObjects = Object.assign({}, data);
                })
        }
        
        if (cycle == Z1conditionStep_dislikedSpeaker && Z1conditionStep_dislikedSpeakerDone == false) {
            Z1conditionStep_dislikedSpeakerDone = true;
            const personName = 'speaker1';
            
            const emotions = [0.4, 0.4, 0.4, 0.4, 0.4, 0.4];
            const label = "z1";
            const isProhibited = false;
            conditionStimulus(label, emotions, personName, isProhibited);
            console.log("Disliked speaker neutral stimulus conditioning done for: ", label);
        }
        
        if (cycle == Z2conditionStep_likedSpeaker && Z2conditionStep_likedSpeakerDone == false) {
            Z2conditionStep_likedSpeakerDone = true;
            const personName = 'speaker2';
            
            const emotions = [0.4, 0.4, 0.4, 0.4, 0.4, 0.4];
            const label = "z2";
            const isProhibited = false;
            conditionStimulus(label, emotions, personName, isProhibited);
            console.log("Liked speaker neutral stimulus conditioning done for: ", label);
        }
        
        if (cycle == postureResponse_neutralMood && postureResponse_neutralMoodDone == false) {
            postureResponse_neutralMoodDone = true;
            console.log("Neutral mood posture request is being sent.");
            await fetch('http://127.0.0.1:5000/test_postureResponse', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({ postureResponse: true })
            })
        }
        if (cycle == decisionMakingStep_neutralMood_dislikedSpeaker && decisionMakingStep_neutralMood_dislikedSpeakerDone == false) {
            decisionMakingStep_neutralMood_dislikedSpeakerDone = true;
            console.log("Neutral mood decision making for disliked speaker");
            await fetch('http://127.0.0.1:5000/test_decisionMaking', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({ options: ['x1', 'z1'], speaker: 'speaker1' })
            })
                .then(d => d.json())
                .then(data => {
                    console.log("decision made: ", data);
                    
                    responseUnit.decisionObjects = Object.assign({}, data);
                })
        }
        
        if (cycle == decisionMakingStep_neutralMood_likedSpeaker && decisionMakingStep_neutralMood_likedSpeakerDone == false) {
            decisionMakingStep_neutralMood_likedSpeakerDone = true;
            console.log("Neutral mood decision making for the liked speaker");
            await fetch('http://127.0.0.1:5000/test_decisionMaking', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({ options: ['x2', 'z2'], speaker: 'speaker2' })
            })
                .then(d => d.json())
                .then(data => {
                    console.log("decision made: ", data);
                    
                    responseUnit.decisionObjects = Object.assign({}, data);
                })
        }
        
        if (cycle == Y1conditionStep_dislikedSpeaker && Y1conditionStep_dislikedSpeakerDone == false) {
            Y1conditionStep_dislikedSpeakerDone = true;
            const personName = 'speaker1';
            
            const emotions = [1.0, 0.0, 1.0, 1.0, 1.0, 0.0];
            const label = "y1";
            const isProhibited = false;
            conditionStimulus(label, emotions, personName, isProhibited);
            console.log("Disliked speaker negative stimulus conditioning done for: ", label);
        }
        if (cycle == Y2conditionStep_likedSpeaker && Y2conditionStep_likedSpeakerDone == false) {
            Y2conditionStep_likedSpeakerDone = true;
            const personName = 'speaker2';
            
            const emotions = [1.0, 0.0, 1.0, 1.0, 1.0, 0.0];
            const label = "y2";
            const isProhibited = false;
            conditionStimulus(label, emotions, personName, isProhibited);
            console.log("Liked speaker negative stimulus conditioning done for: ", label);
        }
        if (cycle == postureResponse_negativeMood && postureResponse_negativeMoodDone == false) {
            postureResponse_negativeMoodDone = true;
            console.log("Negative mood posture request is being sent.");
            await fetch('http://127.0.0.1:5000/test_postureResponse', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({ postureResponse: true })
            })
        }
        if (cycle == decisionMakingStep_negativeMood_dislikedSpeaker && decisionMakingStep_negativeMood_dislikedSpeakerDone == false) {
            decisionMakingStep_negativeMood_dislikedSpeakerDone = true;
            console.log("Negative mood decision making for the disliked speaker");
            await fetch('http://127.0.0.1:5000/test_decisionMaking', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({ options: ['x1', 'y1', 'z1'], speaker: 'speaker1' })
            })
                .then(d => d.json())
                .then(data => {
                    console.log("decision made: ", data);
                    
                    responseUnit.decisionObjects = Object.assign({}, data);
                })
        }
        if (cycle == decisionMakingStep_negativeMood_likedSpeaker && decisionMakingStep_negativeMood_likedSpeakerDone == false) {
            decisionMakingStep_negativeMood_likedSpeakerDone = true;
            console.log("Negative mood decision making for the liked speaker");
            await fetch('http://127.0.0.1:5000/test_decisionMaking', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({ options: ['x2', 'y2', 'z2'], speaker: 'speaker2' })
            })
                .then(d => d.json())
                .then(data => {
                    console.log("decision made: ", data);
                    
                    responseUnit.decisionObjects = Object.assign({}, data);
                })
        }
        
        if (cycle == endStep) {
            break;
        }
        await sleep(iterationDelay);        
    }
    console.log("Testing ended. Cycles completed: ", cycle);
    console.log("Exiting RIO.");
    await fetch('http://127.0.0.1:5000/output', {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({
            recognisedSpeech: {
                data: "Elsa you can shut down" 
            }
        })
    })
    fs.writeFile('./testMode/output.json', JSON.stringify(responseUnitArray, null, 2), function (err) {
        if (err) console.error("Error in writing output file: ", err);
        else console.log("Saved output file.");
    })
    
    function conditionStimulus(label, emotions, personName, isProhibited) {
        fetch('http://127.0.0.1:5000/test_conditionStimulus', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({
                label: label,
                emotions: emotions,
                person: personName,
                isProhibited: isProhibited
            })
        })
    }
}
cycleControl();
app.post('/database', function (req, res) {
    switch (req.body.type) {
        case 'endingEmotion': responseUnit['endingEmotion'] = req.body.data.slice();
            cycle++;
            responseUnitArray.push(Object.assign({}, responseUnit));
            console.log("ending emotion received: ", req.body.data);
            console.log("new cycle: ", cycle);
            
            responseUnitClear();
            break;
        case 'startingEmotion': responseUnit['startingEmotion'] = req.body.data.slice();
            console.log("starting emotion received: ", req.body.data);
            break;
        
        
        case 'shortTermObjects': responseUnit['shortTermObjects'] = req.body.data.slice();
            
            
            console.log("short term objects received: ", req.body.data)
            break;
        case 'currentStimuliInfluence': responseUnit['currentStimuliInfluence'] = req.body.data.slice();
            
            
            
            
            console.log("current stimuli influence received: ", req.body.data)
            break;
        case 'perceptionChangeObjects': responseUnit['perceptionChangeObjects'] = req.body.data.slice();
            
            
            
            
            console.log("perception change objects received: ", req.body.data)
            break;
        case 'prohibitedChosen': responseUnit['prohibitedChosen'] = req.body.data;                         
            console.log("prohibited objects received: ", req.body.data)
            break;
        case 'postureResponse': responseUnit['postureResponse'] = Object.assign({}, req.body.data)   
            
            
            
            console.log("posture response received: ", req.body.data)
            break;
        case 'verbalResponse': responseUnit['verbalResponse'] = req.body.data;      
            
            console.log("verbal response received: ", req.body.data)
            break;
    }
    res.json({ received: true });
})
app.listen(4800, console.log("Database server listening at port 4800"))
