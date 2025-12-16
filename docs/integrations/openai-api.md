# OpenAI API Integration

## Overview

OpenAI API powers Arcadia's core brief generation feature, transforming brand inputs into optimized UGC ad briefs. This document covers implementation patterns, best practices, and troubleshooting.

## Authentication & Setup

### Environment Configuration
```bash
# .env.local
OPENAI_API_KEY=sk-proj-...
OPENAI_ORG_ID=org-...
OPENAI_PROJECT_ID=proj-...

# Optional: Rate limiting
OPENAI_MAX_REQUESTS_PER_MINUTE=60
OPENAI_MAX_TOKENS_PER_REQUEST=4000
```

### Client Configuration
```typescript
// lib/openai.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
  project: process.env.OPENAI_PROJECT_ID,
});

export { openai };
```

## Brief Generation Implementation

### System Prompt Design
```typescript
const UGC_BRIEF_SYSTEM_PROMPT = `
You are an expert UGC ad brief creator specializing in TikTok marketing. Generate compelling, conversion-focused briefs that:

1. Hook viewers in the first 3 seconds
2. Address specific pain points
3. Highlight unique benefits
4. Include clear call-to-action
5. Follow TikTok best practices

Output format: JSON with sections for hook, pain_points, benefits, cta, and creator_notes.

Style guidelines:
- Conversational, authentic tone
- Short, punchy sentences
- Platform-native language
- Avoid obvious sales language
`;
```

### API Route Implementation
```typescript
// app/api/briefs/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { validateBriefRequest, processBriefResponse } from '@/lib/brief-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brandInfo, productDetails, targetAudience, campaignGoals } = body;

    // Validate input
    const validation = validateBriefRequest(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors },
        { status: 400 }
      );
    }

    // Format user prompt
    const userPrompt = formatBriefRequest({
      brandInfo,
      productDetails,
      targetAudience,
      campaignGoals
    });

    // Generate brief
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: UGC_BRIEF_SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    // Process response
    const briefData = processBriefResponse(completion.choices[0].message.content);

    // Store in database
    const briefId = await saveBrief({
      ...briefData,
      brandId: body.brandId,
      status: 'draft'
    });

    return NextResponse.json({
      briefId,
      brief: briefData,
      usage: completion.usage
    });

  } catch (error) {
    console.error('Brief generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate brief' },
      { status: 500 }
    );
  }
}
```

### Prompt Engineering Patterns

#### Input Formatting
```typescript
function formatBriefRequest({
  brandInfo,
  productDetails,
  targetAudience,
  campaignGoals
}: BriefRequest): string {
  return `
Brand: ${brandInfo.name}
Industry: ${brandInfo.industry}
Brand Voice: ${brandInfo.voice}

Product: ${productDetails.name}
Category: ${productDetails.category}
Price: ${productDetails.price}
Key Features: ${productDetails.features.join(', ')}
USP: ${productDetails.uniqueSellingPoints}

Target Audience:
- Age: ${targetAudience.ageRange}
- Gender: ${targetAudience.gender}
- Interests: ${targetAudience.interests.join(', ')}
- Pain Points: ${targetAudience.painPoints.join(', ')}

Campaign Goals: ${campaignGoals.primary}
Success Metrics: ${campaignGoals.metrics.join(', ')}

Generate a TikTok UGC ad brief optimized for ${targetAudience.ageRange} ${targetAudience.gender} interested in ${targetAudience.interests[0]}.
  `;
}
```

#### Response Processing
```typescript
function processBriefResponse(content: string): ProcessedBrief {
  try {
    const parsed = JSON.parse(content);

    return {
      hook: validateHook(parsed.hook),
      painPoints: validatePainPoints(parsed.pain_points),
      benefits: validateBenefits(parsed.benefits),
      callToAction: validateCTA(parsed.cta),
      creatorNotes: validateNotes(parsed.creator_notes),
      estimatedDuration: parsed.estimated_duration || '30-60 seconds',
      suggestedProps: parsed.suggested_props || [],
      contentStyle: parsed.content_style || 'conversational'
    };
  } catch (error) {
    throw new Error(`Failed to parse brief response: ${error.message}`);
  }
}
```

## Optimization Strategies

### Caching System
```typescript
// lib/brief-cache.ts
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getCachedBrief(requestHash: string): Promise<ProcessedBrief | null> {
  const cached = await redis.get(`brief:${requestHash}`);
  return cached ? JSON.parse(cached) : null;
}

export async function setCachedBrief(
  requestHash: string,
  brief: ProcessedBrief,
  ttl = 3600 // 1 hour
): Promise<void> {
  await redis.setex(`brief:${requestHash}`, ttl, JSON.stringify(brief));
}

// Usage in API route
const requestHash = hashBriefRequest(body);
const cached = await getCachedBrief(requestHash);

if (cached) {
  return NextResponse.json({ brief: cached, cached: true });
}

// ... generate new brief and cache it
await setCachedBrief(requestHash, briefData);
```

### Rate Limiting
```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 m'), // 10 requests per 10 minutes
});

export async function checkRateLimit(userId: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(userId);

  return {
    success,
    limit,
    reset,
    remaining
  };
}
```

### Error Handling
```typescript
export class OpenAIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'OpenAIError';
  }
}

export async function handleOpenAIError(error: any): Promise<never> {
  if (error.type === 'invalid_request_error') {
    throw new OpenAIError(
      'Invalid request format',
      'INVALID_REQUEST',
      400
    );
  }

  if (error.type === 'rate_limit_exceeded') {
    throw new OpenAIError(
      'Rate limit exceeded, please try again later',
      'RATE_LIMIT_EXCEEDED',
      429
    );
  }

  if (error.type === 'insufficient_quota') {
    throw new OpenAIError(
      'API quota exceeded',
      'QUOTA_EXCEEDED',
      402
    );
  }

  throw new OpenAIError(
    'OpenAI API error',
    'UNKNOWN_ERROR',
    500
  );
}
```

## Quality Assurance

### Brief Validation
```typescript
export function validateBriefQuality(brief: ProcessedBrief): ValidationResult {
  const issues: string[] = [];

  // Hook validation
  if (!brief.hook || brief.hook.length < 10) {
    issues.push('Hook too short - needs to grab attention');
  }

  // Pain point validation
  if (!brief.painPoints || brief.painPoints.length === 0) {
    issues.push('Must address at least one pain point');
  }

  // CTA validation
  if (!brief.callToAction || !brief.callToAction.includes('action')) {
    issues.push('Call-to-action needs clear action verb');
  }

  // Length validation
  const totalLength = estimateBriefLength(brief);
  if (totalLength > 180) { // 3 minutes max
    issues.push('Brief content too long for TikTok format');
  }

  return {
    isValid: issues.length === 0,
    issues,
    score: calculateQualityScore(brief)
  };
}
```

### A/B Testing Framework
```typescript
export async function generateBriefVariants(
  baseRequest: BriefRequest,
  variantCount = 3
): Promise<ProcessedBrief[]> {
  const variants = await Promise.all(
    Array.from({ length: variantCount }, (_, i) =>
      generateBriefWithVariation(baseRequest, {
        temperature: 0.7 + (i * 0.1),
        focusArea: ['hook', 'benefits', 'cta'][i % 3]
      })
    )
  );

  return variants.map(variant => ({
    ...variant,
    variantId: generateVariantId()
  }));
}
```

## Monitoring & Analytics

### Usage Tracking
```typescript
export async function trackBriefGeneration(data: {
  userId: string;
  briefId: string;
  tokensUsed: number;
  generationTime: number;
  qualityScore: number;
}) {
  await analytics.track('Brief Generated', {
    userId: data.userId,
    briefId: data.briefId,
    tokensUsed: data.tokensUsed,
    generationTime: data.generationTime,
    qualityScore: data.qualityScore,
    timestamp: new Date().toISOString()
  });
}
```

### Cost Monitoring
```typescript
export function calculateAPICost(usage: OpenAI.Usage): number {
  const GPT4_INPUT_COST_PER_TOKEN = 0.03 / 1000; // $0.03 per 1k tokens
  const GPT4_OUTPUT_COST_PER_TOKEN = 0.06 / 1000; // $0.06 per 1k tokens

  return (
    usage.prompt_tokens * GPT4_INPUT_COST_PER_TOKEN +
    usage.completion_tokens * GPT4_OUTPUT_COST_PER_TOKEN
  );
}
```

## Testing Strategies

### Unit Tests
```typescript
// tests/openai.test.ts
import { formatBriefRequest, processBriefResponse } from '@/lib/brief-utils';

describe('Brief Generation', () => {
  test('formats request correctly', () => {
    const request = {
      brandInfo: { name: 'TestBrand', industry: 'Fashion' },
      productDetails: { name: 'Sneakers', price: '$99' },
      targetAudience: { ageRange: '18-25', interests: ['fashion'] },
      campaignGoals: { primary: 'awareness' }
    };

    const formatted = formatBriefRequest(request);

    expect(formatted).toContain('TestBrand');
    expect(formatted).toContain('Fashion');
    expect(formatted).toContain('Sneakers');
  });

  test('processes response correctly', () => {
    const mockResponse = JSON.stringify({
      hook: 'Stop scrolling if you love sneakers!',
      pain_points: ['Expensive shoes', 'Poor quality'],
      benefits: ['Affordable', 'Durable'],
      cta: 'Shop now and save 20%'
    });

    const processed = processBriefResponse(mockResponse);

    expect(processed.hook).toBe('Stop scrolling if you love sneakers!');
    expect(processed.painPoints).toHaveLength(2);
    expect(processed.benefits).toHaveLength(2);
  });
});
```

### Integration Tests
```typescript
// tests/api/briefs.test.ts
import { POST } from '@/app/api/briefs/generate/route';

describe('Brief Generation API', () => {
  test('generates brief successfully', async () => {
    const request = new Request('http://localhost/api/briefs/generate', {
      method: 'POST',
      body: JSON.stringify({
        brandInfo: { name: 'TestBrand' },
        productDetails: { name: 'Product' },
        targetAudience: { ageRange: '18-25' },
        campaignGoals: { primary: 'sales' }
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.brief).toBeDefined();
    expect(data.briefId).toBeDefined();
  });
});
```