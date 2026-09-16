const fs = require('fs');
const path = require('path');

const questionsPath = path.join(__dirname, '../src/data/dsaQuestions.json');
const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));

// Specific known overrides for standard Striver sheet questions where slugs differ or need exact LeetCode mapping
const specificMappings = {
  1: {
    title: 'Count Digits',
    leetcodeUrl: 'https://leetcode.com/problems/count-the-digits-that-divide-a-number/',
    gfgUrl: 'https://practice.geeksforgeeks.org/problems/count-digits5716/1',
    tufUrl: 'https://takeuforward.org/data-structure/count-digits-in-a-number/'
  },
  2: {
    title: 'Reverse a Number',
    leetcodeUrl: 'https://leetcode.com/problems/reverse-integer/',
    gfgUrl: 'https://practice.geeksforgeeks.org/problems/reverse-digit0327/1',
    tufUrl: 'https://takeuforward.org/maths/reverse-digits-of-a-number/'
  },
  3: {
    title: 'Check Palindrome',
    leetcodeUrl: 'https://leetcode.com/problems/palindrome-number/',
    gfgUrl: 'https://practice.geeksforgeeks.org/problems/palindrome0746/1',
    tufUrl: 'https://takeuforward.org/data-structure/check-if-a-number-is-palindrome-or-not/'
  },
  4: {
    title: 'GCD Or HCF',
    leetcodeUrl: 'https://leetcode.com/problems/find-greatest-common-divisor-of-array/',
    gfgUrl: 'https://practice.geeksforgeeks.org/problems/lcm-and-gcd4516/1',
    tufUrl: 'https://takeuforward.org/data-structure/find-gcd-of-two-numbers/'
  },
  5: {
    title: 'Armstrong Numbers',
    leetcodeUrl: 'https://leetcode.com/problems/armstrong-number/',
    gfgUrl: 'https://practice.geeksforgeeks.org/problems/armstrong-numbers2727/1',
    tufUrl: 'https://takeuforward.org/maths/check-if-a-number-is-armstrong-number-or-not/'
  },
  6: {
    title: 'Print all Divisors',
    leetcodeUrl: 'https://leetcode.com/problems/three-divisors/',
    gfgUrl: 'https://practice.geeksforgeeks.org/problems/all-divisors-of-a-number/1',
    tufUrl: 'https://takeuforward.org/data-structure/print-all-divisors-of-a-given-number/'
  },
  7: {
    title: 'Check for Prime',
    leetcodeUrl: 'https://leetcode.com/problems/count-primes/',
    gfgUrl: 'https://practice.geeksforgeeks.org/problems/prime-number2314/1',
    tufUrl: 'https://takeuforward.org/data-structure/check-if-a-number-is-prime-or-not/'
  },
  8: {
    title: 'Understand Recursion by Print 1 to N',
    leetcodeUrl: 'https://leetcode.com/problemset/?search=recursion+print+1+to+n',
    gfgUrl: 'https://practice.geeksforgeeks.org/problems/print-1-to-n-without-using-loops-1587115620/1',
    tufUrl: 'https://takeuforward.org/recursion/print-1-to-n-using-recursion/'
  },
  9: {
    title: 'Print N to 1 using Recursion',
    leetcodeUrl: 'https://leetcode.com/problemset/?search=recursion+print+n+to+1',
    gfgUrl: 'https://practice.geeksforgeeks.org/problems/print-n-to-1-without-loop/1',
    tufUrl: 'https://takeuforward.org/recursion/print-n-to-1-using-recursion/'
  },
  10: {
    title: 'Sum of first N numbers',
    leetcodeUrl: 'https://leetcode.com/problemset/?search=sum+of+first+n+numbers',
    gfgUrl: 'https://practice.geeksforgeeks.org/problems/sum-of-first-n-terms5843/1',
    tufUrl: 'https://takeuforward.org/data-structure/sum-of-first-n-natural-numbers/'
  },
  11: {
    title: 'Factorial of N numbers',
    leetcodeUrl: 'https://leetcode.com/problemset/?search=factorial',
    gfgUrl: 'https://practice.geeksforgeeks.org/problems/find-all-factorial-numbers-less-than-or-equal-to-n3548/1',
    tufUrl: 'https://takeuforward.org/data-structure/factorial-of-a-number-iterative-and-recursive/'
  },
  12: {
    title: 'Reverse an Array',
    leetcodeUrl: 'https://leetcode.com/problems/reverse-string/',
    gfgUrl: 'https://practice.geeksforgeeks.org/problems/reverse-an-array/0',
    tufUrl: 'https://takeuforward.org/data-structure/reverse-a-given-array/'
  },
  13: {
    title: 'Check if a String is Palindrome',
    leetcodeUrl: 'https://leetcode.com/problems/valid-palindrome/',
    gfgUrl: 'https://practice.geeksforgeeks.org/problems/palindrome-string0817/1',
    tufUrl: 'https://takeuforward.org/data-structure/check-if-the-given-string-is-palindrome-or-not/'
  },
  14: {
    title: 'Fibonacci Number',
    leetcodeUrl: 'https://leetcode.com/problems/fibonacci-number/',
    gfgUrl: 'https://practice.geeksforgeeks.org/problems/nth-fibonacci-number1359/1',
    tufUrl: 'https://takeuforward.org/data-structure/dynamic-programming-introduction/'
  },
  15: {
    title: 'Counting Frequencies of Array Elements',
    leetcodeUrl: 'https://leetcode.com/problems/frequency-of-the-most-frequent-element/',
    gfgUrl: 'https://practice.geeksforgeeks.org/problems/frequency-of-array-elements-1587115620/1',
    tufUrl: 'https://takeuforward.org/data-structure/count-frequency-of-each-element-in-the-array/'
  },
  16: {
    title: 'Find the Highest/Lowest Frequency Element',
    leetcodeUrl: 'https://leetcode.com/problems/top-k-frequent-elements/',
    gfgUrl: 'https://practice.geeksforgeeks.org/problems/find-the-highest-and-lowest-frequency-element/1',
    tufUrl: 'https://takeuforward.org/arrays/find-the-highest-lowest-frequency-element/'
  },
  17: {
    title: 'Selection Sort',
    leetcodeUrl: 'https://leetcode.com/problems/sort-an-array/',
    gfgUrl: 'https://practice.geeksforgeeks.org/problems/selection-sort/1',
    tufUrl: 'https://takeuforward.org/sorting/selection-sort-algorithm/'
  },
  18: {
    title: 'Bubble Sort',
    leetcodeUrl: 'https://leetcode.com/problems/sort-an-array/',
    gfgUrl: 'https://practice.geeksforgeeks.org/problems/bubble-sort/1',
    tufUrl: 'https://takeuforward.org/data-structure/bubble-sort-algorithm/'
  },
  19: {
    title: 'Insertion Sort',
    leetcodeUrl: 'https://leetcode.com/problems/insertion-sort-list/',
    gfgUrl: 'https://practice.geeksforgeeks.org/problems/insertion-sort/1',
    tufUrl: 'https://takeuforward.org/data-structure/insertion-sort-algorithm/'
  },
  20: {
    title: 'Merge Sort',
    leetcodeUrl: 'https://leetcode.com/problems/sort-an-array/',
    gfgUrl: 'https://practice.geeksforgeeks.org/problems/merge-sort/1',
    tufUrl: 'https://takeuforward.org/data-structure/merge-sort-algorithm/'
  },
  21: {
    title: 'Recursive Bubble Sort',
    leetcodeUrl: 'https://leetcode.com/problems/sort-an-array/',
    gfgUrl: 'https://practice.geeksforgeeks.org/problems/bubble-sort/1',
    tufUrl: 'https://takeuforward.org/arrays/recursive-bubble-sort-algorithm/'
  },
  22: {
    title: 'Recursive Insertion Sort',
    leetcodeUrl: 'https://leetcode.com/problems/insertion-sort-list/',
    gfgUrl: 'https://practice.geeksforgeeks.org/problems/insertion-sort/1',
    tufUrl: 'https://takeuforward.org/arrays/recursive-insertion-sort-algorithm/'
  },
  23: {
    title: 'Quick Sort',
    leetcodeUrl: 'https://leetcode.com/problems/sort-an-array/',
    gfgUrl: 'https://practice.geeksforgeeks.org/problems/quick-sort/1',
    tufUrl: 'https://takeuforward.org/data-structure/quick-sort-algorithm/'
  }
};

let enrichedCount = 0;
for (const q of questions) {
  if (specificMappings[q.id]) {
    const map = specificMappings[q.id];
    q.leetcodeUrl = map.leetcodeUrl;
    if (map.gfgUrl) q.gfgUrl = map.gfgUrl;
    if (map.tufUrl) q.tufUrl = map.tufUrl;
    enrichedCount++;
  } else {
    // Generate helpful default TUF and GFG search URLs if not present
    if (!q.tufUrl) {
      q.tufUrl = `https://takeuforward.org/?s=${encodeURIComponent(q.title)}`;
    }
    if (!q.gfgUrl) {
      q.gfgUrl = `https://www.geeksforgeeks.org/search/?q=${encodeURIComponent(q.title)}`;
    }
  }

  // Ensure YouTube URL is always valid search query if not already
  if (!q.youtubeUrl || q.youtubeUrl.includes('takeUforward+Count+Digits')) {
    if (q.id > 1) {
      q.youtubeUrl = `https://www.youtube.com/results?search_query=takeUforward+${encodeURIComponent(q.title)}`;
    }
  }
}

fs.writeFileSync(questionsPath, JSON.stringify(questions, null, 2), 'utf-8');
console.log(`Enriched ${questions.length} problems with accurate LeetCode, GFG, and TUF links! (${enrichedCount} custom-mapped)`);
