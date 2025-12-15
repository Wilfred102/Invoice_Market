import { openContractCall } from '@stacks/connect'
import {
  callReadOnlyFunction,
  cvToJSON,
  uintCV,
  principalCV,
  noneCV,
  someCV,
  contractPrincipalCV,
  stringUtf8CV,
} from '@stacks/transactions'
import { CONTRACT_ADDRESS, CONTRACT_NAME, network, APP_NAME, APP_ICON } from './config'
import { userSession } from './wallet'

export async function getInvoice(id: bigint | number) {
  const res = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'get-invoice',
    functionArgs: [uintCV(BigInt(id))],
    network,
    senderAddress: '' as any, // not required for read-only in modern stacks.js, kept for compat
  })
  return cvToJSON(res)
}

function openCall(opts: Parameters<typeof openContractCall>[0]) {
  return new Promise<void>((resolve, reject) => {
    openContractCall({
      appDetails: { name: APP_NAME, icon: APP_ICON },
      userSession,
      ...opts,
      onFinish: () => resolve(),
      onCancel: () => reject(new Error('User cancelled transaction')),
      network,
    })
  })
}

export async function createInvoice(params: {
  client: string
  boss?: string
  amount: bigint | number
  token?: { address: string; name: string } // SIP-010 contract principal, optional
  dueDate: bigint | number
  memo: string
}) {
  const args = [
    principalCV(params.client),
    params.boss ? someCV(principalCV(params.boss)) : noneCV(),
    uintCV(BigInt(params.amount)),
    params.token ? someCV(contractPrincipalCV(params.token.address, params.token.name)) : noneCV(),
    uintCV(BigInt(params.dueDate)),
    stringUtf8CV(params.memo),
  ]

  return openCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'create-invoice',
    functionArgs: args,
  })
}

export async function sendInvoice(invoiceId: bigint | number) {
  return openCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'send-invoice',
    functionArgs: [uintCV(BigInt(invoiceId))],
  })
}

export async function approveInvoice(invoiceId: bigint | number) {
  return openCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'approve-invoice',
    functionArgs: [uintCV(BigInt(invoiceId))],
  })
}

export async function disputeInvoice(invoiceId: bigint | number, reason: string) {
  return openCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'dispute-invoice',
    functionArgs: [uintCV(BigInt(invoiceId)), stringUtf8CV(reason)],
  })
}

export async function payInvoice(params: {
  invoiceId: bigint | number
  tokenImpl?: { address: string; name: string } // optional trait reference; omit for STX
}) {
  const arg = params.tokenImpl
    ? someCV(contractPrincipalCV(params.tokenImpl.address, params.tokenImpl.name))
    : noneCV()
  return openCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'pay-invoice',
    functionArgs: [uintCV(BigInt(params.invoiceId)), arg],
  })
}
