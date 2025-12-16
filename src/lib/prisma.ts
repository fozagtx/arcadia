import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create Prisma client instance
export const prisma = global.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// Store in global for development hot reload
if (process.env.NODE_ENV === 'development') {
  global.__prisma = prisma;
}

// Brief database operations
export const briefOperations = {
  // Create a new brief
  async create(data: {
    brandId: string;
    hook: string;
    painPoints: string[];
    benefits: string[];
    callToAction: string;
    creatorNotes: string;
    estimatedDuration: string;
    suggestedProps: string[];
    contentStyle: string;
    qualityScore: number;
    brandInfo: any;
    productDetails: any;
    targetAudience: any;
    campaignGoals: any;
    generationCost?: number;
    tokensUsed?: number;
    temperature?: number;
  }) {
    return await prisma.brief.create({
      data: {
        ...data,
        generationCost: data.generationCost ? data.generationCost.toString() : undefined,
        temperature: data.temperature ? data.temperature.toString() : undefined,
      }
    });
  },

  // Get brief by ID
  async getById(id: string) {
    return await prisma.brief.findUnique({
      where: { id },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            companyName: true,
            email: true
          }
        },
        variants: true,
        payments: true
      }
    });
  },

  // Get briefs by brand
  async getByBrand(brandId: string, limit = 10, offset = 0) {
    return await prisma.brief.findMany({
      where: { brandId },
      include: {
        variants: true,
        payments: {
          select: {
            id: true,
            status: true,
            amount: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });
  },

  // Update brief status
  async updateStatus(id: string, status: 'DRAFT' | 'PUBLISHED' | 'IN_REVIEW' | 'COMPLETED' | 'ARCHIVED') {
    return await prisma.brief.update({
      where: { id },
      data: { status }
    });
  },

  // Create brief variants
  async createVariants(briefId: string, variants: Array<{
    variantNumber: number;
    hook: string;
    painPoints: string[];
    benefits: string[];
    callToAction: string;
    creatorNotes: string;
    qualityScore: number;
  }>) {
    return await prisma.briefVariant.createMany({
      data: variants.map(variant => ({
        ...variant,
        briefId
      }))
    });
  },

  // Get brief analytics
  async getAnalytics(brandId: string) {
    const [totalBriefs, avgQualityScore, statusBreakdown] = await Promise.all([
      prisma.brief.count({ where: { brandId } }),

      prisma.brief.aggregate({
        where: { brandId },
        _avg: { qualityScore: true }
      }),

      prisma.brief.groupBy({
        by: ['status'],
        where: { brandId },
        _count: { status: true }
      })
    ]);

    return {
      totalBriefs,
      avgQualityScore: avgQualityScore._avg.qualityScore,
      statusBreakdown
    };
  }
};

// User database operations
export const userOperations = {
  // Create a new user
  async create(data: {
    email: string;
    name?: string;
    type: 'BRAND' | 'CREATOR' | 'ADMIN';
    companyName?: string;
    industry?: string;
    website?: string;
    walletAddress?: string;
    portfolioUrl?: string;
    socialHandle?: string;
  }) {
    return await prisma.user.create({ data });
  },

  // Get user by email
  async getByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email }
    });
  },

  // Get user by ID
  async getById(id: string) {
    return await prisma.user.findUnique({
      where: { id }
    });
  },

  // Update user wallet address
  async updateWallet(id: string, walletAddress: string) {
    return await prisma.user.update({
      where: { id },
      data: { walletAddress }
    });
  }
};

// Payment database operations
export const paymentOperations = {
  // Create payment request
  async createRequest(data: {
    paymentId: string;
    briefId?: string;
    brandId: string;
    creatorId?: string;
    amount: string;
    currency?: string;
    network?: string;
    paymentUrl?: string;
    expiresAt?: Date;
    memo?: string;
  }) {
    return await prisma.payment.create({
      data: {
        ...data,
        amount: data.amount
      }
    });
  },

  // Update payment status
  async updateStatus(
    paymentId: string,
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED' | 'REFUNDED',
    transactionData?: {
      transactionHash?: string;
      blockNumber?: number;
      gasUsed?: number;
    }
  ) {
    return await prisma.payment.update({
      where: { paymentId },
      data: {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : undefined,
        ...transactionData
      },
      include: {
        brief: {
          select: {
            id: true,
            hook: true,
            brandId: true,
            brandInfo: true
          }
        },
        brand: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  },

  // Get payment by paymentId
  async getByPaymentId(paymentId: string) {
    return await prisma.payment.findUnique({
      where: { paymentId },
      include: {
        brief: {
          select: {
            id: true,
            hook: true,
            brandId: true
          }
        },
        brand: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  },

  // Get payments by brand
  async getByBrand(brandId: string, limit = 20, offset = 0) {
    return await prisma.payment.findMany({
      where: { brandId },
      include: {
        brief: {
          select: {
            id: true,
            hook: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });
  }
};

export default prisma;