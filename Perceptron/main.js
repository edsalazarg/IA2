
var red_values = []
var blue_values = []

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
            data: [{
                x: -2,
                y: -2
            },{
                x: 2,
                y: 2
            }],
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
                red_values.push([valueX, valueY])
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
                blue_values.push([valueX, valueY])
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

function dibujarLinea(coordenadas){
  myChart.data.datasets[2].data = coordenadas;
  myChart.update();
}

function showValues() {
    alert(JSON.stringify(red_values))
    alert(JSON.stringify(blue_values))
}
