// part 3. with research and testing, writing annealing took ~1 hr

const part1 = require('./part1');
const part2 = require('./part2');
const _ = require('lodash');

function caesar_crack(cipher, model) {
    let bestKey = _.maxBy(_.range(26), k => part2.log_prob(part1.caesar_decrypt(cipher, k), model));
    console.log(_.range(26).map(k => part2.log_prob(part1.caesar_decrypt(cipher, k), model)))
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
function vigenere_crack_sa(cipher, model, key_length, iters=50000) {
    let initial_key = _.times(key_length, _.random(26-1));
    let prob_fcn = state => part2.log_prob(part1.vigenere_decrypt(cipher, state), model); // evaluate the log_prob.
    let transition = state => {
        let result = _.clone(state);
        result[_.random(state.length-1)] = _.random(26-1);
        return result;
    }

    let result_key = anneal(prob_fcn, transition, initial_key, iters);
    return {key: result_key, message: part1.vigenere_decrypt(cipher, result_key)};
}

function substitution_crack_sa(cipher, model, iters=50000) {
    // seed with a frequency attack
    var freq_table = _.countBy(cipher);
    var initial_key = _.sortBy(_.zip(
        _.sortBy('ABCDEFGHIJKLMNOPQRSTUVWXYZ', letter => freq_table[letter] || 0).join('').split(''),
        'ZQXJKVBPYGFWMUCLDRHSNIOATE'.toUpperCase().split('')
    ), x => x[1])
    .map(x => x[0]).join('');

    console.log(part1.poly_decrypt(cipher, initial_key))

    let prob_fcn = state => part2.log_prob(part1.poly_decrypt(cipher, state), model);
    let transition = state => {
        let result = state.split('');
        let index1 = _.random(state.length - 1);
        let index2 = _.random(state.length - 1);

        // swap
        let temp = result[index1];
        result[index1] = result[index2]
        result[index2] = temp;

        return result.join('');
    }

    let result_key = anneal(prob_fcn, transition, initial_key, iters);
    return {key: result_key, message: part1.poly_decrypt(cipher, result_key)};
}


/**
 Optimization routine to find the maximum of prob_fcn.
 prob_fcn: function to minimize. should take state as its argument
 transition: how to generate another state from the previous state
 initial_state: initial state
 iters: number of iterations to run
*/
function anneal(prob_fcn, transition, initial_state, iters=100000) {
    let temp = 1;
    let curr_state = initial_state;
    let curr_cost = prob_fcn(initial_state);

    // perform annealing. do a few extra steps with temp=0 to refine the final solution
    for(let i=0; i<iters + iters / 5; i++) {
        let candidate_state = transition(curr_state);
        let candidate_cost = prob_fcn(candidate_state);
        if(candidate_cost > curr_cost || Math.random() < temp) {
            curr_state = candidate_state;
            curr_cost = candidate_cost;
        }
        temp = 1 - i / iters - 0.9;
        // if(i % Math.floor(iters / 20) == 0) {
        //     console.log('current state', sentence, curr_state)
        //     console.log(i, part1.poly_decrypt(sentence, curr_state));
        //     console.log("done step", i);
        // }
    }

    return curr_state;
}

function softmax(arr) {
    let max = _.max(arr);
    let exps = _.map(arr, x => Math.exp(x - max));
    let total = sum(exps);
    return _.map(exps, x => x / total);
}

/* Use a GA to find the minimum of a function */
function genetic_algorithm(initial_population, eval_fcn, breed_fcn, mutate_fcn, iters=20000) {
    let population = initial_population;
    let pop_size = population.length;

    for(let i=0; i < iters; i++) {
        // keep the top 20%, select things with probability given by softmax()

    }

}

console.log("PART 3");
var corpus = `
But the difficulties occur in a new principality. And firstly, if it be not entirely new, but is, as it were, a member of a state which, taken collectively, may be called composite, the changes arise chiefly from an inherent difficulty which there is in all new principalities; for men change their rulers willingly, hoping to better themselves, and this hope induces them to take up arms against him who rules: wherein they are deceived, because they afterwards find by experience they have gone from bad to worse. This follows also on another natural and common necessity, which always causes a new prince to burden those who have submitted to him with his soldiery and with infinite other hardships which he must put upon his new acquisition.
In this way you have enemies in all those whom you have injured in seizing that principality, and you are not able to keep those friends who put you there because of your not being able to satisfy them in the way they expected, and you cannot take strong measures against them, feeling bound to them. For, although one may be very strong in armed forces, yet in entering a province one has always need of the goodwill of the natives.
For these reasons Louis the Twelfth, King of France, quickly occupied Milan, and as quickly lost it; and to turn him out the first time it only needed Lodovico's own forces; because those who had opened the gates to him, finding themselves deceived in their hopes of future benefit, would not endure the ill-treatment of the new prince. It is very true that, after acquiring rebellious provinces a second time, they are not so lightly lost afterwards, because the prince, with little reluctance, takes the opportunity of the rebellion to punish the delinquents, to clear out the suspects, and to strengthen himself in the weakest places. Thus to cause France to lose Milan the first time it was enough for the Duke Lodovico(*) to raise insurrections on the borders; but to cause him to lose it a second time it was necessary to bring the whole world against him, and that his armies should be defeated and driven out of Italy; which followed from the causes above mentioned.
     (*) Duke Lodovico was Lodovico Moro, a son of Francesco
     Sforza, who married Beatrice d'Este. He ruled over Milan
     from 1494 to 1500, and died in 1510.
Nevertheless Milan was taken from France both the first and the second time. The general reasons for the first have been discussed; it remains to name those for the second, and to see what resources he had, and what any one in his situation would have had for maintaining himself more securely in his acquisition than did the King of France.
Now I say that those dominions which, when acquired, are added to an ancient state by him who acquires them, are either of the same country and language, or they are not. When they are, it is easier to hold them, especially when they have not been accustomed to self-government; and to hold them securely it is enough to have destroyed the family of the prince who was ruling them; because the two peoples, preserving in other things the old conditions, and not being unlike in customs, will live quietly together, as one has seen in Brittany, Burgundy, Gascony, and Normandy, which have been bound to France for so long a time: and, although there may be some difference in language, nevertheless the customs are alike, and the people will easily be able to get on amongst themselves. He who has annexed them, if he wishes to hold them, has only to bear in mind two considerations: the one, that the family of their former lord is extinguished; the other, that neither their laws nor their taxes are altered, so that in a very short time they will become entirely one body with the old principality.
But when states are acquired in a country differing in language, customs, or laws, there are difficulties, and good fortune and great energy are needed to hold them, and one of the greatest and most real helps would be that he who has acquired them should go and reside there. This would make his position more secure and durable, as it has made that of the Turk in Greece, who, notwithstanding all the other measures taken by him for holding that state, if he had not settled there, would not have been able to keep it. Because, if one is on the spot, disorders are seen as they spring up, and one can quickly remedy them; but if one is not at hand, they are heard of only when they are great, and then one can no longer remedy them. Besides this, the country is not pillaged by your officials; the subjects are satisfied by prompt recourse to the prince; thus, wishing to be good, they have more cause to love him, and wishing to be otherwise, to fear him. He who would attack that state from the outside must have the utmost caution; as long as the prince resides there it can only be wrested from him with the greatest difficulty.
The other and better course is to send colonies to one or two places, which may be as keys to that state, for it is necessary either to do this or else to keep there a great number of cavalry and infantry. A prince does not spend much on colonies, for with little or no expense he can send them out and keep them there, and he offends a minority only of the citizens from whom he takes lands and houses to give them to the new inhabitants; and those whom he offends, remaining poor and scattered, are never able to injure him; whilst the rest being uninjured are easily kept quiet, and at the same time are anxious not to err for fear it should happen to them as it has to those who have been despoiled. In conclusion, I say that these colonies are not costly, they are more faithful, they injure less, and the injured, as has been said, being poor and scattered, cannot hurt. Upon this, one has to remark that men ought either to be well treated or crushed, because they can avenge themselves of lighter injuries, of more serious ones they cannot; therefore the injury that is to be done to a man ought to be of such a kind that one does not stand in fear of revenge.
But in maintaining armed men there in place of colonies one spends much more, having to consume on the garrison all the income from the state, so that the acquisition turns into a loss, and many more are exasperated, because the whole state is injured; through the shifting of the garrison up and down all become acquainted with hardship, and all become hostile, and they are enemies who, whilst beaten on their own ground, are yet able to do hurt. For every reason, therefore, such guards are as useless as a colony is useful.
Again, the prince who holds a country differing in the above respects ought to make himself the head and defender of his less powerful neighbours, and to weaken the more powerful amongst them, taking care that no foreigner as powerful as himself shall, by any accident, get a footing there; for it will always happen that such a one will be introduced by those who are discontented, either through excess of ambition or through fear, as one has seen already. The Romans were brought into Greece by the Aetolians; and in every other country where they obtained a footing they were brought in by the inhabitants. And the usual course of affairs is that, as soon as a powerful foreigner enters a country, all the subject states are drawn to him, moved by the hatred which they feel against the ruling power. So that in respect to those subject states he has not to take any trouble to gain them over to himself, for the whole of them quickly rally to the state which he has acquired there. He has only to take care that they do not get hold of too much power and too much authority, and then with his own forces, and with their goodwill, he can easily keep down the more powerful of them, so as to remain entirely master in the country. And he who does not properly manage this business will soon lose what he has acquired, and whilst he does hold it he will have endless difficulties and troubles.
The Romans, in the countries which they annexed, observed closely these measures; they sent colonies and maintained friendly relations with(*) the minor powers, without increasing their strength; they kept down the greater, and did not allow any strong foreign powers to gain authority. Greece appears to me sufficient for an example. The Achaeans and Aetolians were kept friendly by them, the kingdom of Macedonia was humbled, Antiochus was driven out; yet the merits of the Achaeans and Aetolians never secured for them permission to increase their power, nor did the persuasions of Philip ever induce the Romans to be his friends without first humbling him, nor did the influence of Antiochus make them agree that he should retain any lordship over the country. Because the Romans did in these instances what all prudent princes ought to do, who have to regard not only present troubles, but also future ones, for which they must prepare with every energy, because, when foreseen, it is easy to remedy them; but if you wait until they approach, the medicine is no longer in time because the malady has become incurable; for it happens in this, as the physicians say it happens in hectic fever, that in the beginning of the malady it is easy to cure but difficult to detect, but in the course of time, not having been either detected or treated in the beginning, it becomes easy to detect but difficult to cure. Thus it happens in affairs of state, for when the evils that arise have been foreseen (which it is only given to a wise man to see), they can be quickly redressed, but when, through not having been foreseen, they have been permitted to grow in a way that every one can see them, there is no longer a remedy. Therefore, the Romans, foreseeing troubles, dealt with them at once, and, even to avoid a war, would not let them come to a head, for they knew that war is not to be avoided, but is only to be put off to the advantage of others; moreover they wished to fight with Philip and Antiochus in Greece so as not to have to do it in Italy; they could have avoided both, but this they did not wish; nor did that ever please them which is forever in the mouths of the wise ones of our time:—Let us enjoy the benefits of the time—but rather the benefits of their own valour and prudence, for time drives everything before it, and is able to bring with it good as well as evil, and evil as well as good.
`.toUpperCase().replace(/[^A-Z]/g, '')

var model = part2.get_counts(corpus);
var sentence = part1.vigenere_encrypt('Nevertheless Milan was taken from France both the first and the second time'.toUpperCase(), [3, 14, 15, 9, 2, 6, 5]);
console.log("decrypting", sentence);
var t = Date.now();
console.log(vigenere_crack_sa(sentence, model, 7, iters=10000)); // 50000 iterations + a few hundred for refining is sufficient to crack a length 7 key. takes ~4 seconds
console.log('Took', (Date.now() - t) / 1000, 'seconds');

var corpus = `
But the difficulties occur in a new principality. And firstly, if it be not entirely new, but is, as it were, a member of a state which, taken collectively, may be called composite, the changes arise chiefly from an inherent difficulty which there is in all new principalities; for men change their rulers willingly, hoping to better themselves, and this hope induces them to take up arms against him who rules: wherein they are deceived, because they afterwards find by experience they have gone from bad to worse. This follows also on another natural and common necessity, which always causes a new prince to burden those who have submitted to him with his soldiery and with infinite other hardships which he must put upon his new acquisition.
In this way you have enemies in all those whom you have injured in seizing that principality, and you are not able to keep those friends who put you there because of your not being able to satisfy them in the way they expected, and you cannot take strong measures against them, feeling bound to them. For, although one may be very strong in armed forces, yet in entering a province one has always need of the goodwill of the natives.
For these reasons Louis the Twelfth, King of France, quickly occupied Milan, and as quickly lost it; and to turn him out the first time it only needed Lodovico's own forces; because those who had opened the gates to him, finding themselves deceived in their hopes of future benefit, would not endure the ill-treatment of the new prince. It is very true that, after acquiring rebellious provinces a second time, they are not so lightly lost afterwards, because the prince, with little reluctance, takes the opportunity of the rebellion to punish the delinquents, to clear out the suspects, and to strengthen himself in the weakest places. Thus to cause France to lose Milan the first time it was enough for the Duke Lodovico(*) to raise insurrections on the borders; but to cause him to lose it a second time it was necessary to bring the whole world against him, and that his armies should be defeated and driven out of Italy; which followed from the causes above mentioned.
     (*) Duke Lodovico was Lodovico Moro, a son of Francesco
     Sforza, who married Beatrice d'Este. He ruled over Milan
     from 1494 to 1500, and died in 1510.
Nevertheless Milan was taken from France both the first and the second time. The general reasons for the first have been discussed; it remains to name those for the second, and to see what resources he had, and what any one in his situation would have had for maintaining himself more securely in his acquisition than did the King of France.
Now I say that those dominions which, when acquired, are added to an ancient state by him who acquires them, are either of the same country and language, or they are not. When they are, it is easier to hold them, especially when they have not been accustomed to self-government; and to hold them securely it is enough to have destroyed the family of the prince who was ruling them; because the two peoples, preserving in other things the old conditions, and not being unlike in customs, will live quietly together, as one has seen in Brittany, Burgundy, Gascony, and Normandy, which have been bound to France for so long a time: and, although there may be some difference in language, nevertheless the customs are alike, and the people will easily be able to get on amongst themselves. He who has annexed them, if he wishes to hold them, has only to bear in mind two considerations: the one, that the family of their former lord is extinguished; the other, that neither their laws nor their taxes are altered, so that in a very short time they will become entirely one body with the old principality.
But when states are acquired in a country differing in language, customs, or laws, there are difficulties, and good fortune and great energy are needed to hold them, and one of the greatest and most real helps would be that he who has acquired them should go and reside there. This would make his position more secure and durable, as it has made that of the Turk in Greece, who, notwithstanding all the other measures taken by him for holding that state, if he had not settled there, would not have been able to keep it. Because, if one is on the spot, disorders are seen as they spring up, and one can quickly remedy them; but if one is not at hand, they are heard of only when they are great, and then one can no longer remedy them. Besides this, the country is not pillaged by your officials; the subjects are satisfied by prompt recourse to the prince; thus, wishing to be good, they have more cause to love him, and wishing to be otherwise, to fear him. He who would attack that state from the outside must have the utmost caution; as long as the prince resides there it can only be wrested from him with the greatest difficulty.
The other and better course is to send colonies to one or two places, which may be as keys to that state, for it is necessary either to do this or else to keep there a great number of cavalry and infantry. A prince does not spend much on colonies, for with little or no expense he can send them out and keep them there, and he offends a minority only of the citizens from whom he takes lands and houses to give them to the new inhabitants; and those whom he offends, remaining poor and scattered, are never able to injure him; whilst the rest being uninjured are easily kept quiet, and at the same time are anxious not to err for fear it should happen to them as it has to those who have been despoiled. In conclusion, I say that these colonies are not costly, they are more faithful, they injure less, and the injured, as has been said, being poor and scattered, cannot hurt. Upon this, one has to remark that men ought either to be well treated or crushed, because they can avenge themselves of lighter injuries, of more serious ones they cannot; therefore the injury that is to be done to a man ought to be of such a kind that one does not stand in fear of revenge.
But in maintaining armed men there in place of colonies one spends much more, having to consume on the garrison all the income from the state, so that the acquisition turns into a loss, and many more are exasperated, because the whole state is injured; through the shifting of the garrison up and down all become acquainted with hardship, and all become hostile, and they are enemies who, whilst beaten on their own ground, are yet able to do hurt. For every reason, therefore, such guards are as useless as a colony is useful.
Again, the prince who holds a country differing in the above respects ought to make himself the head and defender of his less powerful neighbours, and to weaken the more powerful amongst them, taking care that no foreigner as powerful as himself shall, by any accident, get a footing there; for it will always happen that such a one will be introduced by those who are discontented, either through excess of ambition or through fear, as one has seen already. The Romans were brought into Greece by the Aetolians; and in every other country where they obtained a footing they were brought in by the inhabitants. And the usual course of affairs is that, as soon as a powerful foreigner enters a country, all the subject states are drawn to him, moved by the hatred which they feel against the ruling power. So that in respect to those subject states he has not to take any trouble to gain them over to himself, for the whole of them quickly rally to the state which he has acquired there. He has only to take care that they do not get hold of too much power and too much authority, and then with his own forces, and with their goodwill, he can easily keep down the more powerful of them, so as to remain entirely master in the country. And he who does not properly manage this business will soon lose what he has acquired, and whilst he does hold it he will have endless difficulties and troubles.
The Romans, in the countries which they annexed, observed closely these measures; they sent colonies and maintained friendly relations with(*) the minor powers, without increasing their strength; they kept down the greater, and did not allow any strong foreign powers to gain authority. Greece appears to me sufficient for an example. The Achaeans and Aetolians were kept friendly by them, the kingdom of Macedonia was humbled, Antiochus was driven out; yet the merits of the Achaeans and Aetolians never secured for them permission to increase their power, nor did the persuasions of Philip ever induce the Romans to be his friends without first humbling him, nor did the influence of Antiochus make them agree that he should retain any lordship over the country. Because the Romans did in these instances what all prudent princes ought to do, who have to regard not only present troubles, but also future ones, for which they must prepare with every energy, because, when foreseen, it is easy to remedy them; but if you wait until they approach, the medicine is no longer in time because the malady has become incurable; for it happens in this, as the physicians say it happens in hectic fever, that in the beginning of the malady it is easy to cure but difficult to detect, but in the course of time, not having been either detected or treated in the beginning, it becomes easy to detect but difficult to cure. Thus it happens in affairs of state, for when the evils that arise have been foreseen (which it is only given to a wise man to see), they can be quickly redressed, but when, through not having been foreseen, they have been permitted to grow in a way that every one can see them, there is no longer a remedy. Therefore, the Romans, foreseeing troubles, dealt with them at once, and, even to avoid a war, would not let them come to a head, for they knew that war is not to be avoided, but is only to be put off to the advantage of others; moreover they wished to fight with Philip and Antiochus in Greece so as not to have to do it in Italy; they could have avoided both, but this they did not wish; nor did that ever please them which is forever in the mouths of the wise ones of our time:—Let us enjoy the benefits of the time—but rather the benefits of their own valour and prudence, for time drives everything before it, and is able to bring with it good as well as evil, and evil as well as good.
     (*) See remark in the introduction on the word
     "intrattenere."
But let us turn to France and inquire whether she has done any of the things mentioned. I will speak of Louis(*) (and not of Charles)(+) as the one whose conduct is the better to be observed, he having held possession of Italy for the longest period; and you will see that he has done the opposite to those things which ought to be done to retain a state composed of divers elements.
     (*) Louis XII, King of France, "The Father of the People,"
     born 1462, died 1515.

     (+) Charles VIII, King of France, born 1470, died 1498.
King Louis was brought into Italy by the ambition of the Venetians, who desired to obtain half the state of Lombardy by his intervention. I will not blame the course taken by the king, because, wishing to get a foothold in Italy, and having no friends there—seeing rather that every door was shut to him owing to the conduct of Charles—he was forced to accept those friendships which he could get, and he would have succeeded very quickly in his design if in other matters he had not made some mistakes. The king, however, having acquired Lombardy, regained at once the authority which Charles had lost: Genoa yielded; the Florentines became his friends; the Marquess of Mantua, the Duke of Ferrara, the Bentivogli, my lady of Forli, the Lords of Faenza, of Pesaro, of Rimini, of Camerino, of Piombino, the Lucchese, the Pisans, the Sienese—everybody made advances to him to become his friend. Then could the Venetians realize the rashness of the course taken by them, which, in order that they might secure two towns in Lombardy, had made the king master of two-thirds of Italy.
Let any one now consider with what little difficulty the king could have maintained his position in Italy had he observed the rules above laid down, and kept all his friends secure and protected; for although they were numerous they were both weak and timid, some afraid of the Church, some of the Venetians, and thus they would always have been forced to stand in with him, and by their means he could easily have made himself secure against those who remained powerful. But he was no sooner in Milan than he did the contrary by assisting Pope Alexander to occupy the Romagna. It never occurred to him that by this action he was weakening himself, depriving himself of friends and of those who had thrown themselves into his lap, whilst he aggrandized the Church by adding much temporal power to the spiritual, thus giving it greater authority. And having committed this prime error, he was obliged to follow it up, so much so that, to put an end to the ambition of Alexander, and to prevent his becoming the master of Tuscany, he was himself forced to come into Italy.
And as if it were not enough to have aggrandized the Church, and deprived himself of friends, he, wishing to have the kingdom of Naples, divided it with the King of Spain, and where he was the prime arbiter in Italy he takes an associate, so that the ambitious of that country and the malcontents of his own should have somewhere to shelter; and whereas he could have left in the kingdom his own pensioner as king, he drove him out, to put one there who was able to drive him, Louis, out in turn.
The wish to acquire is in truth very natural and common, and men always do so when they can, and for this they will be praised not blamed; but when they cannot do so, yet wish to do so by any means, then there is folly and blame. Therefore, if France could have attacked Naples with her own forces she ought to have done so; if she could not, then she ought not to have divided it. And if the partition which she made with the Venetians in Lombardy was justified by the excuse that by it she got a foothold in Italy, this other partition merited blame, for it had not the excuse of that necessity.
Therefore Louis made these five errors: he destroyed the minor powers, he increased the strength of one of the greater powers in Italy, he brought in a foreign power, he did not settle in the country, he did not send colonies. Which errors, had he lived, were not enough to injure him had he not made a sixth by taking away their dominions from the Venetians; because, had he not aggrandized the Church, nor brought Spain into Italy, it would have been very reasonable and necessary to humble them; but having first taken these steps, he ought never to have consented to their ruin, for they, being powerful, would always have kept off others from designs on Lombardy, to which the Venetians would never have consented except to become masters themselves there; also because the others would not wish to take Lombardy from France in order to give it to the Venetians, and to run counter to both they would not have had the courage.
And if any one should say: "King Louis yielded the Romagna to Alexander and the kingdom to Spain to avoid war," I answer for the reasons given above that a blunder ought never to be perpetrated to avoid war, because it is not to be avoided, but is only deferred to your disadvantage. And if another should allege the pledge which the king had given to the Pope that he would assist him in the enterprise, in exchange for the dissolution of his marriage(*) and for the cap to Rouen,(+) to that I reply what I shall write later on concerning the faith of princes, and how it ought to be kept.
     (*) Louis XII divorced his wife, Jeanne, daughter of Louis
     XI, and married in 1499 Anne of Brittany, widow of Charles
     VIII, in order to retain the Duchy of Brittany for the
     crown.

     (+) The Archbishop of Rouen. He was Georges d'Amboise,
     created a cardinal by Alexander VI. Born 1460, died 1510.
Thus King Louis lost Lombardy by not having followed any of the conditions observed by those who have taken possession of countries and wished to retain them. Nor is there any miracle in this, but much that is reasonable and quite natural. And on these matters I spoke at Nantes with Rouen, when Valentino, as Cesare Borgia, the son of Pope Alexander, was usually called, occupied the Romagna, and on Cardinal Rouen observing to me that the Italians did not understand war, I replied to him that the French did not understand statecraft, meaning that otherwise they would not have allowed the Church to reach such greatness. And in fact it has been seen that the greatness of the Church and of Spain in Italy has been caused by France, and her ruin may be attributed to them. From this a general rule is drawn which never or rarely fails: that he who is the cause of another becoming powerful is ruined; because that predominancy has been brought about either by astuteness or else by force, and both are distrusted by him who has been raised to power.
`.toUpperCase().replace(/[^A-Z]/g, '');
var model = part2.get_counts(corpus);


var sentence = part1.poly_encrypt('Nevertheless Milan was taken from France both the first and the second time. The general reasons for the first have been discussed; it remains to name those for the second, and to see what resources he had, and what any one in his situation would have had for maintaining himself more securely in his acquisition than did the King of France.'.toUpperCase(), 'qwertyuiopasdfghjklzxcvbnm'.toUpperCase());
console.log("decrypting with substitution:", sentence);
var t = Date.now();
for(let i=0; i<10; i++)
    console.log(substitution_crack_sa(sentence, model, iters=50000));
console.log('Took', (Date.now() - t) / 1000, 'seconds');