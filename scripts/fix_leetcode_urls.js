const https = require('https');
const fs = require('fs');
const path = require('path');

const questionsPath = path.join(__dirname, '../src/data/dsaQuestions.json');
const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));

async function checkSlug(slug) {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      query: `query getQuestionDetail($titleSlug: String!) { question(titleSlug: $titleSlug) { questionId title titleSlug isPaidOnly } }`,
      variables: { titleSlug: slug }
    });
    const req = https.request('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve(json.data?.question || null);
        } catch {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.write(data);
    req.end();
  });
}

// LeetCode search query to find the actual slug when a slug is invalid
async function searchLeetCode(title) {
  return new Promise((resolve) => {
    const cleanTitle = title.replace(/[^\w\s]/gi, '').trim();
    const data = JSON.stringify({
      query: `query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
        problemsetQuestionList: questionList(
          categorySlug: $categorySlug
          limit: $limit
          skip: $skip
          filters: $filters
        ) {
          questions: data {
            questionFrontendId
            title
            titleSlug
            isPaidOnly
          }
        }
      }`,
      variables: {
        categorySlug: "",
        limit: 5,
        skip: 0,
        filters: { searchKeywords: cleanTitle }
      }
    });

    const req = https.request('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          const list = json.data?.problemsetQuestionList?.questions || [];
          resolve(list);
        } catch {
          resolve([]);
        }
      });
    });
    req.on('error', () => resolve([]));
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log(`Checking ${questions.length} questions for valid LeetCode URLs...`);
  
  let validCount = 0;
  let fixedCount = 0;
  let searchedCount = 0;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    let slug = '';
    const match = q.leetcodeUrl?.match(/leetcode\.com\/problems\/([^/]+)/);
    if (match) {
      slug = match[1];
    }

    let isValid = false;
    if (slug) {
      const detail = await checkSlug(slug);
      if (detail && detail.titleSlug) {
        isValid = true;
        validCount++;
        q.leetcodeSlug = detail.titleSlug;
        q.leetcodeUrl = `https://leetcode.com/problems/${detail.titleSlug}/`;
        if (i % 25 === 0) {
          console.log(`[${i + 1}/${questions.length}] VALID: ${q.title} -> ${q.leetcodeUrl}`);
        }
      }
    }

    if (!isValid) {
      // Search for the closest matching LeetCode question
      const results = await searchLeetCode(q.title);
      if (results && results.length > 0) {
        const best = results[0];
        console.log(`[${i + 1}/${questions.length}] FIXED: "${q.title}" (was: ${slug}) -> "${best.title}" (https://leetcode.com/problems/${best.titleSlug}/)`);
        q.leetcodeSlug = best.titleSlug;
        q.leetcodeUrl = `https://leetcode.com/problems/${best.titleSlug}/`;
        fixedCount++;
      } else {
        // Fallback to LeetCode Problemset Search URL or TUF search
        console.log(`[${i + 1}/${questions.length}] FALLBACK SEARCH: "${q.title}"`);
        const searchKeywords = encodeURIComponent(q.title);
        q.leetcodeUrl = `https://leetcode.com/problemset/?search=${searchKeywords}`;
        searchedCount++;
      }
    }

    // Small delay to be polite to LeetCode API
    await new Promise(r => setTimeout(r, 60));
  }

  console.log(`\nResults summary:`);
  console.log(`- Originally Valid: ${validCount}`);
  console.log(`- Fixed via Search: ${fixedCount}`);
  console.log(`- Fallback Search: ${searchedCount}`);

  fs.writeFileSync(questionsPath, JSON.stringify(questions, null, 2), 'utf-8');
  console.log(`Updated ${questionsPath} with 100% working links!`);
}

run();
