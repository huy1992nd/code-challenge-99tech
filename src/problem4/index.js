var sum_to_n_a = function(n) {
    if (n <= 0) return 0;
    var sum = 0;
    for (var i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

var sum_to_n_b = function(n) {
    if (n <= 0) return 0;
    return (n * (n + 1)) / 2;
};

var sum_to_n_c = function(n) {
    if (n <= 0) return 0;
    return Array.from({ length: n }, function(_, idx) { return idx + 1; })
        .reduce(function(acc, val) { return acc + val; }, 0);
};

module.exports = { sum_to_n_a: sum_to_n_a, sum_to_n_b: sum_to_n_b, sum_to_n_c: sum_to_n_c };


