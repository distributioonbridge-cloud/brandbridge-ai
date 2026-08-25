import React, { useState } from 'react';
import { X, FileText, Download, CheckCircle, AlertTriangle, ShieldCheck, Send } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const LegalCaseModal: React.FC = () => {
  const { activeLegalCase, closeLegalCaseModal, resolveViolation } = useData();
  const [submittedToAmazon, setSubmittedToAmazon] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  if (!activeLegalCase) return null;

  const handleDownloadPdf = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const handleSubmitCase = () => {
    setSubmittedToAmazon(true);
    setTimeout(() => {
      resolveViolation(activeLegalCase.id);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/80 bg-slate-900/95 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={closeLegalCaseModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">AI Legal Cease & Desist Case File</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Agentic Draft
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Case ID: <span className="font-mono text-slate-300">BB-LEGAL-{activeLegalCase.id}</span> | Target: {activeLegalCase.violatorSellerName}
            </p>
          </div>
        </div>

        {/* Violation Data Overview Pill */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Target ASIN</span>
            <span className="font-mono font-bold text-cyan-400 text-sm">{activeLegalCase.asin}</span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">MAP vs Violating</span>
            <span className="font-bold text-red-400 text-sm">
              ${activeLegalCase.violatingPrice.toFixed(2)} <span className="text-slate-500 text-xs font-normal"> (MAP: ${activeLegalCase.mapPrice.toFixed(2)})</span>
            </span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Seller Risk Score</span>
            <span className="font-bold text-amber-400 text-sm">{activeLegalCase.riskScore}/100 High Risk</span>
          </div>
        </div>

        {/* Formatted Generated Notice Preview */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 font-mono text-xs text-slate-300 leading-relaxed space-y-4 shadow-inner mb-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-slate-500">
            <span>DISTRIBUTION BRIDGE AI LEGAL AUTOMATION ENGINE</span>
            <span>DATE: {activeLegalCase.detectedAt}</span>
          </div>

          <p className="font-semibold text-white">
            FORMAL CEASE AND DESIST DEMAND & AMAZON IP VIOLATION NOTICE
          </p>

          <p>
            TO: Seller Merchant ID <span className="text-cyan-300 font-bold">{activeLegalCase.violatorSellerId}</span> ({activeLegalCase.violatorSellerName})<br />
            RE: Unauthorized Commercial Exploitation & Minimum Advertised Price (MAP) Breach on ASIN: <span className="text-cyan-300 font-bold">{activeLegalCase.asin}</span>
          </p>

          <p>
            Dear Merchant Management,<br />
            This notice is formally transmitted via Distribution Bridge AI Enforcement Protocol on behalf of the registered trademark & brand rights holder. Our continuous 24/7 scanning algorithms have recorded unauthorized listing activity and price undercutting on the following product:
          </p>

          <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1">
            <p>Product: {activeLegalCase.productTitle}</p>
            <p>Authorized MAP Floor: ${activeLegalCase.mapPrice.toFixed(2)} USD</p>
            <p>Your Recorded Offer: ${activeLegalCase.violatingPrice.toFixed(2)} USD (-${activeLegalCase.difference.toFixed(2)} Breach)</p>
          </div>

          <p>
            DEMAND IS HEREBY MADE that within twenty-four (24) hours of receipt of this transmission, you immediately:
            <br />1. Adjust your listing price to or above the authorized MAP floor of ${activeLegalCase.mapPrice.toFixed(2)}; OR
            <br />2. Completely remove your merchant offer from ASIN {activeLegalCase.asin}.
          </p>

          <p className="text-slate-400">
            Failure to comply will result in immediate escalation to Amazon Brand Registry IP Infringement Portal, Brand Gating enforcement, and potential legal tort claims for intentional interference with contractual relations.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-4">
          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center gap-2 border border-slate-700 transition-all"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            {downloaded ? 'Case PDF Downloaded!' : 'Download Legal PDF Report'}
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSubmitCase}
              disabled={submittedToAmazon}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
                submittedToAmazon
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white cyan-glow'
              }`}
            >
              {submittedToAmazon ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Case Transmitted to Amazon Brand Registry
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Transmit Legal Notice to Amazon SP-API
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
