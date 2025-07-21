"use client";
import { createContext, useContext, useState } from "react";

export const FinancialDataContext = createContext(null);

export function useFinancialData() {
  return useContext(FinancialDataContext);
}

export function FinancialDataProvider({ children }) {
  const [cashflowData, setCashflowData] = useState(null);
  const [inflowOutflowData, setInflowOutflowData] = useState(null);
  const [overallAnalysis, setOverallAnalysis] = useState(null);
  const [overallAnalysisLoading, setOverallAnalysisLoading] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState("");

  return (
    <FinancialDataContext.Provider value={{
      cashflowData,
      setCashflowData,
      inflowOutflowData,
      setInflowOutflowData,
      overallAnalysis,
      setOverallAnalysis,
      overallAnalysisLoading,
      setOverallAnalysisLoading,
      selectedAccountId,
      setSelectedAccountId,
    }}>
      {children}
    </FinancialDataContext.Provider>
  );
}