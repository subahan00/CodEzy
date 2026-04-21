import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import Submission from '../../models/submission.model.js';
import TestCase from '../../models/testCase.model.js';

const LANGUAGE_CONFIG = {
  javascript: { image: 'codezy-js-judge', fileName: 'code.js', cmd: 'node code.js' },
  python: { image: 'codezy-python-judge', fileName: 'code.py', cmd: 'python3 code.py' },
  java: { image: 'codezy-java-judge', fileName: 'Main.java', cmd: 'sh -c "javac /workspace/Main.java && java -cp /workspace Main"' },
  cpp: { image: 'codezy-cpp-judge', fileName: 'code.cpp', cmd: 'g++ -o code code.cpp && ./code' },
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
function normalizeOutput(res) { return res instanceof ListNode ? linkedListToArray(res) : res; }

// ── Batch runner ──────────────────────────────────────────────────────────────
const fs = require('fs');
const batch = JSON.parse(fs.readFileSync('/workspace/batch.json', 'utf8'));
const results = [];

for (const tc of batch) {
  try {
    const args = tc.input.trim().split('\\n').filter(Boolean).map(l => JSON.parse(l));
    const raw  = solution(...args);
    const output = JSON.stringify(normalizeOutput(raw));

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

    def normalize_output(res): return linked_list_to_array(res) if isinstance(res, ListNode) else res

    # ── Batch runner ──────────────────────────────────────────────────────────
    with open('/workspace/batch.json') as f:
        batch = json.load(f)

    results = []
    for tc in batch:
        try:
            lines   = [l for l in tc['input'].strip().split('\\n') if l.strip()]
            args    = [json.loads(l) for l in lines]
            raw     = solution(*args)
            output  = json.dumps(normalize_output(raw))
            results.append({'status': 'OK', 'output': output})
        except Exception as e:
            results.append({'status': 'RUNTIME_ERROR', 'error': str(e), 'output': ''})

    with open('/workspace/results.json', 'w') as f:
        json.dump(results, f)
`,

  // ── Java driver ─────────────────────────────────────────────────────────────
  //    Appended verbatim after the user's Solution class in Main.java.
  //    The file compiles as a single unit: Solution (user) + ListNode + Main (driver).
  java: `
// ── ListNode (used by linked-list problems) ──────────────────────────────────
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

// ── Batch Driver ─────────────────────────────────────────────────────────────
public class Main {

    // ── Minimal JSON parser ───────────────────────────────────────────────────
    private static int idx;

    private static Object parseJson(String s) {
        idx = 0;
        return parseValue(s.trim());
    }

    private static Object parseValue(String s) {
        skipWs(s);
        if (idx >= s.length()) return null;
        char c = s.charAt(idx);
        if (c == '"')  return parseString(s);
        if (c == '[')  return parseArray(s);
        if (c == '{')  return parseObject(s);
        if (c == 't')  { idx += 4; return Boolean.TRUE; }
        if (c == 'f')  { idx += 5; return Boolean.FALSE; }
        if (c == 'n')  { idx += 4; return null; }
        return parseNumber(s);
    }

    private static void skipWs(String s) {
        while (idx < s.length() && Character.isWhitespace(s.charAt(idx))) idx++;
    }

    private static String parseString(String s) {
        idx++; // skip opening "
        StringBuilder sb = new StringBuilder();
        while (idx < s.length()) {
            char c = s.charAt(idx++);
            if (c == '"') break;
            if (c == '\\\\') {
                char esc = s.charAt(idx++);
                switch (esc) {
                    case 'n': sb.append('\\n'); break;
                    case 'r': sb.append('\\r'); break;
                    case 't': sb.append('\\t'); break;
                    default:  sb.append(esc);  break;
                }
            } else {
                sb.append(c);
            }
        }
        return sb.toString();
    }

    private static List<Object> parseArray(String s) {
        idx++; // skip [
        List<Object> list = new ArrayList<>();
        skipWs(s);
        if (idx < s.length() && s.charAt(idx) == ']') { idx++; return list; }
        while (idx < s.length()) {
            list.add(parseValue(s));
            skipWs(s);
            if (idx < s.length() && s.charAt(idx) == ',') idx++;
            else { if (idx < s.length()) idx++; break; } // skip ]
        }
        return list;
    }

    private static Map<String, Object> parseObject(String s) {
        idx++; // skip {
        Map<String, Object> map = new LinkedHashMap<>();
        skipWs(s);
        if (idx < s.length() && s.charAt(idx) == '}') { idx++; return map; }
        while (idx < s.length()) {
            skipWs(s);
            String key = parseString(s);
            skipWs(s);
            idx++; // skip :
            Object val = parseValue(s);
            map.put(key, val);
            skipWs(s);
            if (idx < s.length() && s.charAt(idx) == ',') idx++;
            else { if (idx < s.length()) idx++; break; } // skip }
        }
        return map;
    }

    private static Number parseNumber(String s) {
        int start = idx;
        while (idx < s.length() && "-+0123456789.eE".indexOf(s.charAt(idx)) >= 0) idx++;
        String num = s.substring(start, idx);
        if (num.contains(".") || num.contains("e") || num.contains("E"))
            return Double.parseDouble(num);
        return Long.parseLong(num);
    }

    // ── JSON serializer ───────────────────────────────────────────────────────
    @SuppressWarnings("unchecked")
    private static String toJson(Object o) {
        if (o == null) return "null";
        if (o instanceof Boolean || o instanceof Number) return o.toString();
        if (o instanceof String) {
            String s = (String) o;
            return "\\\"" + s
                .replace("\\\\", "\\\\\\\\")
                .replace("\\\"", "\\\\\\\"")
                .replace("\\n", "\\\\n")
                .replace("\\r", "\\\\r")
                + "\\\"";
        }
        if (o instanceof int[]) {
            int[] a = (int[]) o;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < a.length; i++) { if (i > 0) sb.append(','); sb.append(a[i]); }
            return sb.append(']').toString();
        }
        if (o instanceof long[]) {
            long[] a = (long[]) o;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < a.length; i++) { if (i > 0) sb.append(','); sb.append(a[i]); }
            return sb.append(']').toString();
        }
        if (o instanceof double[]) {
            double[] a = (double[]) o;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < a.length; i++) { if (i > 0) sb.append(','); sb.append(a[i]); }
            return sb.append(']').toString();
        }
        if (o instanceof Object[]) {
            Object[] a = (Object[]) o;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < a.length; i++) { if (i > 0) sb.append(','); sb.append(toJson(a[i])); }
            return sb.append(']').toString();
        }
        if (o instanceof List) {
            List<Object> list = (List<Object>) o;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < list.size(); i++) { if (i > 0) sb.append(','); sb.append(toJson(list.get(i))); }
            return sb.append(']').toString();
        }
        if (o instanceof Map) {
            Map<String, Object> m = (Map<String, Object>) o;
            StringBuilder sb = new StringBuilder("{");
            boolean first = true;
            for (Map.Entry<String, Object> e : m.entrySet()) {
                if (!first) sb.append(','); first = false;
                sb.append(toJson(e.getKey())).append(':').append(toJson(e.getValue()));
            }
            return sb.append('}').toString();
        }
        return '"' + o.toString() + '"';
    }

    // ── LinkedList helpers ────────────────────────────────────────────────────
    @SuppressWarnings("unchecked")
    private static ListNode arrayToLinkedList(List<Object> arr) {
        ListNode dummy = new ListNode(0), curr = dummy;
        for (Object v : arr) { curr.next = new ListNode(((Number) v).intValue()); curr = curr.next; }
        return dummy.next;
    }

    private static List<Object> linkedListToArray(ListNode head) {
        List<Object> out = new ArrayList<>();
        Set<ListNode> seen = new HashSet<>();
        while (head != null) {
            if (seen.contains(head)) throw new RuntimeException("Cycle detected");
            seen.add(head);
            out.add((long) head.val);
            head = head.next;
        }
        return out;
    }

    // ── Type coercion: JSON-parsed Object → Java parameter type ──────────────
    @SuppressWarnings("unchecked")
    private static Object coerce(Object val, Class<?> type) {
        if (val == null) return null;
        if (type == int.class    || type == Integer.class) return ((Number) val).intValue();
        if (type == long.class   || type == Long.class)    return ((Number) val).longValue();
        if (type == double.class || type == Double.class)  return ((Number) val).doubleValue();
        if (type == float.class  || type == Float.class)   return ((Number) val).floatValue();
        if (type == boolean.class|| type == Boolean.class) return (Boolean) val;
        if (type == String.class) return val.toString();
        if (type == int[].class) {
            List<Object> l = (List<Object>) val;
            int[] a = new int[l.size()];
            for (int i = 0; i < l.size(); i++) a[i] = ((Number) l.get(i)).intValue();
            return a;
        }
        if (type == long[].class) {
            List<Object> l = (List<Object>) val;
            long[] a = new long[l.size()];
            for (int i = 0; i < l.size(); i++) a[i] = ((Number) l.get(i)).longValue();
            return a;
        }
        if (type == double[].class) {
            List<Object> l = (List<Object>) val;
            double[] a = new double[l.size()];
            for (int i = 0; i < l.size(); i++) a[i] = ((Number) l.get(i)).doubleValue();
            return a;
        }
        if (type == String[].class) {
            List<Object> l = (List<Object>) val;
            String[] a = new String[l.size()];
            for (int i = 0; i < l.size(); i++) a[i] = l.get(i).toString();
            return a;
        }
        if (type == int[][].class) {
            List<Object> outer = (List<Object>) val;
            int[][] a = new int[outer.size()][];
            for (int i = 0; i < outer.size(); i++) {
                List<Object> inner = (List<Object>) outer.get(i);
                a[i] = new int[inner.size()];
                for (int j = 0; j < inner.size(); j++) a[i][j] = ((Number) inner.get(j)).intValue();
            }
            return a;
        }
        if (type == ListNode.class && val instanceof List)
            return arrayToLinkedList((List<Object>) val);
        if (type == List.class) return val;
        return val; // pass-through for unknown types
    }

    // ── Entry point ───────────────────────────────────────────────────────────
    public static void main(String[] args) throws Exception {
        String batchStr = new String(Files.readAllBytes(Paths.get("/workspace/batch.json")));

        // Parse [ { input: "...", expectedOutput: "..." }, ... ]
        idx = 0;
        List<Object> batchRaw = parseArray(batchStr.trim());

        // Locate solution() method via reflection
        Solution sol = new Solution();
        Method solutionMethod = null;
        for (Method m : Solution.class.getDeclaredMethods()) {
            if (m.getName().equals("solution")) { solutionMethod = m; break; }
        }
        if (solutionMethod == null)
            throw new RuntimeException("No public solution() method found in Solution class");
        solutionMethod.setAccessible(true);
        Class<?>[] paramTypes = solutionMethod.getParameterTypes();

        List<String> results = new ArrayList<>();

        for (Object tcRaw : batchRaw) {
            @SuppressWarnings("unchecked")
            Map<String, Object> tc = (Map<String, Object>) tcRaw;
            String input = (String) tc.get("input");
            try {
                // Each line of input is one JSON-encoded argument
                String[] lines = input.trim().split("\\n");
                Object[] methodArgs = new Object[Math.min(lines.length, paramTypes.length)];
                for (int i = 0; i < methodArgs.length; i++) {
                    Object parsed = parseJson(lines[i].trim());
                    methodArgs[i] = coerce(parsed, paramTypes[i]);
                }

                Object result = solutionMethod.invoke(sol, methodArgs);

                // Normalize LinkedList return values
                if (result instanceof ListNode) result = linkedListToArray((ListNode) result);

                String output = toJson(result);
                results.add("{\\\"status\\\":\\\"OK\\\",\\\"output\\\":" + toJson(output) + "}");

            } catch (InvocationTargetException ite) {
                Throwable cause = ite.getCause() != null ? ite.getCause() : ite;
                results.add("{\\\"status\\\":\\\"RUNTIME_ERROR\\\",\\\"error\\\":" + toJson(cause.getMessage()) + ",\\\"output\\\":\\\"\\\"}");
            } catch (Exception e) {
                results.add("{\\\"status\\\":\\\"RUNTIME_ERROR\\\",\\\"error\\\":" + toJson(e.getMessage()) + ",\\\"output\\\":\\\"\\\"}");
            }
        }

        String json = "[" + String.join(",", results) + "]";
        Files.write(Paths.get("/workspace/results.json"), json.getBytes());
    }
}
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
      } catch { }

      // Now safe to delete
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch { }

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
  let submission = null;
  let sourceCode = '';
  let langKey = '';
  let testCasesToRun = [];

  if (!isDryRun && submissionId) {
    submission = await Submission.findById(submissionId);
    if (!submission) throw new Error('Submission not found');
    submission.status = 'running';
    await submission.save();

    sourceCode = submission.codeSubmission.sourceCode;
    langKey = submission.codeSubmission.language.toLowerCase();
    testCasesToRun = await TestCase.find({ problem: submission.content });
  } else {
    sourceCode = code;
    langKey = (language || '').toLowerCase();
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
  const runId = isDryRun ? `dry-${Date.now()}` : `${submissionId}-${Date.now()}`;
  const tempDir = path.join(process.cwd(), 'temp_submissions', runId);
  fs.mkdirSync(tempDir, { recursive: true });

  // ── 3. Write code + batch.json ──────────────────────────────────────────────
  // Java needs imports at the very top before any class definitions
  const javaImports = langKey === 'java'
    ? 'import java.io.*;\nimport java.nio.file.*;\nimport java.util.*;\nimport java.lang.reflect.*;\n\n'
    : '';
  const fullCode = `${javaImports}${sourceCode}\n\n${DRIVERS[langKey]}`;
  fs.writeFileSync(path.join(tempDir, langConfig.fileName), fullCode);

  const batch = testCasesToRun.filter(Boolean).map(tc => ({
    input: String(tc.input ?? ''),
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
      status: dockerResult.timedOut ? 'TLE' : 'RUNTIME_ERROR',
      output: '',
      expectedOutput: '',
      error: dockerResult.error
    }));

    if (submission) {
      submission.status = status;
      submission.testResults = fallbackResults;
      submission.executionStats = { passed: 0, total: batch.length };
      await submission.save();
    }
    return {
      success: false,
      status,
      testResults: fallbackResults,
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
    const tc = batch[i];
    const result = containerResults[i] ?? { status: 'RUNTIME_ERROR', output: '', error: 'Missing result' };

    let caseStatus = 'ACCEPTED';
    if (result.status === 'TLE') caseStatus = 'TLE';
    else if (result.status === 'RUNTIME_ERROR') caseStatus = 'RUNTIME_ERROR';
    else if (normalize(result.output) !== normalize(tc.expectedOutput)) caseStatus = 'WRONG_ANSWER';

    if (caseStatus === 'ACCEPTED') {
      passedCount++;
    } else if (finalStatus === 'accepted') {
      finalStatus =
        caseStatus === 'TLE' ? 'time-limit-exceeded' :
          caseStatus === 'RUNTIME_ERROR' ? 'runtime-error' : 'wrong-answer';
    }

    detailedResults.push({
      status: caseStatus,
      output: result.output,
      expectedOutput: tc.expectedOutput,
      input: tc.input,
      error: result.error ?? null
    });
  }

  const executionStats = { passed: passedCount, total: batch.length };

  if (!isDryRun && submission) {
    submission.status = finalStatus;
    submission.testResults = detailedResults;
    submission.executionStats = executionStats;
    await submission.save();
    return { success: true, status: finalStatus };
  }

  return { success: true, status: finalStatus, testResults: detailedResults, executionStats };
}