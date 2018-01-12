const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

function is_upper(ch) {
    let cc = ch.charCodeAt(0);
    return 65 <= cc && cc <= 90;
}

function test_case(case_name, process_in) {
    fs.readFileAsync(`input/${case_name}.in`, 'ascii')
    .then(data => {
        console.log(data.split('\n')
                   .filter(x => x.length !== 0) )// remove blank lines)
        return data.split('\n')
                   .filter(x => x.length !== 0) // remove blank lines
                   .map(process_in);
    })
    .then(lines => {
        fs.writeFileAsync(`output/${case_name}.out`, lines.join('\n'))
    })
    .then(() => console.log(`done ${case_name}`))
    .catch(err => console.error(err));
}

module.exports = {
    is_upper, test_case
};