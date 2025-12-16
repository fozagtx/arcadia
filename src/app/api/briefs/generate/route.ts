import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import {
  openai,
  VEO_PROMPT_SYSTEM_PROMPT,
  formatVeoPromptRequest,
  processVeoPromptResponse,
  calculateVeoPromptQuality,
  type VeoPromptRequest,
  type GeneratedVeoPrompt
} from '@/lib/openai';

// OpenAI API error handling
class OpenAIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'OpenAIError';
  }
}

// Validate Veo prompt request input
function validateVeoPromptRequest(body: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!body.brandInfo?.name) errors.push('Brand name is required');
  if (!body.brandInfo?.industry) errors.push('Industry is required');
  if (!body.brandInfo?.brandColors?.length) errors.push('Brand colors are required');
  if (!body.productDetails?.name) errors.push('Product name is required');
  if (!body.productDetails?.category) errors.push('Product category is required');
  if (!body.productDetails?.appearance) errors.push('Product appearance description is required');
  if (!body.videoSpecs?.duration) errors.push('Video duration is required');
  if (!body.videoSpecs?.aspectRatio) errors.push('Aspect ratio is required');
  if (!body.videoSpecs?.style) errors.push('Video style is required');
  if (!body.targetAudience?.ageRange) errors.push('Target age range is required');
  if (!body.campaignGoals?.primary) errors.push('Primary campaign goal is required');
  if (!body.campaignGoals?.message) errors.push('Campaign message is required');

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Handle OpenAI API errors
function handleOpenAIError(error: any): never {
  console.error('OpenAI API Error:', error);

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

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: VeoPromptRequest & {
      options?: {
        temperature?: number;
        variants?: number;
        focusArea?: 'visual' | 'technical' | 'cinematic';
      }
    } = await request.json();

    // Validate input
    const validation = validateVeoPromptRequest(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Format user prompt
    const userPrompt = formatVeoPromptRequest(body);

    // Configure generation options
    const temperature = body.options?.temperature || 0.7;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Using mini for cost efficiency
        messages: [
          { role: "system", content: VEO_PROMPT_SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        temperature: temperature,
        max_tokens: 2500, // More tokens for detailed Veo prompts
        response_format: { type: "json_object" }
      });

      // Process response
      const promptData = processVeoPromptResponse(
        completion.choices[0].message.content || '{}'
      );

      // Calculate quality score
      const qualityScore = calculateVeoPromptQuality(promptData);

      // Create complete prompt object
      const veoPrompt: GeneratedVeoPrompt = {
        id: uuidv4(),
        ...promptData,
        qualityScore
      };

      console.log('Veo prompt generation successful:', {
        promptId: veoPrompt.id,
        qualityScore,
        tokensUsed: completion.usage?.total_tokens,
        cost: calculateAPICost(completion.usage),
        mainPromptLength: veoPrompt.mainPrompt.length
      });

      return NextResponse.json({
        promptId: veoPrompt.id,
        veoPrompt: veoPrompt,
        timestamp: new Date().toISOString(),
        type: 'veo-prompt'
      });

    } catch (apiError: any) {
      handleOpenAIError(apiError);
    }

  } catch (error) {
    console.error('Veo prompt generation error:', error);

    if (error instanceof OpenAIError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate Veo prompt', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Calculate API cost estimation
function calculateAPICost(usage: any): number {
  if (!usage) return 0;

  const GPT4_MINI_INPUT_COST = 0.00015 / 1000; // $0.15 per 1M tokens
  const GPT4_MINI_OUTPUT_COST = 0.0006 / 1000; // $0.60 per 1M tokens

  return (
    (usage.prompt_tokens || 0) * GPT4_MINI_INPUT_COST +
    (usage.completion_tokens || 0) * GPT4_MINI_OUTPUT_COST
  );
}