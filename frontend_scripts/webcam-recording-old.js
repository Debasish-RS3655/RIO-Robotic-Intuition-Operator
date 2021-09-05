//Debashish Buragohain
//record video from the webcam and then send to the face tracking server
const recording_webcam = document.getElementById('recording-webcam')
const iterationDelay = 100;         //the delay in milis for every iteration gap
const recordingTime = 25;           //the duration of the video in milis

navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true
})
    .then(function (stream) {
        setSrcObject(stream, recording_webcam)
        recording_webcam.play()
        recording_webcam.muted = true;
        // Initialize the recorder
        var recorder = new RecordRTCPromisesHandler(stream, {
            mimeType: 'video/webm',
            bitsPerSecond: 128000
        });

        setInterval(() => {
            fetch('http://127.0.0.1:5000/videoRecord', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({ sendVideo: "true/false" })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.action == true) {
                        recorder.startRecording()
                            .then(() => console.log('started recording webcam video.'))
                            .catch((err) => console.error('error in recording webcam video: ' + err))
                        recorder.stream = stream;
                        setTimeout(() => {
                            recorder.stopRecording()
                                .then(() => {
                                    console.log('webcam video recording stopped');
                                    var video = recorder.getBlob()
                                    fetch('http://127.0.0.1:5020/faceTrackerInput', {
                                        headers: {
                                            'Accept': 'application/json',
                                            'Content-Type': 'application/json'
                                        },
                                        method: 'POST',
                                        body: video
                                    })
                                        .then(res => {
                                            console.log('sent video recording face tracking server')
                                            recorder.stream.stop();
                                        })
                                        .catch(err => console.error("couldn't send recording to face tracking server: " + err))
                                })
                                .catch(err => console.error('Error in stopping the recording.', err))
                        }, recordingTime);
                    }
                })
                .catch(err => console.error('Error sending video recording request to the backend: ', err))
        }, iterationDelay)
    })
    .catch(err => console.error('Cannot access media devices: ', err));