"use client"

import { Delegation } from "@metamask/delegation-toolkit"

const useStorageClient = () => {
  const storeDelegation = (delegation: Delegation) => {
    try {
      localStorage.setItem("delegation", JSON.stringify(delegation));
    } catch {
      // Ignore storage errors
    }
  };

  const loadDelegation = (): Delegation | null => {
    try {
      const item = localStorage.getItem("delegation");
      return item ? (JSON.parse(item) as Delegation) : null;
    } catch {
      return null;
    }
  };

  const clearDelegation = () => {
    try {
      localStorage.removeItem("delegation");
    } catch {
      // Ignore storage errors
    }
  };

  return { storeDelegation, loadDelegation, clearDelegation };
};

export default useStorageClient;
