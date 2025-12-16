# Veo 3.1 Prompt Generation

Complete guide to AI-powered video prompt generation for Google's Veo 3.1 model.

## Overview

Arcadia generates optimized video prompts for Google's Veo 3.1 AI video generation model using advanced prompt engineering techniques powered by OpenAI's GPT-4o-mini model.

## Features

### Prompt Engineering Pipeline
- **Input Processing**: Brand info, product details, video specifications, target audience
- **AI Optimization**: GPT-4o-mini with specialized Veo 3.1 system prompts
- **Quality Scoring**: Automated quality assessment (0-100 scale)
- **Variant Generation**: Multiple prompt versions for A/B testing

### Payment Tiers

| Tier | Price | Features |
|------|-------|----------|
| **Basic** | 0.005 ETH (~$12) | Standard prompt, basic quality scoring |
| **Premium** | 0.01 ETH (~$24) | Multiple variants, advanced scoring, optimization tips |
| **Enterprise** | 0.025 ETH (~$60) | Brand-specific optimization, custom frameworks, extended variations |

## Technical Implementation

### API Endpoints

#### POST `/api/briefs/generate`
Generates Veo 3.1 optimized video prompts.

**Request Body:**
```typescript
interface VeoPromptRequest {
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
```

**Response:**
```typescript
interface GeneratedVeoPrompt {
  id: string;
  mainPrompt: string;        // Core Veo 3.1 prompt (optimized for <500 chars)
  visualStyle: string;       // Visual aesthetic description
  cameraWork: string;        // Camera movement and angles
  lighting: string;          // Lighting setup and mood
  characters: string;        // Character descriptions and actions
  productPlacement: string;  // Product integration strategy
  technicalSpecs: {
    duration: string;
    aspectRatio: string;
    fps: string;
  };
  optimizationTips: string[]; // Veo-specific optimization advice
  qualityScore: number;       // 0-100 quality assessment
}
```

### Quality Scoring Algorithm

The quality scoring system evaluates prompts across four dimensions:

#### Main Prompt Quality (30 points)
- **Length Optimization**: 100-400 characters optimal for Veo 3.1
- **Cinematic Terminology**: Professional camera and movement terms
- **Realistic Elements**: Human interactions, natural lighting, movement

#### Technical Completeness (25 points)
- **Camera Work**: Detailed shot descriptions and movements
- **Lighting**: Specific lighting setup and mood
- **Characters**: Realistic human actions and expressions

#### Visual Clarity (25 points)
- **Visual Style**: Comprehensive aesthetic description
- **Product Placement**: Clear product integration strategy

#### Veo Optimization (20 points)
- **Veo-Friendly Elements**: Smooth movement, natural motion, realistic expressions
- **Optimization Tips**: Additional guidance for best results

### Prompt Engineering Strategy

#### System Prompt for Veo 3.1
```
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
```

#### Validation Functions
- **Main Prompt**: 50-500 character validation, cinematic terminology check
- **Visual Style**: Comprehensive description validation
- **Camera Work**: Professional terminology and movement description
- **Lighting**: Mood and setup specification
- **Characters**: Realistic human interaction validation
- **Product Placement**: Advertising effectiveness validation

## Frontend Components

### VeoPromptGenerator
Main form component for gathering user input and initiating payment flow.

**Key Features:**
- Multi-step form with validation
- Dynamic array field management
- Integration with payment modal
- Real-time form state management

### PaymentModal
Handles payment tier selection and transaction processing.

**Payment Flow:**
1. User selects payment tier (Basic/Premium/Enterprise)
2. x402 payment request creation
3. Wallet transaction via wagmi/viem
4. Real-time payment status tracking

### PaymentStatusTracker
Real-time payment monitoring with automatic status updates.

**Features:**
- Polling-based status updates (3-second intervals)
- Transaction hash linking to block explorer
- Progress visualization
- Automatic prompt generation trigger on payment confirmation

## Integration with Blockchain Payments

### Payment-Triggered Generation
1. User completes form input
2. Payment modal opens with tier selection
3. x402 payment request created and stored in database
4. User authorizes blockchain transaction
5. Webhook receives payment confirmation
6. Veo prompt generation automatically triggered
7. Results stored and displayed to user

### Error Handling
- **Payment Failures**: Graceful error handling with retry options
- **Generation Failures**: Fallback strategies and user notification
- **Network Issues**: Automatic retries and user feedback
- **Validation Errors**: Real-time form validation and error messages

## Performance Optimizations

### Caching Strategy
- API response caching for similar prompts
- Form state persistence across sessions
- Payment status caching to reduce polling

### Cost Management
- Efficient OpenAI API usage with GPT-4o-mini
- Batch processing for multiple variants
- Smart retry logic for failed requests
- Token usage optimization

## Quality Assurance

### Testing Strategy
- Unit tests for validation functions
- Integration tests for payment flow
- E2E tests for complete user journey
- Load testing for concurrent prompt generation

### Monitoring
- API response time tracking
- OpenAI usage and cost monitoring
- Payment success/failure rates
- User conversion funnel analysis

## Usage Examples

### Basic E-commerce Product
```javascript
const request = {
  brandInfo: {
    name: "TechFlow",
    industry: "technology",
    brandColors: ["#007AFF", "#34C759"]
  },
  productDetails: {
    name: "Wireless Earbuds Pro",
    category: "Audio Technology",
    appearance: "Sleek white earbuds with LED indicators",
    keyFeatures: ["Noise cancellation", "24-hour battery", "Water resistant"],
    usageContext: "Daily commute, workouts, calls"
  },
  videoSpecs: {
    duration: "15s",
    aspectRatio: "16:9",
    style: "product-focused",
    mood: "professional"
  },
  targetAudience: {
    ageRange: "25-40",
    demographics: "Urban professionals",
    interests: ["Technology", "Fitness", "Productivity"]
  },
  campaignGoals: {
    primary: "product-demo",
    message: "Experience freedom with perfect sound"
  }
};
```

### Generated Veo Prompt Example
```json
{
  "mainPrompt": "Close-up of sleek white wireless earbuds emerging from charging case with blue LED glow, professional hand places them in ears, smooth camera tracking shot, urban office background, natural lighting, 15-second product demonstration",
  "visualStyle": "Clean, modern aesthetic with corporate professionalism. Crisp white product against neutral backgrounds with subtle blue accent lighting from brand colors.",
  "cameraWork": "Starts with macro close-up of earbuds in case, smooth tracking shot following hand movement, medium shot of user placing earbuds, final close-up of satisfied user",
  "lighting": "Soft, even lighting with subtle directional key light. Blue LED accent from product creates brand connection. Natural office lighting for authenticity",
  "characters": "Professional adult (25-40) in business casual attire, confident and focused expression, smooth natural movements placing earbuds",
  "productPlacement": "Hero product shot opening scene, clear brand visibility on earbuds and case, natural interaction showing ease of use, final shot emphasizes comfort fit",
  "technicalSpecs": {
    "duration": "15s",
    "aspectRatio": "16:9",
    "fps": "24"
  },
  "optimizationTips": [
    "Ensure LED indicators are visible but not overwhelming",
    "Use smooth, deliberate hand movements for clear product interaction",
    "Maintain consistent lighting to highlight product design"
  ],
  "qualityScore": 87
}
```