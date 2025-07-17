/*
Problem: Given a number n, calculate the sum of all numbers from 1 to n.
Example: sum_to_n(5) = 1 + 2 + 3 + 4 + 5 = 15
O(n) time
O(1) space => we only use a constant amount of space for the sum variable.
*/
function sum_to_n_a(n) {
    var sum = 0;
    for (var i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}
/*
Formula: Direct math calculation. example: 5 * (5 + 1) / 2 = 15
O(1) time
O(1) space
Fastest solution.
*/
function sum_to_n_b(n) {
    return n * (n + 1) / 2;
}
/*
Recursion: Calls itself. example: sum_to_n_c(5) = 5 + sum_to_n_c(4)
O(n) time
O(n) space (stack)
Calls itself n times, each call adds a new frame to the stack. Stack Overflow !!!
*/
function sum_to_n_c(n) {
    if (n <= 0)
        return 0;
    return n + sum_to_n_c(n - 1);
}
// Small number Testing
var testN = 10000;
// Big number Testing
// const testN = 200000;
console.log("--- Measuring Performance for n = ".concat(testN, " ---"));
console.log("Note: Results are in milliseconds (ms).");
console.log("----------------------------------------");
// Test sum_to_n_a (Loop)
console.time("sum_to_n_a (Loop)");
var result_a = sum_to_n_a(testN);
console.timeEnd("sum_to_n_a (Loop)");
console.log("Result A: ".concat(result_a, "\n"));
// Test sum_to_n_b (Formula) - Expect this to be extremely fast
console.time("sum_to_n_b (Formula)");
var result_b = sum_to_n_b(testN);
console.timeEnd("sum_to_n_b (Formula)");
console.log("Result B: ".concat(result_b, "\n"));
// Test sum_to_n_c (Recursion) - This may cause a stack overflow for large n
console.time("sum_to_n_c (Recursion)");
try {
    var result_c = sum_to_n_c(testN); // Try with `testN` first, reduce if it crashes
    console.timeEnd("sum_to_n_c (Recursion)");
    console.log("Result C: ".concat(result_c, "\n"));
}
catch (error) {
    console.timeEnd("sum_to_n_c (Recursion)"); // Ensure timer ends even on error
    console.error("Error with sum_to_n_c (Recursion) for n=".concat(testN, ": ").concat(error.message));
    console.error("This is likely a 'Stack Overflow' error. Try a smaller 'n' for recursion.");
}
