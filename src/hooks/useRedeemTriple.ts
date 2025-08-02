import { CURRENT_ENV } from "../config/blockchain";
import { type GetContractReturnType } from "viem";

import { getChainEnvConfig } from "../lib/environment";
import { useContractWriteAndWait } from "./useContractWriteAndWait";
import { useMultivaultContract } from "./useMultivaultContract";

export const useRedeemTriple = (contract: string) => {
  const multivault = useMultivaultContract(
    contract,
    getChainEnvConfig(CURRENT_ENV).chainId
  ) as GetContractReturnType;

  return useContractWriteAndWait({
    ...multivault,
    // @ts-expect-error - Known issue with wagmi types
    functionName: "redeemTriple",
  });
};
