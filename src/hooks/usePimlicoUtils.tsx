import { useEffect, useState } from "react";
import {
  BundlerClient,
  createBundlerClient,
  createPaymasterClient,
  PaymasterClient,
} from "viem/account-abstraction";
import {
  PimlicoClient,
  createPimlicoClient,
} from "permissionless/clients/pimlico";
import { useChainId } from "wagmi";
import { http } from "viem";

const usePimlicoUtils = () => {
  const [paymasterClient, setPaymasterClient] = useState<PaymasterClient>();
  const [bundlerClient, setBundlerClient] = useState<BundlerClient>();
  const [pimlicoClient, setPimlicoClient] = useState<PimlicoClient>();
  const chainId = useChainId();

  useEffect(() => {
    const pimlicoKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY;

    const bundlerClient = createBundlerClient({
      transport: http(
        `https://api.pimlico.io/v2/${chainId}/rpc?apikey=${pimlicoKey}`,
      ),
    });

    const paymasterClient = createPaymasterClient({
      transport: http(
        `https://api.pimlico.io/v2/${chainId}/rpc?apikey=${pimlicoKey}`,
      ),
    });

    const pimlicoClient = createPimlicoClient({
      transport: http(
        `https://api.pimlico.io/v2/${chainId}/rpc?apikey=${pimlicoKey}`,
      ),
    });

    setPaymasterClient(paymasterClient);
    setBundlerClient(bundlerClient);
    setPimlicoClient(pimlicoClient);
  }, [chainId]);

  return { paymasterClient, bundlerClient, pimlicoClient }
};

export default usePimlicoUtils;
