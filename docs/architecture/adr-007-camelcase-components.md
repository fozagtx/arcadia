# ADR-007: camelCase Component Naming Convention

## Status
Accepted

## Context
Arcadia needs consistent naming conventions for React components to ensure code readability, maintainability, and team productivity. Different naming conventions (PascalCase, camelCase, kebab-case) each have trade-offs.

## Decision
Adopt camelCase naming convention for all React components and related files with the following rules:

- **Component Names**: `adBriefGenerator`, `paymentModal`, `creatorDashboard`
- **File Names**: `adBriefGenerator.tsx`, `paymentModal.tsx`, `creatorDashboard.tsx`
- **Directory Names**: `components/adBrief/`, `components/payment/`, `components/creator/`
- **Export Names**: Named exports using camelCase matching file names

## Implementation Guidelines

### Component Naming Rules
```typescript
// ✅ Correct: camelCase component names
export function adBriefGenerator() { /* ... */ }
export function paymentSuccessModal() { /* ... */ }
export function creatorProfileCard() { /* ... */ }

// ❌ Incorrect: PascalCase
export function AdBriefGenerator() { /* ... */ }
export function PaymentSuccessModal() { /* ... */ }

// ❌ Incorrect: kebab-case
export function ad-brief-generator() { /* ... */ }
```

### File Structure
```
src/components/
├── adBrief/
│   ├── adBriefGenerator.tsx
│   ├── adBriefPreview.tsx
│   └── adBriefEditor.tsx
├── payment/
│   ├── paymentModal.tsx
│   ├── paymentHistory.tsx
│   └── paymentStatus.tsx
└── creator/
    ├── creatorProfile.tsx
    ├── creatorPortfolio.tsx
    └── creatorReviews.tsx
```

### Import/Export Patterns
```typescript
// Component file: adBriefGenerator.tsx
export function adBriefGenerator({ brief }: AdBriefProps) {
  return <div>...</div>;
}

// Usage in other files
import { adBriefGenerator } from '@/components/adBrief/adBriefGenerator';

// Re-exports from index files
export { adBriefGenerator } from './adBriefGenerator';
export { adBriefPreview } from './adBriefPreview';
```

### Naming Patterns

#### Feature-Based Naming
```typescript
// Brief generation feature
export function adBriefGenerator() { /* ... */ }
export function adBriefValidator() { /* ... */ }
export function adBriefOptimizer() { /* ... */ }

// Payment feature
export function paymentProcessor() { /* ... */ }
export function paymentVerifier() { /* ... */ }
export function paymentTracker() { /* ... */ }
```

#### Component Type Suffixes
```typescript
// Modal components
export function paymentModal() { /* ... */ }
export function confirmationModal() { /* ... */ }

// Form components
export function briefCreationForm() { /* ... */ }
export function creatorOnboardingForm() { /* ... */ }

// Card components
export function creatorProfileCard() { /* ... */ }
export function briefSummaryCard() { /* ... */ }
```

## Migration Strategy

### Existing Component Updates
1. **Phase 1**: Update component names in `src/components/`
2. **Phase 2**: Update all import statements throughout the app
3. **Phase 3**: Update file names to match component names
4. **Phase 4**: Update directory structure for consistency

### Automated Tooling
```bash
# Script to rename components systematically
find src/components -name "*.tsx" -exec rename 's/([A-Z])([a-z])/$1$2/g' {} \;

# Update import statements
find src -name "*.tsx" -exec sed -i 's/import { \([A-Z][a-zA-Z]*\) }/import { \l\1 }/g' {} \;
```

## Consequences

### Positive
- **Consistency**: Uniform naming across the entire codebase
- **Readability**: camelCase is familiar to JavaScript developers
- **Tooling**: Better autocomplete and search functionality
- **Maintainability**: Easier to refactor and navigate code

### Negative
- **Migration Cost**: Existing PascalCase components need updating
- **React Convention**: Deviates from common React PascalCase convention
- **Third-Party**: May conflict with external component library conventions
- **Team Alignment**: Requires team training on new convention

## Enforcement

### ESLint Rules
```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'function-declaration',
        unnamedComponents: 'function-expression'
      }
    ],
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'function',
        format: ['camelCase'],
        filter: {
          regex: '^[a-z].*Component$|^[a-z].*Modal$|^[a-z].*Form$',
          match: true
        }
      }
    ]
  }
};
```

### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### Pre-commit Hooks
```bash
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: component-naming
        name: Check component naming convention
        entry: scripts/check-component-naming.sh
        language: script
        files: '^src/components/.*\.tsx$'
```

## Component Examples

### Before (PascalCase)
```typescript
// components/AdBriefGenerator.tsx
export function AdBriefGenerator() {
  return <div>Generate ad briefs</div>;
}

// Import usage
import { AdBriefGenerator } from '@/components/AdBriefGenerator';
```

### After (camelCase)
```typescript
// components/adBrief/adBriefGenerator.tsx
export function adBriefGenerator() {
  return <div>Generate ad briefs</div>;
}

// Import usage
import { adBriefGenerator } from '@/components/adBrief/adBriefGenerator';
```

## Documentation Updates
- Update component documentation to reflect camelCase naming
- Update README examples and code snippets
- Update contributor guidelines
- Update TypeScript type definitions

## Timeline
- **Week 1**: Create migration scripts and update documentation
- **Week 2**: Migrate core components and update imports
- **Week 3**: Update remaining components and test thoroughly
- **Week 4**: Team training and enforcement setup