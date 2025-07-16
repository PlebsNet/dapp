"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { track } from "@vercel/analytics";
import Question from "./Question";
import { questions } from "./questions";
//import DynamicGraph from "@/components/ForceGraph3D";
import { useContainerSize } from "@/hooks/useContainerSize";
import { useAccount, useChainId } from "wagmi";
import { useDepositTriple } from "@/hooks/useDepositTriple";
import {
  MULTIVAULT_CONTRACT_ADDRESS,
  BLOCK_EXPLORER_URL,
} from "@/config/blockchain";
import { parseUnits, formatUnits } from "viem";
import { Abi } from "viem";
import { multivaultAbi } from "@/lib/abis/multivault";
import { baseSepolia } from "viem/chains";
import { useContractRead } from "wagmi";
import { useGetTriplesWithPositionsQuery } from "@0xintuition/graphql";
import { question } from "@/app/(admin)/data/question";
import useDelegateAccount from "@/hooks/useDelegateAccount";
import useDelegatorAccount from "@/hooks/useDelegatorAccount";
import {
  prepareDelegation,
  prepareRedeemDelegation,
} from "@/lib/delegationUtils";
import {
  Delegation,
  getDeleGatorEnvironment,
} from "@metamask/delegation-toolkit";
import usePimlicoUtils from "@/hooks/usePimlicoUtils";

const ANIM = { duration: 0.3 };
const STORAGE_ANS = "plebs_answers_web3";
const STORAGE_IDX = "plebs_currentIndex_web3";
const STORAGE_TEST = "plebs_testId_web3";

interface TransactionStatus {
  questionId: string;
  status: "pending" | "success" | "error";
  txHash?: string;
}

interface PendingTransaction {
  questionId: string;
  tripleId: number;
  answer: number;
}

export default function Web3Assessment() {
  const router = useRouter();
  const { address } = useAccount();
  const currentChainId = useChainId();
  const total = questions.length;
  const { containerRef } = useContainerSize();
  const { writeContractAsync, onReceipt } = useDepositTriple(
    MULTIVAULT_CONTRACT_ADDRESS,
  );
  const { account: delegateSmartAccount } = useDelegateAccount();
  const { account: delegatorSmartAccount } = useDelegatorAccount();
  const [delegation, setDelegation] = useState<Delegation>();
  const { pimlicoClient, bundlerClient, paymasterClient } = usePimlicoUtils();

  useEffect(() => {
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
    handleCreateDelegation();
  }, [delegatorSmartAccount, delegateSmartAccount]);

  // Get minimum deposit amount from contract
  const { data: generalConfig } = useContractRead({
    address: MULTIVAULT_CONTRACT_ADDRESS as `0x${string}`,
    abi: multivaultAbi as Abi,
    functionName: "generalConfig",
    chainId: baseSepolia.id,
  }) as {
    data:
      | [string, string, bigint, bigint, bigint, bigint, bigint, bigint]
      | undefined;
  };

  const minDeposit = generalConfig
    ? formatUnits(generalConfig[3], 18)
    : "0.001";

  // Get positions for all triples
  const { data: positionsData } = useGetTriplesWithPositionsQuery({
    where: {
      term_id: { _in: questions.map((q) => q.triple.id) },
    },
    address: address?.toLowerCase() as `0x${string}`,
  });
  console.log(positionsData);

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [transactionStatuses, setTransactionStatuses] = useState<
    Record<string, TransactionStatus>
  >({});
  const [pendingTransactions, setPendingTransactions] = useState<
    PendingTransaction[]
  >([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  // Initialize answers based on positions
  useEffect(() => {
    if (!positionsData?.triples || !address) return;

    const newAnswers: Record<string, number> = {};
    let firstUnansweredIndex = -1;
    console.log(newAnswers);

    questions.forEach((question, index) => {
      const position = positionsData.triples.find(
        (p: { term_id: number }) => p.term_id == question.triple.id,
      );

      if (position) {
        // If user has shares in vault, they agreed
        if (position.term?.vaults.at(0)?.positions.at(0)?.shares > 0) {
          const shares = Number(
            position.term?.vaults.at(0)?.positions.at(0)?.shares,
          );
          console.log("Shares", shares);
          if (shares > 0) {
            // 612202501000000
            newAnswers[question.id] = 5; // Slightly Agree
          }
          if (shares > 1000000000000000) {
            // 1224405001000000
            newAnswers[question.id] = 6; // Agree
          }
          if (shares > 1600000000000000) {
            // 1836607501000000
            newAnswers[question.id] = 7; // Strongly Agree
          }
        }
        // If user has shares in counter vault, they disagreed
        else if (position.counter_term?.vaults.at(0)?.positions.at(0)?.shares) {
          const shares = Number(
            position.counter_term?.vaults.at(0)?.positions.at(0)?.shares,
          );
          console.log("Shares", shares);
          if (shares > 0) {
            // 612202501000000
            newAnswers[question.id] = 3; // Slightly Disagree
          }
          if (shares > 1000000000000000) {
            // 1224405001000000
            newAnswers[question.id] = 2; // Disagree
          }
          if (shares > 1600000000000000) {
            // 1836607501000000
            newAnswers[question.id] = 1; // Strongly Disagree
          }
        }
      } else if (firstUnansweredIndex === -1) {
        // If this is the first unanswered question, set it as current
        firstUnansweredIndex = index;
      }
    });

    setAnswers(newAnswers);
    if (firstUnansweredIndex === -1) {
      // All questions answered
      setCurrentIndex(questions.length - 1);
    } else {
      setCurrentIndex(firstUnansweredIndex);
    }
  }, [positionsData, address]);

  // Process transaction queue
  useEffect(() => {
    const processQueue = async () => {
      if (
        isProcessingQueue ||
        pendingTransactions.length === 0 ||
        !address ||
        !positionsData?.triples
      )
        return;

      setIsProcessingQueue(true);
      const currentTx = pendingTransactions[0];
      const answer = answers[currentTx.questionId];

      // Skip if answer is neutral (4)
      if (answer === 4) {
        setTransactionStatuses((prev) => ({
          ...prev,
          [currentTx.questionId]: {
            questionId: currentTx.questionId,
            status: "success",
          },
        }));
        setPendingTransactions((prev) => prev.slice(1));
        setIsProcessingQueue(false);
        return;
      }

      // Calculate deposit amount based on answer
      let multiplier = 0;
      if (answer <= 3) {
        // Disagree (1-3)
        multiplier = 4 - answer; // 3x for 1, 2x for 2, 1x for 3
      } else if (answer >= 5) {
        // Agree (5-7)
        multiplier = answer - 4; // 1x for 5, 2x for 6, 3x for 7
      }

      const depositAmount = parseUnits(
        (Number(minDeposit) * multiplier).toString(),
        18,
      );
      const handleRedeemDelegation = async () => {
        console.log("REDEEMING DELEGATION");
        if (
          !delegation ||
          !delegatorSmartAccount ||
          !pimlicoClient ||
          !delegateSmartAccount
        ) {
          return;
        }
        const { fast: fee } = await pimlicoClient?.getUserOperationGasPrice();
        const triple = positionsData.triples.find(
          (t) => t.term_id === currentTx.tripleId.toString(),
        );
        if (!triple) {
          throw new Error("Triple not found in positions data");
        }
        const redeemData = prepareRedeemDelegation(
          delegation,
          delegatorSmartAccount.address,
          depositAmount,
          triple.term_id,
        );
        const userOperationHash = await bundlerClient!.sendUserOperation({
          account: delegateSmartAccount,
          calls: [
            {
              to: getDeleGatorEnvironment(baseSepolia.id).DelegationManager,
              data: redeemData,
            },
          ],
          ...fee,
          paymaster: paymasterClient,
        });

        const { receipt } = await bundlerClient!.waitForUserOperationReceipt({
          hash: userOperationHash,
        });

        console.log("[TRANSACTION HASH]");
        console.log(receipt.transactionHash);

        //setRedeemDelegationHash(receipt.transactionHash);
      };
      handleRedeemDelegation();

      /*
            try {
              // Find the triple in positionsData to get the correct vault ID
              const triple = positionsData.triples.find(
                (t) => t.term_id === currentTx.tripleId.toString(),
              );
              if (!triple) {
                throw new Error("Triple not found in positions data");
              }
      
              // Get the correct vault ID based on the answer
              const vaultId =
      positionsData,
                answer <= 3 ? BigInt(triple.term_id) : BigInt(triple.counter_term_id);
      
              
              const hash = await writeContractAsync({
                address: MULTIVAULT_CONTRACT_ADDRESS as `0x${string}`,
                abi: multivaultAbi as Abi,
                functionName: "depositTriple",
                args: [address as `0x${string}`, vaultId],
                value: depositAmount,
                chain: baseSepolia,
              });
      
              setTransactionStatuses((prev) => ({
                ...prev,
                [currentTx.questionId]: {
                  questionId: currentTx.questionId,
                  status: "success",
                  txHash: hash,
                },
              }));
      
              onReceipt((receipt) => {
                console.log("Transaction confirmed:", receipt);
              });
            } catch (err) {
              setTransactionStatuses((prev) => ({
                ...prev,
                [currentTx.questionId]: {
                  questionId: currentTx.questionId,
                  status: "error",
                },
              }));
              console.error("Error depositing triple:", err);
              if (err instanceof Error) {
                setFormError(
                  `Error: ${err.message}${err.cause ? ` (Cause: ${JSON.stringify(err.cause)})` : ""}`,
                );
              } else {
                setFormError(`An unknown error occurred: ${JSON.stringify(err)}`);
              }
            }
      
            // Remove processed transaction from queue
            setPendingTransactions((prev) => prev.slice(1));
            setIsProcessingQueue(false);
          };
      
          processQueue();
          */
    };
    processQueue()
  }, [
    bundlerClient,
    delegateSmartAccount,
    delegatorSmartAccount,
    delegation,
    paymasterClient,
    pimlicoClient,
    pendingTransactions,
    isProcessingQueue,
    address,
    writeContractAsync,
    onReceipt,
    answers,
    minDeposit,
    positionsData,
  ]);

  // Hydrate once on mount (fire-and-forget)
  useEffect(() => {
    if (typeof window === "undefined" || !address) return;
    try {
      const a = sessionStorage.getItem(STORAGE_ANS);
      if (a) {
        const parsedAnswers = JSON.parse(a);
        setAnswers(parsedAnswers);
        // Find the first unanswered question
        const firstUnansweredIndex = questions.findIndex(
          (q) => parsedAnswers[q.id] === undefined,
        );
        if (firstUnansweredIndex !== -1) {
          setCurrentIndex(firstUnansweredIndex);
        } else {
          // If all questions are answered, set to the last question
          setCurrentIndex(questions.length - 1);
        }
      }
    } catch {}
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
        setFormError("Please connect your wallet");
        return;
      }

      if (currentChainId !== 84532) {
        console.warn(
          `User is on chain ${currentChainId} instead of Base Sepolia (84532)`,
        );
      }

      setAnswers((prev) => ({ ...prev, [id]: value }));
      const idx = questions.findIndex((q) => q.id === id);

      if (idx === currentIndex && currentIndex < total - 1) {
        // Advance to next question immediately
        setCurrentIndex(idx + 1);
      }

      // Add transaction to queue
      const question = questions.find((q) => q.id === id);
      if (question?.triple) {
        setPendingTransactions((prev) => [
          ...prev,
          {
            questionId: id,
            tripleId: question.triple.id,
            answer: value,
          },
        ]);

        // Set initial pending status
        setTransactionStatuses((prev) => ({
          ...prev,
          [id]: { questionId: id, status: "pending" },
        }));
      }
    },
    [currentIndex, total, address, currentChainId],
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
        try {
          track("Completed Web3 Assessment");
        } catch {}

        // TODO: Add blockchain interaction here
        // For example, storing answers on-chain or minting an NFT

        // Navigate to results (answers/testId still in sessionStorage)
        router.push("/results");
      } finally {
        setIsSubmitting(false);
      }
    },
    [answers, router, total, address],
  );

  const allAnswered = Object.keys(answers).length === total;
  const answeredCount = Object.keys(answers).length;
  const remainingCount = total - answeredCount;
  const visible = questions;
  console.log(questions);
  console.log(visible);

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Web3 Personality Assessment</h2>

      {currentChainId !== 84532 && (
        <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-700 rounded-md text-yellow-500 text-sm">
          <p className="font-bold">Network Warning</p>
          <p>
            This app is designed for the Base Sepolia network (Chain ID: 84532).
          </p>
          <p className="mt-1">Current network: Chain ID: {currentChainId}</p>
          <p className="mt-2">
            You may attempt to deposit on your current network, but it might not
            work as expected.
          </p>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-600">
          <p>
            {answeredCount} question{answeredCount !== 1 ? "s" : ""} already
            replied
          </p>
          <p>
            {remainingCount} / {total} question{remainingCount !== 1 ? "s" : ""}{" "}
            left
          </p>
        </div>
        <button
          type="submit"
          disabled={!allAnswered || isSubmitting || !address}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:bg-gray-300 disabled:text-gray-600 transition-opacity"
        >
          {isSubmitting ? "Submitting..." : "Submit Answers"}
        </button>
      </div>

      {formError ? (
        <p className="mb-4 text-red-600" role="alert">
          {formError}
        </p>
      ) : null}

      <div className="mb-8 h-[200px] w-full relative overflow-hidden rounded-lg">
        <div
          ref={containerRef}
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
          {/*

                    <DynamicGraph
                        width={dimensions.width}
                        height={dimensions.height}
                    />
          */}
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
            const isAnswered = answers[q.id] !== undefined;

            return (
              <motion.div
                key={q.id}
                initial={{ y: isActive ? -10 : 0, opacity: isActive ? 1 : 0.6 }}
                animate={{ y: 0, opacity: isActive ? 1 : 0.5 }}
                exit={{ y: 10, opacity: 0 }}
                transition={ANIM}
                className={`${isActive ? "mb-8" : "mb-4"} ${isAnswered ? "opacity-75" : ""}`}
              >
                <Question
                  id={q.id}
                  text={q.text}
                  value={answers[q.id] ?? 0}
                  onChange={handleAnswerChange}
                  isLoading={txStatus?.status === "pending"}
                  isSuccess={txStatus?.status === "success"}
                  isAnswered={isAnswered}
                  explorerButton={
                    txStatus?.status === "success" &&
                    txStatus.txHash && (
                      <button
                        type="button"
                        className="flex items-center gap-1 px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700 transition text-xs"
                        onClick={() =>
                          window.open(
                            `${BLOCK_EXPLORER_URL}/tx/${txStatus.txHash}`,
                            "_blank",
                          )
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-external-link"
                          viewBox="0 0 24 24"
                        >
                          <path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" x2="21" y1="14" y2="3" />
                        </svg>
                        Explorer
                      </button>
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
