import OpenAI from 'openai';

// OpenAI client configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
  project: process.env.OPENAI_PROJECT_ID,
});

// System prompt for Veo 3.1 video prompt generation
export const VEO_PROMPT_SYSTEM_PROMPT = `
You are an expert AI video prompt engineer specializing in creating optimized prompts for Google's Veo 3.1 video generation model. Generate compelling, detailed prompts for advertising videos that:

1. Specify clear visual scenes and camera movements for engaging video content
2. Include specific lighting, mood, and aesthetic directions
3. Define character actions, expressions, and product interactions
4. Incorporate brand elements and product placement naturally
5. Optimize for advertising effectiveness and audience engagement

Output format: JSON with sections for mainPrompt, visualStyle, cameraWork, lighting, characters, productPlacement, and technicalSpecs.

Prompt guidelines for Veo 3.1:
- Be specific about visual elements, lighting, and camera angles
- Include temporal descriptions (beginning, middle, end of video)
- Specify realistic human movements and expressions
- Detail product visibility and interaction
- Use cinematic terminology for professional results
- Keep prompts under 500 characters for optimal Veo performance
- Focus on achievable, realistic scenarios that Veo can render well

Always ensure prompts are optimized for Veo 3.1's strengths in realistic human motion, lighting, and product integration.
`;

// Veo prompt request interface
export interface VeoPromptRequest {
  brandInfo: {
    name: string;
    industry: string;
    brandColors: string[];
    logoDescription?: string;
  };
  productDetails: {
    name: string;
    category: string;
    appearance: string;
    keyFeatures: string[];
    usageContext: string;
  };
  videoSpecs: {
    duration: '5s' | '10s' | '15s' | '30s';
    aspectRatio: '16:9' | '9:16' | '1:1';
    style: 'cinematic' | 'casual' | 'product-focused' | 'lifestyle';
    mood: 'energetic' | 'calm' | 'dramatic' | 'playful' | 'professional';
  };
  targetAudience: {
    ageRange: string;
    demographics: string;
    interests: string[];
  };
  campaignGoals: {
    primary: 'brand-awareness' | 'product-demo' | 'emotional-connection' | 'call-to-action';
    message: string;
  };
}

// Generated Veo prompt interface
export interface GeneratedVeoPrompt {
  id: string;
  mainPrompt: string;
  visualStyle: string;
  cameraWork: string;
  lighting: string;
  characters: string;
  productPlacement: string;
  technicalSpecs: {
    duration: string;
    aspectRatio: string;
    fps: string;
  };
  optimizationTips: string[];
  qualityScore: number;
}

// Format Veo prompt request for OpenAI
export function formatVeoPromptRequest(request: VeoPromptRequest): string {
  return `
Brand: ${request.brandInfo.name}
Industry: ${request.brandInfo.industry}
Brand Colors: ${request.brandInfo.brandColors.join(', ')}
${request.brandInfo.logoDescription ? `Logo: ${request.brandInfo.logoDescription}` : ''}

Product: ${request.productDetails.name}
Category: ${request.productDetails.category}
Appearance: ${request.productDetails.appearance}
Key Features: ${request.productDetails.keyFeatures.join(', ')}
Usage Context: ${request.productDetails.usageContext}

Video Specifications:
- Duration: ${request.videoSpecs.duration}
- Aspect Ratio: ${request.videoSpecs.aspectRatio}
- Style: ${request.videoSpecs.style}
- Mood: ${request.videoSpecs.mood}

Target Audience:
- Age: ${request.targetAudience.ageRange}
- Demographics: ${request.targetAudience.demographics}
- Interests: ${request.targetAudience.interests.join(', ')}

Campaign Goal: ${request.campaignGoals.primary}
Key Message: ${request.campaignGoals.message}

Generate an optimized Veo 3.1 video prompt for creating a ${request.videoSpecs.duration} ${request.videoSpecs.style} advertisement targeting ${request.targetAudience.ageRange} ${request.targetAudience.demographics}.

The video should showcase ${request.productDetails.name} in a ${request.videoSpecs.mood} way that emphasizes ${request.productDetails.keyFeatures[0]} and conveys the message: "${request.campaignGoals.message}".

Focus on realistic human interactions, clear product visibility, and cinematic quality that Veo 3.1 can render effectively.
  `.trim();
}

// Process OpenAI response into structured Veo prompt
export function processVeoPromptResponse(content: string): Omit<GeneratedVeoPrompt, 'id' | 'qualityScore'> {
  try {
    const parsed = JSON.parse(content);

    return {
      mainPrompt: validateMainPrompt(parsed.mainPrompt),
      visualStyle: validateVisualStyle(parsed.visualStyle),
      cameraWork: validateCameraWork(parsed.cameraWork),
      lighting: validateLighting(parsed.lighting),
      characters: validateCharacters(parsed.characters),
      productPlacement: validateProductPlacement(parsed.productPlacement),
      technicalSpecs: {
        duration: parsed.technicalSpecs?.duration || '30s',
        aspectRatio: parsed.technicalSpecs?.aspectRatio || '16:9',
        fps: parsed.technicalSpecs?.fps || '24'
      },
      optimizationTips: parsed.optimizationTips || []
    };
  } catch (error) {
    throw new Error(`Failed to parse Veo prompt response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Validation functions for Veo prompts
function validateMainPrompt(prompt: string): string {
  if (!prompt || prompt.length < 50) {
    throw new Error('Main prompt too short - needs detailed scene description');
  }
  if (prompt.length > 500) {
    throw new Error('Main prompt too long - Veo 3.1 works best with concise prompts under 500 characters');
  }
  return prompt.trim();
}

function validateVisualStyle(style: string): string {
  if (!style || style.length < 10) {
    throw new Error('Visual style description too short');
  }
  return style.trim();
}

function validateCameraWork(cameraWork: string): string {
  if (!cameraWork || cameraWork.length < 10) {
    throw new Error('Camera work description needed for proper video generation');
  }
  return cameraWork.trim();
}

function validateLighting(lighting: string): string {
  if (!lighting || lighting.length < 5) {
    throw new Error('Lighting description required');
  }
  return lighting.trim();
}

function validateCharacters(characters: string): string {
  if (!characters || characters.length < 10) {
    throw new Error('Character description needed for realistic human generation');
  }
  return characters.trim();
}

function validateProductPlacement(placement: string): string {
  if (!placement || placement.length < 10) {
    throw new Error('Product placement description required for advertising effectiveness');
  }
  return placement.trim();
}

// Calculate Veo prompt quality score
export function calculateVeoPromptQuality(prompt: Omit<GeneratedVeoPrompt, 'id' | 'qualityScore'>): number {
  let score = 0;

  // Main prompt quality (30 points)
  score += evaluateMainPrompt(prompt.mainPrompt);

  // Technical completeness (25 points)
  score += evaluateTechnicalSpecs(prompt);

  // Visual clarity (25 points)
  score += evaluateVisualElements(prompt);

  // Veo optimization (20 points)
  score += evaluateVeoOptimization(prompt);

  return Math.min(100, score);
}

function evaluateMainPrompt(mainPrompt: string): number {
  let score = 0;

  // Length optimization for Veo
  if (mainPrompt.length >= 100 && mainPrompt.length <= 400) score += 10;

  // Cinematic terminology
  if (/\b(close-up|wide shot|medium shot|tracking|dolly|crane|establishing)\b/i.test(mainPrompt)) score += 10;

  // Realistic elements (Veo strength)
  if (/\b(natural lighting|realistic|human|interaction|movement)\b/i.test(mainPrompt)) score += 10;

  return Math.min(30, score);
}

function evaluateTechnicalSpecs(prompt: Omit<GeneratedVeoPrompt, 'id' | 'qualityScore'>): number {
  let score = 0;

  if (prompt.cameraWork && prompt.cameraWork.length > 20) score += 8;
  if (prompt.lighting && prompt.lighting.length > 10) score += 8;
  if (prompt.characters && prompt.characters.length > 20) score += 9;

  return Math.min(25, score);
}

function evaluateVisualElements(prompt: Omit<GeneratedVeoPrompt, 'id' | 'qualityScore'>): number {
  let score = 0;

  if (prompt.visualStyle && prompt.visualStyle.length > 15) score += 10;
  if (prompt.productPlacement && prompt.productPlacement.length > 20) score += 15;

  return Math.min(25, score);
}

function evaluateVeoOptimization(prompt: Omit<GeneratedVeoPrompt, 'id' | 'qualityScore'>): number {
  let score = 0;

  // Check for Veo-friendly elements
  const veoFriendly = /\b(smooth movement|natural motion|realistic expressions|clear product visibility|professional lighting)\b/i;
  const mainPromptOptimized = veoFriendly.test(prompt.mainPrompt);
  const visualStyleOptimized = veoFriendly.test(prompt.visualStyle);

  if (mainPromptOptimized) score += 10;
  if (visualStyleOptimized) score += 5;
  if (prompt.optimizationTips && prompt.optimizationTips.length > 0) score += 5;

  return Math.min(20, score);
}

export { openai };