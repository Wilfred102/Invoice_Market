import React from 'react'
import ConnectWallet from './components/ConnectWallet'
import { ensureSignedIn } from './stacks/wallet'
import {
  createInvoice,
  sendInvoice,
  approveInvoice,
  disputeInvoice,
  payInvoice,
  getInvoice,
} from './stacks/contract'
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK } from './stacks/config'

export default function App() {
  React.useEffect(() => {
    ensureSignedIn()
  }, [])

  const [createForm, setCreateForm] = React.useState({
    client: '',
    boss: '',
    amount: '0',
    tokenAddr: '',
    tokenName: '',
    dueDate: '0',
    memo: '',
  })

  const [invoiceId, setInvoiceId] = React.useState('')
  const [disputeReason, setDisputeReason] = React.useState('')
  const [payTokenAddr, setPayTokenAddr] = React.useState('')
  const [payTokenName, setPayTokenName] = React.useState('')
  const [fetched, setFetched] = React.useState<any | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const run = async (fn: () => Promise<any>) => {
    setError(null)
    setLoading(true)
    try {
      await fn()
    } catch (e: any) {
      setError(e?.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <header className="nav">
        <div className="brand">
          <div className="logo" />
          <span>Invoice Market</span>
        </div>
        <ConnectWallet />
      </header>

      <section className="section">
        <span className="badge">Network: {NETWORK}</span>
        <div className="badge">Contract: {CONTRACT_ADDRESS}.{CONTRACT_NAME}</div>
      </section>

      {error && (
        <div className="card">
          <strong style={{ color: '#ffb3b3' }}>Error:</strong> {error}
        </div>
      )}

      <div className="grid">
        <div className="card">
          <h3>Create invoice</h3>
          <div className="grid grid-2">
            <input className="input" placeholder="Client principal (SP... or ST...)" value={createForm.client} onChange={e => setCreateForm(f => ({ ...f, client: e.target.value }))} />
            <input className="input" placeholder="Boss principal (optional)" value={createForm.boss} onChange={e => setCreateForm(f => ({ ...f, boss: e.target.value }))} />
            <input className="input" placeholder="Amount (uint in micro-STX or token units)" value={createForm.amount} onChange={e => setCreateForm(f => ({ ...f, amount: e.target.value }))} />
            <input className="input" placeholder="Token contract address (optional)" value={createForm.tokenAddr} onChange={e => setCreateForm(f => ({ ...f, tokenAddr: e.target.value }))} />
            <input className="input" placeholder="Token contract name (optional)" value={createForm.tokenName} onChange={e => setCreateForm(f => ({ ...f, tokenName: e.target.value }))} />
            <input className="input" placeholder="Due date (block height)" value={createForm.dueDate} onChange={e => setCreateForm(f => ({ ...f, dueDate: e.target.value }))} />
          </div>
          <textarea className="input" placeholder="Memo" value={createForm.memo} onChange={e => setCreateForm(f => ({ ...f, memo: e.target.value }))} />
          <button className="btn btn-primary" disabled={loading} onClick={() => run(() => createInvoice({
            client: createForm.client,
            boss: createForm.boss || undefined,
            amount: BigInt(createForm.amount || '0'),
            token: createForm.tokenAddr && createForm.tokenName ? { address: createForm.tokenAddr, name: createForm.tokenName } : undefined,
            dueDate: BigInt(createForm.dueDate || '0'),
            memo: createForm.memo,
          }))}>Create</button>
        </div>

        <div className="card">
          <h3>Send / approv
