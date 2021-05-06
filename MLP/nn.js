
function sigmoid(x){
    return 1 / (1 + Math.exp(-x));
}

function dsigmoid(y){
    return y * (1 - y);
}

class NeuralNetwork{
    constructor(numI, numH, numO,learning_rate = 0.1,desired_error = 0.1, hl2 = false) {
        this.hl2 = hl2;
        this.learning_rate = learning_rate;
        this.desired_error = desired_error;

        if(this.hl2 === false){
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
        }else{
            this.input_nodes = numI;
            this.hidden_nodes1 = numH;
            this.hidden_nodes2 = numH;
            this.output_nodes = numO;

            this.weights_ih1 = new Matrix(this.hidden_nodes1,this.input_nodes);
            this.weights_h1h2 = new Matrix(this.hidden_nodes2,this.hidden_nodes2);
            this.weights_h2o = new Matrix(this.output_nodes,this.hidden_nodes2);
            this.weights_ih1.randomize();
            this.weights_h1h2.randomize();
            this.weights_h2o.randomize();

            this.bias_h1 = new Matrix(this.hidden_nodes1,1);
            this.bias_h2 = new Matrix(this.hidden_nodes2,1);
            this.bias_o = new Matrix(this.output_nodes, 1);

            this.bias_h1.randomize();
            this.bias_h2.randomize();
            this.bias_o.randomize();
        }
    }

    feedforward(input_array){
        // Generating the Hidden Outputs
        if (this.hl2 === false){
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
        }else{
            let inputs = Matrix.fromArray(input_array);
            let hidden1 = Matrix.multiply(this.weights_ih1, inputs);
            hidden1.add(this.bias_h1);
            // activation function!
            hidden1.map(sigmoid);

            let hidden2 = Matrix.multiply(this.weights_h1h2, hidden1);
            hidden2.add(this.bias_h2);
            hidden2.map(sigmoid);

            // Generating the output's output!
            let output = Matrix.multiply(this.weights_h2o, hidden2);
            output.add(this.bias_o);
            output.map(sigmoid);

            // Sending back to the caller!
            return output.toArray();
        }
    }

    calculate_error(a){
        // console.log(a.average());
        return a.average() < this.desired_error;
    }

    train(input_array, target_array){
        if (this.hl2 === false){
            // FEEDFORWARD
            // Generating the Hidden Outputs
            let inputs = Matrix.fromArray(input_array);
            let hidden = Matrix.multiply(this.weights_ih, inputs);
            hidden.add(this.bias_h);
            // activation function!
            hidden.map(sigmoid);

            // Generating the output's output!
            let outputs = Matrix.multiply(this.weights_ho, hidden);
            outputs.add(this.bias_o);
            outputs.map(sigmoid);

            // Convert array to matrix object
            let targets = Matrix.fromArray(target_array);

            // Calculate the error
            // ERROR = TARGETS - OUTPUTS
            let output_errors = Matrix.subtract(targets, outputs);

            if (this.calculate_error(output_errors)){
                return true;
            }

            // Calculate gradient
            let gradients = Matrix.map(outputs, dsigmoid);
            gradients.multiply(output_errors);
            gradients.multiply(this.learning_rate);


            // Calculate deltas
            let hidden_T = Matrix.transpose(hidden);
            let weight_ho_deltas = Matrix.multiply(gradients, hidden_T);

            // Adjust the weights by deltas
            this.weights_ho.add(weight_ho_deltas);
            // Adjust the bias by its deltas (which is just the gradients)
            this.bias_o.add(gradients);

            // Calculate the hidden layer errors
            let who_t = Matrix.transpose(this.weights_ho);
            let hidden_errors = Matrix.multiply(who_t, output_errors);

            // Calculate hidden gradient
            let hidden_gradient = Matrix.map(hidden, dsigmoid);
            hidden_gradient.multiply(hidden_errors);
            hidden_gradient.multiply(this.learning_rate);

            // Calcuate input->hidden deltas
            let inputs_T = Matrix.transpose(inputs);
            let weight_ih_deltas = Matrix.multiply(hidden_gradient, inputs_T);

            this.weights_ih.add(weight_ih_deltas);
            // Adjust the bias by its deltas (which is just the gradients)
            this.bias_h.add(hidden_gradient);
        }else{

            let inputs = Matrix.fromArray(input_array);
            let hidden1 = Matrix.multiply(this.weights_ih1, inputs);
            hidden1.add(this.bias_h1);
            // activation function!
            hidden1.map(sigmoid);

            let hidden2 = Matrix.multiply(this.weights_h1h2, hidden1);
            hidden2.add(this.bias_h2);
            hidden2.map(sigmoid);

            // Generating the output's output!
            let outputs = Matrix.multiply(this.weights_h2o, hidden2);
            outputs.add(this.bias_o);
            outputs.map(sigmoid);

            // Convert array to matrix object
            let targets = Matrix.fromArray(target_array);

            // BACKPROPAGATION

            // Calculate the error
            // ERROR = TARGETS - OUTPUTS
            let output_errors = Matrix.subtract(targets, outputs);

            if (this.calculate_error(output_errors)){
                return true;
            }


            // Calculate gradient descent
            let gradients = Matrix.map(outputs,sigmoid);
            gradients.multiply(output_errors);
            gradients.multiply(this.learning_rate);

            // Calculate deltas
            let hidden2_T = Matrix.transpose(hidden2);
            let weight_h2o_deltas = Matrix.multiply(gradients, hidden2_T);


            // Adjust the weights by deltas
            this.weights_h2o.add(weight_h2o_deltas);

            // Adjust the bias by its deltas
            this.bias_o.add(gradients);

            // We should make a loop for the backpropagation to multiple hidden layers
            // Calculate hidden layer errors
            let wh2o_t = Matrix.transpose(this.weights_h2o);
            let hidden2_errors = Matrix.multiply(wh2o_t, output_errors);

            // Calculate hidden gradient
            let hidden2_gradient = Matrix.map(hidden2, dsigmoid);
            hidden2_gradient.multiply(hidden2_errors);
            hidden2_gradient.multiply(this.learning_rate);

            // Calculate input->hidden deltas
            let hidden_1T = Matrix.transpose(hidden1);
            let weight_h1h2_deltas = Matrix.multiply(hidden2_gradient, hidden_1T);

            this.weights_h1h2.add(weight_h1h2_deltas);
            // Adjust the bias by its deltas
            this.bias_h2.add(hidden2_gradient);

            //Changing hidden 1 inputs
            let wh1h2_t = Matrix.transpose(this.weights_h1h2);
            let hidden1_errors = Matrix.multiply(wh1h2_t, hidden2_errors);

            // Calculate hidden gradient
            let hidden1_gradient = Matrix.map(hidden1, dsigmoid);
            hidden1_gradient.multiply(hidden1_errors);
            hidden1_gradient.multiply(this.learning_rate);

            // Calculate input->hidden deltas
            let inputs_T = Matrix.transpose(inputs);
            let weight_ih1_deltas = Matrix.multiply(hidden1_gradient, inputs_T);

            this.weights_ih1.add(weight_ih1_deltas);
            // Adjust the bias by its deltas
            this.bias_h1.add(hidden1_gradient);
        }
        return false;
    }
}