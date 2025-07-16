# Code Challenge

## Problem 4: Three ways to sum to n

### How to run
<pre>tsc main.ts && node main.js</pre>

### Output sample

Small N
<pre>
$ tsc main.ts && node main.js
--- Measuring Performance for n = 10000 ---
Note: Results are in milliseconds (ms).
----------------------------------------
sum_to_n_a (Loop): 0.367ms
Result A: 50005000

sum_to_n_b (Formula): 0.015ms
Result B: 50005000

sum_to_n_c (Recursion): 0.678ms
Result C: 50005000
</pre>

Big N
<pre>
$ tsc main.ts && node main.js
--- Measuring Performance for n = 200000 ---
Note: Results are in milliseconds (ms).
----------------------------------------
sum_to_n_a (Loop): 2.075ms
Result A: 20000100000

sum_to_n_b (Formula): 0.015ms
Result B: 20000100000

sum_to_n_c (Recursion): 1.526ms
<span style="color: red;">Error with sum_to_n_c (Recursion) for n=200000: Maximum call stack size exceeded  
This is likely a 'Stack Overflow' error. Try a smaller 'n' for recursion.</span>
</pre>
