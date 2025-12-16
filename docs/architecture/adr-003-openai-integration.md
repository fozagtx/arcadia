# ADR-003: OpenAI for Brief Generation

## Status
Accepted

## Context
Arcadia needs to generate high-quality UGC ad briefs from brand inputs. The core value proposition is AI-powered brief creation that saves brands time while maintaining creative quality.

## Decision
Use OpenAI API (GPT-4) as the primary AI service for brief generation with the following implementation:

- **API Integration**: Direct OpenAI API calls from Next.js API routes
- **Prompt Engineering**: Structured prompts optimized for UGC ad brief formats
- **Response Processing**: Parse and validate AI responses for completeness
- **Caching Strategy**: Cache similar brief requests to reduce API costs
- **Fallback System**: Graceful degradation with template-based generation

## Implementation Details

### API Route Structure
```typescript
// /api/briefs/generate
export async function POST(request: Request) {
  const { brandInfo, productDetails, targetAudience } = await request.json();

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: UGC_BRIEF_SYSTEM_PROMPT },
      { role: "user", content: formatBriefRequest(brandInfo, productDetails, targetAudience) }
    ],
    temperature: 0.7,
    max_tokens: 2000
  });

  return NextResponse.json(processBriefResponse(completion));
}
```

### Prompt Engineering Strategy
- **System Prompt**: Define UGC brief structure, tone, and requirements
- **User Prompt**: Structured input format with brand context
- **Output Format**: JSON schema for consistent brief structure
- **Validation**: Ensure all required brief elements are present

## Consequences

### Positive
- **Quality**: GPT-4 produces high-quality, contextual briefs
- **Speed**: Sub-30 second generation times
- **Scalability**: API handles concurrent requests well
- **Flexibility**: Easy to adjust prompts and iterate on output quality

### Negative
- **Cost**: Per-request API costs that scale with usage
- **Dependency**: External service dependency and rate limits
- **Variability**: AI responses may vary even with same inputs
- **Compliance**: Need to ensure generated content meets platform guidelines

## Monitoring
- Track API response times and error rates
- Monitor token usage and cost per brief
- Measure brief quality through user feedback scores
- Track API rate limit utilization

## Alternatives Considered
- **Local Models**: Higher infrastructure costs, lower quality
- **Other APIs**: Anthropic Claude (considered but OpenAI has better UGC training data)
- **Template System**: Faster but lacks personalization and creativity