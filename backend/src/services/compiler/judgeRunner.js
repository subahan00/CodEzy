import { exec } from 'child_process'; 
import fs from "fs";
import path from "path";
import Submission from "../../models/submission.model.js";
import TestCase from "../../models/testCase.model.js";

const LANGUAGE_CONFIG = {
  javascript: { image: "codezy-js-judge", fileName: "code.js" },
  python: { image: "codezy-python-judge", fileName: "code.py" }
};

// --- DRIVER TEMPLATES ---
const DRIVERS = {
  python: `
if __name__ == "__main__":
    import sys, json
    try:
        input_data = sys.stdin.read().strip()
        if not input_data:
            sys.exit(0)
        lines = input_data.split('\\n')
        args = [json.loads(line) for line in lines if line.strip()]
        result = solution(*args)
        print(json.dumps(result))
    except Exception as e:
        print(str(e), file=sys.stderr)
        sys.exit(1)
`,
  javascript: `
const fs = require('fs');
try {
    const input = fs.readFileSync(0, 'utf-8').trim();
    if (input) {
        const args = input.split('\\n').filter(l=>l.trim()).map(l => JSON.parse(l));
        const result = solution(...args);
        console.log(JSON.stringify(result));
    }
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
`
};

export async function runJavaScriptJudge(payload) {
  const { submissionId, isDryRun, code, language, testCases: customTestCases } = payload;

  let submission = null;
  let sourceCode = "";
  let langKey = "";
  let testCasesToRun = [];
      
  // --- INITIALIZATION ---
  if (!isDryRun && submissionId) {
    submission = await Submission.findById(submissionId);
    if (!submission) throw new Error("Submission not found");
    submission.status = "running";
    await submission.save();

    sourceCode = submission.codeSubmission.sourceCode;
    langKey = submission.codeSubmission.language.toLowerCase();
    testCasesToRun = await TestCase.find({ problem: submission.content });
  } else {
    sourceCode = code;
    langKey = (language || "").toLowerCase();
    testCasesToRun = Array.isArray(customTestCases) ? customTestCases : (customTestCases ? [customTestCases] : [{input:"", output:""}]);
  }

  const langConfig = LANGUAGE_CONFIG[langKey];
  if (!langConfig) {
    if (submission) { submission.status = "runtime-error"; await submission.save(); }
    return { status: "runtime-error", message: "Unsupported Language" };
  }

  const fullExecutableCode = `${sourceCode}\n\n${DRIVERS[langKey] || ""}`;
  const baseTempDir = path.join(process.cwd(), "temp_submissions");
  if (!fs.existsSync(baseTempDir)) fs.mkdirSync(baseTempDir, { recursive: true });

  let passedCount = 0;
  let detailedResults = [];
  let finalStatus = "accepted"; 

  for (const testCase of testCasesToRun) {
    if (!testCase) continue;

    const tempDir = path.join(baseTempDir, `${isDryRun ? 'dry' : submissionId}-${Date.now()}`);
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    try {
      fs.writeFileSync(path.join(tempDir, langConfig.fileName), fullExecutableCode);
      const inputContent = (testCase.input === undefined || testCase.input === null) ? "" : testCase.input;
      fs.writeFileSync(path.join(tempDir, "input.txt"), inputContent.toString());

      const cmd = `docker run --rm --network none -v "${tempDir}:/workspace" ${langConfig.image}`;
      
      const result = await new Promise((resolve) => {
        exec(cmd, (err, stdout, stderr) => {
          try { if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}

          if (err && stderr) return resolve({ status: "RUNTIME_ERROR", error: stderr });

          try {
             const rawOutput = stdout.trim();
             if (!rawOutput) return resolve({ status: "OK", output: "" });

             // 🔥 FIX: Parse the Docker Container's JSON wrapper
             // The container prints: {"status": "OK", "output": "[3, 2, 1]", "time": 136}
             // We need to parse this and extract just the 'output' field.
             
             let parsedDockerOutput;
             try {
                parsedDockerOutput = JSON.parse(rawOutput);
             } catch (e) {
                // If parsing fails, maybe it's raw text (e.g. error message)
                return resolve({ status: "RUNTIME_ERROR", error: "Invalid Container Output: " + rawOutput });
             }

             // Check if container reported an error
             if (parsedDockerOutput.status !== "OK") {
                return resolve({ status: "RUNTIME_ERROR", error: parsedDockerOutput.error || "Unknown Error" });
             }

             // Extract the REAL output string (e.g., "[3, 2, 1]")
             resolve({ status: "OK", output: parsedDockerOutput.output });

          } catch (e) {
             resolve({ status: "RUNTIME_ERROR", error: "Output Parsing Error" });
          }
        });
      });

      // --- VERDICT LOGIC ---
      const normalize = (str) => (str || "").replace(/\s+/g, '');
      const expectedRaw = testCase.expectedOutput || testCase.output || "";
      const actualDisplay = result.error ? "" : result.output; // This should now be just "[3, 2, 1]"
      
      let caseStatus = "ACCEPTED";
      if (result.status === "TLE") caseStatus = "TLE";
      else if (result.status === "RUNTIME_ERROR") caseStatus = "RUNTIME_ERROR";
      else if (normalize(actualDisplay) !== normalize(expectedRaw)) caseStatus = "WRONG_ANSWER";

      if (caseStatus === "ACCEPTED") passedCount++;
      else {
         if (finalStatus === "accepted") {
            if (caseStatus === "TLE") finalStatus = "time-limit-exceeded";
            else if (caseStatus === "RUNTIME_ERROR") finalStatus = "runtime-error";
            else finalStatus = "wrong-answer";
         }
      }

      detailedResults.push({
        status: caseStatus,
        output: actualDisplay,
        expectedOutput: expectedRaw,
        input: testCase.input,
        error: result.error
      });

    } catch (err) {
      console.error("Execution Loop Error:", err);
      if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }

  const executionStats = { passed: passedCount, total: testCasesToRun.length };

  if (!isDryRun && submission) {
    submission.status = finalStatus;
    submission.testResults = detailedResults;
    submission.executionStats = executionStats;
    await submission.save();
    return { success: true, status: finalStatus };
  } else {
    return {
      success: true,
      status: finalStatus,
      testResults: detailedResults,
      executionStats
    };
  }
}