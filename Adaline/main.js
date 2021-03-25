Chart.pluginService.register({
    beforeDraw: function (chart, easing) {
        if (chart.config.final){
            var ctx = chart.chart.ctx;
            var chartArea = chart.chartArea;
            ex1 = chart.data.datasets[0].data[0].x
            ey1 = chart.data.datasets[0].data[0].y
            x1 = chart.getDatasetMeta(2).data[0]._model.x
            y1 = chart.getDatasetMeta(2).data[0]._model.y
            x2 = chart.getDatasetMeta(2).data[1]._model.x
            y2 = chart.getDatasetMeta(2).data[1]._model.y
            ctx.save();

            let region = new Path2D();
            region.moveTo(x1, y1);
            region.lineTo(chartArea.left, chartArea.bottom);
            region.lineTo(chartArea.right, chartArea.bottom);
            region.lineTo(x2, y2);
            region.closePath();
            ctx.fillStyle = lower;
            ctx.fill(region);
            region = new Path2D();
            region.moveTo(x1, y1);
            region.lineTo(chartArea.left, chartArea.top);
            region.lineTo(chartArea.right, chartArea.top);
            region.lineTo(x2, y2);
            region.closePath();
            ctx.fillStyle = upper;
            ctx.fill(region);

            ctx.fillStyle = 'rgba(255,255,255)';
            ctx.fillRect(chartArea.left, chartArea.bottom, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);

            ctx.fillStyle = 'rgba(255,255,255)';
            ctx.fillRect(0,0 , 1500,32);
            ctx.restore();
        }
    }
});

var algoritmo = 0
var all_error = []
var all_coord = []
var initial_weights = []
var final_epoch = -1
var trained = false
var final_weights = []
var data = []
var upper = false
var lower = false
var adaline_success = false
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
        final: false,
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

document.getElementById('myChart').onmousedown = FuncOnClick;

function slope_function(weights,x,y,true_value){
    let slope = -(weights[0]/weights[2])/(weights[0]/weights[1])
    let intercept = -weights[0]/weights[2]
    y1 = (slope*x) + intercept
    if(y > y1){
        if(true_value){
            upper = 'rgb(0,64,255,0.2)'
        }else{
            upper = 'rgb(255,0,0,0.2)'
        }
    }else{
        if(true_value){
            lower = 'rgb(0,64,255,0.2)'
        }else{
            lower = 'rgb(255,0,0,0.2)'
        }
    }
}

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
    for (let i = -5; i<=5; i+=10){
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

function train_weights(matrix,weights,epochs,l_rate){
    document.getElementById("algoritmo").innerHTML = "Perceptron"
    let prediction;
    let error;
    for (let epoch = 0; epoch < epochs; epoch++) {
        var accuracy = 0
        for (let i = 0; i < matrix.length; i++) {
            prediction = predict(matrix[i], weights);
            checked_pred = prediction === matrix[i][3];

            if (checked_pred === false){
                if (prediction === 1){
                    error = -1;
                }else{
                    error = 1;
                }
                for (let j = 0; j < weights.length; j++){
                    weights[j] = weights[j] + (l_rate * error * matrix[i][j]);
                }
            }else{
                slope_function(weights,matrix[i][1],matrix[i][2],matrix[i][3])
                accuracy++;
            }
        }
        all_coord.push(get_coordinates(weights));
        if (accuracy === data.length){
            final_epoch = epoch;
            break;
        }
    }
    return weights;
}

$( "#train" ).click(function() {
    if (data.length === 0)
        alert("Empty Data")
    else{
        if(algoritmo === 2){
            algoritmo = 1
            light_restart()
            myChart.data.datasets[2].data = get_coordinates(initial_weights);
            myChart.update();
        }
        train();
        algoritmo = 1
        trained = true;
        setTimeout (function() { dibujarLinea(0); }, 1000);
    }
});

$( "#adeline" ).click(function() {
    if (data.length === 0)
        alert("Empty Data")
    else{
        if(algoritmo === 1){
            algoritmo = 2;
            light_restart()
            myChart.data.datasets[2].data = get_coordinates(initial_weights);
            myChart.update();
        }
        algoritmo = 2;
        adeline();
        trained = true;
        setTimeout (function() { dibujarLinea(0); }, 1000);
    }
});

function adeline(){
    document.getElementById('train').disabled = true;
    document.getElementById('initialize').disabled = true;
    let w0 = parseFloat(document.getElementById("w0").value);
    let w1 = parseFloat(document.getElementById("w1").value);
    let w2 = parseFloat(document.getElementById("w2").value);
    let epochs = parseInt(document.getElementById("epochNumber").value);
    let l_rate =  parseFloat(document.getElementById("learningRate").value);
    let desiredError =  parseFloat(document.getElementById("desiredError").value);
    let weights = [w0, w1, w2];
    if (isNaN(desiredError)) {
      alert("Invalid value for Desired error")
      return
    }
    final_weights = train_adeline(data,weights,epochs,l_rate,desiredError)
}

function train_adeline(matrix,weights,epochs,l_rate, desiredError){
    document.getElementById("algoritmo").innerHTML = "Adaline"
    let error_acumulado;
    for (let epoch = 0; epoch < epochs; epoch++) {

        error_acumulado = 0;
        //Iterar los patrones
        for (let i = 0; i < matrix.length; i++) {
            let x = matrix[i];
            let desired_val = x[3];
            f_wx = sigmoide(x, weights);
            error = desired_val - f_wx;
            error_acumulado += (error * error)/2;

            for (let j = 0; j < weights.length; j++){
                weights[j] = weights[j] + l_rate * error * (f_wx * (1 - f_wx)) * x[j];
            }
            slope_function(final_weights,matrix[0][1],matrix[0][2],matrix[0][3])
        }
        all_coord.push(get_coordinates(weights));
        all_error.push(error_acumulado)
        if (error_acumulado <= desiredError){
            final_epoch = epoch;
            adaline_success = true
            break;
        }else{
            final_epoch = epoch;
        }
    }
    console.log(all_error)
    return weights;
}

function sigmoide(inputs, weights){
  y = 0;
  for (let index = 0; index < 3; index++){
      y += inputs[index] * weights[index];
  }
  y = y * -1;
  return 1/(1 + Math.pow(Math.E, y));
}

function initialize(){
    document.getElementById("w0").value = (Math.random() * .5  * (Math.round(Math.random()) ? 1 : -1)).toFixed(2);
    document.getElementById("w1").value = (Math.random() * .5 * (Math.round(Math.random()) ? 1 : -1)).toFixed(2);
    document.getElementById("w2").value = (Math.random() * .5 * (Math.round(Math.random()) ? 1 : -1)).toFixed(2);
    let w0 = parseFloat(document.getElementById("w0").value);
    let w1 = parseFloat(document.getElementById("w1").value);
    let w2 = parseFloat(document.getElementById("w2").value);
    let weights = [w0, w1, w2];
    initial_weights = weights
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

function light_restart(){
    document.getElementById('initialize').disabled = false;
    if (algoritmo === 2)
        document.getElementById('adeline').disabled = false;
    else
        document.getElementById('train').disabled = false;
    document.getElementById('epochiter').value = ""
    document.getElementById('epochtotal').value = ""
    document.getElementById("zerozero").innerHTML = '';
    document.getElementById("zeroone").innerHTML = '';
    document.getElementById("onezero").innerHTML = '';
    document.getElementById("oneone").innerHTML = '';
    document.getElementById("total").innerHTML = '';
    document.getElementById("actualno").innerHTML = '';
    document.getElementById("actualyes").innerHTML = '';
    document.getElementById("predno").innerHTML = '';
    document.getElementById("predyes").innerHTML = '';
    confussion_matriz = [0,0,0,0]
    myChart.config.final = false;
    $("#tablaAzules tr").remove();
    $("#tablaRojos tr").remove();
    final_epoch = -1
    myChart.update()
    errorChart.data.labels = []
    errorChart.data.datasets[0].data = []
    errorChart.update()
    all_coord = []
    all_error = []
    trained = false
}

function restart(){
    document.getElementById('initialize').disabled = false;
    document.getElementById('restart').disabled = true;
    document.getElementById('epochiter').value = ""
    document.getElementById('epochtotal').value = ""
    document.getElementById("w0").value = '';
    document.getElementById("w1").value = '';
    document.getElementById("w2").value = '';
    document.getElementById("zerozero").innerHTML = '';
    document.getElementById("zeroone").innerHTML = '';
    document.getElementById("onezero").innerHTML = '';
    document.getElementById("oneone").innerHTML = '';
    document.getElementById("total").innerHTML = '';
    document.getElementById("actualno").innerHTML = '';
    document.getElementById("actualyes").innerHTML = '';
    document.getElementById("predno").innerHTML = '';
    document.getElementById("predyes").innerHTML = '';
    confussion_matriz = [0,0,0,0]
    myChart.config.final = false;
    data = []
    adaline_success = false
    $("#tablaAzules tr").remove();
    $("#tablaRojos tr").remove();
    $("#tablaPrueba tr").remove();
    final_epoch = -1
    myChart.data.datasets[0].data = []
    myChart.data.datasets[1].data = []
    myChart.data.datasets[2].data = []
    myChart.data.datasets[3].data = []
    myChart.update()
    errorChart.data.labels = []
    errorChart.data.datasets[0].data = []
    errorChart.update()
    all_coord = []
    all_error = []
    trained = false
}

function mostrar_confusion_matriz(){
    matriz_epoch = [0,0,0,0]
    for (let i = 0; i < data.length; i++) {
        prediction = predict(data[i], final_weights);
        checked_pred = prediction === data[i][3];

        if (checked_pred === false){
            if (prediction === 1)
                matriz_epoch[1]++
            else
                matriz_epoch[2]++
        }else{
            if (prediction === 1)
                matriz_epoch[3]++
            else
                matriz_epoch[0]++
        }
    }
    document.getElementById("zerozero").innerHTML = matriz_epoch[0];
    document.getElementById("zeroone").innerHTML = matriz_epoch[1];
    document.getElementById("onezero").innerHTML = matriz_epoch[2];
    document.getElementById("oneone").innerHTML = matriz_epoch[3];
    document.getElementById("total").innerHTML = matriz_epoch[0] + matriz_epoch[1] + matriz_epoch[2] + matriz_epoch[3];
    document.getElementById("actualno").innerHTML = matriz_epoch[0] + matriz_epoch[1];
    document.getElementById("actualyes").innerHTML = matriz_epoch[2] + matriz_epoch[3];
    document.getElementById("predno").innerHTML = matriz_epoch[0] + matriz_epoch[2];
    document.getElementById("predyes").innerHTML = matriz_epoch[1] + matriz_epoch[3];
}

function dibujarLinea(iter){
    document.getElementById("epochiter").value = iter+1;
    myChart.data.datasets[2].data = all_coord[iter];
    myChart.update();
    if (final_epoch !== -1){
        if (iter<final_epoch){
          setTimeout (function() { dibujarLinea(iter+1); }, 150);
        }
        else{
            document.getElementById("epochtotal").value = (final_epoch+1);
            document.getElementById('restart').disabled = false;
            mostrar_confusion_matriz()
            myChart.config.final = true
            if (algoritmo === 2){

                errorChart.data.labels = range(0,final_epoch+1)
                errorChart.data.datasets[0].data = all_error
                errorChart.update()
                if(adaline_success === false){
                    alert("El error acumulado no llego a ser menor que el deseado");
                }
            }
        }
    }else{
        if (iter<(parseInt(document.getElementById("epochNumber").value)-1)){
          setTimeout (function() { dibujarLinea(iter+1); }, 150);
        }
        else{
            alert("El perceptron no pudo ser entrenado correctamente");
            document.getElementById('restart').disabled = false;
            myChart.config.final = true
            mostrar_confusion_matriz()
            if (algoritmo === 2){
                errorChart.data.labels = range(0,final_epoch+1)
                errorChart.data.datasets[0].data = all_error
                errorChart.update()
            }
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
