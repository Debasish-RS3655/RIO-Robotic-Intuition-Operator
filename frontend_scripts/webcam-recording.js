//Debashish Buragohain
//we record the video and then send it to the coordinator which downloads the file,
//then we inform the python backend and the node backend to get the file and start face tracking
//Robotic Intuition Operator
var recording_webcam = document.getElementById('recording-webcam')
const initialisationDelay = 500;    //delay in milis for the initialisation iterations
const iterationDelay = 1000;        //the delay in milis for every iteration gap
const recordingTime = 500;          //the duration of the video in milis
const initVideoDelay = 1500;        //the duration of the initialisation video
//set to around 300 at first
navigator.getUserMedia({
    video: {}
},
    async stream => {
        recording_webcam.srcObject = stream;
        // Initialize the recorder
        var recorder = new RecordRTCPromisesHandler(stream, {
            mimeType: 'video/webm',
            bitsPerSecond: 128000
        });
        recorder.stream = stream;
        //the initialising function
        await recorder.startRecording()
            .then(async () => {
                const sleep = ms => new Promise(res => setTimeout(res, ms));
                await sleep(initVideoDelay);
                recorder.stopRecording()
                    .then(() => console.log('Successfully initialised the video recorder.'))
                    .catch(err => console.error('Error in initialising the video recorder: ', err,
                        ' The recorder might still be functioning.'));
            })
        console.log('Please wait while robotic intuition operator is being loaded.')
        var initialiseReq = setInterval(() => {
            //we wait for all modules to be initialised
            fetch('http://127.0.0.1:5550/initialisation', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ module: 'faceTracker-frontend' }),
                method: 'POST'
            })
                .then(res => res.json())
                .then(data => {
                    if (data.start == true) {
                        clearInterval(initialiseReq);
                        $(".loader").fadeOut("slow");
                        console.info('Robotic Intuition Operator loaded successfully.')
                        //starting the main video recording function within definite intervals                        
                        setInterval(async () => {
                            //start the recording of the video snippet
                            await recorder.startRecording()
                                .then(() => {
                                    //stop recording the video after the give time
                                    setTimeout(() => {
                                        recorder.stopRecording()
                                            .then(() => {
                                                console.log('webcam video recording stopped');
                                                recorder.getBlob()
                                                    .then(video => {
                                                        //we then need to convert the blob into base64 string
                                                        var reader = new FileReader();
                                                        //after the file is loaded, we convert it into base64 and then send it
                                                        //we convert the video blob into a base64 string for sending over the network to the face tracker backend
                                                        reader.readAsDataURL(video);
                                                        reader.addEventListener("loadend", function () {
                                                            var base64Data = reader.result;
                                                            //we don't need the type information now
                                                            base64Data = base64Data.split(",").pop();
                                                            fetch('http://127.0.0.1:3550/faceTrackerVideo', {
                                                                headers: {
                                                                    'Accept': 'application/json',
                                                                    'Content-Type': 'application/json'
                                                                },
                                                                method: 'POST',
                                                                body: JSON.stringify({ video: base64Data })
                                                            })
                                                                //after we have sent and downloaded the video, we send the info to the face tracking python backend
                                                                .then(() => {
                                                                    fetch('http://127.0.0.1:5020/faceTrackerInput', {
                                                                        headers: {
                                                                            'Accept': 'application/json',
                                                                            'Content-Type': 'application/json'
                                                                        },
                                                                        method: 'POST',
                                                                        body: JSON.stringify({ sentVideo: true })
                                                                    })  //after we have sent the video to the face tracking server we inform the node backend
                                                                        .then(() => {
                                                                            console.log('successfully sent and confirmed video recording.')
                                                                            //this part is under some doubt, consider here
                                                                            //recorder.stream.stop();
                                                                            fetch('http://127.0.0.1:5000/videoRecordConfirmation', {
                                                                                headers: {
                                                                                    'Accept': 'application/json',
                                                                                    'Content-Type': 'application/json'
                                                                                },
                                                                                method: 'POST',
                                                                                body: JSON.stringify({ sentVideo: true })
                                                                            })
                                                                                .then(res => res.json())
                                                                                .catch(err => console.error('Cannot send video recording Confirmation to Node backend: ', err))
                                                                        })
                                                                        .catch(err => console.error("Couldn't send confirmation info to the Python backend: " + err))
                                                                })
                                                                .catch(err => console.error('Error in sending the recorded video to coordinator app: ', err))
                                                        });
                                                    })
                                            })
                                            .catch(err => console.error('Error in stopping webcam recording: ', err))
                                    }, recordingTime);
                                })
                                .catch((err) => console.error('error in recording webcam video: ' + err))
                        }, iterationDelay)
                    }
                })
                .catch(err => console.error('face tracker frontend: cannot connect to the initialisation server: ', err))
        }, initialisationDelay)
    },
    err => console.error('unable to access the webcam: ', err)
)
