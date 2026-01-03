import { exec } from 'child_process';
import fs from "fs";
import path from "path";
import Submission from "../../models/Submission.js";
import TestCase from "../../models/TestCase.js";

export async function runJavaScriptJudge(submissionId) {
  const submission = await Submission.findById(submissionId);
  const testCases = await TestCase.find({ content: submission.content });

  let passed = 0;

  for (const testCase of testCases) {
    const tempDir = `/tmp/${submissionId}-${Date.now()}`;
    fs.mkdirSync(tempDir);

    fs.writeFileSync(path.join(tempDir, "code.js"), submission.sourceCode);
    fs.writeFileSync(path.join(tempDir, "input.txt"), testCase.input);

    const cmd = `
      docker run --rm \
      -v ${tempDir}:/app \
      codezy-js-judge
    `;

    const result = await new Promise((resolve) => {
      exec(cmd, (err, stdout) => {
        if (err) return resolve({ status: "RUNTIME_ERROR" });
        resolve(JSON.parse(stdout));
      });
    });

    fs.rmSync(tempDir, { recursive: true, force: true });

    if (result.status !== "OK") {
      submission.status = result.status;
      await submission.save();
      return;
    }

    if (result.output !== testCase.output.trim()) {
      submission.status = "WRONG_ANSWER";
      await submission.save();
      return;
    }

    passed++;
  }

  submission.status = "ACCEPTED";
  submission.executionStats = {
    passed,
    total: testCases.length
  };

  await submission.save();
}
