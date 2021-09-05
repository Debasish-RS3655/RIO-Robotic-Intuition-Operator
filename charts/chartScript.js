//The emotion level display
//Debashish Buragohain
let onceDisplayedChart = false;
async function displayLevels() {
    var ctx = document.getElementById('levels').getContext('2d');
    //keep displaying the charts
    const delay = 2000;
    const sleep = ms => new Promise(res => setTimeout(res, ms));
    var myChart, prevEmotions = new Array(6);
    //create the instance of the chart, first with the default values
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Sadness', 'Joy', 'Fear', 'Disgust', 'Anger', 'Surprise'],
            datasets: [{
                label: 'Emotion Levels',
                data: [0.4, 0.4, 0.4, 0.4, 0.4, 0.4],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    min: 0.0,
                    max: 1.0,
                    beginAtZero: true
                }
            },
            animation: false
        }
    });

    while (true) {
        await fetch('http://127.0.0.1:5000/emotions', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sendEmotions: true }),
            method: 'POST'
        })
            .then(res => res.json())
            .then(em => {
                let changed = false
                //using lesser resources
                if (em.sadness != prevEmotions[0]) {
                    myChart.data.datasets[0].data[0] = em.sadness;
                    changed = true;
                }
                if (em.joy != prevEmotions[1]) {
                    myChart.data.datasets[0].data[1] = em.joy;
                    if (changed == false) changed = true;
                }
                if (em.fear != prevEmotions[2]) {
                    myChart.data.datasets[0].data[2] = em.fear;
                    if (changed == false) changed = true;
                }
                if (em.disgust != prevEmotions[3]) {
                    myChart.data.datasets[0].data[3] = em.disgust;
                    if (changed == false) changed = true;
                }
                if (em.anger != prevEmotions[4]) {
                    myChart.data.datasets[0].data[4] = em.anger;
                    if (changed == false) changed = true;
                }
                if (em.surprise != prevEmotions[5]) {
                    myChart.data.datasets[0].data[5] = em.surprise;
                    if (changed == false) changed = true;
                }
                if (changed == true) {
                    myChart.update('active');
                    changed = false;
                }
                prevEmotions[0] = em.sadness;
                prevEmotions[1] = em.joy;
                prevEmotions[2] = em.fear;
                prevEmotions[3] = em.disgust;
                prevEmotions[4] = em.anger;
                prevEmotions[5] = em.surprise;
            })
            .catch(err => console.error("Error in displaying emotions: ", err))

        await sleep(delay);
    }
}
displayLevels();