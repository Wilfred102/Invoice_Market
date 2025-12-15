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
      <div className="d-flex align-items-center gap-2">
        <span className="badge">{addr}</span>
        <button className="btn" onClick={signOut}>Sign out</button>
      </div>
    )
  }

  return (
    <button className="btn btn-primary" onClick={onConnect}>
      Connect Wallet
    </button>
  )
}
