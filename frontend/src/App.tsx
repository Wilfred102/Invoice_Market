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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge">{address.slice(0, 6)}...{address.slice(-4)}</span>
        </div>
      ) : (
        <button 
          className="btn btn-outline"
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
    <div style={{ minHeight: '100vh' }}>
      <div className="container">
        <header className="nav-glass nav" style={{ marginTop: '24px' }}>
          <div className="brand">
            <div className="logo">📄</div>
            <span>Invoice Market</span>
          </div>
          <ConnectWallet />
        </header>

        <section className="section" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <span className="badge">Network: {NETWORK}</span>
          <span className="badge">Contract: {CONTRACT_ADDRESS}.{CONTRACT_NAME}</span>
        </section>

        {error && (
          <div className="card" style={{ background: 'rgba(220, 38, 38, 0.1)', borderColor: 'rgba(220, 38, 38, 0.3)' }}>
            <strong style={{ color: '#fca5a5' }}>Error:</strong> <span style={{ color: 'var(--text)' }}>{error}</span>
          </div>
        )}

        {success && (
          <div className="card" style={{ background: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)' }}>
            <strong style={{ color: '#86efac' }}>Success:</strong> <span style={{ color: 'var(--text)' }}>{success}</span>
          </div>
        )}

        <div className="grid">
          <div className="card">
            <h3 style={{ marginBottom: '16px', color: 'var(--text)' }}>📝 Create Invoice</h3>
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
              style={{ marginTop: '14px' }}
            />
            <button 
              className="btn btn-primary btn-lg" 
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
              style={{ marginTop: '14px' }}
            >
              {loading ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '16px', color: 'var(--text)' }}>🔄 Invoice Actions</h3>
            <input 
              className="input" 
              placeholder="Invoice ID (uint)" 
              value={invoiceId} 
              onChange={e => setInvoiceId(e.target.value)} 
            />
            
            <div className="grid grid-2" style={{ marginTop: '14px' }}>
              <button 
                className="btn" 
                disabled={loading || !invoiceId}
                onClick={() => run(() => mockSendInvoice(invoiceId), 'Invoice sent to client')}
              >
                📤 Send
              </button>
              
              <button 
                className="btn" 
                disabled={loading || !invoiceId}
                onClick={() => run(() => mockApproveInvoice(invoiceId), 'Invoice approved')}
              >
                ✅ Approve
              </button>
            </div>

            <div style={{ marginTop: '14px' }}>
              <textarea 
                className="input" 
                placeholder="Dispute reason (if disputing)" 
                value={disputeReason} 
                onChange={e => setDisputeReason(e.target.value)}
                rows={2}
              />
              <button 
                className="btn" 
                disabled={loading || !invoiceId || !disputeReason}
                onClick={() => run(
                  () => mockDisputeInvoice(invoiceId, disputeReason),
                  'Invoice disputed'
                )}
                style={{ marginTop: '8px' }}
              >
                ⚠️ Dispute
              </button>
            </div>

            <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
              <h4 style={{ margin: '0 0 8px 0', color: 'var(--text)' }}>💰 Pay Invoice</h4>
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
                style={{ marginTop: '8px' }}
              >
                Pay Invoice
              </button>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '16px', color: 'var(--text)' }}>🔍 Get Invoice Details</h3>
            <input 
              className="input" 
              placeholder="Invoice ID to fetch" 
              value={invoiceId} 
              onChange={e => setInvoiceId(e.target.value)} 
            />
            <button 
              className="btn" 
              disabled={loading || !invoiceId}
              onClick={() => run(handleFetchInvoice, 'Invoice fetched')}
              style={{ marginTop: '8px' }}
            >
              Fetch Invoice
            </button>

            {fetched && (
              <div style={{ marginTop: '14px', padding: '14px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <h4 style={{ margin: '0 0 12px 0', color: 'var(--text)' }}>Invoice Details</h4>
                <div style={{ display: 'grid', gap: '8px', fontSize: '0.9rem', color: 'var(--text)' }}>
                  <div><strong style={{ color: 'var(--muted)' }}>Freelancer:</strong> {fetched.freelancer}</div>
                  <div><strong style={{ color: 'var(--muted)' }}>Client:</strong> {fetched.client}</div>
                  {fetched.boss && <div><strong style={{ color: 'var(--muted)' }}>Boss:</strong> {fetched.boss}</div>}
                  <div><strong style={{ color: 'var(--muted)' }}>Amount:</strong> {fetched.amount} {fetched.token ? 'tokens' : 'micro-STX'}</div>
                  <div><strong style={{ color: 'var(--muted)' }}>Due Date:</strong> Block {fetched.dueDate}</div>
                  <div><strong style={{ color: 'var(--muted)' }}>Status:</strong> <span className="badge">{fetched.status}</span></div>
                  <div><strong style={{ color: 'var(--muted)' }}>Memo:</strong> {fetched.memo}</div>
                  {fetched.disputeReason && <div><strong style={{ color: 'var(--muted)' }}>Dispute:</strong> {fetched.disputeReason}</div>}
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="footer" style={{ paddingTop: '48px', paddingBottom: '24px' }}>
          <p>Invoice Market • Stacks Blockchain • Built with Clarity</p>
        </footer>
      </div>

      <style>{`
        :root {
          --bg: #071a2f;
          --bg-alt: #0b2547;
          --text: #e6f3ff;
          --muted: #9fbad6;
          --border: rgba(150, 200, 255, 0.18);
          --primary: #3aa0ff;
          --neon: #00e5ff;
          --shadow: 0 8px 24px rgba(0, 229, 255, 0.08);
        }

        html, body, #root { height: 100%; }
        body {
          margin: 0;
          background:
            radial-gradient(1200px 600px at 80% -10%, rgba(0,229,255,0.08), transparent 60%),
            linear-gradient(180deg, var(--bg), var(--bg-alt));
          color: var(--text);
          font: 14px/1.6 system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji";
        }

        * { box-sizing: border-box; }
        a { color: inherit; text-decoration: none; }

        .container { max-width: 1100px; margin: 0 auto; padding: 0 16px; }

        /* Top nav */
        .nav { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 24px; }
        .nav-glass {
          position: sticky; top: 0; z-index: 10;
          backdrop-filter: blur(8px);
          background: linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.06));
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 12px 16px;
        }
        .brand { display: flex; align-items: center; gap: 12px; font-weight: 700; letter-spacing: 0.2px; }
        .logo {
          width: 40px; height: 40px; border-radius: 12px;
          background: linear-gradient(135deg, var(--primary), var(--neon));
          box-shadow: 0 0 22px rgba(0,229,255,0.35), inset 0 0 12px rgba(255,255,255,0.12);
          display: grid; place-items: center; color: #00111a; font-weight: 800;
        }

        /* Buttons */
        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 16px; border-radius: 10px; border: 1px solid var(--border); background: rgba(255,255,255,0.02); color: var(--text); cursor: pointer; transition: 0.2s ease; box-shadow: var(--shadow); width: 100%; }
        .btn:hover:not(:disabled) { transform: translateY(-1px); border-color: rgba(0,229,255,0.35); box-shadow: 0 12px 30px rgba(0,229,255,0.12); }
        .btn:active { transform: translateY(0); }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-primary { background: linear-gradient(135deg, rgba(58,160,255,0.25), rgba(0,229,255,0.18)); border-color: rgba(0,229,255,0.4); }
        .btn-primary:hover:not(:disabled) {
          border-color: rgba(0,229,255,0.55);
          box-shadow: 0 16px 40px rgba(0,229,255,0.22), 0 0 18px rgba(0,229,255,0.25);
        }
        .btn-lg { padding: 12px 20px; font-size: 1.05rem; border-radius: 12px; }
        .btn-outline { background: transparent; border-color: rgba(0,229,255,0.35); }
        .btn-outline:hover:not(:disabled) { background: linear-gradient(135deg, rgba(58,160,255,0.15), rgba(0,229,255,0.12)); }

        /* Badges, cards, grid */
        .badge { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 12px; padding: 6px 10px; border-radius: 999px; border: 1px solid var(--border); background: rgba(255,255,255,0.03); }
        .card { border: 1px solid var(--border); background: linear-gradient(180deg, rgba(18,26,58,0.8), rgba(18,26,58,0.6)); border-radius: 14px; padding: 18px; box-shadow: var(--shadow); transition: border-color 0.2s ease, transform 0.2s ease; }
        .card:hover { border-color: rgba(0,229,255,0.25); transform: translateY(-1px); }
        .grid { display: grid; gap: 14px; }
        .grid-2 { grid-template-columns: repeat(2, minmax(0,1fr)); }
        @media (max-width: 720px) { .grid-2 { grid-template-columns: 1fr; } }

        /* Inputs */
        .input, textarea { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--border); background: rgba(255,255,255,0.02); color: var(--text); font-family: inherit; }
        .input:focus, textarea:focus { outline: none; border-color: rgba(0,229,255,0.5); }
        textarea { resize: vertical; }
        .label { color: var(--muted); font-size: 12px; }

        /* Footer */
        .footer { margin-top: 32px; color: var(--muted); text-align: center; }

        /* Utility */
        .section { margin: 18px 0; }
        pre { background: rgba(0,0,0,0.35); border: 1px solid var(--border); border-radius: 12px; padding: 12px; overflow: auto; }
      `}</style>
    </div>
  )
}