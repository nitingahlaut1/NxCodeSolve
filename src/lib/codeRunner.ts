import { TestCase, ExecutionResult, SubmissionResult, ProblemDetail, SupportedLanguage } from '@/types';

/**
 * Deep equality check for primitives, arrays, nested arrays, and objects
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return a === b;

  // Handle Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (typeof a[i] === 'string' && typeof b[i] === 'string') {
        if (a[i].trimEnd() === b[i].trimEnd() || a[i].trim() === b[i].trim()) {
          continue;
        }
      }
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  // Handle string vs string array (e.g. multiline string vs array of rows)
  if (typeof a === 'string' && Array.isArray(b)) {
    const linesA = a.trim().split(/\r?\n/).map(s => s.trimEnd());
    const linesB = b.map(s => String(s).trimEnd());
    return deepEqual(linesA, linesB);
  }
  if (Array.isArray(a) && typeof b === 'string') {
    const linesA = a.map(s => String(s).trimEnd());
    const linesB = b.trim().split(/\r?\n/).map(s => s.trimEnd());
    return deepEqual(linesA, linesB);
  }

  // Handle strings with trimmed whitespace tolerance
  if (typeof a === 'string' && typeof b === 'string') {
    if (a.trim() === b.trim() || a.trimEnd() === b.trimEnd()) return true;
  }

  // Handle Objects
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key) || !deepEqual(a[key], b[key])) {
        return false;
      }
    }
    return true;
  }

  return false;
}

/**
 * Strip TypeScript type annotations to produce clean, executable JavaScript.
 */
export function stripTypeScript(code: string): string {
  let clean = code;

  // 1. Remove interface declarations
  clean = clean.replace(/interface\s+[A-Za-z0-9_$]+(\s*<[^>]*>)?\s*\{[\s\S]*?\}/g, '');

  // 2. Remove type aliases
  clean = clean.replace(/type\s+[A-Za-z0-9_$]+(\s*<[^>]*>)?\s*=[\s\S]*?;/g, '');

  // 3. Remove access modifiers: public, private, protected, readonly, override
  clean = clean.replace(/\b(public|private|protected|readonly|override)\s+/g, '');

  // 4. Remove type assertions: e.g. "as any", "as number[]"
  clean = clean.replace(/\s+as\s+[A-Za-z0-9_$<>\[\]\s|&.?]+/g, '');

  // 5. Remove generic arguments on types/calls: e.g. "Set<number>", "Array<number>"
  clean = clean.replace(/<\s*[A-Za-z0-9_$]+(\s*<[^>]*>)?(\s*,\s*[A-Za-z0-9_$]+(\s*<[^>]*>)?)*\s*>/g, '');

  // 6. Remove return type annotations on functions, methods, arrows:
  // e.g. "): number {", "): boolean {", "): number[] {", "): void {"
  clean = clean.replace(/\)\s*:\s*[A-Za-z0-9_$<>\[\]\s|&.?]+\s*(\{)/g, ') {');
  clean = clean.replace(/\)\s*:\s*[A-Za-z0-9_$<>\[\]\s|&.?]+\s*(=>)/g, ') =>');

  // 7. Remove variable type annotations:
  // e.g. "let count: number = 0;", "const res: number[] = [];"
  clean = clean.replace(/\b(let|const|var)\s+([A-Za-z0-9_$]+)\s*:\s*[A-Za-z0-9_$<>\[\]\s|&.?]+\s*(=|;)/g, '$1 $2 $3');

  // 8. Remove parameter type annotations:
  // e.g. "(a: number, b: number)" -> "(a, b)"
  clean = clean.replace(/([A-Za-z0-9_$]+)\s*\??\s*:\s*[A-Za-z0-9_$<>\[\]\s|&.?]+\s*(?=[,\)\=])/g, '$1');

  // 9. Clean up any lingering simple type annotations
  clean = clean.replace(/:\s*(number|string|boolean|any|void|unknown|never|object|bigint|symbol)(\[\])?\b/g, '');

  return clean;
}

/**
 * Extract executable function from user's JS/TS code string
 */
function extractUserFunction(userCode: string, fnName: string, language: SupportedLanguage = 'javascript'): Function {
  // Strip TypeScript annotations if language is typescript or contains TS syntax
  let cleanCode = (language === 'typescript' || /:\s*(number|string|boolean|void|any)\b/.test(userCode))
    ? stripTypeScript(userCode)
    : userCode;

  // Wrap in a factory function that returns the target function by name
  const wrapper = new Function(
    'captureLog',
    `
    const console = {
      log: (...args) => captureLog('log', ...args),
      info: (...args) => captureLog('info', ...args),
      warn: (...args) => captureLog('warn', ...args),
      error: (...args) => captureLog('error', ...args)
    };

    ${cleanCode}

    if (typeof ${fnName} === 'function') {
      return ${fnName};
    }
    
    // Check if defined as a property or class method
    if (typeof Solution !== 'undefined') {
      if (typeof Solution.prototype.${fnName} === 'function') {
        const instance = new Solution();
        return instance.${fnName}.bind(instance);
      }
      if (typeof Solution.${fnName} === 'function') {
        return Solution.${fnName}.bind(Solution);
      }
    }

    throw new Error("Function '${fnName}' was not found in your solution. Please check the function name.");
  `
  );

  return (captureLogFn: (type: string, ...args: any[]) => void) => wrapper(captureLogFn);
}

/**
 * Run code against a list of test cases in browser sandbox
 */
export async function executeTestCases(
  userCode: string,
  fnName: string,
  testCases: TestCase[],
  language: SupportedLanguage = 'javascript'
): Promise<ExecutionResult[]> {
  const results: ExecutionResult[] = [];

  try {
    const fnFactory = extractUserFunction(userCode, fnName, language);

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const stdout: string[] = [];

      const captureLog = (_type: string, ...args: any[]) => {
        stdout.push(
          args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')
        );
      };

      const fn = fnFactory(captureLog);

      const startTime = performance.now();
      let actual: any;
      let error: string | undefined;

      try {
        // Deep copy args so mutations don't corrupt subsequent runs
        const copiedArgs = JSON.parse(JSON.stringify(tc.args));
        actual = fn(...copiedArgs);
      } catch (err: any) {
        error = err?.message || String(err);
      }

      const endTime = performance.now();
      const executionTimeMs = Math.max(1, Math.round((endTime - startTime) * 10) / 10);

      let passed = !error && deepEqual(actual, tc.expected);
      if (!passed && !error && actual === undefined && stdout.length > 0) {
        if (deepEqual(stdout, tc.expected)) {
          passed = true;
          actual = stdout;
        }
      }

      results.push({
        testCaseId: tc.id,
        label: tc.label || `Case ${i + 1}`,
        passed,
        args: tc.args,
        expected: tc.expected,
        actual: error ? null : (actual === undefined && stdout.length > 0 ? stdout : actual),
        stdout,
        executionTimeMs,
        error
      });
    }
  } catch (err: any) {
    // Compilation / Syntax / Extraction error
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      results.push({
        testCaseId: tc.id,
        label: tc.label || `Case ${i + 1}`,
        passed: false,
        args: tc.args,
        expected: tc.expected,
        actual: null,
        stdout: [],
        executionTimeMs: 0,
        error: err?.message || 'Syntax / compilation error in your code'
      });
    }
  }

  return results;
}

/**
 * Run a custom user-defined testcase
 */
export async function executeCustomTestCase(
  userCode: string,
  fnName: string,
  customInputStr: string,
  language: SupportedLanguage = 'javascript'
): Promise<ExecutionResult> {
  let parsedArgs: any[];

  try {
    // Attempt parsing as JSON array [arg1, arg2] or single JSON value
    const trimmed = customInputStr.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      parsedArgs = JSON.parse(trimmed);
      if (!Array.isArray(parsedArgs)) {
        parsedArgs = [parsedArgs];
      }
    } else if (trimmed.includes(',')) {
      // e.g. "20, 40" -> [20, 40]
      parsedArgs = trimmed.split(',').map(part => {
        const p = part.trim();
        if (!isNaN(Number(p))) return Number(p);
        if (p === 'true') return true;
        if (p === 'false') return false;
        return p;
      });
    } else {
      if (!isNaN(Number(trimmed))) {
        parsedArgs = [Number(trimmed)];
      } else if (trimmed === 'true' || trimmed === 'false') {
        parsedArgs = [trimmed === 'true'];
      } else {
        parsedArgs = [trimmed.replace(/^["']|["']$/g, '')];
      }
    }
  } catch {
    parsedArgs = [customInputStr];
  }

  const customTestCase: TestCase = {
    id: 999,
    label: 'Custom Testcase',
    args: parsedArgs,
    expected: null
  };

  const results = await executeTestCases(userCode, fnName, [customTestCase], language);
  return results[0];
}

/**
 * Evaluate full submission against both sample and hidden test cases
 */
export async function evaluateSubmission(
  userCode: string,
  problem: ProblemDetail,
  language: SupportedLanguage = 'javascript'
): Promise<SubmissionResult> {
  const allTests = [...problem.testCases, ...(problem.hiddenTestCases || [])];
  
  const startTime = performance.now();
  const results = await executeTestCases(userCode, problem.fnName, allTests, language);
  const totalRuntimeMs = Math.round(performance.now() - startTime);

  const passedCount = results.filter(r => r.passed).length;
  const failedCase = results.find(r => !r.passed);

  if (failedCase) {
    if (failedCase.error) {
      return {
        status: 'RUNTIME_ERROR',
        totalPassed: passedCount,
        totalTests: allTests.length,
        runtimeMs: totalRuntimeMs,
        results,
        failedCase,
        errorDetails: failedCase.error
      };
    }

    return {
      status: 'WRONG_ANSWER',
      totalPassed: passedCount,
      totalTests: allTests.length,
      runtimeMs: totalRuntimeMs,
      results,
      failedCase
    };
  }

  return {
    status: 'ACCEPTED',
    totalPassed: allTests.length,
    totalTests: allTests.length,
    runtimeMs: totalRuntimeMs,
    results
  };
}
