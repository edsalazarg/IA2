let training_data = [];
let nn;
var trained = false;

let red_array = [0,0,1];
let green_array = [0,1,0];
let blue_array = [1,0,0];

var ctx2 = document.getElementById('errorChart');
var errorChart = new Chart(ctx2, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                data: [],
                borderColor: '#af90ca',
                backgroundColor: '#af90ca',
                fill: true,
                label: 'Error line',
                lineTension: 0
            }
        ]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});

var ctx = document.getElementById('myChart');
var myChart = new Chart(ctx, {
    type: 'scatter',
    data: {
        datasets: [{
                label: 'Red data',
                data: [],
                backgroundColor: '#FF0000',
            },
            {
                label: 'Green Data',
                data: [],
                backgroundColor: '#26ff00'
            },
            {
                label: 'Blue Data',
                data: [],
                backgroundColor: '#0040ff'
            },
            {
                label: 'Weighted Line',
                data: [],
                showLine: true,
                fill: false,
                backgroundColor: '#fff200',
                borderColor: '#fff200',
            },
            {
                label: 'Test Data',
                data: [],
                backgroundColor: '#c800ff'
            },
        ]
    },
    options: {
        scales: {
            xAxes: [{
                type: "linear",
                display: true,
                ticks: {
                    max: 5,
                    min: -5,
                },
                scaleLabel: {
                    display: true,
                    labelString: 'X-Axis'
                }
            }, ],
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Y-Axis'
                },
                ticks: {
                    max: 5,
                    min: -5,
                },
            }]
        }
    }
});

function showWeights(hl2){

}

function initialize(){
    let hidden_layers_neurons = parseInt(document.getElementById("hidden_layers_neurons").value);
    let hidden_layers = parseInt(document.getElementById("hidden_layers").value);
    let learning_rate = parseFloat(document.getElementById("learningRate").value);
    let desired_error = parseFloat(document.getElementById("desiredError").value);
    let boolean_hl2 = false;
    if (hidden_layers === 2){
        boolean_hl2 = true;
    }
    nn = new NeuralNetwork(2,hidden_layers_neurons,3, learning_rate,desired_error, boolean_hl2);

    document.getElementById('train').disabled = false;
    showWeights(boolean_hl2);
}

function predict(data){
    let predict_matrix = nn.feedforward(data);
    let final_prediction = [];
    for (let i = 0;i<3;i++){
        final_prediction.push(Math.round(predict_matrix[i]));
    }
    return final_prediction;
}

function train(){
    let max_epochs = parseInt(document.getElementById("epochNumber").value);
    for (let i = 0; i < max_epochs; i++){
        let finish = false;
        for (const data in training_data) {
            finish = nn.train(training_data[data].inputs,training_data[data].outputs, i)
        }
        if(finish){
            document.getElementById("epochtotal").value = i;
            errorChart.data.labels = range(0,i+1,20)
            errorChart.data.datasets[0].data = nn.all_errors;
            errorChart.update()
            break;
        }
    }
}



document.getElementById('myChart').onmousedown = FuncOnClick;

function FuncOnClick(event) {
    let scaleRef,
        valueX,
        valueY;
    for (var scaleKey in myChart.scales) {
        scaleRef = myChart.scales[scaleKey];
        if (scaleRef.isHorizontal() && scaleKey === 'x-axis-1') {
            valueX = scaleRef.getValueForPixel(event.offsetX);

        } else if (scaleKey === 'y-axis-1') {
            valueY = scaleRef.getValueForPixel(event.offsetY);
        }
    }
    if (trained){
        //    Agregar set de datos para despues de entranado
        myChart.data.datasets[4].data.push({
            x: valueX,
            y: valueY
        });

        // WE NEED TO CHECK THE PREDICTION
        prediction = nn.feedforward([x,y])
        if (prediction === 1){
            prediction = "Azul"
        }else{
            prediction = "Rojo"
        }

        var tabla = document.getElementById('tablaPrueba').getElementsByTagName('tbody')[0];
        var newRow = tabla.insertRow();
        var newCell = newRow.insertCell();
        var newText = document.createTextNode(valueX.toFixed(2));
        newCell.appendChild(newText);
        newCell = newRow.insertCell();
        newText = document.createTextNode(valueY.toFixed(2));
        newCell.appendChild(newText);
        newCell = newRow.insertCell();
        newText = document.createTextNode(prediction);
        newCell.appendChild(newText);
        myChart.update();
    }else{
        if (valueY < 5 && valueY > -5 && valueX < 5 && valueX > -5 ){
            //Dibujar punto en la grafica
            let group = document.getElementById("groupColors").value
            myChart.data.datasets[group].data.push({
                x: valueX,
                y: valueY
            });
            let output = [];
            let tabla;
            switch (group){
                case "0":
                    output = [0,0,1];
                    tabla = document.getElementById('tablaRojos').getElementsByTagName('tbody')[0];
                    break;
                case "1":
                    output = [0,1,0];
                    tabla = document.getElementById('tablaVerdes').getElementsByTagName('tbody')[0];
                    break;
                case "2":
                    output = [1,0,0];
                    tabla = document.getElementById('tablaAzules').getElementsByTagName('tbody')[0];
                    break;
            }

            var newRow = tabla.insertRow();
            var newCell = newRow.insertCell();
            var newText = document.createTextNode(valueX.toFixed(2));
            newCell.appendChild(newText);
            newCell = newRow.insertCell();
            newText = document.createTextNode(valueY.toFixed(2));
            newCell.appendChild(newText);
            training_data.push({
                inputs: [valueX,valueY],
                outputs: output,
            });
            myChart.update();
        }
    }
}

function range(start, stop, step){
    if (typeof stop=='undefined'){
        // one param defined
        stop = start;
        start = 0;
    };
    if (typeof step=='undefined'){
        step = 1;
    };
    var result = [];
    for (var i=start; step>0 ? i<stop : i>stop; i+=step){
        result.push(i);
    };
    return result;
};