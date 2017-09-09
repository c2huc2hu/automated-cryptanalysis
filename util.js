function is_upper(ch) {
    let cc = ch.charCodeAt(0);
    return 65 <= cc && cc <= 90;
}

module.exports = {
    is_upper
};