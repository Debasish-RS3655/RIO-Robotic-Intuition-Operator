
"use-strict"
var startFrontend = false;          
const testMode = false;
if (testMode) {
    console.warn("RIO is being implemented in test mode.");
}
else console.warn("RIO is being implemented in normal mode.")
var startBtn = document.getElementsByClassName("startBtn")[0];
const defaultPitch = "1.1";
const defaultSpeed = "0.9";
var responseText = "";   
var current_emotion = 'neutral';
var rate = defaultPitch;            
var pitch = defaultSpeed;
var singingState;                  
var songIncomingMessage = "";
var final_transcript = "";
var interim_transcript = "";
let askedSongConfirmation = false;
var stopListening = false;
var ContinueListening = false;
var outputData = {
    poseDetect: {       
        data: null,
        faceTracker: {          
            data: null
        }
    },
    objectDetect: {
        data: null
    },
    faceAPI: {
        data: null
    },
    textToxicity: {
        data: null
    },
    visualObjectsCustom: {
        data: null
    },
    audioObjects: {
        data: null
    },
    speakerResponse: {
        data: null
    },
    songResponse: {
        data: null
    },
    poseResponse: {         
        data: null,
        type: null
    },
    verbalResponse: {       
        label: null,
        score: null
    },
    recognisedSpeech: {     
        data: null
    },
    songConfirmation: {     
        data: null
    },
    askSingingConfirmation: {
        data: null
    },
    songOutgoingData: {     
        data: null
    }
}
const minMicVol = 10;                  
const maxListenInterval = 6000;        
const gap = 125;                      
var detectedNote = null;             
var micVol = 0;                        
var song = new Array(0);               
var last_emotion = 'neutral';          
var synth = window.speechSynthesis;
var voices = [];
var ifSpoken = false;                  
var blinked = false;                   
const blink_time = 400;                
var singing = false;
var singing_fromBefore = false;
var image_url_emotion = './facial_expressions/animatedEyes/neutralEyesGIF.gif';
var image_url_speech = './facial_expressions/animatedNoSpeeches/neutral_notSpeakGIF.gif';
var frontendJSready = false;                
const initialisationDelayJS = 500;          
const analyserOptions = {
    callback: analyserCallback,
    returnNote: true,
    returnCents: false,
    decimals: 2
}
const analyser = new PitchAnalyser(analyserOptions);
if (speechSynthesis.onvoiceschanged != undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
}
const main_interval = 1000;         
const sleep = ms => new Promise(req => setTimeout(req, ms));
var ifConnectedJS = window.navigator.onLine;
if (ifConnectedJS == true) initJSFrontend();
else console.error('Frontend JS: Internet connection not available. Please connect to the internet and refresh.');
async function initJSFrontend() {
    
    frontendJSready = true
    
    while (startFrontend == false)
        await sleep(initialisationDelayJS);
    
    console.log('Frontend JS: Initialising the note analyser..')
    analyser.initAnalyser()
        .then(() => {
            console.log('Frontend JS: Note Analyser successfully loaded.');
            function initFunctionsExpressions() {
                populateVoiceList();
                modifiedHTML_emotion();
                modifiedHTML_speech();
            }
            initFunctionsExpressions();
            
            speakout("I am Rio., , And now, I am finally alive.", true, defaultPitch, defaultSpeed);
            startJS();
        })
        .catch(err => console.error('Frontend JS: Error in starting the note analyser: ', err))
}
function populateVoiceList() {
    voices = synth.getVoices();                 
    console.log("Frontend JS: Voices available: ", JSON.stringify(voices))
}
var recognizing,
    transcription = document.getElementById('speech'),
    interim_span = document.getElementById('interim');
var speech = new webkitSpeechRecognition() || speechRecognition();
function startJS() {
    analyser.audioContext.resume();             
    analyser.startAnalyser();
    async function getMicVol() {
        
        
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(function (stream) {
                let audioContext = new AudioContext();
                let Volanalyser = audioContext.createAnalyser();
                let microphone = audioContext.createMediaStreamSource(stream);
                let javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);
                Volanalyser.smoothingTimeConstant = 0.8;
                Volanalyser.fftSize = 1024;
                microphone.connect(Volanalyser);
                Volanalyser.connect(javascriptNode);
                javascriptNode.connect(audioContext.destination);
                javascriptNode.onaudioprocess = function () {
                    var array = new Uint8Array(Volanalyser.frequencyBinCount);
                    Volanalyser.getByteFrequencyData(array);
                    var values = 0;
                    var length = array.length;
                    for (var i = 0; i < length; i++) {
                        values += (array[i]);
                    }
                    micVol = Math.round(values / length);
                    
                }
            })
            .catch(function (err) {
                console.error('Frontend JS: Error reading the mic volume: ' + err);
            });
    }
    getMicVol();
    
    if (testMode == false) {
        
        
        if (!(window.webkitSpeechRecognition) && !(window.speechRecognition))
            console.log('Frontend JS: Please use Google Chrome for the best experience.');
        else {
            function reset() {
                recognizing = false;
                interim_span.innerHTML = '';
                transcription.innerHTML = '';
                speech.start();
            }
            interim_span.style.opacity = '0.5';
            speech.continuous = true;
            speech.interimResults = true;
            speech.lang = 'en-US'; 
            speech.start();        
            speech.onstart = function () {
                
                console.log('Frontend JS: Started recognizing speech again.')
                recognizing = true;
            };
            
            speech.onresult = function (event) {
                interim_transcript = '';
                final_transcript = '';
                
                for (var i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        final_transcript += event.results[i][0].transcript;
                    } else {
                        interim_transcript += event.results[i][0].transcript;
                    }
                }
                transcription.innerHTML = final_transcript;
                interim_span.innerHTML = interim_transcript;
                
                if (final_transcript.length != 0) {
                    let sendText = final_transcript.slice(0);
                    
                    if (askedSongConfirmation == true) {
                        let typeOfSpeech = checkYesOrNo(sendText.toLowerCase());
                        if (typeOfSpeech == 'yes_word') {
                            outputData.songConfirmation.data = 'yes';
                            askedSongConfirmation = false;
                        }
                        else if (typeOfSpeech == 'no_word') {
                            outputData.songConfirmation.data = 'no';
                            askedSongConfirmation = false;
                        }
                        else if (typeOfSpeech == 'none_') {
                            outputData.recognisedSpeech.data = sendText;
                        }
                        function checkYesOrNo(givenText) {
                            let yesWords = ['yes', 'sure', 'affirmative', 'amen', 'fine', 'good', 'okay', 'true', 'yea', 'all right', 'aye', 'beyond a doubt', 'by all means', 'certainly', 'definitely', 'even so',
                                'exactly', 'gladly', 'good enough', 'granted', 'indubitably', 'just so', 'most assuredly', 'naturally', 'of course', 'positively', 'precisely', 'sure thing', 'surely',
                                'undoubtedly', 'unquestionably', 'very well', 'willingly', 'without fail', 'yep'];
                            for (var i = 0; i < yesWords.length; i++) {
                                if (givenText.includes(yesWords[i])) {
                                    return "yes_word";
                                }
                            }
                            let noWords = ["don't", "no", "nay", "nix", "never", "not"]
                            for (var i = 0; i < noWords.length; i++) {
                                if (givenText.includes(noWords[i])) {
                                    return "no_word";
                                }
                            }
                            return "none_";
                        }
                    }
                    
                    else outputData.recognisedSpeech.data = sendText;
                }
            };
            speech.onerror = function (event) {
                
                console.error(`error in speech recognition: ${event.error}`);
            };
            speech.onend = function () {
                
                reset();
            };
        }
    }
    
    async function mainJS() {
        while (true) {
            
            if (responseText.length !== 0) console.log('Frontend JS: Response text from backend: ', responseText);
            
            if (current_emotion == null || current_emotion == "" || current_emotion == undefined)
                current_emotion = last_emotion;
            
            if (singingState !== null) {
                if (singingState == true) {
                    singing = true;
                    
                    
                    if (singing_fromBefore == false) {
                        singing_fromBefore = true;
                        console.log('Frontend JS: Singing has started');
                        determineSpeechImgURL();
                        modifiedHTML_speech();
                    }
                }
                else if (singing == true) {
                    singing = false;
                    singing_fromBefore = singing;
                    console.log('Frontend JS: Singing has stopped.');
                    determineNoSpeechImgURL();
                    modifiedHTML_speech();
                }
            }
            
            if (singing == false) {
                
                if (ifSpoken == false) {
                    if (responseText.length !== 0) {
                        if (responseText.toLowerCase().includes('should i save the song that i have just learnt?     ')) {
                            askedSongConfirmation = true;
                        }
                        speakout();
                    }
                }
                
                else ifSpoken = true;
            }
            changeEmotionState();               
            
            if (testMode == false) {
                if (songIncomingMessage.length !== 0) {
                    switch (songIncomingMessage) {
                        
                        case "listen":
                            console.log('Frontend JS: Listening and learning new song.');
                            listenToSong();
                            break;
                        case "stopListening":
                            console.log("Stopping to listen to the song.");
                            if (ContinueListening == true)
                                stopListening = true;
                            else console.warn("Frontend JS: Cannot stop listening when not started to listen.");
                            break;
                        
                        case "yes":
                            console.log('Frontend JS: Recently learnt song sent to the backend.')
                            sendSongToBackend(song);
                            console.log("Frontend JS: Song saved sucessfully.");
                            
                            break;
                        case "no":
                            console.log("Frontend JS: Song save aborted.");
                            song.length = 0;    
                            break;
                    }
                    songIncomingMessage = "";       
                }
            }
            await sleep(main_interval);
        }
    }
    mainJS();
}
function changeEmotionState() {
    
    if (current_emotion != last_emotion) {
        if (blinked == false) {
            
            image_url_emotion = "./facial_expressions/animatedEyes/blinkFinalPNG.png";
            modifiedHTML_emotion();
            blinked = true;             
            
            
            determineEmotionURL();
            setTimeout(function () {
                
                modifiedHTML_emotion();
                blinked = false;
            }, blink_time);
        }
        last_emotion = current_emotion;     
    }
}
function modifiedHTML_emotion() {
    console.log("Image url emotion: ", image_url_emotion);
    document.querySelector('#emotion_area').style.background = 'url("' + image_url_emotion + '") no-repeat center center';
}
function modifiedHTML_speech() {
    console.log('Image url speech: ', image_url_speech);
    document.querySelector('#speech_area').style.background = 'url("' + image_url_speech + '") no-repeat center ';
}
function speakout(data, Ifdefault, givenPitch, givenSpeed, givenVoiceIndex) {
    var speakText;          
    if (data == undefined) {
        
        speakText = new SpeechSynthesisUtterance(responseText);
        responseText = "";
    }
    else speakText = new SpeechSynthesisUtterance(data);
    
    if (Ifdefault !== undefined && Ifdefault !== null && Ifdefault !== true) {
        speakText.voice = voices[givenVoiceIndex];
    }
    speakText.pitch = (givenPitch !== undefined) ? givenPitch : pitch;
    speakText.rate = (givenSpeed !== undefined) ? givenSpeed : rate;
    
    synth.speak(speakText);
    
    setTimeout(async () => {
        determineSpeechImgURL();
        modifiedHTML_speech();
    }, 800);
    speakText.onpause = function (event) {
        var char = event.utterance.text.charAt(event.charIndex);
        console.log('Frontend JS: Speech paused at character ' + event.charIndex + ' of "' +
            event.utterance.text + '", which is "' + char + '".');
        determineNoSpeechImgURL();
        modifiedHTML_speech();
    }
    speakText.onend = e => {
        determineNoSpeechImgURL();
        modifiedHTML_speech();
    }
}
function determineEmotionURL() {
    switch (current_emotion) {
        
        case "joy":
            image_url_emotion = './facial_expressions/animatedEyes/happyEyesSlightGIF.gif';
            break;
        case "joy_very":
            image_url_emotion = './facial_expressions/animatedEyes/happyEyesVeryGIF.gif';
            break;
        case "sadness":
            image_url_emotion = './facial_expressions/animatedEyes/sadEyesSlightGIF.gif';
            break;
        case "sadness_very":
            image_url_emotion = './facial_expressions/animatedEyes/sadEyesVeryGIF.gif';
            break;
        case "anger":
            image_url_emotion = './facial_expressions/animatedEyes/angryEyesSlightGIF.gif';
            break;
        case "anger_very":
            image_url_emotion = './facial_expressions/animatedEyes/angryEyesVeryGIF.gif';
            break;
        case "fear":
            image_url_emotion = './facial_expressions/animatedEyes/afraidEyesSlightGIF.gif';
            break;
        case "fear_very":
            image_url_emotion = './facial_expressions/animatedEyes/afraidEyesVeryGIF.gif';
            break;
        case 'surprise':
            image_url_emotion = './facial_expressions/animatedEyes/surprisedEyesSlightGIF.gif';
            break;
        case 'surprise_very':
            image_url_emotion = './facial_expressions/animatedEyes/surprisedEyesVeryGIF.gif';
            break;
        case 'disgust':
            image_url_emotion = './facial_expressions/animatedEyes/disgustedEyesSlightGIF.gif';
            break;
        case 'disgust_very':
            image_url_emotion = './facial_expressions/animatedEyes/disgustedEyesVeryGIF.gif';
            break;
        default:
            
            image_url_emotion = './facial_expressions/animatedEyes/neutralEyesGIF.gif';
            break;
    }
}
function determineSpeechImgURL() {
    switch (current_emotion) {
        case "joy":
        case "joy_very":
            image_url_speech = './facial_expressions/animatedSpeeches/happySpeakingRAW.gif';
            break;
        case "sadness":
        case "sadness_very":
            image_url_speech = './facial_expressions/animatedSpeeches/sadSpeakingRAW.gif';
            break;
        case "fear":
        case "fear_very":
            image_url_speech = './facial_expressions/animatedSpeeches/afraid_angrySpeakingRAW.gif';
            break;
        case "anger":
        case "anger_very":
            image_url_speech = './facial_expressions/animatedSpeeches/afraid_angrySpeakingRAW.gif';
            break;
        case "surprise":
        case "surprise_very":
            image_url_speech = './facial_expressions/animatedSpeeches/surprised_disgustSpeakingRAW.gif';
            break;
        case "disgust":
        case "disgust_very":
            image_url_speech = './facial_expressions/animatedSpeeches/surprised_disgustSpeakingRAW.gif';
            break;
        default:
            
            image_url_speech = './facial_expressions/animatedSpeeches/neutralSpeakingRAW.gif';
            break;
    }
}
function determineNoSpeechImgURL() {
    switch (current_emotion) {
        case "joy":
        case "joy_very":
            image_url_speech = './facial_expressions/animatedNoSpeeches/happy_notSpeakGIF.gif';
            break;
        case "sadness":
        case "sadness_very":
            image_url_speech = './facial_expressions/animatedNoSpeeches/sad_notSpeakGIF.gif';
            break;
        case "fear":
        case "fear_very":
            image_url_speech = './facial_expressions/animatedNoSpeeches/angry_afraid_notSpeakGIF.gif';
            break;
        case "anger":
        case "anger_very":
            image_url_speech = './facial_expressions/animatedNoSpeeches/angry_afraid_notSpeakGIF.gif';
            break;
        case "surprise":
        case "surprise_very":
            image_url_speech = './facial_expressions/animatedNoSpeeches/surprised_disgust_notSpeakGIF.gif';
            break;
        case "disgust":
        case "disgust_very":
            image_url_speech = './facial_expressions/animatedNoSpeeches/surprised_disgust_notSpeakGIF.gif';
            break;
        default:
            
            image_url_speech = './facial_expressions/animatedNoSpeeches/neutral_notSpeakGIF.gif';
            break;
    }
}
async function listenToSong() {
    alert("Started listening.");
    song.length = 0;
    var endTime = 0;                        
    var startTime = new Date().getTime();   
    ContinueListening = true;               
    while (ContinueListening == true) {
        
        if (micVol >= minMicVol && typeof detectedNote == 'string') {
            console.log("detected note pushed into song array: ", detectedNote)
            song.push(detectedNote)
        }
        else {
            if (endTime - startTime <= maxListenInterval) {
                endTime = new Date().getTime();
                console.log("Null note pushed into song array.");
                song.push('null');              
            }
            else if (endTime - startTime > maxListenInterval || stopListening == true) {
                
                console.log('Frontend JS: Listened to the song. Asking for confirmation to save the song.');
                alert("Ended listening.");
                
                speech.stop();
                transcription.innerHTML = "";
                interim_span.innerHTML = "";
                speech.start();
                askForConfirmation();
                ContinueListening = false;
                stopListening = false;
            }
        }
        await sleep(gap);
    }
}
function analyserCallback(result) {
    
    if (micVol >= minMicVol) {
        detectedNote = result.note;
    }
}
function sendSongToBackend(data) {
    outputData.songOutgoingData.data = data;
}
function askForConfirmation() {
    outputData.askSingingConfirmation.data = "confirm song?"
}