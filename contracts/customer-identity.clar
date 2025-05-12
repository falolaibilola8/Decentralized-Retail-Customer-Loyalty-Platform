;; Customer Identity Contract
;; This contract manages consumer profiles

;; Data structures
(define-map customers principal
  {
    name: (string-ascii 50),
    email: (string-ascii 50),
    active: bool,
    created-at: uint
  }
)

;; Error codes
(define-constant ERR-ALREADY-REGISTERED u100)
(define-constant ERR-NOT-FOUND u101)
(define-constant ERR-UNAUTHORIZED u102)

;; Register a new customer
(define-public (register-customer (name (string-ascii 50)) (email (string-ascii 50)))
  (let ((customer-id tx-sender))
    (asserts! (is-none (map-get? customers customer-id)) (err ERR-ALREADY-REGISTERED))
    (map-set customers customer-id {
      name: name,
      email: email,
      active: true,
      created-at: block-height
    })
    (ok true)))

;; Update customer profile
(define-public (update-profile (name (string-ascii 50)) (email (string-ascii 50)))
  (let ((customer-id tx-sender)
        (existing-customer (map-get? customers customer-id)))
    (asserts! (is-some existing-customer) (err ERR-NOT-FOUND))
    (map-set customers customer-id (merge (unwrap-panic existing-customer)
      {
        name: name,
        email: email
      }))
    (ok true)))

;; Deactivate customer account
(define-public (deactivate-account)
  (let ((customer-id tx-sender)
        (existing-customer (map-get? customers customer-id)))
    (asserts! (is-some existing-customer) (err ERR-NOT-FOUND))
    (map-set customers customer-id (merge (unwrap-panic existing-customer)
      {
        active: false
      }))
    (ok true)))

;; Get customer profile
(define-read-only (get-customer (customer-id principal))
  (map-get? customers customer-id))

;; Check if customer exists and is active
(define-read-only (is-active-customer (customer-id principal))
  (match (map-get? customers customer-id)
    customer (get active customer)
    false))
