let training_data = [{
        inputs: [0, 0],
        outputs: [0]
    },
    {
        inputs: [0, 1],
        outputs: [1]
    },
    {
        inputs: [1, 0],
        outputs: [1]
    },
    {
        inputs: [1, 1],
        outputs: [0]
    }
];

let nn;

function setup(){
    // nn = new NeuralNetwork(2,4,1, 0.1,0.001,true);
    nn = new NeuralNetwork(2,4,1, 0.1,0.001);
    // let data = random(training_data);
    // nn.train(data.inputs,data.outputs);
    for (let i = 0; i < 10000; i++){
        let finish = false;
        for (const data in training_data) {
            finish = nn.train(training_data[data].inputs,training_data[data].outputs)
        }
        if(finish){
            console.log(i);
            break;
        }
    }

    console.log(nn.feedforward([1,1]));
    console.log(nn.feedforward([1,0]));
    console.log(nn.feedforward([0,1]));
    console.log(nn.feedforward([0,0]));

}

function draw() {


}