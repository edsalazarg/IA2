
var trained = false
var final_weights = []
var data = []
var confussion_matriz = [0,0,0,0]
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
            backgroundColor: '#26ff00'
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
        myChart.data.datasets[3].data.push({
            x: valueX,
            y: valueY
        });
        prediction = predict([1,valueX, valueY], final_weights)
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
        console.log("Epoch " + (epoch+1));
        console.log(weights)
        for (let i = 0; i < matrix.length; i++) {
            prediction = predict(matrix[i], weights);
            checked_pred = prediction === matrix[i][3]

            if (checked_pred === false){
                if (prediction === 1){
                    confussion_matriz[1]++
                    error = -1;
                }else{
                    confussion_matriz[2]++
                    error = 1;
                }
                for (let j = 0; j < weights.length; j++){
                    weights[j] = weights[j] + (l_rate * error * matrix[i][j]);
                }
            }else{
                if (prediction === 1)
                    confussion_matriz[3]++
                else
                    confussion_matriz[0]++
            }
        }
        all_coord.push(get_coordinates(weights))
    }
    return weights;
}

$( "#train" ).click(function() {
    if (data.length === 0)
        alert("Empty Data")
    else{
        train();
        trained = true;
        setTimeout (function() { dibujarLinea(0); }, 200);
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
    document.getElementById('train').disabled = false;
    myChart.data.datasets[2].data = get_coordinates(weights);
    myChart.update();
}

function train(){
    document.getElementById('train').disabled = true;
    document.getElementById('initialize').disabled = true;
    let w0 = parseFloat(document.getElementById("w0").value);
    let w1 = parseFloat(document.getElementById("w1").value);
    let w2 = parseFloat(document.getElementById("w2").value);
    let epochs = parseInt(document.getElementById("epochNumber").value);
    let l_rate =  parseFloat(document.getElementById("learningRate").value);
    let weights = [w0, w1, w2];
    final_weights = train_weights(data,weights,epochs,l_rate)
}

function restart(){
    document.getElementById('initialize').disabled = false;
    document.getElementById('restart').disabled = true;
    document.getElementById('epochiter').innerHTML = "None"
    document.getElementById("w0").value = '';
    document.getElementById("w1").value = '';
    document.getElementById("w2").value = '';
    data = []
    $("#tablaAzules tr").remove();
    $("#tablaRojos tr").remove();
    $("#tablaPrueba tr").remove();
    myChart.data.datasets[0].data = []
    myChart.data.datasets[1].data = []
    myChart.data.datasets[2].data = []
    myChart.data.datasets[3].data = []
    myChart.update()
    all_coord = []
    trained = false
}

function dibujarLinea(iter){
    document.getElementById("epochiter").innerHTML = iter+1;
    myChart.data.datasets[2].data = all_coord[iter];
    myChart.update();
    if (iter<(parseInt(document.getElementById("epochNumber").value)-1))
        setTimeout (function() { dibujarLinea(iter+1); }, 200);
    else{
        document.getElementById('restart').disabled = false;
        document.getElementById("zerozero").innerHTML = confussion_matriz[0];
        document.getElementById("zeroone").innerHTML = confussion_matriz[1];
        document.getElementById("onezero").innerHTML = confussion_matriz[2];
        document.getElementById("oneone").innerHTML = confussion_matriz[3];
        document.getElementById("total").innerHTML = confussion_matriz[0] + confussion_matriz[1] + confussion_matriz[2] + confussion_matriz[3];
        document.getElementById("actualno").innerHTML = confussion_matriz[0] + confussion_matriz[1];
        document.getElementById("actualyes").innerHTML = confussion_matriz[2] + confussion_matriz[3];
        document.getElementById("predno").innerHTML = confussion_matriz[0] + confussion_matriz[2];
        document.getElementById("predyes").innerHTML = confussion_matriz[1] + confussion_matriz[3];
    }
}
