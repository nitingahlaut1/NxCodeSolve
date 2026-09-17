import { ProblemDetail, SupportedLanguage, TestCase } from '@/types';
import dsaQuestions from './dsaQuestions.json';

export const detailedProblemsMap: Record<number, ProblemDetail> = {
  1: {
    id: 1,
    step: "Step 1: Learn the Basics",
    topic: "Basic Maths",
    title: "Count Digits",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/count-the-digits-that-divide-a-number/",
    youtubeUrl: "https://www.youtube.com/results?search_query=takeUforward+Count+Digits",
    leetcodeSlug: "count-numbers-with-unique-digits",
    gfgUrl: "https://practice.geeksforgeeks.org/problems/count-digits5716/1",
    tufUrl: "https://takeuforward.org/data-structure/count-digits-in-a-number/",
    description: `Given a positive integer **n**, return the number of digits in **n** that evenly divide **n** (i.e. \`n % digit === 0\`).

An integer **val** evenly divides **n** if the remainder of \`n / val\` is \`0\`.
Each digit should be considered in its individual decimal place.`,
    examples: [
      {
        id: 1,
        input: "n = 12",
        output: "2",
        explanation: "12 is divisible by both digits 1 and 2 (12 % 1 == 0, 12 % 2 == 0)."
      },
      {
        id: 2,
        input: "n = 121",
        output: "2",
        explanation: "121 is divisible by 1 (first and last digits), but not by 2."
      },
      {
        id: 3,
        input: "n = 1248",
        output: "4",
        explanation: "1248 is divisible by 1, 2, 4, and 8."
      }
    ],
    constraints: [
      "1 <= n <= 10^9",
      "n does not contain 0 as any of its digits."
    ],
    hints: [
      "Extract each digit from right to left using `n % 10`.",
      "Check if the original number modulo the digit equals 0.",
      "Divide the number by 10 using integer division until it reaches 0."
    ],
    fnName: "countDigits",
    paramNames: ["n"],
    starterCodes: {
      javascript: `/**
 * @param {number} n
 * @return {number}
 */
function countDigits(n) {
  // Write your code here
  
}`,
      typescript: `function countDigits(n: number): number {
  // Write your code here
  
}`,
      python: `class Solution:
    def countDigits(self, n: int) -> int:
        # Write your code here
        pass`,
      cpp: `class Solution {
public:
    int countDigits(int n) {
        // Write your code here
        
    }
};`,
      java: `class Solution {
    public int countDigits(int n) {
        // Write your code here
        
    }
}`
    },
    testCases: [
      { id: 1, args: [12], expected: 2, rawInputDisplay: "n = 12" },
      { id: 2, args: [121], expected: 2, rawInputDisplay: "n = 121" },
      { id: 3, args: [1248], expected: 4, rawInputDisplay: "n = 1248" }
    ],
    hiddenTestCases: [
      { id: 4, args: [7], expected: 1, isHidden: true },
      { id: 5, args: [1001], expected: 2, isHidden: true },
      { id: 6, args: [2446], expected: 3, isHidden: true }
    ],
    editorial: {
      intuition: "Iterate through each digit of the number, check divisibility with the original number, and increment the counter.",
      approach: "Store the original number in a temporary variable. In a loop, extract the last digit with modulo 10 (`temp % 10`), check if `n % digit === 0`, then divide `temp` by 10 (`Math.floor(temp / 10)`).",
      timeComplexity: "O(log10(N)) — number of iterations equals number of digits.",
      spaceComplexity: "O(1) — constant auxiliary memory."
    }
  },

  2: {
    id: 2,
    step: "Step 1: Learn the Basics",
    topic: "Basic Maths",
    title: "Reverse a Number",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/reverse-integer/",
    youtubeUrl: "https://www.youtube.com/results?search_query=takeUforward+Reverse+a+Number",
    leetcodeSlug: "reverse-integer",
    gfgUrl: "https://practice.geeksforgeeks.org/problems/reverse-digit0327/1",
    tufUrl: "https://takeuforward.org/maths/reverse-digits-of-a-number/",
    description: `Given a signed 32-bit integer **x**, return **x** with its digits reversed.

If reversing **x** causes the value to go outside the signed 32-bit integer range \`[-2^31, 2^31 - 1]\`, then return \`0\`.

Assume the environment does not allow you to store 64-bit integers (signed or unsigned).`,
    examples: [
      {
        id: 1,
        input: "x = 123",
        output: "321",
        explanation: "Reversing 123 gives 321."
      },
      {
        id: 2,
        input: "x = -123",
        output: "-321",
        explanation: "Reversing -123 gives -321."
      },
      {
        id: 3,
        input: "x = 120",
        output: "21",
        explanation: "Reversing 120 gives 021 which simplifies to 21."
      }
    ],
    constraints: [
      "-2^31 <= x <= 2^31 - 1"
    ],
    hints: [
      "Extract digits one by one from the right: `pop = x % 10`.",
      "Check for 32-bit integer overflow before appending: `rev > (2^31 - 1) / 10` or `rev < (-2^31) / 10`.",
      "Multiply existing reversed number by 10 and add the extracted digit."
    ],
    fnName: "reverse",
    paramNames: ["x"],
    starterCodes: {
      javascript: `/**
 * @param {number} x
 * @return {number}
 */
function reverse(x) {
  // Write your code here
  
}`,
      typescript: `function reverse(x: number): number {
  // Write your code here
  
}`,
      python: `class Solution:
    def reverse(self, x: int) -> int:
        # Write your code here
        pass`,
      cpp: `class Solution {
public:
    int reverse(int x) {
        // Write your code here
        
    }
};`,
      java: `class Solution {
    public int reverse(int x) {
        // Write your code here
        
    }
}`
    },
    testCases: [
      { id: 1, args: [123], expected: 321, rawInputDisplay: "x = 123" },
      { id: 2, args: [-123], expected: -321, rawInputDisplay: "x = -123" },
      { id: 3, args: [120], expected: 21, rawInputDisplay: "x = 120" }
    ],
    hiddenTestCases: [
      { id: 4, args: [0], expected: 0, isHidden: true },
      { id: 5, args: [1534236469], expected: 0, isHidden: true },
      { id: 6, args: [-2147483412], expected: -2143847412, isHidden: true }
    ],
    editorial: {
      intuition: "Pop digits from the number from the back and push them to the reversed variable, watching out for 32-bit overflow.",
      approach: "Keep multiplying `rev` by 10 and adding `x % 10`. Before multiplying, ensure `rev` does not exceed 32-bit signed limits `[-2^31, 2^31 - 1]`.",
      timeComplexity: "O(log10(|x|)) — proportional to the number of digits in x (~10 operations max).",
      spaceComplexity: "O(1) — constant space."
    }
  },

  3: {
    id: 3,
    step: "Step 1: Learn the Basics",
    topic: "Basic Maths",
    title: "Check Palindrome",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/palindrome-number/",
    youtubeUrl: "https://www.youtube.com/results?search_query=takeUforward+Check+Palindrome",
    leetcodeSlug: "palindrome-number",
    gfgUrl: "https://practice.geeksforgeeks.org/problems/palindrome0746/1",
    tufUrl: "https://takeuforward.org/data-structure/check-if-a-number-is-palindrome-or-not/",
    description: `Given an integer **x**, return \`true\` if **x** is a **palindrome**, and \`false\` otherwise.

An integer is a palindrome when it reads the same forward and backward. For example, \`121\` is a palindrome while \`123\` is not.`,
    examples: [
      {
        id: 1,
        input: "x = 121",
        output: "true",
        explanation: "121 reads as 121 from left to right and from right to left."
      },
      {
        id: 2,
        input: "x = -121",
        output: "false",
        explanation: "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome."
      },
      {
        id: 3,
        input: "x = 10",
        output: "false",
        explanation: "Reads 01 from right to left. Therefore it is not a palindrome."
      }
    ],
    constraints: [
      "-2^31 <= x <= 2^31 - 1"
    ],
    hints: [
      "Negative numbers can never be palindromes (e.g. -121 vs 121-).",
      "Any number ending in 0 (other than 0 itself) cannot be a palindrome.",
      "You can reverse the entire number or just reverse the second half."
    ],
    fnName: "isPalindrome",
    paramNames: ["x"],
    starterCodes: {
      javascript: `/**
 * @param {number} x
 * @return {boolean}
 */
function isPalindrome(x) {
  // Write your code here
  
}`,
      typescript: `function isPalindrome(x: number): boolean {
  // Write your code here
  
}`,
      python: `class Solution:
    def isPalindrome(self, x: int) -> bool:
        # Write your code here
        pass`,
      cpp: `class Solution {
public:
    bool isPalindrome(int x) {
        // Write your code here
        
    }
};`,
      java: `class Solution {
    public boolean isPalindrome(int x) {
        // Write your code here
        
    }
}`
    },
    testCases: [
      { id: 1, args: [121], expected: true, rawInputDisplay: "x = 121" },
      { id: 2, args: [-121], expected: false, rawInputDisplay: "x = -121" },
      { id: 3, args: [10], expected: false, rawInputDisplay: "x = 10" }
    ],
    hiddenTestCases: [
      { id: 4, args: [0], expected: true, isHidden: true },
      { id: 5, args: [12321], expected: true, isHidden: true },
      { id: 6, args: [1000021], expected: false, isHidden: true }
    ],
    editorial: {
      intuition: "A number is a palindrome if it equals its reversed representation.",
      approach: "Reject negative numbers immediately. Reverse the number digit-by-digit and check if the reversed number equals the initial number.",
      timeComplexity: "O(log10(N)) — dividing by 10 each step.",
      spaceComplexity: "O(1) — only a few auxiliary variables."
    }
  },

  4: {
    id: 4,
    step: "Step 1: Learn the Basics",
    topic: "Basic Maths",
    title: "GCD Or HCF",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/find-greatest-common-divisor-of-array/",
    youtubeUrl: "https://www.youtube.com/results?search_query=takeUforward+GCD+Or+HCF",
    leetcodeSlug: "find-greatest-common-divisor-of-array",
    gfgUrl: "https://practice.geeksforgeeks.org/problems/lcm-and-gcd4516/1",
    tufUrl: "https://takeuforward.org/data-structure/find-gcd-of-two-numbers/",
    description: `Given two positive integers **a** and **b**, find and return their **Greatest Common Divisor (GCD)**, also known as the Highest Common Factor (HCF).

The Greatest Common Divisor of two integers is the largest positive integer that divides both integers without leaving a remainder.`,
    examples: [
      {
        id: 1,
        input: "a = 20, b = 40",
        output: "20",
        explanation: "Factors of 20: 1, 2, 4, 5, 10, 20. Factors of 40: 1, 2, 4, 5, 8, 10, 20, 40. Greatest common is 20."
      },
      {
        id: 2,
        input: "a = 9, b = 12",
        output: "3",
        explanation: "Factors of 9 are 1, 3, 9. Factors of 12 are 1, 2, 3, 4, 6, 12. Greatest common is 3."
      },
      {
        id: 3,
        input: "a = 7, b = 13",
        output: "1",
        explanation: "7 and 13 are co-prime, so GCD is 1."
      }
    ],
    constraints: [
      "1 <= a, b <= 10^9"
    ],
    hints: [
      "Euclidean Algorithm states: `gcd(a, b) = gcd(b, a % b)`.",
      "Base case: when `b == 0`, GCD is `a`."
    ],
    fnName: "calcGCD",
    paramNames: ["a", "b"],
    starterCodes: {
      javascript: `/**
 * @param {number} a
 * @param {number} b
 * @return {number}
 */
function calcGCD(a, b) {
  // Write your code here
  
}`,
      typescript: `function calcGCD(a: number, b: number): number {
  // Write your code here
  
}`,
      python: `class Solution:
    def calcGCD(self, a: int, b: int) -> int:
        # Write your code here
        pass`,
      cpp: `class Solution {
public:
    int calcGCD(int a, int b) {
        // Write your code here
        
    }
};`,
      java: `class Solution {
    public int calcGCD(int a, int b) {
        // Write your code here
        
    }
}`
    },
    testCases: [
      { id: 1, args: [20, 40], expected: 20, rawInputDisplay: "a = 20, b = 40" },
      { id: 2, args: [9, 12], expected: 3, rawInputDisplay: "a = 9, b = 12" },
      { id: 3, args: [7, 13], expected: 1, rawInputDisplay: "a = 7, b = 13" }
    ],
    hiddenTestCases: [
      { id: 4, args: [1, 1], expected: 1, isHidden: true },
      { id: 5, args: [52, 10], expected: 2, isHidden: true },
      { id: 6, args: [81, 27], expected: 27, isHidden: true }
    ],
    editorial: {
      intuition: "Using Euclidean Algorithm: gcd(a, b) is equal to gcd(b, a % b) repeatedly until the remainder is 0.",
      approach: "Repeatedly calculate `b = a % b` and `a = prev_b` in a loop while `b > 0`. Return `a`.",
      timeComplexity: "O(log(min(a, b))) — extremely fast Euclidean division.",
      spaceComplexity: "O(1) iterative space."
    }
  },

  5: {
    id: 5,
    step: "Step 1: Learn the Basics",
    topic: "Basic Maths",
    title: "Armstrong Numbers",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/armstrong-number/",
    youtubeUrl: "https://www.youtube.com/results?search_query=takeUforward+Armstrong+Numbers",
    leetcodeSlug: "armstrong-number",
    gfgUrl: "https://practice.geeksforgeeks.org/problems/armstrong-numbers2727/1",
    tufUrl: "https://takeuforward.org/maths/check-if-a-number-is-armstrong-number-or-not/",
    description: `An **Armstrong number** (also known as a Narcissistic number) is a number that is equal to the sum of its digits each raised to the power of the number of digits **k**.

Given an integer **n**, return \`true\` if it is an Armstrong number, and \`false\` otherwise.`,
    examples: [
      {
        id: 1,
        input: "n = 153",
        output: "true",
        explanation: "153 has 3 digits. 1^3 + 5^3 + 3^3 = 1 + 125 + 27 = 153."
      },
      {
        id: 2,
        input: "n = 370",
        output: "true",
        explanation: "370 has 3 digits. 3^3 + 7^3 + 0^3 = 27 + 343 + 0 = 370."
      },
      {
        id: 3,
        input: "n = 123",
        output: "false",
        explanation: "123 has 3 digits. 1^3 + 2^3 + 3^3 = 1 + 8 + 27 = 36 != 123."
      }
    ],
    constraints: [
      "1 <= n <= 10^8"
    ],
    hints: [
      "Count the total number of digits `k = String(n).length`.",
      "Iterate over each digit and add `Math.pow(digit, k)` to a total sum.",
      "Compare the sum to the original number `n`."
    ],
    fnName: "checkArmstrong",
    paramNames: ["n"],
    starterCodes: {
      javascript: `/**
 * @param {number} n
 * @return {boolean}
 */
function checkArmstrong(n) {
  // Write your code here
  
}`,
      typescript: `function checkArmstrong(n: number): boolean {
  // Write your code here
  
}`,
      python: `class Solution:
    def checkArmstrong(self, n: int) -> bool:
        # Write your code here
        pass`,
      cpp: `class Solution {
public:
    bool checkArmstrong(int n) {
        // Write your code here
        
    }
};`,
      java: `class Solution {
    public boolean checkArmstrong(int n) {
        // Write your code here
        
    }
}`
    },
    testCases: [
      { id: 1, args: [153], expected: true, rawInputDisplay: "n = 153" },
      { id: 2, args: [370], expected: true, rawInputDisplay: "n = 370" },
      { id: 3, args: [123], expected: false, rawInputDisplay: "n = 123" }
    ],
    hiddenTestCases: [
      { id: 4, args: [1], expected: true, isHidden: true },
      { id: 5, args: [1634], expected: true, isHidden: true },
      { id: 6, args: [9474], expected: true, isHidden: true }
    ],
    editorial: {
      intuition: "Count total number of digits k, compute the sum of each digit raised to power k, and check equality.",
      approach: "Extract digits using `% 10`, accumulate `digit^k`, and check if `sum == n`.",
      timeComplexity: "O(log10(N)) — one pass to count digits, one pass to compute powers.",
      spaceComplexity: "O(1) memory."
    }
  },

  6: {
    id: 6,
    step: "Step 1: Learn the Basics",
    topic: "Basic Maths",
    title: "Print all Divisors",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/three-divisors/",
    youtubeUrl: "https://www.youtube.com/results?search_query=takeUforward+Print+all+Divisors",
    leetcodeSlug: "three-divisors",
    gfgUrl: "https://practice.geeksforgeeks.org/problems/all-divisors-of-a-number/1",
    tufUrl: "https://takeuforward.org/data-structure/print-all-divisors-of-a-given-number/",
    description: `Given an integer **n**, return a sorted array of all divisors of **n** in ascending order.

A divisor of an integer **n** is an integer **i** that divides **n** without leaving a remainder (i.e. \`n % i === 0\`).`,
    examples: [
      {
        id: 1,
        input: "n = 12",
        output: "[1, 2, 3, 4, 6, 12]",
        explanation: "12 is divisible by 1, 2, 3, 4, 6, 12."
      },
      {
        id: 2,
        input: "n = 36",
        output: "[1, 2, 3, 4, 6, 9, 12, 18, 36]",
        explanation: "The factors of 36 are 1, 2, 3, 4, 6, 9, 12, 18, 36."
      },
      {
        id: 3,
        input: "n = 7",
        output: "[1, 7]",
        explanation: "7 is a prime number with only two divisors: 1 and 7."
      }
    ],
    constraints: [
      "1 <= n <= 10^7"
    ],
    hints: [
      "Divisors come in pairs: if `i` divides `n`, then `n / i` also divides `n`.",
      "You only need to loop from `1` up to `sqrt(n)` to find all divisor pairs."
    ],
    fnName: "printDivisors",
    paramNames: ["n"],
    starterCodes: {
      javascript: `/**
 * @param {number} n
 * @return {number[]}
 */
function printDivisors(n) {
  // Write your code here
  
}`,
      typescript: `function printDivisors(n: number): number[] {
  // Write your code here
  
}`,
      python: `class Solution:
    def printDivisors(self, n: int) -> list[int]:
        # Write your code here
        pass`,
      cpp: `class Solution {
public:
    vector<int> printDivisors(int n) {
        // Write your code here
        
    }
};`,
      java: `class Solution {
    public int[] printDivisors(int n) {
        // Write your code here
        
    }
}`
    },
    testCases: [
      { id: 1, args: [12], expected: [1, 2, 3, 4, 6, 12], rawInputDisplay: "n = 12" },
      { id: 2, args: [36], expected: [1, 2, 3, 4, 6, 9, 12, 18, 36], rawInputDisplay: "n = 36" },
      { id: 3, args: [7], expected: [1, 7], rawInputDisplay: "n = 7" }
    ],
    hiddenTestCases: [
      { id: 4, args: [1], expected: [1], isHidden: true },
      { id: 5, args: [25], expected: [1, 5, 25], isHidden: true },
      { id: 6, args: [100], expected: [1, 2, 4, 5, 10, 20, 25, 50, 100], isHidden: true }
    ],
    editorial: {
      intuition: "Instead of scanning up to N (O(N)), loop up to sqrt(N) because if `i` divides `N`, then `N/i` is also a divisor.",
      approach: "Iterate `i` from 1 to `sqrt(N)`. If `n % i == 0`, add `i` and `n/i` (if distinct). Finally sort the list in ascending order.",
      timeComplexity: "O(sqrt(N) + D log D) where D is number of divisors.",
      spaceComplexity: "O(D) to store the divisors."
    }
  },

  7: {
    id: 7,
    step: "Step 1: Learn the Basics",
    topic: "Basic Maths",
    title: "Check for Prime",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/count-primes/",
    youtubeUrl: "https://www.youtube.com/results?search_query=takeUforward+Check+for+Prime",
    leetcodeSlug: "count-primes",
    gfgUrl: "https://practice.geeksforgeeks.org/problems/prime-number2314/1",
    tufUrl: "https://takeuforward.org/data-structure/check-if-a-number-is-prime-or-not/",
    description: `Given an integer **n**, return \`true\` if **n** is a **prime number**, and \`false\` otherwise.

A **prime number** is a natural number strictly greater than 1 that has no positive divisors other than 1 and itself.`,
    examples: [
      {
        id: 1,
        input: "n = 7",
        output: "true",
        explanation: "7 is divisible only by 1 and 7."
      },
      {
        id: 2,
        input: "n = 1",
        output: "false",
        explanation: "1 is not a prime number by mathematical definition."
      },
      {
        id: 3,
        input: "n = 10",
        output: "false",
        explanation: "10 is divisible by 1, 2, 5, and 10, so it is composite."
      }
    ],
    constraints: [
      "1 <= n <= 10^9"
    ],
    hints: [
      "Any number <= 1 is not prime.",
      "Check if any number from 2 to `sqrt(n)` divides `n`. If so, `n` is composite."
    ],
    fnName: "isPrime",
    paramNames: ["n"],
    starterCodes: {
      javascript: `/**
 * @param {number} n
 * @return {boolean}
 */
function isPrime(n) {
  // Write your code here
  
}`,
      typescript: `function isPrime(n: number): boolean {
  // Write your code here
  
}`,
      python: `class Solution:
    def isPrime(self, n: int) -> bool:
        # Write your code here
        pass`,
      cpp: `class Solution {
public:
    bool isPrime(int n) {
        // Write your code here
        
    }
};`,
      java: `class Solution {
    public boolean isPrime(int n) {
        // Write your code here
        
    }
}`
    },
    testCases: [
      { id: 1, args: [7], expected: true, rawInputDisplay: "n = 7" },
      { id: 2, args: [1], expected: false, rawInputDisplay: "n = 1" },
      { id: 3, args: [10], expected: false, rawInputDisplay: "n = 10" }
    ],
    hiddenTestCases: [
      { id: 4, args: [2], expected: true, isHidden: true },
      { id: 5, args: [37], expected: true, isHidden: true },
      { id: 6, args: [97], expected: true, isHidden: true }
    ],
    editorial: {
      intuition: "A composite number must have at least one factor <= sqrt(n). If no factor is found up to sqrt(n), n is prime.",
      approach: "Handle base cases (n <= 1). Loop `i` from 2 to `sqrt(n)`. If `n % i == 0`, return `false`. Return `true` if loop terminates without finding a divisor.",
      timeComplexity: "O(sqrt(N)) — checks up to square root of N.",
      spaceComplexity: "O(1) memory."
    }
  },

  8: {
    id: 8,
    step: "Step 1: Learn the Basics",
    topic: "Basic Recursion",
    title: "Understand Recursion by Print 1 to N",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problemset/?search=recursion+print+1+to+n",
    youtubeUrl: "https://www.youtube.com/results?search_query=takeUforward+Understand+Recursion+by+Print+1+to+N",
    leetcodeSlug: "print-in-order",
    gfgUrl: "https://practice.geeksforgeeks.org/problems/print-1-to-n-without-using-loops-1587115620/1",
    tufUrl: "https://takeuforward.org/recursion/print-1-to-n-using-recursion/",
    description: `Given an integer **n**, return an array containing integers from \`1\` to \`n\` in ascending order using **recursion** without using loops.

This problem builds foundational intuition on the recursive call stack and base conditions.`,
    examples: [
      {
        id: 1,
        input: "n = 5",
        output: "[1, 2, 3, 4, 5]",
        explanation: "Numbers from 1 to 5 printed in ascending order."
      },
      {
        id: 2,
        input: "n = 1",
        output: "[1]",
        explanation: "Only 1 is returned."
      },
      {
        id: 3,
        input: "n = 8",
        output: "[1, 2, 3, 4, 5, 6, 7, 8]",
        explanation: "Sequence 1 through 8."
      }
    ],
    constraints: [
      "1 <= n <= 1000"
    ],
    hints: [
      "Base case: when `i > n`, stop recursion.",
      "Recursive step: append `i` to result array and call `helper(i + 1, n)`."
    ],
    fnName: "print1ToN",
    paramNames: ["n"],
    starterCodes: {
      javascript: `/**
 * @param {number} n
 * @return {number[]}
 */
function print1ToN(n) {
  // Write your code here (use recursion)
  
}`,
      typescript: `function print1ToN(n: number): number[] {
  // Write your code here (use recursion)
  
}`,
      python: `class Solution:
    def print1ToN(self, n: int) -> list[int]:
        # Write your code here (use recursion)
        pass`,
      cpp: `class Solution {
public:
    vector<int> print1ToN(int n) {
        // Write your code here (use recursion)
        
    }
};`,
      java: `class Solution {
    public int[] print1ToN(int n) {
        // Write your code here (use recursion)
        
    }
}`
    },
    testCases: [
      { id: 1, args: [5], expected: [1, 2, 3, 4, 5], rawInputDisplay: "n = 5" },
      { id: 2, args: [1], expected: [1], rawInputDisplay: "n = 1" },
      { id: 3, args: [8], expected: [1, 2, 3, 4, 5, 6, 7, 8], rawInputDisplay: "n = 8" }
    ],
    hiddenTestCases: [
      { id: 4, args: [3], expected: [1, 2, 3], isHidden: true },
      { id: 5, args: [10], expected: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], isHidden: true }
    ],
    editorial: {
      intuition: "Use a recursive helper function passing the current index. Push to array before making the next recursive call.",
      approach: "Define `helper(current)`. If `current > n`, return. Otherwise push `current` and recursively call `helper(current + 1)`.",
      timeComplexity: "O(N) — N recursive function calls.",
      spaceComplexity: "O(N) — recursive call stack depth of N."
    }
  },

  9: {
    id: 9,
    step: "Step 1: Learn the Basics",
    topic: "Basic Recursion",
    title: "Print N to 1 using Recursion",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problemset/?search=recursion+print+n+to+1",
    youtubeUrl: "https://www.youtube.com/results?search_query=takeUforward+Print+N+to+1+using+Recursion",
    leetcodeSlug: "fizz-buzz",
    gfgUrl: "https://practice.geeksforgeeks.org/problems/print-n-to-1-without-loop/1",
    tufUrl: "https://takeuforward.org/recursion/print-n-to-1-using-recursion/",
    description: `Given an integer **n**, return an array containing numbers from **n** down to **1** in descending order using recursion without using loops.`,
    examples: [
      {
        id: 1,
        input: "n = 5",
        output: "[5, 4, 3, 2, 1]",
        explanation: "Numbers from 5 down to 1 in descending order."
      },
      {
        id: 2,
        input: "n = 1",
        output: "[1]",
        explanation: "Returns [1]."
      },
      {
        id: 3,
        input: "n = 6",
        output: "[6, 5, 4, 3, 2, 1]",
        explanation: "Sequence from 6 down to 1."
      }
    ],
    constraints: [
      "1 <= n <= 1000"
    ],
    hints: [
      "Start recursion with `i = n`.",
      "Base case: when `i < 1`, stop recursion.",
      "Recursive step: append `i` and call `helper(i - 1)`."
    ],
    fnName: "printNTo1",
    paramNames: ["n"],
    starterCodes: {
      javascript: `/**
 * @param {number} n
 * @return {number[]}
 */
function printNTo1(n) {
  // Write your code here (use recursion)
  
}`,
      typescript: `function printNTo1(n: number): number[] {
  // Write your code here (use recursion)
  
}`,
      python: `class Solution:
    def printNTo1(self, n: int) -> list[int]:
        # Write your code here (use recursion)
        pass`,
      cpp: `class Solution {
public:
    vector<int> printNTo1(int n) {
        // Write your code here (use recursion)
        
    }
};`,
      java: `class Solution {
    public int[] printNTo1(int n) {
        // Write your code here (use recursion)
        
    }
}`
    },
    testCases: [
      { id: 1, args: [5], expected: [5, 4, 3, 2, 1], rawInputDisplay: "n = 5" },
      { id: 2, args: [1], expected: [1], rawInputDisplay: "n = 1" },
      { id: 3, args: [6], expected: [6, 5, 4, 3, 2, 1], rawInputDisplay: "n = 6" }
    ],
    hiddenTestCases: [
      { id: 4, args: [3], expected: [3, 2, 1], isHidden: true },
      { id: 5, args: [10], expected: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1], isHidden: true }
    ],
    editorial: {
      intuition: "Similar to 1 to N, but decrement the recursive counter on each step starting from n down to 1.",
      approach: "Base condition is `current < 1`. Append `current` to result list, then call `helper(current - 1)`.",
      timeComplexity: "O(N) — N recursive steps.",
      spaceComplexity: "O(N) — call stack depth."
    }
  },

  10: {
    id: 10,
    step: "Step 1: Learn the Basics",
    topic: "Basic Recursion",
    title: "Sum of first N numbers",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problemset/?search=sum+of+first+n+numbers",
    youtubeUrl: "https://www.youtube.com/results?search_query=takeUforward+Sum+of+first+N+numbers",
    leetcodeSlug: "running-sum-of-1d-array",
    gfgUrl: "https://practice.geeksforgeeks.org/problems/sum-of-first-n-terms5843/1",
    tufUrl: "https://takeuforward.org/data-structure/sum-of-first-n-natural-numbers/",
    description: `Given an integer **n**, calculate and return the sum of the first **n** natural numbers (i.e. \`1 + 2 + 3 + ... + n\`).

You can solve this using either mathematical formula \`n * (n + 1) / 2\` or functional recursion.`,
    examples: [
      {
        id: 1,
        input: "n = 5",
        output: "15",
        explanation: "1 + 2 + 3 + 4 + 5 = 15."
      },
      {
        id: 2,
        input: "n = 3",
        output: "6",
        explanation: "1 + 2 + 3 = 6."
      },
      {
        id: 3,
        input: "n = 10",
        output: "55",
        explanation: "Sum from 1 through 10 is 55."
      }
    ],
    constraints: [
      "1 <= n <= 10^5"
    ],
    hints: [
      "Mathematical formula is `(n * (n + 1)) / 2`.",
      "Recursive formulation: `sum(n) = n + sum(n - 1)` with base case `sum(1) = 1`."
    ],
    fnName: "sumOfN",
    paramNames: ["n"],
    starterCodes: {
      javascript: `/**
 * @param {number} n
 * @return {number}
 */
function sumOfN(n) {
  // Write your code here
  
}`,
      typescript: `function sumOfN(n: number): number {
  // Write your code here
  
}`,
      python: `class Solution:
    def sumOfN(self, n: int) -> int:
        # Write your code here
        pass`,
      cpp: `class Solution {
public:
    long long sumOfN(long long n) {
        // Write your code here
        
    }
};`,
      java: `class Solution {
    public long sumOfN(long n) {
        // Write your code here
        
    }
}`
    },
    testCases: [
      { id: 1, args: [5], expected: 15, rawInputDisplay: "n = 5" },
      { id: 2, args: [3], expected: 6, rawInputDisplay: "n = 3" },
      { id: 3, args: [10], expected: 55, rawInputDisplay: "n = 10" }
    ],
    hiddenTestCases: [
      { id: 4, args: [1], expected: 1, isHidden: true },
      { id: 5, args: [100], expected: 5050, isHidden: true },
      { id: 6, args: [1000], expected: 500500, isHidden: true }
    ],
    editorial: {
      intuition: "The sum of the first N natural numbers is given by the arithmetic series formula N * (N + 1) / 2.",
      approach: "Compute `(n * (n + 1)) / 2` in constant time.",
      timeComplexity: "O(1) using formula, or O(N) using recursion.",
      spaceComplexity: "O(1) memory."
    }
  }
};

/**
 * Helper to get problem details by ID.
 * If specific rich metadata exists in detailedProblemsMap, returns that.
 * Otherwise, synthesizes a standard template from dsaQuestions.json.
 */
export function getProblemDetailById(id: number): ProblemDetail {
  if (detailedProblemsMap[id]) {
    return detailedProblemsMap[id];
  }

  const base = (dsaQuestions as any[]).find(p => p.id === id);
  if (!base) {
    // Fallback to problem 1 if not found
    return detailedProblemsMap[1];
  }

  const fnName = base.title
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .split(' ')
    .map((word: string, i: number) => i === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');

  return {
    ...base,
    description: `Solve **${base.title}** from **${base.topic}** (${base.step}).\n\nImplement the optimal algorithm in your chosen programming language.`,
    examples: [
      {
        id: 1,
        input: "Example Input",
        output: "Example Output",
        explanation: `Refer to ${base.tufUrl ? 'TakeUForward article' : 'problem description'} for detailed walkthrough.`
      }
    ],
    constraints: [
      "1 <= N <= 10^5",
      "Time Limit: 2.0s"
    ],
    hints: [
      "Consider time and space complexity trade-offs.",
      "Check edge cases such as empty inputs, single element, or maximum constraint values."
    ],
    fnName: fnName || "solution",
    paramNames: ["input"],
    starterCodes: {
      javascript: `/**\n * Solution for ${base.title}\n * @param {any} input\n * @return {any}\n */\nfunction ${fnName || 'solution'}(input) {\n  // Write your code here\n  \n}`,
      typescript: `function ${fnName || 'solution'}(input: any): any {\n  // Write your code here\n  \n}`,
      python: `class Solution:\n    def ${fnName || 'solution'}(self, input):\n        # Write your code here\n        pass`,
      cpp: `class Solution {\npublic:\n    void ${fnName || 'solution'}() {\n        // Write your code here\n    }\n};`,
      java: `class Solution {\n    public void ${fnName || 'solution'}() {\n        // Write your code here\n    }\n}`
    },
    testCases: [
      { id: 1, args: [null], expected: null, rawInputDisplay: "Sample Testcase 1" }
    ],
    hiddenTestCases: [],
    editorial: {
      intuition: `Mastering ${base.title} is essential for ${base.topic}.`,
      approach: "Review the standard optimal pattern taught in Striver's A2Z DSA sheet.",
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)"
    }
  };
}
