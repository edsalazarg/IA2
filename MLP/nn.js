
function sigmoid(x){
    return 1 / (1 + Math.exp(-x));
}

function dsigmoid(y){
    // return sigmoid(x) * (1 - sigmoid(x));
    return y * (1 - y);
}

class NeuralNetwork{
    constructor(numI, numH, numO) {
        this.input_nodes = numI;
        this.hidden_nodes = numH;
        this.output_nodes = numO;

        this.weights_ih = new Matrix(this.hidden_nodes,this.input_nodes);
        this.weights_ho = new Matrix(this.output_nodes,this.hidden_nodes);
        this.weights_ih.randomize();
        this.weights_ho.randomize();

        this.bias_h = new Matrix(this.hidden_nodes,1);
        this.bias_o = new Matrix(this.output_nodes, 1);

        this.bias_h.randomize();
        this.bias_o.randomize();
        this.learning_rate = 0.1;

    }

    feedforward(input_array){
        // Generating the Hidden Outputs
        let inputs = Matrix.fromArray(input_array);
        let hidden = Matrix.multiply(this.weights_ih, inputs);
        hidden.add(this.bias_h);
        // activation function!
        hidden.map(sigmoid);

        // Generating the output's output!
        let output = Matrix.multiply(this.weights_ho, hidden);
        output.add(this.bias_o);
        output.map(sigmoid);

        // Sending back to the caller!
        return output.toArray();
    }

    train(input_array, target_array){

        // FEEDFORWARD
        // Generating the hidden outputs
        let inputs = Matrix.fromArray(input_array);
        let hidden = Matrix.multiply(this.weights_ih, inputs);
        hidden.add(this.bias_h);

        // Activation function
        hidden.map(sigmoid);

        let outputs = Matrix.multiply(this.weights_ho, hidden);
        outputs.add(this.bias_o);
        outputs.map(sigmoid);

        // Convert array to matrix object
        let targets = Matrix.fromArray(target_array);



        // BACKPROPAGATION

        // Calculate the error
        // ERROR = TARGETS - OUTPUTS
        let output_errors = Matrix.subtract(targets, outputs);
        console.table(output_errors.data);


        // Calculate gradient descent
        let gradients = Matrix.map(outputs,sigmoid);
        gradients.multiply(output_errors);
        gradients.multiply(this.learning_rate);

        // Calculate deltas
        let hidden_T = Matrix.transpose(hidden);
        let weight_ho_deltas = Matrix.multiply(gradients, hidden_T);


        // Adjust the weights by deltas
        this.weights_ho.add(weight_ho_deltas);

        // Adjust the bias by its deltas
        this.bias_o.add(gradients);

        // We should make a loop for the backpropagation to multiple hidden layers
        // Calculate hidden layer errors
        let who_t = Matrix.transpose(this.weights_ho);
        let hidden_errors = Matrix.multiply(who_t, output_errors);

        // Calculate hidden gradient
        let hidden_gradient = Matrix.map(hidden, dsigmoid);
        hidden_gradient.multiply(hidden_errors);
        hidden_gradient.multiply(this.learning_rate);

        // Calculate input->hidden deltas
        let inputs_T = Matrix.transpose(inputs);
        let weight_ih_deltas = Matrix.multiply(hidden_gradient, inputs_T);

        this.weights_ih.add(weight_ih_deltas);
        // Adjust the bias by its deltas
        this.bias_h.add(hidden_gradient);

    }
}