"use client";

import React from 'react';
import { useAccount } from 'wagmi';
import { useGetTriplesWithPositionsQuery, GetTriplesWithPositionsQuery } from '@0xintuition/graphql';
import { questions } from '../assessment/components/questions';
import { useRedeemTriple } from '../../hooks/useRedeemTriple';
import { CURRENT_ENV } from '../../config/blockchain';
import { getChainEnvConfig } from '../../lib/environment';
import { parseUnits } from 'viem';
import { multivaultAbi } from '../../lib/abis/multivault'; // Import the ABI
import { nanoid } from 'nanoid';

// Extract all triple IDs from questions
const allTripleIds = questions.map(q => q.triple.id);

// Helper function to format USD amounts
const formatUSD = (ethAmount: number) => {
    const usdAmount = ethAmount * 2000; // Using $2000 as ETH price
    if (usdAmount < 0.01) return '<$0.01';
    return `$${usdAmount.toPrecision(3).split('e')[0]}`;
};

// Helper function to format percentages
const formatPercentage = (value: number) => {
    if (isNaN(value) || !isFinite(value)) return '0.00%'; // Handle NaN/Infinity
    return `${value.toPrecision(3).split('e')[0]}%`;
};

export default function TriplesPage() {
    const { address } = useAccount();
    const { contractAddress: multivaultContractAddress } = getChainEnvConfig(CURRENT_ENV);
    const redeemTripleHook = useRedeemTriple(multivaultContractAddress);

    // Fetch positions for all triples
    const { data: positionsData, isLoading: isLoadingPositions, error: positionsError } = useGetTriplesWithPositionsQuery({
        where: {
            id: { _in: allTripleIds }
        },
        address: address?.toLowerCase() as `0x${string}`
    });

    const handleWithdraw = async (tripleIdFromCard: string, vaultSharesFromCard?: number, counterVaultSharesFromCard?: number) => {
        if (!address || !redeemTripleHook || !redeemTripleHook.writeContractAsync) {
            console.error("Withdraw prerequisites not met: address, redeemTripleHook, or writeContractAsync missing.");
            return;
        }

        let sharesToRedeemBigInt: bigint;
        const idForContractTx = nanoid();
        let attemptingToRedeem: "For" | "Against" | null = null;

        if (vaultSharesFromCard && vaultSharesFromCard > 0) {
            sharesToRedeemBigInt = parseUnits(vaultSharesFromCard.toString(), 0);
            attemptingToRedeem = "For";
            console.log(`Preparing to withdraw ${sharesToRedeemBigInt} 'For' shares from vault ID ${idForContractTx}`);
        } else if (counterVaultSharesFromCard && counterVaultSharesFromCard > 0) {
            // === CRITICAL SECTION REGARDING COUNTER VAULT ID ===
            // If redeeming 'Against' shares requires a *different* vault ID 
            // (e.g., a specific counter-vault ID not equal to tripleIdFromCard), 
            // then this section needs modification. 
            // For now, we are proceeding with tripleIdFromCard for the 'id', which may be incorrect.
            // Consider disabling this block or implementing logic to get the correct counter-vault ID.
            console.warn("Attempting to redeem 'Against' shares. This might fail if 'tripleIdFromCard' is not the correct ID for the counter-vault.");
            sharesToRedeemBigInt = parseUnits(counterVaultSharesFromCard.toString(), 0);
            attemptingToRedeem = "Against";
            // idForContractTx is still BigInt(tripleIdFromCard) - this is the potential issue point.
            console.log(`Preparing to withdraw ${sharesToRedeemBigInt} 'Against' shares using vault ID ${idForContractTx}.`);
            // === END CRITICAL SECTION ===
        } else {
            console.log("No shares available to withdraw for this position on triple:", tripleIdFromCard);
            return;
        }

        if (!attemptingToRedeem) { // Should not happen if logic above is correct
            console.error("Logical error: No redeem type determined.");
            return;
        }

        console.log(`Calling redeemTriple with args: [shares=${sharesToRedeemBigInt}, receiver=${address}, id=${idForContractTx}] for ${attemptingToRedeem} position.`);

        try {
            const tx = await redeemTripleHook.writeContractAsync({
                address: multivaultContractAddress,
                abi: multivaultAbi,
                functionName: 'redeemTriple',
                args: [sharesToRedeemBigInt, address, idForContractTx]
            });
            console.log("Withdraw transaction submitted:", tx, "for", attemptingToRedeem, "position.");
            // Optionally, call redeemTripleHook.reset() here or on success
        } catch (err) {
            console.error(`Withdrawal failed for ${attemptingToRedeem} position:`, err);
        }
    };

    if (!address) {
        return (
            <div className="p-4 max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">My Triple Positions</h1>
                <p className="text-gray-600">Please connect your wallet to view your positions.</p>
            </div>
        );
    }

    if (isLoadingPositions) {
        return (
            <div className="p-4 max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">My Triple Positions</h1>
                <p className="text-gray-600">Loading positions...</p>
            </div>
        );
    }

    if (positionsError) {
        return (
            <div className="p-4 max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">My Triple Positions</h1>
                <p className="text-red-600">Error loading positions: {positionsError.toString()}</p>
            </div>
        );
    }

    const triples = positionsData?.triples || [];
    const total = positionsData?.total.aggregate?.count || 0;
    const isRedeeming = redeemTripleHook.awaitingWalletConfirmation || redeemTripleHook.awaitingOnChainConfirmation;

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">My Triple Positions</h1>
            <p className="text-sm text-gray-600 mb-6">Total positions: {total}</p>
            {isRedeeming && <p className="text-blue-500">Processing withdrawal...</p>}
            {redeemTripleHook.isError && <p className="text-red-500">Withdrawal error occurred. Please check console.</p>}
            {/* Access receipt when available: redeemTripleHook.receipt */}

            {triples.length === 0 ? (
                <p className="text-gray-600">You don&apos;t have any positions yet.</p>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {triples.map((triple: NonNullable<GetTriplesWithPositionsQuery['triples']>[number]) => {
                        const question = questions.find(q => q.triple.id === parseInt(triple.id));
                        const vaultPosition = triple.vault?.positions[0];
                        const counterVaultPosition = triple.counter_vault?.positions[0];

                        const vaultEthAmount = vaultPosition ? (vaultPosition.shares * triple.vault?.current_share_price) : 0;
                        const counterVaultEthAmount = counterVaultPosition ? (counterVaultPosition.shares * triple.counter_vault?.current_share_price) : 0;
                        const totalVaultEth = triple.vault?.total_shares * triple.vault?.current_share_price;
                        const totalCounterVaultEth = triple.counter_vault?.total_shares * triple.counter_vault?.current_share_price;

                        return (
                            <div
                                key={triple.id}
                                className="p-3 border rounded-lg shadow-sm hover:shadow-md transition-shadow min-w-[250px] flex-1 basis-[250px]"
                            >
                                <div className="flex flex-col gap-2">
                                    <h3 className="font-semibold text-base">
                                        {question?.text || `Triple #${triple.id}`}
                                    </h3>
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1 text-xs text-gray-600">
                                            <p>Subject: {triple.subject.label}</p>
                                            <p>Predicate: {triple.predicate.label}</p>
                                            <p>Object: {triple.object.label}</p>
                                        </div>
                                        <div className="text-right">
                                            {vaultPosition && (
                                                <div className="mb-1">
                                                    <p className="text-xs font-medium text-green-600">
                                                        For: {formatUSD(vaultEthAmount)}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatPercentage((vaultEthAmount / totalVaultEth) * 100)} of total
                                                    </p>
                                                </div>
                                            )}
                                            {counterVaultPosition && (
                                                <div>
                                                    <p className="text-xs font-medium text-red-600">
                                                        Against: {formatUSD(counterVaultEthAmount)}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatPercentage((counterVaultEthAmount / totalCounterVaultEth) * 100)} of total
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {(vaultPosition || counterVaultPosition) && (
                                        <button
                                            onClick={() => handleWithdraw(triple.id, vaultPosition?.shares, counterVaultPosition?.shares)}
                                            disabled={isRedeeming || (!vaultPosition?.shares && !counterVaultPosition?.shares)}
                                            className="mt-2 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-xs disabled:opacity-50"
                                        >
                                            {isRedeeming ? 'Withdrawing...' : 'Withdraw'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            <p>Don&apos;t see your triple?</p>
        </div>
    );
} 