"use client";

import React, { createContext, useContext, useState } from "react";

// Create the context
const AccountCardContext = createContext();

// Context provider component
export const AccountCardProvider = ({ children }) => {
  const [loadingAccountId, setLoadingAccountId] = useState(null);

  return (
    <AccountCardContext.Provider value={{ loadingAccountId, setLoadingAccountId }}>
      {children}
    </AccountCardContext.Provider>
  );
};

// Custom hook to use the context
export const useAccountCardContext = () => {
  return useContext(AccountCardContext);
};