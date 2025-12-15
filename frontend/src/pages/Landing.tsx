import React from 'react'
import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div>
      <nav className="container nav">
        <div className="brand">
          <div className="logo" />
          <span>Invoice Market</span>
        </div>
        <div>
          <Link className="btn" to="/app">Open App</Link>
        </div>
      </nav>

      <header className="container hero">
        <p className="pill">Decentralized invoicing on Stacks</p>
        <h1 className="title">
          Send, approve and <span className="glow">get paid</span> for invoices
        </h1>
        <p className="subtitle">
          Create invoices in minutes, route high-value payments for boss approval, and get paid in STX or SIP-010 tokens.
          All on-chain, secured by Bitcoin via Stacks.
        </p>
        <div className="hero-cta">
          <Link className="btn btn-primary" to="/app">Launch App</Link>
          <a className="btn" href="https://explorer.hiro.so" target="_blank" rel="noreferrer">Explorer</a>
        </div>
      </header>

      <main className="container">
        <section className="section grid grid-2">
          <div className="card">
            <h3>Boss approvals</h3>
            <p className="subtitle">Invoices above a threshold can require boss sign-off before payment is enabled.</p>
          </div>
          <div className="card">
            <h3>STX or SIP-010</h3>
            <p className="subtitle">Get paid directly in STX or in supported fungible tokens via SIP-010 transfer.</p>
          </div>
          <div className="card">
            <h3>Event logs</h3>
            <p className="subtitle">On-chain events for creation, approval, dispute and payment for easy indexing.</p>
          </div>
          <div className="card">
            <h3>Open-source</h3>
            <p className="subtitle">Auditable Clarity contracts with a simple, modern UI built with Vite + React.</p>
          </div>
        </section>
      </main>

      <footer className="container footer">
        Built with Stacks • Neon blue theme • Vite + React
      </footer>
    </div>
  )
}
