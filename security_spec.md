# Security Specification for FleetPro Firestore Rules

## 1. Data Invariants

1. **User Identity Isolation**: A user can only access and modify their own personal data (`trips`, `profiles`, `finances`, `payments`, `monthlyFiles`, `notifications`) unless they are an `ADMIN`.
2. **Read Control & Integrity**: Standard user operations cannot query other users' data. List operations must be securely validated on the server rules by comparing `resource.data.userId` or `resource.data.ownerId` with `request.auth.uid`. No blanket reads allowed.
3. **Admin Escape Hatch**: Admins identified by existing inside a special `admins` collection can override state limits and operate universally.
4. **Id Validation**: Document custom IDs must conform to the regular length and character matching constraints (`isValidId`).

## 2. Dirty Dozen Payloads

1. **Identity Spoofing**: Attempt to insert a Trip setting `userId` to a victim's ID.
2. **Blanket Query Abuse**: Attempt to execute a query list on all payments without constraining queries to `userId`.
3. **Privilege Escalation**: Attempt to create a standard user profile claiming the role of "ADMIN".
4. **System fields write**: Attempt to manually modify system-only metrics like `registrationDate` bypassing creation limits.
5. **State Shortcut**: Attempt to change payment status directly from "PENDING" to "RECEIVED" without valid bank detail verifications.
6. **Denial of Wallet payload**: Write path ID containing 10KB of malicious junk data.
7. **Temporal manipulation**: Attempt to set a custom historical `updatedAt` instead of `request.time`.
8. **PII leak**: Unauthorized reading of driver's phone/email in `profiles` by anonymous users.
9. **Orphaned Writes**: Creating a trip on a non-existent monthlyFile folder.
10. **Terminal lock bypass**: Modifying a locked closed `monthlyFiles` entry.
11. **Malicious array size exhaustion**: Populating custom routing list with 10,000 values.
12. **Self-Activation**: A pending registration user attempts to change status to `ENABLED` using standard client SDK.

## 3. Test Cases (Draft test instructions)

- Write-access requests on custom user document where `uid` !== ID are rejected.
- Multi-user data fetches without explicit constraints on ID are restricted.
- Updates attempting to change `createdAt` fail.
