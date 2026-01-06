import { exec } from 'child_process';
import fs from "fs";
import path from "path";
import Submission from "../../models/submission.model.js";
import TestCase from "../../models/testCase.model.js";

// Configuration for supported languages
const LANGUAGE_CONFIG = {
  javascript: {
    image: "codezy-js-judge",
    fileName: "code.js"
  },
  python: {
    image: "codezy-python-judge",
    fileName: "code.py"
  }
};

export async function runJavaScriptJudge(submissionId) {
  const submission = await Submission.findById(submissionId);
  
  // 0. Initial Status Update
  submission.status = "running";
  await submission.save();

  // 1. Validate Language Support
  // We access language from 'codeSubmission' object as per your schema
  const langKey = submission.codeSubmission.language.toLowerCase();
  const langConfig = LANGUAGE_CONFIG[langKey];

  if (!langConfig) {
    submission.status = "runtime-error";
    console.error(`❌ Unsupported Language: ${langKey}`);
    await submission.save();
    return;
  }

  // 2. Fetch Test Cases
  const testCases = await TestCase.find({ problem: submission.content }); 

  let passedCount = 0;
  const detailedResults = [];
  const sourceCode = submission.codeSubmission.sourceCode;

  // 3. Setup Temp Directory
  const baseTempDir = path.join(process.cwd(), "temp_submissions");
  if (!fs.existsSync(baseTempDir)) fs.mkdirSync(baseTempDir, { recursive: true });

  // --- EXECUTION LOOP ---
  for (const testCase of testCases) {
    const tempDir = path.join(baseTempDir, `${submissionId}-${Date.now()}`);
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    try {
      // Write Code & Input
      fs.writeFileSync(path.join(tempDir, langConfig.fileName), sourceCode);
      // Ensure input is a string; default to empty if missing
      fs.writeFileSync(path.join(tempDir, "input.txt"), testCase.input || "");

      // Run Docker
      const cmd = `docker run --rm --network none -v "${tempDir}:/workspace" ${langConfig.image}`;

      const result = await new Promise((resolve) => {
        exec(cmd, (err, stdout, stderr) => {
          // Cleanup immediately to keep disk clean
          try {
            if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
          } catch (e) { console.error("Cleanup error:", e); }

          if (err && stderr) {
            // Docker infrastructure failure (not user code failure)
            console.error("❌ Docker System Error:", stderr);
            return resolve({ status: "RUNTIME_ERROR", output: "" });
          }

          try {
            const cleanOutput = stdout.trim();
            if (!cleanOutput) return resolve({ status: "RUNTIME_ERROR", output: "" });
            resolve(JSON.parse(cleanOutput));
          } catch (e) {
            console.error("❌ JSON Parse Failed:", stdout);
            resolve({ status: "RUNTIME_ERROR", output: "" });
          }
        });
      });

    // --- VERDICT LOGIC (CRASH PROOF & FLEXIBLE) ---

      // Helper: Remove ALL whitespace for comparison (e.g., "[0, 1]" becomes "[0,1]")
      const normalize = (str) => (str || "").replace(/\s+/g, '');
      
      // Helper: Just trim edges for display (we want to show the user exactly what they printed)
      const safeTrim = (str) => (str || "").trim();

      // 1. Prepare strings for comparison vs display
      const expectedDisplay = safeTrim(testCase.expectedOutput || testCase.output);
      const actualDisplay = safeTrim(result.output);
      
      const expectedNormalized = normalize(expectedDisplay);
      const actualNormalized = normalize(actualDisplay);

      // 2. Determine Status for THIS test case
      let caseStatus = "ACCEPTED";
      if (result.status === "TLE") {
        caseStatus = "TLE";
      } else if (result.status !== "OK") {
        caseStatus = "RUNTIME_ERROR";
      } else if (actualNormalized !== expectedNormalized) { 
        // Compare the NORMALIZED versions
        caseStatus = "WRONG_ANSWER";
      }

      const isCorrect = (caseStatus === "ACCEPTED");
      if (isCorrect) passedCount++;

      // 3. Create Detailed Result Object
      const resultEntry = {
        testCase: testCase._id,
        status: caseStatus,
        passed: isCorrect,
        output: actualDisplay,           // Save original (trimmed) output for display
        expectedOutput: expectedDisplay, // Save original (trimmed) expectation
        executionTime: result.time || 0,
        errorMessage: result.status !== "OK" ? (result.error || result.status) : null
      };

      detailedResults.push(resultEntry);

      // FAIL FAST: If this case failed, stop judging and save result immediately
      if (!isCorrect) {
        let finalStatus = "wrong-answer";
        if (caseStatus === "TLE") finalStatus = "time-limit-exceeded";
        else if (caseStatus === "RUNTIME_ERROR") finalStatus = "runtime-error";

        submission.status = finalStatus;
        submission.testResults = detailedResults; // Save the failure details
        submission.executionStats = { passed: passedCount, total: testCases.length };
        await submission.save();
        console.log(`❌ Verdict: ${finalStatus} (${langKey})`);
        return; // Exit loop, do not run remaining cases
      }

    } catch (err) {
      console.error("Loop Error:", err);
      if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }

  // If loop finishes, ALL cases passed
  submission.status = "accepted";
  submission.testResults = detailedResults;
  submission.executionStats = { passed: passedCount, total: testCases.length };
  await submission.save();
  console.log(`✅ Verdict: ACCEPTED (${langKey})`);
}
