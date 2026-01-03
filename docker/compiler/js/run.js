const fs = require("fs");
const { exec } = require("child_process");

const CODE_FILE = "solution.js";
const INPUT_FILE = "input.txt";

// Read injected data
const sourceCode = fs.readFileSync("/app/code.js", "utf8");
const input = fs.readFileSync("/app/input.txt", "utf8");

// Write user code
fs.writeFileSync(CODE_FILE, sourceCode);

// Execute with timeout
const start = Date.now();

exec(
  `node ${CODE_FILE} < ${INPUT_FILE}`,
  { timeout: 2000, maxBuffer: 1024 * 1024 },
  (error, stdout, stderr) => {
    const end = Date.now();

    if (error) {
      if (error.killed) {
        return console.log(
          JSON.stringify({
            status: "TLE",
            time: end - start
          })
        );
      }

      return console.log(
        JSON.stringify({
          status: "RUNTIME_ERROR",
          error: stderr.toString()
        })
      );
    }

    console.log(
      JSON.stringify({
        status: "OK",
        output: stdout.trim(),
        time: end - start
      })
    );
  }
);
