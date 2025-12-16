'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PaymentModal } from '@/components/payments/paymentModal';
import { PaymentStatusTracker } from '@/components/payments/paymentStatusTracker';
import { Sparkles, Video, Palette, Clock, Users, Target } from 'lucide-react';
import { toast } from 'sonner';

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

interface GeneratedVeoPrompt {
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

export function VeoPromptGenerator() {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<GeneratedVeoPrompt | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<VeoPromptRequest>({
    defaultValues: {
      brandInfo: {
        name: '',
        industry: '',
        brandColors: [''],
        logoDescription: ''
      },
      productDetails: {
        name: '',
        category: '',
        appearance: '',
        keyFeatures: [''],
        usageContext: ''
      },
      videoSpecs: {
        duration: '30s',
        aspectRatio: '16:9',
        style: 'cinematic',
        mood: 'professional'
      },
      targetAudience: {
        ageRange: '',
        demographics: '',
        interests: ['']
      },
      campaignGoals: {
        primary: 'brand-awareness',
        message: ''
      }
    }
  });

  // Watch form values for validation
  const formValues = watch();

  // Add/remove array fields
  const addArrayField = (fieldName: keyof VeoPromptRequest, arrayKey: string) => {
    const currentValues = formValues[fieldName] as any;
    const currentArray = currentValues[arrayKey] || [];
    setValue(`${fieldName}.${arrayKey}` as any, [...currentArray, '']);
  };

  const removeArrayField = (fieldName: keyof VeoPromptRequest, arrayKey: string, index: number) => {
    const currentValues = formValues[fieldName] as any;
    const currentArray = currentValues[arrayKey] || [];
    const newArray = currentArray.filter((_: any, i: number) => i !== index);
    setValue(`${fieldName}.${arrayKey}` as any, newArray);
  };

  // Handle payment success
  const handlePaymentSuccess = async (paymentId: string) => {
    setCurrentPaymentId(paymentId);
    setIsGenerating(true);
    toast.success('Payment confirmed! Generating your Veo prompt...');
  };

  // Handle form submission (opens payment modal)
  const onSubmit = (data: VeoPromptRequest) => {
    console.log('Form data:', data);
    setIsPaymentModalOpen(true);
  };

  // Mock brand ID for demo (in real app, get from auth)
  const MOCK_BRAND_ID = 'brand_demo_123';

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Veo 3.1 Prompt Generator</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Create AI-optimized video prompts for Google's Veo 3.1 model.
          Generate professional advertising content with blockchain-powered payments.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Brand Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Brand Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand Name *</Label>
                <Input
                  id="brandName"
                  {...register('brandInfo.name', { required: 'Brand name is required' })}
                  placeholder="Enter your brand name"
                />
                {errors.brandInfo?.name && (
                  <p className="text-sm text-destructive">{errors.brandInfo.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Select onValueChange={(value) => setValue('brandInfo.industry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="fashion">Fashion</SelectItem>
                    <SelectItem value="food-beverage">Food & Beverage</SelectItem>
                    <SelectItem value="automotive">Automotive</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Brand Colors *</Label>
                {formValues.brandInfo.brandColors.map((color, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      {...register(`brandInfo.brandColors.${index}` as const)}
                      placeholder="e.g., #FF0000, blue, warm red"
                    />
                    {formValues.brandInfo.brandColors.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayField('brandInfo', 'brandColors', index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayField('brandInfo', 'brandColors')}
                >
                  Add Color
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoDescription">Logo Description</Label>
                <Textarea
                  id="logoDescription"
                  {...register('brandInfo.logoDescription')}
                  placeholder="Describe your logo (optional)"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Product Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name *</Label>
                <Input
                  id="productName"
                  {...register('productDetails.name', { required: 'Product name is required' })}
                  placeholder="Enter your product name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="productCategory">Category *</Label>
                <Input
                  id="productCategory"
                  {...register('productDetails.category', { required: 'Category is required' })}
                  placeholder="e.g., Smartphone, Sneakers, Coffee"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="appearance">Product Appearance *</Label>
                <Textarea
                  id="appearance"
                  {...register('productDetails.appearance', { required: 'Appearance description is required' })}
                  placeholder="Describe how the product looks, its design, materials, etc."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Key Features *</Label>
                {formValues.productDetails.keyFeatures.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      {...register(`productDetails.keyFeatures.${index}` as const)}
                      placeholder="Enter a key feature"
                    />
                    {formValues.productDetails.keyFeatures.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayField('productDetails', 'keyFeatures', index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayField('productDetails', 'keyFeatures')}
                >
                  Add Feature
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="usageContext">Usage Context *</Label>
                <Textarea
                  id="usageContext"
                  {...register('productDetails.usageContext', { required: 'Usage context is required' })}
                  placeholder="Describe when and how the product is used"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Video Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Video Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select onValueChange={(value) => setValue('videoSpecs.duration', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5s">5 seconds</SelectItem>
                      <SelectItem value="10s">10 seconds</SelectItem>
                      <SelectItem value="15s">15 seconds</SelectItem>
                      <SelectItem value="30s">30 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Aspect Ratio</Label>
                  <Select onValueChange={(value) => setValue('videoSpecs.aspectRatio', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ratio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                      <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                      <SelectItem value="1:1">1:1 (Square)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Style</Label>
                <Select onValueChange={(value) => setValue('videoSpecs.style', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cinematic">Cinematic</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="product-focused">Product-Focused</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Mood</Label>
                <Select onValueChange={(value) => setValue('videoSpecs.mood', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="energetic">Energetic</SelectItem>
                    <SelectItem value="calm">Calm</SelectItem>
                    <SelectItem value="dramatic">Dramatic</SelectItem>
                    <SelectItem value="playful">Playful</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Target Audience & Campaign Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Target Audience & Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ageRange">Age Range *</Label>
                <Input
                  id="ageRange"
                  {...register('targetAudience.ageRange', { required: 'Age range is required' })}
                  placeholder="e.g., 25-40, Gen Z, Millennials"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="demographics">Demographics *</Label>
                <Input
                  id="demographics"
                  {...register('targetAudience.demographics', { required: 'Demographics are required' })}
                  placeholder="e.g., Urban professionals, Young parents"
                />
              </div>

              <div className="space-y-2">
                <Label>Interests *</Label>
                {formValues.targetAudience.interests.map((interest, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      {...register(`targetAudience.interests.${index}` as const)}
                      placeholder="Enter an interest"
                    />
                    {formValues.targetAudience.interests.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayField('targetAudience', 'interests', index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayField('targetAudience', 'interests')}
                >
                  Add Interest
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Campaign Goal</Label>
                <Select onValueChange={(value) => setValue('campaignGoals.primary', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select primary goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brand-awareness">Brand Awareness</SelectItem>
                    <SelectItem value="product-demo">Product Demo</SelectItem>
                    <SelectItem value="emotional-connection">Emotional Connection</SelectItem>
                    <SelectItem value="call-to-action">Call to Action</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaignMessage">Campaign Message *</Label>
                <Textarea
                  id="campaignMessage"
                  {...register('campaignGoals.message', { required: 'Campaign message is required' })}
                  placeholder="What's the key message you want to convey?"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Ready to Generate Your Veo Prompt?</h3>
                <p className="text-muted-foreground">
                  Choose from Basic (0.005 ETH), Premium (0.01 ETH), or Enterprise (0.025 ETH) tiers
                </p>
              </div>
              <Button type="submit" size="lg" className="px-8">
                <Target className="h-5 w-5 mr-2" />
                Continue to Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        brandId={MOCK_BRAND_ID}
      />

      {/* Payment Status Tracker */}
      {currentPaymentId && (
        <PaymentStatusTracker
          paymentId={currentPaymentId}
          onSuccess={() => {
            setIsGenerating(false);
            toast.success('Veo prompt generated successfully!');
          }}
          onFailure={() => {
            setIsGenerating(false);
            setCurrentPaymentId(null);
          }}
        />
      )}

      {/* Generated Prompt Display */}
      {generatedPrompt && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Generated Veo 3.1 Prompt
              <Badge variant="outline" className="bg-green-100 text-green-700">
                Score: {generatedPrompt.qualityScore}/100
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="font-semibold">Main Prompt:</Label>
                <p className="mt-1 p-3 bg-white rounded border">{generatedPrompt.mainPrompt}</p>
              </div>

              <div>
                <Label className="font-semibold">Visual Style:</Label>
                <p className="mt-1 p-3 bg-white rounded border">{generatedPrompt.visualStyle}</p>
              </div>

              <div>
                <Label className="font-semibold">Camera Work:</Label>
                <p className="mt-1 p-3 bg-white rounded border">{generatedPrompt.cameraWork}</p>
              </div>

              <div>
                <Label className="font-semibold">Lighting:</Label>
                <p className="mt-1 p-3 bg-white rounded border">{generatedPrompt.lighting}</p>
              </div>
            </div>

            {generatedPrompt.optimizationTips.length > 0 && (
              <div>
                <Label className="font-semibold">Optimization Tips:</Label>
                <ul className="mt-1 space-y-1">
                  {generatedPrompt.optimizationTips.map((tip, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      • {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}