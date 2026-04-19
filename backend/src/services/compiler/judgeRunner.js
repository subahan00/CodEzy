import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import Submission from '../../models/submission.model.js';
import TestCase from '../../models/testCase.model.js';

const LANGUAGE_CONFIG = {
  javascript: { image: 'codezy-js-judge', fileName: 'code.js',  cmd: 'node code.js'    },
  python:     { image: 'codezy-python-judge', fileName: 'code.py', cmd: 'python3 code.py' },
  java:       { image: 'codezy-java-judge',   fileName: 'Main.java', cmd: 'java Main' },
  cpp:        { image: 'codezy-cpp-judge',    fileName: 'code.cpp',  cmd: 'g++ -o code code.cpp && ./code' },
};

const normalize = (str) => (str || '').replace(/\s+/g, '');

// ─── DRIVERS ────────────────────────────────────────────────────────────────
// Each driver:
//   1. Reads batch.json  → array of { input, expectedOutput }
//   2. Runs the user's solution() for every test case
//   3. Writes results.json → array of { status, output, error }
// The driver is appended to the user's source code before execution.

const DRIVERS = {
  javascript: `
// ── Helpers ──────────────────────────────────────────────────────────────────
class ListNode { constructor(val=0,next=null){this.val=val;this.next=next;} }

function arrayToLinkedList(arr) {
  if (!Array.isArray(arr)) return null;
  const dummy = new ListNode(0); let curr = dummy;
  for (const v of arr) { curr.next = new ListNode(v); curr = curr.next; }
  return dummy.next;
}
function linkedListToArray(head) {
  const out=[]; const seen=new Set(); let curr=head;
  while(curr){ if(seen.has(curr)) throw new Error('Cycle detected'); seen.add(curr); out.push(curr.val); curr=curr.next; }
  return out;
}
function normalizeInput(arg)  { return Array.isArray(arg) ? arrayToLinkedList(arg) : arg; }
function normalizeOutput(res) { return res instanceof ListNode ? linkedListToArray(res) : res; }

// ── Batch runner ──────────────────────────────────────────────────────────────
const fs = require('fs');
const batch = JSON.parse(fs.readFileSync('/workspace/batch.json', 'utf8'));
const results = [];

for (const tc of batch) {
  try {
    const rawArgs = tc.input.trim().split('\\n').filter(Boolean).map(l => JSON.parse(l));
    const args    = rawArgs.map(normalizeInput);
    const raw     = solution(...args);
    const output  = JSON.stringify(normalizeOutput(raw));

    results.push({ status: 'OK', output });
  } catch (e) {
    results.push({ status: 'RUNTIME_ERROR', error: e.message, output: '' });
  }
}

fs.writeFileSync('/workspace/results.json', JSON.stringify(results));
`,

  python: `
if __name__ == "__main__":
    import sys, json

    # ── Helpers ──────────────────────────────────────────────────────────────
    class ListNode:
        def __init__(self, val=0, next=None): self.val=val; self.next=next

    def array_to_linked_list(arr):
        if not isinstance(arr, list): return None
        dummy=ListNode(0); curr=dummy
        for v in arr: curr.next=ListNode(v); curr=curr.next
        return dummy.next

    def linked_list_to_array(head):
        out=[]; visited=set(); curr=head
        while curr:
            if id(curr) in visited: raise Exception("Cycle detected")
            visited.add(id(curr)); out.append(curr.val); curr=curr.next
        return out

    def normalize_input(arg):  return array_to_linked_list(arg) if isinstance(arg, list) else arg
    def normalize_output(res): return linked_list_to_array(res) if isinstance(res, ListNode) else res

    # ── Batch runner ──────────────────────────────────────────────────────────
    with open('/workspace/batch.json') as f:
        batch = json.load(f)

    results = []
    for tc in batch:
        try:
            lines   = [l for l in tc['input'].strip().split('\\n') if l.strip()]
            raw_args= [json.loads(l) for l in lines]
            args    = [normalize_input(a) for a in raw_args]
            raw     = solution(*args)
            output  = json.dumps(normalize_output(raw))
            results.append({'status': 'OK', 'output': output})
        except Exception as e:
            results.append({'status': 'RUNTIME_ERROR', 'error': str(e), 'output': ''})

    with open('/workspace/results.json', 'w') as f:
        json.dump(results, f)
`

};

// ─── Core execution ──────────────────────────────────────────────────────────
function execDocker(tempDir, langConfig) {
  return new Promise((resolve) => {
    const cmd = [
      'docker run --rm',
      '--network none',
      '--memory 256m',
      '--cpus 0.5',
      `-v "${tempDir}:/workspace"`,
      langConfig.image,
      langConfig.cmd
    ].join(' ');

    exec(cmd, { timeout: 10000 }, (err, stdout, stderr) => {
      // Read results BEFORE cleanup — this is the critical ordering
      let resultsJson = null;
      const resultsPath = path.join(tempDir, 'results.json');
      try {
        if (fs.existsSync(resultsPath)) {
          resultsJson = fs.readFileSync(resultsPath, 'utf8');
        }
      } catch {}

      // Now safe to delete
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}

      if (err) {
        const timedOut = err.killed || err.signal === 'SIGTERM';
        return resolve({ ok: false, timedOut, error: stderr || err.message });
      }

      // Container exited 0 but wrote nothing — treat as crash
      if (!resultsJson) {
        return resolve({ ok: false, timedOut: false, error: 'Container produced no results.json' });
      }

      resolve({ ok: true, resultsJson });
    });
  });
}
// ─── Main judge function ─────────────────────────────────────────────────────

export async function runJavaScriptJudge(payload) {
  const { submissionId, isDryRun, code, language, testCases: customTestCases } = payload;

  // ── 1. Resolve submission vs dry-run ────────────────────────────────────────
  let submission   = null;
  let sourceCode   = '';
  let langKey      = '';
  let testCasesToRun = [];

  if (!isDryRun && submissionId) {
    submission = await Submission.findById(submissionId);
    if (!submission) throw new Error('Submission not found');
    submission.status = 'running';
    await submission.save();

    sourceCode     = submission.codeSubmission.sourceCode;
    langKey        = submission.codeSubmission.language.toLowerCase();
    testCasesToRun = await TestCase.find({ problem: submission.content });
  } else {
    sourceCode     = code;
    langKey        = (language || '').toLowerCase();
    testCasesToRun = Array.isArray(customTestCases)
      ? customTestCases
      : (customTestCases ? [customTestCases] : [{ input: '', output: '' }]);
  }

  const langConfig = LANGUAGE_CONFIG[langKey];
  if (!langConfig) {
    if (submission) { submission.status = 'runtime-error'; await submission.save(); }
    return { status: 'runtime-error', message: 'Unsupported language' };
  }

  // ── 2. Build temp workspace ─────────────────────────────────────────────────
  const runId   = isDryRun ? `dry-${Date.now()}` : `${submissionId}-${Date.now()}`;
  const tempDir = path.join(process.cwd(), 'temp_submissions', runId);
  fs.mkdirSync(tempDir, { recursive: true });

  // ── 3. Write code + batch.json ──────────────────────────────────────────────
  const fullCode = `${sourceCode}\n\n${DRIVERS[langKey]}`;
  fs.writeFileSync(path.join(tempDir, langConfig.fileName), fullCode);

  const batch = testCasesToRun.filter(Boolean).map(tc => ({
    input:          String(tc.input ?? ''),
    expectedOutput: String(tc.expectedOutput ?? tc.output ?? '')
  }));
  fs.writeFileSync(path.join(tempDir, 'batch.json'), JSON.stringify(batch));

  // ── 4. Run ONE container ────────────────────────────────────────────────────
  const dockerResult = await execDocker(tempDir, langConfig);

  // ── 5. Handle container-level failures ─────────────────────────────────────
  //    (OOM, TLE, crash before results.json was written)
  if (!dockerResult.ok) {
    const status = dockerResult.timedOut ? 'time-limit-exceeded' : 'runtime-error';
    const fallbackResults = batch.map(() => ({
      status:         dockerResult.timedOut ? 'TLE' : 'RUNTIME_ERROR',
      output:         '',
      expectedOutput: '',
      error:          dockerResult.error
    }));

    if (submission) {
      submission.status        = status;
      submission.testResults   = fallbackResults;
      submission.executionStats = { passed: 0, total: batch.length };
      await submission.save();
    }
    return {
      success: false,
      status,
      testResults:    fallbackResults,
      executionStats: { passed: 0, total: batch.length }
    };
  }

  // ── 6. Read results.json written by the driver ──────────────────────────────
  // tempDir was deleted by execDocker — results.json was inside it.
  // We need to read it BEFORE cleanup. See note below.
  // ⚠️  Move read to BEFORE rmSync — patch in execDocker or read here via a
  //     separate results path. Simplest fix: read from a sibling path.
  //
  // NOTE: execDocker deletes tempDir after the container exits. results.json
  // is inside tempDir. We must read it before cleanup. The cleanest fix is to
  // let execDocker return the results.json content directly:

  // (See execDocker v2 below — this function is superseded)
  const rawJson = dockerResult.resultsJson;
  let containerResults;
  try {
    containerResults = JSON.parse(rawJson);
  } catch {
    // Malformed output — treat every case as runtime error
    containerResults = batch.map(() => ({ status: 'RUNTIME_ERROR', output: '', error: 'Malformed results.json' }));
  }

  // ── 7. Score results ────────────────────────────────────────────────────────
  let passedCount = 0;
  let finalStatus = 'accepted';
  const detailedResults = [];

  for (let i = 0; i < batch.length; i++) {
    const tc     = batch[i];
    const result = containerResults[i] ?? { status: 'RUNTIME_ERROR', output: '', error: 'Missing result' };

    let caseStatus = 'ACCEPTED';
    if      (result.status === 'TLE')          caseStatus = 'TLE';
    else if (result.status === 'RUNTIME_ERROR') caseStatus = 'RUNTIME_ERROR';
    else if (normalize(result.output) !== normalize(tc.expectedOutput)) caseStatus = 'WRONG_ANSWER';

    if (caseStatus === 'ACCEPTED') {
      passedCount++;
    } else if (finalStatus === 'accepted') {
      finalStatus =
        caseStatus === 'TLE'           ? 'time-limit-exceeded' :
        caseStatus === 'RUNTIME_ERROR' ? 'runtime-error'       : 'wrong-answer';
    }

    detailedResults.push({
      status:         caseStatus,
      output:         result.output,
      expectedOutput: tc.expectedOutput,
      input:          tc.input,
      error:          result.error ?? null
    });
  }

  const executionStats = { passed: passedCount, total: batch.length };

  if (!isDryRun && submission) {
    submission.status         = finalStatus;
    submission.testResults    = detailedResults;
    submission.executionStats = executionStats;
    await submission.save();
    return { success: true, status: finalStatus };
  }

  return { success: true, status: finalStatus, testResults: detailedResults, executionStats };
}