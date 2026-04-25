module.exports = {
  apps: [
    {
      name: "api-server",
      script: "src/server.js",
      instances: 1,
      exec_mode: "fork"
    },
    {
      name: "run-worker",
      script: "src/workers/runWorker.js",
      instances: 1,
      exec_mode: "fork"
    },
    {
      name: "submission-worker",
      script: "src/workers/submissionWorker.js",
      instances: 1, // Can increase this based on cores
      exec_mode: "fork"
    },
    {
      name: "ai-worker",
      script: "src/workers/aiWorker.js",
      instances: 1,
      exec_mode: "fork"
    }
  ]
};
