# Slop MVP Delivery Plan

Date: 6 October 2026. Token-reward scope updated: 13 October 2026. Status: MVP scope submitted for adoption alongside [Slop Product Requirements](slop-product-requirements.md).

## Scope

The MVP retains current product capabilities and completes account, project, contribution, review, discovery, funding, and payout journeys on Solana, Base, Ethereum, and Robinhood Chain, with USDC or reviewed project-token rewards (TOK-01–07). It also requires optional participant-scoped Slopbot, Slop Score as the default leaderboard sort, issue/PR outcome metrics, closure penalties, admin featuring/bans, and mandatory community security vetting. Source availability is not proof of production readiness. Private security bounty programs, bridges, contributor-principal swaps, and additional chains are future work.

The maintainer-approved fee for new payout obligations is 2% deducted from the gross award: 100 USDC gross means 98 to the contributor and 2 fee. Reserve the 100 once, show net contributor earnings, and preserve recorded legacy terms. Actor-binding proof and execution authority remain separate approval gates. The product owner also approved a 2% project-token deduction, rounded down once per award, and immediate conversion of that fee into USDC. TOK-07 conversion limits and execution authority remain activation gates. Conversion failure never blocks contributor payment; retain the fee as pending and retry separately.

## Implementation scope and phase exit

Implement only the approved work packages below. Every implementation issue and PR must reference the exact PRD requirement and MVP package. New proposals must review and reference the PRD, or add a proposed requirement for human approval before implementation. A future requirement, open issue, or agent recommendation does not expand MVP scope.

Slop participation issues are chosen, verified and personally submitted by the human on the website. Agents must not generate unattended issue text, create issues in bulk, or open or submit an issue through the UI, CLI, API, scripts, prefilled URLs or another agent; they may investigate, explain findings, and assist with editing or translation under the contributor's control. The rule, its evidence standard, appeal path and effective date are in `CONTRIBUTING.md`. Every Slop participation issue/PR includes `Made via @slopdotcash`; the human adds it to their issue.

The rest of the PRD is blocked until maintainers approve an explicit MVP completion record. That record must map every work package and requirement to exact revisions, test results, real workflow validation, release evidence, and resolved blocking defects. It must confirm the MVP is finished, verified, tested and validated. A partially shipped feature, green local suite, merged PR, or model declaration is not phase completion. After confirmation, humans approve the next PRD phase before implementation begins.

## Work packages

| ID | Requirements | Concrete result | Dependency and acceptance |
| --- | --- | --- | --- |
| MVP-00 | PRD sections 3, 4, 22 | Approved scope, financial terms, donation rights, authority, policy migration | Resolve conflicts before implementation; maintainers approve PRD and this plan |
| MVP-01 | ACC-01–05, SOC-01 | One GitHub account with profile, optional X, sessions, privacy and recovery | Reuse identity/membership; real OAuth, rename and access tests |
| MVP-02 | WAL-01–05 | Backend Solana/Base/Ethereum/Robinhood Chain wallet connections and safe changes | MVP-01; real wallet proof, unsupported paths, replay/concurrency and recovery |
| MVP-03 | PRJ-01–04 | Resumable project setup, optional Slopbot settings/health and updates | MVP-00/01 for drafts; MVP-12 before executable activation; actual permissions and canonical publication |
| MVP-04 | SKL-01–07 | Discovery/project skills, human-responsible outside issues, visible attribution and sandbox checks | MVP-03/12; genuine contribution, provenance and exact approved-revision execution |
| MVP-05 | BOT-01–07 | Optional Slopbot, marker/member routing, external opt-in, ignored actors, guideline-aware review and delegated closures | MVP-03/04/12; full eligibility matrix, health, stale revision, close confirmation, retry and uninstall |
| MVP-06 | FND-01–05, PAY-01–08 | Solana and EVM contract/program, funding classes and protected obligations | MVP-00/02/03; approved PAY-05 actor-binding proof and recovery authority, independent review and accounting/authority conformance |
| MVP-07 | PAY-01–09 | Human approval, manual/automatic execution, late wallet dispatch, finality and receipts | MVP-06; full same-scenario test deployment evidence on all four networks |
| MVP-07a | PAY-09 | Monthly-pool settlement network per project (RFC #472, approved 8 October 2026): `reward.chain`, per-network wallet resolution, Base reservation, EIP-191 recipient signer control, quorum source readiness, unsigned Base plans with EIP-681 requests, Base settlement evidence and verification | Reuses the canonical reservation, readiness and release path, the #470 verifier and #478 claim lineages; published Base fee recipient `0xb7b0d5e45016d6d31629d9ab375df770fd2aaf77`; no real project changes network and no payment is enabled; #471 remains open |
| MVP-07b | TOK-01–07, FND-02/05, WAL-01/02, PAY-06, LDR-03 | Project-token rewards on Solana, Base, Ethereum, and Robinhood Chain; one asset per project, exact integer accounting, reward filters, externally executed payouts and verified receipts | Scope approved by the product owner on 13 October 2026; reuse MVP-02/03/06/07/09/10. TOK-06/07 conversion limits and activation decisions remain gated. Real complete workflows on all four test networks, reviewed token behavior and unchanged historical USDC records are required |
| MVP-08 | ELG-01–03 | Prospective maintainer exclusions, moderation, financial holds and appeals | MVP-00/03/07; scoped human decisions and protected accrued obligations |
| MVP-09 | SCR-01–04, LDR-01–03, DSC-01–04 | Separate signed Slop Score/points, shared commit-author merge credit (owner decision on #506), closure debits/reversals, issue/PR ratios and score-default sorting | MVP-00/03/05/07/08; exact source coverage, ties, zero denominators, no duplicate penalties or financial seizure |
| MVP-10 | ADM-01–06, NOT-01, UX-01–17, PRD sections 16–17 | Unified pages, bot health, security evidence, admin featuring/bans, notifications and recovery | Relevant prior packages; permissions, canonical sync, cached/direct-route enforcement, appeals and browser evidence |
| MVP-12 | VET-01–08 | Revision-bound secure-VM vetting, full declared telemetry, binary/obfuscation quarantine, Astra and Opus reviews, confirmed-malware bans | MVP-00/01 and project drafts; required before community/featured executable onboarding; isolated clean/malicious fixture evidence |
| MVP-11 | DEP-01, PRD sections 20–23 | Versioned migration and limited production activation | All release gates; authorized production proof and reconciliation |

No package is marked implemented by this document. Create bounded implementation issues only after approval, tied to a real missing requirement and existing work. Reuse or reconcile open vault, settlement, installer, queue and deployment proposals before starting duplicate work.

## Vertical slices

1. A contributor signs in, connects X optionally, adds a verified wallet on each supported network, and sees correct private/public state.
2. A maintainer proves repository authority, passes security admission, publishes policy/skills, and optionally configures Slopbot. Tagged/member submissions are reviewed; external/ignored submissions are skipped unless explicitly configured otherwise.
3. A contributor discovers cleared work through the main skill, uses the approved community sandbox, completes required tests, and submits a tagged PR. Any Slop participation issue is chosen, verified and personally submitted by the human.
4. A sponsor funds a vault; a separate donor adds reward-restricted funds; the maintainer approves awards for registered and walletless actors.
5. Registered actors receive exact payments; late registration triggers the remaining funded award; retries do not repay; donor funds cannot be refunded.
6. Slopbot closes an eligible policy-violating issue/PR under delegated rules. Confirm one points/score debit, ratios, retry deduplication, and reversal after reopen/appeal; preserve earned obligations.
7. An admin promotes a cleared community project, bans a project, and verifies that discovery/skill routes stop serving it. A confirmed malicious scan also invokes the recorded ban policy. Reinstatement requires independent review and a new scan.
8. A human handles an exclusion, wallet incident, and appeal without erasing history; the site defaults to Slop Score and can sort by Points or Money received.
9. A maintainer selects a reviewed project token and network. A contributor filters token-reward projects, reads the token-denominated terms, and receives a verified award through the existing journey. Repeat funding, approval, late wallet registration, external execution, reconciliation, and duplicate-retry checks on Solana, Base, Ethereum, and Robinhood Chain. Verify a non-six-decimal asset and clear unsupported/frozen-asset states. Keep legacy USDC cycles unchanged.

## Project-token delivery sequence

1. **Define terms (MVP-00/07b):** record the approved 2% same-token fee and immediate USDC conversion, then resolve TOK-06/07 limits and authority decisions, supported token behavior, network finality rules, and exact acceptance cases. No automatic mainnet activation follows this scope approval.
2. **Configure and account (MVP-03/06/07b):** extend the canonical registry and immutable snapshots with exact asset identity; freeze network, token, decimals, policy and integer allocations per cycle. Reuse existing allocation and funding code. Preserve historical verifiers.
3. **Settle and verify (MVP-02/07/07b):** extend the existing EVM path to Ethereum and Robinhood Chain and the token-specific verification on both execution families. Prove external execution, wallet binding, exact amounts, fee accounting, finality and retry recovery. Qualify each network and supported Token-2022 configuration separately. Robinhood Chain qualification uses its official testnet and verifies chain identity, wallet consent, actual token availability, RPC/explorer support, deployed code and finality; EVM compatibility alone is not payment evidence.
4. **Expose and qualify (MVP-09/10/07b):** add reward labels, filters and per-asset earnings to existing pages. Keep the USDC money-received sort labeled and separate. Record desktop/mobile, keyboard, zoom, accessibility and uploaded walkthrough evidence. Enable only reviewed project/network/asset combinations after all release gates pass.

5. **Convert fees (MVP-07b):** implement TOK-07 in the payment workflow with a reviewed same-chain route, minimum output, deadline and exact fee-only accounting. Prove success, missing liquidity, expired quote, wrong output asset, ambiguous submission and replay through real swap integration. USDC fees skip conversion. Record actual USDC proceeds separately. Contributor payment proceeds even if conversion fails. Retain the fee as pending, retry separately, and prove that no retry pays the award or deducts its fee again.

## Release gates

- **Policy:** section 22 decisions approved, effective dates set, and all affected instructions/protocols agree. Keep `AGENTS.md` and `CLAUDE.md` identical when they are updated.
- **Source:** scoped current-base branch, pinned dependencies, required repository checks, exact-head review, and real workflow evidence.
- **Identity:** live GitHub and X configuration independently qualified; optional X failure does not block contribution or payment.
- **Bot scope and penalties:** optional/off/incomplete/ready/degraded states, tagged nonmember, untagged member, unknown membership, external opt-in, ignored maintainer/contributor, stale revision, manual versus bot closure, failed close, merge, reopen and appeal; each has its specified review and journal outcome.
- **Community security:** isolated VM, trusted outside collector, file/disk/process/network telemetry, canary probes, controlled egress, tamper detection, recursive artifact quarantine, independent pinned Astra/Opus scans, incomplete/clean/malicious dispositions, no unscanned execution, and revision revocation.
- **Contracts:** exact deployed code, network/asset/vault identity, permissions, reserve invariants, donation rights, fee arithmetic, no Slop-held key able to originate or redirect a payment, and independent security review.
- **Financial operations:** complete Solana/Base/Ethereum/Robinhood Chain test scenarios for USDC and supported project-token behavior, ambiguous-send recovery, replay protection, finalized receipts, queue/indexer restart and reconciliation.
- **Project tokens:** TOK-01–07 and MVP-07b evidence, approved 2% same-token fee and immediate USDC conversion, resolved conversion failure policy and limits, chain/asset identity, non-six-decimal conservation, unsupported/frozen-asset handling, wrong-chain/asset rejection, separated financial totals, and unchanged historical USDC receipts. Robinhood Chain is included. No approval of further EVM chains is implied.
- **UI:** desktop/mobile, keyboard, 200% zoom, WCAG AA, copy/download/link checks, console/network evidence, uploaded walkthrough and test videos.
- **Deployment:** DEP-01 separates `development` staging and `main` production, including an isolated staging login and write backend; approved protected workflow and environment; production website/API/contract checks are separate. Claim the deploy/DNS lever before any such change.
- **Operations:** named incident/recovery owners, tested restore, scoped operator access, alerts, support/appeals and approved privacy/retention terms.
- **Pilot:** small authorized mainnet exposure; no broad enabling until actual payments and public totals reconcile.

## Future backlog

Private software and smart-contract bounty programs require their own approved program specification: authorized scope, safe harbor, private case storage, auto-submission, maintainer notifications, triage, duplicate/severity appeals, remediation/retest, agreed 50/50 collected-principal split, and privacy-aware settlement. Do not present that workflow as part of the current public contribution product.

Robinhood Chain payouts and project-token rewards are MVP work; brokerage-account and trading integrations remain outside this scope. Additional chain adapters beyond Solana, Base, Ethereum, and Robinhood Chain require a funded use case and the same authority/accounting/finality acceptance as the MVP chains. Merkle batching and additional wallet types should follow measured need and supported proof paths.

## Approval and MVP completion record

The product owner approved adding TOK-01–07 and MVP-07b in this conversation on 13 October 2026, then explicitly included Robinhood Chain for payouts and project-token rewards. That approval covers the documented feature scope, not unresolved token economics, execution authority, implementation completion, or production activation. The maintainer-approved merge adopting this PRD and plan records repository scope approval. Record its PR/revision and the choices adopted from PRD section 22; unresolved choices remain implementation gates. Adoption does not activate bot closure, penalties, project bans, money movement, or a future phase without the corresponding reviewed implementation and policy activation.

**MVP completion: not confirmed. Future implementation: blocked.** The later completion record must identify the responsible maintainers, approval date and decision link; every MVP package/requirement; exact tested/deployed revisions; end-to-end, security, provider and chain evidence; resolved defects; and the approved next phase. Add the real record only after these conditions hold. Do not prefill completion, waive missing evidence silently, or infer completion from this document merge.

## Quality review delivery

The [PRD quality requirements](slop-product-requirements.md#quality-review-requirements) and
[dated full review](slop-quality-review.md) belong to MVP-10. This plan does not mark them implemented.
Reuse MVP-01/02 for account and wallet changes, MVP-03 for project forms, MVP-07 for payouts, and MVP-09 for rankings.
Retain Slop Score as the default. Keep financial-policy decisions in PRD section 22.

| Pass | Requirement IDs | Required result |
| --- | --- | --- |
| 1. Correct misleading displays | UX-02–05, UX-12, UX-14–15 | Accurate amount/state labels, readable mobile model data, formatted scores and explicit loading states |
| 2. Combine duplicate workflows | UX-01, UX-03–07, UX-10–11 | One account area, consistent rankings, shared people discovery, one profile summary and shared proposal/payout controls |
| 3. Reduce explanations | UX-08–09, UX-13, UX-16 | Shorter pages, canonical explanations, searchable evidence and preserved material conditions |
| 4. Show useful visuals | UX-05, UX-08–09, UX-11–12 | Readable process, payment stages, allocation/fee arithmetic, model coverage and funding readiness |
| 5. Verify quality | UX-17 and all affected requirements | Real browser workflows, before/after measures, uploaded walkthrough and evidence video, accessibility and recovery results |

Reproduce the dated defects first. Link existing fixes and omit work already complete.
Track every page and project-state variant from the review. Record any omitted suggestion and its requirement-based reason.
Do not use arbitrary copy quotas, decorative charts, extra tests or new abstractions as completion criteria.
Use the same inputs and states for before/after comparisons. Keep hashes, financial precision, consent and historical records available.
Documentation-only updates require link and consistency checks. Application E2E and UI videos apply to later implementation changes.


## Project-token delivery status (14 October 2026)

MVP-07b remains open. These records separate implementation progress from the
release acceptance above:

| Work | Current evidence | Remaining acceptance |
| --- | --- | --- |
| Scope and fee policy | TOK-01–07 cover all four networks; 2% same-token fee, contributor-first payout and separate conversion retry are approved | Adopt the reviewed PRD/MVP revision; approve conversion limits, destination and authority |
| Robinhood test setup | Dedicated test payer funded; test asset and escrow factory deployed; runtime and immutable roles read back | Finalized state provider, complete public-chain funding/binding/payment/reconciliation workflow; fixture is not USDC |
| EVM fee conversion | Fee-only converter and real local Uniswap V2 integration prove failed/expired quote retention, successful retry and replay rejection | Reviewed USDC/router and quote authority, payment-triggered scheduling, durable retry/recovery and finalized conversion receipt indexing |
| Robinhood application path | Existing [PR #677](https://github.com/SlopDotCash/slopdotcash/pull/677) and [PR #680](https://github.com/SlopDotCash/slopdotcash/pull/680) contain related shared EVM, wallet and database work | Review and reuse the compatible work; do not treat open PRs as merged or qualified |
| Asset-policy conflict | [PR #678](https://github.com/SlopDotCash/slopdotcash/pull/678) and #680 propose USDG on Robinhood | Reconcile with TOK-01–07. USDG is not USDC and cannot satisfy fee conversion by relabeling it |
| General project tokens | Requirements include immutable asset identity and arbitrary supported decimals | Versioned accounting, D1 registry/obligation integration, Solana fee conversion, Ethereum qualification and non-six-decimal end-to-end evidence |
| Contributor product | Shared discovery, token-denominated amounts and conversion status are specified | Complete UI flow, browser acceptance and walkthrough evidence |

The public Robinhood RPC currently rejects the finalized historical balance
query used by the funding checker. Latest-state receipts and a positive faucet
balance do not close that gate. Circle's current USDC contract list does not
include Robinhood; asset provenance and a supported USDC conversion route
remain explicit activation gates. No production network or project is activated
by this work.
