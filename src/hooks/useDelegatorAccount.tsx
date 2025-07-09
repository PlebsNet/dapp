import {
  Implementation,
  toMetaMaskSmartAccount,
} from "@metamask/delegation-toolkit";
import { MetaMaskSmartAccount } from "@metamask/delegation-toolkit";
import { useEffect, useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

function useDelegatorAccount(): {
  account: MetaMaskSmartAccount| null;
} {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [account, setAccount] = useState<MetaMaskSmartAccount | null>(null);

  useEffect(() => {
    if (!address || !publicClient || !walletClient) return;
    toMetaMaskSmartAccount({
      client: publicClient,
      implementation: Implementation.Hybrid,
      deployParams: [address, [], [], []],
      deploySalt: "0x",
      signatory: { walletClient },
    }).then((account) => {
      setAccount(account);
    });
  }, [address, walletClient, publicClient]);

  return {account}
}

export default useDelegatorAccount;
