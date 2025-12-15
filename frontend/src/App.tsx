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
    <div style={{ fontFamily: 'Inter, system-ui, Arial', padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Invoice Market</h1>
        <ConnectWallet />
      </header>

      <section style={{ marginBottom: 16 }}>
        <div><strong>Network:</strong> {NETWORK}</div>
        <div><strong>Contract:</strong> {CONTRACT_ADDRESS}.{CONTRACT_NAME}</div>
      </section>

      {error && (
        <div style={{ background: '#ffeaea', border: '1px solid #ffb3b3', padding: 12, marginBottom: 16 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        <div style={{ border: '1px solid #eee', padding: 16, borderRadius: 8 }}>
          <h3>Create invoice</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input placeholder="Client principal (SP... or ST...)" value={createForm.client} onChange={e => setCreateForm(f => ({ ...f, client: e.target.value }))} />
            <input placeholder="Boss principal (optional)" value={createForm.boss} onChange={e => setCreateForm(f => ({ ...f, boss: e.target.value }))} />
            <input placeholder="Amount (uint in micro-STX or token units)" value={createForm.amount} onChange={e => setCreateForm(f => ({ ...f, amount: e.target.value }))} />
            <input placeholder="Token contract address (optional)" value={createForm.tokenAddr} onChange={e => setCreateForm(f => ({ ...f, tokenAddr: e.target.value }))} />
            <input placeholder="Token contract name (optional)" value={createForm.tokenName} onChange={e => setCreateForm(f => ({ ...f, tokenName: e.target.value }))} />
            <input placeholder="Due date (block height)" value={createForm.dueDate} onChange={e => setCreateForm(f => ({ ...f, dueDate: e.target.value }))} />
          </div>
          <textarea placeholder="Memo" value={createForm.memo} onChange={e => setCreateForm(f => ({ ...f, memo: e.target.value }))} style={{ width: '100%', marginTop: 8 }} />
          <button disabled={loading} onClick={() => run(() => createInvoice({
            client: createForm.client,
            boss: createForm.boss || undefined,
            amount: BigInt(createForm.amount || '0'),
            token: createForm.tokenAddr && createForm.tokenName ? { address: createForm.tokenAddr, name: createForm.tokenName } : undefined,
            dueDate: BigInt(createForm.dueDate || '0'),
            memo: createForm.memo,
          }))}>Create</button>
        </div>

        <div style={{ border: '1px solid #eee', padding: 16, borderRadius: 8 }}>
          <h3>Send / Approve / Dispute / Pay</h3>
          <input placeholder="Invoice ID" value={invoiceId} onChange={e => setInvoiceId(e.target.value)} />
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            <button disabled={loading} onClick={() => run(() => sendInvoice(BigInt(invoiceId)))}>Send</button>
            <button disabled={loading} onClick={() => run(() => approveInvoice(BigInt(invoiceId)))}>Approve</button>
            <input placeholder="Dispute reason" value={disputeReason} onChange={e => setDisputeReason(e.target.value)} />
            <button disabled={loading} onClick={() => run(() => disputeInvoice(BigInt(invoiceId), disputeReason))}>Dispute</button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            <input placeholder="Token impl address (optional)" value={payTokenAddr} onChange={e => setPayTokenAddr(e.target.value)} />
            <input placeholder="Token impl name (optional)" value={payTokenName} onChange={e => setPayTokenName(e.target.value)} />
            <button disabled={loading} onClick={() => run(() => payInvoice({
              invoiceId: BigInt(invoiceId),
              tokenImpl: payTokenAddr && payTokenName ? { address: payTokenAddr, name: payTokenName } : undefined,
            }))}>Pay</button>
          </div>
        </div>

        <div style={{ border: '1px solid #eee', padding: 16, borderRadius: 8 }}>
          <h3>Get invoice (read-only)</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <input placeholder="Invoice ID" value={invoiceId} onChange={e => setInvoiceId(e.target.value)} />
            <button disabled={loading} onClick={() => run(async () => {
              const res = await getInvoice(BigInt(invoiceId))
              setFetched(res)
            })}>Fetch</button>
          </div>
          {fetched && (
            <pre style={{ background: '#f7f7f7', padding: 12, marginTop: 8, overflowX: 'auto' }}>
              {JSON.stringify(fetched, null, 2)}
            </pre>
          )}
        </div>
      </div>

      <footer style={{ marginTop: 24, color: '#555' }}>
        Built with @stacks/connect and @stacks/transactions
      </footer>
    </div>
  )
}
