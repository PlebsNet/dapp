import {
  createCaveatBuilder,
  createDelegation,
  Delegation,
  ExecutionStruct,
  MetaMaskSmartAccount,
  SINGLE_DEFAULT_MODE,
  DelegationFramework,
} from "@metamask/delegation-toolkit";
import { Address, Hex } from "viem";

export function prepareDelegation(
  delegator: MetaMaskSmartAccount,
  delegate: Address,
): Delegation {
  const caveats = createCaveatBuilder(delegator.environment).addCaveat(
    "limitedCalls",
    1,
  );

  const delegation = createDelegation({
    to: delegate,
    from: delegator.address,
    caveats,
  });

  return delegation;
}

export function prepareRedeemDelegation(delegation: Delegation): Hex {
  const executions: ExecutionStruct[] = [
    {
      target: "0x26d35A9684A8AFCCf078FBa1c887b33feAE76c79",
      value: 420000000000000n,
      callData: "0x",
    },
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
