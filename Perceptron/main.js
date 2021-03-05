

var data = []
var ctx = document.getElementById('myChart');
var myChart = new Chart(ctx, {
    type: 'scatter',
    data: {
        datasets: [{
            label: 'Scatter Dataset',
            data: [],
            backgroundColor: '#FF0000',
        },
        {
            label: 'Scatter Dataset',
            data: [],
            backgroundColor: '#0040ff'
        },
        {
            label: 'Line Dataset',
            data: [],
            showLine: true,
            fill: false,
            backgroundColor: '#fff200',
            borderColor: '#fff200',
        }
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
    if (valueY < 5 && valueY > -5 && valueX < 5 && valueX > -5 ){
        switch (event.which) {
            case 1:
                //Dibujar punto en la grafica
                myChart.data.datasets[0].data.push({
                    x: valueX,
                    y: valueY
                });
                data.push([1,valueX, valueY,0])
                myChart.update();
                // agregar coordenadas a la tabla
                var tabla = document.getElementById('tablaRojos').getElementsByTagName('tbody')[0];
                var newRow = tabla.insertRow();
                var newCell = newRow.insertCell();
                var newText = document.createTextNode(valueX.toFixed(2));
                newCell.appendChild(newText);
                newCell = newRow.insertCell();
                newText = document.createTextNode(valueY.toFixed(2));
                newCell.appendChild(newText);
                break;
            case 3:
                //Dibujar punto en la grafica
                myChart.data.datasets[1].data.push({
                    x: valueX,
                    y: valueY
                });
                data.push([1, valueX, valueY,1])
                myChart.update();
                // agregar coordenadas a la tabla
                var tabla = document.getElementById('tablaAzules');
                var newRow = tabla.insertRow();
                var newCell = newRow.insertCell();
                var newText = document.createTextNode(valueX.toFixed(2));
                newCell.appendChild(newText);
                newCell = newRow.insertCell();
                newText = document.createTextNode(valueY.toFixed(2));
                newCell.appendChild(newText);
                break;
        }
    }
}

function get_coordinates(weights){
    let coordinates = []
    let slope = -(weights[0]/weights[2])/(weights[0]/weights[1])
    let intercept = -weights[0]/weights[2]
    for (let i = -5; i<=5; i+=.1){
        y1 = (slope*i) + intercept

        coordinates.push({
            x: i,
            y: y1
        })
    }
    return coordinates

}

function predict(inputs, weights){
    let threshold = 0.0;
    let total_activation = 0.0;
    for (let index = 0; index < 3; index++){
        total_activation += inputs[index] * weights[index];
    }
    return (total_activation > threshold) ? 1 : 0;
}

var all_coord = []
function train_weights(matrix,weights,epochs,l_rate){
    let prediction;
    let error;
    for (let epoch = 0; epoch < epochs; epoch++) {
        // console.log("Epoch " + (epoch+1));
        // console.log(weights)
        for (let i = 0; i < matrix.length; i++) {
            all_coord.push(get_coordinates(weights))
            prediction = predict(matrix[i], weights);
            checked_pred = prediction === matrix[i][3]

            if (checked_pred === false){
                if (prediction === 1){
                    error = -1;
                }else{
                    error = 1;
                }
                for (let j = 0; j < weights.length; j++){
                    weights[j] = weights[j] + (l_rate * error * matrix[i][j]);

                }
            }
        }
    }
    return weights;
}
var myVar;

$( "#train" ).click(function() {
    train()
    setTimeout (function() { dibujarLinea(0); }, 1000);
});

$( "#epochiter" ).change(function() {
    let value = parseInt(document.getElementById("epochiter").innerHTML);
    let epochs = parseInt(document.getElementById("epochNumber").value);
    if(value < epochs){
        clearInterval(myVar)
    }
});

function initialize(){
    document.getElementById("w0").value = (Math.random() * .5  * (Math.round(Math.random()) ? 1 : -1)).toFixed(2);
    document.getElementById("w1").value = (Math.random() * .5 * (Math.round(Math.random()) ? 1 : -1)).toFixed(2);
    document.getElementById("w2").value = (Math.random() * .5 * (Math.round(Math.random()) ? 1 : -1)).toFixed(2);
    let w0 = parseFloat(document.getElementById("w0").value);
    let w1 = parseFloat(document.getElementById("w1").value);
    let w2 = parseFloat(document.getElementById("w2").value);
    let weights = [w0, w1, w2];
    myChart.data.datasets[2].data = get_coordinates(weights);
    myChart.update();
}

function train(){
    let w0 = parseFloat(document.getElementById("w0").value);
    let w1 = parseFloat(document.getElementById("w1").value);
    let w2 = parseFloat(document.getElementById("w2").value);
    let epochs = parseInt(document.getElementById("epochNumber").value);
    let l_rate =  parseFloat(document.getElementById("learningRate").value);
    let weights = [w0, w1, w2];
    final_weights = train_weights(data,weights,epochs,l_rate)
}

function dibujarLinea(iter){
    document.getElementById("epochiter").innerHTML = iter;
    console.log(all_coord[iter])
    myChart.data.datasets[2].data = all_coord[iter];
    myChart.update();
    myVar = setTimeout (function() { dibujarLinea(iter+1); }, 1000);
}
