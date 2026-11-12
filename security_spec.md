# Security Specification

## Data Invariants
1. A user document `/users/{userId}` can only be created or modified by the authenticated user whose `request.auth.uid == userId`.
2. A leaderboard score entry `/leaderboard/{entryId}` can only be created by an authenticated user where `incoming().userId == request.auth.uid`.
3. Leaderboard entries are immutable historical records (updates are prohibited).
4. Leaderboard reads are open for public global rankings. User documents are readable by authenticated users to display competitor profiles and badges.
5. All string fields have strict length and format limits to prevent resource exhaustion attacks.

## The Dirty Dozen Payloads
1. Spoofed User ID on user profile creation (`incoming().uid != request.auth.uid`) -> REJECTED
2. Unauthenticated user creating profile -> REJECTED
3. Malicious user modifying another user's profile (`request.auth.uid != userId`) -> REJECTED
4. Tampering with leaderboard entry ownership (`incoming().userId != request.auth.uid`) -> REJECTED
5. Overwriting or modifying an existing leaderboard entry (`update`) -> REJECTED
6. Deleting another user's leaderboard score -> REJECTED
7. Injected 1MB string into `username` or `badge` -> REJECTED (size limit enforced)
8. Injected negative or malformed number into `spm` or `accuracy` -> REJECTED
9. Arbitrary ghost fields injected into user document -> REJECTED
10. Unauthenticated write to leaderboard collection -> REJECTED
11. Attempting to delete a user profile document from client -> REJECTED
12. Attempting to write to arbitrary root documents -> REJECTED (global catch-all deny)
