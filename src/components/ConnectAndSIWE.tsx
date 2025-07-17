import React  from "react";
import { Button } from "./ui/Button";
import {
  useWeb3AuthConnect,
  useWeb3AuthDisconnect,
} from "@web3auth/modal/react";
import { useAccount } from "wagmi";
import useDelegatorAccount from "@/hooks/useDelegatorAccount";

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
          <Button
            size="lg"
            onClick={() => disconnect()}
            disabled={disconnectLoading}
            className="w-full text-md bg-[#0052ff] text-gray-50"
          >
            Disconnect
          </Button>
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
