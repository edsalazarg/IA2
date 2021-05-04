let training_data = [{
        inputs: [0, 0],
        outputs: [0,1]
    },
    {
        inputs: [0, 1],
        outputs: [1,1]
    },
    {
        inputs: [1, 0],
        outputs: [1,0]
    },
    {
        inputs: [1, 1],
        outputs: [0,0]
    }
];

function setup(){
    let nn = new NeuralNetwork(2,2,2, );

    // let output = nn.feedforward(input);
    for (let i = 0; i < 1; i++){
        for(data of training_data){
            nn.train(data.inputs,data.outputs);
        }
    }

    console.log(nn.feedforward([1,1]));
    console.log(nn.feedforward([1,0]));
    console.log(nn.feedforward([0,1]));
    console.log(nn.feedforward([0,0]));

}

function draw() {

}