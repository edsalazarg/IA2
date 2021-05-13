let training_data = [];
let nn;
var trained = false;

let red_array = [0,0,1];
let green_array = [0,1,0];
let blue_array = [1,0,0];

var gradient_matrix;
var gradient_object;
var main_plot;
var datasets = {};

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

$(document).ready(initialize_gradient);

function initialize_gradient(){
    main_plot = document.getElementById('main_plot');
    let size = GRADIENT_RESOLUTION = 100;
    let x = new Array(size), y = new Array(size), z = new Array(size), i, j;
    //Assign x and y 100 values between -5 and 5
    //also assign z 100 arrays so we have a matrix of 100 * 100
    for(i = 0; i < GRADIENT_RESOLUTION; i++){
        x[i] = y[i] = - 5 + i * 0.1;
        z[i] = new Array(size);
    }
    //set all z values to 0
    for(i = 0; i < size; i++) {
        for(j = 0; j < size; j++) {
            z[i][j] = 0;
       }
    }
    //data used for contour
    var contour = {
        z: z,
        x: x,
        y: y,
        // type: 'heatmap',
        type: 'contour',
        // colorscale: [[0, '#6fdbff'], [0.5, '#bdff6a'], [1, '#ff6363']],
        colorscale: [[0, '#ffffff'], [0.5, '#808080'], [1, '#000000']],
        opacity: 0,
        //visible: false,
        // line:{
        //     smoothing: 0.85
        //   },
    }
    gradient_object = contour;

    var rojos = {
        mode: 'markers',
        type: 'scatter',
        x:[],
        y:[],
        marker: {
            color: '#FF0000',
        }
    }
    datasets['0'] = rojos;

    var verdes = {
        mode: 'markers',
        type: 'scatter',
        x:[],
        y:[],
        marker: {
            color: '#26ff00',
        }
    }
    datasets['1'] = verdes;

    var azules = {
        mode: 'markers',
        type: 'scatter',
        x:[],
        y:[],
        marker: {
            color: '#0040ff',
        }
    }
    datasets['2'] = azules;
    var layout = {
        showlegend: false,
        hovermode:'closest',
    };
    var data = [contour, rojos, verdes, azules];
    Plotly.newPlot('main_plot', data, layout, {responsive: true});
    //Evento click
    main_plot.on('plotly_click', function(data){
        let coords = data['points'][0];
        let valueX = coords['x'].toPrecision(4); 
        let valueY = coords['y'].toPrecision(4);
        let group = document.getElementById("groupColors").value    
        let output = [];
        let tabla;
        datasets[group]['x'].push(valueX);
        datasets[group]['y'].push(valueY);
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
        var newText = document.createTextNode(valueX);
        newCell.appendChild(newText);
        newCell = newRow.insertCell();
        newText = document.createTextNode(valueY);
        newCell.appendChild(newText);
        training_data.push({
            inputs: [valueX,valueY],
            outputs: output,
        });
        Plotly.redraw('main_plot')
    });
}


function update_gradient() {
    let size = GRADIENT_RESOLUTION;
    let nn_output, i, j, x, y;
    let gradient_matrix = gradient_object['z'];
    // for(i = 0; i < size; i++) {
    //     x = -5 + i * 0.1;
    //     for(j = 0; j < size; j++) {
    //         y = -5 + j * 0.1;
    //         nn_output = predict([x, y]);
    //         if(nn_output[2] === 1){
    //             gradient_matrix[j][i] = 1;
    //         }else if (nn_output[1] === 1){
    //             gradient_matrix[j][i] = .5;
    //         }else if (nn_output[0] === 1){
    //             gradient_matrix[j][i] = 0;
    //         }
    //    }
    // }
    for(i = 0; i < size; i++) {
        x = -5 + i * 0.1;
        for(j = 0; j < size; j++) {
            y = -5 + j * 0.1;
            nn_output = nn.feedforward([x, y]);
            let sum = 0;
            for (let k = 0; k < nn_output.length; k++) {
                sum += nn_output[k];
            }
            gradient_matrix[j][i] = sum;
        }
    }
    Plotly.redraw('main_plot');
}

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
    gradient_object['opacity'] = 1;
    update_gradient();
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
