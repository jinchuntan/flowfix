import type { AnalysisResult } from "./types";

const dockerScenario: AnalysisResult = {
  error_summary:
    "Application container failed to start because DATABASE_URL environment variable is not set, causing the database connection to be rejected at boot time.",
  workflow_summary:
    "A Dockerized web application attempts to connect to a PostgreSQL database on startup. The app reads DATABASE_URL from the environment to establish the connection before serving traffic.",
  root_cause_hypotheses: [
    {
      rank: 1,
      cause: "Missing DATABASE_URL environment variable in Docker container",
      confidence: "High",
      evidence:
        "Log shows: 'Error: DATABASE_URL is not defined' immediately after container start",
      recommended_check:
        "Check docker-compose.yml environment section and verify .env file exists",
    },
    {
      rank: 2,
      cause: ".env file not mounted or not present in the build context",
      confidence: "Medium",
      evidence: "No .env file referenced in Dockerfile COPY commands",
      recommended_check: "Run `docker-compose config` to inspect resolved env vars",
    },
    {
      rank: 3,
      cause: "Environment variable name mismatch between app and compose file",
      confidence: "Low",
      evidence: "Possible typo or casing difference in variable names",
      recommended_check: "Compare exact variable names in app code vs docker-compose.yml",
    },
  ],
  fix_runbook: [
    {
      step: 1,
      title: "Create or verify .env file",
      action: "Create a .env file in the project root with the required variables",
      command: "echo 'DATABASE_URL=postgres://user:pass@localhost:5432/mydb' >> .env",
    },
    {
      step: 2,
      title: "Update docker-compose.yml",
      action:
        "Add env_file or environment section to the service that references DATABASE_URL",
      command: "# Add under your service:\n# env_file:\n#   - .env",
    },
    {
      step: 3,
      title: "Rebuild and restart containers",
      action: "Bring containers down and back up to pick up new environment",
      command: "docker-compose down && docker-compose up --build",
    },
  ],
  verification_steps: [
    "docker-compose exec app printenv DATABASE_URL",
    "docker-compose logs app | grep -i 'connected\\|database'",
    "curl http://localhost:3000/health",
  ],
  prevention_tips: [
    "Add a startup check that validates all required env vars before the app initializes",
    "Keep a .env.example committed to the repo and add .env to .gitignore",
    "Use docker-compose --env-file flag to explicitly specify env files",
  ],
  markdown_report: `# FlowFix Debug Runbook

## Error Summary
Application container failed to start because \`DATABASE_URL\` environment variable is not set.

## Workflow Summary
A Dockerized web application attempts to connect to a PostgreSQL database on startup.

## Root Cause Hypotheses

| Rank | Cause | Confidence |
|------|-------|------------|
| 1 | Missing DATABASE_URL environment variable | High |
| 2 | .env file not mounted in container | Medium |
| 3 | Environment variable name mismatch | Low |

## Fix Runbook

### Step 1 — Create or verify .env file
\`\`\`bash
echo 'DATABASE_URL=postgres://user:pass@localhost:5432/mydb' >> .env
\`\`\`

### Step 2 — Update docker-compose.yml
Add \`env_file\` or \`environment\` section referencing DATABASE_URL.

### Step 3 — Rebuild and restart
\`\`\`bash
docker-compose down && docker-compose up --build
\`\`\`

## Verification
\`\`\`bash
docker-compose exec app printenv DATABASE_URL
docker-compose logs app | grep -i 'connected'
curl http://localhost:3000/health
\`\`\`

## Prevention
- Validate required env vars at startup
- Commit a .env.example; gitignore .env
- Use docker-compose --env-file flag explicitly
`,
};

const pythonScenario: AnalysisResult = {
  error_summary:
    "Python application crashed on import with ModuleNotFoundError. The package 'requests' is used in the code but not listed in requirements.txt, so it was never installed in the environment.",
  workflow_summary:
    "A Python script or web service attempts to import third-party packages at startup. The dependency management relies on requirements.txt for installation via pip.",
  root_cause_hypotheses: [
    {
      rank: 1,
      cause: "Package missing from requirements.txt",
      confidence: "High",
      evidence: "ModuleNotFoundError: No module named 'requests' — package not installed",
      recommended_check: "Compare imports in source files against requirements.txt",
    },
    {
      rank: 2,
      cause: "Wrong virtual environment activated",
      confidence: "Medium",
      evidence: "Package may be installed globally but not in the active venv",
      recommended_check: "Run `which python` and `pip list` to verify active environment",
    },
    {
      rank: 3,
      cause: "requirements.txt not installed after recent update",
      confidence: "Medium",
      evidence: "requirements.txt exists but pip install may not have been re-run",
      recommended_check: "Check pip install logs or re-run pip install -r requirements.txt",
    },
  ],
  fix_runbook: [
    {
      step: 1,
      title: "Install the missing package",
      action: "Install the missing dependency into the active environment",
      command: "pip install requests",
    },
    {
      step: 2,
      title: "Add to requirements.txt",
      action: "Pin the version and add to requirements.txt to prevent recurrence",
      command: "pip freeze | grep requests >> requirements.txt",
    },
    {
      step: 3,
      title: "Reinstall all dependencies cleanly",
      action: "Reinstall from requirements.txt to verify the full dependency set works",
      command: "pip install -r requirements.txt",
    },
  ],
  verification_steps: [
    "python -c \"import requests; print(requests.__version__)\"",
    "pip show requests",
    "python main.py",
  ],
  prevention_tips: [
    "Use pip-tools or poetry to manage dependencies with lock files",
    "Run pip install -r requirements.txt in CI before every test run",
    "Lint imports against requirements.txt with tools like deptry",
  ],
  markdown_report: `# FlowFix Debug Runbook

## Error Summary
Python crashed on import: \`ModuleNotFoundError: No module named 'requests'\`.

## Workflow Summary
A Python app imports third-party packages at startup, managed via requirements.txt.

## Root Cause Hypotheses

| Rank | Cause | Confidence |
|------|-------|------------|
| 1 | Package missing from requirements.txt | High |
| 2 | Wrong virtual environment activated | Medium |
| 3 | requirements.txt not reinstalled after update | Medium |

## Fix Runbook

### Step 1 — Install the missing package
\`\`\`bash
pip install requests
\`\`\`

### Step 2 — Add to requirements.txt
\`\`\`bash
pip freeze | grep requests >> requirements.txt
\`\`\`

### Step 3 — Reinstall all dependencies
\`\`\`bash
pip install -r requirements.txt
\`\`\`

## Verification
\`\`\`bash
python -c "import requests; print(requests.__version__)"
pip show requests
python main.py
\`\`\`

## Prevention
- Use pip-tools or poetry for lock-file dependency management
- Run pip install in CI before every test run
- Lint imports against requirements.txt with deptry
`,
};

const permissionScenario: AnalysisResult = {
  error_summary:
    "Shell script failed with 'Permission denied' when attempting to write to /var/log/app. The directory either doesn't exist or the process user lacks write permissions.",
  workflow_summary:
    "A shell script bootstraps an application by creating log directories and writing initial config. It runs as a non-root user in a Linux environment.",
  root_cause_hypotheses: [
    {
      rank: 1,
      cause: "Log directory does not exist and script assumes it does",
      confidence: "High",
      evidence: "bash: /var/log/app/startup.log: No such file or directory",
      recommended_check: "Run `ls -la /var/log/` to verify directory existence",
    },
    {
      rank: 2,
      cause: "Process user lacks write permission to target directory",
      confidence: "High",
      evidence: "Permission denied writing to /var/log/app — directory owned by root",
      recommended_check: "Run `ls -la /var/log/app` to check owner and permissions",
    },
    {
      rank: 3,
      cause: "Script not marked as executable",
      confidence: "Medium",
      evidence: "Permission denied when invoking the script itself",
      recommended_check: "Run `ls -la run.sh` and check for execute bit",
    },
  ],
  fix_runbook: [
    {
      step: 1,
      title: "Create the missing directory",
      action: "Create the log directory with appropriate ownership",
      command: "sudo mkdir -p /var/log/app && sudo chown $USER:$USER /var/log/app",
    },
    {
      step: 2,
      title: "Fix directory permissions",
      action: "Grant write permission to the application user",
      command: "sudo chmod 755 /var/log/app",
    },
    {
      step: 3,
      title: "Make the script executable",
      action: "Add execute permission to the shell script",
      command: "chmod +x run.sh",
    },
    {
      step: 4,
      title: "Re-run the script",
      action: "Execute the script and verify it completes without errors",
      command: "./run.sh",
    },
  ],
  verification_steps: [
    "ls -la /var/log/app",
    "touch /var/log/app/test.log && echo 'Write OK'",
    "./run.sh && echo 'Script OK'",
  ],
  prevention_tips: [
    "Add a preflight check in the script that creates directories if they don't exist",
    "Use `set -e` at the top of shell scripts to fail fast on any error",
    "Run scripts with the same user that will run in production during testing",
  ],
  markdown_report: `# FlowFix Debug Runbook

## Error Summary
Shell script failed: \`Permission denied\` writing to \`/var/log/app\`.

## Workflow Summary
A shell script bootstraps an application, creating log directories and config files.

## Root Cause Hypotheses

| Rank | Cause | Confidence |
|------|-------|------------|
| 1 | Log directory does not exist | High |
| 2 | Process user lacks write permission | High |
| 3 | Script not marked as executable | Medium |

## Fix Runbook

### Step 1 — Create the missing directory
\`\`\`bash
sudo mkdir -p /var/log/app && sudo chown $USER:$USER /var/log/app
\`\`\`

### Step 2 — Fix permissions
\`\`\`bash
sudo chmod 755 /var/log/app
\`\`\`

### Step 3 — Make script executable
\`\`\`bash
chmod +x run.sh
\`\`\`

### Step 4 — Re-run
\`\`\`bash
./run.sh
\`\`\`

## Verification
\`\`\`bash
ls -la /var/log/app
touch /var/log/app/test.log && echo 'Write OK'
./run.sh && echo 'Script OK'
\`\`\`

## Prevention
- Add preflight checks in scripts that create directories if missing
- Use \`set -e\` to fail fast on errors
- Test with the same user as production
`,
};

export const mockData: Record<string, AnalysisResult> = {
  docker: dockerScenario,
  python: pythonScenario,
  permission: permissionScenario,
};

export const scenarios = [
  {
    id: "docker",
    label: "Docker: Missing ENV",
    description: "Container fails — DATABASE_URL not set",
    log: `[2024-01-15 09:23:01] Starting application server...
[2024-01-15 09:23:01] Loading configuration...
[2024-01-15 09:23:01] Error: DATABASE_URL is not defined
[2024-01-15 09:23:01] Failed to connect to database: Connection refused
[2024-01-15 09:23:01] Application startup failed
[2024-01-15 09:23:01] Process exited with code 1`,
    repo: `# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    # Missing environment section

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: secret`,
  },
  {
    id: "python",
    label: "Python: ModuleNotFoundError",
    description: "Missing package not in requirements.txt",
    log: `Traceback (most recent call last):
  File "main.py", line 3, in <module>
    import requests
ModuleNotFoundError: No module named 'requests'

During handling of the above exception, another exception occurred:
  File "main.py", line 5, in <module>
    from utils import fetch_data
ImportError: cannot import name 'fetch_data'`,
    repo: `# requirements.txt
flask==2.3.2
sqlalchemy==2.0.1
python-dotenv==1.0.0
# requests is missing!

# main.py snippet
import requests
from flask import Flask
app = Flask(__name__)`,
  },
  {
    id: "permission",
    label: "Shell: Permission Denied",
    description: "Script fails — missing dir or bad permissions",
    log: `[bootstrap] Starting application setup...
[bootstrap] Creating log directory...
bash: /var/log/app/startup.log: No such file or directory
./run.sh: line 12: /var/log/app/startup.log: Permission denied
[bootstrap] FATAL: Cannot write to log file
[bootstrap] Exiting with status 1`,
    repo: `#!/bin/bash
# run.sh
set -u

APP_DIR=/var/log/app
LOG_FILE=$APP_DIR/startup.log

echo "Starting..." > $LOG_FILE
mkdir -p /app/data
cp config/default.json /app/config.json
node server.js`,
  },
];
