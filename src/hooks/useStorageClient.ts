"use client"

import { Delegation } from "@metamask/delegation-toolkit"

const useStorageClient = () => {
  const storeDelegation = (delegation: Delegation) => {
    try {
      localStorage.setItem('delegation', JSON.stringify(delegation));
    } catch {
      // Ignore storage errors
    }
  };

  return { storeDelegation };
};

export default useStorageClient;
