import { StacksMainnet, StacksTestnet } from '@stacks/network'

export type NetworkKind = 'mainnet' | 'testnet'

export const NETWORK: NetworkKind = (import.meta.env.VITE_STACKS_NETWORK as NetworkKind) || 'testnet'

export const network = NETWORK === 'mainnet' ? new StacksMainnet() : new StacksTestnet()

// Defaults pulled from Clarinet deployment plans
const DEFAULTS = {
  testnet: {
    contractAddress: 'ST2A8V93XXB43Q8JXQNCS9EBFHZJ6A2HVXHXF3NP8',
    contractName: 'invoice',
    explorer: 'https://explorer.hiro.so',
  },
  mainnet: {
    contractAddress: 'SP2A8V93XXB43Q8JXQNCS9EBFHZJ6A2HVXHC4F4ZB',
    contractName: 'invoice',
    explorer: 'https://explorer.hiro.so',
  },
} as const

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || DEFAULTS[NETWORK].contractAddress
export const CONTRACT_NAME = import.meta.env.VITE_CONTRACT_NAME || DEFAULTS[NETWORK].contractName

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Invoice Market'
export const APP_ICON = import.meta.env.VITE_APP_ICON || window.location.origin + '/favicon.ico'
