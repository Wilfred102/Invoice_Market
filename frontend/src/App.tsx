import React from 'react'

// Mock wallet and contract functions for demo
const mockEnsureSignedIn = () => Promise.resolve()
const mockCreateInvoice = (data: any) => {
  console.log('Creating invoice:', data)
  return Promise.resolve({ txid: 'mock-tx-' + Date.now() })
}
const mockSendInvoice = (id: string) => {
  console.log('Sending invoice:', id)
  return Promise.resolve({ txid: 'mock-tx-' + Date.now() })
}
const mockApproveInvoice = (id: string) => {
  console.log('Approving invoice:', id)
  return Promise.resolve({ txid: 'mock-tx-' + Date.now() })
}
const mockDisputeInvoice = (id: string, reason: string) => {
  console.log('Disputing invoice:', id, reason)
  return Promise.resolve({ txid: 'mock-tx-' + Date.now() })
}
const mockPayInvoice = (id: string, token?: any) => {
  console.log('Paying invoice:', id, token)
  return Promise.resolve({ txid: 'mock-tx-' + Date.now() })
}
const mockGetInvoice = (id: string) => {
  console.log('Fetching invoice:', id)
  return Promise.resolve({
    freelancer: 'SP2A8V93XXB43Q8JXQNCS9EBFHZJ6A2HVXHC4F4ZB',
    client: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
    boss: null,
    amount: '5000000',
    token: null,
    dueDate: '12345',
    memo: 'Web design services',
    status: 'pending',
    disputeReason: null
  })
}

const ConnectWallet = () => {
  const [address, setAddress] = React.useState<string | null>(null)
  
  return (
    <div>
      {address ? (
        <div className="wallet-connected">
          <span className="badge">{address.slice(0, 6)}...{address.slice(-4)}</span>
        </div>
      ) : (
        <button 
          className="btn btn-secondary"
          onClick={() => setAddress('SP2A8V93XXB43Q8JXQNCS9EBFHZJ6A2HVXHC4F4ZB')}
        >
          Connect Wallet
        </button>
      )}
    </div>
  )
}

const CONTRACT_ADDRESS = 'SP2A8V93XXB43Q8JXQNCS9EBFHZJ6A2HVXHC4F4ZB'
const CONTRACT_NAME = 'invoice-market'
const NETWORK = 'mainnet'

export default function App() {
  React.useEffect(() => {
    mockEnsureSignedIn()
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
  const [success, setSuccess] = React.useState<string | null>(null)

  const run = async (fn: () => Promise<any>, successMsg?: string) => {
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      const result = await fn()
      if (successMsg) {
        setSuccess(successMsg + (result?.txid ? ` (TX: ${result.txid.slice(0, 8)}...)` : ''))
      }
    } catch (e: any) {
      setError(e?.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  const handleFetchInvoice = async () => {
    const data = await mockGetInvoice(invoiceId)
    setFetched(data)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container">
        <header className="nav">
          <div className="brand">
            <div className="logo">📄</div>
            <span>Invoice Market</span>
          </div>
          <ConnectWallet />
        </header>

        <section className="section">
          <span className="badge">Network: {NETWORK}</span>
          <div className="badge">Contract: {CONTRACT_ADDRESS}.{CONTRACT_NAME}</div>
        </section>

        {error && (
          <div className="card" style={{ background: '#fee', border: '2px solid #faa' }}>
            <strong style={{ color: '#c33' }}>Error:</strong> {error}
          </div>
        )}

        {success && (
          <div className="card" style={{ background: '#efe', border: '2px solid #afa' }}>
            <strong style={{ color: '#3a3' }}>Success:</strong> {success}
          </div>
        )}

        <div className="grid">
          <div className="card">
            <h3>📝 Create Invoice</h3>
            <div className="grid grid-2">
              <input 
                className="input" 
                placeholder="Client principal (SP... or ST...)" 
                value={createForm.client} 
                onChange={e => setCreateForm(f => ({ ...f, client: e.target.value }))} 
              />
              <input 
                className="input" 
                placeholder="Boss principal (optional)" 
                value={createForm.boss} 
                onChange={e => setCreateForm(f => ({ ...f, boss: e.target.value }))} 
              />
              <input 
                className="input" 
                placeholder="Amount (micro-STX or token units)" 
                value={createForm.amount} 
                onChange={e => setCreateForm(f => ({ ...f, amount: e.target.value }))} 
              />
              <input 
                className="input" 
                placeholder="Token contract address (optional)" 
                value={createForm.tokenAddr} 
                onChange={e => setCreateForm(f => ({ ...f, tokenAddr: e.target.value }))} 
              />
              <input 
                className="input" 
                placeholder="Token contract name (optional)" 
                value={createForm.tokenName} 
                onChange={e => setCreateForm(f => ({ ...f, tokenName: e.target.value }))} 
              />
              <input 
                className="input" 
                placeholder="Due date (block height)" 
                value={createForm.dueDate} 
                onChange={e => setCreateForm(f => ({ ...f, dueDate: e.target.value }))} 
              />
            </div>
            <textarea 
              className="input" 
              placeholder="Memo (description of services)" 
              value={createForm.memo} 
              onChange={e => setCreateForm(f => ({ ...f, memo: e.target.value }))} 
              rows={3}
            />
            <button 
              className="btn btn-primary" 
              disabled={loading} 
              onClick={() => run(
                () => mockCreateInvoice({
                  client: createForm.client,
                  boss: createForm.boss || undefined,
                  amount: BigInt(createForm.amount || '0'),
                  token: createForm.tokenAddr && createForm.tokenName 
                    ? { address: createForm.tokenAddr, name: createForm.tokenName } 
                    : undefined,
                  dueDate: BigInt(createForm.dueDate || '0'),
                  memo: createForm.memo,
                }),
                'Invoice created successfully'
              )}
            >
              {loading ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>

          <div className="card">
            <h3>🔄 Invoice Actions</h3>
            <input 
              className="input" 
              placeholder="Invoice ID (uint)" 
              value={invoiceId} 
              onChange={e => setInvoiceId(e.target.value)} 
            />
            
            <div className="grid grid-2" style={{ marginTop: '1rem' }}>
              <button 
                className="btn btn-secondary" 
                disabled={loading || !invoiceId}
                onClick={() => run(() => mockSendInvoice(invoiceId), 'Invoice sent to client')}
              >
                📤 Send
              </button>
              
              <button 
                className="btn btn-secondary" 
                disabled={loading || !invoiceId}
                onClick={() => run(() => mockApproveInvoice(invoiceId), 'Invoice approved')}
              >
                ✅ Approve
              </button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <textarea 
                className="input" 
                placeholder="Dispute reason (if disputing)" 
                value={disputeReason} 
                onChange={e => setDisputeReason(e.target.value)}
                rows={2}
              />
              <button 
                className="btn btn-secondary" 
                disabled={loading || !invoiceId || !disputeReason}
                onClick={() => run(
                  () => mockDisputeInvoice(invoiceId, disputeReason),
                  'Invoice disputed'
                )}
                style={{ marginTop: '0.5rem', width: '100%' }}
              >
                ⚠️ Dispute
              </button>
            </div>

            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e0e0e0' }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>💰 Pay Invoice</h4>
              <div className="grid grid-2">
                <input 
                  className="input" 
                  placeholder="Token address (optional)" 
                  value={payTokenAddr} 
                  onChange={e => setPayTokenAddr(e.target.value)} 
                />
                <input 
                  className="input" 
                  placeholder="Token name (optional)" 
                  value={payTokenName} 
                  onChange={e => setPayTokenName(e.target.value)} 
                />
              </div>
              <button 
                className="btn btn-primary" 
                disabled={loading || !invoiceId}
                onClick={() => run(
                  () => mockPayInvoice(
                    invoiceId,
                    payTokenAddr && payTokenName 
                      ? { address: payTokenAddr, name: payTokenName }
                      : undefined
                  ),
                  'Invoice paid successfully'
                )}
                style={{ marginTop: '0.5rem', width: '100%' }}
              >
                Pay Invoice
              </button>
            </div>
          </div>

          <div className="card">
            <h3>🔍 Get Invoice Details</h3>
            <input 
              className="input" 
              placeholder="Invoice ID to fetch" 
              value={invoiceId} 
              onChange={e => setInvoiceId(e.target.value)} 
            />
            <button 
              className="btn btn-secondary" 
              disabled={loading || !invoiceId}
              onClick={() => run(handleFetchInvoice, 'Invoice fetched')}
              style={{ marginTop: '0.5rem' }}
            >
              Fetch Invoice
            </button>

            {fetched && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 0.75rem 0' }}>Invoice Details</h4>
                <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <div><strong>Freelancer:</strong> {fetched.freelancer}</div>
                  <div><strong>Client:</strong> {fetched.client}</div>
                  {fetched.boss && <div><strong>Boss:</strong> {fetched.boss}</div>}
                  <div><strong>Amount:</strong> {fetched.amount} {fetched.token ? 'tokens' : 'micro-STX'}</div>
                  <div><strong>Due Date:</strong> Block {fetched.dueDate}</div>
                  <div><strong>Status:</strong> <span className="badge">{fetched.status}</span></div>
                  <div><strong>Memo:</strong> {fetched.memo}</div>
                  {fetched.disputeReason && <div><strong>Dispute:</strong> {fetched.disputeReason}</div>}
                </div>
              </div>
            )}
          </div>
        </div>

        <footer style={{ textAlign: 'center', padding: '2rem', color: '#fff', opacity: 0.8 }}>
          <p>Invoice Market • Stacks Blockchain • Built with Clarity</p>
        </footer>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .nav { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 0; }
        .brand { display: flex; align-items: center; gap: 0.75rem; color: #fff; font-size: 1.5rem; font-weight: 700; }
        .logo { font-size: 2rem; }
        .wallet-connected { display: flex; align-items: center; gap: 0.5rem; }
        .section { display: flex; gap: 1rem; margin: 1.5rem 0; flex-wrap: wrap; }
        .badge { background: rgba(255,255,255,0.2); color: #fff; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.85rem; backdrop-filter: blur(10px); }
        .grid { display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); }
        .grid-2 { display: grid; gap: 0.75rem; grid-template-columns: 1fr 1fr; }
        .card { background: #fff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .card h3 { margin: 0 0 1rem 0; color: #333; font-size: 1.25rem; }
        .card h4 { color: #555; font-size: 1rem; }
        .input { width: 100%; padding: 0.75rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 0.95rem; transition: border-color 0.2s; }
        .input:focus { outline: none; border-color: #667eea; }
        textarea.input { resize: vertical; font-family: inherit; }
        .btn { padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.2s; width: 100%; margin-top: 1rem; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; }
        .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); }
        .btn-secondary { background: #f0f0f0; color: #333; }
        .btn-secondary:hover:not(:disabled) { background: #e0e0e0; }
        @media (max-width: 768px) {
          .grid { grid-template-columns: 1fr; }
          .grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}