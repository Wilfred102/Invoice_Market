import React from 'react'
import { connectWallet, getAddress, signOut } from '../stacks/wallet'

export default function ConnectWallet() {
  const [addr, setAddr] = React.useState<string | null>(getAddress())

  const onConnect = async () => {
    await connectWallet()
    setAddr(getAddress())
  }

  if (addr) {
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <code>{addr}</code>
        <button onClick={signOut}>Sign out</button>
      </div>
    )
  }

  return (
    <button onClick={onConnect}>
      Connect Wallet
    </button>
  )
}
