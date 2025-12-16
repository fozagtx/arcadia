# Architecture Documentation

This directory contains Architecture Decision Records (ADRs) and architectural documentation for Arcadia.

## System Overview

Arcadia is built as an AI-powered Veo 3.1 video prompt generation platform with blockchain micropayments:

```
┌─────────────────────────────────────────────────────────┐
│                Frontend (Next.js App Router)            │
├─────────────────────────────────────────────────────────┤
│  React Server    │  shadcn/ui      │  Tailwind CSS     │
│  Components      │  (Radix UI)     │  + CSS Variables  │
├─────────────────────────────────────────────────────────┤
│                API Layer (Next.js API Routes)           │
├─────────────────────────────────────────────────────────┤
│              External Service Integration               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   OpenAI    │  │    x402     │  │  Scroll ZK  │     │
│  │   (AI)      │  │(Micropay)   │  │ (Blockchain)│     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              Supabase Backend                      │ │
│  │    Database │ Auth │ Storage │ Real-time           │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Architecture Decision Records (ADRs)

- [ADR-001: Next.js App Router Architecture](./adr-001-nextjs-app-router.md)
- [ADR-002: shadcn/ui Component System](./adr-002-shadcn-ui-components.md)
- [ADR-003: OpenAI for Veo Prompt Generation](./adr-003-openai-integration.md)
- [ADR-004: x402 Micropayment Protocol](./adr-004-x402-micropayments.md)
- [ADR-005: Scroll ZK Blockchain Integration](./adr-005-scroll-zk-blockchain.md)
- [ADR-006: CSS Variables Design System](./adr-006-css-variables-design.md)
- [ADR-007: camelCase Component Naming](./adr-007-camelcase-components.md)

## Key Architectural Principles

1. **AI-First Design**: OpenAI integration for Veo 3.1 prompt engineering as core feature
2. **Blockchain Native**: Built for crypto micropayments with x402 protocol from ground up
3. **Component Composition**: Reusable shadcn/ui primitives with camelCase naming
4. **Type Safety**: Strict TypeScript throughout the application
5. **Server-First**: Leverage React Server Components for performance
6. **Design System**: Consistent theming with CSS variables
7. **Micropayment Ready**: x402 protocol for instant, low-cost video prompt generation
8. **Web3 Integration**: Native wallet connectivity with wagmi/viem
9. **Real-time Updates**: Payment status tracking with polling and webhooks

## Data Flow Architecture

### Veo Prompt Generation Flow
```
User Input → Payment Verification → Next.js API → OpenAI API → Generated Veo Prompt → Database → UI Update
```

### Payment Flow
```
Payment Request → x402 Protocol → Scroll ZK Blockchain → Confirmation → Database Update
```

### User Workflow
```
Form Input → Payment Modal → x402 Blockchain Transaction → Prompt Generation → Veo 3.1 Output
```

## Security Architecture

- **Frontend**: Input validation, XSS protection
- **API**: Rate limiting, authentication, data validation
- **Payments**: Non-custodial wallets, secure key management
- **Database**: Row-level security, encrypted sensitive data
- **Blockchain**: Smart contract security, gas optimization

## Scalability Considerations

- **Frontend**: Static generation, edge caching, code splitting
- **API**: Serverless functions, connection pooling
- **AI**: Request caching, rate limit handling, fallback strategies
- **Payments**: L2 blockchain for lower costs, batching capabilities
- **Database**: Read replicas, connection pooling, query optimization