// started at 11:50
// finished at 12:50

// All of these functions take an uppercase string and key, and return a string.
// Ignore non-uppercase letters

const _ = require('lodash');
const util = require('./util');

function caesar_encrypt(message, key) {
    let ords = _.map(message, ch => {
        if(!util.is_upper(ch)) {
            return ch.charCodeAt(0);
        }
        return (ch.charCodeAt(0) - 65 + key + 26) % 26 + 65;
    });
    return String.fromCharCode(...ords);
}

function caesar_decrypt(cipher, key) {
    return caesar_encrypt(cipher, -key);
}

function vigenere_encrypt(message, key) {
    var key_index = 0;
    let ords = _.map(message, (ch) => { // iteration order for iterables is guaranteed in lodash
        if(!util.is_upper(ch)) {
            return ch.charCodeAt(0);
        }
        return (ch.charCodeAt(0) - 65 + key[key_index++ % key.length] + 26) % 26 + 65; // TODO: need to verify this
    });
    return String.fromCharCode(...ords)
}

function vigenere_decrypt(cipher, key) {
    let inverse_key = key.map(x => -x);
    return vigenere_encrypt(cipher, inverse_key)
}

 // flagging potential issue: sending weird unprintable characters in html body. Also be careful about null terminated strings
function xor_decrypt(message, key) {
    let ords = _.map(message, (ch, index) => {
        return ch.charCodeAt(0) ^ key[index % key.length];
    });
    return String.fromCharCode(...ords)
}

function xor_encrypt(cipher, key) {
    return xor_decrypt(cipher, key);
}

// key is a permutation of the alphabet
function poly_decrypt(message, key) {
    // construct the object
    let encrypt_table = {};
    for(let i=0; i<26; i++) {
        encrypt_table[key.charCodeAt(i)] = i + 65;
    }

    let result_array = _.map(message, (ch, i) => {
        return encrypt_table[message.charCodeAt(i)] ? encrypt_table[message.charCodeAt(i)] : message.charCodeAt(i);
    });
    return String.fromCharCode(...result_array);
}

function poly_encrypt(cipher, key) {
    let encrypt_table = {};
    for(let i=0; i<26; i++) {
        encrypt_table[String.fromCharCode(i + 65)] = key.charCodeAt(i);
    }

    let result_array = _.map(cipher, ch => {
        return encrypt_table[ch] ? encrypt_table[ch] : ch.charCodeAt(0);
    });
    return String.fromCharCode(...result_array);
}

// console.log(vigenere_encrypt("ALPHABETIZE THIS!", [1,3,5]));
// console.log(caesar_encrypt("ALPHABETIZE!", 2));
// console.log(caesar_encrypt("ALPHABETIZE!", 3));

// console.log(caesar_decrypt(caesar_encrypt("HELLO WORLD!", 3), 3));
// console.log(vigenere_encrypt("HELLO WORLD!", [1, 4, 2]));
// console.log(vigenere_decrypt(vigenere_encrypt("HELLO WORLD!", [1, 4, 2]), [1, 4, 2]));
// console.log(poly_encrypt("HELLO WORLD", "QWERTYUIOPASDFGHJKLZXCVBNM"));
// console.log(poly_decrypt(poly_encrypt("HELLO WORLD", "QWERTYUIOPASDFGHJKLZXCVBNM"), "QWERTYUIOPASDFGHJKLZXCVBNM"));


module.exports = {
    caesar_encrypt, caesar_decrypt, vigenere_encrypt, vigenere_decrypt, xor_encrypt, xor_decrypt, poly_encrypt, poly_decrypt
}