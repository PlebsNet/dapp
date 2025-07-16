import React, { useEffect, useState } from "react";
import { Button } from "./ui/Button";
import {
  useWeb3AuthConnect,
  useWeb3AuthDisconnect,
} from "@web3auth/modal/react";
import { useAccount } from "wagmi";
import useDelegatorAccount from "@/hooks/useDelegatorAccount";
import useDelegateAccount from "@/hooks/useDelegateAccount";
import {
  prepareDelegation,
  prepareRedeemDelegation,
} from "@/lib/delegationUtils";
import {
  Delegation,
  getDeleGatorEnvironment,
} from "@metamask/delegation-toolkit";
import usePimlicoUtils from "@/hooks/usePimlicoUtils";
import { baseSepolia } from "viem/chains";
import { Hex } from "viem";
import { getUserOperationHash } from "viem/account-abstraction";

interface ConnectAndSIWEProps {
  onConnectChange?: (connected: boolean) => void;
  onVerified?: (address: string) => void;
}

export const ConnectAndSIWE: React.FC<ConnectAndSIWEProps> = () => {
  const {
    connect,
    isConnected,
    loading: connectLoading,
    error: connectError,
  } = useWeb3AuthConnect();
  const {
    disconnect,
    loading: disconnectLoading,
    error: disconnectError,
  } = useWeb3AuthDisconnect();
  const { address } = useAccount();
  const { account: delegatorSmartAccount } = useDelegatorAccount();
  const { account: delegateSmartAccount } = useDelegateAccount();
  const [delegation, setDelegation] = useState<Delegation>();

  const handleCreateDelegation = async () => {
    if (!delegateSmartAccount || !delegatorSmartAccount) {
      return;
    }

    const delegation = prepareDelegation(
      delegatorSmartAccount,
      delegateSmartAccount.address,
    );

    const signature = await delegatorSmartAccount.signDelegation({
      delegation,
    });

    const signedDelegation = {
      ...delegation,
      signature,
    };

    setDelegation(signedDelegation);

    console.log(signedDelegation);
  };

  return (
    <div className="flex flex-col items-center w-full">
      {!isConnected ? (
        // Not connected - show the connect button
        <Button
          size="lg"
          onClick={connect}
          disabled={connectLoading}
          className="w-full text-md bg-[#0052ff] text-gray-50"
        >
          Connect with web3Auth
        </Button>
      ) : (
        <>
          <p> Your Account: {address} </p>
          <p> Delegator: {delegatorSmartAccount?.address} </p>
          <p> Delegate: {delegateSmartAccount?.address} </p>
          <Button
            size="lg"
            onClick={() => disconnect()}
            disabled={disconnectLoading}
            className="w-full text-md bg-[#0052ff] text-gray-50"
          >
            Disconnect
          </Button>
          {!delegation && (
            <Button
              size="lg"
              onClick={() => handleCreateDelegation()}
              disabled={disconnectLoading}
              className="w-full text-md bg-[#0052ff] text-gray-50"
            >
              Create Delegation
            </Button>
          )}
        </>
      )}

      {connectError && (
        <div className="mt-2 text-red-500 text-sm">
          {connectError.toString()}
        </div>
      )}

      {disconnectError && (
        <div className="mt-2 text-red-500 text-sm">
          {disconnectError.toString()}
        </div>
      )}

      {/* {isConnected && address && !isLoading && (
        <div className="mt-2 text-sm text-gray-600">
          Connected: {address}
        </div>
      )} */}
    </div>
  );
};
