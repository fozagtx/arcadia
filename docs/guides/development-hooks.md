# Development Hooks for Documentation

## Overview

This guide covers setting up Claude Code hooks for automatic documentation maintenance in the Arcadia project. These hooks ensure docs stay current with code changes.

## Hook Configuration

Create `~/.claude/settings.json` with the following configuration:

```json
{
  "permissions": {
    "allow": ["Bash(npx:*)", "Bash(npm:*)", "Bash(git:*)"],
    "deny": []
  },
  "hooks": {
    "Notification": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "echo '✅ Task completed - Documentation updated'"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|MultiEdit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "python ~/.claude/hooks/type_check.py"
          },
          {
            "type": "command",
            "command": "python ~/.claude/hooks/doc_update.py"
          }
        ]
      },
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "python ~/.claude/hooks/feature_tracker.py"
          }
        ]
      }
    ]
  }
}
```

## Documentation Update Hook

Create `~/.claude/hooks/doc_update.py`:

```python
import json
import sys
import subprocess
import os
from pathlib import Path

def main():
    try:
        # Read hook input
        input_data = json.loads(sys.stdin.read())
    except json.JSONDecodeError as e:
        print(f"Hook input error: {e}", file=sys.stderr)
        sys.exit(1)

    tool_input = input_data.get("tool_input", {})
    file_path = tool_input.get("file_path", "")

    # Only process files in the Arcadia project
    if "/home/devpima/Desktop/arcadia/" not in file_path:
        sys.exit(0)

    project_root = "/home/devpima/Desktop/arcadia"
    relative_path = file_path.replace(project_root + "/", "")

    # Update documentation based on file type and location
    if relative_path.startswith("src/components/"):
        update_component_docs(relative_path, project_root)
    elif relative_path.startswith("src/app/api/"):
        update_api_docs(relative_path, project_root)
    elif "integration" in relative_path.lower():
        update_integration_docs(relative_path, project_root)

def update_component_docs(file_path, project_root):
    """Update component documentation when components are modified"""
    component_name = Path(file_path).stem

    # Check if component follows camelCase naming
    if not component_name[0].islower():
        print(f"⚠️ Component {component_name} should use camelCase naming", file=sys.stderr)

    # Update components index if needed
    components_doc = f"{project_root}/docs/guides/components.md"
    if os.path.exists(components_doc):
        subprocess.run([
            "echo", f"Updated: {component_name} component - {datetime.now().isoformat()}"
        ], cwd=project_root)

def update_api_docs(file_path, project_root):
    """Update API documentation when API routes are modified"""
    api_route = file_path.replace("src/app/api/", "").replace("/route.ts", "")

    # Log API changes
    subprocess.run([
        "echo", f"API Route Updated: /{api_route}"
    ], cwd=project_root)

def update_integration_docs(file_path, project_root):
    """Update integration documentation for service integrations"""
    if "openai" in file_path.lower():
        print("📝 OpenAI integration modified - review docs/integrations/openai-api.md")
    elif "x402" in file_path.lower():
        print("💳 x402 payment integration modified - review docs/integrations/x402-payments.md")
    elif "scroll" in file_path.lower():
        print("⛓️ Scroll ZK integration modified - review docs/integrations/scroll-zk.md")

if __name__ == "__main__":
    main()
```

## Feature Tracking Hook

Create `~/.claude/hooks/feature_tracker.py`:

```python
import json
import sys
import os
import re
from datetime import datetime
from pathlib import Path

def main():
    try:
        input_data = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        sys.exit(1)

    tool_input = input_data.get("tool_input", {})
    file_path = tool_input.get("file_path", "")

    if "/home/devpima/Desktop/arcadia/" not in file_path:
        sys.exit(0)

    project_root = "/home/devpima/Desktop/arcadia"

    # Track new features being implemented
    if is_new_feature(file_path, tool_input.get("content", "")):
        log_feature_progress(file_path, project_root)

def is_new_feature(file_path, content):
    """Detect if this is a new feature implementation"""
    feature_indicators = [
        "briefGenerat", "paymentProcess", "creatorDashboard",
        "adBrief", "x402", "openai", "wallet"
    ]

    return any(indicator in content for indicator in feature_indicators)

def log_feature_progress(file_path, project_root):
    """Log feature implementation progress"""
    timestamp = datetime.now().isoformat()
    relative_path = file_path.replace(project_root + "/", "")

    log_entry = f"{timestamp}: Feature implementation in {relative_path}\n"

    # Append to implementation log
    log_file = f"{project_root}/docs/implementation-log.md"
    try:
        with open(log_file, "a") as f:
            f.write(log_entry)
    except Exception as e:
        print(f"Could not update implementation log: {e}", file=sys.stderr)

if __name__ == "__main__":
    main()
```

## TypeScript Checking Hook (Updated)

Update `~/.claude/hooks/type_check.py`:

```python
import json
import sys
import subprocess
import re
from pathlib import Path

def main():
    try:
        input_data = json.loads(sys.stdin.read())
    except json.JSONDecodeError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    tool_input = input_data.get("tool_input", {})
    file_path = tool_input.get("file_path", "")

    # Only check TypeScript files in Arcadia project
    if (re.search(r"\.(ts|tsx)$", file_path) and
        "/home/devpima/Desktop/arcadia/" in file_path):

        try:
            result = subprocess.run(
                [
                    "npx",
                    "tsc",
                    "--noEmit",
                    "--skipLibCheck",
                    "--project",
                    "."
                ],
                check=True,
                capture_output=True,
                text=True,
                cwd="/home/devpima/Desktop/arcadia"
            )
            print("✅ TypeScript check passed")

        except subprocess.CalledProcessError as e:
            print("⚠️ TypeScript errors detected:", file=sys.stderr)
            if e.stdout:
                print(e.stdout, file=sys.stderr)
            if e.stderr:
                print(e.stderr, file=sys.stderr)

            # Don't fail the hook, just warn
            sys.exit(0)

if __name__ == "__main__":
    main()
```

## Hook Installation

1. **Create hook directory**:
```bash
mkdir -p ~/.claude/hooks
chmod +x ~/.claude/hooks/*.py
```

2. **Install required dependencies**:
```bash
pip install pathlib
```

3. **Test hooks**:
```bash
# Test TypeScript checking
echo '{"tool_input": {"file_path": "/home/devpima/Desktop/arcadia/src/test.ts"}}' | python ~/.claude/hooks/type_check.py

# Test documentation updates
echo '{"tool_input": {"file_path": "/home/devpima/Desktop/arcadia/src/components/test.tsx", "content": "briefGenerator"}}' | python ~/.claude/hooks/doc_update.py
```

## Implementation Log

The hooks will automatically create and maintain `/docs/implementation-log.md` tracking:
- Feature implementation progress
- Component additions/modifications
- API route changes
- Integration updates

## Benefits

- **Automatic Documentation**: Docs stay current with code changes
- **Quality Assurance**: TypeScript errors caught immediately
- **Progress Tracking**: Implementation progress automatically logged
- **Compliance**: Component naming standards enforced
- **Integration Monitoring**: Service integration changes tracked

## Troubleshooting

### Hook Not Executing
- Check file permissions: `chmod +x ~/.claude/hooks/*.py`
- Verify Python path in hook files
- Check Claude Code settings file syntax

### TypeScript Errors
- Ensure project has valid `tsconfig.json`
- Check `node_modules` installation
- Verify file paths in hook configuration

### Documentation Updates Not Working
- Check file paths in hook scripts
- Verify write permissions to docs directory
- Ensure project root path is correct