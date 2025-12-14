;; invoices.clar - Decentralized invoicing (Clarity v4)

(define-trait sip010-ft-trait
  (
    ;; SIP-010 (minimal) transfer interface
    (transfer (uint principal principal (optional (buff 34))) (response bool uint))
    (get-balance (principal) (response uint uint))
    (get-decimals () (response uint uint))
    (get-symbol () (response (string-utf8 12) uint))
  )
)

;; -----------------------------
;; Constants & Errors
;; -----------------------------
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-NOT-FOUND (err u101))
(define-constant ERR-BAD-STATUS (err u102))
(define-constant ERR-BAD-AMOUNT (err u103))
(define-constant ERR-BOSS-REQUIRED (err u104))
(define-constant ERR-TOKEN-MISMATCH (err u105))
(define-constant ERR-TOKEN-REQUIRED (err u106))
(define-constant ERR-ALREADY-PAID (err u107))
(define-constant ERR-NOT-CLIENT-NOR-BOSS (err u108))

;; Boss approval threshold: invoices above this require boss approval if boss is set
(define-constant BOSS-APPROVAL-THRESHOLD u1000000)

;; Status enum
;; u0 = Draft
;; u1 = Sent
;; u2 = Approved
;; u3 = Disputed
;; u4 = Paid
;; u5 = Cancelled

;; -----------------------------
;; Data model
;; -----------------------------
(define-data-var invoice-counter uint u0)

(define-map invoices
  uint
  {
    freelancer: principal,
    client: principal,
    boss: (optional principal),

    amount: uint,
    token: (optional principal), ;; none = STX, some = SIP-010 contract principal

    status: uint,
    due-date: uint,
    created-at: uint,

    memo: (string-utf8 256)
  }
)

;; Track approvals separately to allow 2-step approvals without new status codes
(define-map client-approvals uint bool)
(define-map boss-approvals uint bool)

;; -----------------------------
;; Helpers
;; -----------------------------
(define-read-only (get-invoice (invoice-id uint))
  (match (map-get? invoices invoice-id)
    invoice (ok invoice)
    _ ERR-NOT-FOUND))

(define-read-only (requires-boss-approval (amount uint) (maybe-boss (optional principal)))
  (if (and (is-some maybe-boss) (> amount BOSS-APPROVAL-THRESHOLD)) true false))

(define-read-only (is-client (who principal) (invoice-id uint))
  (match (map-get? invoices invoice-id)
    inv (is-eq who (get client inv))
    false))

(define-read-only (is-boss (who principal) (invoice-id uint))
  (match (map-get? invoices invoice-id)
    inv (match (get boss inv)
          b (is-eq who b)
          false)
    false))

;; -----------------------------
;; Public functions
;; -----------------------------
(define-public (create-invoice
  (client principal)
  (boss (optional principal))
  (amount uint)
  (token (optional principal))
  (due-date uint)
  (memo (string-utf8 256))
)
  (begin
    (if (is-eq amount u0) ERR-BAD-AMOUNT (ok true))
    (let
      (
        (id (+ u1 (var-get invoice-counter)))
      )
      (map-set invoices id {
        freelancer: tx-sender,
        client: client,
        boss: boss,
        amount: amount,
        token: token,
        status: u0, ;; Draft
        due-date: due-date,
        created-at: block-height,
        memo: memo
      })
      (var-set invoice-counter id)
      (print {
        event: "invoice-created",
        invoice-id: id,
        freelancer: tx-sender,
        client: client,
        boss: boss,
        amount: amount,
        token: token
      })
      (ok id)
    )
  )
)

(define-public (send-invoice (invoice-id uint))
  (match (map-get? invoices invoice-id)
    inv (begin
          (if (is-eq (get freelancer inv) tx-sender)
              (ok true)
              ERR-NOT-AUTHORIZED)
          (if (is-eq (get status inv) u0) (ok true) ERR-BAD-STATUS)
          (map-set invoices invoice-id (merge inv { status: u1 }))
          (print {
            event: "invoice-sent",
            invoice-id: invoice-id,
            freelancer: (get freelancer inv),
            client: (get client inv)
          })
          (ok true))
    _ ERR-NOT-FOUND))

(define-public (approve-invoice (invoice-id uint))
  (match (map-get? invoices invoice-id)
    inv (let (
          (caller tx-sender)
          (needs-boss (requires-boss-approval (get amount inv) (get boss inv)))
        )
        (begin
          (if (is-eq (get status inv) u1) (ok true) ERR-BAD-STATUS) ;; must be Sent
          ;; Record client/boss approvals
          (if (is-eq caller (get client inv))
              (begin (map-set client-approvals invoice-id true) (ok true))
              (ok true))
          (if (and (is-some (get boss inv)) (match (get boss inv) b (is-eq caller b) false))
              (begin (map-set boss-approvals invoice-id true) (ok true))
              (ok true))

          ;; Authorization: must be client or boss
          (if (or (is-eq caller (get client inv)) (match (get boss inv) b (is-eq caller b) false))
              (ok true)
              ERR-NOT-AUTHORIZED)

          ;; Decide if fully approved
          (let (
                (client-ok (default-to false (map-get? client-approvals invoice-id)))
                (boss-ok (default-to false (map-get? boss-approvals invoice-id)))
              )
            (if (or (not needs-boss)
                    (and needs-boss boss-ok client-ok))
                (begin
                  (map-set invoices invoice-id (merge inv { status: u2 }))
                  (print {
                    event: "invoice-approved",
                    invoice-id: invoice-id,
                    client-approved: client-ok,
                    boss-approved: boss-ok
                  })
                  (ok true))
                (ok true) ;; recorded partial approval, waiting for other party
            )
          )
        )
      )
    _ ERR-NOT-FOUND))

(define-public (dispute-invoice (invoice-id uint) (reason (string-utf8 128)))
  (match (map-get? invoices invoice-id)
    inv (begin
          (if (or (is-eq tx-sender (get client inv))
                  (match (get boss inv) b (is-eq tx-sender b) false))
              (ok true)
              ERR-NOT-CLIENT-NOR-BOSS)
          (if (or (is-eq (get status inv) u1) (is-eq (get status inv) u2)) (ok true) ERR-BAD-STATUS)
          (map-set invoices invoice-id (merge inv { status: u3 }))
          (print {
            event: "invoice-disputed",
            invoice-id: invoice-id,
            by: tx-sender,
            reason: reason
          })
          (ok true))
    _ ERR-NOT-FOUND))

;; Payment: supports STX or SIP-010. To keep strong typing for contract-call?, the caller must
;; provide the token trait instance when paying token invoices. We verify it matches stored principal.
(define-public (pay-invoice (invoice-id uint) (token-impl (optional (trait_reference sip010-ft-trait))))
  (match (map-get? invoices invoice-id)
    inv (let (
          (status (get status inv))
          (amount (get amount inv))
          (maybe-token (get token inv))
          (freelancer (get freelancer inv))
        )
        (begin
          (if (is-eq status u4) ERR-ALREADY-PAID (ok true))
          (if (is-eq status u2) (ok true) ERR-BAD-STATUS)

          (match maybe-token
            ;; STX payment path
            none (begin
                   (asserts! (is-eq token-impl none) ERR-TOKEN-MISMATCH)
                   (match (stx-transfer? amount tx-sender freelancer)
                     result (begin
                              (map-set invoices invoice-id (merge inv { status: u4 }))
                              (print {
                                event: "invoice-paid",
                                invoice-id: invoice-id,
                                asset: "STX",
                                amount: amount,
                                from: tx-sender,
                                to: freelancer
                              })
                              (ok result))
                     )
                 )
            ;; SIP-010 payment path
            some-token-principal (begin
              (match token-impl
                none ERR-TOKEN-REQUIRED
                some-trait (let ((trait some-trait))
                  ;; Require the implementation principal to match stored principal
                  (if (is-eq (contract-of trait) some-token-principal)
                      (ok true)
                      ERR-TOKEN-MISMATCH)
                  (match (contract-call? trait transfer amount tx-sender freelancer none)
                    res (begin
                          (if (is-ok res)
                              (begin
                                (map-set invoices invoice-id (merge inv { status: u4 }))
                                (print {
                                  event: "invoice-paid",
                                  invoice-id: invoice-id,
                                  asset: (get-symbol trait),
                                  amount: amount,
                                  from: tx-sender,
                                  to: freelancer
                                })
                                (ok true))
                              (err u200))
                        )
                  )
                )
              )
            )
          )
        )
      )
    _ ERR-NOT-FOUND))
