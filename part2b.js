function parse_corpus(corpus) {
    let result = {};
    let curr = result;

    for(let i=0; i<corpus.length - N; i++) {
        let curr = result; // pointer to where we are in the result generator
        for(let j=0; j<N; j++) {
            curr.sum += 1;

            if(!curr[corpus[i+j]]) {
                // create entry in the ngram table if it doesn't exist\
                curr[corpus[i+j]] = {sum: 1};
            }
            curr = curr[corpus[i+j]]
        }
    }
    return result;
}

parse_corpus("abc")