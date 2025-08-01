"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { track } from "@vercel/analytics";
import Question from "./Question";
import { questions } from "./questions";
import DynamicGraph from "@/components/ForceGraph3D";
import { useContainerSize } from '@/hooks/useContainerSize';
import { useAccount, useChainId } from 'wagmi';
import { useDepositTriple } from '@/hooks/useDepositTriple';
import { MULTIVAULT_CONTRACT_ADDRESS, BLOCK_EXPLORER_URL } from '@/config/blockchain';
import { parseUnits } from 'viem';
import { Abi } from 'viem';
import { multivaultAbi } from '@/lib/abis/multivault';
import { baseSepolia } from 'viem/chains';
import { ExternalLink } from 'lucide-react';

const ANIM = { duration: 0.3 };
const STORAGE_ANS = "plebs_answers_web3";
const STORAGE_IDX = "plebs_currentIndex_web3";
const STORAGE_TEST = "plebs_testId_web3";

interface TransactionStatus {
    questionId: string;
    status: 'pending' | 'success' | 'error';
    txHash?: string;
}

interface PendingTransaction {
    questionId: string;
    tripleId: number;
}

export default function Web3Assessment() {
    const router = useRouter();
    const { address } = useAccount();
    const currentChainId = useChainId();
    const total = questions.length;
    const { containerRef, dimensions } = useContainerSize();
    const {
        writeContractAsync,
        onReceipt
    } = useDepositTriple(MULTIVAULT_CONTRACT_ADDRESS);

    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [transactionStatuses, setTransactionStatuses] = useState<Record<string, TransactionStatus>>({});
    const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
    const [isProcessingQueue, setIsProcessingQueue] = useState(false);

    // Process transaction queue
    useEffect(() => {
        const processQueue = async () => {
            if (isProcessingQueue || pendingTransactions.length === 0 || !address) return;

            setIsProcessingQueue(true);
            const currentTx = pendingTransactions[0];

            try {
                const hash = await writeContractAsync({
                    address: MULTIVAULT_CONTRACT_ADDRESS as `0x${string}`,
                    abi: multivaultAbi as Abi,
                    functionName: 'depositTriple',
                    args: [address as `0x${string}`, BigInt(currentTx.tripleId)],
                    value: parseUnits('0.001', 18),
                    chain: baseSepolia
                });

                setTransactionStatuses(prev => ({
                    ...prev,
                    [currentTx.questionId]: {
                        questionId: currentTx.questionId,
                        status: 'success',
                        txHash: hash
                    }
                }));

                onReceipt((receipt) => {
                    console.log('Transaction confirmed:', receipt);
                });
            } catch (err) {
                setTransactionStatuses(prev => ({
                    ...prev,
                    [currentTx.questionId]: {
                        questionId: currentTx.questionId,
                        status: 'error'
                    }
                }));
                console.error('Error depositing triple:', err);
                if (err instanceof Error) {
                    setFormError(`Error: ${err.message}${err.cause ? ` (Cause: ${JSON.stringify(err.cause)})` : ''}`);
                } else {
                    setFormError(`An unknown error occurred: ${JSON.stringify(err)}`);
                }
            }

            // Remove processed transaction from queue
            setPendingTransactions(prev => prev.slice(1));
            setIsProcessingQueue(false);
        };

        processQueue();
    }, [pendingTransactions, isProcessingQueue, address, writeContractAsync, onReceipt]);

    // Hydrate once on mount (fire-and-forget)
    useEffect(() => {
        if (typeof window === "undefined" || !address) return;
        try {
            const a = sessionStorage.getItem(STORAGE_ANS);
            if (a) setAnswers(JSON.parse(a));
            const idx = parseInt(sessionStorage.getItem(STORAGE_IDX) || "", 10);
            if (!isNaN(idx) && idx >= 0 && idx < total) {
                setCurrentIndex(idx);
            }
        } catch { }
    }, [total, address]);

    // Persist answers & index continuously
    useEffect(() => {
        if (typeof window === "undefined" || !address) return;
        sessionStorage.setItem(STORAGE_ANS, JSON.stringify(answers));
    }, [answers, address]);

    useEffect(() => {
        if (typeof window === "undefined" || !address) return;
        sessionStorage.setItem(STORAGE_IDX, String(currentIndex));
    }, [currentIndex, address]);

    const handleAnswerChange = useCallback(
        async (id: string, value: number) => {
            if (!address) {
                setFormError('Please connect your wallet');
                return;
            }

            if (currentChainId !== 84532) {
                console.warn(`User is on chain ${currentChainId} instead of Base Sepolia (84532)`);
            }

            setAnswers((prev) => ({ ...prev, [id]: value }));
            const idx = questions.findIndex((q) => q.id === id);

            if (idx === currentIndex && currentIndex < total - 1) {
                // Advance to next question immediately
                setCurrentIndex(idx + 1);
            }

            // Add transaction to queue
            const question = questions.find(q => q.id === id);
            if (question?.triple) {
                setPendingTransactions(prev => [...prev, {
                    questionId: id,
                    tripleId: question.triple.id
                }]);

                // Set initial pending status
                setTransactionStatuses(prev => ({
                    ...prev,
                    [id]: { questionId: id, status: 'pending' }
                }));
            }
        },
        [currentIndex, total, address, currentChainId]
    );

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!address) {
                setFormError("Please connect your wallet to submit answers.");
                return;
            }
            if (Object.keys(answers).length !== total) {
                setFormError("Please answer all questions before submitting.");
                return;
            }
            setFormError(null);
            setIsSubmitting(true);

            try {
                // generate or reuse testId
                let testId = sessionStorage.getItem(STORAGE_TEST);
                if (!testId) {
                    testId = nanoid();
                    sessionStorage.setItem(STORAGE_TEST, testId);
                }

                // analytics (fire-and-forget)
                try { track("Completed Web3 Assessment"); } catch { }

                // TODO: Add blockchain interaction here
                // For example, storing answers on-chain or minting an NFT

                // Navigate to results (answers/testId still in sessionStorage)
                router.push("/results");
            } finally {
                setIsSubmitting(false);
            }
        },
        [answers, router, total, address]
    );

    const visible = questions.slice(0, currentIndex + 1);
    const allAnswered = Object.keys(answers).length === total;

    return (
        <form onSubmit={handleSubmit} className="p-4 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Web3 Personality Assessment</h2>

            {currentChainId !== 84532 && (
                <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-700 rounded-md text-yellow-500 text-sm">
                    <p className="font-bold">Network Warning</p>
                    <p>This app is designed for the Base Sepolia network (Chain ID: 84532).</p>
                    <p className="mt-1">Current network: Chain ID: {currentChainId}</p>
                    <p className="mt-2">You may attempt to deposit on your current network, but it might not work as expected.</p>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-gray-600" aria-live="polite">
                    Question {currentIndex + 1} of {total}
                </p>
                <button
                    type="submit"
                    disabled={!allAnswered || isSubmitting || !address}
                    className="px-4 py-2 rounded bg-blue-600 text-white disabled:bg-gray-300 disabled:text-gray-600 transition-opacity"
                >
                    {isSubmitting ? "Submitting..." : "Submit Answers"}
                </button>
            </div>

            {formError && (
                <p className="mb-4 text-red-600" role="alert">
                    {formError}
                </p>
            )}

            <div className="mb-8 h-[200px] w-full relative overflow-hidden rounded-lg">
                <div
                    ref={containerRef}
                    style={{
                        width: '100%',
                        height: '100%',
                        position: 'relative'
                    }}
                >
                    <DynamicGraph
                        width={dimensions.width}
                        height={dimensions.height}
                    />
                </div>
            </div>

            <AnimatePresence initial={false}>
                {visible
                    .slice()
                    .reverse()
                    .map((q, revIdx) => {
                        const idx = visible.length - 1 - revIdx;
                        const isActive = idx === currentIndex;
                        const txStatus = transactionStatuses[q.id];

                        return (
                            <motion.div
                                key={q.id}
                                initial={{ y: isActive ? -10 : 0, opacity: isActive ? 1 : 0.6 }}
                                animate={{ y: 0, opacity: isActive ? 1 : 0.5 }}
                                exit={{ y: 10, opacity: 0 }}
                                transition={ANIM}
                                className={isActive ? "mb-8" : "mb-4"}
                            >
                                <Question
                                    id={q.id}
                                    text={q.text}
                                    value={answers[q.id] ?? 0}
                                    onChange={handleAnswerChange}
                                    isLoading={txStatus?.status === 'pending'}
                                    isSuccess={txStatus?.status === 'success'}
                                    explorerButton={
                                        txStatus?.status === 'success' && txStatus.txHash && (
                                            <a
                                                href={`${BLOCK_EXPLORER_URL}/tx/${txStatus.txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 hover:underline flex items-center gap-1 text-xs"
                                            >
                                                {txStatus.txHash}
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )
                                    }
                                />
                            </motion.div>
                        );
                    })}
            </AnimatePresence>
        </form>
    );
} 