import React from 'react'
import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div>
      <nav className="container nav nav-glass">
        <div className="brand">
          <div className="logo" />
          <span>Invoice Market</span>
        </div>
        <div>
          <Link className="btn" to="/app">Open App</Link>
        </div>
      </nav>

      <div className="hero-wrap">
        <header className="container hero">
          <p className="pill">Decentralized invoicing on Stacks</p>
          <h1 className="title">
            Send, approve and <span className="glow">get paid</span> for invoices
          </h1>
          <p className="subtitle">
            Create invoices in minutes, route high‑value payments for boss approval, and get paid in STX or SIP‑010 tokens.
            On‑chain. Simple. Secure.
          </p>
          <div className="hero-cta">
            <Link className="btn btn-primary btn-lg" to="/app">Launch App</Link>
            <a className="btn btn-outline btn-lg" href="https://explorer.hiro.so" target="_blank" rel="noreferrer">Explorer</a>
          </div>
        </header>
      </div>

      <main className="container">
        <section className="section grid grid-2">
          <div className="card">
            <h3>Boss approvals</h3>
            <p className="subtitle">Set a threshold so big invoices require a boss sign‑off before payment.</p>
          </div>
          <div className="card">
            <h3>STX or SIP‑010</h3>
            <p className="subtitle">Get paid in native STX or supported fungible tokens via SIP‑010 transfers.</p>
          </div>
          <div className="card">
            <h3>Clear on‑chain logs</h3>
            <p className="subtitle">Creation, approval, dispute, and payment events for easy indexing.</p>
          </div>
          <div className="card">
            <h3>Open‑source</h3>
            <p className="subtitle">Auditable Clarity contracts with a modern, responsive UI.</p>
          </div>
        </section>
      </main>

      <footer className="container footer">
        Built with Stacks • Neon blue theme • Vite + React
      </footer>
    </div>
  )
}
