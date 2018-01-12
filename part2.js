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

// Simpler version of log probability: lambda_n * P(ngram), where P(ngram) = count(ngram / n-1gram)
function get_prob2(q, counts, lambda) {
    let curr_count = counts;
    let total_prob = 1e-30; // if using a short corpus, don't want log prob to be -Inf
    for(let n=0; n<lambda.length; n++) {
        let next_count = curr_count[q.get(n)];

        if (next_count && next_count.sum) {
            total_prob += lambda[n] * next_count.sum / curr_count.sum;
        }
        else {
            break;
        }
        curr_count = next_count;
    }
    return Math.log(total_prob);
}

function get_count(counts, substr, N, base_model=false) {
    let curr_count = counts;
    for(let n=0; n<N; n++) {
        let ch = substr.charAt(n);
        if (base_model && (ch == ' ' || !util.is_upper(ch))) {
            continue; // ignore letters not in the corpus
        }

        let next_count = curr_count[ch];

        if (next_count && next_count.sum) {
            curr_count = next_count;
        }
        else {
            return 0;
        }
    }
    return curr_count.sum;
}

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

if (require.main === module) {
    const fs = require('fs');
    const lambda = [1e-6,1e-5,1e-4,1e-3,1e-2,1e-1,0.9];
    let ptb = fs.readFileSync('./ptb.train.txt').toString();
    ptb = ptb.replace(/<unk> /g, '').replace(/N /g, ''); // get rid of added tokens

    let ptb_counts = get_counts(ptb, true);

    // part 2a
    util.test_case('2a', line => {
        let [str, substr] = line.split('|').map(_.trim);
        return get_count(str === 'PTB' ? ptb_counts : get_counts(str, true), substr, substr.length, true);
    });

    // part 2b
    util.test_case('2b', line => {
        let [text1, text2] = line.split('|').map(_.trim);
        return log_prob(text1, ptb_counts, lambda) > log_prob(text2, ptb_counts, lambda) ? 1 : 2;
    });
}


module.exports = {log_prob, get_counts};