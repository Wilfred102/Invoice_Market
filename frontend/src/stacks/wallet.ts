import { showConnect } from '@stacks/connect'
import { AppConfig, UserSession } from '@stacks/auth'
import { APP_ICON, APP_NAME, network } from './config'

const appConfig = new AppConfig(['store_write', 'publish_data'])
export const userSession = new UserSession({ appConfig })

export function ensureSignedIn() {
  if (!userSession.isUserSignedIn() && userSession.isSignInPending()) {
    userSession.handlePendingSignIn().catch(console.error)
  }
}

export function connectWallet() {
  return new Promise<void>((resolve, reject) => {
    showConnect({
      appDetails: {
        name: APP_NAME,
        icon: APP_ICON,
      },
      userSession,
      onFinish: () => resolve(),
      onCancel: () => reject(new Error('User cancelled connect')),
      redirectTo: '/',
      authOrigin: network.coreApiUrl?.includes('testnet')
        ? 'https://testnet.connect.hiro.so'
        : 'https://connect.hiro.so',
    })
  })
}

export function getAddress(): string | null {
  if (!userSession.isUserSignedIn()) return null
  const data = userSession.loadUserData()
  // prefer STX address for the selected network
  const profile = data.profile as any
  const stx = profile?.stxAddress
  return stx?.mainnet && stx?.testnet
    ? (network.coreApiUrl?.includes('testnet') ? stx.testnet : stx.mainnet)
    : null
}

export function signOut() {
  userSession.signUserOut()
  window.location.reload()
}
