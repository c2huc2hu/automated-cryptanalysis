# Automated Cipher Cracking

This code implements the Caesar, Vigenere and substitution ciphers and automatically decrypts text written in them.
[Katz's backoff model](https://en.wikipedia.org/wiki/Katz%27s_back-off_model) is used to score candidate decryptions.
The Caesar cipher is can be brute forced easily, but the Vigenere and substitution ciphers use simulated annealing to find a solution.

This was a prototype to investigate the feasibility of [UTEK 2018's programming challenge](https://github.com/utek-2018/competition-package), hence the simplicity.

## Example
```
DWQI IOKDOKTO QI L ELQZJY DYBQTLJ GKO LKU IWGSJU VO OLIY DG UOTZYBD. -> 
LVTUOE*WQ**J*KGB*ZIDS***Y* | THIS SENTENCE IS A FAIRLY TYPICAL ONE AND SHOULD BE EASY TO DECRYPT.
```

## Notes
* For the Caesar and Vigenere ciphers, surprisingly little training data is needed. 
For the Caesar cipher, a few lines of text was enough. For the Vigenere cipher, a couple paragraphs sufficed.
* Seeding the substitution cipher with a frequency attack didn't help much.

## Possible Improvements
* Optimize hyperparameters (number of iterations, speed of temperature drop)
* Try heuristic-based search: weight decrypting common letters in the ciphertext as common letters in English
* Try more organized search: swap keys from sequential indices instead of randomly
* Improve the model: use a dictionary, neural network etc.

## Running
Expects test cases in the `input` folder and writes to the `output` folder. 

```
npm install
git clone https://github.com/utek-2018/competition-package
python3 competition-package/tester.py --ref=competition-package/
```
