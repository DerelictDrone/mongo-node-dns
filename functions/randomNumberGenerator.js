

// My poor attempt at making a random number generator, gets a random number from x to y
exports.getRandomNumber = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}