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

  // 9. Remove non-null assertion operators: e.g. "slow!.next", "node!.val"
  clean = clean.replace(/([A-Za-z0-9_$\]\)])!\s*(\.|\?\.|\(|\[)/g, '$1$2');

  // 10. Clean up any lingering simple type annotations
  clean = clean.replace(/:\s*(number|string|boolean|any|void|unknown|never|object|bigint|symbol)(\[\])?\b/g, '');

  return clean;
}

/**
 * Singly linked list node constructor for sandbox
 */
export function ListNode(this: any, val?: number, next?: any) {
  this.val = val === undefined ? 0 : val;
  this.next = next === undefined ? null : next;
}

/**
 * Generic Node constructor for doubly linked lists / multilevel lists
 */
export function Node(this: any, val?: number, next?: any, prev?: any, bottom?: any, random?: any, child?: any) {
  this.val = val === undefined ? 0 : val;
  this.data = this.val;
  this.next = next === undefined ? null : next;
  this.prev = prev === undefined ? null : prev;
  this.bottom = bottom === undefined ? null : bottom;
  this.random = random === undefined ? null : random;
  this.child = child === undefined ? null : child;
}

/**
 * Converts a JS array into a singly linked list with optional cycle
 */
export function arrayToListNode(arr: any[], cyclePos: number = -1): any {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const nodes = arr.map(v => {
    const node: any = { val: v, next: null };
    return node;
  });
  for (let i = 0; i < nodes.length - 1; i++) {
    nodes[i].next = nodes[i + 1];
  }
  if (cyclePos >= 0 && cyclePos < nodes.length) {
    nodes[nodes.length - 1].next = nodes[cyclePos];
  }
  return nodes[0];
}

/**
 * Converts a JS array into a doubly linked list
 */
export function arrayToDoublyList(arr: any[]): any {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const nodes = arr.map(v => {
    const node: any = { val: v, data: v, next: null, prev: null };
    return node;
  });
  for (let i = 0; i < nodes.length; i++) {
    if (i > 0) nodes[i].prev = nodes[i - 1];
    if (i < nodes.length - 1) nodes[i].next = nodes[i + 1];
  }
  return nodes[0];
}

/**
 * Converts array of columns to multilevel linked list with bottom pointers
 */
export function arrayToBottomList(columns: any[]): any {
  if (!Array.isArray(columns) || columns.length === 0) return null;
  const heads: any[] = [];
  for (const col of columns) {
    if (!Array.isArray(col) || col.length === 0) continue;
    const nodes: any[] = col.map(v => ({ val: v, data: v, bottom: null as any, next: null as any }));
    for (let i = 0; i < nodes.length - 1; i++) {
      nodes[i].bottom = nodes[i + 1];
    }
    heads.push(nodes[0]);
  }
  for (let i = 0; i < heads.length - 1; i++) {
    heads[i].next = heads[i + 1];
  }
  return heads[0] || null;
}

/**
 * Converts array of pairs [val, randomIndex] into a linked list with random pointers
 */
export function arrayToRandomList(arr: any[]): any {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const nodes: any[] = arr.map(item => {
    const val = Array.isArray(item) ? item[0] : (typeof item === 'object' ? item.val : item);
    return { val, next: null as any, random: null as any };
  });
  for (let i = 0; i < nodes.length; i++) {
    if (i < nodes.length - 1) nodes[i].next = nodes[i + 1];
    const randIdx = Array.isArray(arr[i]) ? arr[i][1] : null;
    if (randIdx !== null && randIdx !== undefined && randIdx >= 0 && randIdx < nodes.length) {
      nodes[i].random = nodes[randIdx];
    }
  }
  return nodes[0];
}

/**
 * Serializes a linked list with random pointers to array of pairs
 */
export function randomListToArray(head: any): any[] {
  if (!head) return [];
  const nodes: any[] = [];
  const map = new Map<any, number>();
  let curr = head;
  let idx = 0;
  while (curr && !map.has(curr) && idx < 2000) {
    map.set(curr, idx++);
    nodes.push(curr);
    curr = curr.next;
  }
  return nodes.map(n => {
    const randIdx = n.random && map.has(n.random) ? map.get(n.random) : null;
    return [n.val, randIdx];
  });
}

/**
 * Connects two arrays at their common suffix for intersection problems
 */
export function prepareIntersectionLists(arrA: any[], arrB: any[], expectedVal?: any): [any, any] {
  if (!Array.isArray(arrA) || !Array.isArray(arrB)) return [null, null];
  if (arrA.length === 0 || arrB.length === 0) return [arrayToListNode(arrA), arrayToListNode(arrB)];
  
  let idxA = -1;
  let idxB = -1;
  if (expectedVal !== null && expectedVal !== undefined) {
    for (let i = 0; i < arrA.length; i++) {
      if (arrA[i] === expectedVal) {
        for (let j = 0; j < arrB.length; j++) {
          if (arrB[j] === expectedVal) {
            const sufA = arrA.slice(i);
            const sufB = arrB.slice(j);
            if (sufA.length === sufB.length && sufA.every((v, k) => v === sufB[k])) {
              idxA = i;
              idxB = j;
              break;
            }
          }
        }
        if (idxA !== -1) break;
      }
    }
  }

  if (idxA !== -1 && idxB !== -1) {
    const headA = arrayToListNode(arrA);
    let commonNode = headA;
    for (let k = 0; k < idxA; k++) {
      commonNode = commonNode.next;
    }
    const prefixB = arrB.slice(0, idxB);
    let headB = commonNode;
    if (prefixB.length > 0) {
      headB = arrayToListNode(prefixB);
      let tailB = headB;
      while (tailB.next) tailB = tailB.next;
      tailB.next = commonNode;
    }
    return [headA, headB];
  }
  
  let suffixLen = 0;
  while (
    suffixLen < arrA.length &&
    suffixLen < arrB.length &&
    arrA[arrA.length - 1 - suffixLen] === arrB[arrB.length - 1 - suffixLen]
  ) {
    suffixLen++;
  }
  
  if (suffixLen === 0) {
    return [arrayToListNode(arrA), arrayToListNode(arrB)];
  }
  
  const commonSuffix = arrA.slice(arrA.length - suffixLen);
  const commonHead = arrayToListNode(commonSuffix);
  
  const prefixA = arrA.slice(0, arrA.length - suffixLen);
  let headA = commonHead;
  if (prefixA.length > 0) {
    headA = arrayToListNode(prefixA);
    let tailA = headA;
    while (tailA.next) tailA = tailA.next;
    tailA.next = commonHead;
  }
  
  const prefixB = arrB.slice(0, arrB.length - suffixLen);
  let headB = commonHead;
  if (prefixB.length > 0) {
    headB = arrayToListNode(prefixB);
    let tailB = headB;
    while (tailB.next) tailB = tailB.next;
    tailB.next = commonHead;
  }
  
  return [headA, headB];
}

/**
 * Converts a singly/doubly linked list into an array of values
 */
export function listNodeToArray(head: any, maxLimit = 2000): any[] {
  if (!head) return [];
  const res: any[] = [];
  const visited = new Set<any>();
  let curr = head;
  while (curr && !visited.has(curr) && res.length < maxLimit) {
    visited.add(curr);
    const v = curr.val !== undefined ? curr.val : curr.data;
    res.push(v);
    curr = curr.next || curr.bottom;
  }
  return res;
}

/**
 * Checks if an object is a LinkedList node
 */
export function isListNode(obj: any): boolean {
  return obj != null && typeof obj === 'object' && (('val' in obj && 'next' in obj) || ('data' in obj && 'next' in obj) || ('data' in obj && 'bottom' in obj));
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
    function ListNode(val, next) {
      this.val = (val === undefined ? 0 : val);
      this.next = (next === undefined ? null : next);
    }
    function Node(val, next, prev, bottom, random, child) {
      this.val = (val === undefined ? 0 : val);
      this.data = this.val;
      this.next = (next === undefined ? null : next);
      this.prev = (prev === undefined ? null : prev);
      this.bottom = (bottom === undefined ? null : bottom);
      this.random = (random === undefined ? null : random);
      this.child = (child === undefined ? null : child);
    }

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
        
        // Automatic argument marshaling for LinkedList problems
        let preparedArgs: any[];
        if (fnName === 'getIntersectionNode' && copiedArgs.length === 2) {
          preparedArgs = prepareIntersectionLists(copiedArgs[0], copiedArgs[1], tc.expected);
        } else if (fnName === 'copyRandomList' && copiedArgs.length >= 1) {
          preparedArgs = [arrayToRandomList(copiedArgs[0]), ...copiedArgs.slice(1)];
        } else if (fnName === 'flatten' && copiedArgs.length >= 1) {
          preparedArgs = [arrayToBottomList(copiedArgs[0]), ...copiedArgs.slice(1)];
        } else {
          preparedArgs = copiedArgs.map((arg: any) => {
            if (fnName === 'constructLL' || fnName === 'constructDLL') {
              return arg;
            }
            if (Array.isArray(arg)) {
              if (fnName.toLowerCase().includes('dll') || fnName === 'addNode' || fnName === 'deleteNodeDLL' || fnName === 'reverseDLL') {
                return arrayToDoublyList(arg);
              }
              const cyclePos = (tc as any).pos !== undefined ? (tc as any).pos : -1;
              return arrayToListNode(arg, cyclePos);
            }
            return arg;
          });
        }

        actual = fn(...preparedArgs);

        // Normalize returned value if it's a ListNode or Node
        if (fnName === 'copyRandomList' && isListNode(actual)) {
          actual = randomListToArray(actual);
        } else if (isListNode(actual)) {
          if (typeof tc.expected === 'number' && typeof actual.val === 'number') {
            actual = actual.val;
          } else {
            actual = listNodeToArray(actual);
          }
        } else if (actual === null && Array.isArray(tc.expected) && tc.expected.length === 0) {
          actual = [];
        }
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
