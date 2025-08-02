import {
  createCaveatBuilder,
  createDelegation,
  Delegation,
  ExecutionStruct,
  MetaMaskSmartAccount,
  SINGLE_DEFAULT_MODE,

  DelegationFramework,
} from "@metamask/delegation-toolkit";
import { Address, Hex, encodeFunctionData } from "viem";
import { multivaultAbi } from "./abis/multivault";

export function prepareDelegation(
  delegator: MetaMaskSmartAccount,
  delegate: Address,
): Delegation {
  const caveats = createCaveatBuilder(delegator.environment).addCaveat(
    "limitedCalls",
    10,
  );

  const delegation = createDelegation({
    to: delegate,
    from: delegator.address,
    caveats,
  });

  return delegation;
}

export function prepareRedeemDelegation(
  delegation: Delegation,
  receiver: Address,
  ammount: bigint,
  tripleID: bigint

): Hex {
  // Encode the depositTriple function call
  const depositTripleCallData = encodeFunctionData({
    abi: multivaultAbi,
    functionName: "depositTriple",
    args: [receiver, tripleID], // Triple ID 24465
  });

  const executions: ExecutionStruct[] = [
    {
      target: "0x1A6950807E33d5bC9975067e6D6b5Ea4cD661665" as `0x${string}`,
      value: ammount,// 0.0007 ETH
      callData: depositTripleCallData,
    }
  ];

  const redeemDelegationCallData = DelegationFramework.encode.redeemDelegations(
    {
      delegations: [[delegation]],
      modes: [SINGLE_DEFAULT_MODE],
      executions: [executions],
    },
  );

  return redeemDelegationCallData;
}
