;; Retailer Verification Contract
;; This contract validates merchants who can participate in the loyalty program

(define-data-var admin principal tx-sender)

;; Map to store verified retailers
(define-map verified-retailers principal bool)

;; Error codes
(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-ALREADY-VERIFIED u101)
(define-constant ERR-NOT-FOUND u102)

;; Check if caller is admin
(define-private (is-admin)
  (is-eq tx-sender (var-get admin)))

;; Add a new retailer to the verified list
(define-public (verify-retailer (retailer principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (asserts! (is-none (map-get? verified-retailers retailer)) (err ERR-ALREADY-VERIFIED))
    (map-set verified-retailers retailer true)
    (ok true)))

;; Remove a retailer from the verified list
(define-public (revoke-retailer (retailer principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (asserts! (is-some (map-get? verified-retailers retailer)) (err ERR-NOT-FOUND))
    (map-delete verified-retailers retailer)
    (ok true)))

;; Check if a retailer is verified
(define-read-only (is-verified-retailer (retailer principal))
  (default-to false (map-get? verified-retailers retailer)))

;; Transfer admin rights
(define-public (set-admin (new-admin principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (var-set admin new-admin)
    (ok true)))
