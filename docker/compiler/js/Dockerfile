
FROM node:18-alpine

# Security: non-root user
RUN addgroup -S judge && adduser -S judge -G judge

# Executor location (DO NOT MOUNT HERE)
WORKDIR /judge
COPY run.js .

# Workspace for user code (THIS is mounted)
WORKDIR /workspace

USER judge

ENTRYPOINT ["node", "/judge/run.js"]
