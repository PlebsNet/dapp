'use client'

import { useState } from 'react'
import { useCreateTriple } from '@/hooks/useCreateTriple'
import { useDepositTriple } from '@/hooks/useDepositTriple'
import { question } from '@/data/question'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/card'
import { MULTIVAULT_CONTRACT_ADDRESS } from '@/consts'
import { getMultivaultContractConfig } from '@/hooks/useMultivaultContract'
import type { TransactionReceipt } from 'viem'

interface TripleStatus {
    id: number
    question: string
    createStatus: 'idle' | 'loading' | 'success' | 'error'
    depositStatus: 'idle' | 'loading' | 'success' | 'error'
    tripleId?: string
    error?: string
}

export default function CreateTriplesPage() {
    const [tripleStatuses, setTripleStatuses] = useState<TripleStatus[]>(
        question.map((q) => ({
            id: q.id,
            question: q.question,
            createStatus: 'idle',
            depositStatus: 'idle',
        }))
    )
    const [isProcessing, setIsProcessing] = useState(false)
    const createTriple = useCreateTriple()
    const depositTriple = useDepositTriple(MULTIVAULT_CONTRACT_ADDRESS)

    const processAllTriples = async () => {
        setIsProcessing(true)
        const newStatuses = [...tripleStatuses]

        for (let i = 0; i < question.length; i++) {
            const q = question[i]
            try {
                // Create triple
                newStatuses[i].createStatus = 'loading'
                setTripleStatuses([...newStatuses])

                await createTriple.writeContractAsync({
                    ...getMultivaultContractConfig(MULTIVAULT_CONTRACT_ADDRESS),
                    functionName: 'createTriple',
                    args: [q.triple.subject.id, q.triple.predicate.type, q.triple.object.type],
                    value: BigInt('6900000000000000') // 0.0069 ETH in wei
                })

                // Wait for transaction receipt
                const createReceipt = await new Promise<TransactionReceipt>((resolve) => {
                    createTriple.onReceipt((receipt) => {
                        resolve(receipt)
                    })
                })

                const tripleId = createReceipt.logs[0].topics[1] // Adjust based on your contract's event structure

                newStatuses[i].createStatus = 'success'
                newStatuses[i].tripleId = tripleId
                setTripleStatuses([...newStatuses])

                // Deposit triple
                newStatuses[i].depositStatus = 'loading'
                setTripleStatuses([...newStatuses])

                await depositTriple.writeContractAsync({
                    ...getMultivaultContractConfig(MULTIVAULT_CONTRACT_ADDRESS),
                    functionName: 'depositTriple',
                    args: [tripleId],
                })

                // Wait for transaction receipt
                await new Promise<TransactionReceipt>((resolve) => {
                    depositTriple.onReceipt((receipt) => {
                        resolve(receipt)
                    })
                })

                newStatuses[i].depositStatus = 'success'
                setTripleStatuses([...newStatuses])
            } catch (error) {
                newStatuses[i].createStatus = 'error'
                newStatuses[i].error = error instanceof Error ? error.message : 'Unknown error'
                setTripleStatuses([...newStatuses])
            }
        }
        setIsProcessing(false)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success':
                return 'text-green-500'
            case 'error':
                return 'text-red-500'
            case 'loading':
                return 'text-yellow-500'
            default:
                return 'text-gray-500'
        }
    }

    const copyTripleIds = () => {
        const tripleIds = tripleStatuses
            .filter((status) => status.tripleId)
            .map((status) => status.tripleId)
            .join('\n')
        navigator.clipboard.writeText(tripleIds)
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Create Triples</h1>

            <div className="mb-4 flex gap-4">
                <Button
                    onClick={processAllTriples}
                    disabled={isProcessing}
                >
                    {isProcessing ? 'Processing...' : 'Create All Triples'}
                </Button>

                <Button
                    onClick={copyTripleIds}
                    variant="outline"
                >
                    Copy Triple IDs
                </Button>
            </div>

            <div className="grid gap-4">
                {tripleStatuses.map((status) => (
                    <Card key={status.id} className="p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-medium">{status.question}</h3>
                                {status.tripleId && (
                                    <p className="text-sm text-gray-600">Triple ID: {status.tripleId}</p>
                                )}
                                {status.error && (
                                    <p className="text-sm text-red-500">{status.error}</p>
                                )}
                            </div>
                            <div className="flex gap-4">
                                <span className={getStatusColor(status.createStatus)}>
                                    Create: {status.createStatus}
                                </span>
                                <span className={getStatusColor(status.depositStatus)}>
                                    Deposit: {status.depositStatus}
                                </span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
} 