//Module for text toxicity
//Robotic Intuition Operator
//Debashish Buragohain
const thresholdToxicity = 0.6;
const minCharactersInSpeech = 4;
var ifConnected = window.navigator.onLine;
//get the text toxicity and send it over the server
async function app() {
    console.log('Loading text toxicity model..');
    const detector = await toxicity.load();
    console.log('Text toxicity model successfully loaded.');
    setInterval(async () => {
        var sentences = document.getElementById('speech')
        if (sentences.length >= minCharactersInSpeech) {
            var predictions = await detector.classify(sentences);
            sendRequest(predictions); //send the detected results to the backend
        }
    }, 500)
}

//the application runs only when there is an internet connection
if (ifConnected) {
    app();
}

function sendRequest(data) {
    fetch('http://127.0.0.1:8080/textToxicity', {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(data)
    })
        .catch(err => console.error('Error sending toxicity predictions: ' + err));
}