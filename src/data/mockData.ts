export interface Brand {
  id: string;
  name: string;
  logo: string;
  category: string;
  description: string;
  protectedAsins: number;
  healthScore: number;
  verifiedSellers: number;
  activeOpportunities: boolean;
  minOrderQty: number;
  avgMargin: string;
  featured: boolean;
}

export interface Seller {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  verifiedStatus: 'Verified' | 'Pending' | 'Flagged';
  annualVolume: string;
  warehouseCount: number;
  riskScore: number; // 0-100 (lower is safer)
  activeBrandDeals: number;
  rating: number;
}

export interface ProductASIN {
  id: string;
  asin: string;
  title: string;
  brandName: string;
  mapPrice: number;
  currentBuyBoxPrice: number;
  buyBoxWinner: string;
  activeSellersCount: number;
  unauthorizedCount: number;
  riskScore: number;
  status: 'Clean' | 'MAP Violation' | 'Hijacked' | 'Counterfeit Risk';
  lastScanned: string;
  image: string;
  category: string;
}

export interface MapViolation {
  id: string;
  asin: string;
  productTitle: string;
  violatorSellerName: string;
  violatorSellerId: string;
  mapPrice: number;
  violatingPrice: number;
  difference: number;
  detectedAt: string;
  riskScore: number;
  status: 'Detected' | 'Alert Sent' | 'C&D Issued' | 'Resolved';
  evidenceScreenshotUrl?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  state: string;
  type: '3PL Fulfillment' | 'Prep & Ship' | 'Cold Storage' | 'Hazmat Certified';
  capacitySqFt: number;
  utilizationRate: number;
  amazonFbaPrep: boolean;
  rating: number;
  partnerCount: number;
}

export interface Distributor {
  id: string;
  name: string;
  region: string;
  categories: string[];
  minimumOrder: number;
  verifiedAuthorized: boolean;
  rating: number;
}

export interface PartnershipApplication {
  id: string;
  brandId: string;
  brandName: string;
  sellerId: string;
  sellerName: string;
  appliedDate: string;
  monthlyOrderPromise: string;
  status: 'Pending' | 'Approved' | 'Declined';
  proposedMargin: string;
  notes: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'alert' | 'success' | 'info' | 'warning';
  read: boolean;
}

export const MOCK_BRANDS: Brand[] = [
  {
    id: 'b1',
    name: 'ApexGear Tech',
    logo: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=150&auto=format&fit=crop&q=80',
    category: 'Consumer Electronics',
    description: 'Premium noise-canceling audio equipment & high-performance wireless accessories.',
    protectedAsins: 42,
    healthScore: 98,
    verifiedSellers: 8,
    activeOpportunities: true,
    minOrderQty: 50,
    avgMargin: '38%',
    featured: true,
  },
  {
    id: 'b2',
    name: 'Lumina Home Labs',
    logo: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?w=150&auto=format&fit=crop&q=80',
    category: 'Smart Home & Appliances',
    description: 'Architectural LED lighting, smart ambient climate control & home automation.',
    protectedAsins: 28,
    healthScore: 92,
    verifiedSellers: 5,
    activeOpportunities: true,
    minOrderQty: 25,
    avgMargin: '42%',
    featured: true,
  },
  {
    id: 'b3',
    name: 'Aura Fitness & Wellness',
    logo: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=150&auto=format&fit=crop&q=80',
    category: 'Sports & Outdoors',
    description: 'Ergonomic recovery gear, smart fitness wearables, and heavy-duty training equipment.',
    protectedAsins: 56,
    healthScore: 89,
    verifiedSellers: 12,
    activeOpportunities: true,
    minOrderQty: 100,
    avgMargin: '35%',
    featured: false,
  },
  {
    id: 'b4',
    name: 'PureBlend Nutrition',
    logo: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&auto=format&fit=crop&q=80',
    category: 'Health & Personal Care',
    description: 'Organic botanical supplements, NSF-certified clean protein & hydration formulas.',
    protectedAsins: 31,
    healthScore: 95,
    verifiedSellers: 6,
    activeOpportunities: true,
    minOrderQty: 75,
    avgMargin: '45%',
    featured: true,
  },
  {
    id: 'b5',
    name: 'NextGen Audio',
    logo: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=150&auto=format&fit=crop&q=80',
    category: 'Audio & Music',
    description: 'Studio-grade studio monitors, DAC amplifiers, and planar magnetic headphones.',
    protectedAsins: 19,
    healthScore: 99,
    verifiedSellers: 4,
    activeOpportunities: false,
    minOrderQty: 30,
    avgMargin: '40%',
    featured: false,
  }
];

export const MOCK_SELLERS: Seller[] = [
  {
    id: 's1',
    companyName: 'PrimeWholesale Global',
    contactName: 'Alexander Wright',
    email: 'alex@primewholesale.io',
    verifiedStatus: 'Verified',
    annualVolume: '$12.4M',
    warehouseCount: 3,
    riskScore: 12,
    activeBrandDeals: 14,
    rating: 4.9,
  },
  {
    id: 's2',
    companyName: 'Apex Commerce Group',
    contactName: 'Elena Rostova',
    email: 'elena@apexcommerce.com',
    verifiedStatus: 'Verified',
    annualVolume: '$8.7M',
    warehouseCount: 2,
    riskScore: 18,
    activeBrandDeals: 9,
    rating: 4.8,
  },
  {
    id: 's3',
    companyName: 'Velocity Retail Partners',
    contactName: 'Marcus Chen',
    email: 'marcus@velocityretail.org',
    verifiedStatus: 'Verified',
    annualVolume: '$4.2M',
    warehouseCount: 1,
    riskScore: 24,
    activeBrandDeals: 6,
    rating: 4.7,
  },
  {
    id: 's4',
    companyName: 'BargainBazaar Express (Unflagged)',
    contactName: 'Dave Miller',
    email: 'dave@bargainbazaar.biz',
    verifiedStatus: 'Flagged',
    annualVolume: '$1.1M',
    warehouseCount: 0,
    riskScore: 88,
    activeBrandDeals: 0,
    rating: 2.9,
  }
];

export const MOCK_PRODUCTS: ProductASIN[] = [
  {
    id: 'p1',
    asin: 'B08N5WRWNW',
    title: 'ApexGear ANC-700 Wireless Noise-Cancelling Headphones (Midnight Black)',
    brandName: 'ApexGear Tech',
    mapPrice: 249.99,
    currentBuyBoxPrice: 224.50,
    buyBoxWinner: 'DiscountDealsDirect_Store',
    activeSellersCount: 11,
    unauthorizedCount: 4,
    riskScore: 84,
    status: 'MAP Violation',
    lastScanned: '2 mins ago',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80',
    category: 'Electronics'
  },
  {
    id: 'p2',
    asin: 'B09X2L3K9A',
    title: 'Lumina Smart Ambient Soundbar & Atmos Speaker System',
    brandName: 'Lumina Home Labs',
    mapPrice: 399.00,
    currentBuyBoxPrice: 399.00,
    buyBoxWinner: 'PrimeWholesale Global',
    activeSellersCount: 5,
    unauthorizedCount: 0,
    riskScore: 8,
    status: 'Clean',
    lastScanned: '4 mins ago',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300&auto=format&fit=crop&q=80',
    category: 'Smart Home'
  },
  {
    id: 'p3',
    asin: 'B07V3K99L2',
    title: 'Aura Fitness Smart Recovery Massage Gun Pro V3',
    brandName: 'Aura Fitness & Wellness',
    mapPrice: 179.99,
    currentBuyBoxPrice: 145.00,
    buyBoxWinner: 'QuickShip_Liquidation_Inc',
    activeSellersCount: 14,
    unauthorizedCount: 6,
    riskScore: 92,
    status: 'Hijacked',
    lastScanned: '1 min ago',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&auto=format&fit=crop&q=80',
    category: 'Fitness'
  },
  {
    id: 'p4',
    asin: 'B08K87Z3X8',
    title: 'PureBlend Plant Isolate Protein Powder 2.2lbs (Vanilla Bean)',
    brandName: 'PureBlend Nutrition',
    mapPrice: 44.95,
    currentBuyBoxPrice: 44.95,
    buyBoxWinner: 'Apex Commerce Group',
    activeSellersCount: 4,
    unauthorizedCount: 0,
    riskScore: 11,
    status: 'Clean',
    lastScanned: '10 mins ago',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
    category: 'Nutrition'
  },
  {
    id: 'p5',
    asin: 'B09R11M49Q',
    title: 'NextGen DAC Audiophile Desktop Headphone Amplifier',
    brandName: 'NextGen Audio',
    mapPrice: 599.00,
    currentBuyBoxPrice: 499.00,
    buyBoxWinner: 'GlobalElectroLiquidators',
    activeSellersCount: 8,
    unauthorizedCount: 3,
    riskScore: 78,
    status: 'Counterfeit Risk',
    lastScanned: 'Just now',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&auto=format&fit=crop&q=80',
    category: 'Audio'
  }
];

export const MOCK_VIOLATIONS: MapViolation[] = [
  {
    id: 'v1',
    asin: 'B08N5WRWNW',
    productTitle: 'ApexGear ANC-700 Wireless Noise-Cancelling Headphones',
    violatorSellerName: 'DiscountDealsDirect_Store',
    violatorSellerId: 'A3V9K2L1M8P',
    mapPrice: 249.99,
    violatingPrice: 224.50,
    difference: 25.49,
    detectedAt: '2026-07-24 23:42:10',
    riskScore: 89,
    status: 'Detected',
  },
  {
    id: 'v2',
    asin: 'B07V3K99L2',
    productTitle: 'Aura Fitness Smart Recovery Massage Gun Pro V3',
    violatorSellerName: 'QuickShip_Liquidation_Inc',
    violatorSellerId: 'A1X87Z90P4K',
    mapPrice: 179.99,
    violatingPrice: 145.00,
    difference: 34.99,
    detectedAt: '2026-07-24 22:15:05',
    riskScore: 94,
    status: 'C&D Issued',
  },
  {
    id: 'v3',
    asin: 'B09R11M49Q',
    productTitle: 'NextGen DAC Audiophile Desktop Headphone Amplifier',
    violatorSellerName: 'GlobalElectroLiquidators',
    violatorSellerId: 'A9B2C3D4E5F',
    mapPrice: 599.00,
    violatingPrice: 499.00,
    difference: 100.00,
    detectedAt: '2026-07-25 00:12:44',
    riskScore: 78,
    status: 'Alert Sent',
  }
];

export const MOCK_WAREHOUSES: Warehouse[] = [
  {
    id: 'w1',
    name: 'Apex West Coast Logistics Hub',
    location: 'Ontario, California',
    state: 'CA',
    type: '3PL Fulfillment',
    capacitySqFt: 180000,
    utilizationRate: 74,
    amazonFbaPrep: true,
    rating: 4.9,
    partnerCount: 42
  },
  {
    id: 'w2',
    name: 'Midwest FastPrep Center',
    location: 'Columbus, Ohio',
    state: 'OH',
    type: 'Prep & Ship',
    capacitySqFt: 95000,
    utilizationRate: 62,
    amazonFbaPrep: true,
    rating: 4.8,
    partnerCount: 29
  },
  {
    id: 'w3',
    name: 'Southern Gateway 3PL',
    location: 'Dallas, Texas',
    state: 'TX',
    type: '3PL Fulfillment',
    capacitySqFt: 220000,
    utilizationRate: 81,
    amazonFbaPrep: true,
    rating: 4.7,
    partnerCount: 58
  }
];

export const MOCK_DISTRIBUTORS: Distributor[] = [
  {
    id: 'd1',
    name: 'TechDirect Wholesale Corp',
    region: 'North America',
    categories: ['Consumer Electronics', 'Audio', 'Smart Home'],
    minimumOrder: 2500,
    verifiedAuthorized: true,
    rating: 4.9
  },
  {
    id: 'd2',
    name: 'OmniHealth & Vitality Distribution',
    region: 'Global',
    categories: ['Health & Personal Care', 'Nutrition', 'Sports'],
    minimumOrder: 1500,
    verifiedAuthorized: true,
    rating: 4.8
  },
  {
    id: 'd3',
    name: 'Vanguard Retail Supply Network',
    region: 'East Coast US',
    categories: ['Home & Appliances', 'Electronics'],
    minimumOrder: 5000,
    verifiedAuthorized: true,
    rating: 4.6
  }
];

export const MOCK_APPLICATIONS: PartnershipApplication[] = [
  {
    id: 'app1',
    brandId: 'b1',
    brandName: 'ApexGear Tech',
    sellerId: 's1',
    sellerName: 'PrimeWholesale Global',
    appliedDate: '2026-07-20',
    monthlyOrderPromise: '$50,000 / mo',
    status: 'Approved',
    proposedMargin: '38%',
    notes: 'Approved for non-exclusive Amazon FBA wholesale distribution with strict MAP adherence.'
  },
  {
    id: 'app2',
    brandId: 'b2',
    brandName: 'Lumina Home Labs',
    sellerId: 's2',
    sellerName: 'Apex Commerce Group',
    appliedDate: '2026-07-22',
    monthlyOrderPromise: '$35,000 / mo',
    status: 'Pending',
    proposedMargin: '40%',
    notes: 'Application awaiting brand authorization team review.'
  }
];

export const MOCK_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'n1',
    title: 'AI Scanner Alert',
    message: 'MAP violation detected on ASIN B08N5WRWNW by DiscountDealsDirect_Store (-$25.49 below MAP).',
    timestamp: '10m ago',
    type: 'alert',
    read: false
  },
  {
    id: 'n2',
    title: 'Partnership Approved',
    message: 'ApexGear Tech approved your wholesale partnership application!',
    timestamp: '2h ago',
    type: 'success',
    read: false
  },
  {
    id: 'n3',
    title: 'Cease & Desist Generated',
    message: 'AI generated Cease & Desist legal notice for ASIN B07V3K99L2.',
    timestamp: '5h ago',
    type: 'info',
    read: true
  }
];
