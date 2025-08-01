'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { parseUnits } from 'viem'
import { Abi } from 'viem'
import { MULTIVAULT_CONTRACT_ADDRESS, BLOCK_EXPLORER_URL } from '@/config/blockchain'
import { useDepositTriple } from '@/hooks/useDepositTriple'
import { multivaultAbi } from '@/lib/abis/multivault'
import { useChainId } from 'wagmi'
import { baseSepolia } from 'viem/chains'
import { ExternalLink } from 'lucide-react'

export default function TripleDepositPage() {
    const { address } = useAccount()
    const currentChainId = useChainId()
    const [amount, setAmount] = useState('')
    const [tripleId, setTripleId] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [txHash, setTxHash] = useState('')
    const [error, setError] = useState('')

    // Default contract address from the multivault contract
    const contractAddress = MULTIVAULT_CONTRACT_ADDRESS

    const {
        writeContractAsync,
        receipt,
        awaitingWalletConfirmation,
        awaitingOnChainConfirmation,
        onReceipt
    } = useDepositTriple(contractAddress)


    const handleDeposit = async () => {
        if (!address) {
            setError('Please connect your wallet')
            return
        }

        if (!tripleId) {
            setError('Please enter a Triple ID')
            return
        }

        if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount')
            return
        }

        // Show a warning if not on Base Sepolia, but allow the transaction to proceed
        if (currentChainId !== 84532) {
            console.warn(`User is on chain ${currentChainId} instead of Base Sepolia (84532)`)
        }

        try {
            setIsLoading(true)
            setError('')

            // Parse the amount to wei (18 decimals)
            const parsedAmount = parseUnits(amount, 18)

            // Call the depositTriple function without specifying chain ID
            const hash = await writeContractAsync({
                address: contractAddress as `0x${string}`,
                abi: multivaultAbi as Abi,
                functionName: 'depositTriple',
                args: [address as `0x${string}`, BigInt(tripleId)],
                value: parsedAmount,
                chain: baseSepolia
                // Remove chainId parameter to let the wallet use its current chain
            })

            setTxHash(hash)

            // Set up receipt handler
            onReceipt((receipt) => {
                console.log('Transaction confirmed:', receipt)
                setIsLoading(false)
            })
        } catch (err) {
            console.error('Error depositing:', err)
            // Provide more detailed error information
            if (err instanceof Error) {
                setError(`Error: ${err.message}${err.cause ? ` (Cause: ${JSON.stringify(err.cause)})` : ''}`)
            } else {
                setError(`An unknown error occurred: ${JSON.stringify(err)}`)
            }
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
            <div className="w-full max-w-md p-6 bg-[#111] rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold mb-6 text-center">Triple Deposit</h1>

                {currentChainId !== 84532 && (
                    <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-700 rounded-md text-yellow-500 text-sm">
                        <p className="font-bold">Network Warning</p>
                        <p>This app is designed for the Base Sepolia network (Chain ID: 84532).</p>
                        <p className="mt-1">Current network:  `Chain ID: ${currentChainId}`</p>
                        <p className="mt-2">You may attempt to deposit on your current network, but it might not work as expected.</p>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label htmlFor="tripleId" className="block text-sm font-medium mb-1">
                            Triple ID
                        </label>
                        <input
                            id="tripleId"
                            type="text"
                            value={tripleId}
                            onChange={(e) => setTripleId(e.target.value)}
                            placeholder="Enter Triple ID"
                            className="w-full p-2 border border-gray-700 rounded bg-[#222] text-white"
                        />
                    </div>

                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium mb-1">
                            Amount (ETH)
                        </label>
                        <input
                            id="amount"
                            type="text"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.0"
                            className="w-full p-2 border border-gray-700 rounded bg-[#222] text-white"
                        />
                    </div>

                    <button
                        onClick={handleDeposit}
                        disabled={isLoading || !address}
                        className="w-full py-2 px-4 bg-[var(--brand,#3b82f6)] text-white rounded hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Processing...' :
                            !address ? 'Connect Wallet First' :
                                'Deposit'}
                    </button>

                    {error && (
                        <div className="p-2 text-red-500 text-sm">
                            {error}
                        </div>
                    )}


                    {awaitingWalletConfirmation && (
                        <div className="p-2 text-yellow-500 text-sm">
                            Please confirm the transaction in your wallet...
                        </div>
                    )}

                    {awaitingOnChainConfirmation && (
                        <div className="p-2 text-yellow-500 text-sm">
                            Transaction submitted, waiting for confirmation...
                        </div>
                    )}

                    {txHash && (
                        <div className="p-2 text-green-500 text-sm break-all">
                            <p>Transaction Hash:</p>
                            <a
                                href={`${BLOCK_EXPLORER_URL}/tx/${txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:underline flex items-center gap-1"
                            >
                                {txHash}
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    )}

                    {receipt && (
                        <div className="p-2 text-green-500 text-sm">
                            Transaction confirmed!
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}