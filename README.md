# 99Tech Code Challenge #1 #

Note that if you fork this repository, your responses may be publicly linked to this repo.  
Please submit your application along with the solutions attached or linked.   

It is important that you minimally attempt the problems, even if you do not arrive at a working solution.

## Submission ##
You can either provide a link to an online repository, attach the solution in your application, or whichever method you prefer.
We're cool as long as we can view your solution without any pain.


## Problem 4: Three ways to sum to n

### How to run
<pre>tsc main.ts && node main.js</pre>

### Output sample

Small N
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
Error with sum_to_n_c (Recursion) for n=200000: Maximum call stack size exceeded
This is likely a 'Stack Overflow' error. Try a smaller 'n' for recursion.
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
