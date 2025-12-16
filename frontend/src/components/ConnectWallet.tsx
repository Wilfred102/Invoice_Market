import React from 'react'
import { connectWallet, getAddress, signOut, type WalletProvider } from '../stacks/wallet'

export default function ConnectWallet() {
  const [addr, setAddr] = React.useState<string | null>(getAddress())
  const [showOptions, setShowOptions] = React.useState(false)

  const chooseProvider = async (p: WalletProvider) => {
    try {
      await connectWallet(p)
      setAddr(getAddress())
    } finally {
      setShowOptions(false)
    }
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
    <>
      <button className="btn btn-primary" onClick={() => setShowOptions(true)}>
        Connect Wallet
      </button>

      {showOptions && (
        <div className="modal-backdrop" onClick={() => setShowOptions(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Select a wallet</h3>
              <button className="btn" onClick={() => setShowOptions(false)}>✕</button>
            </div>
            <div className="grid">
              <button className="btn btn-primary btn-lg" onClick={() => chooseProvider('hiro')}>Hiro Wallet</button>
              <button className="btn btn-outline btn-lg" onClick={() => chooseProvider('leather')}>Leather Wallet</button>
            </div>
            <p className="subtitle" style={{ marginTop: 12 }}>
              You'll be redirected to your wallet extension to approve access.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
