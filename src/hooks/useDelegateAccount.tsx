import { Implementation, MetaMaskSmartAccount, toMetaMaskSmartAccount } from "@metamask/delegation-toolkit";
import { useEffect, useState } from "react";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { usePublicClient } from "wagmi"

const useDelegateAccount = () : {account: MetaMaskSmartAccount | null} => {
  const publicClient = usePublicClient()
  const [account, setAccount] = useState<MetaMaskSmartAccount | null>(null);
  
  useEffect(() => {
    const privateKey = generatePrivateKey()
    const account = privateKeyToAccount(privateKey)

    toMetaMaskSmartAccount({
      client: publicClient,
      implementation: Implementation.Hybrid,
      deployParams: [account.address, [], [], []],
      deploySalt: "0x",
      signatory: {account}
    })
    .then(smartAccount => {setAccount(smartAccount)})


    
  }, [publicClient])

  return {account}
  
}

export default useDelegateAccount
