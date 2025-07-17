# Problem 4: Sum of Numbers from 1 to N

## Overview
This problem demonstrates three different approaches to calculate the sum of all numbers from 1 to n, with performance analysis and complexity comparison.

**Problem Statement:** Given a number n, calculate the sum of all numbers from 1 to n.

**Example:** `sum_to_n(5) = 1 + 2 + 3 + 4 + 5 = 15`

## Solutions Implemented

### 1. Iterative Approach (`sum_to_n_a`)
- **Method:** Loop-based solution
- **Time Complexity:** O(n)
- **Space Complexity:** O(1)
- **Description:** Uses a simple for loop to iterate through all numbers and accumulate the sum

### 2. Mathematical Formula (`sum_to_n_b`)
- **Method:** Direct mathematical calculation
- **Formula:** `n * (n + 1) / 2`
- **Time Complexity:** O(1)
- **Space Complexity:** O(1)
- **Description:** Uses the arithmetic series formula for instant calculation - fastest solution

### 3. Recursive Approach (`sum_to_n_c`)
- **Method:** Recursive function calls
- **Time Complexity:** O(n)
- **Space Complexity:** O(n) - due to call stack
- **Description:** Calls itself recursively. **Warning:** Can cause stack overflow for large values of n

## Performance Analysis

The code includes built-in performance testing that measures execution time for each approach:

- **Formula approach** is expected to be extremely fast (constant time)
- **Loop approach** performance scales linearly with input size
- **Recursive approach** is slowest and has stack overflow risk for large inputs

## Running the Code

### Prerequisites
- Node.js with TypeScript support
- TypeScript compiler (`tsc`) or `ts-node`

### Execution
```bash
tsc main.ts && node main.js
```

### Testing Different Input Sizes
The code includes two test configurations:
- **Small number testing:** `testN = 10000` (safe for all methods)
- **Big number testing:** `testN = 200000` (may cause stack overflow for recursion)

To test with larger numbers, uncomment the big number testing line and comment out the small number testing line.

## Key Learnings

1. **Algorithm Efficiency:** Mathematical solutions can dramatically outperform iterative approaches
2. **Space Complexity Matters:** Recursive solutions consume additional memory through call stack
3. **Stack Limitations:** Recursive approaches have practical limits due to call stack size
4. **Performance Measurement:** Built-in timing helps compare real-world performance differences

## Expected Output Example
```
--- Measuring Performance for n = 10000 ---
Note: Results are in milliseconds (ms).
----------------------------------------
sum_to_n_a (Loop): 0.123ms
Result A: 50005000

sum_to_n_b (Formula): 0.001ms
Result B: 50005000

sum_to_n_c (Recursion): 1.234ms
Result C: 50005000
```

## Error Handling
The code includes error handling for the recursive approach to catch and report stack overflow errors gracefully when testing with large values of n.