// docker/compiler/js/run.js
const fs = require("fs");
const { exec } = require("child_process");

const CODE_FILE = "/workspace/code.js";
const INPUT_FILE = "/workspace/input.txt";

let input = "";
try {
  input = fs.readFileSync(INPUT_FILE, "utf8");
} catch {
  // input may be empty
}

const start = Date.now();

exec(
  `node ${CODE_FILE} < ${INPUT_FILE}`,
  { timeout: 2000, maxBuffer: 1024 * 1024 },
  (error, stdout, stderr) => {
    const time = Date.now() - start;

    if (error) {
      if (error.killed) {
        return console.log(JSON.stringify({ status: "TLE", time }));
      }

      return console.log(
        JSON.stringify({ status: "RUNTIME_ERROR", error: stderr })
      );
    }

    console.log(
      JSON.stringify({
        status: "OK",
        output: stdout.trim(),
        time
      })
    );
  }
);
