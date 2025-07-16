# 99Tech Code Challenge - Sum to N

# Task

Provide 3 unique implementations of the following function in TypeScript.

- Comment on the complexity or efficiency of each function.

**Input**: `n` - any integer

*Assuming this input will always produce a result lesser than `Number.MAX_SAFE_INTEGER`*.

**Output**: `return` - summation to `n`, i.e. `sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15`.


<pre>
func sum_to_n_a(n: number): number {
	// your code here
}

func sum_to_n_b(n: number): number {
	// your code here
}

func sum_to_n_c(n: number): number {
	// your code here
}
</pre>


# How to run

<pre>tsc main.ts && node main.js</pre>


# Example:

<pre>
Normal testing
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

<pre>
Performance testing
$ tsc main.ts && node main.js
--- Measuring Performance for n = 200000 ---
Note: Results are in milliseconds (ms).
----------------------------------------
sum_to_n_a (Loop): 2.075ms
Result A: 20000100000

sum_to_n_b (Formula): 0.015ms
Result B: 20000100000

<span style="color:red">Error with sum_to_n_c (Recursion) for n=200000: Maximum call stack size exceeded  
This is likely a 'Stack Overflow' error. Try a smaller 'n' for recursion.</span>
</pre>