import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Brand,
  Seller,
  ProductASIN,
  MapViolation,
  Warehouse,
  Distributor,
  PartnershipApplication,
  SystemNotification,
  MOCK_BRANDS,
  MOCK_SELLERS,
  MOCK_PRODUCTS,
  MOCK_VIOLATIONS,
  MOCK_WAREHOUSES,
  MOCK_DISTRIBUTORS,
  MOCK_APPLICATIONS,
  MOCK_NOTIFICATIONS
} from '../data/mockData';

interface DataContextType {
  brands: Brand[];
  sellers: Seller[];
  products: ProductASIN[];
  violations: MapViolation[];
  warehouses: Warehouse[];
  distributors: Distributor[];
  applications: PartnershipApplication[];
  notifications: SystemNotification[];
  isScanning: boolean;
  activeLegalCase: MapViolation | null;
  stripeModalOpen: boolean;
  selectedPlan: string | null;
  runAiScanner: () => void;
  openLegalCaseModal: (violation: MapViolation) => void;
  closeLegalCaseModal: () => void;
  applyForPartnership: (brandId: string, brandName: string, promise: string, notes: string) => void;
  updateApplicationStatus: (appId: string, status: 'Approved' | 'Declined') => void;
  resolveViolation: (violationId: string) => void;
  openStripeModal: (planName?: string) => void;
  closeStripeModal: () => void;
  markNotificationRead: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brands, setBrands] = useState<Brand[]>(MOCK_BRANDS);
  const [sellers, setSellers] = useState<Seller[]>(MOCK_SELLERS);
  const [products, setProducts] = useState<ProductASIN[]>(MOCK_PRODUCTS);
  const [violations, setViolations] = useState<MapViolation[]>(MOCK_VIOLATIONS);
  const [warehouses] = useState<Warehouse[]>(MOCK_WAREHOUSES);
  const [distributors] = useState<Distributor[]>(MOCK_DISTRIBUTORS);
  const [applications, setApplications] = useState<PartnershipApplication[]>(MOCK_APPLICATIONS);
  const [notifications, setNotifications] = useState<SystemNotification[]>(MOCK_NOTIFICATIONS);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [activeLegalCase, setActiveLegalCase] = useState<MapViolation | null>(null);
  const [stripeModalOpen, setStripeModalOpen] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Agentic AI 24/7 Scanner Simulation
  const runAiScanner = () => {
    setIsScanning(true);
    setTimeout(() => {
      // Simulate finding a new unauthorized price drop
      const newViolation: MapViolation = {
        id: `v_${Date.now()}`,
        asin: 'B08N5WRWNW',
        productTitle: 'ApexGear ANC-700 Wireless Noise-Cancelling Headphones',
        violatorSellerName: 'Express_Liquidation_Direct',
        violatorSellerId: 'A7W99X88P0',
        mapPrice: 249.99,
        violatingPrice: 209.00,
        difference: 40.99,
        detectedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        riskScore: 96,
        status: 'Detected'
      };

      setViolations(prev => [newViolation, ...prev]);

      const newNotif: SystemNotification = {
        id: `n_${Date.now()}`,
        title: 'AGENTIC AI SCAN COMPLETE',
        message: `High Severity Violation: Express_Liquidation_Direct selling ASIN B08N5WRWNW at $209.00 (-$40.99 under MAP).`,
        timestamp: 'Just now',
        type: 'alert',
        read: false
      };

      setNotifications(prev => [newNotif, ...prev]);
      setIsScanning(false);
    }, 2500);
  };

  const openLegalCaseModal = (violation: MapViolation) => {
    setActiveLegalCase(violation);
  };

  const closeLegalCaseModal = () => {
    setActiveLegalCase(null);
  };

  const applyForPartnership = (brandId: string, brandName: string, promise: string, notes: string) => {
    const newApp: PartnershipApplication = {
      id: `app_${Date.now()}`,
      brandId,
      brandName,
      sellerId: 's1',
      sellerName: 'PrimeWholesale Global',
      appliedDate: new Date().toISOString().split('T')[0],
      monthlyOrderPromise: promise || '$25,000 / mo',
      status: 'Pending',
      proposedMargin: '38%',
      notes: notes || 'Direct FBA partnership application submitted.'
    };

    setApplications(prev => [newApp, ...prev]);

    setNotifications(prev => [
      {
        id: `n_${Date.now()}`,
        title: 'Partnership Application Sent',
        message: `Application submitted to ${brandName} for wholesale partnership review.`,
        timestamp: 'Just now',
        type: 'info',
        read: false
      },
      ...prev
    ]);
  };

  const updateApplicationStatus = (appId: string, status: 'Approved' | 'Declined') => {
    setApplications(prev =>
      prev.map(app => (app.id === appId ? { ...app, status } : app))
    );
  };

  const resolveViolation = (violationId: string) => {
    setViolations(prev =>
      prev.map(v => (v.id === violationId ? { ...v, status: 'Resolved' } : v))
    );
  };

  const openStripeModal = (planName?: string) => {
    if (planName) setSelectedPlan(planName);
    setStripeModalOpen(true);
  };

  const closeStripeModal = () => {
    setStripeModalOpen(false);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <DataContext.Provider
      value={{
        brands,
        sellers,
        products,
        violations,
        warehouses,
        distributors,
        applications,
        notifications,
        isScanning,
        activeLegalCase,
        stripeModalOpen,
        selectedPlan,
        runAiScanner,
        openLegalCaseModal,
        closeLegalCaseModal,
        applyForPartnership,
        updateApplicationStatus,
        resolveViolation,
        openStripeModal,
        closeStripeModal,
        markNotificationRead
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
