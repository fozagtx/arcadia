# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Arcadia is a Next.js application for an AI-powered UGC (User-Generated Content) ad generation platform called "AdPrompt Studio" and "Arcads". The application helps brands create high-converting TikTok ad briefs using AI-powered workflows and blockchain-based micropayments.

## Development Commands

### Core Commands
- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm start` - Start production server

### Additional Tools
- TypeScript compilation: Configured in `tsconfig.json` with strict mode enabled
- Prettier formatting: Available via `prettier` dependency
- shadcn/ui components: Managed via `components.json` configuration

## Architecture and Structure

### Key Technologies
- **Next.js 14.2.23**: App Router architecture with React Server Components
- **TypeScript**: Strict typing enabled with path aliases (`@/*` → `./src/*`)
- **Tailwind CSS**: Utility-first CSS with custom design tokens and dark mode
- **shadcn/ui**: Component library based on Radix UI primitives
- **OpenAI API**: AI-powered brief generation and content optimization
- **x402 Protocol**: Micropayment system for instant creator compensation
- **Scroll ZK**: Layer 2 blockchain for low-cost, secure transactions
- **Supabase**: Database and authentication (SSR-enabled)

### Project Structure
```
src/
├── app/                    # Next.js App Router (pages and layouts)
│   ├── layout.tsx         # Root layout with theme provider
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles and CSS variables
│   ├── robots.ts          # SEO robots configuration
│   └── sitemap.ts         # Sitemap generation
├── components/
│   ├── ui/                # Reusable shadcn/ui components
│   ├── hero/              # Hero section components
│   ├── header.tsx         # Main header component
│   ├── header-base.tsx    # Base header component
│   ├── theme-provider.tsx # Theme context provider
│   └── theme-switcher.tsx # Dark/light mode toggle
└── lib/
    └── utils.ts           # Utility functions and class merging
```

### Design System

#### CSS Variables System
The application uses HSL-based CSS custom properties for consistent theming:
- Primary colors: `--primary`, `--primary-foreground`
- Secondary colors: `--secondary`, `--secondary-foreground`
- Semantic colors: `--destructive`, `--muted`, `--accent`
- Layout colors: `--background`, `--foreground`, `--border`

#### Component Architecture
- **shadcn/ui configuration**: Components use Radix UI primitives with Tailwind styling
- **Theme provider**: Wraps the entire app for dark/light mode support
- **Path aliases**: Use `@/components` and `@/lib/utils` for clean imports

#### Typography System
Custom typography configuration in `tempo.config.json` defines:
- Header hierarchy (H1-H4) with consistent font weights and tracking
- Body text styles (paragraph, lead text, small, muted)
- Code styles (inline code with proper spacing)
- Semantic styles (blockquotes with border styling)

### Key Dependencies

#### UI and Styling
- **Radix UI**: Accessible component primitives (@radix-ui/react-*)
- **Lucide React**: Icon system
- **class-variance-authority**: Type-safe component variants
- **tailwind-merge**: Intelligent class merging utility
- **next-themes**: Theme switching functionality

#### Business Logic
- **Supabase**: Database and auth with SSR support
- **Stripe**: Payment processing
- **React Hook Form**: Form handling
- **motion**: Animation library

## Development Guidelines

### Component Creation
- Use shadcn/ui components as base building blocks
- Follow the established pattern of separating UI components (`/ui`) from feature components
- Implement proper TypeScript types for all component props
- Use the established CSS variable system for consistent theming

### Styling Approach
- Use Tailwind utility classes with the configured design tokens
- Leverage CSS variables for colors rather than hardcoded values
- Follow the responsive design patterns established in the container configuration
- Use the `cn()` utility from `@/lib/utils` for conditional class merging

### State Management
- Use React Server Components where possible
- Implement client components with the `"use client"` directive when needed
- Use the ThemeProviderWrapper for theme state
- Consider Supabase for persistent data and authentication state

### SEO and Metadata
- Define proper metadata in page components using Next.js Metadata API
- Include relevant keywords and OpenGraph data
- Configure robots.txt and sitemap generation appropriately

## Advanced Customization: Hooks

Claude Code supports hooks that allow you to define programmatic actions when certain operations occur. This enables powerful automation workflows tailored to this project.

### Recommended Hook Configuration

Create a `.claude/settings.json` file in your home directory with the following configuration:

```json
{
  "permissions": {
    "allow": ["Bash(npx:*)", "Bash(npm:*)"],
    "deny": []
  },
  "hooks": {
    "Notification": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "echo '✅ Task completed'"
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
          }
        ]
      }
    ]
  }
}
```

### Automatic TypeScript Checking

Create `~/.claude/hooks/type_check.py` for automatic type checking after file edits:

```python
import json
import sys
import subprocess
import re

try:
    input_data = json.loads(sys.stdin.read())
except json.JSONDecodeError as e:
    print(f"Error: {e}")
    sys.exit(1)

tool_input = input_data.get("tool_input")
file_path = tool_input.get("file_path")

if re.search(r"\.(ts|tsx)$", file_path):
    try:
        subprocess.run(
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
    except subprocess.CalledProcessError as e:
        print("⚠️ TypeScript errors detected - please review", file=sys.stderr)
        if e.stdout:
            print(e.stdout, file=sys.stderr)
        if e.stderr:
            print(e.stderr, file=sys.stderr)
        sys.exit(2)
```

### Additional Hook Possibilities

Consider implementing these hooks for enhanced development workflow:

#### Build Validation Hook
```json
{
  "matcher": "Edit|MultiEdit|Write",
  "hooks": [
    {
      "type": "command",
      "command": "cd /home/devpima/Desktop/arcadia && npm run build --dry-run"
    }
  ]
}
```

#### Component Testing Hook
```json
{
  "matcher": "Write",
  "hooks": [
    {
      "type": "command",
      "command": "python ~/.claude/hooks/component_test.py"
    }
  ]
}
```

#### Prettier Formatting Hook
```json
{
  "matcher": "Edit|MultiEdit|Write",
  "hooks": [
    {
      "type": "command",
      "command": "cd /home/devpima/Desktop/arcadia && npx prettier --write ${tool_input.file_path}"
    }
  ]
}
```

These hooks will help maintain code quality by automatically:
- Type-checking TypeScript files after edits
- Running build validation
- Formatting code with Prettier
- Providing completion notifications

The hooks leverage the project's existing toolchain (TypeScript, Next.js build system, Prettier) to provide immediate feedback and maintain code quality standards.

## Documentation System

Arcadia uses a comprehensive documentation system for AI-assisted development:

### Architecture Documentation
- [System Overview](./docs/architecture/README.md) - Complete system architecture and principles
- [ADR-003: OpenAI Integration](./docs/architecture/adr-003-openai-integration.md) - AI brief generation
- [ADR-004: x402 Micropayments](./docs/architecture/adr-004-x402-micropayments.md) - Payment protocol
- [ADR-005: Scroll ZK Blockchain](./docs/architecture/adr-005-scroll-zk-blockchain.md) - Blockchain integration
- [ADR-007: camelCase Components](./docs/architecture/adr-007-camelcase-components.md) - Naming standards

### Feature Documentation
- [Product Requirements](./docs/features/PRD.md) - Complete product specification
- [Feature Implementation Status](./docs/implementation-log.md) - Live progress tracking

### Integration Guides
- [OpenAI API Integration](./docs/integrations/openai-api.md) - Complete implementation guide
- [x402 Payment Protocol](./docs/integrations/x402-payments.md) - Payment system setup
- [Scroll ZK Blockchain](./docs/integrations/scroll-zk.md) - Blockchain integration

### Development Guides
- [Development Hooks](./docs/guides/development-hooks.md) - Automated documentation maintenance
- [Component Standards](./docs/guides/components.md) - camelCase naming and patterns

## Component Naming Convention

**IMPORTANT**: All components use camelCase naming:
- ✅ `adBriefGenerator`, `paymentModal`, `creatorDashboard`
- ❌ `AdBriefGenerator`, `PaymentModal`, `CreatorDashboard`

File names should match component names: `adBriefGenerator.tsx`, `paymentModal.tsx`

## Key Development Patterns

### Brief Generation Flow
```typescript
User Input → OpenAI API → Generated Brief → Database Storage → UI Update
```

### Payment Flow
```typescript
Payment Request → x402 Protocol → Scroll ZK Transaction → Verification → Completion
```

### Component Development
1. Follow camelCase naming convention
2. Use shadcn/ui primitives as base
3. Implement proper TypeScript types
4. Leverage CSS variables for theming