// part 3. with research and testing, writing annealing took ~1 hr

const part1 = require('./part1');
const part2 = require('./part2');
const _ = require('lodash');
const util = require('./util');

function caesar_crack(cipher, model, lambda) {
    let bestKey = _.maxBy(_.range(26), k => part2.log_prob(part1.caesar_decrypt(cipher, k), model, lambda));
    return {key: bestKey, message: part1.caesar_decrypt(cipher, bestKey)}
}

var corpus = `But the difficulties occur in a new principality. And firstly, if it be not entirely new, but is, as it were, a member of a state which, taken collectively, may be called composite, the changes arise chiefly from an inherent difficulty which there is in all new principalities; for men change their rulers willingly, hoping to better themselves, and this hope induces them to take up arms against him who rules: wherein they are deceived, because they afterwards find by experience they have gone from bad to worse. This follows also on another natural and common necessity, which always causes a new prince to burden those who have submitted to him with his soldiery and with infinite other hardships which he must put upon his new acquisition.
In this way you have enemies in all those whom you have injured in seizing that principality, and you are not able to keep those friends who put you there because of your not being able to satisfy them in the way they expected, and you cannot take strong measures against them, feeling bound to them. For, although one may be very strong in armed forces, yet in entering a province one has always need of the goodwill of the natives.
For these reasons Louis the Twelfth, King of France, quickly occupied Milan, and as quickly lost it; and to turn him out the first time it only needed Lodovico's own forces; because those who had opened the gates to him, finding themselves deceived in their hopes of future benefit, would not endure the ill-treatment of the new prince. It is very true that, after acquiring rebellious provinces a second time, they are not so lightly lost afterwards, because the prince, with little reluctance, takes the opportunity of the rebellion to punish the delinquents, to clear out the suspects, and to strengthen himself in the weakest places. Thus to cause France to lose Milan the first time it was enough for the Duke Lodovico(*) to raise insurrections on the borders; but to cause him to lose it a second time it was necessary to bring the whole world against him, and that his armies should be defeated and driven out of Italy; which followed from the causes above mentioned`.toUpperCase().replace(/[^A-Z]/g, '')

var model = part2.get_counts(corpus);
var sentence = part1.caesar_encrypt('Nevertheless Milan was taken from France both the first and the second time'.toUpperCase(), 5);

// console.log("PART 3");
// console.log("decrypting", sentence);
// console.log(caesar_crack(sentence, model));


/* simulated annealing approach to cracking the vigenere cipher */
function vigenere_crack_sa(cipher, model, key_length, lambda, seeds=5, iters=1000) {
    let initialize_key = () => _.times(key_length, x => _.random(26-1));
    let prob_fcn = state => part2.log_prob(part1.vigenere_decrypt(cipher, state), model, lambda); // evaluate the log_prob.
    let transition = state => {
        let result = _.clone(state);
        result[_.random(state.length-1)] = _.random(26-1);
        return result;
    }

    let result_key = anneal(prob_fcn, transition, initialize_key, seeds, iters);
    return {key: result_key, message: part1.vigenere_decrypt(cipher, result_key)};
}

function substitution_crack_sa(cipher, model, lambda, seeds=10, iters=10000) {
    var freq_table = _.countBy(cipher);
    var initialize_key = () => _.shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ').join('');

    let prob_fcn = state => part2.log_prob(part1.substitution_decrypt(cipher, state), model, lambda);
    let transition = state => {
        let result = state.split('');
        // let index1 = curr_letter;
        let index1 = _.random(state.length - 1);
        // curr_letter = (curr_letter + 1) % 26;
        let index2 = _.random(state.length - 1);

        // swap
        let temp = result[index1];
        result[index1] = result[index2]
        result[index2] = temp;

        return result.join('');
    }

    let result_key = anneal(prob_fcn, transition, initialize_key, seeds, iters);
    return {key: result_key, message: part1.substitution_decrypt(cipher, result_key), score: prob_fcn(result_key)};
}

/**
 Optimization routine to find the maximum of prob_fcn.
 prob_fcn: function to maximize. should take state as its argument
 transition: how to generate another state from the previous state
 initialize_state: a function that returns an initial state
 iters: number of iterations to run
*/
function anneal(prob_fcn, transition, initialize_state, seeds=1, iters=100000) {
    let best_result = initialize_state();

    for(let i=0; i<seeds; i++) {
        let temp = 0.5;
        let curr_state = initialize_state();
        let curr_cost = prob_fcn(curr_state);

        // perform annealing. do a few extra steps with temp=0 to refine the final solution
        for(let j=0; j<iters; j++) {
            let candidate_state = transition(curr_state);
            let candidate_cost = prob_fcn(candidate_state);
            if(candidate_cost > curr_cost || Math.random() < temp) {
                curr_state = candidate_state;
                curr_cost = candidate_cost;
            }
            temp = 1 - j / iters - 0.5;
        }

        if(prob_fcn(curr_state) > prob_fcn(best_result)) {
            best_result = curr_state;
        }
    }

    return best_result;
}


// var corpus = fs.readFileSync('./ptb.train.txt').toString();
// corpus = corpus.replace(/<unk>/g, '').replace(/N/g, '').replace(/[^a-z ]/g, '').toUpperCase();

// var model = part2.get_counts(corpus);

// let prob_fcn = state => part2.log_prob(part1.substitution_decrypt(cipher, state), model);
// console.log(part2.log_prob("T RISP IR TOGEOAIO IHNE MOEC AI PTFE FEHA NDLTSEAAE RDBAESO UTO NTMOEC T UDLU YESNEHATLE IR NTHNES CETAUO", model))
// console.log("score of original sentence", part2.log_prob('a form of asbestos once used to make kent cigarette filters has caused a high percentage of cancer deaths'.toUpperCase(), model));

// var sentence = part1.substitution_encrypt('Nevertheless Milan was taken from France both the first and the second time'.toUpperCase(), 'qwertyuiopasdfghjklzxcvbnm'.toUpperCase());
// console.log("decrypting with substitution:", sentence);
// var t = Date.now();
// console.log(_.maxBy(_.times(10, () => substitution_crack_sa(sentence, model, iters=5000)),
//         k => part2.log_prob(part1.substitution_decrypt(sentence, k.key), model, lambda)));
// console.log("Time taken:", (Date.now() - t) / 1000, "s");

// MAIN
if (require.main === module) {
    const fs = require('fs');
    const lambda = [1e-6,1e-5,1e-4,1e-3,1e-2,1e-1,0.9];
    let ptb = fs.readFileSync('./ptb.train.txt').toString();
    ptb = ptb.replace(/<unk> /g, '').replace(/N /g, ''); // get rid of added tokens
    let ptb_counts = part2.get_counts(ptb);

    util.test_case('3a', line => {
        let [CRACK, message] = line.split('|').map(_.trim);
        let result = caesar_crack(message, ptb_counts, lambda);
        return result.key + ' | ' + result.message;
    });

    util.test_case('3b', line => {
        let [CRACK, message, message_len] = line.split('|').map(_.trim);
        let result = vigenere_crack_sa(message, ptb_counts, parseInt(message_len), lambda, seeds=5, iters=1000);
        return result.key.join(' ') + ' | ' + result.message;
    });

    // util.test_case('3c', line => {
    //     // pass
    // })


}