# Taonado Deposit Secrets and Privacy Notes

## Overview

Taonado has two different types of deposits, each with different security and privacy characteristics. It's crucial to understand the difference.

## Mining Deposits vs Privacy Deposits

### Mining Deposits (What We Set Up)
**Purpose**: Earn emissions on Subnet 113 by providing liquidity
**Process**: Deposit TAO → WTAO contract
**Secrets**: ❌ **NO SECRETS CREATED**
**Withdrawal**: Standard blockchain transactions anytime
**Privacy**: ❌ Transactions are public and traceable
**Safety**: Your TAO is in the WTAO contract, withdrawable with your private key

**Commands Used:**
- `pnpm miner` (standard mining)
- `npx ts-node utils/test-miner.ts` (custom amounts)
- Scripts deposit into WTAO contract for emissions

### Privacy Deposits (Different System)
**Purpose**: Anonymous mixing for complete privacy
**Process**: WTAO → Anonymous pools (0.1, 1, 10, 100, 1000 TAO)
**Secrets**: ✅ **GENERATES SECRET NOTES**
**Withdrawal**: Only possible with the secret note
**Privacy**: ✅ Completely anonymous and untraceable
**Safety**: Secret note is the ONLY way to recover funds

**Commands Used:**
- `pnpm cli` → Privacy Operations → Privacy Deposit
- Creates anonymous pools with zk-SNARK proofs

## Secret Notes Explained

### What Are Secret Notes?
When you make a **privacy deposit** (not mining), Taonado generates a secret note that looks like:
```
taonado-eth-0.1-5-0x1234...abcd-0x5678...efgh
```

This note contains:
- **Network**: taonado-eth
- **Amount**: 0.1 TAO
- **Tree depth**: 5
- **Nullifier**: Secret for spending
- **Commitment**: Proof of deposit

### Critical Security Rules

⚠️ **THE SECRET NOTE IS EVERYTHING**
- Without the secret note, **your funds are permanently lost**
- Taonado cannot recover lost notes
- No customer support can help you
- No blockchain recovery is possible

✅ **How to Store Secret Notes Safely**
1. **Password Manager** (1Password, Bitwarden, etc.)
2. **Encrypted File** on multiple devices
3. **Physical Paper** in a safe location
4. **Never** store in plain text files
5. **Never** share or post online

## When Secrets Are Created

### ❌ Mining Operations (No Secrets)
- `pnpm miner`
- `pnpm deposit`
- `npx ts-node utils/test-miner.ts`
- Any WTAO contract deposits

### ✅ Privacy Operations (Creates Secrets)
- `pnpm cli` → Privacy Operations → Privacy Deposit
- Direct calls to Taonado mixer contracts
- Anonymous pool deposits

## Our Test Setup Analysis

**What we did**: Mining deposits for emissions
**Secret status**: ❌ No secrets were created
**Your funds**: Safe in WTAO contract
**Withdrawal**: Use `pnpm withdraw` anytime

**Proof**: Check your transaction on blockchain explorer - it's a standard WTAO deposit, not a privacy commitment.

## Privacy Deposit Example (If You Use Later)

If you decide to use privacy deposits later:

1. **Run**: `pnpm cli`
2. **Choose**: "🕵️ Privacy Operations" → "🔒 Privacy Deposit"
3. **Select pool**: 0.1, 1, 10, 100, or 1000 TAO
4. **CRITICAL**: Save the secret note immediately
5. **Test**: Verify you can read the note before leaving

**Example session:**
```
✅ Privacy deposit completed successfully!

🔑 YOUR SECRET NOTE (SAVE THIS SECURELY):
==========================================
taonado-eth-1-20-0x1a2b3c...def-0x4e5f6g...hij
==========================================

⚠️ IMPORTANT: Without this note, you cannot withdraw your funds!
```

## Recovery Information

### Mining Deposits (Our Setup)
**Recovery method**: Use your EVM private key
**Commands**: `pnpm withdraw`, standard blockchain transactions
**Risk**: Low (standard smart contract interaction)

### Privacy Deposits
**Recovery method**: ONLY the secret note
**Commands**: `pnpm cli` → Privacy Operations → Privacy Withdraw
**Risk**: High (permanent loss if note is lost)

## Best Practices

### For Mining (Current Setup)
1. ✅ Keep your `config.ts` secure (contains EVM private key)
2. ✅ Regular backups of config.ts
3. ✅ Monitor mining performance
4. ✅ Can withdraw anytime without secrets

### For Future Privacy Use
1. ✅ Test with small amounts first
2. ✅ Store secret notes in multiple secure locations
3. ✅ Verify note storage before making large deposits
4. ✅ Never lose the secret note

## Technical Details

### Mining Deposit Flow
```
Your TAO → EVM Wallet → WTAO Contract → Mining Emissions
         ↑                           ↓
    Private Key              Standard Withdrawal
```

### Privacy Deposit Flow
```
Your WTAO → Commitment → Anonymous Pool → zk-SNARK Proof
           ↑                            ↓
     Secret Note                Secret Note Required
```

## Summary

**Your current setup**: Mining deposits (no secrets needed)
**Your funds**: Safe and withdrawable with standard methods
**Secret notes**: Only needed for privacy mixing (different feature)
**Next steps**: Monitor mining performance, consider privacy deposits later if desired

Remember: Mining ≠ Privacy. They're different features with different security models!