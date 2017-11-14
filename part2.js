// part 2: language modelling
// started at 10, started debugging at 10:50. probably only took about 30 mins to do the log prob calculations
// TODO: scraping

const Deque = require('double-ended-queue');
const util = require('./util');
const _ = require('lodash');

// const N = 7; // N as in n-graph
// const lambda = [1e-6,1e-5,1e-4,1e-3,1e-2,1e-1,0.9];

/* Return the log probability of a sequence of characters */
function log_prob(sentence, counts, lambda) {
    let queue = new Deque(lambda.length);
    let result = 0;

    // fill the queue with garbage
    for(let i=0; i<lambda.length; i++) {
        queue.insertFront('-');
    }

    _.forEach(sentence, ch => {
        if(util.is_upper(ch) || ch == ' ') {
            queue.removeFront();
            queue.insertBack(ch);
            result += get_prob2(queue, counts, lambda);
        }
    })
    return result;
}

// var counts = {
//     A: {
//         A: {sum: 50},
//         B: {sum: 25},
//         sum: 75
//     },
//     B: {
//         A: {sum: 10},
//         B: {sum: 15},
//         sum: 25
//     },
//     sum: 100
// }

// // q is a lambda.length vector
// // return the probability of the sequence of characters in q
// function get_prob(q, counts) {
//     let curr_count = counts;
//     let result = 0;
//     let done_flag = false;

//     let ngram_prob = 1;
//     for(let n=0; n<lambda.length; n++) {
//         let next_count = curr_count[q.get(n)];

//         if (next_count && next_count.sum) {
//             ngram_prob *= next_count.sum / curr_count.sum; // may be easier just to recalculate these from scratch...
//         }
//         else {
//             ngram_prob *= (next_count || 0) / curr_count.sum; // next_count may be undefined if that ngram is never seen
//             done_flag = true;
//         }
//         result += lambda[n] * ngram_prob;

//         if(done_flag) {
//             return Math.log(result);
//         }

//         curr_count = next_count;
//     }
//     return Math.log(result);
// }

// Simpler version of log probability: lambda_n * P(ngram), where P(ngram) = count(ngram / n-1gram)
function get_prob2(q, counts, lambda) {
    let curr_count = counts;
    let total_prob = 1e-30; // if using a short corpus, don't want log prob to be -Inf
    for(let n=0; n<lambda.length; n++) {
        let next_count = curr_count[q.get(n)];

        if (next_count && next_count.sum) {
            total_prob += lambda[n] * next_count.sum // curr_count.sum;
        }
        else {
            break;
        }
        curr_count = next_count;
    }
    return Math.log(total_prob);
}

// console.log((log_prob('AAAB AB  ABA AB AB AB AB ', counts)));

// return ngram counts for the corpus
function get_counts(corpus, base_model=false, N=7) {
    let result = {sum: 0};

    corpus = corpus.toUpperCase();

    // the base model doesn't count punctuation or spaces. my only improvement is to use spaces
    if (base_model) {
        corpus = corpus.replace(/[^A-Z]/g, '');
    }
    else {
        corpus = corpus.replace(/[^A-Z ]/g, '');
    }

    for(let i=0; i<corpus.length; i++) {
        let curr = result; // pointer to where we are in the result generator
        curr.sum += 1;
        for(let j=0; j<N; j++) {
            if(i + j >= corpus.length)
                break;

            if(!curr[corpus[i+j]]) {
                // create entry in the ngram table if it doesn't exist\
                curr[corpus[i+j]] = {sum: 0};
            }
            curr = curr[corpus[i+j]]
            curr.sum += 1;
        }
    }
    return result;
}


module.exports = {log_prob, get_counts};