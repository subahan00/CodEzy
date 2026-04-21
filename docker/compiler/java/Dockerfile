# docker/compiler/java/Dockerfile
# Uses full JDK (not JRE) so javac is available for compilation
FROM openjdk:21-alpine

# Security: non-root user
RUN addgroup -S judge && adduser -S judge -G judge

# Workspace is mounted at runtime via -v flag; no files baked in
WORKDIR /workspace

USER judge

# No ENTRYPOINT — the docker run command provides:
#   sh -c "javac /workspace/Main.java && java -cp /workspace Main"
# CMD is intentionally omitted so the run command controls execution.
