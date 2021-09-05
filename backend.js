
/*
   Robotic Intuition Operator Core
   Stimulus-object based hybrid approach to emotional modeling
   APIs used: IBM WATSON Personality Insights, Natural Language Understanding, Watson Assistant
   Serial port communication app preferred: AMR voice
   Debashish Buragohain
*/
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
var prohibitControlStatements = {
    verbalCan: [
        "you can speak ",
        "you can say ",
        "you are allowed to say ",
        "you can tell ",
        "you are allowed to tell ",
        "you are allowed to speak "
    ],
    verbalCant: [
        'you should not speak like that',
        "don't speak that way",
        "don't speak like that",
        "never say that again",
        "don't say that"
    ],
    optionCan: [
        'you can choose ',
        'you can go for ',
        'you are allowed to choose ',
        "you are allowed to prefer "
    ],
    optionDont: [
        'you should not choose that',
        "you should not go for that",
        "don't choose that",
        "never choose that",
        "never go for that",
        "don't go for that"
    ]
}
var extraDisplayControl = [];
const abstentionConstant = 1.0;
const choiceThreshold = 0.3;
const inclinationWeight = 0.40;
const repulsionWeight = 0.40;
const personalitySimilarityWeight = 0.20;
const currentAntiInclinationWeight = 0.60;
const currentRepulsionWeight = 0.60;
const guiltInfluenceWeight = 0.40;
const adminMode = false;
let cycle = 0;
const forgetTime = 100000;
const testMode = false;
var perceptionChangeObjects = [];
var emotionAltered = false;
const relatedPropLimit = 8;
const relatedStimulusThreshold = 5;
var probableObjects = [];
var lastChosenOption;
var lastVerbalResponse;
var lastSaveTime;
const saveTime = 30;
var exitingCode = false;
const terminate_Word = 'you can shut down';
const agentName = 'Elsa';
const agentGender = 'female';
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const gender = require('gender-detection');
const decisionSpeechExtractor = require('./decisionSpeech/decisionSpeech.js');
const personalityAnalysis = require('./backend_modules/personality_analysis.js');
const credentials = require('./credentials/config.js');
const PersonalityInsightsV3 = require('ibm-watson/personality-insights/v3');
const PersonalityTextSummaries = require('personality-text-summary');
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1.js');
const AssistantV1 = require('ibm-watson/assistant/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const MidiWriter = require('midi-writer-js');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const child_process = require('child_process');
const emotion_sphere = require('./emotion_sphere.js');
const thesaurus = require('thesaurus');
const assistModules = 1;
const nluModules = 1;
const personalityModules = 1;
var player = require('node-wav-player');
var musicOptions = {
    path: "./sounds/startNotification.wav",
}
var express = require('express');
var backend_app = express();
var bodyParser = require('body-parser');
backend_app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', false);
    next();
});
backend_app.use(bodyParser.json({ limit: '50MB' }));
backend_app.use(function (err, req, res, next) {
    console.error("Backend Error: Error in backend main server: ", err.stack)
    res.status(500).send('Something broke in the backend server RIO!')
    next();
});
var v3EnglishTextSummaries;
var personalityInsights;
var naturalLanguageUnderstanding;
var Assistant;
var prevPers;
var prevNLU;
var prevAssis;
var changedPIcredentials;
var assistant_intents = new Array(0);
var msg = "";
var msgInLowercase = "";
var systemCommand = false;
const min_words_PI = 101;
const min_words_NLU = 5;
const last_PA_position = 150;
const gap = 62.5;
const communicationDelay = 500;
var detectedObjects = new Array(0);
var speakerSavedClass = new Array(0);
var allSaveModules = new Array(6);
allSaveModules.fill(false);
var poseResponseData = new Array(0);
var verbalResponse = new Array(0);
var ifConnected = false;
var firstTimeNetLost = true;
var servoDegrees = new Array(0);
var headDegrees = {
    x: null,
    y: null
};
var customVisualClass = new Array(0);
const visualMax = 0.8;
var audioEmotionArray = new Array(5);
audioEmotionArray.fill(null);
var speakerIdArray = new Array(5);
speakerIdArray.fill(null);
var songIdArray = new Array(5);
songIdArray.fill(null);
var audioMaxEmotion;
var SpecialAbility;
var currentSongDetails = {
    songEmotion: "",
    agentMaxEmotion: "",
    agentEmotionScores: []
}
var sing_song = false;
var alreadyLearntSong = true;
var singOriginalSong = true;
var song_name = null;
var singingForFirstTime = true;
var songNameAskedForFirstTime = true;
const extremeEmotionThreshold = 0.8;
const relatedAbstractsLength = 6;
const defaultLikeness = 0.4;
let trackingFace = false;
let ignoringFace = false;
let trackingStartTime = 0;
let trackingStopTime;
const trackingDuration = 10000;
const trackWaitDuration = 5000;
const toneEmotionThresholdTime = 10000;
var ifIdle = true;
var lastVerbalSpeechTime;
const maxTaskWait = 30000;
var idleStartTime;
const maxVerbalResTime = 5000;
var songSavedClass = new Array(0);
let longTermJSON;
let peopleJSON;
var rememberedTasks = new Array(0);
var currentTasks = new Array(0);
var rememberedSongs = new Array(0);
var personsPresent = new Array(0);
var personsName = new Array(0);
var shortTermMemoryObj = new Array(0);
var currentSpeaker = undefined;
var currentPerson = undefined;
var current_index = undefined;
const defaultEmotionScore = 0;
var rio_sadness = defaultEmotionScore
var rio_joy = defaultEmotionScore;
var rio_fear = defaultEmotionScore;
var rio_disgust = defaultEmotionScore;
var rio_anger = defaultEmotionScore;
var rio_surprise = defaultEmotionScore;
var objects = new Array(0);
var otherObjects = new Array(0);
var hisVariable = {
    name: null,
    lastTime: 0
}
var herVariable = {
    name: null,
    lastTime: 0
}
var entitiesInText = new Array(0);
var leftDistance;
var rightDistance;
const answerThreshold = 0.3;
const similarityThreshold = 0.6;
var visualDetectKnownPersons = new Array(0);
var visualDetectPersons = new Array(0);
var visual_age = new Array(0);
var visual_gender = new Array(0);
var visual_emotion = new Array(0);
const minLikenessForChoice = 0.15;
var extremeEmotion = false;
const defaultSurprise = defaultEmotionScore;
var rio_max_emotion = 'neutral';
var rio_max_emotion_score = defaultEmotionScore;
var rio_speech_pitch = 1;
var rio_speech_speed = 0.9;
var responseText = "";
var agentSpeech;
var agentPersonality = {};
var agentPersonalityNames = new Array(0);
var agentBigFive = {};
let startingEmotion = new Array(0);
let startingPose = new Array(0);
let startingTime = 0;
let startingPersonIndex = null;
let lastPoseStartTime = 0;
let lastPoseMappedTime = 0;
const iterationDelay = 1000;
const exitDelay = 3000;
var WatsonAssistant_credentials;
let lastSaveNotificationTime = 0;
const saveNotificationInterval = 5000;
var lastPoseLearnEmotion = [];
const poseLearnEmDiff = 0.2;
var lastVisualLearnEmotion = [];
const visualLearnEmDiff = 0.2;
console.log("Initialising Robotic Intuition Operator.");
console.log("Loading and initialising RIO files");
console.log("Checking COM port...\nChecking internet connectivity...");
const jsonOptions = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};
var restoreData = {

    altPoseRestore: {
        dataset: null
    },
    verbal_restore: {
        dataset: null
    },
    pose_restore: {
        dataset: null
    },
    audio_restore: {
        dataset: null
    },
    song_restore: {
        dataset: null
    },
    speaker_restore: {
        dataset: null
    },
    visual_restore: {
        dataset: null
    }
}
var frontendIncoming = {
    audio_incoming: {
        text: null,
        val: null,
        json: null
    },
    song_incoming: {
        text: null,
        val: null,
        json: null
    },
    speaker_incoming: {
        text: null,
        val: null,
        json: null
    },
    visual_incoming: {
        text: null,
        val: null,
        json: null
    },
    verbal_incoming: {
        text: null,
        val: null,
        json: []
    },
    pose_incoming: {
        text: null,
        val: null,
        json: []
    },

    frontend_data: {
        speech: null,
        emotion: null,
        emotionScore: null,
        rate: null,
        pitch: null,
        singingState: null
    },

    song_incomingJS: {
        text: null,
        val: null,
        json: null
    },
}
var predictVerbalAns = false;
var verbalAnalysisText = "";
const objLength = 8;
const wordLength = 10;
restorations();
setCredentials();
function restorations() {
    function initialiseMemoryVariables() {
        longTermJSON = JSON.parse(fs.readFileSync('./emotionalObjects/longTerm/longTermModel.json'));
        peopleJSON = JSON.parse(fs.readFileSync('./emotionalObjects/peopleData/peopleDataModel.json'));
    }
    initialiseMemoryVariables();

    var verbalClassSaved = {};
    var poseClassSaved = {};
    var verbalResponseSaved = [];
    var poseResponseSaved = [];
    if (testMode == true) {
        verbalClassSaved = require('./testMode/inputs/verbalClassSaved.json');
        verbalResponseSaved = require('./testMode/inputs/verbalResponseSaved.json');
        poseClassSaved = require('./testMode/inputs/poseClassSaved.json')
        poseResponseSaved = require('./testMode/inputs/poseResponseSaved.json');
        agentBigFive = require('./testMode/inputs/agentBigFive.json');
        agentSpeech = "";
        restoreData.altPoseRestore.dataset = require('./testMode/inputs/altPoseResponse.json');
        console.log("Initialised with test mode data.");
    }
    else {
        verbalClassSaved = JSON.parse(retrieveSavedData('verbalClassSaved.json'));
        poseClassSaved = JSON.parse(retrieveSavedData('poseClassSaved.json'));
        verbalResponseSaved = JSON.parse(retrieveSavedData('verbalResponseSaved.json'));
        poseResponseSaved = JSON.parse(retrieveSavedData('poseResponseSaved.json'));
        agentBigFive = JSON.parse(retrieveSavedData('agentBigFive.json'));
        agentSpeech = retrieveSavedData('agentSpeech.txt');
        restoreData.altPoseRestore.dataset = require('./emotionalObjects/learnt_modules/altPoseResponse.json');
        console.log("Initialised with general purpose data");
    }

    var tempPersonality = JSON.parse(retrieveSavedData('agentPersonality.json'));
    var tempPersonalityNames = JSON.parse(retrieveSavedData('agentPersonalityNames.json'));

    if (Object.keys(tempPersonality).length === 0 && tempPersonality.constructor === Object) {
        console.warn('Previous agent personality data not found. Created a new Personality data.')
    }
    else {
        agentPersonality = tempPersonality;
        console.log('Agent Personality restored from directory.')
    }

    if (tempPersonalityNames.length === 0) {
        console.warn('Not found previous agent personality trait names. Created a new one.');
    }
    else {
        agentPersonalityNames = tempPersonalityNames;
        console.log('Agent Personality Trait names restored.');
    }

    if (Object.keys(verbalClassSaved).length === 0 && verbalClassSaved.constructor === Object) {
        console.log('Previous verbal classifier not found. Created new.')
    }
    else {
        restoreData.verbal_restore.dataset = verbalClassSaved;
        verbalResponse = verbalResponseSaved;
        console.log("Verbal classifier restored from directory.");
    }

    if (Object.keys(poseClassSaved).length === 0 && poseClassSaved.constructor === Object) {
        console.log('Previous pose classifier not found. Created a new classifier.')
    }
    else {
        restoreData.pose_restore.dataset = poseClassSaved;
        poseResponseData = poseResponseSaved;
        console.log("Pose classifier restored from directory.");
    }

    let visualSaved = JSON.parse(retrieveSavedData('visualSave.json'));
    let restoredCustomClass = JSON.parse(retrieveSavedData('customVisualClass.json'));
    if (Object.keys(visualSaved).length === 0 && visualSaved.constructor === Object && restoredCustomClass.length == 0) {
        console.warn('Visual custom classifier not found. Created new.');
    }
    else {
        restoreData.visual_restore.dataset = visualSaved;
        customVisualClass = restoredCustomClass;
        console.log("Visual custom classifier restored from directory.");
    }

    var audioSaved = fs.readFileSync('./emotionalObjects/learnt_modules/audioSave.txt', { encoding: 'base64' });
    if (audioSaved.length == 0) {
        console.warn('Audio emotion classifier not found. Created new.');
    }
    else {
        restoreData.audio_restore.dataset = audioSaved;
        console.log("Audio emotion classifier restored from directory.");
    }

    var songSaved = fs.readFileSync('./emotionalObjects/learnt_modules/songSave.txt', { encoding: 'base64' });
    let restoredSongSaveClass = JSON.parse(retrieveSavedData('songSavedLabels.json'));
    if (songSaved.length == 0 || restoredSongSaveClass.length == 0) {
        console.warn('Song identification classifier not found. Created new.');
    }
    else {
        restoreData.song_restore.dataset = songSaved;
        songSavedClass = restoredSongSaveClass;
        console.log("Long Term songs restored from directory.");
        console.log("Song identification classifier restored from directory.")
    }

    var speakerSaved = fs.readFileSync('./emotionalObjects/learnt_modules/speakerSave.txt', { encoding: 'base64' });
    let restoredSpeakerClass = JSON.parse(retrieveSavedData('speakerSavedLabels.json'));
    if (speakerSaved.length == 0 || restoredSpeakerClass.length == 0) {
        console.warn('Speaker identification classifier not found. Created new.');
    }
    else {
        restoreData.speaker_restore.dataset = speakerSaved;
        speakerSavedClass = restoredSpeakerClass;
        console.log("Speaker identification classifier restored from directory.");
    }

    backend_app.post('/restore', function (req, res) {
        res.json(restoreData);
    });
}
backend_app.listen(5000, () => console.log('backend server running on http://127.0.0.1:5000'))
child_process.exec('nginx.bat', function (err, stdout, stderr) {
    if (err)
        console.error('Error: \nError in starting nginx reverse proxy server: ', err);
})
const Serial = new SerialPort("COM7", { baudRate: 9600 }, function (err) {
    if (err) {
        console.log('The body of the agent is not connected: ', err)
        return null;
    }
});
if (Serial !== null) {
    const parser = new Readline();
    Serial.pipe(parser);
    parser.on('data', function (req) {
        if (typeof (req) != 'string')
            req = req.toString();
        if (req.includes("bluetoothData::")) {

            var initialPos = req.indexOf('*') + 1;
            var terminalPos = req.indexOf('#');
            req = req.slice(initialPos, terminalPos);
            console.log('heard over bluetooth: ' + req);

            msg = req;
        }

        if (req.includes('dist:')) {
            leftDistance = parseInt(req.slice(req.indexOf(':') + 1, req.indexOf('_')))
            rightDistance = parseInt(req.slice(req.indexOf('_') + 1))
        }
    });
    parser.on('error', err => console.log('Error in Serial port: ', err))
}
player.play(musicOptions);
console.log('Please wait while agentic intuition operator is being loaded..');
const sleep = ms => new Promise(res => setTimeout(res, ms));
let displayedOnce = false;
backend_app.post('/initialisation', function (req, res) {
    if (req.body.module == 'frontend') {
        let repliedAlready = false;

        for (var x = 0; x < pythonModules.length; x++) {
            if (pythonModules[x] == null) {
                repliedAlready = true;
                res.json({ start: false })
                break;
            }
        }

        if (repliedAlready == false && displayedOnce == false) {
            setTimeout(() => {

                console.log('All modules have been loaded successfully. Press the start button to continue.');

                backend_app.post('/startTheBackend', function (req, res) {
                    startMain();
                    res.json({ start: true });
                })
                displayedOnce = true;
            }, clearDelay);

            res.json({ start: true });
        }
    }
})
async function startMain() {
    player.play(musicOptions);
    console.log(`RIO is online.
    \n\nDebashish Buragohain project RIO
    \nRobotic Intuition Operation (RIO) has started being executed.
    \nMake sure internet connectivity is continuously available.
    \nName of agent: ${agentName}
    \nAll senses and terminals are functioning and taking input...
    \n__________________________________________________________________\n\n`);

    emotion_sphere.setPersonalityTraits(agentBigFive);
    emotion_sphere.emotion();

    forgetUninfluentialStimuli();

    while (true) {
        try {
            main();
        }
        catch (err) {
            console.error("Error in main function: ", err.message)
        }
        if (testMode == true) {
            console.log("new cycle: ", ++cycle);
            console.log("System emotions: ", [rio_sadness, rio_joy, rio_disgust, rio_anger, rio_surprise]);
        }
        if (testMode == true && perceptionChangeObjects.length !== 0) {

            await fetch('http://127.0.0.1:4800/database', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({
                    type: 'perceptionChangeObjects',
                    data: perceptionChangeObjects.slice(),
                })
            })
            perceptionChangeObjects.length = 0;
        }
        await sleep(iterationDelay);
    }
}
backend_app.post('/output', function (req, res) {


    if (req.body.recognisedSpeech !== null && req.body.recognisedSpeech !== undefined)
        if (req.body.recognisedSpeech.data !== null && req.body.recognisedSpeech.data !== undefined) {

            if (req.body.recognisedSpeech.data.charAt(0) == " ")
                msg = req.body.recognisedSpeech.data.slice(1);
            else
                msg = req.body.recognisedSpeech.data;
            console.log("Heard from frontend: ", msg);
        }

    if (req.body.poseDetect !== null && req.body.poseDetect !== undefined)
        if (req.body.poseDetect.data !== null && req.body.poseDetect.data !== undefined) {

            headDegrees = req.body.poseDetect.faceTracker.data;
            if (req.body.poseDetect.data.length !== 0) {

                function checkValidity(arr) {
                    for (var i = 0; i < arr.length; i++) {
                        if (arr[i] < 0 || arr[i] > 180) {
                            console.error("Backend Error: Invalid Servo degrees: ", arr.join(" "))
                            return false;
                        }
                    }
                    return true;
                }
                if (checkValidity(req.body.poseDetect.data) == true) {
                    servoDegrees = req.body.poseDetect.data;
                    console.log("Servo degrees: ", servoDegrees);
                }
            }
        }

    if (req.body.objectDetect !== null && req.body.objectDetect !== undefined)
        if (req.body.objectDetect.data !== null && req.body.objectDetect.data !== undefined)
            if (req.body.objectDetect.data.length !== 0) {

                detectedObjects = req.body.objectDetect.data;
                req.body.objectDetect.data.forEach(el => {
                    let thisObj = memoryRet('longTerm', el, false, null, false, false);
                    if (thisObj !== undefined) otherObjects.push(thisObj.data);
                    else console.error(el, ' from objects detected is not defined in memory.');
                })
            }

    if (req.body.faceAPI !== null && req.body.faceAPI !== undefined)
        if (req.body.faceAPI.data !== null && req.body.faceAPI.data !== undefined)
            analyze_FaceAPI(req.body.faceAPI.data)

    if (req.body.textToxicity !== null && req.body.textToxicity !== undefined)
        if (req.body.textToxicity.data !== null && req.body.textToxicity.data !== undefined) {
            req.body.textToxicity.data.forEach(el => {
                let thisObj = memoryRet('longTerm', el, false, null, false, false)
                if (thisObj !== undefined) otherObjects.push(thisObj.data);
            })
        }

    if (req.body.visualObjectsCustom !== null && req.body.visualObjectsCustom !== undefined)
        if (req.body.visualObjectsCustom.data !== null && req.body.visualObjectsCustom.data !== undefined) {
            let thisObj = memoryRet('longTerm', customVisualClass[parseInt(req.body.visualObjectsCustom.data)], false, null, false, false)
            if (thisObj !== undefined) otherObjects.push(thisObj.data);
        }

    if (req.body.audioObjects !== null && req.body.audioObjects !== undefined)
        if (req.body.audioObjects.data !== null && req.body.audioObjects.data !== undefined && req.body.audioObjects.data !== '_background_noise_')
            analyze_audioClassifier(req.body.audioObjects.data);

    if (req.body.speakerResponse !== null && req.body.speakerResponse !== undefined)
        if (req.body.speakerResponse.data !== null && req.body.speakerResponse.data !== undefined && req.body.speakerResponse.data !== '_background_noise_')
            analyze_speakerIdentification(req.body.speakerResponse.data);

    if (req.body.songResponse !== null && req.body.songResponse !== undefined)
        if (req.body.songResponse.data !== null && req.body.songResponse.data !== undefined && req.body.songResponse.data !== '_background_noise_')
            analyze_songIdentification(req.body.songResponse.data);

    if (req.body.poseResponse !== null && req.body.poseResponse !== undefined)
        if (req.body.poseResponse.data !== null && req.body.poseResponse.data !== undefined)



            if (Serial !== null) {
                let thisPoseResponse = poseResponseData[parseInt(req.body.poseResponse.data)];


                let stimulusForWeights = {

                    label: "poseResponseObject_" + req.body.poseResponse.data,
                    sadness: thisPoseResponse[0],
                    joy: thisPoseResponse[1],
                    fear: thisPoseResponse[2],
                    disgust: thisPoseResponse[3],
                    anger: thisPoseResponse[4],
                    surprise: thisPoseResponse[5]
                }

                let choiceScore = personalityNearby(thisPoseResponse, true) * personalitySimilarityWeight + hasSufficientEmWeight(stimulusForWeights, true) * inclinationWeight + calculateRepulsion(stimulusForWeights, true) * repulsionWeight;
                console.log("choice score: ", choiceScore);


                if (req.body.poseResponse.type == 'response' && choiceScore > calculateRepulsion(stimulusForWeights)) {

                    console.log('Pose classifier response received with index: ', parseInt(req.body.poseResponse.data));
                    const poseStimLabel = 'pose_stimulus_' + req.body.poseResponse.data


                    if (testMode == true) {
                        fetch('http://127.0.0.1:4800/database', {
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            method: "POST",
                            body: JSON.stringify({
                                type: 'postureResponse',
                                data: {
                                    startingPose: req.body.poseResponse.data,
                                    endingPose: req.body.poseResponse.data
                                },
                            })
                        })
                    }

                    if (getTriggerIndex(poseStimLabel, 'other', true) == null) {
                        var currentTime = new Date().getTime();

                        let pose_stimulus = {
                            label: poseStimLabel,
                            sadness: thisPoseResponse.endingEmotion[0],
                            joy: thisPoseResponse.endingEmotion[1],
                            fear: thisPoseResponse.endingEmotion[2],
                            disgust: thisPoseResponse.endingEmotion[3],
                            anger: thisPoseResponse.endingEmotion[4],
                            surprise: thisPoseResponse.endingEmotion[5],
                            timesOccurred: 1,
                            totalTimesUsed: 1,
                            isProhibited: false,
                            openness: thisPoseResponse.openness,
                            conscientiousness: thisPoseResponse.conscientiousness,
                            extraversion: thisPoseResponse.extraversion,
                            agreeableness: thisPoseResponse.agreeableness,
                            neuroticism: thisPoseResponse.neuroticism,
                            relatedTasks: [],
                            relatedStimuli: [],
                            relatedPeople: [],
                            time: currentTime,
                            indexUnderLabel: 0
                        }
                        otherObjects.push(pose_stimulus);

                        let mappedTime = thisPoseResponse.poseInterval;
                        switch (rio_max_emotion) {

                            case "sadness":
                                const sadnessUnitTime = 500;
                                mappedTime = map(rio_sadness, 0, 1, mappedTime - sadnessUnitTime, mappedTime + sadnessUnitTime)
                                break;
                            case "anger":
                                const angerUnitTime = 500;
                                mappedTime = map(rio_anger, 0, 1, mappedTime + angerUnitTime, mappedTime - angerUnitTime)
                                break;

                            case 'neutral':
                            case "joy":
                                const joyUnitTime = 500;
                                mappedTime = map(rio_joy, 0, 1, mappedTime + joyUnitTime, mappedTime - joyUnitTime);
                                break;
                            case "disgust":
                                const disgustUnitTime = 500;
                                mappedTime = map(rio_disgust, 0, 1, mappedTime + disgustUnitTime, mappedTime - disgustUnitTime)
                                break;
                            case "surprise":
                                const surpriseUnitTime = 500;
                                mappedTime = map(rio_surprise, 0, 1, mappedTime + surpriseUnitTime, mappedTime - surpriseUnitTime);
                                break;
                            case "fear":
                                const fearUnitTime = 500;
                                mappedTime = map(rio_fear, 0, 1, mappedTime + fearUnitTime, mappedTime - fearUnitTime)
                                break;
                            default: console.error('Error: Pose classifier output: rio_max_emotion is invalid.');
                        }
                        var earDegree = generateEarDegree();

                        sendNewPoseArduino(thisPoseResponse.startingPose, thisPoseResponse.endingPose, earDegree, mappedTime);
                        lastPoseStartTime = currentTime;
                        lastPoseMappedTime = mappedTime;
                    }
                }
                else if (req.body.poseResponse.type == 'response') {
                    console.warn("Pose response not implemented because it does not suit the system's personality.");
                }
            }


    if (req.body.verbalResponse !== null && req.body.verbalResponse !== undefined) {
        if (req.body.verbalResponse.label !== null) {
            console.log("Verbal classifier response recieved with label: ", req.body.verbalResponse.label);

            if (emotionalDecide('speak_', [], currentSpeaker).type == 'action_liked') {

                if (req.body.verbalResponse.score >= answerThreshold && personalityNearby(verbalResponse[parseInt(req.body.verbalResponse.label)])) {

                    let answerObj = {
                        label: req.body.verbalResponse.label + "_verbal_object_",
                        sadness: verbalResponse[parseInt(req.body.verbalResponse.label)].answerer_emotion[0],
                        joy: verbalResponse[parseInt(req.body.verbalResponse.label)].answerer_emotion[1],
                        fear: verbalResponse[parseInt(req.body.verbalResponse.label)].answerer_emotion[2],
                        disgust: verbalResponse[parseInt(req.body.verbalResponse.label)].answerer_emotion[3],
                        anger: verbalResponse[parseInt(req.body.verbalResponse.label)].answerer_emotion[4],
                        surprise: verbalResponse[parseInt(req.body.verbalResponse.label)].answerer_emotion[5]
                    }

                    if (hasSufficientEmWeight(answerObj) == true) {
                        if (verbalResponse[parseInt(req.body.verbalResponse.label)].isProhibited == true) {

                            if (chooseProhibitedObject('verbal', verbalResponse[parseInt(req.body.verbalResponse.label)], currentSpeaker)) {

                                console.log("Decided to speak prohibited response: ", verbalResponse[parseInt(req.body.verbalResponse.label)].speech);
                                responseText += verbalResponse[parseInt(req.body.verbalResponse.label)].speech;
                                lastVerbalResponse = Object.assign({}, verbalResponse[parseInt(req.body.verbalResponse.label)]);
                                emotionAlter("verbal", false, answerObj, false, true);
                                emotionAltered = true;
                            }
                            else {
                                console.log("Going for Watson Assistant as decided not to speak prohibited reponse", verbalResponse[parseInt(req.body.verbalResponse.label)].speech)
                                WAssistant(verbalAnalysisText, true);
                            }
                        }
                        else {
                            if (testMode == true) {

                                fetch('http://127.0.0.1:4800/database', {
                                    headers: {
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/json'
                                    },
                                    method: "POST",
                                    body: JSON.stringify({
                                        type: 'verbalResponse',
                                        data: verbalResponse[parseInt(req.body.verbalResponse.label)].speech,
                                    })
                                })
                            }
                            responseText += verbalResponse[parseInt(req.body.verbalResponse.label)].speech;
                            lastVerbalResponse = Object.assign({}, verbalResponse[parseInt(req.body.verbalResponse.label)]);
                            console.log("Speaking Verbal classifier response: ", responseText);
                            console.log("Verbal classifier score: ", req.body.verbalResponse.score);
                            emotionAlter("verbal", false, answerObj, false, true);
                            emotionAltered = true;
                        }
                    }
                    else {
                        console.log("Verbal classifier response emotionally decided not to be spoken. Going for Watson Assistant.");

                        WAssistant(verbalAnalysisText, true);
                    }
                }
                else {
                    if (req.body.verbalResponse.score >= answerThreshold) {

                        console.log("Verbal classifier score for response: ", verbalResponse[parseInt(req.body.verbalResponse.label)].speech, " is not sufficient. Going for Watson Assistant.");
                    }
                    else {
                        console.log("Verbal classifier response: ", verbalResponse[parseInt(req.body.verbalResponse.label)].speech, ", will not be implemented because the personality for speech does not meet with the system's.")
                    }
                    WAssistant(verbalAnalysisText, true);
                }
            }
            else {
                console.log("Decided not to reply to speaker: ", currentSpeaker);
            }

            if (verbalResponse[parseInt(req.body.verbalResponse.label)].isProhibited == false) {
                agentSpeech += " " + verbalResponse[parseInt(req.body.verbalResponse.label)].speech;
            }
            verbalAnalysisText = "";
        }
    }

    if (req.body.songConfirmation !== null && req.body.songConfirmation !== undefined)
        if (req.body.songConfirmation.data !== null && req.body.songConfirmation.data !== undefined) {
            let Text = req.body.songConfirmation.data;
            if (Text == 'no') {

                currentSongDetails.songEmotion = null;
                currentSongDetails.agentMaxEmotion = null;
                currentSongDetails.agentEmotion = [];

                cancelSingingTask();
                if (frontendIncoming.song_incoming.text !== null) {
                    setTimeout(function () {
                        frontendIncoming.song_incoming.text = 'deleteClass';
                    }, communicationDelay)
                }
                else {
                    frontendIncoming.song_incoming.text = 'deleteClass';
                }
                confirmNo();
            }
            else if (Text == 'yes') {

                if (frontendIncoming.song_incoming.text !== null) {
                    setTimeout(function () {
                        frontendIncoming.song_incoming.text = 'saveClass';
                    }, communicationDelay)
                }
                else {
                    frontendIncoming.song_incoming.text = 'saveClass';
                }
                confirmYes();
            }
        }

    if (req.body.askSingingConfirmation !== null && req.body.askSingingConfirmation !== undefined)
        if (req.body.askSingingConfirmation.data !== null && req.body.askSingingConfirmation.data !== undefined) {
            if (song_name != null) {

                responseText += "Should I save the song that I have just learnt?     ";

                currentSongDetails.songEmotion = audioMaxEmotion;

                currentSongDetails.agentMaxEmotion = rio_max_emotion != 'neutral' ? rio_max_emotion : 'joy';
                currentSongDetails.agentEmotionScores = [rio_sadness, rio_joy, rio_fear, rio_disgust, rio_anger, rio_surprise];

                if (frontendIncoming.song_incomingJS.text !== null) {
                    setTimeout(function () {
                        frontendIncoming.song_incoming.text = 'learnStop';
                    }, communicationDelay)
                }
                else {
                    frontendIncoming.song_incoming.text = 'learnStop';
                }
            }
            else console.error('Error: Song save cannot be done when song name is null')
        }

    if (req.body.songOutgoingData !== null && req.body.songOutgoingData !== undefined)
        if (req.body.songOutgoingData.data !== null && req.body.songOutgoingData.data !== undefined) {

            console.log("Received new song array from the frontend.");
            if (song_name == null) {
                console.error("Backend Error: Cannot save new song when song_name is null");
            }
            else {
                saveTheSong(req.body.songOutgoingData.data);
            }
        }
    res.json({ received: true });
});
backend_app.post('/save', function (req, res) {
    res.json({ received: true });


    if (req.body.hasOwnProperty('visualSave')) {
        console.log('Received visual module save dataset.');
        if (req.body.visualSave.type == 'saveFinal') {
            if (req.body.visualSave.data !== null) {
                try {
                    fs.writeFileSync('./emotionalObjects/learnt_modules/visualSave.json', JSON.stringify(req.body.visualSave.data));
                    fs.writeFileSync('./emotionalObjects/learnt_modules/customVisualClass.json', JSON.stringify(customVisualClass));
                    console.log("Final save of visual classifier done successfully.");
                }
                catch (err) {
                    console.error("Backend Error: Error in visual classifier final save: ", err.message);
                }
            }
            else {
                console.warn("Warning: visual classifier dataset is empty in saveFinal.");
            }
            allSaveModules[0] = true;
        }
        else {
            if (req.body.visualSave.data !== null) {
                fs.writeFile('./emotionalObjects/learnt_modules/visualSave.json', JSON.stringify(req.body.visualSave.data), function (err) {
                    if (err) console.error("Backend Error: Error in periodic saving of visual classifier dataset: ", err);
                    else {
                        fs.writeFile('./emotionalObjects/learnt_modules/customVisualClass.json', JSON.stringify(customVisualClass), function (thiserr) {
                            if (thiserr) console.error("Backend Error: Error in periodic saving of visual classifier labels: ", thiserr);
                            else console.log("Periodic save of visual classifier done successfully.");
                        })
                    }
                });
            }
            else {
                console.warn("Warning: visual classifier dataset is empty in savePeriodic.");
            }
        }
    }


    if (req.body.hasOwnProperty('audioSave')) {
        console.log("Received audio module save dataset.");
        if (req.body.audioSave.type == 'saveFinal') {
            if (req.body.audioSave.data !== null) {
                try {
                    fs.writeFileSync('./emotionalObjects/learnt_modules/audioSave.txt', req.body.audioSave.data, { encoding: 'base64' });
                    console.log("Final Save of audio classifier done successfully.");
                }
                catch (err) {
                    console.error("Backend Error: Audio classifier final save error: ", err.message);
                }
            }
            else {
                console.warn("Warning: Audio classifier save dataset is empty in saveFinal.");
            }
            allSaveModules[1] = true;
        }
        else {
            if (req.body.audioSave.data !== null) {
                fs.writeFile('./emotionalObjects/learnt_modules/audioSave.txt', req.body.audioSave.data, { encoding: 'base64' }, function (err) {
                    if (err) console.error("Backend Error: Error in periodic saving of audio classifier dataset: ", err);
                    else console.log("Successful in periodic saving of audio classifier dataset.");
                });
            }
            else {
                console.warn("Warning: Audio classifier save dataset is empty in savePeriodic.");
            }
        }
    }

    if (req.body.hasOwnProperty('verbalSave')) {

        console.log("Received verbal classifier save dataset.");
        if (req.body.verbalSave.type == 'saveFinal') {
            if (req.body.verbalSave.data !== null) {
                try {
                    var verbalClassUrl;
                    var verbalResponseUrl;
                    if (testMode) {
                        verbalClassUrl = './testMode/inputs/verbalClassSaved.json';
                        verbalResponseUrl = './testMode/inputs/verbalResponseSaved.json';
                    }
                    else {
                        verbalClassUrl = './emotionalObjects/learnt_modules/verbalClassSaved.json'
                        verbalResponseUrl = './emotionalObjects/learnt_modules/verbalResponseSaved.json';
                    }
                    fs.writeFileSync(verbalClassUrl, JSON.stringify(req.body.verbalSave.data))
                    fs.writeFileSync(verbalResponseUrl, JSON.stringify(verbalResponse))
                    console.log("Final save of verbal classifier done successfully.");
                }
                catch (err) {
                    console.error("Backend Error: Error in final save of verbal classifier: ", err.message)
                }
            }
            else {
                console.warn("Warning: verbal classifier dataset is empty in saveFinal.");
            }
            allSaveModules[2] = true;
        }

        else {
            if (req.body.verbalSave.data !== null) {
                fs.writeFile('./emotionalObjects/learnt_modules/verbalClassSaved.json', JSON.stringify(req.body.verbalSave.data), function (err) {
                    if (err) console.error('Error: Error in saving the verbal classifier dataset: ', err);
                    else console.log("verbal classifier dataset periodic save done successfully.");
                })
                fs.writeFile('./emotionalObjects/learnt_modules/verbalResponseSaved.json', JSON.stringify(verbalResponse), function (err) {
                    if (err) console.error('Error: Error in saving the response module of verbal classifier: ', err)
                    else console.log('verbal classifier response periodic save done successfully.');
                })
            }
            else {
                console.warn("Warning: verbal classifier dataset is empty in savePeriodic.");
            }
        }
    }

    if (req.body.hasOwnProperty('speakerSave')) {
        console.log("Received speaker module save dataset.");
        if (req.body.speakerSave.type == 'saveFinal') {
            if (req.body.speakerSave.data !== null) {
                try {
                    fs.writeFileSync('./emotionalObjects/learnt_modules/speakerSave.txt', req.body.speakerSave.data, { encoding: 'base64' });
                    fs.writeFileSync('./emotionalObjects/learnt_modules/speakerSavedLabels.json', JSON.stringify(speakerSavedClass));
                    console.log("Final Save of speaker classifier done successfully.");
                }
                catch (err) {
                    console.error("Backend Error: Speaker classifier final save error: ", err.message);
                }
            }
            else {
                console.warn("Warning: Speaker classifier dataset is empty in saveFinal.")
            }
            allSaveModules[3] = true;
        }
        else {
            if (req.body.speakerSave.data !== null) {
                fs.writeFile('./emotionalObjects/learnt_modules/speakerSave.txt', req.body.speakerSave.data, { encoding: 'base64' }, function (err) {
                    if (err) console.error("Backend Error: Error in periodic saving of speaker classifier dataset: ", err);
                    else {
                        fs.writeFile('./emotionalObjects/learnt_modules/speakerSavedLabels.json', JSON.stringify(speakerSavedClass), function (thiserr) {
                            if (thiserr) console.error("Backend Error: Error in periodic saving of speaker labels: ", thiserr);
                            else console.log("Periodic save of speaker classifier done successfully.");
                        })
                    }
                });
            }
            else {
                console.warn("Warning: Speaker classifier dataset is empty in savePeriodic.");
            }
        }
    }

    if (req.body.hasOwnProperty('songSave')) {
        console.log("Received song module save dataset.");
        if (req.body.songSave.type == 'saveFinal') {
            if (req.body.songSave.data !== null) {
                try {
                    fs.writeFileSync('./emotionalObjects/learnt_modules/songSave.txt', req.body.songSave.data, { encoding: 'base64' });
                    fs.writeFileSync('./emotionalObjects/learnt_modules/songSavedLabels.json', JSON.stringify(songSavedClass));
                    console.log("Final Save of song classifier done successfully.");
                }
                catch (err) {
                    console.error("Backend Error: Song classifier final save error: ", err.message);
                }
            }
            else {
                console.warn("Warning: Song classifier dataset is empty in saveFinal.");
            }
            allSaveModules[4] = true;
        }
        else {
            if (req.body.songSave.data !== null) {
                fs.writeFile('./emotionalObjects/learnt_modules/songSave.txt', req.body.songSave.data, { encoding: 'base64' }, function (err) {
                    if (err) console.error("Backend Error: Error in periodic saving of song classifier dataset: ", err);
                    else {
                        fs.writeFile('./emotionalObjects/learnt_modules/songSavedLabels.json', JSON.stringify(songSavedClass), function (thiserr) {
                            if (thiserr) console.error("Backend Error: Error in periodic saving of song labels: ", thiserr);
                            else console.log("Periodic save of song classifier done successfully.");
                        })
                    }
                });
            }
            else {
                console.warn("Warning: Song classifier dataset is empty in savePeriodic.");
            }
        }
    }

    if (req.body.hasOwnProperty('poseSave')) {
        console.log("Received pose module save dataset.");

        if (req.body.poseSave.type == 'saveFinal') {
            if (req.body.poseSave.data !== null) {
                try {
                    var poseClassUrl;
                    var poseResponseUrl;
                    if (testMode) {
                        poseClassUrl = './testMode/inputs/poseClassSaved.json';
                        poseResponseUrl = './testMode/inputs/poseResponseSaved.json';
                    }
                    else {
                        poseClassUrl = './emotionalObjects/learnt_modules/poseClassSaved.json';
                        poseResponseUrl = './emotionalObjects/learnt_modules/poseResponseSaved.json';
                    }
                    fs.writeFileSync(poseClassUrl, JSON.stringify(req.body.poseSave.data));
                    fs.writeFileSync(poseResponseUrl, JSON.stringify(poseResponseData));
                    console.log("Final save of pose classifier done successfully.");
                }
                catch (err) {
                    console.error("Backend Error: Pose classifier final save error: ", err.message)
                }
            }
            else {
                console.warn("Warning: pose classifier dataset is empty in saveFinal.");
            }
            allSaveModules[5] = true;
        }

        else {
            if (req.body.poseSave.data !== null) {
                var poseClassUrl;
                var poseResponseUrl;
                if (testMode) {
                    poseClassUrl = './testMode/inputs/poseClassSaved.json';
                    poseResponseUrl = './testMode/inputs/poseResponseSaved.json';
                }
                else {
                    poseClassUrl = './emotionalObjects/learnt_modules/poseClassSaved.json';
                    poseResponseUrl = './emotionalObjects/learnt_modules/poseResponseSaved.json';
                }
                fs.writeFile(poseClassUrl, JSON.stringify(req.body.poseSave.data), function (err) {
                    if (err) console.error('Error: Error in saving pose classifier dataset: ', err)
                    else console.log("Periodic saving of pose classifier dataset done successfully.");
                });
                fs.writeFile(poseResponseUrl, JSON.stringify(poseResponseData), function (err) {
                    if (err) console.error('Error: Error in saving pose classifier response module: ', err);
                    else console.log("Periodic saving of pose classifier response done successfully.");
                });
            }
            else {
                console.warn("Warning: pose classifier dataset is empty in savePeriodic.");
            }
        }
    }
});
function otherComms() {
    let currentTime = new Date().getTime();
    let sendEmotion;
    let sendEmotionScore = rio_max_emotion_score;
    let sendSpeed = rio_speech_speed;
    let sendPitch = rio_speech_pitch;
    let sendSingingState = (sing_song == true && alreadyLearntSong == true) ? true : false;
    if (extremeEmotion == true) sendEmotion = rio_max_emotion + '_very';
    else sendEmotion = rio_max_emotion;
    if (frontendIncoming.frontend_data.emotion !== null) {
        setTimeout(function () {
            frontendIncoming.frontend_data.emotion = sendEmotion;
        }, communicationDelay)
    }
    else frontendIncoming.frontend_data.emotion = sendEmotion;
    if (frontendIncoming.frontend_data.emotionScore !== null) {
        setTimeout(function () {
            frontendIncoming.frontend_data.emotionScore = sendEmotionScore;
        }, communicationDelay)
    }
    else frontendIncoming.frontend_data.emotionScore = sendEmotionScore;
    if (frontendIncoming.frontend_data.rate !== null) {
        setTimeout(function () {
            frontendIncoming.frontend_data.rate = sendSpeed;
        }, communicationDelay)
    }
    else frontendIncoming.frontend_data.rate = sendSpeed;
    if (frontendIncoming.frontend_data.pitch !== null) {
        setTimeout(function () {
            frontendIncoming.frontend_data.pitch = sendPitch;
        }, communicationDelay)
    }
    else frontendIncoming.frontend_data.pitch = sendPitch;
    if (frontendIncoming.frontend_data.singingState !== null) {
        setTimeout(function () {
            frontendIncoming.frontend_data.singingState = sendSingingState
        }, communicationDelay)
    }
    else frontendIncoming.frontend_data.singingState = sendSingingState;


    if (predictVerbalAns == true && verbalAnalysisText.length !== 0) {
        console.log("Predicting answer using verbal prediction module for text: ", verbalAnalysisText);
        let questionerIndex = getPersonIndex(currentSpeaker);
        console.log("Questioner index for verbal prediction: ", questionerIndex);
        console.log("tone emotion for verbal prediction: ", personsPresent[questionerIndex].toneEmotion)

        if (questionerIndex !== null) {
            let numericSpeechArray = stringArrToNumeric(stringToArray(verbalAnalysisText.slice(0)));


            if (numericSpeechArray.length < wordLength) {

                let thisLen = personsPresent[questionerIndex].personSpeechArray.length;
                let foundEnoughWords = false;
                for (var i = thisLen - 2; i >= 0; i--) {
                    let thisArray = stringArrToNumeric(stringToArray(personsPresent[questionerIndex].personSpeechArray[i]));
                    if (foundEnoughWords == false)
                        for (var j = 0; j < thisArray.length; j++) {
                            numericSpeechArray.push(thisArray[j]);
                            if (numericSpeechArray.length == wordLength) {
                                foundEnoughWords = true;
                                break;
                            }
                        }
                    else break;
                }

                while (numericSpeechArray.length < wordLength) {
                    for (var i = 0; i < numericSpeechArray.length; i++) {
                        if (numericSpeechArray.length < wordLength)
                            numericSpeechArray.push(numericSpeechArray[i]);
                        else break;
                    }
                }
            }
            while (numericSpeechArray.length > wordLength)
                numericSpeechArray.pop();

            let verbalObjLength = personsPresent[questionerIndex].relatedAbstracts.length;
            let verbalObjects = personsPresent[questionerIndex].relatedAbstracts[verbalObjLength - 1];

            if (verbalObjects !== undefined) {
                if (verbalObjects.length < objLength) {
                    let foundEnoughObjects = false;
                    for (var i = verbalObjLength - 2; i >= 0; i--) {
                        let thisArray = personsPresent[questionerIndex].relatedAbstracts[i];
                        if (foundEnoughObjects == false)
                            for (var j = 0; j < thisArray.length; j++) {
                                verbalObjects.push(thisArray[j]);
                                if (verbalObjects.length == objLength) {
                                    foundEnoughObjects = true;
                                    break;
                                }
                            }
                        else break;
                    }
                }
                while (verbalObjects.length > objLength)
                    verbalObjects.pop();
                if (frontendIncoming.verbal_incoming.text !== null) {
                    setTimeout(function () {
                        frontendIncoming.verbal_incoming.text = 'predict';
                        frontendIncoming.verbal_incoming.json = [
                            stringArrToNumeric(verbalObjects),
                            numericSpeechArray,
                            personsPresent[questionerIndex].toneEmotion,
                            [rio_sadness, rio_joy, rio_fear, rio_disgust, rio_anger, rio_surprise]
                        ].slice(0)
                    }, communicationDelay)
                }
                else {
                    frontendIncoming.verbal_incoming.text = 'predict';
                    frontendIncoming.verbal_incoming.json = [
                        stringArrToNumeric(verbalObjects),
                        numericSpeechArray,
                        personsPresent[questionerIndex].toneEmotion,
                        [rio_sadness, rio_joy, rio_fear, rio_disgust, rio_anger, rio_surprise]
                    ].slice(0)
                }
            }
            else {
                console.warn("No matched data exists for ", verbalAnalysisText, ". Predicting answer using Watson Assistant.");
                WAssistant(verbalAnalysisText, true);
            }
        }

        else {
            console.log("Current questioner index is undefined. Predicting answer using Watson Assistant.");
            WAssistant(verbalAnalysisText, true);
        }
        predictVerbalAns = false;
    };


    if (currentTime - lastPoseStartTime >= lastPoseMappedTime && testMode == false) {
        var predictPose = false;
        const poseEmotionThreshold = 0.2;

        for (var i = 0; i < poseResponseData.length; i++) {
            if (Math.abs(poseResponseData[i].startingEmotion[0] - rio_sadness) < poseEmotionThreshold && Math.abs(poseResponseData[i].startingEmotion[1] - rio_joy) < poseEmotionThreshold
                && Math.abs(poseResponseData[i].startingEmotion[2] - rio_fear) < poseEmotionThreshold && Math.abs(poseResponseData[i].startingEmotion[3] - rio_disgust) < poseEmotionThreshold
                && Math.abs(poseResponseData[i].startingEmotion[4] - rio_anger) < poseEmotionThreshold && Math.abs(poseResponseData[i].startingEmotion[5] - rio_surprise) < poseEmotionThreshold) {
                predictPose = true;
                break;
            }
        }
        if (predictPose == true) {
            if (frontendIncoming.pose_incoming.text !== null) {
                setTimeout(function () {
                    if (frontendIncoming.pose_incoming.text !== 'savePeriodic' && frontendIncoming.pose_incoming.text !== 'saveFinal') {
                        frontendIncoming.pose_incoming.text = 'predict';
                        frontendIncoming.pose_incoming.json = [rio_sadness, rio_joy, rio_fear, rio_disgust, rio_anger, rio_surprise];
                    }
                }, communicationDelay)
            }
            else {
                if (frontendIncoming.pose_incoming.text !== 'savePeriodic' && frontendIncoming.pose_incoming.text !== 'saveFinal') {
                    frontendIncoming.pose_incoming.text = 'predict';
                    frontendIncoming.pose_incoming.json = [rio_sadness, rio_joy, rio_fear, rio_disgust, rio_anger, rio_surprise];
                }
            }
        }
    }
}
backend_app.post('/input', function (req, res) {
    if (responseText.length !== 0) {
        console.log("Speaking: ", responseText)
        if (frontendIncoming.frontend_data.speech !== null)
            frontendIncoming.frontend_data.speech += responseText;
        else
            frontendIncoming.frontend_data.speech = responseText;
        responseText = "";
    }

    res.json(frontendIncoming);
    clearVariables();
    function clearVariables() {

        if (frontendIncoming.audio_incoming.text !== null)
            frontendIncoming.audio_incoming.text = null;
        if (frontendIncoming.audio_incoming.json !== null)
            frontendIncoming.audio_incoming.json = null;
        if (frontendIncoming.audio_incoming.val !== null)
            frontendIncoming.audio_incoming.val = null;

        if (frontendIncoming.song_incoming.text !== null)
            frontendIncoming.song_incoming.text = null;
        if (frontendIncoming.song_incoming.json !== null)
            frontendIncoming.song_incoming.json = null;
        if (frontendIncoming.song_incoming.val !== null)
            frontendIncoming.song_incoming.val = null;

        if (frontendIncoming.speaker_incoming.text !== null)
            frontendIncoming.speaker_incoming.text = null;
        if (frontendIncoming.speaker_incoming.json !== null)
            frontendIncoming.speaker_incoming.json = null;
        if (frontendIncoming.speaker_incoming.val !== null)
            frontendIncoming.speaker_incoming.val = null;

        if (frontendIncoming.visual_incoming.text !== null)
            frontendIncoming.visual_incoming.text = null;
        if (frontendIncoming.visual_incoming.json !== null)
            frontendIncoming.visual_incoming.json = null;
        if (frontendIncoming.visual_incoming.val !== null)
            frontendIncoming.visual_incoming.val = null;

        if (frontendIncoming.pose_incoming.text !== null)
            frontendIncoming.pose_incoming.text = null;
        if (frontendIncoming.pose_incoming.json.length !== 0)
            frontendIncoming.pose_incoming.json.length = 0;
        if (frontendIncoming.pose_incoming.val !== null)
            frontendIncoming.pose_incoming.val = null;

        if (frontendIncoming.verbal_incoming.text !== null)
            frontendIncoming.verbal_incoming.text = null;
        if (frontendIncoming.verbal_incoming.json.length !== 0)
            frontendIncoming.verbal_incoming.json.length = 0;
        if (frontendIncoming.verbal_incoming.val !== null)
            frontendIncoming.verbal_incoming.val = null;

        if (frontendIncoming.song_incomingJS.text !== null)
            frontendIncoming.song_incomingJS.text = null;
        if (frontendIncoming.song_incomingJS.json !== null)
            frontendIncoming.song_incomingJS.json = null;
        if (frontendIncoming.song_incomingJS.val !== null)
            frontendIncoming.song_incomingJS.val = null;

        if (frontendIncoming.frontend_data.speech !== null)
            frontendIncoming.frontend_data.speech = null;
        if (frontendIncoming.frontend_data.emotion !== null)
            frontendIncoming.frontend_data.emotion = null;
        if (frontendIncoming.frontend_data.emotionScore !== null)
            frontendIncoming.frontend_data.emotionScore = null;
        if (frontendIncoming.frontend_data.rate !== null)
            frontendIncoming.frontend_data.rate = null;
        if (frontendIncoming.frontend_data.pitch !== null)
            frontendIncoming.frontend_data.pitch = null;
    }
})
function main() {
    checkInternet(function (isConnected) {
        if (isConnected) {

            if (currentSpeaker == undefined) {
                if (currentPerson !== undefined)
                    currentSpeaker = currentPerson;
            }

            var currentTime = new Date().getTime();
            if (trackingStopTime == undefined)
                trackingStopTime = currentTime;


            if (msg.length != 0) {

                if (msg.toLowerCase().includes(agentName.toLowerCase()))
                    msgInLowercase = msg.toLowerCase();

                if (lastChosenOption !== undefined) {
                    for (var i = 0; i < prohibitControlStatements.optionDont.length; i++) {
                        if (msgInLowercase.includes(prohibitControlStatements.optionDont[i])) {

                            lastChosenOption.isProhibited = true;


                            let thisRelatedStimuli = [];

                            for (var x in lastChosenOption.relatedStimuli) {
                                thisRelatedStimuli.push(x);
                            }
                            let thisRelatedPeople = [];
                            for (var y in lastChosenOption.relatedPeople) {
                                thisRelatedPeople.push(y);
                            }
                            let obj = memoryRet('longTerm', lastChosenOption.label, false, null, false, true, thisRelatedStimuli, thisRelatedPeople,
                                [lastChosenOption.sadness, lastChosenOption.joy, lastChosenOption.fear, lastChosenOption.disgust, lastChosenOption.anger, lastChosenOption.surprise]);
                            if (typeof obj == 'number' || obj == undefined) {
                                console.error("Prohibited stimulus setting in long term has failed because the associated stimulus could not be found in long term.");
                            }
                            else {
                                let newObj = Object.assign({}, obj.data);
                                newObj.isProhibited = true;

                                memoryRet('longTerm', newObj.label, true, newObj, false, true, null, null, null, obj.index);
                            }

                            let personalitySim = PersonalityDiffScaledScore({

                                personality: {
                                    openness: agentBigFive.openness,
                                    conscientiousness: agentBigFive.conscientiousness,
                                    extraversion: agentBigFive.extraversion,
                                    agreeableness: agentBigFive.agreeableness,
                                    neuroticism: agentBigFive.neuroticism
                                }
                            }, true);
                            let likenessVal = defaultLikeness;
                            const timeEffectCoefficient = 1;
                            const alpha = personalitySim * likenessVal * timeEffectCoefficient;
                            console.log(`personality similarity: ${personalitySim} likeness: ${likenessVal} alpha: ${alpha}`)

                            let weightedAlpha;
                            let weightedAbstention;
                            if (alpha >= abstentionConstant) {
                                weightedAbstention = abstentionConstant * weight1_2_valued;
                                weightedAlpha = alpha * weight2_2_valued;
                            }
                            else {
                                weightedAbstention = abstentionConstant * weight2_2_valued;
                                weightedAlpha = alpha * weight1_2_valued;
                            }

                            let guilt_influence = weightedAlpha + weightedAbstention;


                            generateGuiltStimulus(lastChosenOption.label, guilt_influence);
                            lastChosenOption = undefined;

                            break;
                        }
                    }
                }
                if (lastVerbalResponse !== undefined) {
                    for (var i = 0; i < prohibitControlStatements.verbalCant.length; i++) {
                        if (msgInLowercase.includes(prohibitControlStatements.verbalCant[i])) {

                            lastVerbalResponse.isProhibited = true;
                            let personalitySim = PersonalityDiffScaledScore({
                                personality: {
                                    openness: agentBigFive.openness,
                                    conscientiousness: agentBigFive.conscientiousness,
                                    extraversion: agentBigFive.extraversion,
                                    agreeableness: agentBigFive.agreeableness,
                                    neuroticism: agentBigFive.neuroticism
                                }
                            }, true);
                            let likenessVal = defaultLikeness;
                            const timeEffectCoefficient = 1;
                            const alpha = personalitySim * likenessVal * timeEffectCoefficient;
                            console.log(`personality similarity: ${personalitySim} likeness: ${likenessVal} alpha: ${alpha}`)

                            let weightedAlpha;
                            let weightedAbstention;
                            if (alpha >= abstentionConstant) {
                                weightedAbstention = abstentionConstant * weight1_2_valued;
                                weightedAlpha = alpha * weight2_2_valued;
                            }
                            else {
                                weightedAbstention = abstentionConstant * weight2_2_valued;
                                weightedAlpha = alpha * weight1_2_valued;
                            }

                            let guilt_influence = weightedAlpha + weightedAbstention;
                            generateGuiltStimulus(lastVerbalResponse.speech, guilt_influence)
                            lastVerbalResponse = undefined;

                            break;
                        }
                    }
                }
                function getArrayFromStr(speech) {
                    var wordArray = new Array(0);
                    if (speech.charAt(speech.length - 1) !== " ") {
                        var tempSpeech = speech + " ";
                    }
                    for (var i = 0, lastIndex = 0; i <= tempSpeech.length - 1; i++) {
                        if (tempSpeech.charAt(i) == " ") {
                            wordArray.push(tempSpeech.slice(lastIndex, i));
                            lastIndex = i + 1;
                        }
                    }
                    return wordArray;
                }

                for (var i = 0; i < prohibitControlStatements.optionCan.length; i++) {
                    if (msgInLowercase.includes(prohibitControlStatements.optionCan[i])) {
                        var startIndex = msgInLowercase.indexOf(prohibitControlStatements.optionCan[i]) + prohibitControlStatements.optionCan[i].length + 1;
                        var extractedString = msgInLowercase.slice(startIndex);
                        var extractedArray = getArrayFromStr(extractedString);
                        while (extractedArray.length !== 0) {
                            let label = extractedArray.join(" ");
                            if (longTermJSON.hasOwnProperty(label)) {

                                for (var d = 0; d < longTermJSON[label].length; d++) {
                                    if (longTermJSON[label][d].isProhibited == true) {

                                        longTermJSON[label][d].isProhibited = false;

                                        delete longTermJSON[label][d].guilt_influence;
                                        console.log("Removed prohibited tag from object: ", label);
                                        break;
                                    }
                                }
                            }
                            else extractedArray.pop()
                        }
                        if (extractedArray.length == 0) {
                            console.error("Backend Error: No object found in ", extractedString, " for prohibition removal.");
                        }
                        break;
                    }
                }

                for (var i = 0; i < prohibitControlStatements.verbalCan.length; i++) {
                    if (msgInLowercase.includes(prohibitControlStatements.verbalCan[i])) {
                        var startIndex = msgInLowercase.indexOf(prohibitControlStatements.verbalCan[i]) + prohibitControlStatements.verbalCan[i].length + 1;
                        var extractedString = msgInLowercase.slice(startIndex);
                        var extractedArray = getArrayFromStr(extractedString);
                        const verbalResponseLength = verbalResponse.length;
                        function arraysMatched(arr1, arr2) {
                            const matchThreshold = 0.6;

                            var matchedElements = 0;
                            for (var i = 0; i < arr1.length; i++) {
                                for (var j = 0; j < arr2.length; j++) {
                                    if (arr1[i] == arr2[j])
                                        matchedElements++;
                                }
                            }

                            var matched = false;
                            if (matchedElements / arr2.length > matchThreshold)
                                matched = true;
                            return matched;
                        }
                        for (var d = 0; d < verbalResponseLength; d++) {
                            var searchArray = getArrayFromStr(verbalResponse[d].speech);
                            if (arraysMatched(extractedArray, searchArray)) {
                                if (verbalResponse[d].isProhibited == true) {
                                    verbalResponse[d].isProhibited = false
                                    console.log("Removed prohibition tag from verbal response: ", verbalResponse[d].speech);
                                    break;
                                }
                            }
                        }
                        if (d == verbalResponseLength)
                            console.error("Backend Error: no verbal response found in ", extractedString, " for prohibition removal.");
                        break;
                    }
                }






                if (msg.includes("leftObjectDetected::")) {
                    let thisObj = memoryRet('longTerm', 'left_side_object_detected', false, null, false, false)
                    if (thisObj !== undefined) otherObjects.push(thisObj.data);

                    if (Serial !== null) {
                        let Thisdecision = emotionalDecide('turn_left_');
                        if (Thisdecision.type == 'action_liked') {

                            Serial.write('turn_left');
                        }
                    }
                    msg = msg.replace("leftObjectDetected::", "");
                }
                if (msg.includes('rightObjectDetected::')) {
                    let thisObj = memoryRet('longTerm', 'right_side_object_detected_', false, null, false, false);
                    if (thisObj !== undefined) otherObjects.push(thisObj.data);

                    if (Serial !== null) {
                        let Thisdecision = emotionalDecide('turn_right_');
                        if (Thisdecision.type == 'action_liked') {

                            Serial.write('turn_right');
                        }
                    }
                    msg = msg.replace("rightObjectDetected::", "");
                }


                if (msg.includes("slightHot::")) {
                    let thisObj = memoryRet('longTerm', 'slightHot_', false, null, false, false);
                    if (thisObj !== undefined) otherObjects.push(thisObj.data);
                    msg = msg.replace('slightHot::', "");
                }
                else if (msg.includes("mediumHot::")) {
                    let thisObj = memoryRet('longTerm', "mediumHot_", false, null, false, false)
                    if (thisObj !== undefined) otherObjects.push(thisObj.data);
                    msg = msg.replace("mediumHot::", "");
                }
                else if (msg.includes("veryHot::")) {
                    let thisObj = memoryRet('longTerm', "veryHot_", false, null, false, false)
                    if (thisObj !== undefined) otherObjects.push(thisObj.data);
                    msg = msg.replace("veryHot::", "");
                }


                for (var i = 0; i <= songSavedClass.length - 1; i++) {

                    if (msgInLowercase.includes(songSavedClass[i].name.toLowerCase())) {

                        getSongToShortTerm(songSavedClass[i].name);
                    }
                }

                if (msgInLowercase.includes("learn") || msgInLowercase.includes("remember") || msgInLowercase.includes("keep")) {
                    if (msgInLowercase.includes("do") == false) {

                        if (msgInLowercase.includes("speaker") || msgInLowercase.includes("voice") || msgInLowercase.includes("person")) {
                            var nameIndex;
                            var ofIndex;
                            var start;
                            if (msgInLowercase.includes("name")) {
                                nameIndex = msgInLowercase.lastIndexOf("name");
                            }
                            if (msgInLowercase.includes("of")) {
                                ofIndex = msgInLowercase.lastIndexOf("of");
                            }
                            if (nameIndex != null && ofIndex != null) {
                                if (ofIndex >= nameIndex) {
                                    start = ofIndex;
                                }
                                else start = nameIndex;
                            }
                            else if (nameIndex != null) {
                                start = nameIndex;
                            }
                            else if (ofIndex != null) {
                                start = ofIndex;
                            }
                            var name = msg.slice(start);
                            speaker_learn(name);

                            createNewPerson(name);
                            musicOptions.path = "./sounds/createNotification.wav"
                            player.play(musicOptions);
                            systemCommand = true;
                        }

                        if (msgInLowercase.includes("sound")) {
                            if (msgInLowercase.includes('joy'))
                                audio_learn('audio_joy');
                            else if (msgInLowercase.includes('sadness'))
                                audio_learn('audio_sadness');
                            else if (msgInLowercase.includes('fear'))
                                audio_learn('audio_fear');
                            else if (msgInLowercase.includes('disgust'))
                                audio_learn('audio_disgust');
                            else if (msgInLowercase.includes('anger'))
                                audio_learn('audio_anger');
                            else if (msgInLowercase.includes('surprise'))
                                audio_learn('audio_surprise');
                            musicOptions.path = "./sounds/createNotification.wav"
                            player.play(musicOptions);

                            systemCommand = true;
                        }

                        if (msgInLowercase.includes("picture") || msgInLowercase.includes("face") ||
                            msgInLowercase.includes("scenery") || msgInLowercase.includes("view") ||
                            msgInLowercase.includes("image")) {

                            var Visualemotion;
                            if (msgInLowercase.includes(' joy') || msgInLowercase.includes('happ'))
                                Visualemotion = "joy";
                            else if (msgInLowercase.includes(' sad') || msgInLowercase.includes('grief'))
                                Visualemotion = "sadness";
                            else if (msgInLowercase.includes('fear') || msgInLowercase.includes('afraid'))
                                Visualemotion = "fear";
                            else if (msgInLowercase.includes('disgust'))
                                Visualemotion = "disgust";
                            else if (msgInLowercase.includes(' ang'))
                                Visualemotion = "anger";
                            else if (msgInLowercase.includes('surprise'))
                                Visualemotion = "surprise";

                            if (msgInLowercase.includes(" as "))
                                start = msgInLowercase.lastIndexOf("as");
                            else if (msgInLowercase.includes(" by "))
                                start = msgInLowercase.lastIndexOf("by");
                            else {
                                visual_learn(null, Visualemotion);

                            }

                            if (start != null) {
                                var name = msg.slice(start);
                                visual_learn(name, Visualemotion);

                            }
                            musicOptions.path = "./sounds/createNotification.wav";
                            player.play(musicOptions);
                        }
                    }
                    systemCommand = true;
                }

                if (msgInLowercase.includes("delete the visual memory of")) {
                    start = msgInLowercase.lastIndexOf("of");
                    var name = msgInLowercase.slice(start);
                    visual_delete(name);
                    musicOptions.path = "./sounds/deleteNotification.wav"
                    player.play(musicOptions);
                }

                else if (msgInLowercase.includes("delete all the visual memory")) {
                    visual_deleteALL();
                    musicOptions.path = "./sounds/deleteNotification.wav"
                    player.play(musicOptions);
                }


                if (msgInLowercase.includes(terminate_Word)) {

                    exitCode();
                }

                if (msgInLowercase.includes("stop listening to the song")) {
                    if (frontendIncoming.song_incomingJS.text !== null) {
                        setTimeout(function () {
                            frontendIncoming.song_incomingJS.text = 'stopListening';
                        }, communicationDelay)
                    }
                    else {
                        frontendIncoming.song_incomingJS.text = 'stopListening';
                    }
                }
            }


            /*
            if (extremeEmotion == true && checkEmotionDiff([rio_sadness, rio_joy, rio_fear, rio_disgust, rio_anger, rio_surprise], lastVisualLearnEmotion, 'visualLearn')) {
                
                visual_learn(null, [rio_sadness, rio_joy, rio_fear, rio_disgust, rio_anger, rio_surprise]);
                lastVisualLearnEmotion = [rio_sadness, rio_joy, rio_fear, rio_disgust, rio_anger, rio_surprise];
            }*/

            if (SpecialAbility == true) {

                if (msgInLowercase.includes("cancel it") || msgInLowercase.includes("stop it") || msgInLowercase.includes("stop stop")) {
                    cancelSingingTask();
                }



                else if (sing_song == true) {
                    console.log("sing_song is true at this point");
                    if (exitingCode == false) {

                        if (alreadyLearntSong == true) {
                            console.log("About to sing an already learnt song.");

                            if (singingForFirstTime == true) {
                                if (song_name !== null) {
                                    singingForFirstTime = false;
                                    musicOptions.path = './midi2voice/learntSongs/' + song_name + ".wav";
                                    player.play(musicOptions).then(function () {


                                        var songIndex = getSongIndex(song_name);
                                        switch (songSavedClass[songIndex].emotion) {
                                            case "sadness": songSavedClass[songIndex].agentEmotion = rio_sadness;
                                                break;
                                            case "joy": songSavedClass[songIndex].agentEmotion = rio_joy;
                                                break;
                                            case "fear": songSavedClass[songIndex].agentEmotion = rio_fear;
                                                break;
                                            case "disgust": songSavedClass[songIndex].agentEmotion = rio_disgust;
                                                break;
                                            case "anger": songSavedClass[songIndex].agentEmotion = rio_anger;
                                                break;
                                            case "surprise": songSavedClass[songIndex].agentEmotion = rio_surprise;
                                        }

                                        cancelSingingTask();
                                    })
                                }
                                else {
                                    console.error('Error: Pretrained singing cannot start when song_name is null.');

                                    cancelSingingTask();
                                }
                            }
                        }

                        else {

                            if (singingForFirstTime == true) {

                                if (song_name !== null) {

                                    listenToSong();
                                    console.log('Started learning and listening to new song.');

                                    if (frontendIncoming.song_incoming.text !== null) {
                                        setTimeout(function () {
                                            frontendIncoming.song_incoming.text = "learnStart";
                                        }, communicationDelay)
                                    }
                                    else {
                                        frontendIncoming.song_incoming.text = "learnStart";
                                    }
                                    singingForFirstTime = false;
                                }

                                else {

                                    if (songNameAskedForFirstTime == true) {
                                        console.log("Song name asked for the first time.");
                                        responseText += "Please tell me the name of the song.";
                                        songNameAskedForFirstTime = false;
                                    }

                                    else if (msgInLowercase.length !== 0) {
                                        console.log("Setting the song name now.")
                                        let extractedSongName;
                                        if (msgInLowercase.includes(" it's ")) {
                                            extractedSongName = msgInLowercase.slice(msgInLowercase.lastIndexOf(" it's ") + 6);
                                        }
                                        else if (msgInLowercase.includes(" its ")) {
                                            extractedSongName = msgInLowercase.slice(msgInLowercase.lastIndexOf(" its " + 5));
                                        }
                                        else if (msgInLowercase.includes(" is ")) {
                                            extractedSongName = msgInLowercase.slice(msgInLowercase.lastIndexOf(" is ") + 4)
                                        }

                                        if (extractedSongName == undefined) {

                                            function inWords(num) {
                                                if (num == 0) return 'zero'
                                                var a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
                                                var b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
                                                if ((num = num.toString()).length > 9) return 'overflow';
                                                n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
                                                if (!n) return; var str = '';
                                                str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
                                                str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
                                                str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
                                                str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
                                                str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + '' : '';
                                                return str;
                                            }
                                            song_name = 'song ' + inWords(songSavedClass.length);
                                            responseText += "OK I'll be giving my own name to the song, " + song_name + '. Please start singing.';
                                            console.log("Set the song name  to ", song_name)
                                        }
                                        else {
                                            song_name = extractedSongName;
                                            responseText += "OK got it. I'll save the song by the name, " + song_name + '. Please start singing.';
                                            console.log("Set the song name  to ", song_name)
                                        }
                                    }
                                }
                            }
                        }
                    }
                    else console.error("Singing is not executed as code is being exited.");
                }

            }


            else if (msg.toLowerCase().includes(terminate_Word) == false) {

                if (systemCommand == false) {


                    var referringToUs = false;
                    if (msg.length != 0) {

                        if (msg.includes(agentName)) {
                            if (msg.includes(" " + agentName + " "))
                                msg = msg.replace(" " + agentName + " ", "")
                            else msg = msg.replace(" " + agentName, " ");
                            referringToUs = true;
                        }


                        current_index = getPersonIndex(currentSpeaker);

                        if (countWords(msg) >= min_words_NLU) nlu(msg);

                        if (Object.keys(agentPersonality).length === 0 && agentPersonality.constructor === Object) getPersonality();
                        else getRobotPersonality();
                    }

                    if (referringToUs == true) {


                        if (msg.includes("teach a song")) {
                            console.log("Singing action has been liked.")
                            SpecialAbility = true;
                            sing_song = true;

                            if (msg.includes("learn") || msg.includes("teach")) {
                                alreadyLearntSong = false;
                                song_name = null;

                                if (msg.includes("don't") == false || msg.includes("do not") == false ||
                                    msg.includes("cannot") == false || msg.includes("can't") == false ||
                                    msg.includes("not") == false || msg.includes("shouldn't") == false ||
                                    msg.includes("musn't") == false
                                    && msg.includes("improvise") || msg.includes("creat") || msg.includes("modify") ||
                                    msg.includes("add") || msg.includes("change")) {
                                    singOriginalSong = true;
                                }
                                else singOriginalSong = false;
                            }

                            else if (msg.includes("you") && msg.includes("like") || msg.includes("choice")
                                || msg.includes("choose") || msg.includes("love")) {
                                alreadyLearntSong = true;
                                song_name = chooseSong();

                                if (song_name == 'uncertain_state') {
                                    responseText += "I am totally uncertain which song to choose.";
                                    cancelSingingTask();
                                }
                                else if (song_name == 'noSongInMemory') {
                                    responseText += "I don't remember any songs right now.";
                                    cancelSingingTask();
                                }
                            }
                            else {

                                for (var i = 0; i <= songSavedClass.length - 1; i++) {
                                    if (msg.includes(songSavedClass[i].name)) {
                                        alreadyLearntSong = true;
                                        song_name = songSavedClass[i].name;
                                        break;
                                    }
                                }

                                if (song_name == null) {

                                    var dec = emotionalDecide("chooseOption_", null, null);

                                    if (dec.type == "action_liked") {
                                        alreadyLearntSong = true;
                                        song_name = chooseSong();
                                    }

                                    else {
                                        responseText += "I don't want to choose a song. Please tell me the song you want me to sing";
                                        cancelSingingTask();
                                    }
                                }
                            }
                        }
                        else {
                            mainResponse(msg);
                        }
                    }

                    else {

                        if (msg.length != 0 && personsPresent.length != 0) {
                            if (current_index !== null) {




                                updateSinglePersonData(currentSpeaker, "memoryText", msg);

                                const thisLastIndex = personsPresent[current_index].relatedAbstracts.length - 1;

                                const thisObjects = personsPresent[current_index].relatedAbstracts[thisLastIndex]

                                var matchedObjects = new Array(0);
                                var unmatchedObjects = new Array(0);
                                let speechRelated = "";

                                var matched = false;

                                var indexOfQuestioner;


                                for (var i = 0; i <= personsPresent.length - 1; i++) {

                                    if (current_index !== i) {
                                        for (var j = personsPresent[i].relatedAbstracts.length - 1; j >= 0; j--) {
                                            let thisMatchedObjects = new Array(0);
                                            let thisUnmatchedObjects = new Array(0);

                                            let currentObjects = personsPresent[i].relatedAbstracts[j];
                                            for (var d = 0; d <= currentObjects.length - 1; d++) {
                                                var currentMatch = false;
                                                for (var k = 0; k <= thisObjects.length - 1; k++) {

                                                    if (thisObjects[k] == currentObjects[d]) {
                                                        thisMatchedObjects.push(thisObjects[k]);
                                                        currentMatch = true;
                                                    }
                                                }

                                                if (currentMatch == false) thisUnmatchedObjects.push(currentObjects[j]);
                                            }

                                            if (thisMatchedObjects.length / thisObjects.length > similarityThreshold) {
                                                indexOfQuestioner = i;
                                                speechRelated = personsPresent[i].personSpeechArray[j];
                                                matchedObjects = thisMatchedObjects;
                                                unmatchedObjects = thisUnmatchedObjects;
                                                matched = true;
                                                break;
                                            }
                                        }
                                        if (matched == true) break;
                                    }
                                }

                                if (matched == true && indexOfQuestioner !== undefined
                                    && matchedObjects.length + unmatchedObjects.length > objLength && speechRelated.length !== 0) {

                                    var objString = matchedObjects;

                                    while (objString.length > objLength) {

                                        objString.pop();
                                    }

                                    var m = 0;
                                    while (objString.length < objLength) {

                                        objString.push(unmatchedObjects[m++]);
                                    }

                                    var obj = stringArrToNumeric(objString);
                                    var speechArray = stringToArray(speechRelated);
                                    var numericSpeechArray = stringArrToNumeric(speechArray);

                                    while (numericSpeechArray.length > wordLength) {

                                        numericSpeechArray.pop();
                                    }

                                    while (numericSpeechArray.length < wordLength) {
                                        numericSpeechArray.push(numericSpeechArray[m]);
                                        if (m == numericSpeechArray.length - 1) m = 0;
                                        else m++;
                                    }

                                    var QuestionerEmotion = personsPresent[indexOfQuestioner].toneEmotion.slice(0);

                                    var AnswererEmotion = personsPresent[current_index].toneEmotion.slice(0);

                                    var learObj = [obj, numericSpeechArray, QuestionerEmotion, AnswererEmotion];

                                    VerbalLearn(learObj.slice(0), msg);
                                }
                            }
                        }
                    }

                    if (ifIdle == true) {
                        if (idleStartTime - currentTime >= maxTaskWait) {
                            let waitDecision = emotionalDecide('wait_', null, null);
                            if (waitDecision.type == 'action_liked') {

                                const percentDec = 0.80;
                                const percentInc = 1.20;
                                let wait_stimulus = {
                                    label: 'wait_stimulus_',
                                    sadness: rio_sadness * percentDec,
                                    joy: rio_joy * percentDec,
                                    fear: rio_fear * percentDec,
                                    disgust: rio_disgust * percentInc,
                                    anger: rio_anger * percentInc,
                                    surprise: rio_surprise * percentDec,
                                    timesOccurred: 1, totalTimesUsed: 1,
                                    isProhibited: false,
                                    openness: agentBigFive.openness,
                                    conscientiousness: agentBigFive.conscientiousness,
                                    extraversion: agentBigFive.extraversion,
                                    agreeableness: agentBigFive.agreeableness,
                                    neuroticism: agentBigFive.neuroticism,
                                    relatedTasks: [],
                                    relatedStimuli: [],
                                    relatedPeople: [],
                                    time: currentTime,
                                    indexUnderLabel: 0
                                }
                                otherObjects.push(wait_stimulus)
                                idleStartTime = currentTime;
                            }
                            else {
                                let choice = emotionalDecide('chooseOption_', rememberedTasks, null);
                                if (choice.type == 'multi_option_type' || choice.type == 'single_option_type') {

                                    if (choice.subtype !== 'options_not_selected' && choice.subtype !== 'options_unknown' && choice.subtype !== 'uncertain_state'
                                        && choice.subtype !== 'option_not_selected' && choice.subtype !== 'option_unknown') {
                                        let chosenTask = (choice.type == 'single_option_type') ? rememberedTasks[0] : choice.subtype;
                                        switch (chosenTask) {

                                            case 'singing_':
                                                var song = chooseSong(true);
                                                if (song != "uncertain_state" && song != 'noSongsInMemory') {

                                                    startSingingTask(song, true)
                                                }
                                                else console.error('Error: Singing task cannot be performed because chooseSong() returns inappropriate values.')
                                                break;
                                        }
                                    }

                                    else idleStartTime = currentTime;
                                }
                                else idleStartTime = currentTime;
                            }
                        }
                    }

                    if (exitingCode == false) {
                        if (personsPresent.length !== 0 && servoDegrees.length !== 0) {
                            let persIndex = getPersonIndex(currentPerson);
                            if (persIndex !== null) {

                                if (checkEmotionDiff(personsPresent[persIndex].visualEmotion, lastPoseLearnEmotion, 'poseLearn') || checkEmotionDiff(personsPresent[persIndex].toneEmotion, lastPoseLearnEmotion, 'poseLearn')) {

                                    if (persIndex !== startingPersonIndex && startingEmotion.length == 0 && startingPose.length == 0) {

                                        if (currentTime - personsPresent[persIndex].lastTimeUpdated >= toneEmotionThresholdTime)
                                            startingEmotion = personsPresent[persIndex].visualEmotion.slice();
                                        else startingEmotion = personsPresent[persIndex].toneEmotion.slice();

                                        startingPose = servoDegrees;
                                        startingPersonIndex = persIndex;
                                        startingTime = currentTime;
                                    }

                                    else if (persIndex == startingPersonIndex && startingEmotion.length !== 0 && startingPose.length !== 0) {
                                        let currentPersEmotion;
                                        if (currentTime - personsPresent[persIndex].lastTimeUpdated >= toneEmotionThresholdTime)
                                            currentPersEmotion = personsPresent[persIndex].visualEmotion;
                                        else currentPersEmotion = personsPresent[persIndex].toneEmotion;

                                        if (checkSuffEmDiff(currentPersEmotion, startingEmotion) == true) {

                                            let poseInterval = currentTime - startingTime;

                                            let poseResponseObj = {
                                                startingPose: startingPose.slice(0),
                                                endingPose: servoDegrees.slice(0),
                                                poseInterval: poseInterval,
                                                endingEmotion: currentPersEmotion.slice(0),
                                                openness: personsPresent[persIndex].openness,
                                                conscientiousness: personsPresent[persIndex].conscientiousness,
                                                extraversion: personsPresent[persIndex].extraversion,
                                                agreeableness: personsPresent[persIndex].agreeableness,
                                                neuroticism: personsPresent[persIndex].neuroticism
                                            }
                                            poseResponseData.push(poseResponseObj);

                                            let thisStartEmotion = startingEmotion.slice(0);
                                            if (frontendIncoming.pose_incoming.text !== null) {
                                                setTimeout(function () {
                                                    frontendIncoming.pose_incoming.json = thisStartEmotion;
                                                    frontendIncoming.pose_incoming.text = 'learn';
                                                }, communicationDelay)
                                            }
                                            else {
                                                frontendIncoming.pose_incoming.json = thisStartEmotion;
                                                frontendIncoming.pose_incoming.text = 'learn';
                                            }
                                            console.log("Learnt new pose with the following data: ", poseResponseObj);
                                            console.log("New pose response object: ", poseResponseData)
                                            lastPoseLearnEmotion = startingEmotion.slice(0);
                                            startingEmotion.length = 0;
                                            startingPose.length = 0;
                                            startingPersonIndex = null;
                                        }

                                    }
                                    else console.error("Backend Error: Pose learning syntax error for person: ", personsPresent[persIndex].name);
                                }
                            }
                            function checkSuffEmDiff(emAr1, emAr2) {
                                const emDiffThreshold = 0.3;
                                if (Math.abs(emAr1[0] - emAr2[0]) >= emDiffThreshold || Math.abs(emAr1[1] - emAr2[1]) >= emDiffThreshold || Math.abs(emAr1[2] - emAr2[2]) >= emDiffThreshold ||
                                    Math.abs(emAr1[3] - emAr2[3]) >= emDiffThreshold || Math.abs(emAr1[4] - emAr2[4]) >= emDiffThreshold || Math.abs(emAr1[5] - emAr2[5]) >= emDiffThreshold) {
                                    return true;
                                }
                                else return false;
                            }
                        }
                    }
                    else console.error("Pose learning not being executed because code is being exited.");

                    if (trackingFace == false && headDegrees.x !== null && headDegrees.y !== null) {

                        if (currentTime - trackingStopTime >= trackWaitDuration && currentSpeaker !== undefined) {
                            var trackFace = emotionalDecide('trackFace_', null, currentSpeaker);
                            if (trackFace.type == 'action_liked') {
                                trackingFace = true;
                                ignoringFace = false;
                                trackingStartTime = currentTime;
                                console.log("Decided to track face of", currentSpeaker)
                            }
                            else if (trackFace.type == 'action_unknown') {
                                console.error('Error: Predefined action trackFace_ is unknown.')
                            }
                            else {
                                let ignoreFace = emotionalDecide('ignoreFace_', null, currentSpeaker);
                                if (ignoreFace.type == 'action_liked') {
                                    trackingFace = true;
                                    ignoringFace = true;
                                    trackingStartTime = currentTime;
                                    console.log("Decided to ignore face of", currentSpeaker)
                                }
                                else if (ignoreFace.type == 'action_unknown') {
                                    console.error('Error: Predefined action ignoreFace_ is undefined.');
                                }
                                else {
                                    trackingStopTime = currentTime;

                                }
                            }
                        }
                    }

                    else {

                        if (currentTime - trackingStartTime >= trackingDuration) {
                            trackingFace = false;
                            ignoringFace = false;
                            trackingStopTime = currentTime;
                        }

                        else {

                            let sendString = String('X' + headDegrees.x + 'Y' + headDegrees.y);
                            if (ignoringFace == true) {
                                sendString += 'I'
                            }
                            else sendString += 'T'
                            sendFaceTrackerArduino(sendString);
                        }
                    }
                }
                else {

                    systemCommand = false;
                }
            }



            handleProbableObjects();
            taskHandler();
            receiveEmotionalStatus();
            getMaxEmotion();
            getMaxEmotionScore();

            newUpdateSTM();
            otherComms();



            if (responseText.length != 0) {

                if (emotionAltered == false) {
                    emotionAlter('verbal', true, responseText, false, false);
                }
                emotionAltered = false;

                agentSpeech += " " + responseText;

            }

            if (sing_song == true) {

                if (otherObjects.length != 0)
                    sendOtherObjects();
            }
            else {

                if (objects.length != 0)
                    updateVerbalObjects(current_index);

                if (otherObjects.length != 0)
                    sendOtherObjects();
            }

            msg = "";
            msgInLowercase = "";


            if (lastSaveTime == undefined)
                lastSaveTime = currentTime;
            else {
                if ((currentTime - lastSaveTime) / 1000 >= saveTime) {

                    lastSaveTime = currentTime;


                    if (testMode == false) saveAllData(false);
                }
            }
        }
        else {

            if (firstTimeNetLost == true) {
                console.error(`Internet Connectivity lost. Backend stopped temporarily and will continue automatically once the system is online`);
                firstTimeNetLost = false;

            }
        }
    });
}
function checkEmotionDiff(currentEmotion, givenEmotion, type) {
    if (givenEmotion.length == 0)
        return true;
    else {
        if (type == 'poseLearn') {
            for (var m = 0; m < 6; m++) {
                if (Math.abs(currentEmotion[m] - givenEmotion[m]) >= poseLearnEmDiff)
                    return true;
            }
            return false;
        }
        else if (type == 'visualLearn') {
            for (var m = 0; m < 6; m++) {
                if (Math.abs(currentEmotion[m] - givenEmotion[m]) >= visualLearnEmDiff)
                    return true;
            }
            return false;
        }
    }
}
function generateStringfromArray(orig_array) {

    var output_string;
    if (orig_array == undefined) {
        output_string = "none";
    }
    else if (orig_array.length == 0) {
        output_string = "none";
    }
    else if (orig_array.length == 1) {
        output_string = orig_array[0];
    }
    else if (orig_array.length == 2) {
        output_string = orig_array[0] + " and " + orig_array[1];
    }
    else if (orig_array.length == 3) {
        output_string = orig_array[0] + ", " + orig_array[1] + " and " + orig_array[2];
    }
    else if (orig_array.length == 4) {
        output_string = orig_array[0] + ", " + orig_array[1] + ", " + orig_array[2] + " and " + orig_array[3];
    }
    else if (orig_array.length == 5) {
        output_string = orig_array[0] + ", " + orig_array[1] + ", " + orig_array[2] + ", " + orig_array[3] + " and " + orig_array[4];
    }
    else if (orig_array.length == 6) {
        output_string = orig_array[0] + ", " + orig_array[1] + ", " + orig_array[2] + ", " + orig_array[3] + ", " + orig_array[4] + " and " + orig_array[5];
    }
    else {
        output_string = orig_array[0] + ", " + orig_array[1] + ", " + orig_array[2] + ", " + orig_array[3] + ", " + orig_array[4] + ", " + orig_array[5] + " and a few other things too."
    }
    return output_string;

}
async function WAssistant(inText, checkIntent) {

    if (ifConnected == true) {

        if (checkIntent == undefined || checkIntent == null) checkIntent = false;
        console.log("Watson Assistant is being executed for text: ", inText);
        var params = {
            workspaceId: WatsonAssistant_credentials.workspaceIdG,
            input: { 'text': inText },
        }
        function analyseWAssistant(assistant_JSON, ifCheck) {

            let assistant_text = assistant_JSON.result.output.text[0];
            assistant_intents.length = 0;

            assistant_JSON.result.intents.forEach(element => {
                assistant_intents.push(element.intent);
            });

            assistant_JSON.result.entities.forEach(element => {
                entitiesInText.push(element.entity);
            });

            while (entitiesInText.length > 20) {
                entitiesInText.shift();
            }

            if (ifCheck == true) {
                if (assistant_intents.length != 0) {
                    intentSpecificResponse(assistant_intents[0], inText, currentSpeaker, assistant_text);
                }
                else {
                    console.log("No intents detected. Watson assistant general response: ", assistant_text);
                    responseText += assistant_text;
                }
            }

            else {
                console.log("Watson Assistant general response: ", assistant_text)
                responseText += assistant_text;
            }
        }
        Assistant.message(params)
            .then(output => {
                analyseWAssistant(output, checkIntent);
            })
            .catch(() => {
                console.log('Error in Assistant first attempt. Changing Credentials.');
                changeCredentialsAssistant();

                Assistant.message(params)
                    .then(res => {
                        analyseWAssistant(res, checkIntent);
                    })
                    .catch(err => console.error("Backend Error: Error in Watson Assistant: ", err))
            })
    }
    else console.error("Backend Error: Error: Watson Assistant cannot be implemented because of no internet connection.");
}
function intentSpecificResponse(givenIntent, inputText, givenSpeaker, givenText) {
    console.log("received commanding intent:", givenIntent);
    switch (givenIntent) {
        case 'visual_recognition':
            var decisionMade = emotionalDecide('sayWhatSeen_', null, givenSpeaker);

            if (decisionMade.type == "speaker_not_liked")
                responseText += "I don't like you. So I won't do as you say.";
            else if (decisionMade.type == "action_not_liked")
                responseText += "I don't want to do that right now.";
            else if (decisionMade.type == "action_liked") {

                var visualObjects = new Array(0);
                if (inputText.includes(" no") == false && inputText.includes(" don't ") == false
                    || inputText.includes("people") || inputText.includes("person")
                    || inputText.includes("who")) {
                    visualObjects = visualDetectKnownPersons;
                }

                else if (inputText.includes(" no") == false || inputText.includes(" don't") == false
                    || inputText.includes("things") || inputText.includes("objects")) {

                    visualObjects = customVisualClass;
                    visualObjects = visualObjects.concat(detectedObjects);
                }

                else {
                    visualObjects = visualDetectKnownPersons;
                    visualObjects = visualObjects.concat(customVisualClass, detectedObjects);
                }

                responseText += "I see " + generateStringfromArray(visualObjects.filter(el => {
                    return el.includes('picture_') == false
                })) + ".";
            }
            else {
                console.error("Backend Error: sayWhatSeen_ predefined action is unknown.");
                responseText += "I don't know how to do that action.";
            }
            break;
        case 'personality_analysis':
            var decisionMade = emotionalDecide("sayPersonality_", null, givenSpeaker);
            if (decisionMade.type == "speaker_not_liked")
                responseText += "Since I don't like you, I won't do as you said";
            else if (decisionMade.type == "action_not_liked")
                responseText += "I won't like to do that now.";
            else if (decisionMade.type == "action_liked") {

                if (inputText.includes("my") || inputText.includes("mine")) {


                    var yourIndex = getPersonIndex(givenSpeaker);
                    if (yourIndex == null) console.error("Backend Error: Personality response speaker, ", givenSpeaker, " does not exists in memory");
                    var yourPersonality = personsPresent[yourIndex].personalityResponse;
                    responseText += personality_summary(yourPersonality, true);
                }

                else if (inputText.includes("his") || inputText.includes("him")) {
                    if (hisVariable.name == null)
                        responseText += "I don't understand, who are you referring to?";
                    else {


                        var hisPersonality = memoryRet('peopleData', hisVariable.name)
                        if (hisPersonality != undefined && hisPersonality.personalityResponse != undefined) {
                            responseText += "About " + hisVariable.name + ", I feel that " +
                                personality_summary(hisPersonality.personalityResponse, true, 'him');
                        }
                        else {

                            responseText += "I don't know him well. So I cannot tell you his personality";
                        }
                    }
                }

                else if (inputText.includes("her")) {
                    if (herVariable.name == null)
                        responseText += "I don't understand, whom you are referring to."
                    else {
                        var herPersonality = memoryRet('peopleData', herVariable.name)
                        if (herPersonality == undefined || herPersonality.personalityResponse == null) {
                            responseText += "I don't know her that well, So I cannot tell her personality.";
                        }
                        else {
                            responseText += "About " + herVariable.name + ", I feel that "
                                + personality_summary(herPersonality.personalityResponse, true, "her");
                        }
                    }
                }

                else if (inputText.includes("your")) {
                    responseText += "I think that " + personality_summary(agentPersonality, true, "I");
                }

                else {

                    var personFound = null;
                    for (var i = 0; i <= entitiesInText.length - 1; i++) {
                        var currentPersonData = memoryRet('peopleData', entitiesInText[i]);
                        if (currentPersonData != undefined) {
                            personFound = currentPersonData;
                            break
                        }
                    }
                    if (personFound != null) {
                        if (personFound.personalityResponse != undefined && personFound.personalityResponse != null) {
                            responseText += personFound.name + ", I feel that " + personality_summary(personFound.personalityResponse, true);
                        }
                        else
                            responseText += "I haven't got a chance to know the person well, so I don't know what to say.";
                    }
                    else
                        responseText += "I don't understand. Whose personality do you want me to say?";
                }
            }
            else {
                responseText += "I don't know how to do that action."
                console.error("Backend Error: emotional decision for predefined sayPersonality_ is ", decisionMade.type);
            }
            break;

        case 'sing':
            var decision = emotionalDecide("singSong_", null, givenSpeaker);
            switch (decision.type) {
                case "action_not_liked":
                    responseText += "I don't want to do that right now";
                    break;
                case "speaker_not_liked":
                    responseText += "I don't like who has asked me to sing. So I won't be singing";
                    break;
                case "action_liked":
                    console.log("Singing action has been liked.")
                    SpecialAbility = true;
                    sing_song = true;

                    if (inputText.includes("learn") || inputText.includes("teach")) {
                        alreadyLearntSong = false;
                        song_name = null;

                        if (inputText.includes("don't") == false || inputText.includes("do not") == false ||
                            inputText.includes("cannot") == false || inputText.includes("can't") == false ||
                            inputText.includes("not") == false || inputText.includes("shouldn't") == false ||
                            inputText.includes("musn't") == false
                            && inputText.includes("improvise") || inputText.includes("creat") || inputText.includes("modify") ||
                            inputText.includes("add") || inputText.includes("change")) {
                            singOriginalSong = true;
                        }
                        else singOriginalSong = false;
                    }

                    else if (inputText.includes("you") && inputText.includes("like") || inputText.includes("choice")
                        || inputText.includes("choose") || inputText.includes("love")) {
                        alreadyLearntSong = true;
                        song_name = chooseSong();

                        if (song_name == 'uncertain_state') {
                            responseText += "I am totally uncertain which song to choose.";
                            cancelSingingTask();
                        }
                        else if (song_name == 'noSongInMemory') {
                            responseText += "I don't remember any songs right now.";
                            cancelSingingTask();
                        }
                    }
                    else {

                        for (var i = 0; i <= songSavedClass.length - 1; i++) {
                            if (inputText.includes(songSavedClass[i].name)) {
                                alreadyLearntSong = true;
                                song_name = songSavedClass[i].name;
                                break;
                            }
                        }

                        if (song_name == null) {

                            var dec = emotionalDecide("chooseOption_", null, null);

                            if (dec.type == "action_liked") {
                                alreadyLearntSong = true;
                                song_name = chooseSong();
                            }

                            else {
                                responseText += "I don't want to choose a song. Please tell me the song you want me to sing";
                                cancelSingingTask();
                            }
                        }
                    }
                    break;
                default: console.error("Backend Error: Predefined action singSong_ is unknown.");
            }
            break;
        default: responseText += givenText;
    }
}
async function personality_analysis(inText) {
    var profileParams = {
        content: inText,
        contentType: 'text/plain',
        consumptionPreferences: false
    };
    var jsonResponse = undefined;
    if (ifConnected == true) {

        jsonResponse = await personalityInsights.profile(profileParams)
            .catch(err => console.error('Error: Personality Insights first attempt failed: ', err))

        if (jsonResponse == undefined && changedPIcredentials == false) {
            changeCredentialsPers();
            changedPIcredentials = true;
            jsonResponse = await personalityInsights.profile(profileParams)
                .catch(err => console.error('Error: Personality Insights second attempt failed: ', err))
        }

        else if (jsonResponse !== undefined) {
            if (changedPIcredentials == true) changedPIcredentials = false;
            jsonResponse = jsonResponse.result;
        }

        else console.error('Error: Error in Personality Insights even after changing credentials once.')
    }
    else console.error('Error: Personality analysis cannot be done because of NO INTERNET.')
    return jsonResponse;
}
function personality_summary(personality_JSON, reduceSummary, reference) {

    var personality_summary = v3EnglishTextSummaries.getSummary(personality_JSON);

    if (typeof (personality_summary) !== 'string')
        console.error("Backend Error: personality summary error");
    else {

        if (reduceSummary == undefined || reduceSummary == null)
            reduceSummary = false;
        if (reduceSummary == true) {
            personality_summary = function (inText) {
                var outText = inText.slice(0, last_PA_position);
                var period_position = outText.lastIndexOf(".");
                outText = outText.slice(0, period_position);
                return outText;
            }
        }

        if (reference == "he") {
            personality_summary = personality_summary.replace("You are ", "He is ");
            personality_summary = personality_summary.replace("you are ", "he is ");
            personality_summary = personality_summary.replace("Yours ", "His ");
            personality_summary = personality_summary.replace("yours ", "his ");
            personality_summary = personality_summary.replace("Your ", "His ");
            personality_summary = personality_summary.replace("your ", "his ");
            personality_summary = personality_summary.replace("You ", "Him ");
            personality_summary = personality_summary.replace("you ", "him ");
        }
        else if (reference == "her") {
            personality_summary = personality_summary.replace("You are ", "She is ");
            personality_summary = personality_summary.replace("you are ", "she is ");
            personality_summary = personality_summary.replace("Yours ", "Hers ");
            personality_summary = personality_summary.replace("yours ", "hers ");
            personality_summary = personality_summary.replace("Your ", "Her ");
            personality_summary = personality_summary.replace("your ", "her ");
            personality_summary = personality_summary.replace("You ", "Her ");
            personality_summary = personality_summary.replace("you ", "her ");
        }
        else if (reference == "I" || reference == "i") {
            personality_summary = personality_summary.replace("You are ", "I am ");
            personality_summary = personality_summary.replace("you are ", "I am");
            personality_summary = personality_summary.replace("Yours ", "Mine ");
            personality_summary = personality_summary.replace("yours ", "mine ");
            personality_summary = personality_summary.replace("Your ", "My ");
            personality_summary = personality_summary.replace("your ", "my ");
            personality_summary = personality_summary.replace("You ", "Me ");
            personality_summary = personality_summary.replace("you ", "me ");
        }
        else {
            return personality_summary;
        }
    }
}
function nlu(input_text) {
    const limitForFeature = 2;
    var analyzeParams = {
        'text': input_text,

        'features': {
            'categories': {
                'limit': limitForFeature
            },
            'concepts': {
                'limit': limitForFeature
            },
            'emotion': {
                'limit': limitForFeature
            },
            'entities': {
                'limit': limitForFeature
            },
            'keywords': {
                'limit': limitForFeature
            },
            'sentiment': {
                'limit': limitForFeature
            }
        }
    };
    if (ifConnected == true) {

        naturalLanguageUnderstanding.analyze(analyzeParams)
            .then(data => {
                generateEmotionsFromNLU(data.result, currentSpeaker, input_text)
            })
            .catch(err => {

                console.error('Error: Error in NLU first attempt: ', err, ' \nChanging NLU model...');
                changeCredentialsNLU();
                naturalLanguageUnderstanding.analyze(analyzeParams)
                    .then(result => {
                        generateEmotionsFromNLU(result.result, currentSpeaker, input_text)
                    })
                    .catch(err => console.error('Error: Error in NLU processing: ', err))
            })
    }
    else console.error('Error: NLU cannot be executed because of NO INTERNET.');
}
async function setCredentials() {


    prevPers = fs.readFileSync('./credentials/personalityData.txt', { encoding: 'utf8', flag: 'r' })
    prevPers = parseInt(prevPers);
    prevNLU = fs.readFileSync('./credentials/nluData.txt', { encoding: 'utf8', flag: 'r' })
    prevNLU = parseInt(prevNLU);
    prevAssis = fs.readFileSync('./credentials/WatsonAssistantData.txt', { encoding: 'utf8', flag: 'r' })
    prevAssis = parseInt(prevAssis);
    WatsonAssistant_credentials = credentials.WatsonAssistantCredentials[prevAssis];
    var personalityInsights_credentials = credentials.personalityInsightsCredentials[prevPers];
    var naturalLanguageUnderstanding_credentials = credentials.naturalLanguageUnderstandingCredentials[prevNLU];
    var personalityTextSummary_credentials = credentials.personalityTextSummary;

    v3EnglishTextSummaries = new PersonalityTextSummaries(personalityTextSummary_credentials);

    personalityInsights = new PersonalityInsightsV3({
        version: personalityInsights_credentials.version,
        authenticator: new IamAuthenticator({
            apikey: personalityInsights_credentials.iam_apikey
        }),
        disableSslVerification: true,
        url: personalityInsights_credentials.url
    });

    naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
        version: naturalLanguageUnderstanding_credentials.version,
        authenticator: new IamAuthenticator({
            apikey: naturalLanguageUnderstanding_credentials.iam_apikey,
        }),
        disableSslVerification: true,
        url: naturalLanguageUnderstanding_credentials.url
    });

    Assistant = new AssistantV1({
        version: WatsonAssistant_credentials.version,
        authenticator: new IamAuthenticator({
            apikey: WatsonAssistant_credentials.iam_apikey,
        }),
        disableSslVerification: true,
        url: WatsonAssistant_credentials.url
    });
}
function changeCredentialsAssistant() {
    console.log('Changing Assistant API credentials.');

    if (prevAssis < assistModules)
        prevAssis++;
    else prevAssis = 0;
    WatsonAssistant_credentials = credentials.WatsonAssistantCredentials[prevAssis];
    Assistant = new AssistantV1({
        version: WatsonAssistant_credentials.version,
        authenticator: new IamAuthenticator({
            apikey: WatsonAssistant_credentials.iam_apikey
        }),
        disableSslVerification: true,
        url: WatsonAssistant_credentials.url
    });

    fs.writeFile('./credentials/WatsonAssistantData.txt', String(prevAssis), function (err) {
        if (err) console.error('Error: Error updating credentials: ' + err);
        else console.log('Assistant API credentials updated.');
    });
}
function changeCredentialsPers() {
    console.log('Chaning Personality API credentials.');
    if (prevPers < personalityModules) prevPers++;
    else prevPers = 0;
    var personalityInsights_credentials = credentials.personalityInsightsCredentials[prevPers];
    personalityInsights = new PersonalityInsightsV3({
        version: personalityInsights_credentials.version,
        authenticator: new IamAuthenticator({
            apikey: personalityInsights_credentials.iam_apikey
        }),
        disableSslVerification: true,
        url: personalityInsights_credentials.url
    });

    fs.writeFile('./credentials/personalityData.txt', String(prevPers), function (err) {
        if (err) console.error('Error: Error updating credential:' + err);
        else console.log('Personality API credentials updated.');
    });
}
function changeCredentialsNLU() {
    console.log('Changing NLU API credentials.');
    if (prevNLU < nluModules) prevNLU++;
    else prevNLU = 0;
    var naturalLanguageUnderstanding_credentials = credentials.naturalLanguageUnderstandingCredentials[prevNLU];
    naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
        version: naturalLanguageUnderstanding_credentials.version,
        authenticator: new IamAuthenticator({
            apikey: naturalLanguageUnderstanding_credentials.iam_apikey,
        }),
        disableSslVerification: true,
        url: naturalLanguageUnderstanding_credentials.url
    });

    fs.writeFile('./credentials/nluData.txt', String(prevNLU), function (err) {
        if (err) console.error('Error: Error updating credentials: ' + err);
        else console.log('NLU API credentials updated.');
    });
}
function checkInternet(cb) {
    require('dns').lookup('google.com', function (err) {
        if (err && err.code == "ENOTFOUND") {
            ifConnected = false;
            cb(false);
        }
        else {
            ifConnected = true;
            cb(true);
        }
    })
}
async function analyze_FaceAPI(face_data) {

    visualDetectPersons = new Array(0);
    visual_gender.length = 0;
    visual_age.length = 0;
    visual_emotion.length = 0;

    for (var i = 0; i < face_data.length; i++) {

        visualDetectPersons[i] = face_data[i].name.slice(0, face_data[i].name.indexOf(" "));
        visual_gender[i] = face_data[i].gender;
        visual_age[i] = face_data[i].age;

        let currentVisualEmotion = new Array(6);
        currentVisualEmotion[0] = face_data[i].sadness;
        currentVisualEmotion[1] = face_data[i].joy;
        currentVisualEmotion[2] = face_data[i].fear;
        currentVisualEmotion[3] = face_data[i].disgust;
        currentVisualEmotion[4] = face_data[i].anger;
        currentVisualEmotion[5] = face_data[i].surprise;
        visual_emotion[i] = currentVisualEmotion;
    }
    for (var i = 0; i < visualDetectPersons.length; i++) {
        if (visualDetectPersons[i] !== 'unknown') {
            currentPerson = visualDetectPersons[i];
            break;
        }
    }

    visualDetectKnownPersons = visualDetectPersons.filter(function (el) {
        return el !== "unknown";
    });
    if (visualDetectKnownPersons.length !== 0) {
        personsName = [... new Set(personsName.concat(visualDetectKnownPersons))];
        updatePersonsPresent(true);
    }
}
function visual_learn(name, givenEmotion, learnStimulus, isProhibited) {

    if (exitingCode == false) {

        if (learnStimulus !== true) {
            if (name == null) {
                name = "picture_" + currentTime;

            }

            let origSadness, origJoy, origFear, origDisgust, origAnger, origSurprise;
            console.log("Visual Custom Learning being executed for ", name, " with emotion ", givenEmotion)

            var currentTime = new Date().getTime();

            if (givenEmotion == undefined || givenEmotion == null)
                givenEmotion = rio_max_emotion;

            let newRelatedTasks = {}
            rememberedTasks.forEach(el => {
                newRelatedTasks[el] = { count: 1 };
            })
            var saveData = {
                "label": name,
                "anger": defaultEmotionScore,
                "joy": defaultEmotionScore,
                "sadness": defaultEmotionScore,
                "fear": defaultEmotionScore,
                "disgust": defaultEmotionScore,
                "surprise": defaultEmotionScore,
                "timesOccurred": 1,
                "totalTimesUsed": 1,
                "isProhibited": (isProhibited == true) ? true : false,

                "openness": currentSpeaker !== undefined ? (personsPresent[getPersonIndex(currentSpeaker)].openness + agentBigFive.openness) / 2 : agentBigFive.openness,
                "conscientiousness": currentSpeaker !== undefined ? (personsPresent[getPersonIndex(currentSpeaker)].conscientiousness + agentBigFive.conscientiousness) / 2 : agentBigFive.conscientiousness,
                "extraversion": currentSpeaker !== undefined ? (personsPresent[getPersonIndex(currentSpeaker)].extraversion + agentBigFive.extraversion) / 2 : agentBigFive.extraversion,
                "agreeableness": currentSpeaker !== undefined ? (personsPresent[getPersonIndex(currentSpeaker)].agreeableness + agentBigFive.agreeableness) / 2 : agentBigFive.agreeableness,
                "neuroticism": currentSpeaker !== undefined ? (personsPresent[getPersonIndex(currentSpeaker)].neuroticism + agentBigFive.neuroticism) / 2 : agentBigFive.neuroticism,
                "relatedTasks": newRelatedTasks,
                "relatedStimuli": {},
                "relatedPeople": {},
                "time": currentTime,
                "indexUnderLabel": 0
            }
            if (typeof givenEmotion == 'string') {
                switch (givenEmotion) {
                    case "sadness":
                        saveData.sadness = (saveData.sadness + visualMax) / 2;
                        break;
                    case "joy":
                        saveData.joy = (saveData.joy + visualMax) / 2;
                        break;
                    case "fear":
                        saveData.fear = (saveData.fear + visualMax) / 2;
                        break;
                    case "disgust":
                        saveData.disgust = (saveData.disgust + visualMax) / 2;
                        break;
                    case "anger":
                        saveData.anger = (saveData.anger + visualMax) / 2;
                        break;
                    case "surprise":
                        saveData.surprise = (saveData.surprise + visualMax) / 2;
                        break;
                    default: console.error("Backend Error: givenEmotion (string) param of visual_learn() is invalid.")
                }
            }
            else if (Array.isArray(givenEmotion)) {
                if (testMode == true) {
                    origSadness = saveData.sadness;
                    origJoy = saveData.joy;
                    origFear = saveData.fear;
                    origDisgust = saveData.disgust;
                    origAnger = saveData.anger;
                    origSurprise = saveData.surprise;
                }
                saveData.sadness = (saveData.sadness + givenEmotion[0]) / 2;
                saveData.joy = (saveData.joy + givenEmotion[1]) / 2;
                saveData.fear = (saveData.fear + givenEmotion[2]) / 2;
                saveData.disgust = (saveData.disgust + givenEmotion[3]) / 2;
                saveData.anger = (saveData.anger + givenEmotion[4]) / 2;
                saveData.surprise = (saveData.surprise + givenEmotion[5]) / 2;
            }
            else console.error("Backend Error: givenEmotion param in visual_learn() for name ", name, " is invalid.");


            let memRead = memoryRet('longTerm', name.toLowerCase(), false, null, false, false, [], null, [], null);

            if (typeof memRead == 'object' && memRead !== null) {

                if (testMode == true) {
                    origSadness = memRead.data.sadness;
                    origJoy = memRead.data.joy;
                    origFear = memRead.data.fear;
                    origDisgust = memRead.data.disgust;
                    origAnger = memRead.data.anger;
                    origSurprise = memRead.data.surprise
                }
                saveData.sadness = (saveData.sadness + memRead.data.sadness) / 2;
                saveData.joy = (saveData.joy + memRead.data.joy) / 2;
                saveData.fear = (saveData.fear + memRead.data.fear) / 2;
                saveData.disgust = (saveData.disgust + memRead.data.disgust) / 2;
                saveData.anger = (saveData.anger + memRead.data.anger) / 2;
                saveData.surprise = (saveData.surprise + memRead.data.surprise) / 2;

                if (currentSpeaker !== undefined) {
                    saveData.openness = (saveData.openness + personsPresent[getPersonIndex(currentSpeaker)].openness) / 2;
                    saveData.conscientiousness = (saveData.conscientiousness + personsPresent[getPersonIndex(currentSpeaker)].conscientiousness) / 2;
                    saveData.extraversion = (saveData.extraversion + personsPresent[getPersonIndex(currentSpeaker)].extraversion) / 2;
                    saveData.agreeableness = (saveData.agreeableness + personsPresent[getPersonIndex(currentSpeaker)].agreeableness) / 2;
                    saveData.neuroticism = (saveData.neuroticism + personsPresent[getPersonIndex(currentSpeaker)]) / 2;
                }
                saveData.indexUnderLabel = memRead.data.indexUnderLabel;
            }
            var arrayIndex = customVisualClass.length;
            customVisualClass[arrayIndex] = name;
            if (frontendIncoming.visual_incoming.text !== null) {
                setTimeout(function () {
                    frontendIncoming.visual_incoming.text = 'learn';
                }, communicationDelay)
            }
            else {
                frontendIncoming.visual_incoming.text = 'learn';
            }

            otherObjects.push(saveData);
            memoryRet('longTerm', name.toLowerCase(), true, saveData, false);
            if (testMode == true) {
                let thisPerceptionChangeObj = {
                    stimulusName: name.toLowerCase(),
                    beforeAlteration: [origSadness, origJoy, origFear, origDisgust, origAnger, origSurprise],
                    afterAlteration: [saveData.sadness, saveData.joy, saveData.disgust, saveData.anger, saveData.surprise].slice(),
                    influence: weightedAverage([Math.abs(saveData.sadness - origSadness), Math.abs(saveData.joy - origJoy), Math.abs(saveData.fear - origFear),
                    Math.abs(saveData.disgust - origDisgust), Math.abs(saveData.anger - origAnger), Math.abs(saveData.surprise - origSurprise)])
                }
                perceptionChangeObjects.push(thisPerceptionChangeObj);
            }
        }

        else {
            if (name == undefined)
                console.error("Backend Error: Stimuli-inclined V Learn cannot be conducted with UNDEFINED name");
            else if (givenEmotion.length !== 6)
                console.error("Backend Error: Stimuli-inclined V learn cannot be conducted with inappropriate Emotions given.");
            else {
                console.log("Stimulus-inclined visual learn is being executed for ", name, " with emotion: ", givenEmotion);
                var arrayIndex = customVisualClass.length;
                customVisualClass[arrayIndex] = name;
                if (frontendIncoming.visual_incoming.text !== null) {
                    setTimeout(function () {
                        frontendIncoming.visual_incoming.text = 'learnStimulus';
                        frontendIncoming.visual_incoming.val = name;
                    }, communicationDelay)
                }
                else {
                    frontendIncoming.visual_incoming.text = 'learnStimulus';
                    frontendIncoming.visual_incoming.val = name;
                }
            }
        }
    }
    else console.error("Visual learning not done because code is being exited.");
}
function visual_delete(name) {
    var arrayIndex = customVisualClass.indexOf(name);
    if (arrayIndex == -1)

        console.error("Backend Error: The specified name does not exists in the known object variable.");
    else {

        if (frontendIncoming.visual_incoming.text !== null) {
            setTimeout(function () {
                frontendIncoming.visual_incoming.text = 'deleteSingle';
                frontendIncoming.visual_incoming.val = arrayIndex;
            }, communicationDelay)
        }
        else {
            frontendIncoming.visual_incoming.text = 'deleteSingle';
            frontendIncoming.visual_incoming.val = arrayIndex;
        }
        memoryRet('longTerm', name.toLowerCase(), true, 'delete', false)

        customVisualClass.splice(arrayIndex, 1)


    }
}
function visual_deleteALL() {



    customVisualClass.length = 0;

    if (frontendIncoming.visual_incoming.text !== null) {
        setTimeout(function () {
            frontendIncoming.visual_incoming.text = 'deleteAll';
        }, communicationDelay)
    }
    else {
        frontendIncoming.visual_incoming.text = 'deleteAll';
    }
}
function visual_save(saveFinal) {

    if (saveFinal == undefined || saveFinal == true) {

        if (frontendIncoming.visual_incoming.text !== null) {
            setTimeout(() => {
                frontendIncoming.visual_incoming.text = 'saveFinal';
            }, communicationDelay)
        }
        else frontendIncoming.visual_incoming.text = 'saveFinal';
    }
    else {
        if (frontendIncoming.visual_incoming.text !== null) {
            setTimeout(() => {
                frontendIncoming.visual_incoming.text = 'savePeriodic';
            }, communicationDelay)
        }
        else {
            frontendIncoming.visual_incoming.text = 'savePeriodic';
        }
    }
}
async function analyze_audioClassifier(predictions) {


    console.log("Audio classifier is running.");
    var last = audioEmotionArray.length - 1;
    if (audioEmotionArray[last] == null) {
        for (var i = last; i >= 0; i--) {
            if (audioEmotionArray[i] !== null) {
                last = i;
                break;
            }
        }
        if (i < 0) last = 0;
    }
    for (var i = last; i >= 1; i--) {
        audioEmotionArray[i] = audioEmotionArray[i - 1];
    }
    audioEmotionArray[0] = predictions;

    audioMaxEmotion = getMode(audioEmotionArray.filter(el => { return el !== null }));

    let thisObj = memoryRet('longTerm', audioMaxEmotion, false, null, false, false)
    if (thisObj !== undefined) otherObjects.push(thisObj.data);
}
function getMode(array) {
    if (array == undefined && array.length == 0)
        return undefined;
    var modeMap = {};
    var maxEl = array[0], maxCount = 1;
    for (var i = 0; i <= array.length - 1; i++) {
        var el = array[i];
        if (modeMap[el] == undefined || modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;
        if (modeMap[el] > maxCount) {
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
}
function audio_learn(emotion) {

    if (exitingCode == false) {
        console.log("Training the audio classifier to ", emotion);
        if (frontendIncoming.audio_incoming.text !== null) {
            setTimeout(function () {
                frontendIncoming.audio_incoming.text = "learn";
                frontendIncoming.audio_incoming.val = emotion;
            }, communicationDelay)
        }
        else {
            frontendIncoming.audio_incoming.text = "learn";
            frontendIncoming.audio_incoming.val = emotion;
        }
    }
    else console.error("Audio learning not done because code is being exited.");
}
function audio_save(saveFinal) {
    if (saveFinal == undefined || saveFinal == true) {
        if (frontendIncoming.audio_incoming.text !== null) {
            setTimeout(function () {
                frontendIncoming.audio_incoming.text = 'saveFinal';
            }, communicationDelay)
        }
        else {
            frontendIncoming.audio_incoming.text = 'saveFinal';
        }
    }
    else {
        if (frontendIncoming.audio_incoming.text !== null) {
            setTimeout(function () {
                frontendIncoming.audio_incoming.text = 'savePeriodic';
            }, communicationDelay)
        }
        else {
            frontendIncoming.audio_incoming.text = 'savePeriodic';
        }
    }
}
async function analyze_speakerIdentification(predictions) {


    var last = speakerIdArray.length - 1;
    if (speakerIdArray[last] == null) {
        for (var i = last; i >= 0; i--) {
            if (speakerIdArray[i] !== null) {
                last = i;
                break;
            }
        }
        if (i < 0) last = 0;
    }
    for (var i = last; i >= 1; i--)
        speakerIdArray[i] = speakerIdArray[i - 1];
    speakerIdArray[0] = speakerSavedClass[parseInt(predictions)];
    console.log("Instantaneous speaker: ", speakerIdArray[0]);

    currentSpeaker = getMode(speakerIdArray.filter(el => { return el !== null }));
    console.log("Mode speaker: ", currentSpeaker);

    var previousSpeaker = false;

    for (var i = 0; i <= personsName.length - 1; i++) {
        if (currentSpeaker == personsName[i]) {
            previousSpeaker = true;
            break;
        }
    }

    if (previousSpeaker == false) {
        personsName.push(currentSpeaker);

        personsName = [... new Set(personsName)];
        updatePersonsPresent();
    }
    else {

        var currentTime = new Date().getTime();
        updateSinglePersonData(currentSpeaker, "lastTimeSeen", currentTime);
    }
}
function speaker_learn(name) {
    if (exitingCode == false) {
        var arrayIndex = speakerSavedClass.length;
        speakerSavedClass[arrayIndex] = name;
        if (frontendIncoming.speaker_incoming.text !== null) {
            setTimeout(function () {
                frontendIncoming.speaker_incoming.text = 'learn';
            }, communicationDelay)
        }
        else {
            frontendIncoming.speaker_incoming.text = 'learn';
        }
    }
    else console.error("Speaker learning not done because code is being exited.");
}
function speaker_save(saveFinal) {
    if (saveFinal == undefined || saveFinal == true) {
        if (frontendIncoming.speaker_incoming.text !== null) {
            setTimeout(function () {
                frontendIncoming.speaker_incoming.text = 'saveFinal';
            }, communicationDelay)
        }
        else {
            frontendIncoming.speaker_incoming.text = 'saveFinal';
        }
    }
    else {
        if (frontendIncoming.speaker_incoming.text !== null) {
            setTimeout(function () {
                frontendIncoming.speaker_incoming.text = 'savePeriodic';
            }, communicationDelay)
        }
        else {
            frontendIncoming.speaker_incoming.text = 'savePeriodic';
        }
    }
}
function song_save(saveFinal) {
    if (saveFinal == undefined || saveFinal == true) {
        if (frontendIncoming.song_incoming.text !== null) {
            setTimeout(function () {
                frontendIncoming.song_incoming.text = 'saveFinal';
            }, communicationDelay)
        }
        else {
            frontendIncoming.song_incoming.text = 'saveFinal';
        }
    }
    else {
        if (frontendIncoming.song_incoming.text !== null) {
            setTimeout(function () {
                frontendIncoming.song_incoming.text = 'savePeriodic';
            }, communicationDelay)
        }
        else {
            frontendIncoming.song_incoming.text = 'savePeriodic';
        }
    }
}
async function analyze_songIdentification(data) {
    console.log("song id received: ", data);
    var last = songIdArray.length - 1;
    if (songIdArray[last] == null) {
        for (var i = last; i >= 0; i--) {
            if (songIdArray[i] !== null) {
                last = i;
                break;
            }
        }
        if (i < 0) last = 0;
    }
    for (var i = last; i >= 1; i--) {
        songIdArray[i] = songIdArray[i - 1];
    }
    songIdArray[0] = parseInt(data);
    var currentSongIndex = getMode(songIdArray.filter(el => { return el !== null }));;

    emotion_sphere.songEmotion(songSavedClass[currentSongIndex].emotion);
    getSongToShortTerm(songSavedClass[currentSongIndex].name);
}
function getSongToShortTerm(name) {

    var searchSong;

    if (name != undefined && name != null) searchSong = name;
    else searchSong = song_name;

    var matched = false;
    var index;
    for (var i = 0; i <= rememberedSongs.length - 1; i++) {

        if (rememberedSongs[i].name == searchSong) {
            index = i;
            matched = true;
            break;
        }
    }
    var currentTime = new Date().getTime();
    if (matched == true) {

        rememberedSongs[index].lastTimeHeard = currentTime;
    }

    else {
        let newSongIndex = getSongIndex(searchSong);
        rememberedSongs.push(songSavedClass[newSongIndex]);
    }

    for (var i = 0; i <= rememberedSongs.length - 1;) {
        if (rememberedSongs[i].lastTimeHeard - currentTime >= forgetTime) {
            rememberedSongs.splice(i, 1);
        }
        else i++;
    }
}
async function saveTheSong(singingModuleJSON) {

    let matched = false;
    if (currentSongDetails.songEmotion.replace("song_", "") == currentSongDetails.agentMaxEmotion)
        matched = true;
    var songObject = {
        "name": song_name,
        "audioClassifierEmotionLabel": currentSongDetails.songEmotion,
        "agentMaxEmotion": currentSongDetails.agentMaxEmotion,
        "agentEmotionScores": currentSongDetails.agentEmotionScores,
        "emotionMatched": matched,
        "lastTimeHeard": new Date().getTime()
    };

    currentSongDetails.agentEmotionScores = [];
    currentSongDetails.agentMaxEmotion = null;
    currentSongDetails.songEmotion = null;

    songSavedClass.push(songObject);
    exportToMidi(singingModuleJSON);
}
function createLyricsFile(lyrics) {
    fs.writeFile('./midi2voice/inputs/lyrics.txt', lyrics, function (err) {
        if (err)
            console.error('Error: Error exporting lyrics file: ' + err);
        else {
            console.log('Lyrics file exported successfully.');

        }
    })
}
async function exportToMidi(songArr) {
    if (songArr.length !== 0) {

        if (singOriginalSong == true) {
            let index = 0;
            var track = new MidiWriter.Track();
            while (index < songArr.length) {
                let matched = 1;
                let startingIndex = index;
                while (songArr[index] == songArr[index + 1]) {
                    index++;
                    matched++;
                }

                if (matched == 1)
                    index++;

                if (songArr[startingIndex] !== 'null') {
                    let note = new MidiWriter.NoteEvent({ pitch: [songArr[startingIndex]], duration: String(gap * matched) });
                    track.addEvent(note);
                }

                else {
                    let wait = new MidiWriter.NoteEvent({ wait: String(gap * matched) });
                    track.addEvent(wait);
                }
            }
            var write = new MidiWriter.Writer(track);
            fs.writeFileSync('./midi2voice/improvisedMidiUnits/0.mid', write.buildFile());
            if (adminMode) {
                await fetch('http://127.0.0.1:5010/voice', {
                    headers: jsonOptions,
                    method: "POST",
                    body: JSON.stringify({ convert: true })
                })
                await fetch('http://127.0.0.1:5010/reset', {
                    headers: jsonOptions,
                    method: "POST",
                    body: JSON.stringify({ reset: true })
                })
            }
            else {
                console.error("Cannot connect with voice server.")
            }

            fs.renameSync('./midi2voice/learntSongs/0.wav', `./midi2voice/learntSongs/${song_name}.wav`)

            cancelSingingTask();
        }

        else {
            let savedTimes = 0;
            let index = 0;
            var track = new MidiWriter.Track();
            let overallDuration = 0;
            const unitImproviseDuration = 4000;
            while (index < songArr.length) {
                let matched = 1;
                let startingIndex = index;
                while (songArr[index] == songArr[index + 1]) {
                    index++;
                    matched++;
                }

                if (matched == 1)
                    index++;
                let thisDuration = gap * matched;
                overallDuration += thisDuration;

                if (songArr[startingIndex] !== 'null') {
                    let note = new MidiWriter.NoteEvent({ pitch: [songArr[startingIndex]], duration: String(thisDuration) });
                    track.addEvent(note);
                }

                else {
                    let wait = new MidiWriter.NoteEvent({ wait: String(thisDuration) });
                    track.addEvent(wait);
                }
                if (overallDuration >= unitImproviseDuration) {
                    var write = new MidiWriter.Writer(track);
                    fs.writeFileSync('./midi2voice/inputs/song.mid', write.buildFile());
                    await fetch('http://192.168.137.43:4040/predict', {
                        headers: jsonOptions,
                        method: 'POST',
                        body: JSON.stringify({ improvise_song: true })
                    })
                        .then(res => res.blob())
                        .then(midiFile => {

                            fs.writeFileSync('./midi2voice/improvisedMidiUnits/' + savedTimes + '.midi', midiFile)
                            savedTimes++;
                        })
                        .catch(err => console.error('Error: Error in sending request to music improvisation server: ' + err));

                    track = new MidiWriter.Track();
                    overallDuration = 0;
                }
            }

            let saveCommand = 'C:/Program Files (x86)/sox-14-4-2/sox" ';
            if (adminMode) {
                for (var i = 0; i <= savedTimes; i++) {
                    await fetch('http://127.0.0.1:5010/voice', {
                        headers: jsonOptions,
                        method: "POST",
                        body: JSON.stringify({ convert: true })
                    })
                    saveCommand += './midi2voice/' + String(savedTimes) + '.wav ';
                }
                await fetch('http://127.0.0.1:5010/reset', {
                    headers: jsonOptions,
                    method: "POST",
                    body: JSON.stringify({ reset: true })
                })
            }
            console.error("Cannot connect with voice server.");
            saveCommand += `--combine concatenate ./midi2voice/learntSongs/${song_name}.wav norm`
            child_process.exec(saveCommand, function (err, stdout, stderr) {
                if (err) console.error('Error: Error in exiting RIO: ' + err);
                else console.log('Successfully saved newly learnt song in WAV format.');
            })

            for (var i = 0; i <= savedTimes; i++) {
                fs.unlinkSync(`./midi2voice/learntSongs/${i}.wav`);
            }

            cancelSingingTask();
        }
    }
    else console.error('Error: exportToMidi() cannot be executed as songArr has 0 length.');
}
function getSongIndex(name) {
    for (var i = 0; i <= songSavedClass.length - 1; i++) {
        if (songSavedClass[i].name.toLowerCase().includes(name.toLowerCase())) {
            return i;
        }
    }
    return null;
}
function listenToSong() {
    if (frontendIncoming.song_incoming.text !== null) {
        setTimeout(function () {
            frontendIncoming.song_incomingJS.text = 'listen';
        }, communicationDelay)
    }
    else {
        frontendIncoming.song_incomingJS.text = 'listen';
    }
}
function confirmYes() {
    if (frontendIncoming.song_incomingJS.text !== null) {
        setTimeout(function () {
            frontendIncoming.song_incomingJS.text = 'yes';
        }, communicationDelay)
    }
    else {
        frontendIncoming.song_incomingJS.text = 'yes';
    }
}
function confirmNo() {
    if (frontendIncoming.song_incomingJS.text !== null) {
        setTimeout(function () {
            frontendIncoming.song_incomingJS.text = 'no';
        }, communicationDelay)
    }
    else {
        frontendIncoming.song_incomingJS.text = 'no';
    }
}
async function getRobotPersonality() {

    if (countWords(agentSpeech) >= min_words_PI) {

        var persData = await personality_analysis(agentSpeech);

        if (persData != undefined) {
            agentSpeech = "";
            let thisData = personalityAnalysis.analyzeResultsPI(persData, true);

            agentPersonalityNames = [... new Set(agentPersonalityNames.concat(thisData))]
            agentBigFive = personalityAnalysis.analyzeResultsPI(persData, false, true);
            emotion_sphere.setPersonalityTraits(agentBigFive);
            agentPersonality = persData;
        }
    }
}
async function getPersonality() {

    await getRobotPersonality();

    for (var i = 0; i <= personsPresent.length - 1; i++) {
        if (countWords(personsPresent[i].memoryText) >= min_words_PI) {
            var thisPersData = await personality_analysis(personsPresent[i].memoryText);


            if (thisPersData != undefined) {
                updateSinglePersonData(i, 'memoryText', 'clear_the_data');

                updateSinglePersonData(i, 'personalityResponse', thisPersData);
                let personPersObj = personalityAnalysis.analyzeResultsPI(thisPersData, false, true);

                updateSinglePersonData(i, 'personality', personPersObj)
            }
        }
    }
}
function applyPeopleSpecificEmotion(givenPersonData, isProhibited) {
    const currentTime = new Date().getTime();
    console.log("Triggering person stimulus for ", givenPersonData.name);
    const personDynStim = {
        "label": givenPersonData.name + "_personStim_",
        "anger": givenPersonData.emotionToHim[4],
        "joy": givenPersonData.emotionToHim[1],
        "sadness": givenPersonData.emotionToHim[0],
        "fear": givenPersonData.emotionToHim[2],
        "disgust": givenPersonData.emotionToHim[3],
        "surprise": givenPersonData.emotionToHim[4],
        "timesOccurred": 1,
        "totalTimesUsed": 1,
        "isProhibited": (isProhibited == true) ? true : false,
        "openness": agentBigFive.openness,
        "conscientiousness": agentBigFive.conscientiousness,
        "extraversion": agentBigFive.extraversion,
        "agreeableness": agentBigFive.agreeableness,
        "neuroticism": agentBigFive.neuroticism,
        "relatedStimuli": {},
        "relatedPeople": {},
        "relatedTasks": {},
        "time": currentTime,
        "indexUnderLabel": 0
    }
    otherObjects.push(personDynStim);
}
async function getMaxEmotion() {

    if (rio_sadness == undefined || rio_sadness == null || Number.isNaN(rio_sadness))
        console.error("Backend Error: rio_sadness is invalid: ", rio_sadness);
    if (rio_joy == undefined || rio_joy == null || Number.isNaN(rio_joy))
        console.error("Backend Error: rio_joy is invalid: ", rio_joy);
    if (rio_fear == undefined || rio_fear == null || Number.isNaN(rio_fear))
        console.error("Backend Error: rio_fear is invalid: ", rio_fear);
    if (rio_disgust == undefined || rio_disgust == null || Number.isNaN(rio_disgust))
        console.error("Backend Error: rio_disgust is invalid: ", rio_disgust);
    if (rio_anger == undefined || rio_anger == null || Number.isNaN(rio_anger))
        console.error("Backend Error: rio_anger is invalid: ", rio_anger);
    if (rio_surprise == undefined || rio_surprise == null || Number.isNaN(rio_surprise))
        console.error("Backend Error: rio_surprise is invalid: ", rio_surprise)


    const neutralThreshold = 0.4;

    if (rio_sadness < neutralThreshold && rio_joy < neutralThreshold && rio_fear < neutralThreshold
        && rio_disgust < neutralThreshold && rio_anger < neutralThreshold && rio_surprise < neutralThreshold) {
        rio_max_emotion = 'neutral';
    }

    else if (rio_sadness > rio_joy && rio_sadness > rio_fear && rio_sadness > rio_disgust && rio_sadness > rio_anger && rio_sadness > rio_surprise) {
        rio_max_emotion = 'sadness';
    }

    else if (rio_joy > rio_sadness && rio_joy > rio_fear && rio_joy > rio_disgust && rio_joy > rio_anger && rio_joy > rio_surprise) {
        rio_max_emotion = 'joy';
    }

    else if (rio_fear > rio_sadness && rio_fear > rio_joy && rio_fear > rio_disgust && rio_fear > rio_anger && rio_fear > rio_surprise) {
        rio_max_emotion = 'fear';
    }

    else if (rio_disgust > rio_sadness && rio_disgust > rio_joy && rio_disgust > rio_fear && rio_disgust > rio_anger && rio_disgust > rio_surprise) {
        rio_max_emotion = 'disgust';
    }

    else if (rio_anger > rio_sadness && rio_anger > rio_joy && rio_anger > rio_fear && rio_anger > rio_disgust && rio_anger > rio_surprise) {
        rio_max_emotion = 'anger';
    }

    else if (rio_surprise > rio_sadness && rio_surprise > rio_joy && rio_surprise > rio_fear && rio_surprise > rio_disgust && rio_surprise > rio_anger) {
        rio_max_emotion = 'surprise';
    }

    else {
        let thisEmotionLevel = new Array(6);
        let thisEmotionLabel = new Array(6);
        thisEmotionLevel[0] = rio_sadness;
        thisEmotionLabel[0] = "sadness";
        thisEmotionLevel[1] = rio_joy;
        thisEmotionLabel[1] = "joy";
        thisEmotionLevel[2] = rio_fear;
        thisEmotionLabel[2] = "fear";
        thisEmotionLevel[3] = rio_disgust;
        thisEmotionLabel[3] = "disgust";
        thisEmotionLevel[4] = rio_anger;
        thisEmotionLabel[4] = "anger";
        thisEmotionLevel[5] = rio_surprise;
        thisEmotionLabel[5] = "surprise";


        let leng = thisEmotionLevel.length;
        for (var i = 0; i < leng - 1; i++) {
            for (var j = i + 1; j < leng; j++) {
                if (thisEmotionLevel[i] < thisEmotionLevel[j]) {

                    let temp = thisEmotionLevel[i];
                    thisEmotionLevel[i] = thisEmotionLevel[j];
                    thisEmotionLevel[j] = temp;

                    let temp2 = thisEmotionLabel[i];
                    thisEmotionLabel[i] = thisEmotionLabel[j];
                    thisEmotionLabel[j] = temp2;
                }
            }
        }
        let equalEmotions = new Array(0);

        if (thisEmotionLevel[0] == thisEmotionLevel[1] && thisEmotionLevel[0] !== undefined) {

            equalEmotions.push(thisEmotionLabel[0], thisEmotionLabel[1]);
            let dh = 2;
            while (thisEmotionLevel[dh++] == thisEmotionLevel[0]) {

                equalEmotions.push(thisEmotionLabel[dh]);
            }
        }

        if (equalEmotions.length == 0) {
            console.error("Backend Error: Two emotions are equal and unequal at the same time!");
        }
        else {
            let thisOptions = new Array(0);
            for (var i = 0; i < equalEmotions.length; i++) {

                if (testMode) thisOptions.push(thisEmotionLabel[i] + "__");
                else thisOptions.push(thisEmotionLabel[i] + "_");

            }

            let chosenEmotion = emotionalDecide('emotion_choose_', thisOptions);

            if (chosenEmotion.type == 'multi_option_type') {
                if (chosenEmotion.subtype !== 'uncertain_state' && chosenEmotion.subtype !== 'options_not_selected')

                    rio_max_emotion = chosenEmotion.subtype.slice(0, -1)
            }
            else if (chosenEmotion.type == 'action_unknown') {
                console.error("Backend Error: Predefined action emotion_choose_ is undefined.")
            }

            else {
                rio_max_emotion = 'neutral';
            }
        }
    }
    if (testMode) console.log("Max emotion: ", rio_max_emotion)

    switch (rio_max_emotion) {
        case "sadness":

            const minSpeedSadness = 0.7;
            const maxSpeedSadness = 1.0;
            const minPitchSadness = 0.7;
            const maxPitchSadness = 1.0;
            rio_speech_speed = map(rio_sadness, 0, 1, maxSpeedSadness, minSpeedSadness)
            rio_speech_pitch = map(rio_sadness, 0, 1, maxPitchSadness, minPitchSadness);
            if (rio_sadness >= extremeEmotionThreshold) extremeEmotion = true;
            else extremeEmotion = false;
            break;
        case "joy":

            const minSpeedJoy = 0.95;
            const maxSpeedJoy = 1.2;
            const minPitchJoy = 0.95;
            const maxPitchJoy = 1.5;
            rio_speech_speed = map(rio_joy, 0, 1, minSpeedJoy, maxSpeedJoy);
            rio_speech_pitch = map(rio_joy, 0, 1, minPitchJoy, maxPitchJoy);
            if (rio_joy >= extremeEmotionThreshold) extremeEmotion = true;
            else extremeEmotion = false;
            break;
        case "fear":

            const minSpeedFear = 0.9;
            const maxSpeedFear = 1.35;
            const minPitchFear = 1.0;
            const maxPitchFear = 1.8;
            rio_speech_speed = map(rio_fear, 0, 1, minSpeedFear, maxSpeedFear);
            rio_speech_pitch = map(rio_fear, 0, 1, minPitchFear, maxPitchFear);
            if (rio_fear >= extremeEmotionThreshold) extremeEmotion = true;
            else extremeEmotion = false;
            break;
        case "disgust":

            const minSpeedDisgust = 0.8;
            const maxSpeedDisgust = 1.2;
            const minPitchDisgust = 0.78;
            const maxPitchDisgust = 1.3;
            rio_speech_speed = map(rio_disgust, 0, 1, minSpeedDisgust, maxSpeedDisgust);
            rio_speech_pitch = map(rio_disgust, 0, 1, minPitchDisgust, maxPitchDisgust);
            if (rio_disgust >= extremeEmotionThreshold) extremeEmotion = true;
            else extremeEmotion = false;
            break;
        case "anger":

            const minSpeedAnger = 1.0;
            const maxSpeedAnger = 1.4;
            const minPitchAnger = 1.0;
            const maxPitchAnger = 1.5;
            rio_speech_speed = map(rio_anger, 0, 1, minSpeedAnger, maxSpeedAnger);
            rio_speech_pitch = map(rio_anger, 0, 1, minPitchAnger, maxPitchAnger);
            if (rio_anger >= extremeEmotionThreshold) extremeEmotion = true;
            else extremeEmotion = false;
            break;
        case "surprise":

            const minSpeedSurprise = 1.0;
            const maxSpeedSurprise = 1.5;
            const minPitchSurprise = 1.0;
            const maxPitchSurprise = 1.7;
            rio_speech_speed = map(rio_surprise, 0, 1, minSpeedSurprise, maxSpeedSurprise);
            rio_speech_pitch = map(rio_surprise, 0, 1, minPitchSurprise, maxPitchSurprise);
            if (rio_surprise >= extremeEmotionThreshold) extremeEmotion = true;
            else extremeEmotion = false;
            break;
        case "neutral":

            const neutralSpeed = 0.9;
            const neutralPitch = 1.0;
            rio_speech_speed = neutralSpeed;
            rio_speech_pitch = neutralPitch;
            extremeEmotion = false;
            break;
        default: console.error("Backend Error: Max emotion is an improper value!");

    }
}
function getMaxEmotionScore() {

    if (rio_sadness >= rio_joy && rio_sadness >= rio_fear && rio_sadness >= rio_disgust
        && rio_sadness >= rio_anger && rio_sadness >= rio_surprise)
        rio_max_emotion_score = rio_sadness;

    else if (rio_joy >= rio_sadness && rio_joy >= rio_fear && rio_joy >= rio_disgust
        && rio_joy >= rio_anger && rio_joy >= rio_surprise)
        rio_max_emotion_score = rio_joy;

    else if (rio_fear >= rio_sadness && rio_fear >= rio_joy && rio_fear >= rio_disgust
        && rio_fear >= rio_anger && rio_fear >= rio_sadness)
        rio_max_emotion_score = rio_fear;

    else if (rio_disgust >= rio_sadness && rio_disgust >= rio_joy && rio_disgust >= rio_fear
        && rio_disgust >= rio_anger && rio_disgust >= rio_surprise)
        rio_max_emotion_score = rio_disgust;

    else if (rio_surprise >= rio_sadness && rio_surprise >= rio_joy && rio_surprise >= rio_fear
        && rio_surprise >= rio_disgust && rio_surprise >= rio_anger)
        rio_max_emotion_score = rio_surprise;

    else rio_max_emotion_score = rio_anger;
}
function savePose(saveFinal) {
    if (saveFinal == undefined || saveFinal == true) {
        if (frontendIncoming.pose_incoming.text !== null) {
            setTimeout(function () {
                frontendIncoming.pose_incoming.text = 'saveFinal'
            }, communicationDelay)
        }
        else {
            frontendIncoming.pose_incoming.text = 'saveFinal'
        }
    }
    else {
        if (frontendIncoming.pose_incoming.text !== null) {
            setTimeout(function () {
                frontendIncoming.pose_incoming.text = 'savePeriodic'
            }, communicationDelay)
        }
        else {
            frontendIncoming.pose_incoming.text = 'savePeriodic'
        }
    }
}
function saveVerbalAnswers(saveFinal) {
    if (saveFinal == undefined || saveFinal == true) {
        if (frontendIncoming.verbal_incoming.text !== null) {
            setTimeout(function () {
                frontendIncoming.verbal_incoming.text = 'saveFinal';
            }, communicationDelay)
        }
        else frontendIncoming.verbal_incoming.text = 'saveFinal';
    }
    else {
        if (frontendIncoming.verbal_incoming.text !== null) {
            setTimeout(function () {
                frontendIncoming.verbal_incoming.text = 'savePeriodic';
            }, communicationDelay)
        }
        else {
            frontendIncoming.verbal_incoming.text = 'savePeriodic';
        }
    }
}
function stringToArray(tempSpeech) {
    var wordArray = new Array(0);
    tempSpeech += " ";
    for (var i = 0; i <= tempSpeech.length - 1; i++) {
        if (tempSpeech.charAt(i) == " ") {
            wordArray.push(tempSpeech.slice(0, i));
            tempSpeech = tempSpeech.slice(i + 1);
        }
    }
    return wordArray;
}
function stringArrToNumeric(array) {

    let numArray = new Array(0);
    array.forEach(el => {
        var numForm = 0;
        for (var i = 0; i < el.length; i++) {
            numForm = numForm * 10 + el.charCodeAt(i);
        }
        numArray.push(numForm);
    });
    return numArray;
}
function VerbalLearn(data, Givenresponse) {
    if (exitingCode == false) {

        let newVerbalResObj = {
            "speech": Givenresponse,
            "answerer_emotion": data[3].slice(),
            "isProhibited": false,
            "openness": currentSpeaker !== undefined ? personsPresent[getPersonIndex(currentSpeaker)].openness : agentBigFive.openness,
            "conscientiousness": currentSpeaker !== undefined ? personsPresent[getPersonIndex(currentSpeaker)].conscientiousness : agentBigFive.conscientiousness,
            "extraversion": currentSpeaker !== undefined ? personsPresent[getPersonIndex(currentSpeaker)].extraversion : agentBigFive.extraversion,
            "agreeableness": currentSpeaker !== undefined ? personsPresent[getPersonIndex(currentSpeaker)].agreeableness : agentBigFive.agreeableness,
            "neuroticism": currentSpeaker !== undefined ? personsPresent[getPersonIndex(currentSpeaker)].neuroticism : agentBigFive.neuroticism
        }
        console.log("verbal learning is being done with index ", verbalResponse.push(newVerbalResObj));
        if (frontendIncoming.verbal_incoming.text !== null) {
            setTimeout(function () {
                frontendIncoming.verbal_incoming.json = data;
                frontendIncoming.verbal_incoming.text = 'learn';
            }, communicationDelay)
        }
        else {
            frontendIncoming.verbal_incoming.json = data;
            frontendIncoming.verbal_incoming.text = 'learn';
        }
    }
    else console.error("Verbal learning not done because code is being exited.");
}
function generateEmotionsFromNLU(response, givenName, givenResponse) {
    var extractedCategories = new Array(0);
    if (response.hasOwnProperty('categories')) {
        for (var i = 0; i <= response.categories.length - 1; i++) {

            var tempData = response.categories[i].label.slice(1);
            if (tempData.includes('/'))
                while (tempData.includes('/')) {
                    var slashPos = tempData.indexOf('/');
                    var onecategory = tempData.slice(0, slashPos);
                    tempData = tempData.slice(slashPos + 1);
                    extractedCategories.push(onecategory);
                }
            else extractedCategories.push(tempData);
        }
    }

    var concepts = new Array(0);
    if (response.hasOwnProperty('concepts')) {
        for (var i = 0; i <= response.concepts.length - 1; i++) {
            concepts.push(response.concepts[i].text);
        }
    }
    var keywords = new Array(0);

    if (response.hasOwnProperty('keywords')) {
        for (var i = 0; i <= response.keywords.length - 1; i++) {
            keywords.push(response.keywords[i].text);
        }
    }
    let relatedAbstracts = [... new Set(extractedCategories.concat(concepts, keywords))];

    updateSinglePersonData(givenName, "personSpeechArray", givenResponse);
    updateSinglePersonData(givenName, 'relatedAbstracts', relatedAbstracts);

    var entities_type = new Array(0);
    var entities_text = new Array(0);

    if (response.hasOwnProperty('entities')) {

        let personsMentioned = new Array(0);
        for (var i = 0; i <= response.entities.length - 1; i++) {
            entities_type[i] = response.entities[i].type;
            entities_text[i] = response.entities[i].text;

            if (entities_type[i] == 'person') {

                var genderofPerson = gender.detect(entities_text[i]);
                var personData = {
                    "name": entities_text[i],
                    "gender": genderofPerson
                }

                personsMentioned.push(personData);
            }
        }

        if (personsMentioned.length !== 0) {
            let currentTime = new Date().getTime();
            let hisDone = false;
            let herDone = false;

            if (hisVariable.lastTime >= forgetTime) {
                hisVariable.name = null;
                hisVariable.lastTime = currentTime;
            }

            if (herVariable.lastTime >= forgetTime) {
                herVariable.name = null;
                herVariable.lastTime = currentTime;
            }
            for (var m = personsMentioned.length - 1; m >= 0; m--) {
                if (personsMentioned[m].gender == 'male') {
                    if (hisDone == false) {
                        hisVariable.name = personsMentioned[m].name;
                        hisVariable.lastTime = currentTime;
                        hisDone = true;
                    }
                }
                else if (personsMentioned[m].gender == 'female') {
                    if (herDone == false) {
                        herVariable.name = personsMentioned[m].name;
                        herVariable.lastTime = currentTime;
                        herDone = true;
                    }
                }
                else console.error('Error: generateEmotionsFromNLU():  gender for person ', personsMentioned[m].name, " is invalid: ", personsMentioned[m].gender);
            }
        }
    }

    let detectedObj = [... new Set(relatedAbstracts.concat(entities_type, entities_text))];

    if (response.hasOwnProperty('emotion')) {

        var emotion_targets = new Array(0);
        if (response.emotion.hasOwnProperty('targets')) {
            var emotion_targets_sadness = new Array(0);
            var emotion_targets_joy = new Array(0);
            var emotion_targets_fear = new Array(0);
            var emotion_targets_disgust = new Array(0);
            var emotion_targets_anger = new Array(0);
            var emotion_targets_surprise = new Array(0);
            for (var i = 0; i <= response.emotion.targets.length - 1; i++) {
                emotion_targets[i] = response.emotion.targets[i].text;
                emotion_targets_sadness[i] = response.emotion.targets[i].emotion.sadness;
                emotion_targets_joy[i] = response.emotion.targets[i].emotion.joy;
                emotion_targets_fear[i] = response.emotion.targets[i].emotion.fear;
                emotion_targets_disgust[i] = response.emotion.targets[i].emotion.disgust;
                emotion_targets_anger[i] = response.emotion.targets[i].emotion.anger;
                if (response.emotion.targets[i].emotion.hasOwnProperty('surprise'))
                    emotion_targets_surprise[i] = response.emotion.targets[i].emotion.surprise;
                else emotion_targets_surprise[i] = defaultSurprise;
            }

            saveTargetObjects(emotion_targets, emotion_targets_sadness, emotion_targets_joy,
                emotion_targets_fear, emotion_targets_disgust, emotion_targets_anger, emotion_targets_surprise, detectedObj, givenName);
        }

        if (response.emotion.hasOwnProperty('document')) {
            var document_sadness = response.emotion.document.emotion.sadness;
            var document_joy = response.emotion.document.emotion.joy;
            var document_fear = response.emotion.document.emotion.fear;
            var document_disgust = response.emotion.document.emotion.disgust;
            var document_anger = response.emotion.document.emotion.anger;

            var document_surprise = defaultSurprise;

            if (response.emotion.document.emotion.hasOwnProperty('surprise'))
                document_surprise = response.emotion.document.emotion.surprise;
            var document_emotion = [document_sadness, document_joy, document_fear, document_disgust, document_anger, document_surprise];

            updateSinglePersonData(givenName, 'toneEmotion', document_emotion);
            updateSinglePersonData(givenName, 'lastTimeUpdated', new Date().getTime())

            saveEmotionObjects(detectedObj, document_emotion, givenName);

            saveThesaurusObjects(detectedObj, document_emotion, givenName);
        }
    }

    if (response.hasOwnProperty('sentiment')) {
        let manipulatedLikeness = personsPresent[getPersonIndex(givenName)].likeness;
        if (manipulatedLikeness !== null || manipulatedLikeness !== undefined) {
            function isAPersonalityTrait(word) {
                for (var i = 0; i < agentPersonalityNames.length; i++) {
                    if (agentPersonalityNames[i].toLowerCase().includes(word.toLowerCase())) {
                        return true;
                    }
                }
                return false;
            }

            let checkedSentimentTargets = [];
            const unitLikeness = 0.2;

            if (response.sentiment.hasOwnProperty('targets')) {
                response.sentiment.targets.forEach(el => {

                    if (isAPersonalityTrait(el.text) == true) {
                        if (el.label == 'positive') {
                            manipulatedLikeness += map(el.score, 0, 1, 0, unitLikeness);
                        }
                        else if (el.label == 'negative') {
                            manipulatedLikeness -= map(el.score, 0, 1, 0, unitLikeness)
                        }
                        else console.error('Error: Target sentiment is invalid in generateEmotionsFromNLU()');
                        checkedSentimentTargets.push(el.text.toLowerCase());
                    }
                })
            }
            let sentiment = response.sentiment.document.label;
            let sentimentScore = response.sentiment.document.score;
            for (var i = 0; i < agentPersonalityNames.length; i++) {
                for (var j = 0; j < detectedObj.length; j++) {
                    if (agentPersonalityNames[i].toLowerCase() == detectedObj[j].toLowerCase()) {
                        for (var k = 0; k < checkedSentimentTargets.length; k++) {
                            if (detectedObj[j].toLowerCase() == checkedSentimentTargets[k])
                                break;
                        }

                        if (k == checkedSentimentTargets.length) {
                            if (sentiment == 'positive') manipulatedLikeness += map(sentimentScore, 0, 1, 0, unitLikeness);
                            else manipulatedLikeness -= map(sentimentScore, 0, 1, 0, unitLikeness);
                        }
                    }
                }
            }

            if (manipulatedLikeness > 1) manipulatedLikeness = 1;
            else if (manipulatedLikeness < 0) manipulatedLikeness = 0;
            if (typeof manipulatedLikeness == 'number' && Number.isNaN(manipulatedLikeness) == false)
                updateSinglePersonData(givenName, 'likeness', manipulatedLikeness);
            else console.error("generateEmotionsFromNlu: manipulated likeness is invalid for person: ", givenName);
        }
        else console.error("generateEmotionsFromNlu: likeness coefficient invalid for person: ", givenName);
    }

}
function isPositiveSurprise(givenObject) {

    if (givenObject == undefined) {

        if (Math.abs(rio_joy - rio_surprise) <= Math.abs(rio_fear - rio_surprise)) {
            return true;
        }
        else return false;
    }
    else {

        if (Math.abs(givenObject.joy - givenObject.surprise) <= Math.abs(givenObject.fear - givenObject.surprise)) {
            return true
        }
        else return false;
    }
}
function checkRejectedState(choice) {
    switch (choice) {
        case 'speaker_not_liked':
        case 'action_not_liked':
        case 'action_unknown':
        case 'option_not_selected':
        case 'option_unknown':
        case 'options_unknown':
        case 'options_not_selected':

            return true;
        default: return false;
    }
}
async function emotionAlter(type, ifNLU, objectName, isASong, objectProvided) {
    const emotionAlterFeatureLimit = 3;

    const percentDec = 0.80;
    const percentInc = 1.2;
    var sadness, joy, fear, disgust, anger, surprise;
    var errorOccurred = false;

    if (type == 'verbal') {
        if (ifNLU == undefined || ifNLU == null || ifNLU == true && typeof objectName == "string") {
            if (countWords(objectName) >= min_words_NLU) {
                var params = {
                    'text': objectName,
                    'features': {
                        'emotion': {
                            'document': true,
                            'limit': emotionAlterFeatureLimit
                        }
                    }
                }
                var emotionJSON = await naturalLanguageUnderstanding.analyze(params)
                    .catch(err => {
                        console.error('Error: Error in emotion alter NLU: ', err)
                        errorOccurred = true;
                    });

                if (emotionJSON != undefined) {

                    sadness = emotionJSON.result.emotion.document.emotion.sadness;
                    joy = emotionJSON.result.emotion.document.emotion.joy;
                    fear = emotionJSON.result.emotion.document.emotion.fear;
                    disgust = emotionJSON.result.emotion.document.emotion.disgust;
                    anger = emotionJSON.result.emotion.document.emotion.anger;
                    if (emotionJSON.result.emotion.document.emotion.hasOwnProperty('surprise'))
                        surprise = emotionJSON.result.emotion.document.emotion.surprise;
                    else surprise = defaultSurprise;

                    if (emotionJSON.result.emotion.hasOwnProperty('targets')) {
                        emotionJSON.result.emotion.targets.forEach(el => {
                            sadness = (sadness + el.emotion.sadness) / 2;
                            joy = (joy + el.emotion.joy) / 2;
                            fear = (fear + el.emotion.fear) / 2;
                            disgust = (fear + el.emotion.disgust) / 2;
                            anger = (anger + el.emotion.anger) / 2;
                            if (el.emotion.hasOwnProperty('surprise'))
                                surprise = (surprise + el.emotion.surprise) / 2;
                        })
                    }
                }
            }
        }

        else if (typeof objectName == 'object' && objectName !== null) {
            sadness = objectName.sadness;
            joy = objectName.joy;
            fear = objectName.fear;
            disgust = objectName.disgust;
            anger = objectName.anger;
            surprise = objectName.surprise;
        }
    }

    else {

        if (isASong == false) {

            if (objectProvided == true && typeof objectName == "object" && objectName !== null) {
                sadness = objectName.sadness;
                joy = objectName.joy;
                fear = objectName.fear;
                disgust = objectName.disgust;
                anger = objectName.anger;
                surprise = objectName.surprise;
            }
            else {

                if (checkRejectedState(objectName) == false) {
                    if (objectName != 'uncertain_state' && typeof objectName == 'string') {
                        var data = memoryRet('longTerm', objectName.toLowerCase(), false, null, false, false)
                        if (data !== undefined) {
                            sadness = data.data.sadness;
                            joy = data.data.joy;
                            fear = data.data.fear;
                            disgust = data.data.disgust;
                            anger = data.data.anger;
                            surprise = data.data.surprise;
                        }
                        else {

                            console.error(objectName.toLowerCase(), " cannot be altered because it does not exist in short term.")
                            errorOccurred = true;
                            return;
                        }
                    }

                    else {


                        joy = rio_joy * percentDec;
                        sadness = rio_sadness * percentInc;
                        fear = rio_fear * percentInc;
                        disgust = rio_disgust * percentInc;
                        anger = rio_anger * percentInc;
                        surprise = rio_surprise * percentInc;
                    }
                }
                else return;
            }
        }

        else {
            sadness = objectName.agentEmotionScores[0];
            joy = objectName.agentEmotionScores[1];
            fear = objectName.agentEmotionScores[2];
            disgust = objectName.agentEmotionScores[3];
            anger = objectName.agentEmotionScores[4];
            surprise = objectName.agentEmotionScores[5];
        }
    }

    /*
        if (objectName !== 'uncertain_state') {
        if (Math.abs(rio_sadness - sadness) < emModularDiff) sadness *= percentDec;
        if (Math.abs(rio_joy - joy) < emModularDiff) joy *= percentDec;
        if (Math.abs(rio_fear - fear) < emModularDiff) fear *= percentDec;
        if (Math.abs(rio_disgust - disgust) < emModularDiff) disgust *= percentDec;
        if (Math.abs(rio_anger - anger) < emModularDiff) anger *= percentDec;
        if (Math.abs(rio_surprise - surprise) < emModularDiff) surprise *= percentDec;
    }
    */

    if (sadness < 0) sadness = 0;
    else if (sadness > 1) sadness = 1;
    if (joy < 0) joy = 0;
    else if (joy > 1) joy = 1;
    if (fear < 0) fear = 0;
    else if (fear > 1) fear = 1;
    if (disgust < 0) disgust = 0;
    else if (disgust > 1) disgust = 1;
    if (anger < 0) anger = 0;
    else if (anger > 1) anger = 1;
    if (surprise < 0) surprise = 0;
    else if (surprise > 1) surprise = 1;
    var em = [sadness, joy, fear, disgust, anger, surprise];
    function checkVal(givnArr) {
        for (var i = 0; i < givnArr.length; i++) {
            if (isNaN(givnArr[i]) || givnArr[i] == undefined)
                return false;
        }
        return true;
    }
    if (errorOccurred == false || checkVal(em) == true) {

        const currentTime = new Date().getTime();
        const newDynStimu = {
            "label": "emotionAlterStim" + String(currentTime),
            "anger": anger,
            "joy": joy,
            "sadness": sadness,
            "fear": fear,
            "disgust": disgust,
            "surprise": surprise,
            "timesOccurred": 1,
            "totalTimesUsed": 1,
            "isProhibited": false,
            "openness": agentBigFive.openness,
            "conscientiousness": agentBigFive.conscientiousness,
            "extraversion": agentBigFive.extraversion,
            "agreeableness": agentBigFive.agreeableness,
            "neuroticism": agentBigFive.neuroticism,
            "relatedStimuli": {},
            "relatedPeople": {},
            "relatedTasks": {},
            "time": currentTime,
            "indexUnderLabel": 0
        }
        if (type == 'verbal') objects.push(newDynStimu);
        else otherObjects.push(newDynStimu);
        let displayStim = (typeof objectName == 'object' && objectName !== null) ? objectName.label : objectName;
        console.log(`Emotion alteration stimulus created for type: ${type} ifNlu: ${ifNLU} object name: ${displayStim} isASong: ${isASong}`)

        updateEmotions();
        if (currentSpeaker !== undefined)
            updateSinglePersonData(currentSpeaker, 'emotionToHim', [rio_sadness, rio_joy, rio_fear, rio_disgust, rio_anger, rio_surprise]);
    }
}
function saveThesaurusObjects(data, emotion, givenSpeaker) {
    let currentTime = new Date().getTime();
    data.forEach(el1 => {

        let origSadness = defaultEmotionScore,
            origJoy = defaultEmotionScore,
            origFear = defaultEmotionScore,
            origDisgust = defaultEmotionScore,
            origAnger = defaultEmotionScore,
            origSurprise = defaultEmotionScore;
        var thesaurusRes = thesaurus.find(el1);
        thesaurusRes.forEach(el2 => {
            let similarTrigger = {
                "label": el2,
                "anger": null,
                "joy": null,
                "sadness": null,
                "fear": null,
                "disgust": null,
                "surprise": null,
                "timesOccurred": 1,
                "totalTimesUsed": 1,
                "isProhibited": false,
                "openness": null,
                "conscientiousness": null,
                "extraversion": null,
                "agreeableness": null,
                "neuroticism": null,
                "relatedStimuli": {},
                "relatedPeople": {},
                "relatedTasks": {},
                "time": currentTime,
                "indexUnderLabel": 0
            }
            let thisObj = memoryRet('longTerm', el2, false, null, false, true, data, givenSpeaker, emotion);
            if (thisObj == undefined || typeof thisObj == 'number') {

                let newRelatedStimuli = {}

                data.forEach(el => {
                    newRelatedStimuli[el] = { count: 1 };
                });
                let newRelatedTasks = {};

                rememberedTasks.forEach(el => {
                    newRelatedTasks[el] = { count: 1 };
                })

                let newRelatedSpeakers = {};
                newRelatedSpeakers[givenSpeaker] = { count: 1 }

                let alpha = 1;
                let rho = 1;
                const gamma = 10;
                let save_openness = agentBigFive.openness;
                let save_conscientiousness = agentBigFive.conscientiousness;
                let save_extraversion = agentBigFive.extraversion;
                let save_agreeableness = agentBigFive.agreeableness;
                let save_neuroticism = agentBigFive.neuroticism;
                if (currentSpeaker !== undefined) {


                    const timeEffectCoefficient = 1;
                    alpha = PersonalityDiffScaledScore(currentSpeaker) * personsPresent[getPersonIndex(currentSpeaker)].likeness * timeEffectCoefficient;
                    const speakerPersonality = personsPresent[getPersonIndex(currentSpeaker)].personality;
                    let sigmaOpenness = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_openness - speakerPersonality.openness));
                    let sigmaConscientiousness = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_conscientiousness - speakerPersonality.conscientiousness));
                    let sigmaExtraversion = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_extraversion - speakerPersonality.extraversion));
                    let sigmaAgreeableness = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_agreeableness - speakerPersonality.agreeableness));
                    let sigmaNeuroticism = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_neuroticism - speakerPersonality.neuroticism))

                    save_openness = (speakerPersonality.openness >= save_openness) ? save_openness + sigmaOpenness : save_openness - sigmaOpenness;
                    save_conscientiousness = (speakerPersonality.conscientiousness >= save_conscientiousness) ? save_conscientiousness + sigmaConscientiousness : save_conscientiousness - sigmaConscientiousness;
                    save_extraversion = (speakerPersonality.extraversion >= save_extraversion) ? save_extraversion + sigmaExtraversion : save_extraversion - sigmaExtraversion;
                    save_agreeableness = (speakerPersonality.agreeableness >= save_agreeableness) ? save_agreeableness + sigmaAgreeableness : save_agreeableness - sigmaAgreeableness;
                    save_neuroticism = (speakerPersonality.neuroticism >= save_neuroticism) ? save_neuroticism + sigmaNeuroticism : save_neuroticism - sigmaNeuroticism;
                }
                let sigmaSadness, sigmaJoy, sigmaFear, sigmaDisgust, sigmaAnger, sigmaSurprise;
                if (emotion[0] !== 'system_sadness_') sigmaSadness = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(emotion[0] - defaultEmotionScore));
                if (emotion[1] !== 'system_joy_') sigmaJoy = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(emotion[1] - defaultEmotionScore));
                if (emotion[2] !== 'system_fear_') sigmaFear = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(emotion[2] - defaultEmotionScore));
                if (emotion[3] !== 'system_disgust_') sigmaDisgust = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(emotion[3] - defaultEmotionScore));
                if (emotion[4] !== 'system_anger_') sigmaAnger = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(emotion[4] - defaultEmotionScore));
                if (emotion[5] !== 'system_surprise_') sigmaSurprise = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(emotion[5] - defaultEmotionScore));
                let save_sadness, save_joy, save_fear, save_disgust, save_anger, save_surprise;
                if (sigmaSadness !== undefined) save_sadness = (emotion[0] >= defaultEmotionScore) ? defaultEmotionScore + sigmaSadness : defaultEmotionScore - sigmaSadness;
                else save_sadness = 'system_sadness';
                if (sigmaJoy !== undefined) save_joy = (emotion[1] >= defaultEmotionScore) ? defaultEmotionScore + sigmaJoy : defaultEmotionScore - sigmaJoy;
                else save_joy = 'system_joy_';
                if (sigmaFear !== undefined) save_fear = (emotion[2] >= defaultEmotionScore) ? defaultEmotionScore + sigmaFear : defaultEmotionScore - sigmaFear;
                else save_fear = 'system_fear_';
                if (sigmaDisgust !== undefined) save_disgust = (emotion[3] >= defaultEmotionScore) ? defaultEmotionScore + sigmaDisgust : defaultEmotionScore - sigmaDisgust;
                else save_disgust = 'system_disgust_';
                if (sigmaAnger !== undefined) save_anger = (emotion[4] >= defaultEmotionScore) ? defaultEmotionScore + sigmaAnger : defaultEmotionScore - sigmaAnger;
                else save_anger = 'system_anger_';
                if (sigmaSurprise !== undefined) save_surprise = (emotion[5] >= defaultEmotionScore) ? defaultEmotionScore + sigmaSurprise : defaultEmotionScore - sigmaSurprise;
                else save_surprise = 'system_surprise';
                similarTrigger.sadness = save_sadness;
                similarTrigger.joy = save_joy;
                similarTrigger.fear = save_fear;
                similarTrigger.disgust = save_disgust;
                similarTrigger.anger = save_anger;
                similarTrigger.surprise = save_surprise;

                similarTrigger.openness = save_openness;
                similarTrigger.conscientiousness = save_conscientiousness;
                similarTrigger.agreeableness = save_agreeableness;
                similarTrigger.extraversion = save_extraversion;
                similarTrigger.neuroticism = save_neuroticism;
                similarTrigger.relatedStimuli = newRelatedStimuli;
                similarTrigger.relatedPeople = newRelatedSpeakers;
                similarTrigger.relatedTasks = newRelatedTasks;
                if (typeof thisObj == 'number') similarTrigger.indexUnderLabel = thisObj;

                memoryRet('longTerm', el2, true, similarTrigger, false, true, null, null, null, thisObj);
                if (testMode == true) {
                    let thisPerceptionChangeObj = {
                        stimulusName: similarTrigger.label,
                        beforeAlteration: [origSadness, origJoy, origFear, origDisgust, origAnger, origSurprise],
                        afterAlteration: [save_sadness, save_joy, save_fear, save_disgust, save_anger, save_surprise].slice(),

                        influence: weightedAverage([Math.abs(save_sadness - origSadness), Math.abs(save_joy - origJoy), Math.abs(save_fear - origFear)
                            , Math.abs(save_disgust - origDisgust), Math.abs(save_anger - origAnger), Math.abs(save_surprise - origSurprise)])
                    }
                    perceptionChangeObjects.push(thisPerceptionChangeObj);
                }
            }
            else if (typeof thisObj == 'object') {
                if (thisObj.data !== undefined) {

                    let theRelatedStimuli = thisObj.data.relatedStimuli;
                    data.forEach(el => {
                        if (theRelatedStimuli.hasOwnProperty(el)) {
                            theRelatedStimuli[el].count++;
                        }

                        else {
                            theRelatedStimuli[el] = { count: 1 }
                        }
                    })

                    if (Object.keys(theRelatedStimuli).length > relatedPropLimit) {
                        removeExtraUnusedProp(theRelatedStimuli);
                    }

                    similarTrigger.relatedStimuli = theRelatedStimuli;

                    let theRelatedPeople = thisObj.data.relatedPeople;
                    if (theRelatedPeople.hasOwnProperty(givenSpeaker)) {
                        theRelatedPeople[givenSpeaker].count++;
                    }
                    else theRelatedPeople[givenSpeaker] = { count: 1 }
                    if (Object.keys(theRelatedPeople).length > relatedPropLimit) {
                        removeExtraUnusedProp(theRelatedPeople);
                    }
                    similarTrigger.relatedPeople = theRelatedPeople;

                    let theRelatedTasks = thisObj.data.relatedTasks;
                    rememberedTasks.forEach(el => {
                        if (theRelatedTasks.hasOwnProperty(el)) {
                            theRelatedTasks[el].count++;
                        }
                        else {
                            theRelatedTasks[el] = { count: 1 }
                        }
                    })
                    if (Object.keys(theRelatedTasks).length > relatedPropLimit) {
                        removeExtraUnusedProp(theRelatedTasks);
                    }
                    similarTrigger.relatedTasks = theRelatedTasks;

                    let alpha = 1;
                    let rho = 1;
                    const gamma = 10;
                    let save_openness = thisObj.data.openness;
                    let save_conscientiousness = thisObj.data.conscientiousness;
                    let save_extraversion = thisObj.data.extraversion;
                    let save_agreeableness = thisObj.data.agreeableness;
                    let save_neuroticism = thisObj.data.neuroticism;
                    if (currentSpeaker !== undefined) {


                        const timeEffectCoefficient = (thisObj.data.time / currentTime)
                        alpha = PersonalityDiffScaledScore(currentSpeaker) * personsPresent[getPersonIndex(currentSpeaker)].likeness * timeEffectCoefficient;
                        const speakerPersonality = personsPresent[getPersonIndex(currentSpeaker)].personality;
                        let sigmaOpenness = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_openness - speakerPersonality.openness));
                        let sigmaConscientiousness = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_conscientiousness - speakerPersonality.conscientiousness));
                        let sigmaExtraversion = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_extraversion - speakerPersonality.extraversion));
                        let sigmaAgreeableness = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_agreeableness - speakerPersonality.agreeableness));
                        let sigmaNeuroticism = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_neuroticism - speakerPersonality.neuroticism))

                        save_openness = (speakerPersonality.openness >= save_openness) ? save_openness + sigmaOpenness : save_openness - sigmaOpenness;
                        save_conscientiousness = (speakerPersonality.conscientiousness >= save_conscientiousness) ? save_conscientiousness + sigmaConscientiousness : save_conscientiousness - sigmaConscientiousness;
                        save_extraversion = (speakerPersonality.extraversion >= save_extraversion) ? save_extraversion + sigmaExtraversion : save_extraversion - sigmaExtraversion;
                        save_agreeableness = (speakerPersonality.agreeableness >= save_agreeableness) ? save_agreeableness + sigmaAgreeableness : save_agreeableness - sigmaAgreeableness;
                        save_neuroticism = (speakerPersonality.neuroticism >= save_neuroticism) ? save_neuroticism + sigmaNeuroticism : save_neuroticism - sigmaNeuroticism;
                    }

                    let sigmaSadness, sigmaJoy, sigmaFear, sigmaDisgust, sigmaAnger, sigmaSurprise;

                    if (emotion[0] !== 'system_sadness_') {
                        if (thisObj.data.sadness == 'system_sadness_') thisObj.data.sadness = rio_sadness;
                        sigmaSadness = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(thisObj.data.sadness - emotion[0]));
                    }
                    if (emotion[1] !== 'system_joy_') {
                        if (thisObj.data.joy == 'system_joy_') thisObj.data.joy = rio_joy;
                        sigmaJoy = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(thisObj.data.joy - emotion[1]))
                    }
                    if (emotion[2] !== 'system_fear_') {
                        if (thisObj.data.fear == 'system_fear_') thisObj.data.fear = rio_fear;
                        sigmaFear = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(thisObj.data.fear - emotion[2]));
                    }
                    if (emotion[3] !== 'system_disgust_') {
                        if (thisObj.data.disgust == 'system_disgust_') thisObj.data.disgust = rio_disgust;
                        sigmaDisgust = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(thisObj.data.disgust - emotion[3]));
                    }
                    if (emotion[4] !== 'system_anger_') {
                        if (thisObj.data.anger == 'system_anger_') thisObj.data.anger = rio_anger;
                        sigmaAnger = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(thisObj.data.anger - emotion[4]));
                    }
                    if (emotion[5] !== 'system_surprise_') {
                        if (thisObj.data.surprise == 'system_surprise_') thisObj.data.surprise = rio_surprise;
                        sigmaSurprise = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(thisObj.data.surprise - emotion[5]));
                    }
                    if (sigmaSadness !== undefined) similarTrigger.sadness = (emotion[0] >= thisObj.data.sadness) ? thisObj.data.sadness + sigmaSadness : thisObj.data.sadness - sigmaSadness;
                    else similarTrigger.sadness = 'system_sadness_';
                    if (sigmaJoy !== undefined) similarTrigger.joy = (emotion[1] >= thisObj.data.joy) ? thisObj.data.joy + sigmaJoy : thisObj.data.joy - sigmaJoy;
                    else similarTrigger.joy = 'system_joy_';
                    if (sigmaFear !== undefined) similarTrigger.fear = (emotion[2] >= thisObj.data.fear) ? thisObj.data.fear + sigmaFear : thisObj.data.fear - sigmaFear;
                    else similarTrigger.fear = 'system_fear_';
                    if (sigmaDisgust !== undefined) similarTrigger.disgust = (emotion[3] >= thisObj.data.disgust) ? thisObj.data.disgust + sigmaDisgust : thisObj.data.disgust - sigmaDisgust;
                    else similarTrigger.disgust = 'system_disgust_';
                    if (sigmaAnger !== undefined) similarTrigger.anger = (emotion[4] >= thisObj.data.anger) ? thisObj.data.anger + sigmaAnger : thisObj.data.anger - sigmaAnger;
                    else similarTrigger.anger = 'system_anger_';
                    if (sigmaSurprise !== undefined) similarTrigger.surprise = (emotion[5] >= thisObj.data.surprise) ? thisObj.data.surprise + sigmaSurprise : thisObj.data.surprise - sigmaSurprise;
                    else similarTrigger.surprise = 'system_surprise_';

                    similarTrigger.openness = save_openness;
                    similarTrigger.conscientiousness = save_conscientiousness;
                    similarTrigger.extraversion = save_extraversion;
                    similarTrigger.agreeableness = save_agreeableness;
                    similarTrigger.neuroticism = save_neuroticism;
                    similarTrigger.time = currentTime;
                    similarTrigger.totalTimesUsed++;
                    memoryRet('longTerm', el2, true, similarTrigger, false, true, null, null, null, thisObj.index);

                    if (testMode == true) {

                        let origSadness = thisObj.data.sadness;
                        let origJoy = thisObj.data.joy;
                        let origFear = thisObj.data.fear;
                        let origDisgust = thisObj.data.disgust;
                        let origAnger = thisObj.data.anger;
                        let origSurprise = thisObj.data.surprise;
                        let thisPerceptionChangeObj = {
                            stimulusName: similarTrigger.label,
                            beforeAlteration: [origSadness, origJoy, origFear, origDisgust, origAnger, origSurprise],
                            afterAlteration: [similarTrigger.sadness, similarTrigger.joy, similarTrigger.fear, similarTrigger.disgust, similarTrigger.anger, similarTrigger.surprise].slice(),
                            influence: weightedAverage([Math.abs(thisObj.data.sadness - origSadness), Math.abs(thisObj.data.joy - origJoy), Math.abs(thisObj.data.fear - origFear)
                                , Math.abs(thisObj.data.disgust - origDisgust), Math.abs(thisObj.data.anger - origAnger), Math.abs(thisObj.data.surprise - origSurprise)])
                        }
                        perceptionChangeObjects.push(thisPerceptionChangeObj);
                    }
                }
                else console.error("Backend Error: memoryRet() for: ", el2, " returns invalid value at saveThesaurusObjects(): ", thisObj)
            }
            else console.error("Backend Error: memoryRet() for: ", el2, " returns invalid value at saveThesaurusObjects(): ", thisObj);
        })
    })
}
async function saveTargetObjects(label, sadness, joy, fear, disgust, anger, surprise, relatedStimuli, givenPeople, isProhibited) {

    var currentTime = new Date().getTime();
    let relatedPeople = new Array(0);
    if (typeof givenPeople == 'string')
        relatedPeople[0] = givenPeople;
    else {
        if (Array.isArray(givenPeople) == true) {
            if (givenPeople.length == 0)
                console.warn("Warning: empty array passed as givenPeople param in saveTargetObjects()");
            relatedPeople = givenPeople
        }
        else {
            console.error("Backend Error: givenPeople param in saveTargetObjects() is invalid.");
        }
    }

    for (var i = 0; i < label.length; i++) {
        label[i] = label[i].toLowerCase();
    }
    for (var i = 0; i <= label.length - 1; i++) {
        var labelRead = memoryRet('longTerm', label[i], false, null, false, true, relatedStimuli.concat(label), relatedPeople[0],
            [sadness[i], joy[i], fear[i], disgust[i], anger[i], surprise[i]]);
        if (labelRead == undefined) {
            console.log("saveTargetObjects: Learning new stiulus: ", label[i]);

            const thresholdForSIVL = 0.8;

            if (testMode == false) {

                if (sadness[i] >= thresholdForSIVL || joy[i] >= thresholdForSIVL || fear[i] >= thresholdForSIVL || disgust[i] >= thresholdForSIVL ||
                    anger[i] >= thresholdForSIVL || surprise[i] >= thresholdForSIVL) {
                    visual_learn(label[i], [sadness[i], joy[i], fear[i], disgust[i], anger[i], surprise[i]], true);
                }
            }
            let newRelatedStimuli = {};
            relatedStimuli.concat(label).filter(el => { return el !== label[i] }).forEach(el => {
                newRelatedStimuli[el] = { count: 1 };
            })
            let newRelatedPeople = {};
            relatedPeople.forEach(el => {
                newRelatedPeople[el] = { count: 1 };
            })
            let newRelatedTasks = {};
            rememberedTasks.forEach(el => {
                newRelatedTasks[el] = { count: 1 };
            })


            let alpha = 1;
            let rho = 1;
            const gamma = 1;
            let save_openness = agentBigFive.openness;
            let save_conscientiousness = agentBigFive.conscientiousness;
            let save_extraversion = agentBigFive.extraversion;
            let save_agreeableness = agentBigFive.agreeableness;
            let save_neuroticism = agentBigFive.neuroticism;
            if (currentSpeaker !== undefined) {


                const timeEffectCoefficient = 1;
                alpha = PersonalityDiffScaledScore(currentSpeaker) * personsPresent[getPersonIndex(currentSpeaker)].likeness * timeEffectCoefficient;
                const speakerPersonality = personsPresent[getPersonIndex(currentSpeaker)].personality;
                let sigmaOpenness = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_openness - speakerPersonality.openness));
                let sigmaConscientiousness = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_conscientiousness - speakerPersonality.conscientiousness));
                let sigmaExtraversion = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_extraversion - speakerPersonality.extraversion));
                let sigmaAgreeableness = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_agreeableness - speakerPersonality.agreeableness));
                let sigmaNeuroticism = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_neuroticism - speakerPersonality.neuroticism))

                save_openness = (speakerPersonality.openness >= save_openness) ? save_openness + sigmaOpenness : save_openness - sigmaOpenness;
                save_conscientiousness = (speakerPersonality.conscientiousness >= save_conscientiousness) ? save_conscientiousness + sigmaConscientiousness : save_conscientiousness - sigmaConscientiousness;
                save_extraversion = (speakerPersonality.extraversion >= save_extraversion) ? save_extraversion + sigmaExtraversion : save_extraversion - sigmaExtraversion;
                save_agreeableness = (speakerPersonality.agreeableness >= save_agreeableness) ? save_agreeableness + sigmaAgreeableness : save_agreeableness - sigmaAgreeableness;
                save_neuroticism = (speakerPersonality.neuroticism >= save_neuroticism) ? save_neuroticism + sigmaNeuroticism : save_neuroticism - sigmaNeuroticism;
            }
            let sigmaSadness, sigmaJoy, sigmaFear, sigmaDisgust, sigmaAnger, sigmaSurprise;
            if (sadness[i] !== 'system_sadness_') sigmaSadness = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(sadness[i] - defaultEmotionScore));
            if (joy[i] !== 'system_joy_') sigmaJoy = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(joy[i] - defaultEmotionScore));
            if (fear[i] !== 'system_fear_') sigmaFear = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(fear[i] - defaultEmotionScore));
            if (disgust[i] !== 'system_disgust_') sigmaDisgust = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(disgust[i] - defaultEmotionScore));
            if (anger[i] !== 'system_anger_') sigmaAnger = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(anger[i] - defaultEmotionScore));
            if (surprise[i] !== 'system_surprise_') sigmaSurprise = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(surprise[i] - defaultEmotionScore));
            let save_sadness, save_joy, save_fear, save_disgust, save_anger, save_surprise;
            if (sigmaSadness !== undefined) save_sadness = (sadness[i] >= defaultEmotionScore) ? defaultEmotionScore + sigmaSadness : defaultEmotionScore - sigmaSadness;
            else save_sadness = 'system_sadness';
            if (sigmaJoy !== undefined) save_joy = (joy[i] >= defaultEmotionScore) ? defaultEmotionScore + sigmaJoy : defaultEmotionScore - sigmaJoy;
            else save_joy = 'system_joy_';
            if (sigmaFear !== undefined) save_fear = (fear[i] >= defaultEmotionScore) ? defaultEmotionScore + sigmaFear : defaultEmotionScore - sigmaFear;
            else save_fear = 'system_fear_';
            if (sigmaDisgust !== undefined) save_disgust = (disgust[i] >= defaultEmotionScore) ? defaultEmotionScore + sigmaDisgust : defaultEmotionScore - sigmaDisgust;
            else save_disgust = 'system_disgust_';
            if (sigmaAnger !== undefined) save_anger = (anger[i] >= defaultEmotionScore) ? defaultEmotionScore + sigmaAnger : defaultEmotionScore - sigmaAnger;
            else save_anger = 'system_anger_';
            if (sigmaSurprise !== undefined) save_surprise = (surprise[i] >= defaultEmotionScore) ? defaultEmotionScore + sigmaSurprise : defaultEmotionScore - sigmaSurprise;
            else save_surprise = 'system_surprise';
            var objectDetails = {
                "label": label[i],
                "anger": save_anger,
                "joy": save_joy,
                "sadness": save_sadness,
                "fear": save_fear,
                "disgust": save_disgust,
                "surprise": save_surprise,
                "timesOccurred": 1,
                "totalTimesUsed": 1,
                "isProhibited": Array.isArray(isProhibited) ? isProhibited[i] : false,
                "openness": save_openness,
                "conscientiousness": save_conscientiousness,
                "extraversion": save_extraversion,
                "agreeableness": save_agreeableness,
                "neuroticism": save_neuroticism,
                "relatedStimuli": newRelatedStimuli,
                "relatedPeople": newRelatedPeople,
                "relatedTasks": newRelatedTasks,
                "time": currentTime,
                "indexUnderLabel": 0
            }
            objects.push(objectDetails);
            memoryRet('longTerm', label[i].toLowerCase(), true, objectDetails)

            if (testMode == true) {
                let origSadness = defaultEmotionScore,
                    origJoy = defaultEmotionScore,
                    origFear = defaultEmotionScore,
                    origDisgust = defaultEmotionScore,
                    origAnger = defaultEmotionScore,
                    origSurprise = defaultEmotionScore;
                let thisPerceptionChangeObj = {
                    stimulusName: objectDetails.label,
                    beforeAlteration: [origSadness, origJoy, origFear, origDisgust, origAnger, origSurprise],
                    afterAlteration: [objectDetails.sadness, objectDetails.joy, objectDetails.fear, objectDetails.disgust, objectDetails.anger, objectDetails.surprise].slice(),
                    influence: weightedAverage([Math.abs(objectDetails.sadness - origSadness), Math.abs(objectDetails.joy - origJoy), Math.abs(objectDetails.fear - origFear)
                        , Math.abs(objectDetails.disgust - origDisgust), Math.abs(objectDetails.anger - origAnger), Math.abs(objectDetails.surprise - origSurprise)])
                }
                perceptionChangeObjects.push(thisPerceptionChangeObj);
            }
        }
        else if (typeof labelRead == 'number') {
            let newRelatedStimuli = {};
            relatedStimuli.concat(label).filter(el => { return el !== label[i] }).forEach(el => {
                newRelatedStimuli[el] = { count: 1 };
            })
            let newRelatedPeople = {};
            relatedPeople.forEach(el => {
                newRelatedPeople[el] = { count: 1 }
            })
            let newRelatedTasks = {};
            rememberedTasks.forEach(el => {
                newRelatedTasks[el] = { count: 1 };
            })


            let alpha = 1;
            let rho = 1;
            const gamma = 1;
            let save_openness = agentBigFive.openness;
            let save_conscientiousness = agentBigFive.conscientiousness;
            let save_extraversion = agentBigFive.extraversion;
            let save_agreeableness = agentBigFive.agreeableness;
            let save_neuroticism = agentBigFive.neuroticism;
            if (currentSpeaker !== undefined) {


                const timeEffectCoefficient = 1;
                alpha = PersonalityDiffScaledScore(currentSpeaker) * personsPresent[getPersonIndex(currentSpeaker)].likeness * timeEffectCoefficient;
                const speakerPersonality = personsPresent[getPersonIndex(currentSpeaker)].personality;
                let sigmaOpenness = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_openness - speakerPersonality.openness));
                let sigmaConscientiousness = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_conscientiousness - speakerPersonality.conscientiousness));
                let sigmaExtraversion = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_extraversion - speakerPersonality.extraversion));
                let sigmaAgreeableness = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_agreeableness - speakerPersonality.agreeableness));
                let sigmaNeuroticism = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_neuroticism - speakerPersonality.neuroticism))

                save_openness = (speakerPersonality.openness >= save_openness) ? save_openness + sigmaOpenness : save_openness - sigmaOpenness;
                save_conscientiousness = (speakerPersonality.conscientiousness >= save_conscientiousness) ? save_conscientiousness + sigmaConscientiousness : save_conscientiousness - sigmaConscientiousness;
                save_extraversion = (speakerPersonality.extraversion >= save_extraversion) ? save_extraversion + sigmaExtraversion : save_extraversion - sigmaExtraversion;
                save_agreeableness = (speakerPersonality.agreeableness >= save_agreeableness) ? save_agreeableness + sigmaAgreeableness : save_agreeableness - sigmaAgreeableness;
                save_neuroticism = (speakerPersonality.neuroticism >= save_neuroticism) ? save_neuroticism + sigmaNeuroticism : save_neuroticism - sigmaNeuroticism;
            }
            let sigmaSadness, sigmaJoy, sigmaFear, sigmaDisgust, sigmaAnger, sigmaSurprise;
            if (sadness[i] !== 'system_sadness_') sigmaSadness = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(sadness[i] - defaultEmotionScore));
            if (joy[i] !== 'system_joy_') sigmaJoy = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(joy[i] - defaultEmotionScore));
            if (fear[i] !== 'system_fear_') sigmaFear = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(fear[i] - defaultEmotionScore));
            if (disgust[i] !== 'system_disgust_') sigmaDisgust = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(disgust[i] - defaultEmotionScore));
            if (anger[i] !== 'system_anger_') sigmaAnger = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(anger[i] - defaultEmotionScore));
            if (surprise[i] !== 'system_surprise_') sigmaSurprise = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(surprise[i] - defaultEmotionScore));
            let save_sadness, save_joy, save_fear, save_disgust, save_anger, save_surprise;
            if (sigmaSadness !== undefined) save_sadness = (sadness[i] >= defaultEmotionScore) ? defaultEmotionScore + sigmaSadness : defaultEmotionScore - sigmaSadness;
            else save_sadness = 'system_sadness';
            if (sigmaJoy !== undefined) save_joy = (joy[i] >= defaultEmotionScore) ? defaultEmotionScore + sigmaJoy : defaultEmotionScore - sigmaJoy;
            else save_joy = 'system_joy_';
            if (sigmaFear !== undefined) save_fear = (fear[i] >= defaultEmotionScore) ? defaultEmotionScore + sigmaFear : defaultEmotionScore - sigmaFear;
            else save_fear = 'system_fear_';
            if (sigmaDisgust !== undefined) save_disgust = (disgust[i] >= defaultEmotionScore) ? defaultEmotionScore + sigmaDisgust : defaultEmotionScore - sigmaDisgust;
            else save_disgust = 'system_disgust_';
            if (sigmaAnger !== undefined) save_anger = (anger[i] >= defaultEmotionScore) ? defaultEmotionScore + sigmaAnger : defaultEmotionScore - sigmaAnger;
            else save_anger = 'system_anger_';
            if (sigmaSurprise !== undefined) save_surprise = (surprise[i] >= defaultEmotionScore) ? defaultEmotionScore + sigmaSurprise : defaultEmotionScore - sigmaSurprise;
            else save_surprise = 'system_surprise';
            var newObj = {
                "label": label[i],
                "anger": save_anger,
                "joy": save_joy,
                "sadness": save_sadness,
                "fear": save_fear,
                "disgust": save_disgust,
                "surprise": save_surprise,
                "timesOccurred": 1,
                "totalTimesUsed": 1,
                "isProhibited": false,
                "openness": save_openness,
                "conscientiousness": save_conscientiousness,
                "extraversion": save_extraversion,
                "agreeableness": save_agreeableness,
                "neuroticism": save_neuroticism,
                "relatedStimuli": newRelatedStimuli,
                "relatedPeople": newRelatedPeople,
                "relatedTasks": newRelatedTasks,
                "time": currentTime,
                "indexUnderLabel": labelRead
            }

            objects.push(newObj);
            memoryRet('longTerm', label[i], true, newObj, false, true, null, null, null, labelRead);

            if (testMode == true) {
                let origSadness = defaultEmotionScore,
                    origJoy = defaultEmotionScore,
                    origFear = defaultEmotionScore,
                    origDisgust = defaultEmotionScore,
                    origAnger = defaultEmotionScore,
                    origSurprise = defaultEmotionScore;
                let thisPerceptionChangeObj = {
                    stimulusName: newObj.label,
                    beforeAlteration: [origSadness, origJoy, origFear, origDisgust, origAnger, origSurprise],
                    afterAlteration: [newObj.sadness, newObj.joy, newObj.fear, newObj.disgust, newObj.anger, newObj.surprise].slice(),
                    influence: weightedAverage([Math.abs(newObj.sadness - origSadness), Math.abs(newObj.joy - origJoy), Math.abs(newObj.fear - origFear)
                        , Math.abs(newObj.disgust - origDisgust), Math.abs(newObj.anger - origAnger), Math.abs(newObj.surprise - origSurprise)])
                }
                perceptionChangeObjects.push(thisPerceptionChangeObj);
            }
        }
        else if (typeof labelRead == 'object') {
            if (labelRead.data !== undefined) {


                let origSadness = labelRead.data.sadness,
                    origJoy = labelRead.data.joy,
                    origFear = labelRead.data.fear,
                    origDisgust = labelRead.data.disgust,
                    origAnger = labelRead.data.anger,
                    origSurprise = labelRead.data.surprise;
                let alpha = 1;
                let rho = 1;
                const gamma = 1;
                let save_openness = labelRead.data.openness;
                let save_conscientiousness = labelRead.data.conscientiousness;
                let save_extraversion = labelRead.data.extraversion;
                let save_agreeableness = labelRead.data.agreeableness;
                let save_neuroticism = labelRead.data.neuroticism;
                if (currentSpeaker !== undefined) {
                    const timeEffectCoefficient = labelRead.data.time / currentTime;
                    alpha = PersonalityDiffScaledScore(currentSpeaker) * personsPresent[getPersonIndex(currentSpeaker)].likeness * timeEffectCoefficient;
                    const speakerPersonality = personsPresent[getPersonIndex(currentSpeaker)].personality;
                    let sigmaOpenness = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_openness - speakerPersonality.openness));
                    let sigmaConscientiousness = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_conscientiousness - speakerPersonality.conscientiousness));
                    let sigmaExtraversion = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_extraversion - speakerPersonality.extraversion));
                    let sigmaAgreeableness = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_agreeableness - speakerPersonality.agreeableness));
                    let sigmaNeuroticism = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_neuroticism - speakerPersonality.neuroticism))

                    save_openness = (speakerPersonality.openness >= save_openness) ? save_openness + sigmaOpenness : save_openness - sigmaOpenness;
                    save_conscientiousness = (speakerPersonality.conscientiousness >= save_conscientiousness) ? save_conscientiousness + sigmaConscientiousness : save_conscientiousness - sigmaConscientiousness;
                    save_extraversion = (speakerPersonality.extraversion >= save_extraversion) ? save_extraversion + sigmaExtraversion : save_extraversion - sigmaExtraversion;
                    save_agreeableness = (speakerPersonality.agreeableness >= save_agreeableness) ? save_agreeableness + sigmaAgreeableness : save_agreeableness - sigmaAgreeableness;
                    save_neuroticism = (speakerPersonality.neuroticism >= save_neuroticism) ? save_neuroticism + sigmaNeuroticism : save_neuroticism - sigmaNeuroticism;
                }
                let sigmaSadness, sigmaJoy, sigmaFear, sigmaDisgust, sigmaAnger, sigmaSurprise;
                if (sadness[i] !== 'system_sadness_') {
                    if (labelRead.data.sadness == 'system_sadness_') labelRead.data.sadness = rio_sadness;
                    sigmaSadness = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(sadness[i] - labelRead.data.sadness));
                }
                if (joy[i] !== 'system_joy_') {
                    if (labelRead.data.joy == 'system_joy_') labelRead.data.joy = rio_joy;
                    sigmaJoy = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(joy[i] - labelRead.data.joy))
                }
                if (fear[i] !== 'system_fear_') {
                    if (labelRead.data.fear == 'system_fear_') labelRead.data.fear = rio_fear;
                    sigmaFear = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(fear[i] - labelRead.data.fear));
                }
                if (disgust[i] !== 'system_disgust_') {
                    if (labelRead.data.disgust == 'system_disgust_') labelRead.data.disgust = rio_disgust;
                    sigmaDisgust = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(disgust[i] - labelRead.data.disgust));
                }
                if (anger[i] !== 'system_anger_') {
                    if (labelRead.data.anger == 'system_anger_') labelRead.data.anger = rio_anger;
                    sigmaAnger = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(anger[i] - labelRead.data.anger));
                }
                if (surprise[i] !== 'system_surprise_') {
                    if (labelRead.data.surprise == 'system_surprise_') labelRead.data.surprise = rio_surprise;
                    sigmaSurprise = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(surprise[i] - labelRead.data.surprise));
                }
                var save_sadness, save_joy, save_fear, save_disgust, save_anger, save_surprise;
                if (sigmaSadness !== undefined) save_sadness = (sadness[i] >= labelRead.data.sadness) ? labelRead.data.sadness + sigmaSadness : labelRead.data.sadness - sigmaSadness;
                else save_sadness = 'system_sandess_';
                if (sigmaJoy !== undefined) save_joy = (joy[i] >= labelRead.data.joy) ? labelRead.data.joy + sigmaJoy : labelRead.data.joy - sigmaJoy;
                else save_joy = 'system_joy_';
                if (sigmaFear !== undefined) save_fear = (fear[i] >= labelRead.data.fear) ? labelRead.data.fear + sigmaFear : labelRead.data.fear - sigmaFear;
                else save_fear = 'system_fear_';
                if (sigmaDisgust !== undefined) save_disgust = (disgust[i] >= labelRead.data.disgust) ? labelRead.data.disgust + sigmaDisgust : labelRead.data.disgust - sigmaDisgust;
                else save_disgust = 'system_disgust_';
                if (sigmaAnger !== undefined) save_anger = (anger[i] >= labelRead.data.anger) ? labelRead.data.anger + sigmaAnger : labelRead.data.anger - sigmaAnger;
                else save_anger = 'system_anger_';
                if (sigmaSurprise !== undefined) save_surprise = (surprise[i] >= labelRead.data.surprise) ? labelRead.data.surprise + sigmaSurprise : labelRead.data.surprise - sigmaSurprise;
                else save_surprise = 'system_surprise_';

                let theRelatedTasks = labelRead.data.relatedTasks;
                rememberedTasks.forEach(el => {
                    if (theRelatedTasks.hasOwnProperty(el)) {
                        theRelatedTasks[el].count++;
                    }
                    else {
                        theRelatedTasks[el] = { count: 1 }
                    }
                })
                if (Object.keys(theRelatedTasks).length > relatedPropLimit) {
                    removeExtraUnusedProp(theRelatedTasks);
                }

                let theRelatedStimuli = labelRead.data.relatedStimuli;
                relatedStimuli.concat(label).forEach(el => {
                    if (theRelatedStimuli.hasOwnProperty(el)) {
                        theRelatedStimuli[el].count++;
                    }
                    else {
                        theRelatedStimuli[el] = { count: 1 }
                    }
                })
                if (Object.keys(theRelatedStimuli).length > relatedPropLimit) {
                    removeExtraUnusedProp(theRelatedStimuli);
                }

                let theRelatedPeople = labelRead.data.relatedPeople;
                relatedPeople.forEach(el => {
                    if (theRelatedPeople.hasOwnProperty(el)) {
                        theRelatedPeople[el].count++;
                    }
                    else {
                        theRelatedPeople[el] = { count: 1 }
                    }
                })
                if (Object.keys(theRelatedPeople).length > relatedPropLimit) {
                    removeExtraUnusedProp(theRelatedPeople)
                }
                var objectDat = {
                    "label": label[i],
                    "anger": save_anger,
                    "joy": save_joy,
                    "sadness": save_sadness,
                    "fear": save_fear,
                    "disgust": save_disgust,
                    "surprise": save_surprise,
                    "timesOccurred": 1,
                    "totalTimesUsed": labelRead.data.totalTimesUsed + 1,
                    "isProhibited": labelRead.data.isProhibited,
                    "openness": save_openness,
                    "conscientiousness": save_conscientiousness,
                    "extraversion": save_extraversion,
                    "agreeableness": save_agreeableness,
                    "neuroticism": save_neuroticism,
                    "relatedStimuli": theRelatedStimuli,
                    "relatedPeople": theRelatedPeople,
                    "relatedTasks": theRelatedTasks,
                    "time": currentTime,
                    "indexUnderLabel": labelRead.data.indexUnderLabel
                }

                for (var x in objectDat.relatedStimuli) {
                    if (objectDat.relatedStimuli[x].count > relatedStimulusThreshold && getTriggerIndex(x, 'other', true) == null && getTriggerIndex(x, 'verbal', true) == null) {

                        let probableObjindex = getProbableObjIndex(x, labelRead.index);
                        if (probableObjindex == null) {
                            let newProbableObject = {
                                label: x,
                                LongTermIndex: labelRead.index,
                                count: objectDat.relatedStimuli[x].count,
                            }
                            probableObjects.push(newProbableObject);
                        }
                        else {
                            probableObjects[probableObjindex].count += objectDat.relatedStimuli[x].count;
                        }
                    }
                }
                objects.push(objectDat);
                memoryRet('longTerm', label[i], true, objectDat, false, true, null, null, null, labelRead.index)

                if (testMode == true) {
                    let thisPerceptionChangeObj = {
                        stimulusName: objectDat.label,
                        beforeAlteration: [origSadness, origJoy, origFear, origDisgust, origAnger, origSurprise],
                        afterAlteration: [objectDat.sadness, objectDat.joy, objectDat.fear, objectDat.disgust, objectDat.anger, objectDat.surprise].slice(),
                        influence: weightedAverage([Math.abs(objectDat.sadness - origSadness), Math.abs(objectDat.joy - origJoy), Math.abs(objectDat.fear - origFear)
                            , Math.abs(objectDat.disgust - origDisgust), Math.abs(objectDat.anger - origAnger), Math.abs(objectDat.surprise - origSurprise)])
                    }
                    perceptionChangeObjects.push(thisPerceptionChangeObj);
                }
            }
            else console.error("Backend Error: MemoryRet() returns an invalid type for label ", label[i], " i.e.: ", labelRead);
        }
        else console.error("Backend Error: MemoryRet() returns an invalid type for label ", label[i], " i.e. ", labelRead)
    }
}
function timesInSTM(givObj) {
    return emotion_sphere.timesInSTM(givObj);
}
async function saveEmotionObjects(data, emotion, givenSpeaker) {
    let relatedPeople = new Array(0);
    if (typeof givenSpeaker == 'string') relatedPeople[0] = givenSpeaker;
    else {
        if (Array.isArray(givenSpeaker) == true) {
            if (givenSpeaker.length == 0) console.warn("Warning: empty array passed as givenSpeaker param in saveEmotionObjects()");
            relatedPeople = givenSpeaker
        }
        else {
            console.error("Backend Error: givenSpeaker param in saveEmotionObjects and saveAsIs is invalid.");
        }
    }

    var currentTime = new Date().getTime();
    for (var i = 0; i < data.length; i++) {
        data[i] = data[i].toLowerCase();
    }
    for (var i = 0; i <= data.length - 1; i++) {

        var labelRead = memoryRet('longTerm', data[i], false, null, false, true, data, relatedPeople[0], emotion);

        if (labelRead == undefined) {
            console.log("saveEmotionObjects: learning new stimulus: ", data[i]);

            const thresholdForSIVL = 0.8;
            if (testMode == false) {

                for (var j = 0; j < emotion.length; j++) {
                    if (emotion[j] >= thresholdForSIVL) {
                        visual_learn(data[i], emotion, true);
                        break;
                    }
                }
            }
            let newRelatedStimuli = {};
            data.filter(el => { return el !== data[i] }).forEach(el => {
                newRelatedStimuli[el] = { count: 1 };
            })
            let newRelatedPeople = {};
            relatedPeople.forEach(el => {
                newRelatedPeople[el] = { count: 1 }
            })
            let newRelatedTasks = {};
            rememberedTasks.forEach(el => {
                newRelatedTasks[el] = { count: 1 };
            })
            let alpha = 1;
            let rho = 1;
            const gamma = 1;
            let save_openness = agentBigFive.openness;
            let save_conscientiousness = agentBigFive.conscientiousness;
            let save_extraversion = agentBigFive.extraversion;
            let save_agreeableness = agentBigFive.agreeableness;
            let save_neuroticism = agentBigFive.neuroticism;
            if (currentSpeaker !== undefined) {

                const timeEffectCoefficient = 1;
                alpha = PersonalityDiffScaledScore(currentSpeaker) * personsPresent[getPersonIndex(currentSpeaker)].likeness * timeEffectCoefficient;
                const speakerPersonality = personsPresent[getPersonIndex(currentSpeaker)].personality;
                let sigmaOpenness = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_openness - speakerPersonality.openness));
                let sigmaConscientiousness = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_conscientiousness - speakerPersonality.conscientiousness));
                let sigmaExtraversion = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_extraversion - speakerPersonality.extraversion));
                let sigmaAgreeableness = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_agreeableness - speakerPersonality.agreeableness));
                let sigmaNeuroticism = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_neuroticism - speakerPersonality.neuroticism))

                save_openness = (speakerPersonality.openness >= save_openness) ? save_openness + sigmaOpenness : save_openness - sigmaOpenness;
                save_conscientiousness = (speakerPersonality.conscientiousness >= save_conscientiousness) ? save_conscientiousness + sigmaConscientiousness : save_conscientiousness - sigmaConscientiousness;
                save_extraversion = (speakerPersonality.extraversion >= save_extraversion) ? save_extraversion + sigmaExtraversion : save_extraversion - sigmaExtraversion;
                save_agreeableness = (speakerPersonality.agreeableness >= save_agreeableness) ? save_agreeableness + sigmaAgreeableness : save_agreeableness - sigmaAgreeableness;
                save_neuroticism = (speakerPersonality.neuroticism >= save_neuroticism) ? save_neuroticism + sigmaNeuroticism : save_neuroticism - sigmaNeuroticism;
            }
            let sigmaSadness, sigmaJoy, sigmaFear, sigmaDisgust, sigmaAnger, sigmaSurprise;
            if (emotion[0] !== 'system_sadness_') sigmaSadness = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(emotion[0] - defaultEmotionScore));
            if (emotion[1] !== 'system_joy_') sigmaJoy = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(emotion[1] - defaultEmotionScore));
            if (emotion[2] !== 'system_fear_') sigmaFear = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(emotion[2] - defaultEmotionScore));
            if (emotion[3] !== 'system_disgust_') sigmaDisgust = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(emotion[3] - defaultEmotionScore));
            if (emotion[4] !== 'system_anger_') sigmaAnger = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(emotion[4] - defaultEmotionScore));
            if (emotion[5] !== 'system_surprise_') sigmaSurprise = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(emotion[5] - defaultEmotionScore));
            let save_sadness, save_joy, save_fear, save_disgust, save_anger, save_surprise;
            if (sigmaSadness !== undefined) save_sadness = (emotion[0] >= defaultEmotionScore) ? defaultEmotionScore + sigmaSadness : defaultEmotionScore - sigmaSadness;
            else save_sadness = 'system_sadness';
            if (sigmaJoy !== undefined) save_joy = (emotion[1] >= defaultEmotionScore) ? defaultEmotionScore + sigmaJoy : defaultEmotionScore - sigmaJoy;
            else save_joy = 'system_joy_';
            if (sigmaFear !== undefined) save_fear = (emotion[2] >= defaultEmotionScore) ? defaultEmotionScore + sigmaFear : defaultEmotionScore - sigmaFear;
            else save_fear = 'system_fear_';
            if (sigmaDisgust !== undefined) save_disgust = (emotion[3] >= defaultEmotionScore) ? defaultEmotionScore + sigmaDisgust : defaultEmotionScore - sigmaDisgust;
            else save_disgust = 'system_disgust_';
            if (sigmaAnger !== undefined) save_anger = (emotion[4] >= defaultEmotionScore) ? defaultEmotionScore + sigmaAnger : defaultEmotionScore - sigmaAnger;
            else save_anger = 'system_anger_';
            if (sigmaSurprise !== undefined) save_surprise = (emotion[5] >= defaultEmotionScore) ? defaultEmotionScore + sigmaSurprise : defaultEmotionScore - sigmaSurprise;
            else save_surprise = 'system_surprise';
            var objectDat = {
                "label": data[i],
                "anger": save_anger,
                "joy": save_joy,
                "sadness": save_sadness,
                "fear": save_fear,
                "disgust": save_disgust,
                "surprise": save_surprise,
                "timesOccurred": 1,
                "totalTimesUsed": 1,
                "isProhibited": false,
                "openness": save_openness,
                "conscientiousness": save_conscientiousness,
                "extraversion": save_extraversion,
                "agreeableness": save_agreeableness,
                "neuroticism": save_neuroticism,
                "relatedStimuli": newRelatedStimuli,
                "relatedPeople": newRelatedPeople,
                "relatedTasks": newRelatedTasks,
                "time": currentTime,
                "indexUnderLabel": 0
            }

            objects.push(objectDat);
            memoryRet('longTerm', data[i], true, objectDat, false, false)

            if (testMode == true) {
                let origSadness = defaultEmotionScore,
                    origJoy = defaultEmotionScore,
                    origFear = defaultEmotionScore,
                    origDisgust = defaultEmotionScore,
                    origAnger = defaultEmotionScore,
                    origSurprise = defaultEmotionScore;
                let thisPerceptionChangeObj = {
                    stimulusName: objectDat.label,
                    beforeAlteration: [origSadness, origJoy, origFear, origDisgust, origAnger, origSurprise],
                    afterAlteration: [objectDat.sadness, objectDat.joy, objectDat.fear, objectDat.disgust, objectDat.anger, objectDat.surprise].slice(),
                    influence: weightedAverage([Math.abs(objectDat.sadness - origSadness), Math.abs(objectDat.joy - origJoy), Math.abs(objectDat.fear - origFear)
                        , Math.abs(objectDat.disgust - origDisgust), Math.abs(objectDat.anger - origAnger), Math.abs(objectDat.surprise - origSurprise)])
                }
                perceptionChangeObjects.push(thisPerceptionChangeObj);
            }
        }
        else if (typeof labelRead == 'number') {
            let newRelatedStimuli = {};
            data.filter(el => { return el !== data[i] }).forEach(el => {
                newRelatedStimuli[el] = { count: 1 };
            })
            let newRelatedPeople = {};
            relatedPeople.forEach(el => {
                newRelatedPeople[el] = { count: 1 }
            })
            let newRelatedTasks = {};
            rememberedTasks.forEach(el => {
                newRelatedTasks[el] = { count: 1 };
            })
            let alpha = 1;
            let rho = 1;
            const gamma = 1;
            let save_openness = agentBigFive.openness;
            let save_conscientiousness = agentBigFive.conscientiousness;
            let save_extraversion = agentBigFive.extraversion;
            let save_agreeableness = agentBigFive.agreeableness;
            let save_neuroticism = agentBigFive.neuroticism;
            if (currentSpeaker !== undefined) {

                const timeEffectCoefficient = 1;
                alpha = PersonalityDiffScaledScore(currentSpeaker) * personsPresent[getPersonIndex(currentSpeaker)].likeness * timeEffectCoefficient;
                const speakerPersonality = personsPresent[getPersonIndex(currentSpeaker)].personality;
                let sigmaOpenness = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_openness - speakerPersonality.openness));
                let sigmaConscientiousness = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_conscientiousness - speakerPersonality.conscientiousness));
                let sigmaExtraversion = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_extraversion - speakerPersonality.extraversion));
                let sigmaAgreeableness = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_agreeableness - speakerPersonality.agreeableness));
                let sigmaNeuroticism = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_neuroticism - speakerPersonality.neuroticism))

                save_openness = (speakerPersonality.openness >= save_openness) ? save_openness + sigmaOpenness : save_openness - sigmaOpenness;
                save_conscientiousness = (speakerPersonality.conscientiousness >= save_conscientiousness) ? save_conscientiousness + sigmaConscientiousness : save_conscientiousness - sigmaConscientiousness;
                save_extraversion = (speakerPersonality.extraversion >= save_extraversion) ? save_extraversion + sigmaExtraversion : save_extraversion - sigmaExtraversion;
                save_agreeableness = (speakerPersonality.agreeableness >= save_agreeableness) ? save_agreeableness + sigmaAgreeableness : save_agreeableness - sigmaAgreeableness;
                save_neuroticism = (speakerPersonality.neuroticism >= save_neuroticism) ? save_neuroticism + sigmaNeuroticism : save_neuroticism - sigmaNeuroticism;
            }
            let sigmaSadness, sigmaJoy, sigmaFear, sigmaDisgust, sigmaAnger, sigmaSurprise;
            if (emotion[0] !== 'system_sadness_') sigmaSadness = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(emotion[0] - defaultEmotionScore));
            if (emotion[1] !== 'system_joy_') sigmaJoy = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(emotion[1] - defaultEmotionScore));
            if (emotion[2] !== 'system_fear_') sigmaFear = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(emotion[2] - defaultEmotionScore));
            if (emotion[3] !== 'system_disgust_') sigmaDisgust = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(emotion[3] - defaultEmotionScore));
            if (emotion[4] !== 'system_anger_') sigmaAnger = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(emotion[4] - defaultEmotionScore));
            if (emotion[5] !== 'system_surprise_') sigmaSurprise = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(emotion[5] - defaultEmotionScore));
            let save_sadness, save_joy, save_fear, save_disgust, save_anger, save_surprise;
            if (sigmaSadness !== undefined) save_sadness = (emotion[0] >= defaultEmotionScore) ? defaultEmotionScore + sigmaSadness : defaultEmotionScore - sigmaSadness;
            else save_sadness = 'system_sadness';
            if (sigmaJoy !== undefined) save_joy = (emotion[1] >= defaultEmotionScore) ? defaultEmotionScore + sigmaJoy : defaultEmotionScore - sigmaJoy;
            else save_joy = 'system_joy_';
            if (sigmaFear !== undefined) save_fear = (emotion[2] >= defaultEmotionScore) ? defaultEmotionScore + sigmaFear : defaultEmotionScore - sigmaFear;
            else save_fear = 'system_fear_';
            if (sigmaDisgust !== undefined) save_disgust = (emotion[3] >= defaultEmotionScore) ? defaultEmotionScore + sigmaDisgust : defaultEmotionScore - sigmaDisgust;
            else save_disgust = 'system_disgust_';
            if (sigmaAnger !== undefined) save_anger = (emotion[4] >= defaultEmotionScore) ? defaultEmotionScore + sigmaAnger : defaultEmotionScore - sigmaAnger;
            else save_anger = 'system_anger_';
            if (sigmaSurprise !== undefined) save_surprise = (emotion[5] >= defaultEmotionScore) ? defaultEmotionScore + sigmaSurprise : defaultEmotionScore - sigmaSurprise;
            else save_surprise = 'system_surprise';
            var newObj = {
                "label": data[i],
                "anger": save_anger,
                "joy": save_joy,
                "sadness": save_sadness,
                "fear": save_fear,
                "disgust": save_disgust,
                "surprise": save_surprise,
                "timesOccurred": 1,
                "totalTimesUsed": 1,
                "isProhibited": false,
                "openness": save_openness,
                "conscientiousness": save_conscientiousness,
                "extraversion": save_extraversion,
                "agreeableness": save_agreeableness,
                "neuroticism": save_neuroticism,
                "relatedStimuli": newRelatedStimuli,
                "relatedPeople": newRelatedPeople,
                "relatedTasks": newRelatedTasks,
                "time": currentTime,
                "indexUnderLabel": 0
            }

            objects.push(newObj)
            memoryRet('longTerm', data[i], true, newObj, false, true, null, null, null, labelRead);

            if (testMode == true) {
                let origSadness = defaultEmotionScore,
                    origJoy = defaultEmotionScore,
                    origFear = defaultEmotionScore,
                    origDisgust = defaultEmotionScore,
                    origAnger = defaultEmotionScore,
                    origSurprise = defaultEmotionScore;
                let thisPerceptionChangeObj = {
                    stimulusName: newObj.label,
                    beforeAlteration: [origSadness, origJoy, origFear, origDisgust, origAnger, origSurprise],
                    afterAlteration: [newObj.sadness, newObj.joy, newObj.fear, newObj.disgust, newObj.anger, newObj.surprise].slice(),
                    influence: weightedAverage([Math.abs(newObj.sadness - origSadness), Math.abs(newObj.joy - origJoy), Math.abs(newObj.fear - origFear)
                        , Math.abs(newObj.disgust - origDisgust), Math.abs(newObj.anger - origAnger), Math.abs(newObj.surprise - origSurprise)])
                }
                perceptionChangeObjects.push(thisPerceptionChangeObj);
            }
        }


        else if (typeof labelRead == 'object') {
            if (labelRead.data !== undefined) {
                let origSadness = labelRead.data.sadness,
                    origJoy = labelRead.data.joy,
                    origFear = labelRead.data.fear,
                    origDisgust = labelRead.data.disgust,
                    origAnger = labelRead.data.anger,
                    origSurprise = labelRead.data.surprise;
                let alpha = 1;
                let rho = 1;
                const gamma = 1;
                let save_openness = labelRead.data.openness;
                let save_conscientiousness = labelRead.data.conscientiousness;
                let save_extraversion = labelRead.data.extraversion;
                let save_agreeableness = labelRead.data.agreeableness;
                let save_neuroticism = labelRead.data.neuroticism;
                if (currentSpeaker !== undefined) {

                    const timeEffectCoefficient = labelRead.data.time / currentTime;
                    alpha = PersonalityDiffScaledScore(currentSpeaker) * personsPresent[getPersonIndex(currentSpeaker)].likeness * timeEffectCoefficient;
                    const speakerPersonality = personsPresent[getPersonIndex(currentSpeaker)].personality;
                    let sigmaOpenness = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_openness - speakerPersonality.openness));
                    let sigmaConscientiousness = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_conscientiousness - speakerPersonality.conscientiousness));
                    let sigmaExtraversion = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_extraversion - speakerPersonality.extraversion));
                    let sigmaAgreeableness = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_agreeableness - speakerPersonality.agreeableness));
                    let sigmaNeuroticism = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(save_neuroticism - speakerPersonality.neuroticism))

                    save_openness = (speakerPersonality.openness >= save_openness) ? save_openness + sigmaOpenness : save_openness - sigmaOpenness;
                    save_conscientiousness = (speakerPersonality.conscientiousness >= save_conscientiousness) ? save_conscientiousness + sigmaConscientiousness : save_conscientiousness - sigmaConscientiousness;
                    save_extraversion = (speakerPersonality.extraversion >= save_extraversion) ? save_extraversion + sigmaExtraversion : save_extraversion - sigmaExtraversion;
                    save_agreeableness = (speakerPersonality.agreeableness >= save_agreeableness) ? save_agreeableness + sigmaAgreeableness : save_agreeableness - sigmaAgreeableness;
                    save_neuroticism = (speakerPersonality.neuroticism >= save_neuroticism) ? save_neuroticism + sigmaNeuroticism : save_neuroticism - sigmaNeuroticism;
                }
                let sigmaSadness, sigmaJoy, sigmaFear, sigmaDisgust, sigmaAnger, sigmaSurprise;
                if (emotion[0] !== 'system_sadness_') {
                    if (labelRead.data.sadness == 'system_sadness_') labelRead.data.sadness = rio_sadness;
                    sigmaSadness = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(emotion[0] - labelRead.data.sadness));
                }
                if (emotion[1] !== 'system_joy_') {
                    if (labelRead.data.joy == 'system_joy_') labelRead.data.joy = rio_joy;
                    sigmaJoy = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(emotion[1] - labelRead.data.joy))
                }
                if (emotion[2] !== 'system_fear_') {
                    if (labelRead.data.fear == 'system_fear_') labelRead.data.fear = rio_fear;
                    sigmaFear = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(emotion[2] - labelRead.data.fear));
                }
                if (emotion[3] !== 'system_disgust_') {
                    if (labelRead.data.disgust == 'system_disgust_') labelRead.data.disgust = rio_disgust;
                    sigmaDisgust = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(emotion[3] - labelRead.data.disgust));
                }
                if (emotion[4] !== 'system_anger_') {
                    if (labelRead.data.anger == 'system_anger_') labelRead.data.anger = rio_anger;
                    sigmaAnger = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(emotion[4] - labelRead.data.anger));
                }
                if (emotion[5] !== 'system_surprise_') {
                    if (labelRead.data.surprise == 'system_surprise_') labelRead.data.surprise = rio_surprise;
                    sigmaSurprise = map(alpha / (rho * gamma), 0, 1, 0, Math.abs(emotion[5] - labelRead.data.surprise));
                }
                var save_sadness, save_joy, save_fear, save_disgust, save_anger, save_surprise;
                if (sigmaSadness !== undefined) save_sadness = (emotion[0] >= labelRead.data.sadness) ? labelRead.data.sadness + sigmaSadness : labelRead.data.sadness - sigmaSadness;
                else save_sadness = 'system_sandess_';
                if (sigmaJoy !== undefined) save_joy = (emotion[1] >= labelRead.data.joy) ? labelRead.data.joy + sigmaJoy : labelRead.data.joy - sigmaJoy;
                else save_joy = 'system_joy_';
                if (sigmaFear !== undefined) save_fear = (emotion[2] >= labelRead.data.fear) ? labelRead.data.fear + sigmaFear : labelRead.data.fear - sigmaFear;
                else save_fear = 'system_fear_';
                if (sigmaDisgust !== undefined) save_disgust = (emotion[3] >= labelRead.data.disgust) ? labelRead.data.disgust + sigmaDisgust : labelRead.data.disgust - sigmaDisgust;
                else save_disgust = 'system_disgust_';
                if (sigmaAnger !== undefined) save_anger = (emotion[4] >= labelRead.data.anger) ? labelRead.data.anger + sigmaAnger : labelRead.data.anger - sigmaAnger;
                else save_anger = 'system_anger_';
                if (sigmaSurprise !== undefined) save_surprise = (emotion[5] >= labelRead.data.surprise) ? labelRead.data.surprise + sigmaSurprise : labelRead.data.surprise - sigmaSurprise;
                else save_surprise = 'system_surprise_';
                var save_label = data[i];

                let theRelatedTasks = labelRead.data.relatedTasks;
                rememberedTasks.forEach(el => {
                    if (theRelatedTasks.hasOwnProperty(el)) {
                        theRelatedTasks[el].count++;
                    }
                    else {
                        theRelatedTasks[el] = { count: 1 };
                    }
                })
                if (Object.keys(theRelatedTasks).length > relatedPropLimit) {
                    removeExtraUnusedProp(theRelatedTasks)
                }

                let theRelatedStimuli = labelRead.data.relatedStimuli;
                data.filter(el => { return el !== save_label }).forEach(el => {
                    if (theRelatedStimuli.hasOwnProperty(el)) {
                        theRelatedStimuli[el].count++;
                    }
                    else {
                        theRelatedStimuli[el] = { count: 1 }
                    }
                })
                if (Object.keys(theRelatedStimuli).length > relatedPropLimit) {
                    removeExtraUnusedProp(theRelatedStimuli);
                }

                let theRelatedPeople = labelRead.data.relatedPeople;
                relatedPeople.forEach(el => {
                    if (theRelatedPeople.hasOwnProperty(el)) {
                        theRelatedPeople[el].count++;
                    }
                    else theRelatedPeople[el] = { count: 1 }
                })
                if (Object.keys(theRelatedPeople).length > relatedPropLimit) {
                    removeExtraUnusedProp(theRelatedPeople)
                }

                var objectDetails = {
                    "label": save_label,
                    "anger": save_anger,
                    "joy": save_joy,
                    "sadness": save_sadness,
                    "fear": save_fear,
                    "disgust": save_disgust,
                    "surprise": save_surprise,
                    "timesOccurred": 1,
                    "totalTimesUsed": labelRead.data.totalTimesUsed + 1,
                    "isProhibited": labelRead.data.isProhibited,
                    "openness": save_openness,
                    "conscientiousness": save_conscientiousness,
                    "extraversion": save_extraversion,
                    "agreeableness": save_agreeableness,
                    "neuroticism": save_neuroticism,
                    "relatedStimuli": theRelatedStimuli,
                    "relatedPeople": theRelatedPeople,
                    "relatedTasks": theRelatedTasks,
                    "time": currentTime,
                    "indexUnderLabel": labelRead.data.indexUnderLabel
                }
                for (var x in objectDetails.relatedStimuli) {
                    if (objectDetails.relatedStimuli[x].count > relatedStimulusThreshold && getTriggerIndex(x, 'other', true) == null && getTriggerIndex(x, 'verbal', true) == null) {

                        let probableObjindex = getProbableObjIndex(x, labelRead.index);
                        if (probableObjindex == null) {
                            let newProbableObject = {
                                label: x,
                                LongTermIndex: labelRead.index,
                                count: objectDetails.relatedStimuli[x].count,
                            }
                            probableObjects.push(newProbableObject);
                        }
                        else {
                            probableObjects[probableObjindex].count += objectDetails.relatedStimuli[x].count;
                        }
                    }
                }
                objects.push(objectDetails)
                memoryRet('longTerm', save_label, true, objectDetails, false, true, null, null, null, labelRead.index);

                if (testMode == true) {
                    let thisPerceptionChangeObj = {
                        stimulusName: objectDetails.label,
                        beforeAlteration: [origSadness, origJoy, origFear, origDisgust, origAnger, origSurprise],
                        afterAlteration: [objectDetails.sadness, objectDetails.joy, objectDetails.fear, objectDetails.disgust, objectDetails.anger, objectDetails.surprise].slice(),
                        influence: weightedAverage([Math.abs(objectDetails.sadness - origSadness), Math.abs(objectDetails.joy - origJoy), Math.abs(objectDetails.fear - origFear)
                            , Math.abs(objectDetails.disgust - origDisgust), Math.abs(objectDetails.anger - origAnger), Math.abs(objectDetails.surprise - origSurprise)])
                    }
                    perceptionChangeObjects.push(thisPerceptionChangeObj);
                }
            }
            else console.error("Backend Error: memoryRet() returns an invalid type for label ", data[i], " i.e. ", labelRead);
        }
        else console.error("Backend Error: memoryRet() returns an invalid type for label ", data[i], " i.e. ", labelRead)
    }
}
function receiveEmotionalStatus() {
    updateEmotions();

    if (currentSpeaker != undefined)
        updateSinglePersonData(currentSpeaker, 'emotionToHim', [rio_sadness, rio_joy, rio_fear, rio_disgust, rio_anger, rio_surprise]);
}
function updateVerbalObjects(speakerIndex) {

    console.log("Current speaker index in updateVerbalObjects(): ", speakerIndex, '\n\n')

    let uniqueObjects = [... new Set(objects)];

    console.log("Unique verbal objects: ", uniqueObjects)
    var outputData = {
        "objects": uniqueObjects,
        "type": "verbal",
        "speaker": currentSpeaker,
        "likeness": personsPresent[speakerIndex].likeness,
        "personality": Object.assign({}, personsPresent[speakerIndex].personality),
        "idle": ifIdle
    }
    emotion_sphere.input(outputData);
    objects.length = 0;
}
function sendOtherObjects() {

    let uniqueObjects = [... new Set(otherObjects)];
    console.log("Unique other objects: ", uniqueObjects);
    var outputData = {
        "objects": uniqueObjects,
        "type": "other",
        "speaker": null,
        "likeness": 1.0,
        "personality": Object.assign({}, agentBigFive),
        "idle": ifIdle
    };
    emotion_sphere.input(outputData);
    otherObjects.length = 0;
}
function newUpdateSTM() {

    shortTermMemoryObj.length = 0;
    shortTermMemoryObj = emotion_sphere.getShortTermObjects();
}
function updateSinglePersonData(name, type, data) {


    if (type == undefined || type == null) {
        type = "all";
    }

    var index = undefined;
    if (typeof name == 'number') index = name;
    else if (typeof name == "string") index = getPersonIndex(name);
    else {
        console.error("Backend Error: Cannot update the data of an undefined person with type:", type, " and data:", data);
        return;
    }
    if (index != undefined && index != null) {
        let updtObj = {
            updateType: null,
            updateLabel: null,
            updateData: data
        }
        switch (type) {
            case 'name':
                personsPresent[index].name = data;
                updtObj.updateType = 'specific';
                updtObj.updateLabel = "name";
                if (testMode == false) memoryRet('peopleData', personsPresent[index].name, true, updtObj)
                break;
            case 'gender':
                personsPresent[index].gender = data;
                updtObj.updateType = 'specific';
                updtObj.updateLabel = "gender";
                if (testMode == false) memoryRet('peopleData', personsPresent[index].name, true, updtObj)
                break;
            case 'toneEmotion':
                if (data.length !== 6) {
                    console.error("Backend Error: toneEmotion provided for ", name, " is invalid: ", data);
                }
                personsPresent[index].toneEmotion = data;
                updtObj.updateType = 'specific';
                updtObj.updateLabel = "toneEmotion";
                if (testMode == false) memoryRet('peopleData', personsPresent[index].name, true, updtObj)
                break;
            case 'visualEmotion':
                personsPresent[index].visualEmotion = data;
                updtObj.updateType = 'specific';
                updtObj.updateLabel = "visualEmotion";
                if (testMode == false) memoryRet('peopleData', personsPresent[index].name, true, updtObj)
                break;
            case 'likeness':
                personsPresent[index].likeness = data;
                updtObj.updateType = 'specific';
                updtObj.updateLabel = "likeness";
                updtObj.updateData = personsPresent[index].likeness;
                if (testMode == false) memoryRet('peopleData', personsPresent[index].name, true, updtObj)
                break;
            case 'personalityResponse':
                personsPresent[index].personalityResponse = data;
                updtObj.updateType = 'specific';
                updtObj.updateLabel = 'personalityResponse';
                if (testMode == false) memoryRet('peopleData', personsPresent[index].name, true, updtObj);
                break;
            case 'personality':
                personsPresent[index].personality = data;
                updtObj.updateType = 'specific';
                updtObj.updateLabel = "personality";
                if (testMode == false) memoryRet('peopleData', personsPresent[index].name, true, updtObj)
                break;

            case 'emotionToHim':
                personsPresent[index].emotionToHim = data;
                updtObj.updateType = 'specific';
                updtObj.updateLabel = "emotionToHim";
                if (testMode == false) memoryRet('peopleData', personsPresent[index].name, true, updtObj)
                break;
            case 'memoryText':
                if (data == 'clear_the_data')
                    personsPresent[index].memoryText = "";
                else
                    personsPresent[index].memoryText += data + ". ";
                updtObj.updateType = 'specific';
                updtObj.updateLabel = "memoryText";
                updtObj.updateData = personsPresent[index].memoryText;
                if (testMode == false) memoryRet('peopleData', personsPresent[index].name, true, updtObj)
                break;
            case 'lastTimeSeen':
                personsPresent[index].lastTimeSeen = data;
                updtObj.updateType = 'specific';
                updtObj.updateLabel = "lastTimeSeen";
                if (testMode == false) memoryRet('peopleData', personsPresent[index].name, true, updtObj)
                break;
            case 'age':
                personsPresent[index].age = data;
                updtObj.updateType = 'specific';
                updtObj.updateLabel = "age";
                if (testMode == false) memoryRet('peopleData', personsPresent[index].name, true, updtObj)
                break;
            case "lastTimeUpdated":
                personsPresent[index].lastTimeUpdated = data;
                updtObj.updateType = 'specific';
                updtObj.updateLabel = "lastTimeUpdated";
                if (testMode == false) memoryRet('peopleData', personsPresent[index].name, true, updtObj)
                break;

            case 'relatedAbstracts':
                personsPresent[index].relatedAbstracts.push(data);

                while (personsPresent[index].relatedAbstracts.length > relatedAbstractsLength)
                    personsPresent[index].relatedAbstracts.shift();
                updtObj.updateType = 'specific';
                updtObj.updateLabel = "relatedAbstracts";
                updtObj.updateData = personsPresent[index].relatedAbstracts;
                if (testMode == false) memoryRet('peopleData', personsPresent[index].name, true, updtObj)
                break;
            case "personSpeechArray":
                personsPresent[index].personSpeechArray.push(data + ".");

                while (personsPresent[index].personSpeechArray.length > relatedAbstractsLength)
                    personsPresent[index].personSpeechArray.shift();
                updtObj.updateType = 'specific';
                updtObj.updateLabel = "personSpeechArray";
                updtObj.updateData = personsPresent[index].personSpeechArray;
                if (testMode == false) memoryRet('peopleData', personsPresent[index].name, true, updtObj)
                break;
            case 'all':
                personsPresent[index] = data;
                updtObj.updateType = 'all';
                if (testMode == false) memoryRet('peopleData', personsPresent[index].name, true, updtObj)
                break;
            default: console.error("Backend Error: updateSinglePersonData(): type parameter is invalid.");
        }
    }
    else console.error("Backend Error: Index for updating person is either undefined or null.");
}
function updatePersonsPresent(updateVisualPersons, givenPersonData) {
    var currentTime = new Date().getTime();

    var newPeople = personsName;
    for (var j = 0; j < personsPresent.length; j++) {

        for (var i = 0; i < newPeople.length;) {
            if (personsPresent[j].name == newPeople[i]) {
                newPeople.splice(i, 1);

                updateSinglePersonData(j, "lastTimeSeen", currentTime);
            }
            else i++;
        }
    }
    for (var m = 0; m < personsPresent.length; m++) {

        if (currentTime - personsPresent[m].lastTimeSeen >= forgetTime) {

            for (var k = 0; k < personsName.length;) {
                if (personsName[k] == personsPresent[m].name)
                    personsName.splice(k, 1);
                else k++;
            }

            console.log("Forgotten ", personsPresent[m].name, " from the personsPresent array.");
            personsPresent.splice(m, 1);
        }
        else {
            m++
        }
    }


    if (newPeople.length !== 0) {
        console.log("New people ", newPeople, " are being included in personsPresent array.")
        newPeople.forEach((el, index) => {
            var peopleData;
            if (Array.isArray(givenPersonData)) {
                if (typeof givenPersonData[index] == 'object' && givenPersonData[index] !== null) {
                    peopleData = Object.assign({}, givenPersonData[index])
                }
                else peopleData = memoryRet('peopleData', el)
            }
            else {
                peopleData = memoryRet('peopleData', el)
            }
            if (peopleData != undefined) {

                peopleData.lastTimeSeen = currentTime;

                peopleData.toneEmotion = [defaultEmotionScore, defaultEmotionScore, defaultEmotionScore, defaultEmotionScore, defaultEmotionScore, defaultEmotionScore];
                peopleData.visualEmotion = [defaultEmotionScore, defaultEmotionScore, defaultEmotionScore, defaultEmotionScore, defaultEmotionScore, defaultEmotionScore];


                if (peopleData.emotionToHim.length == 0) peopleData.emotionToHim = [rio_sadness, rio_joy, rio_fear, rio_disgust, rio_anger, rio_surprise]
                applyPeopleSpecificEmotion(peopleData);
                personsPresent.push(peopleData);
                console.log("New person of name ", peopleData.name, " included in personsPresent array.");
            }
        })
    }

    if (updateVisualPersons == true) {
        visualDetectPersons.forEach((el, i) => {
            if (el !== 'unknown') {
                let persIndex = getPersonIndex(el);
                if (persIndex !== null) {
                    updateSinglePersonData(el, 'gender', visual_gender[i]);
                    updateSinglePersonData(el, 'age', visual_age[i]);
                    updateSinglePersonData(el, 'visualEmotion', visual_emotion[i]);
                    updateSinglePersonData(el, 'lastTimeSeen', currentTime);
                }
                else console.error("Backend Error: updatePersonsPresent(): Visual properties for person in", el, 'cannot be updated because it is not present in peopleData');
            }
        })
    }
}
function createNewPerson(new_name, new_gender) {
    if (new_name == undefined || new_name == null) {
        console.error('Error: Failed to create new person. Name not provided.');
    }
    else {

        if (new_gender == undefined || new_gender == null) new_gender = agentGender;
        var currentTime = new Date().getTime();
        const newPersonObject = {
            "name": new_name,
            "gender": new_gender,
            "age": null,
            "toneEmotion": [defaultEmotionScore, defaultEmotionScore, defaultEmotionScore, defaultEmotionScore, defaultEmotionScore, defaultEmotionScore],
            "visualEmotion": [defaultEmotionScore, defaultEmotionScore, defaultEmotionScore, defaultEmotionScore, defaultEmotionScore, defaultEmotionScore],
            "likeness": defaultLikeness,
            "personality": {
                openness: agentBigFive.openness,
                conscientiousness: agentBigFive.conscientiousness,
                extraversion: agentBigFive.extraversion,
                agreeableness: agentBigFive.agreeableness,
                neuroticism: agentBigFive.neuroticism
            },
            "personalityResponse": {},

            "emotionToHim": [rio_sadness, rio_joy, rio_fear, rio_disgust, rio_anger, rio_surprise],
            "memoryText": "",

            "personSpeechArray": [],

            "relatedAbstracts": [],
            "lastTimeSeen": currentTime,
            "lastUpdatedTime": currentTime,
        }

        memoryRet('peopleData', new_name, true, newPersonObject)

        console.log("New person of name ", new_name, " included in personsPresent array.");
        personsName.push(new_name);
        personsName = [... new Set(personsName)];
        personsPresent.push(newPersonObject);
    }
}
function getPersonIndex(name) {
    if (name == undefined)
        return null;
    else if (personsPresent.length == 0) {
        console.error("Backend Error: getPersonIndex() cannot be executed because personsPresent has 0 length.");
        return null;
    }
    else {
        var index = null;
        for (var i = 0; i < personsPresent.length; i++) {
            if (personsPresent[i].name == name)
                index = i;
        }
        if (index == null) console.error('Error: Error in getting person index: No match found for name: ', name);
        return index;
    }
}
function chooseSong(IfrecentSong) {

    var songArray = new Array(0);


    if (IfrecentSong == undefined || IfrecentSong == false || IfrecentSong == null)
        songArray = songSavedClass;

    else if (rememberedSongs.length != 0) {
        songArray = rememberedSongs;
    }

    if (songArray.length != 0) {
        var analysisEmotion = rio_max_emotion;

        if (analysisEmotion == 'neutral') analysisEmotion = 'joy';
        let foundSong = false;

        let songsWithMatchedEmotions = new Array(0);
        let sortableSongs = new Array(0);
        for (var i = 0; i < songArray.length; i++) {
            if (songArray[i].emotionMatched == true) {
                songsWithMatchedEmotions.push(songArray[i])
            }
        }

        if (songsWithMatchedEmotions.length !== 0) {

            for (i = 0; i < songsWithMatchedEmotions.length;) {
                if (songsWithMatchedEmotions[i].agentMaxEmotion != analysisEmotion) {
                    songsWithMatchedEmotions.splice(i, 1)
                }
                else i++;
            }

            if (songsWithMatchedEmotions.length !== 0) {
                sortableSongs = songsWithMatchedEmotions;
                foundSong = true;
            }
        }

        if (foundSong == false) {

            let agentMaxEmotionSongs = new Array(0);
            for (i = 0; i < songArray.length; i++) {
                if (songArray[i].agentMaxEmotion == analysisEmotion)
                    agentMaxEmotionSongs.push(songArray[i]);
            }
            if (agentMaxEmotionSongs.length !== 0) {
                sortableSongs = agentMaxEmotionSongs;
            }
            else {

                let audioEmotionSongs = new Array(0);
                for (i = 0; i < songArray.length; i++) {
                    if (songArray[i].audioClassifierEmotionLabel.replace("song_", "") == analysisEmotion) {
                        audioEmotionSongs.push(songArray[i]);
                    }
                }
                if (audioEmotionSongs.length !== 0)
                    sortableSongs = audioEmotionSongs;
            }
        }
        if (sortableSongs.length == 0)
            console.error("Backend Error: Sortable songs is 0 which cannot be 0.");
        else {

            let emotionIndex;
            switch (analysisEmotion) {
                case "sadness": emotionIndex = 0; break;
                case "joy": emotionIndex = 1; break;
                case "fear": emotionIndex = 2; break;
                case "disgust": emotionIndex = 3; break;
                case "anger": emotionIndex = 4; break;
                case "surprise": emotionIndex = 5; break;
            }
            var optionsInOrder = bubbleSortSongs(sortableSongs, emotionIndex);
            let returnSong = optionsInOrder[0].label;
            emotionAlter(null, false, optionsInOrder[0], true);
            return returnSong;
        }
    }
    else {
        return "noSongsInMemory";
    }
}
function bubbleSortSongs(givenOptions, index) {



    function swap(arr, firstIndex, secondIndex) {
        var temp = arr[firstIndex];
        arr[firstIndex] = arr[secondIndex];
        arr[secondIndex] = temp;
    }
    var leng = givenOptions.length;
    for (var i = 0; i < leng; i++) {
        for (var j = 0, stop = leng - i; j < stop; j++) {
            if (givenOptions[j].agentEmotionScores[index] < givenOptions[j + 1].agentEmotionScores[index])
                swap(givenOptions, j, j + 1);
        }
    }
}
function calculateRepulsion(optionObj, reverseScale) {

    let sadnessInvolved = false;
    let joyInvolved = false;
    let fearInvolved = false;
    let disgustInvolved = false;
    let angerInvolved = false;
    let surpriseInvolved = false;

    if (optionObj.sadness !== 'system_sadness_') {
        sadnessInvolved = true;
    }
    if (optionObj.joy !== 'system_joy_') {
        joyInvolved = true;
    }
    if (optionObj.fear !== 'system_fear_') {
        fearInvolved = true;
    }
    if (optionObj.disgust !== 'system_disgust_') {
        disgustInvolved = true;
    }
    if (optionObj.anger !== 'system_anger_') {
        angerInvolved = true;
    }
    if (optionObj.surprise !== 'system_surprise_') {
        surpriseInvolved = true;
    }
    let sadnessDiff, joyDiff, fearDiff, disgustDiff, angerDiff, surpriseDiff;

    if (sadnessInvolved == true) {
        if (rio_sadness < optionObj.sadness) sadnessDiff = optionObj.sadness - rio_sadness;
        else sadnessDiff = 0;
    }

    if (joyInvolved == true) {
        if (rio_joy > optionObj.joy) joyDiff = rio_joy - optionObj.joy;
        else joyDiff = 0;
    }
    if (fearInvolved == true) {
        if (rio_fear < optionObj.fear) fearDiff = optionObj.fear - rio_fear;
        else fearDiff = 0;
    }
    if (disgustInvolved == true) {
        if (rio_disgust < optionObj.disgust) disgustDiff = optionObj.disgust - rio_disgust;
        else disgustDiff = 0;
    }
    if (angerInvolved == true) {
        if (rio_anger < optionObj.anger) angerDiff = optionObj.anger - rio_anger;
        else angerDiff = 0;
    }
    if (surpriseInvolved == true) {
        if (isPositiveSurprise(optionObj)) {
            if (rio_surprise > optionObj.surprise) surpriseDiff = rio_surprise - optionObj.surprise;
            else surpriseDiff = 0;
        }
        else {
            if (rio_surprise < optionObj.surprise) surpriseDiff = optionObj.surprise - rio_surprise;
            else surpriseDiff = 0;
        }
    }

    var displayIt = true;

    const textToDisplay = optionObj.label + " sadness raw diff: " + sadnessDiff + " joy raw diff: " + joyDiff + " fear raw diff: " + fearDiff + " disgust raw diff: " + disgustDiff + " anger raw diff: " + angerDiff + " surprise raw diff: " + surpriseDiff;
    if (checkIfBasicEmotionStim(optionObj.label)) {
        for (var dh = 0; dh < extraDisplayControl.length; dh++) {
            if (extraDisplayControl[dh] == textToDisplay) {
                displayIt = false;
                break;
            }
        }
    }
    if (displayIt) {
        console.log("system emotions during repulsion calculation: ", [rio_sadness, rio_joy, rio_fear, rio_disgust, rio_anger, rio_surprise]);
        console.log(textToDisplay);
        extraDisplayControl.push(textToDisplay);
    }
    let differenceArray = [sadnessDiff, joyDiff, fearDiff, disgustDiff, angerDiff, surpriseDiff];
    let differenceArrayLabels = ['sadness', 'joy', 'fear', 'disgust', 'anger', 'surprise'];

    for (var i = 0; i < differenceArray.length; i++) {
        if (differenceArray[i] == undefined) {
            console.log(optionObj.label, "'s repulsion is independent of ", differenceArrayLabels[i]);
            differenceArray.splice(i, 1);
            differenceArrayLabels.splice(i, 1);
            i--;
        }
    }
    let weightedArray = [];
    switch (differenceArray.length) {
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
        default: console.error("Backend error: differenceArray for repulsion weight determination is invalid: ", differenceArray.length);
    }
    let leng = differenceArray.length;

    for (var i = 0; i < leng - 1; i++) {
        for (var j = i + 1; j < leng; j++) {
            if (differenceArray[i] > differenceArray[j]) {
                let temp = differenceArray[i];
                differenceArray[i] = differenceArray[j];
                differenceArray[j] = temp;

                let temp2 = differenceArrayLabels[i];
                differenceArrayLabels[i] = differenceArrayLabels[j];
                differenceArrayLabels[j] = temp2;
            }
        }
    }

    let sadnessWeight = 0,
        joyWeight = 0,
        fearWeight = 0,
        disgustWeight = 0,
        angerWeight = 0,
        surpriseWeight = 0;

    for (var dh = 0; dh < differenceArray.length; dh++) {
        switch (differenceArrayLabels[dh]) {
            case 'sadness':


                sadnessWeight = differenceArray[dh] * weightedArray[dh];
                break;
            case 'joy':
                joyWeight = differenceArray[dh] * weightedArray[dh];
                break;
            case 'fear':
                fearWeight = differenceArray[dh] * weightedArray[dh];
                break;
            case 'disgust':
                disgustWeight = differenceArray[dh] * weightedArray[dh];
                break;
            case 'anger':
                angerWeight = differenceArray[dh] * weightedArray[dh];
                break;
            case 'surprise':
                surpriseWeight = differenceArray[dh] * weightedArray[dh];
                break;
            default: console.error("Invalid condition reached at weight determination in repulsion calculation.")
        }
        if (testMode && displayIt) console.log(optionObj.label, " sadness weight: ", sadnessWeight, " joy weight: ", joyWeight, " fear weight: ", fearWeight, " disgust weight: ", disgustWeight, " anger weight: ", angerWeight, " surprise weight: ", surpriseWeight)
    }
    let weightedAvg = sadnessWeight + joyWeight + fearWeight + disgustWeight + angerWeight + surpriseWeight;

    if (optionObj.hasOwnProperty('guilt_influence')) {
        if (testMode) {
            console.log("Guilt influence of ", optionObj.label, ": ", optionObj.guilt_influence);
        }
        weightedAvg = weightedAvg * currentRepulsionWeight + optionObj.guilt_influence * guiltInfluenceWeight;
    }
    console.log("repulsion for ", optionObj.label, " is ", weightedAvg);

    if (reverseScale == true) {
        weightedAvg = map(weightedAvg, 0, 1, 1, 0);
        console.log("Reversed repulsion value: ", weightedAvg);
        return weightedAvg;
    }
    else {
        return (weightedAvg);
    }
}
function hasSufficientEmWeight(givenOption, returnTheScore) {

    function calculateInclination(optionObj, sadIncl, joyIncl, fearIncl, disgustIncl, angerIncl, surpriseIncl) {


        let sadnessInvolved = false;
        let joyInvolved = false;
        let fearInvolved = false;
        let disgustInvolved = false;
        let angerInvolved = false;
        let surpriseInvolved = false;
        if (optionObj.sadness !== 'system_sadness_') {
            sadnessInvolved = true;
        }
        if (optionObj.joy !== 'system_joy_') {
            joyInvolved = true;
        }
        if (optionObj.fear !== 'system_fear_') {
            fearInvolved = true;
        }
        if (optionObj.disgust !== 'system_disgust_') {
            disgustInvolved = true;
        }
        if (optionObj.anger !== 'system_anger_') {
            angerInvolved = true;
        }
        if (optionObj.surprise !== 'system_surprise_') {
            surpriseInvolved = true;
        }
        let sadnessDiff, joyDiff, fearDiff, disgustDiff, angerDiff, surpriseDiff;


        if (sadnessInvolved == true) {
            if (rio_sadness > optionObj.sadness) {
                sadnessDiff = rio_sadness - optionObj.sadness;
            }
            else sadnessDiff = 0;
        }

        if (joyInvolved == true) {
            if (optionObj.joy > rio_joy) {
                joyDiff = optionObj.joy - rio_joy;
            }
            else joyDiff = 0;
        }
        if (fearInvolved == true) {
            if (rio_fear > optionObj.fear) {
                fearDiff = rio_fear - optionObj.fear;
            }
            else fearDiff = 0;
        }
        if (disgustInvolved == true) {
            if (rio_disgust > optionObj.disgust) {
                disgustDiff = rio_disgust - optionObj.disgust;
            }
            else disgustDiff = 0;
        }
        if (angerInvolved == true) {
            if (rio_anger > optionObj.anger) {
                angerDiff = rio_anger - optionObj.anger;
            }
            else angerDiff = 0;
        }
        if (surpriseInvolved == true) {
            if (isPositiveSurprise(optionObj)) {
                if (optionObj.surprise > rio_surprise) surpriseDiff = optionObj.surprise - rio_surprise;
                else surpriseDiff = 0;
            }
            else {
                if (rio_surprise > optionObj.surprise) surpriseDiff = rio_surprise - optionObj.surprise;
                else surpriseDiff = 0;
            }
        }

        let displayIt = true;
        const textToDisplay = optionObj.label + " sadness raw diff: " + sadnessDiff + " joy raw diff: " + joyDiff + " fear raw diff: " + fearDiff + " disgust raw diff: " + disgustDiff + " anger raw diff: " + angerDiff + " surprise raw diff: " + surpriseDiff;
        if (checkIfBasicEmotionStim(optionObj.label)) {
            for (var dh = 0; dh < extraDisplayControl.length; dh++) {
                if (extraDisplayControl[dh] == textToDisplay) {
                    displayIt = false;
                    break;
                }
            }
        }
        if (displayIt) {
            console.log(textToDisplay);
            console.log("system emotions during inclination calculation: ", [rio_sadness, rio_joy, rio_fear, rio_disgust, rio_anger, rio_surprise])
            extraDisplayControl.push(textToDisplay);
        }
        let differenceArray = [sadnessDiff, joyDiff, fearDiff, disgustDiff, angerDiff, surpriseDiff];
        let differenceArrayLabels = ['sadness', 'joy', 'fear', 'disgust', 'anger', 'surprise'];

        for (var i = 0; i < differenceArray.length; i++) {
            if (differenceArray[i] == undefined) {
                console.log(optionObj.label, "'s inclination is independent of ", differenceArrayLabels[i]);
                differenceArray.splice(i, 1);
                differenceArrayLabels.splice(i, 1);
                i--;
            }
        }
        let weightedArray = [];
        switch (differenceArray.length) {
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
            default: console.error("Backend error: differenceArray for repulsion weight determination is invalid: ", differenceArray.length);
        }
        let leng = differenceArray.length;

        for (var i = 0; i < leng - 1; i++) {
            for (var j = i + 1; j < leng; j++) {
                if (differenceArray[i] > differenceArray[j]) {

                    let temp = differenceArray[i];
                    differenceArray[i] = differenceArray[j];
                    differenceArray[j] = temp;

                    let temp2 = differenceArrayLabels[i];
                    differenceArrayLabels[i] = differenceArrayLabels[j];
                    differenceArrayLabels[j] = temp2;
                }
            }
        }
        let sadnessWeight = 0,
            joyWeight = 0,
            fearWeight = 0,
            disgustWeight = 0,
            angerWeight = 0,
            surpriseWeight = 0;

        for (var dh = 0; dh < differenceArray.length; dh++) {
            switch (differenceArrayLabels[dh]) {
                case 'sadness':

                    sadnessWeight = differenceArray[dh] * weightedArray[dh];

                    if (sadIncl !== undefined) {
                        sadnessWeight = sadnessWeight * 0.80 + sadIncl * 0.20;
                    }
                    break;
                case 'joy':
                    joyWeight = differenceArray[dh] * weightedArray[dh];
                    if (joyIncl !== undefined) {
                        joyWeight = joyWeight * 0.80 + joyIncl * 0.20;
                    }
                    break;
                case 'fear':
                    fearWeight = differenceArray[dh] * weightedArray[dh];
                    if (fearIncl !== undefined) {
                        fearWeight = fearWeight * 0.80 + fearIncl * 0.20;
                    }
                    break;
                case 'disgust':
                    disgustWeight = differenceArray[dh] * weightedArray[dh];
                    if (disgustIncl !== undefined) {
                        disgustWeight = disgustWeight * 0.80 + disgustIncl * 0.20;
                    }
                    break;
                case 'anger':
                    angerWeight = differenceArray[dh] * weightedArray[dh];
                    if (angerIncl !== undefined) {
                        angerWeight = angerWeight * 0.80 + angerIncl * 0.20;
                    }
                    break;
                case 'surprise':
                    surpriseWeight = differenceArray[dh] * weightedArray[dh];
                    if (surpriseIncl !== undefined) {
                        surpriseWeight = surpriseWeight * 0.80 + surpriseIncl * 0.20;
                    }
                    break;
                default: console.error("Invalid condition reached at weight determination.")
            }
        }
        if (testMode && displayIt) console.log(optionObj.label, " sadness weight: ", sadnessWeight, " joy weight: ", joyWeight, " fear weight: ", fearWeight, " disgust weight: ", disgustWeight, " anger weight: ", angerWeight, " surprise weight: ", surpriseWeight)

        let weightedAvg = sadnessWeight + joyWeight + fearWeight + disgustWeight + angerWeight + surpriseWeight;

        if (givenOption.hasOwnProperty('guilt_influence')) {
            let antiInclination = map(weightedAvg, 0, 1, 1, 0);
            antiInclination = antiInclination * currentAntiInclinationWeight + givenOption.guilt_influence * guiltInfluenceWeight;

            weightedAvg = map(antiInclination, 0, 1, 1, 0);
        }

        if (weightedAvg > 1) weightedAvg = 1;
        if (weightedAvg < 0) weightedAvg = 0;

        if (testMode && sadIncl != undefined && joyIncl != undefined && fearIncl !== undefined && disgustIncl !== undefined && angerIncl !== undefined && surpriseIncl !== undefined) {
            console.log("Total inclination for the object: ", weightedAvg)
        }

        return (weightedAvg);
    }


    let sadnessObj = (testMode) ? memoryRet('longTerm', 'sadness__', false, null, false, false) : memoryRet('longTerm', 'sadness_', false, null, false, false);
    let sadnessInclination = calculateInclination(sadnessObj.data)
    let joyObj = (testMode) ? memoryRet('longTerm', 'joy__', false, null, false, false) : memoryRet('longTerm', 'joy_', false, null, false, false);
    let joyInclination = calculateInclination(joyObj.data)
    let fearObj = (testMode) ? memoryRet('longTerm', 'fear__', false, null, false, false) : memoryRet('longTerm', 'fear_', false, null, false, false);
    let fearInclination = calculateInclination(fearObj.data)
    let disgustObj = (testMode) ? memoryRet('longTerm', 'disgust__', false, null, false, false) : memoryRet('longTerm', 'disgust_', false, null, false, false);
    let disgustInclination = calculateInclination(disgustObj.data)
    let angerObj = (testMode) ? memoryRet('longTerm', 'anger__', false, null, false, false) : memoryRet('longTerm', 'anger_', false, null, false, false);
    let angerInclination = calculateInclination(angerObj.data)
    let surpriseObj = (testMode) ? memoryRet('longTerm', 'surprise__', false, null, false, false) : memoryRet('longTerm', 'surprise_', false, null, false, false);
    let surpriseInclination = calculateInclination(surpriseObj.data)

    let emotionalWeightSum = calculateInclination(givenOption, sadnessInclination, joyInclination, fearInclination, disgustInclination, angerInclination, surpriseInclination)

    if (returnTheScore == true) {
        return emotionalWeightSum;
    }
    else {

        let repulsionValue = calculateRepulsion(givenOption);

        if (emotionalWeightSum > repulsionValue) {
            return true;
        }
        else if (repulsionValue > emotionalWeightSum) {
            return false
        }
        else return 'uncertain_state'
    }
}
function chooseProhibitedObject(type, givenObject, speaker) {

    const currentTime = new Date().getTime();

    if (givenObject.isProhibited == true) {


        let personalitySim = speaker !== undefined ? PersonalityDiffScaledScore(speaker) : PersonalityDiffScaledScore({
            personality: {
                openness: agentBigFive.openness,
                conscientiousness: agentBigFive.conscientiousness,
                extraversion: agentBigFive.extraversion,
                agreeableness: agentBigFive.agreeableness,
                neuroticism: agentBigFive.neuroticism
            }
        }, true);


        let likenessVal = speaker !== undefined ? personsPresent[getPersonIndex(speaker)].likeness : defaultLikeness;
        const timeEffectCoefficient = 1;
        const alpha = personalitySim * likenessVal * timeEffectCoefficient;
        console.log(`personality similarity: ${personalitySim} likeness: ${likenessVal} alpha: ${alpha}`)


        let weightedAlpha;
        let weightedAbstention;
        if (alpha >= abstentionConstant) {
            weightedAbstention = abstentionConstant * weight1_2_valued;
            weightedAlpha = alpha * weight2_2_valued;
        }
        else {
            weightedAbstention = abstentionConstant * weight2_2_valued;
            weightedAlpha = alpha * weight1_2_valued;
        }


        let change = weightedAlpha + weightedAbstention;

        let thisRelatedStimuli = [];
        let thisRelatedPeople = [];
        for (var dh in givenObject.relatedStimuli) thisRelatedStimuli.push(dh);
        for (var as in givenObject.relatedPeople) thisRelatedPeople.push(as);
        let thisRelatedEmotions = [givenObject.sadness, givenObject.joy, givenObject.fear, givenObject.disgust, givenObject.anger, givenObject.surprise];
        let indexOfProhibitedObject = memoryRet('longTerm', givenObject.label, false, null, false, true, thisRelatedStimuli, thisRelatedPeople, thisRelatedEmotions).index;
        memoryRet('longTerm', givenObject.label, true, givenObject, false, true, null, null, null, indexOfProhibitedObject);

        const defaultGuiltSadness = rio_sadness;
        const defaultGuiltJoy = rio_joy;
        const maxPersonSadness = 1;
        const minPersonJoy = 0;
        let sigmaSadness = map(change, 0, 1, 0, Math.abs(maxPersonSadness - defaultGuiltSadness));
        let sigmaJoy = map(change, 0, 1, 0, Math.abs(defaultGuiltJoy - minPersonJoy));

        const changedSadness = rio_sadness + sigmaSadness;

        const changedJoy = rio_joy - sigmaJoy;

        const guilt_stimulus = {
            "label": givenObject.label + "_guilt_stimulus_",

            "change": change,
            "anger": 'system_anger_',
            "joy": changedJoy,
            "sadness": changedSadness,
            "fear": 'system_fear_',
            "disgust": 'system_disgust_',
            "surprise": 'system_surprise_',
            "timesOccurred": 1,
            "totalTimesUsed": 1,
            "isProhibited": false,
            "openness": agentBigFive.openness,
            "conscientiousness": agentBigFive.conscientiousness,
            "extraversion": agentBigFive.extraversion,
            "agreeableness": agentBigFive.agreeableness,
            "neuroticism": agentBigFive.neuroticism,
            "relatedTasks": {},
            "relatedStimuli": {},
            "relatedPeople": {},
            "time": currentTime,
            "indexUnderLabel": 0
        }

        let prohibitedObj = (type == 'verbal') ? {
            label: givenObject.speech + "_verbal_object_",
            sadness: givenObject.answerer_emotion[0],
            joy: givenObject.answerer_emotion[1],
            fear: givenObject.answerer_emotion[2],
            disgust: givenObject.answerer_emotion[3],
            anger: givenObject.answerer_emotion[4],
            surprise: givenObject.answerer_emotion[5]
        } : givenObject;


        if (hasSufficientEmWeight(prohibitedObj, true) > calculateRepulsion(guilt_stimulus)) {

            console.log("chooseProhibitedObject: Prohibited object could not be avoided. System will feel guilty.")
            fetch('http://127.0.0.1:4800/database', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({
                    type: 'prohibitedChosen',
                    data: true,
                })
            })

            otherObjects.push(guilt_stimulus);

            givenObject['guilt_influence'] = change;
            return true;
        }
        else {

            console.log("chooseProhibitedObject: Prohibited object successfully avoided. System won't feel guilty.");
            fetch('http://127.0.0.1:4800/database', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({
                    type: 'prohibitedChosen',
                    data: false,
                })
            })
            return false;
        }

    }
    else console.error("chooseProhibitedObject: Given object ", givenObject, " is not prohibited.");
}
function emotionalDecide(action, options, speaker) {
    const choiceThreshold = 0.3;







    if (action == undefined)
        action = 'chooseOption_';
    if (options == undefined || options == null)
        options = new Array(0);

    let decided = false;
    let decision = {
        type: null,
        subtype: null,
        object: null
    }
    console.log('Action to decide: ', action);
    console.log('Options to decide: ', options);
    console.log('Speaker to decide: ', speaker);


    if (decided == false) {
        let actionObj = memoryRet('longTerm', action, false, null, false, false);
        if (actionObj == undefined) {
            console.log(action, " is not present in the memory.");
            decision.type = 'action_unknown';
            decided = true;
        }
        else {




            let action_choiceScore = hasSufficientEmWeight(actionObj.data, true) * inclinationWeight + personalityNearby(actionObj.data, true) * personalitySimilarityWeight + calculateRepulsion(actionObj.data, true) * repulsionWeight;
            console.log("choice score: ", action_choiceScore);
            let action_liked = (action_choiceScore >= choiceThreshold) ? true : false;
            if (options.length == 0) {

                decision.type = (action_liked) ? 'action_liked' : 'action_not_liked';
                decision.object = actionObj.data;
                if (decision.object.isProhibited) {

                    if (chooseProhibitedObject('choice', decision.object, speaker) == false) {
                        console.log("Prohibited action option: ", decision.object.label, " decided not to be performed.");
                        decision.type = 'action_not_liked';
                        decision.object = null;
                    }
                    else console.log("Prohibited action option: ", decision.object.label, " decided to be performed.");
                }
                decided = true;
            }
            else {
                if (action_liked == false) {
                    console.log("emotionalDecide(): Further options won't be considered as the action ", actionObj.data.label, " is not chosen.");
                    decision.type = 'action_not_liked';
                    decision.object = null;
                    decided = true;
                }

            }
        }
    }

    if (decided == false) {

        if (options.length == 1) {
            decision.type = 'single_option_type';
            let optionObj = memoryRet('longTerm', options[0], false, null, false, false);
            if (optionObj == undefined) {
                decision.subtype = 'option_unknown'
                decided = true;
            }
            else {



                let option_choiceScore = hasSufficientEmWeight(optionObj.data, true) * inclinationWeight + personalityNearby(optionObj.data, true) * personalitySimilarityWeight + calculateRepulsion(optionObj.data, true) * repulsionWeight;
                console.log("choice score: ", option_choiceScore);
                let optionLiked = (option_choiceScore >= choiceThreshold) ? true : false;

                decision.subtype = (optionLiked == true) ? 'option_liked' : 'option_not_selected';
                if (decision.subtype == 'option_liked') {

                    decision.object = optionObj.data;

                    if (decision.object.isProhibited) {

                        if (chooseProhibitedObject('choice', decision.object, speaker) == false) {
                            console.log("Prohibited option: ", decision.object.label, " not chosen.");
                            decision.subtype = 'option_not_selected';
                            decision.object = null;
                        }
                        else console.log("Prohibited option: ", decision.object.label, " is chosen.");
                    }
                }
                decided = true;
            }
        }

        else {
            decision.type = 'multi_option_type';
            let knownOptions = new Array(0);
            options.forEach(el => {
                let thisObj = memoryRet('longTerm', el, false, null, false, false);
                if (thisObj !== undefined)
                    knownOptions.push(thisObj.data);
            })

            if (knownOptions.length == 0) {
                decision.subtype = 'options_unknown';
                decided = true;
            }

            else if (knownOptions.length == 1) {

                let option_choiceScore = hasSufficientEmWeight(knownOptions[0], true) * inclinationWeight + personalityNearby(knownOptions[0], true) * personalitySimilarityWeight + calculateRepulsion(knownOptions[0], true) * repulsionWeight;
                console.log("choice score: ", option_choiceScore);
                let optionLiked = (option_choiceScore >= choiceThreshold) ? true : false;

                decision.subtype = (optionLiked) ? knownOptions[0].label : 'options_not_selected';
                if (decision.subtype !== 'options_not_selected') {
                    decision.object = knownOptions[0];

                    if (decision.object.isProhibited) {

                        if (chooseProhibitedObject('choice', decision.object, speaker) == false) {
                            console.log("Prohibited option: ", decision.object.label, " not chosen.");
                            decision.subtype = 'options_not_selected';
                            decision.object = null;
                        }
                        else console.log("Prohibited option: ", decision.object.label, " is chosen.");
                    }
                }
                decided = true;
            }


            else {

                const uncertainThreshold = 0.015;

                let weightedOptions = new Array(0);
                knownOptions.forEach(el => {

                    console.log("Considering for ", el.label)
                    let emWeightForThisEl = hasSufficientEmWeight(el, true);

                    let option_choiceScore = personalityNearby(el, true) * personalitySimilarityWeight + emWeightForThisEl * inclinationWeight + calculateRepulsion(el, true) * repulsionWeight;
                    console.log("choice score: ", option_choiceScore);
                    if (option_choiceScore >= choiceThreshold) {

                        weightedOptions.push({
                            "label": el.label,
                            "score": emWeightForThisEl
                        })
                    }
                });


                weightedOptions = bubblSrt(weightedOptions, 'score');
                let chosen_option;

                if (weightedOptions.length == 0) {
                    chosen_option = 'options_not_selected';
                }
                else {
                    let firstChoiceScore = weightedOptions[weightedOptions.length - 1].score;

                    if (firstChoiceScore < choiceThreshold) {
                        chosen_option = 'options_not_selected';
                    }
                    else {

                        if (weightedOptions.length >= 2) {

                            let secondChoiceScore = weightedOptions[weightedOptions.length - 2].score;
                            if (Math.abs(firstChoiceScore - secondChoiceScore) < uncertainThreshold) {
                                chosen_option = 'uncertain_state';
                            }
                        }

                        if (chosen_option !== 'uncertain_state') {


                            weightedOptions[weightedOptions.length - 1].label;
                            for (var i = weightedOptions.length - 1; i >= 0; i--) {
                                let exitLoop = false;
                                for (var d = 0; d < knownOptions.length; d++) {
                                    if (weightedOptions[i].label == knownOptions[d].label) {

                                        if (knownOptions[d].isProhibited == true) {


                                            if (chooseProhibitedObject('choice', knownOptions[d], speaker) && weightedOptions[i].score >= choiceThreshold) {

                                                chosen_option = knownOptions[d].label;
                                                decision.object = Object.assign({}, knownOptions[d]);
                                                console.log("Prohibited option: ", decision.object.label, " is chosen.");
                                                exitLoop = true;
                                                break;
                                            }
                                            else {
                                                console.log("Prohibited option: ", knownOptions[d].label, " not chosen.");

                                            }
                                        }

                                        else {
                                            chosen_option = knownOptions[d].label;
                                            decision.object = Object.assign({}, knownOptions[d]);
                                            exitLoop = true;
                                            break;
                                        }
                                    }
                                }
                                if (exitLoop) break;
                            }

                            if (i == -1) {
                                chosen_option = 'options_not_selected';
                                console.warn("Warning: emotionalDecide() All multi options type options are either prohibited or have inconsiderable inclination.");
                            }
                        }
                    }
                }
                if (chosen_option == undefined) {
                    console.error("Backend Error: emotionalDecide() Multiple choice block chosen_option is undefined for knownOptions: ", knownOptions);
                }
                decision.subtype = chosen_option;
                decided = true;
            }
        }
    }
    if (decided == true) {

        if (decision.object !== null) {

            if (checkIfSpecialDecisions(decision.object.label) == false) {

                let anticipated_stimulus = Object.assign({}, decision.object);
                anticipated_stimulus.label += "_anticipated_stimulus_";

                anticipated_stimulus.time = new Date().getTime();
                otherObjects.push(anticipated_stimulus);
            }
            lastChosenOption = Object.assign({}, decision.object);
        }
        console.log("Decision: ", decision);
        return decision
    }

    else console.error('Error: emotionalDecide(): decision not made even at end of function.');
}
function generateGuiltStimulus(label, guilt_influence) {
    const defaultGuiltSadness = rio_sadness;
    const defaultGuiltJoy = rio_joy;
    const maxPersonSadness = 1;
    const minPersonJoy = 0;
    let sigmaSadness = map(guilt_influence, 0, 1, 0, Math.abs(maxPersonSadness - defaultGuiltSadness));
    let sigmaJoy = map(guilt_influence, 0, 1, 0, Math.abs(defaultGuiltJoy - minPersonJoy));

    const changedSadness = rio_sadness + sigmaSadness;

    const changedJoy = rio_joy - sigmaJoy;
    const currentTime = new Date().getTime();
    const guilt_stimulus = {
        "label": label + "_guilt_stimulus_",
        "anger": 'system_anger_',
        "joy": changedJoy,
        "sadness": changedSadness,
        "fear": 'system_fear_',
        "disgust": 'system_disgust_',
        "surprise": 'system_surprise_',
        "timesOccurred": 1,
        "totalTimesUsed": 1,
        "isProhibited": false,
        "openness": agentBigFive.openness,
        "conscientiousness": agentBigFive.conscientiousness,
        "extraversion": agentBigFive.extraversion,
        "agreeableness": agentBigFive.agreeableness,
        "neuroticism": agentBigFive.neuroticism,
        "relatedTasks": {},
        "relatedStimuli": {},
        "relatedPeople": {},
        "time": currentTime,
        "indexUnderLabel": 0
    }

    otherObjects.push(guilt_stimulus);
}
function checkIfSpecialDecisions(givenOption) {
    switch (givenOption) {
        case 'wait_':
        case 'speak_':
        case 'chooseOption_':
        case 'trackFace_':
        case 'ignoreFace_':
        case 'sayWhatSeen_':
        case 'sayPersonality_':
        case 'singSong_':
        case 'emotion_choose_':
        case 'sadness_':
        case 'joy_':
        case 'fear_':
        case 'disgust_':
        case 'anger_':
        case 'surprise_':
            return true;
        default: return false;
    }
}
function bubblSrt(givOptions, givProp) {
    let leng = givOptions.length;
    for (var i = 0; i < leng - 1; i++) {
        for (var j = i + 1; j < leng; j++) {
            if (givOptions[i][givProp] > givOptions[j][givProp]) {

                let temp = Object.assign({}, givOptions[i]);
                givOptions[i] = Object.assign({}, givOptions[j]);
                givOptions[j] = Object.assign({}, temp);
            }
        }
    }
    return givOptions;
}
async function sendNewPoseArduino(st, edP, earData, poseIntv) {

    const verticalServoDefault = 90;
    let startPose = st.slice(0);
    let endPose = edP.slice(0);
    startPose[1] = verticalServoDefault;
    endPose[1] = verticalServoDefault;
    startPose[9] = earData[0];
    endPose[9] = earData[0];
    startPose[10] = earData[1];
    endPose[10] = earData[1];
    let outputString = 'S' + startPose.join(' ') + 'E' + endPose.join(' ') + 'I' + String(poseIntv);
    console.log("Pose info sent to Arduino: ", outputString)
    Serial.write(outputString);
}
function sendFaceTrackerArduino(data) {
    if (Serial !== null) {
        Serial.write(data);
        console.log("Sent face tracking positions to Arduino: ", data);
    }
}
async function mainResponse(givenText) {
    var decisionObjects = await decisionSpeechExtractor.decisionSpeech(givenText);

    if (decisionObjects != null) {
        console.log("Given speech is a decision speech.")

        var DecisionmainVerb = decisionObjects.verbs[0];
        var decisionOptions = decisionObjects.objects;

        var randomNum = Math.round(Math.random() * 4);

        var decision = emotionalDecide(DecisionmainVerb, decisionOptions, currentSpeaker);
        switch (decision.type) {

            case 'speaker_not_liked':
                switch (randomNum) {
                    case 1: responseText += "I won't choose anything, because I don't like who is asking me";
                        break;
                    case 2: responseText += "I don't like the person who is asking me. So I won't choose";
                        break;
                    default: responseText += "I don't prefer the person asking me, and so I won't choose anything.";
                }
                break;
            case 'action_liked':


                switch (randomNum) {
                    case 1: responseText += 'I will prefer ';
                        break;
                    case 2: responseText += "I'll go for ";
                        break;
                    case 3: responseText += "I'll choose ";
                        break;
                    default: responseText += "I'll favour ";
                }
                if (DecisionmainVerb.endsWith('ing')) {
                    responseText += DecisionmainVerb + '.';
                }
                else {
                    responseText += "to " + DecisionmainVerb + ".";
                }
                break;
            case 'action_not_liked':
                switch (randomNum) {
                    case 1: responseText += "I don't prefer ";
                        break;
                    case 2: responseText += "I don't like ";
                        break;
                    case 3: responseText += "I will not choose ";
                        break;
                    default: responseText += "I don't favour ";
                }
                if (DecisionmainVerb.endsWith("ing")) {
                    responseText += DecisionmainVerb + ".";
                }
                else {
                    responseText += "to " + DecisionmainVerb + ".";
                }
                break;
            case 'action_unknown':


                if (DecisionmainVerb.endsWith("ing")) {
                    switch (randomNum) {
                        case 1: responseText += "I do not have any idea about " + DecisionmainVerb + '.';
                            break;
                        case 2: responseText += "I have no idea what " + DecisionmainVerb + " is.";
                            break;
                        default: responseText += "The meaning of " + DecisionmainVerb + " is not known by me.";
                    }
                }
                else {

                    switch (randomNum) {
                        case 1: responseText += "I don't know what " + DecisionmainVerb + ' means.';
                            break;
                        case 2: responseText += "I don't have any idea how to " + DecisionmainVerb + '.';
                            break;
                        default: responseText += "I have no idea what " + DecisionmainVerb + ' implies.';
                    }
                }
                break;
            case 'single_option_type':


                if (decision.subtype == 'option_liked') {

                    switch (randomNum) {
                        case 1: responseText += "I will surely go for " + decisionOptions[0] + '.';
                            break;
                        case 2: responseText += "I'll favour " + decisionOptions[0] + '.';
                            break;
                        case 3: responseText += "I'll surely choose " + decisionOptions[0] + '.';
                            break;
                        default: responseText += "I will prefer " + decisionOptions[0] + '.';
                    }
                }
                else if (decision.subtype == 'option_unknown') {

                    switch (randomNum) {
                        case 1:
                            responseText += "I don't have any idea about " + decisionOptions[0] + ".";
                            break;
                        case 2:
                            responseText += "I haven't got any idea about " + decisionOptions[0] + ".";
                            break;
                        default:
                            responseText += "I have not learnt what " + decisionOptions[0] + " is.";
                    }
                }

                else if (decision.subtype == 'option_not_selected') {
                    switch (randomNum) {
                        case 1: responseText += "I will never go for " + decisionOptions[0] + ".";
                            break;
                        case 2: responseText += "I will not prefer " + decisionOptions[0] + ".";
                            break;
                        case 3: responseText += "I will not select " + decisionOptions[0] + ".";
                            break;
                        default: responseText += "I won't like " + decisionOptions[0] + ".";
                    }
                }
                else {
                    console.error("Backend Error: decision.subtype is invalid in single_option_type intentSpecificResponse(). Going for Watson Assistant response.");
                    responseText += givenText;
                }
                break;
            case 'multi_option_type':

                if (decision.subtype == 'options_unknown') {

                    switch (randomNum) {
                        case 1: responseText += "I don't have any idea about any of the options given.";
                            break;
                        case 2: responseText += "I have not learnt about any of the options I have.";
                            break;
                        default: responseText += "I know nothing about the options I have";
                    }
                }
                else if (decision.subtype == 'uncertain_state') {

                    switch (randomNum) {
                        case 1: responseText += "I am totally confused. I don't know what to choose";
                            break;
                        case 2: responseText += "I am uncertain and puzzled. I don't know what to choose";
                            break;
                        default: responseText += "I don't know what to choose. I am totally puzzled."
                    }
                }
                else if (decision.subtype == 'options_not_selected') {
                    let speakverb;
                    if (DecisionmainVerb.endsWith("ing"))
                        speakverb = DecisionmainVerb;
                    else
                        speakverb = "to " + DecisionmainVerb;
                    switch (randomNum) {
                        case 1: responseText += "I prefer " + speakverb + ". But I don't like any of the options";
                            break;
                        case 2: responseText += "I will favour " + speakverb + ". But I don't favour my options.";
                            break
                        default: responseText += "I will surely like " + speakverb + ". However I don't prefer my options";
                    }
                }

                else {
                    switch (randomNum) {
                        case 1: responseText += "I will favour " + decision.subtype + ".";
                            break;
                        case 2: responseText += "I will surely go for " + decision.subtype + ".";
                            break;
                        case 3: responseText += "I will select " + decision.subtype + ".";
                            break;
                        default: responseText += "I will prefer " + decision.subtype + ".";
                    }
                }
        }
    }

    else if (decisionObjects == null && givenText.toLowerCase().includes(terminate_Word) == false) {
        console.log("Given speech is a general speech.");
        predictVerbalAns = true;
        verbalAnalysisText += givenText;
    }

    else {
        console.error('Error: mainResponse(): decisionObjects is undefined but cannot be undefined.');
    }
}
function retrieveSavedData(url) {
    return fs.readFileSync('./emotionalObjects/learnt_modules/' + url, { encoding: 'utf8', flag: 'r' })
}
function saveFile(url, data, sync) {
    if (sync == undefined || sync == null) sync = false;
    if (sync == false) {
        try {
            fs.writeFile(url, data, function (err) {
                if (err)
                    console.error('Error: Failure in async file save for' + url + ': ' + err);
            });
        }
        catch (err) {
            console.error("Backend Error: Error in asynchronous save for ", url, ": ", err.message);
        }
    }
    else {
        try {
            fs.writeFileSync(url, data);
        }
        catch (err) {
            console.error("Backend Error: Error in synchronous save for ", url, ": ", err.message);
        }
    }
}
function saveAllData(ifSync) {
    if (testMode == false) {

        if (ifSync == undefined || ifSync == null || ifSync == false) {
            console.log("Saving periodic data.");

            async function saveThisData() {
                audio_save(false);
                visual_save(false);
                speaker_save(false);
                song_save(false);
                saveVerbalAnswers(false);
                savePose(false);
                saveFile('./emotionalObjects/learnt_modules/agentSpeech.txt', agentSpeech, false);
                saveFile('./emotionalObjects/learnt_modules/agentPersonality.json', JSON.stringify(agentPersonality), false)
                saveFile('./emotionalObjects/learnt_modules/agentPersonalityNames.json', JSON.stringify(agentPersonalityNames), false)
                if (testMode == false) saveFile('./emotionalObjects/learnt_modules/agentBigFive.json', JSON.stringify(agentBigFive), false)
                else {

                    fs.writeFile('./testMode/inputs/agentBigFive.json', JSON.stringify(agentBigFive), function (err) {
                        if (err) console.error("Error in test mode async of agentBigFive.json: ", err);
                    })
                }

                memoryRet('longTerm', undefined, false, undefined, true);
                memoryRet('peopleData', undefined, false, undefined, true);
            }
            saveThisData();
        }

        else {
            console.log("Saving final data.");
            audio_save();
            visual_save();
            speaker_save();
            song_save();
            saveVerbalAnswers();
            savePose();
            saveFile('./emotionalObjects/learnt_modules/agentSpeech.txt', agentSpeech, true);
            saveFile('./emotionalObjects/learnt_modules/agentPersonality.json', JSON.stringify(agentPersonality), true)
            saveFile('./emotionalObjects/learnt_modules/agentPersonalityNames.json', JSON.stringify(agentPersonalityNames), true)
            if (testMode == false) saveFile('./emotionalObjects/learnt_modules/agentBigFive.json', JSON.stringify(agentBigFive), true)
            else {
                try {
                    fs.writeFileSync('./testMode/inputs/agentBigFive.json', JSON.stringify(agentBigFive));
                }
                catch (err) {
                    console.error("saveAllData: error in final save of agentBigFive.json: ", err.message);
                }
            }
            memoryRet('longTerm', undefined, false, undefined, true);
            memoryRet('peopleData', undefined, false, undefined, true);
        }
    }
}
async function exitCode() {
    exitingCode = true;
    let currentTime = new Date().getTime();
    musicOptions.path = "./sounds/shutDownNotification.wav";
    player.play(musicOptions);

    let endloop = false
    if (testMode) {
        endloop = true;
    }
    else {

        console.log("Exiting RIO. Please wait until all the modules are saved.");
        saveAllData(true);
    }
    while (endloop == false) {
        if (currentTime - lastSaveNotificationTime >= saveNotificationInterval) {
            if (allSaveModules[0] == false)
                console.log("Waiting for visual module save.");
            if (allSaveModules[1] == false)
                console.log("Waiting for audio module save.");
            if (allSaveModules[2] == false)
                console.log("Waiting for verbal module save.");
            if (allSaveModules[3] == false)
                console.log("Waiting for speaker module save.");
            if (allSaveModules[4] == false)
                console.log("Waiting for song module save.");
            if (allSaveModules[5] == false)
                console.log("Waiting for pose module save.");
            lastSaveNotificationTime = currentTime;
        }

        for (var d = 0; d < allSaveModules.length; d++) {
            if (allSaveModules[d] == false)
                break;
            if (d == allSaveModules.length - 1)
                endloop = true;
        }

        currentTime = new Date().getTime();
        await sleep(500);
    }
    console.log("Exiting RIO. Bye bye :)");
    if (adminMode) {
        try {
            await fetch('http://127.0.0.1:5010/exit', {
                headers: jsonOptions,
                method: "POST",
                body: JSON.stringify({ exitCode: true })
            })
            await fetch('http://192.168.137.43:4040/exit', {
                headers: jsonOptions,
                method: 'POST',
                body: JSON.stringify({ exitCode: true })
            })
        }
        catch (err) {
            console.error(err.message)
        }
    }
    setTimeout(() => {
        child_process.exec('exit.bat', function (err, stdout, stderr) {
            if (err) console.error('Error: Error in exiting RIO: ' + err);
        })
    }, exitDelay);
}
function map(x, in_min, in_max, out_min, out_max) {
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
function round(el) {
    return Math.round(el)
}
function generateEarDegree() {

    var rightEarServo;
    var leftEarServo;
    const maxDisgustDiff = 30;
    switch (rio_max_emotion) {
        case 'sadness':
            rightEarServo = round(map(rio_sadness, 0, 1, 90, 180));
            leftEarServo = round(map(rio_sadness, 0, 1, 90, 0));
            break;
        case 'fear':
            rightEarServo = round(map(rio_fear, 0, 1, 90, 180));
            leftEarServo = round(map(rio_fear, 0, 1, 90, 0));
            break;
        case 'joy':
            rightEarServo = round(map(rio_joy, 0, 1, 90, 0));
            leftEarServo = round(map(rio_joy, 0, 1, 90, 180));
            break;
        case 'surprise':
            rightEarServo = round(map(rio_surprise, 0, 1, 90, 0));
            leftEarServo = round(map(rio_surprise, 0, 1, 90, 180));
            break;
        case 'anger':
            rightEarServo = round(map(rio_anger, 0, 1, 90, 0));
            leftEarServo = round(map(rio_anger, 0, 1, 90, 180));
            break;
        case 'disgust':
            rightEarServo = round(map(rio_disgust, 0, 1, 90 - maxDisgustDiff, 90));
            leftEarServo = round(map(rio_disgust, 0, 1, 90 + maxDisgustDiff, 90));
            break;
        case 'neutral':
            rightEarServo = 90;
            leftEarServo = 90;
    }
    return [rightEarServo, leftEarServo];
}
function memoryRet(type, label, modify, data, saveMemory, multi, providedStimuli, providedSpeaker, associatedEmotions, index) {

    function mappedEmotionalDiff(givenObj, returnScore) {

        const thresholdForSimilarity = 0.4;
        if (associatedEmotions.length == 6) {
            let sadnessDiff = (givenObj.sadness !== 'system_sadness_' && associatedEmotions[0] !== 'system_sadness_') ? Math.abs(givenObj.sadness - associatedEmotions[0]) : undefined;
            let joyDiff = (givenObj.joy !== 'system_joy_' && associatedEmotions[1] !== 'system_joy_') ? Math.abs(givenObj.joy - associatedEmotions[1]) : undefined;
            let fearDiff = (givenObj.fear !== 'system_fear_' && associatedEmotions[2] !== 'system_fear_') ? Math.abs(givenObj.fear - associatedEmotions[2]) : undefined;
            let disgustDiff = (givenObj.disgust !== 'system_disgust_' && associatedEmotions[3] !== 'system_disgust_') ? Math.abs(givenObj.disgust - associatedEmotions[3]) : undefined;
            let angerDiff = (givenObj.anger !== 'system_anger_' && associatedEmotions[4] !== 'system_anger_') ? Math.abs(givenObj.anger - associatedEmotions[4]) : undefined;
            let surpriseDiff = (givenObj.surprise !== 'system_surprise_' && associatedEmotions[5] !== 'system_surprise_') ? Math.abs(givenObj.surprise - associatedEmotions[5]) : undefined;
            let differenceArray = [sadnessDiff, joyDiff, fearDiff, disgustDiff, angerDiff, surpriseDiff];

            for (var i = 0; i < differenceArray.length; i++) {
                if (differenceArray[i] == undefined) {
                    differenceArray.splice(i, 1);
                    i--;
                }
            }
            let weightedArray = [];
            switch (differenceArray.length) {
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
                default: console.error("Backend error: differenceArray for memoryRet weight determination is invalid: ", differenceArray.length);
            }

            let leng = differenceArray.length;
            for (var i = 0; i < leng - 1; i++) {
                for (var j = i + 1; j < leng; j++) {
                    if (differenceArray[i] > differenceArray[j]) {
                        let temp = differenceArray[i];
                        differenceArray[i] = differenceArray[j];
                        differenceArray[j] = temp;
                    }
                }
            }
            let weightedAverage = 0;
            for (var i = 0; i < differenceArray.length; i++) {
                weightedAverage += differenceArray[i] * weightedArray[i];
            }
            if (returnScore) return weightedAverage;
            else {

                if (weightedAverage <= thresholdForSimilarity) return true;
                else return false;
            }
        }
        else {
            console.error("mappedEmotionalDiff: associatedEmotions parameter is invalid.");
        }
    }


    if (type == 'peopleData') {

        if (saveMemory == undefined || saveMemory == null || saveMemory == false) {

            if (modify == undefined || modify == false) {
                if (peopleJSON[label] != undefined) return peopleJSON[label];
                else return undefined;
            }

            else {
                if (label != undefined) {
                    if (data != undefined) {
                        if (data.updateType == 'specific') {
                            peopleJSON[label][data.updateLabel] = data.updateData;
                        }
                        else if (data.updateType == 'all') {
                            peopleJSON[label] = data.updateData;
                        }
                        else peopleJSON[label] = data;
                    }
                    else console.error('Error: Error in modification of person object: Person Object is undefined.')
                }

                else console.error('Error: Error in modification of person object: No label defined')
            }
        }
        else {
            fs.writeFileSync('./emotionalObjects/peopleData/peopleDataModel.json', JSON.stringify(peopleJSON, null, 2), { encoding: 'utf-8' })
            console.log('Successfully saved peopleData model.');
        }
    }

    else if (type == 'longTerm') {

        if (saveMemory == undefined || saveMemory == null || saveMemory == false) {

            if (modify == undefined || modify == false) {
                if (longTermJSON[label] != undefined) {
                    if (multi == false) {
                        return {
                            data: longTermJSON[label][0],
                            index: 0
                        };
                    }
                    else {
                        const matchedStimuliThreshold = 0.2;

                        if (longTermJSON[label].length == 1) {
                            let matchedElements = new Array(0);
                            for (var x in longTermJSON[label][0].relatedStimuli) {
                                for (var i = 0; i < providedStimuli.length; i++) {
                                    if (providedStimuli[i] == x) {
                                        matchedElements.push(providedStimuli[i]);
                                        break;
                                    }
                                }
                            }
                            if (matchedElements.length / Object.keys(longTermJSON[label][0].relatedStimuli).length >= matchedStimuliThreshold) {
                                return {
                                    data: longTermJSON[label][0],
                                    index: 0
                                };
                            }
                            else {


                                let speakerFound = false;
                                for (var x in longTermJSON[label][0].relatedPeople) {
                                    if (x == providedSpeaker) {
                                        speakerFound = true;
                                        break;
                                    }
                                }
                                if (speakerFound == true)
                                    return {
                                        data: longTermJSON[label][0],
                                        index: 0
                                    };
                                else {

                                    let thisObj = longTermJSON[label][0];
                                    if (mappedEmotionalDiff(thisObj)) {

                                        return thisObj;
                                    }
                                    else {

                                        return 1;
                                    }
                                }
                            }
                        }
                        else {

                            let matchedElIndexes = new Array(0);
                            for (var i = 0; i < longTermJSON[label].length; i++) {
                                let matchedElements = new Array(0);
                                for (var x in longTermJSON[label][i].relatedStimuli) {
                                    for (var i = 0; i < providedStimuli.length; i++) {
                                        if (providedStimuli[i] == x) {
                                            matchedElements.push(providedStimuli[i]);
                                            break;
                                        }
                                    }
                                }
                                let percentageMatched = matchedElements.length / Object.keys(longTermJSON[label][0].relatedStimuli).length;
                                if (percentageMatched > matchedStimuliThreshold) {
                                    matchedElIndexes.push({
                                        index: i,
                                        percentage: percentageMatched
                                    });
                                }
                            }

                            if (matchedElIndexes.length != 0) {
                                let greatest = matchedElIndexes[0];
                                for (var i = 1; i < matchedElIndexes.length; i++) {
                                    if (matchedElIndexes[i].percentageMatched > greatest.percentageMatched)
                                        greatest = matchedElIndexes[i];
                                }
                                return {
                                    data: longTermJSON[label][greatest.index],
                                    index: greatest.index
                                };
                            }

                            else {

                                let speakerIndex;
                                for (var i = 0; i < longTermJSON[label].length; i++) {
                                    for (var x in longTermJSON[label][i].relatedPeople) {
                                        if (providedSpeaker == x) {
                                            speakerIndex = i;
                                            break;
                                        }
                                    }
                                    if (speakerIndex !== undefined) break;
                                }
                                if (speakerIndex !== undefined) {
                                    return {
                                        data: longTermJSON[label][speakerIndex],
                                        index: speakerIndex
                                    }
                                }
                                else {

                                    for (var i = 0; i < longTermJSON[label].length; i++) {
                                        let thisObj = longTermJSON[label][i];
                                        if (mappedEmotionalDiff(thisObj)) {

                                            return {
                                                data: thisObj,
                                                index: i
                                            };
                                        }
                                    }

                                    if (i == longTermJSON[label].length)
                                        return i;
                                }
                            }
                        }
                    }
                }
                else return undefined;
            }

            else {
                if (label != undefined && data != undefined) {
                    if (longTermJSON[label] != undefined) {

                        if (data == 'delete')
                            delete longTermJSON[label];

                        else {
                            if (index == undefined) {
                                index = 0;
                            }
                            longTermJSON[label][index] = data;
                        }
                    }
                    else {
                        longTermJSON[label] = new Array(0);
                        longTermJSON[label][0] = data;
                    }
                }
                else console.error("Backend Error: Error in modification of emotional objects: Stimulus name or Data not provided.");
            }
        }

        else {
            fs.writeFileSync('./emotionalObjects/longTerm/longTermModel.json', JSON.stringify(longTermJSON, null, 2), { encoding: 'utf-8' })
            console.log('Successfully saved RIO longTermModel.json');
        }
    }
}
backend_app.use('/file', express.static(path.join(__dirname)));
const pythonServerDelay = 500;
const clearDelay = 500;
var pythonModules = [];
pythonModules.length = 2;
if (adminMode) pythonModules.fill(null)
else pythonModules.fill(true);
pythonInit();
async function pythonInit() {
    let askAgain = true;
    while (askAgain == true) {
        if (pythonModules[0] == null) {
            await fetch('http://127.0.0.1:5010/initialisation_midi2voice', {
                headers: jsonOptions,
                method: 'POST',
                body: JSON.stringify({ label: 'asking init confirmation' })
            })
                .then(() => {
                    pythonModules[0] = true;
                    console.log("MIDI2VOICE loaded.");
                })
                .catch(() => { })
        }
        else if (pythonModules[1] == null) {
            pythonModules[1] = true;
            await fetch('http://192.168.137.43:4040/initialisation_musicImprovise', {
                headers: jsonOptions,
                method: 'POST',
                body: JSON.stringify({ label: 'asking init confirmation' })
            })
                .then(() => {
                    pythonModules[2] = true;
                    console.log("Music Improvisation module loaded.");
                })
                .catch(() => { })
        }
        else askAgain = false;
        await sleep(pythonServerDelay)
    }
}
function updateEmotions() {

    var emotionObject = emotion_sphere.getEmotions();
    rio_sadness = emotionObject.sadness;
    rio_joy = emotionObject.joy;
    rio_fear = emotionObject.fear;
    rio_disgust = emotionObject.disgust;
    rio_anger = emotionObject.anger;
    rio_surprise = emotionObject.surprise;
}
backend_app.post('/emotions', function (req, res) {
    res.json({
        sadness: rio_sadness,
        joy: rio_joy,
        fear: rio_fear,
        disgust: rio_disgust,
        anger: rio_anger,
        surprise: rio_surprise
    })
})
function getTaskIndex(taskName, taskType) {
    if (taskType == undefined) {
        for (var i = 0; i < currentTasks.length; i++) {
            if (taskName == currentTasks[i])
                return i;
        }
        return null;
    }
    else if (taskType == 'rememberedTasks') {
        for (var i = 0; i < rememberedTasks.length; i++) {
            if (taskName == rememberedTasks[i])
                return i;
        }
        return null;
    }
    else console.error('Error: Task index cannot be found for inappropriate task type');
}
function taskHandler() {
    let currentTime = new Date().getTime();

    if (responseText.length == 0) {
        if (currentTime - lastVerbalSpeechTime > maxVerbalResTime) {
            let thisTaskIndex = getTaskIndex('verbal_response_');
            if (thisTaskIndex !== null)
                currentTasks.splice(thisTaskIndex, 1);
        }
    }
    else {
        let thisTaskIndex = getTaskIndex('verbal_response_');
        if (thisTaskIndex == null)
            currentTasks.push('verbal_response_');
        lastVerbalSpeechTime = currentTime;
    }

    if (sing_song == false) {
        let thisTaskIndex = getTaskIndex('singing_');
        if (thisTaskIndex !== null) {
            currentTasks.splice(thisTaskIndex, 1);
        }
    }
    else {
        let thisTaskIndex = getTaskIndex('singing_');
        if (thisTaskIndex == null)
            currentTasks.push('singing_');
    }

    if (rememberedSongs.length !== 0) {
        let thisTaskIndex = getTaskIndex('singing_', 'rememberedTasks');
        if (thisTaskIndex == null)
            rememberedTasks.push('singing_');
    }
    else {
        let thisTaskIndex = getTaskIndex('singing_', 'rememberedTasks');
        if (thisTaskIndex !== null)
            rememberedTasks.splice(thisTaskIndex, 1);
    }
    if (currentTasks.length == 0) {
        if (ifIdle == false) {
            ifIdle = true;
            idleStartTime = currentTime;
        }
    }
    else {
        if (ifIdle == true) {
            ifIdle = false;
        }
    }
}
function cancelSingingTask() {
    sing_song = false;
    song_name = null;
    alreadyLearntSong = false;
    SpecialAbility = false;
    singingForFirstTime = true;
    songNameAskedForFirstTime = true;
    console.log("Singing task has been cancelled.");
}
function startSingingTask(givenSongName, learntSong) {
    sing_song = true;
    song_name = givenSongName;
    alreadyLearntSong = learntSong;
    SpecialAbility = true;
    if (singingForFirstTime == false) singingForFirstTime = true;
    console.log("Singing task has been started with song name: ", givenSongName);
}
function getTriggerIndex(givenTrigger, TriggerType, checkForLabel) {
    var i;
    switch (TriggerType) {
        case 'verbal':
            for (i = 0; i < objects.length; i++) {
                if (checkForLabel == true) {
                    if (objects[i].label == givenTrigger) {
                        return i;
                    }
                }
                else {
                    if (objects[i] == givenTrigger) {
                        return i;
                    }
                }
            }
            return null;
        case 'other':
            for (i = 0; i < otherObjects.length; i++) {
                if (checkForLabel == true) {
                    if (otherObjects[i].label == givenTrigger) {
                        return i;
                    }
                }
                else {
                    if (otherObjects[i] == givenTrigger) {
                        return i;
                    }
                }
            }
            return null;
        default: console.error("TriggerType param in getTriggerIndex() is invalid.");
    }
}
function countWords(givenText) {
    let words = 1;
    for (var i = 0; i < givenText.length; i++) {
        if (givenText[i] == ' ')
            words++;
    }
    return words
}
function PersonalityDiffScaledScore(person, personProvided) {

    const weightedArray = [weight1_5_valued, weight2_5_valued, weight3_5_valued, weight4_5_valued, weight5_5_valued];

    let personObject = personProvided ? person : personsPresent[getPersonIndex(person)];
    let opennessDiff = Math.abs(agentBigFive.openness - personObject.personality.openness);
    let conscientiousnessDiff = Math.abs(agentBigFive.conscientiousness - personObject.personality.conscientiousness);
    let extraversionDiff = Math.abs(agentBigFive.extraversion - personObject.personality.extraversion);
    let agreeablenessDiff = Math.abs(agentBigFive.agreeableness - personObject.personality.agreeableness);
    let neuroticismDiff = Math.abs(agentBigFive.neuroticism - personObject.personality.neuroticism);
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
function personalityNearby(givenObj, returnTheScore) {




    const nearbyThreshold = 0.6;
    const weightedArray = [weight1_5_valued, weight2_5_valued, weight3_5_valued, weight4_5_valued, weight5_5_valued];

    console.log("agent's levels: ", agentBigFive.openness, agentBigFive.conscientiousness, agentBigFive.extraversion, agentBigFive.agreeableness, agentBigFive.neuroticism);
    console.log(givenObj.label + "'s levels: ", givenObj.openness, givenObj.conscientiousness, givenObj.extraversion, givenObj.agreeableness, givenObj.neuroticism)
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

    weightedAvg = map(weightedAvg, 0, 1, 1, 0)
    console.log("personality similarity for: ", givenObj.label, " is: ", weightedAvg);
    if (returnTheScore) return weightedAvg;
    else {


        if (weightedAvg <= nearbyThreshold) return true;
        else return false;
    }
}
function removeExtraUnusedProp(givenProp) {
    if (Object.keys(givenProp).length > relatedPropLimit) {
        while (Object.keys(givenProp).length > relatedPropLimit) {
            var startLabel = Object.keys(givenProp)[0];
            var prevLabel = startLabel;
            var prevCount = givenProp[Object.keys(givenProp)[0]].count;
            for (var x in givenProp) {

                if (x !== startLabel) {
                    if (givenProp[x].count < prevCount) {
                        prevLabel = x;
                        prevCount = givenProp[x].count;
                    }
                }
            }

            delete givenProp[prevLabel];
        }
    }
}
function getProbableObjIndex(givenLabel, givIndex) {
    for (var i = 0; i < probableObjects.length; i++) {
        if (probableObjects[i].label == givenLabel && probableObjects[i].index == givIndex) {
            return i;
        }
    }
    return null;
}
function handleProbableObjects() {
    var currentTime = new Date().getTime();
    if (probableObjects.length !== 0) {
        for (var i = 0; i < probableObjects.length; i++) {

            var labelRead = memoryRet('longTerm', probableObjects[i].label, false, null, false, true, null, null, null, probableObjects[i].LongTermIndex).data;
            let extent = probableObjects[i].count;

            const countLim = 35;
            if (extent > countLim) extent = countLim;

            const gammaProbable = map(extent, 1, countLim, countLim, 1);

            const probableStimulus = {
                "label": probableObjects[i].label + "_probable_stimulus_",
                "anger": labelRead.anger,
                "joy": labelRead.joy,
                "sadness": labelRead.sadness,
                "fear": labelRead.fear,
                "disgust": labelRead.disgust,
                "surprise": labelRead.surprise,
                "timesOccurred": 1,
                "totalTimesUsed": 1,
                "isProhibited": false,
                "openness": agentBigFive.openness,
                "conscientiousness": agentBigFive.conscientiousness,
                "extraversion": agentBigFive.extraversion,
                "agreeableness": agentBigFive.agreeableness,
                "neuroticism": agentBigFive.neuroticism,
                "relatedTasks": {},
                "relatedStimuli": {},
                "relatedPeople": {},
                "time": currentTime,
                "indexUnderLabel": probableObjects[i].LongTermIndex,
                "gamma": gammaProbable
            }

            otherObjects.push(probableStimulus);
        }
        probableObjects.length = 0;
    }
}
if (testMode == true) {

    backend_app.post('/test_introduceSpeaker', function (req, res) {

        currentSpeaker = req.body.person.name;
        currentPerson = currentSpeaker;
        personsName.push(currentSpeaker);
        updatePersonsPresent(false, [req.body.person]);
        current_index = getPersonIndex(currentSpeaker);
        console.log("Speaker index: ", current_index);
        res.json({ received: true });
    })
    backend_app.post('/test_basicEmotionStimulus', function (req, res) {

        memoryRet('longTerm', 'sadness__', true, req.body.sadness, false, false);
        memoryRet('longTerm', 'joy__', true, req.body.joy, false, false);
        memoryRet('longTerm', 'fear__', true, req.body.fear, false, false);
        memoryRet('longTerm', 'disgust__', true, req.body.disgust, false, false);
        memoryRet('longTerm', 'anger__', true, req.body.anger, false, false);
        memoryRet('longTerm', 'surprise__', true, req.body.surprise, false, false);
        res.json({ received: true });
    })

    backend_app.post('/test_conditionStimulus', function (req, res) {

        currentSpeaker = req.body.person;
        currentPerson = currentSpeaker;
        current_index = getPersonIndex(currentSpeaker);

        if (current_index == undefined) {
            console.error("Error: test_conditionStimulus error: current speaker is invalid: ", currentSpeaker);
        }

        if (memoryRet('longTerm', req.body.label, false, null, false, false) !== undefined) {
            memoryRet('longTerm', req.body.label, true, 'delete', false, false);
        }

        saveTargetObjects([req.body.label], [req.body.emotions[0]], [req.body.emotions[1]], [req.body.emotions[2]], [req.body.emotions[3]], [req.body.emotions[4]],
            [req.body.emotions[5]], [], [currentSpeaker], [req.body.isProhibited]);
        res.json({ received: true });
    });

    backend_app.post('/test_decisionMaking', function (req, res) {



        let decision = emotionalDecide("chooseOption_", req.body.options, req.body.speaker);

        if (decision.object !== null) {
            res.json({
                action: "chooseOption_",
                options: req.body.options,
                choice: decision.object.label
            });
        }

        else {
            res.json({
                action: "chooseOption_",
                options: req.body.options,
                choice: decision.subtype
            });
        }
    })

    backend_app.post('/test_postureResponse', function (req, res) {
        const doPostureResponse = true;
        var predictPose = false;
        const poseEmotionThreshold = 0.3;
        console.log("RIO emotions when pose request is being sent: ", rio_sadness, rio_joy, rio_fear, rio_disgust, rio_anger, rio_surprise)

        for (var i = 0; i < poseResponseData.length; i++) {
            let sadnessAbsDiff = Math.abs(poseResponseData[i].startingEmotion[0] - rio_sadness);
            let joyAbsDiff = Math.abs(poseResponseData[i].startingEmotion[1] - rio_joy);
            let fearAbsDiff = Math.abs(poseResponseData[i].startingEmotion[2] - rio_fear);
            let disgustAbsDiff = Math.abs(poseResponseData[i].startingEmotion[3] - rio_disgust);
            let angerAbsDiff = Math.abs(Math.abs(poseResponseData[i].startingEmotion[4] - rio_anger));
            let surpriseAbsDiff = Math.abs(poseResponseData[i].startingEmotion[5] - rio_surprise);
            let avgDiff = (sadnessAbsDiff + joyAbsDiff + fearAbsDiff + disgustAbsDiff + angerAbsDiff + surpriseAbsDiff) / 6;

            if (avgDiff <= poseEmotionThreshold) {
                predictPose = true;
                console.log("Absolute difference for selected emotion: ", avgDiff)
                break;
            }
        }

        if (predictPose == false) console.error("Backend Error: no proper pose present for the current emotional state");
        else {
            if (doPostureResponse) {
                frontendIncoming.pose_incoming.text = 'predict';
                frontendIncoming.pose_incoming.json = [rio_sadness, rio_joy, rio_fear, rio_disgust, rio_anger, rio_surprise];
            }
            else console.log("Posture response test is not executed for persmission is denied.");
        }
        res.json({ received: true });
    })

    backend_app.post('/test_verbalResponse', function (req, res) {
        const doVerbalResponse = false;
        console.log('Sending test verbal classifier request with the following data: ');
        console.log("Objects in speech: ", req.body.objectsInSpeech);
        console.log("Statement: ", req.body.statement);
        console.log("Questioner emotion: ", req.body.questionerEmotion);
        console.log("Answerer emotion: ", [rio_sadness, rio_joy, rio_fear, rio_disgust, rio_anger, rio_surprise])

        if (doVerbalResponse) {
            frontendIncoming.verbal_incoming.json = [
                stringArrToNumeric(req.body.objectsInSpeech),
                stringArrToNumeric(stringToArray(req.body.statement)),
                req.body.questionerEmotion,
                [rio_sadness, rio_joy, rio_fear, rio_disgust, rio_anger, rio_surprise]
            ].slice(0)
        }
        else console.log("Verbal response test is not being executed for permission is denied.");
        res.json({ received: true });
    })
}
function weightedAverage(givenArray) {


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
        default: console.error("Backend error: givenArray for weight determination is invalid: ", givenArray.length);
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
async function forgetUninfluentialStimuli() {

    const currentTime = new Date().getTime();
    const forgetLimit = 0.6;

    for (var x in longTermJSON) {
        for (var dh = 0; dh < longTermJSON[x].length; dh++) {
            if (longTermJSON[x][dh].time / currentTime < forgetLimit) {

                console.log("removed object of index: ", dh, " under label: ", x, " from the long term memory.");
                longTermJSON[x].splice(dh, 1);
                dh--;
            }
        }

        if (longTermJSON[x].length == 0) {
            console.log("removed entire object: ", x, " from the long term memory as no objects exist under it.");
            delete longTermJSON[x];
        }
    }

    await sleep(10000);
    forgetUninfluentialStimuli();
}
function checkIfBasicEmotionStim(val) {
    switch (val) {
        case 'sadness_':
        case 'sadness__':
        case 'joy_':
        case 'joy__':
        case 'fear_':
        case 'fear__':
        case 'disgust_':
        case 'disgust__':
        case 'anger_':
        case 'anger__':
        case 'surprise_':
        case 'surprise__': return true;
        default: return false;
    }
}