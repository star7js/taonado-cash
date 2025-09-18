# Taonado Mining Utilities

This directory contains generalized scripts for Taonado mining operations that are safe to commit to GitHub (no hardcoded wallet addresses or private keys).

## Prerequisites

1. **Setup Configuration**
   ```bash
   cp config-example.ts config.ts
   # Edit config.ts with your private keys and settings
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

## Available Scripts

### 1. Address Helper
**Purpose**: Display your EVM and SS58 mirror addresses
**Usage**: `npx ts-node utils/address-helper.ts`
**Safe**: ✅ Uses config.ts (gitignored)

Shows you where to send TAO for mining operations.

### 2. Local Transfer
**Purpose**: Transfer TAO from local Bittensor wallet to EVM wallet
**Usage**: `python3 utils/local-transfer.py <wallet_name> <evm_mirror_address> [amount]`
**Safe**: ✅ Takes addresses as parameters

Example:
```bash
python3 utils/local-transfer.py mining 5DfsnqBRZPqzMrUVqetmjaHWpeGZ2bMJtnmbSYBsSGFX5DwZ 0.5
```

### 3. Balance Checker
**Purpose**: Check TAO balance in your EVM wallet
**Usage**: `npx ts-node utils/balance-checker.ts`
**Safe**: ✅ Uses config.ts (gitignored)

Verifies TAO arrived and suggests next steps.

### 4. Test Miner
**Purpose**: Setup mining with small amounts for testing
**Usage**: `AUTO_CONFIRM=true npx ts-node utils/test-miner.ts`
**Safe**: ✅ Uses config.ts, requires explicit confirmation

Sets up mining operations with available balance.

### 5. Mining Status
**Purpose**: Monitor your mining operation
**Usage**: `npx ts-node utils/mining-status.ts`
**Safe**: ✅ Uses config.ts (gitignored)

Shows current mining status, balances, and performance.

## Workflow for New Users

### Step 1: Setup
```bash
# Get your addresses
npx ts-node utils/address-helper.ts

# Note the SS58 Mirror Address for sending TAO
```

### Step 2: Fund EVM Wallet
```bash
# Option A: From local wallet
python3 utils/local-transfer.py your_wallet_name SS58_MIRROR_ADDRESS amount

# Option B: From mobile wallet (NOVA, etc.)
# Send TAO to the SS58 Mirror Address from step 1
```

### Step 3: Verify Balance
```bash
npx ts-node utils/balance-checker.ts
```

### Step 4: Start Test Mining
```bash
AUTO_CONFIRM=true npx ts-node utils/test-miner.ts
```

### Step 5: Monitor Progress
```bash
npx ts-node utils/mining-status.ts
```

## Security Features

### What's Safe for GitHub
- ✅ All utility scripts (no hardcoded addresses)
- ✅ README and documentation
- ✅ Example configurations

### What's Protected (gitignored)
- ❌ `config.ts` (contains private keys)
- ❌ Individual wallet files
- ❌ Any files with actual addresses/keys

### Environment Variables
Scripts support these environment variables for automation:
- `AUTO_CONFIRM=true` - Skip manual confirmations
- `DEBUG=true` - Enable verbose logging

## Deposit Secrets vs Mining

### Mining (What These Scripts Do)
- **Regular WTAO deposits** for earning emissions
- **No secrets needed** - standard blockchain transactions
- **Can withdraw anytime** using normal transactions
- **Funds are in WTAO contract** and visible on blockchain

### Privacy Deposits (Different Process)
- **Anonymous mixing pools** (0.1, 1, 10, 100, 1000 TAO)
- **Generates secret notes** required for withdrawal
- **Complete anonymity** - cannot be traced
- **Use**: `pnpm cli` → Privacy Operations

**Important**: These mining scripts do NOT generate secrets. If you use privacy deposits later, save those secrets securely!

## Troubleshooting

### Common Issues
1. **"Insufficient balance"** - Send more TAO to SS58 mirror
2. **"Association failed"** - Check config.ts hotkey setup
3. **"Contract not found"** - Verify network configuration

### Getting Help
- Check config.ts matches config-example.ts format
- Ensure you're on the correct network (mainnet/testnet)
- Verify private keys and seeds are correct
- Run balance checker to confirm TAO availability

## Advanced Usage

### Custom Amounts
```bash
# Transfer specific amount
python3 utils/local-transfer.py mining SS58_ADDRESS 1.5

# Mine with all available (auto-calculated)
AUTO_CONFIRM=true npx ts-node utils/test-miner.ts
```

### Monitoring Automation
```bash
# Daily status check (add to cron)
npx ts-node utils/mining-status.ts

# Balance monitoring
npx ts-node utils/balance-checker.ts
```

### Withdrawal
```bash
# Use existing project scripts
pnpm withdraw  # Returns WTAO → TAO
```

## Safety Notes

- Start with small amounts for testing
- Mining is competitive - no guaranteed returns
- Keep some TAO for gas fees
- Monitor subnet performance regularly
- Can withdraw anytime if needed

These utilities provide a safe, documented way to test Taonado mining while keeping private information secure.