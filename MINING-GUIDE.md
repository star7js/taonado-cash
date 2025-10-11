# 🌪️ Taonado Mining Guide

## 📍 Your Wallet Address

Send TAO here to add to your mining position:
```
5DfsnqBRZPqzMrUVqetmjaHWpeGZ2bMJtnmbSYBsSGFX5DwZ
```

---

## 🚀 Quick Commands

### Check Your Status
```bash
pnpm balance              # Check TAO and WTAO balances
pnpm mining-status        # Check registration and mining status
pnpm network-stats        # See network-wide statistics
pnpm track                # Track earnings over time
```

### Deposit & Withdraw
```bash
pnpm deposit              # Deposit TAO to WTAO (fixed 1 TAO)
npx hardhat run scripts/deposit-custom.ts  # Deposit all available TAO
npx hardhat run scripts/withdrawal-test.ts # Test withdrawal (0.1 WTAO)
pnpm withdraw             # Withdraw WTAO to TAO (fixed 1 WTAO)
```

### 💰 Monthly Compounding (RECOMMENDED!)
```bash
pnpm compound             # Auto-compound all earnings (run monthly!)
```

---

## 📅 Monthly Compounding Routine

**When:** 1st of every month
**Time Required:** 5 minutes
**Impact:** Exponential growth! (7,000%+ returns over 1 year)

### Steps:

1. **Check your earnings:**
   ```bash
   pnpm balance
   pnpm track
   ```

2. **Compound earnings:**
   ```bash
   pnpm compound
   ```

3. **Verify new position:**
   ```bash
   pnpm mining-status
   ```

**That's it!** Set a calendar reminder and you're done.

---

## 💡 Compounding Benefits

| Strategy | 1 Year Value | Gain |
|----------|--------------|------|
| No Compounding | 11.9 TAO | Baseline |
| Monthly Compounding | 865.9 TAO | +7,177% 🚀 |

Starting position: 1.15 WTAO
Network assumption: 1,600 WTAO total, 100 TAO/day subnet emissions

---

## 📊 How Mining Earnings Work

### Your Deposit (WTAO)
- Stays in the mining pool
- Acts as your "mining power"
- Withdrawable anytime

### Your Earnings (Native TAO)
- Paid in **native TAO** (not WTAO!)
- Accumulates in your wallet automatically
- No unwrapping needed - ready to use or re-deposit

### Example Timeline (1.15 WTAO position):

| Month | WTAO (Stays Same) | TAO (Grows) | Total Value |
|-------|-------------------|-------------|-------------|
| 0 | 1.15 WTAO | 0.02 TAO | 1.17 TAO |
| 1 | 1.15 WTAO | 0.90 TAO | 2.05 TAO |
| 3 | 1.15 WTAO | 2.66 TAO | 3.81 TAO |
| 6 | 1.15 WTAO | 5.46 TAO | 6.61 TAO |

With monthly compounding, this becomes exponential!

---

## 🎯 Recommended Deposit Sizes

| Position | Daily Earnings | Monthly | ROI Time | Investment |
|----------|----------------|---------|----------|------------|
| 1 WTAO | 0.026 TAO | 0.77 TAO | ~25 days | ~$325 |
| 2 WTAO | 0.051 TAO | 1.54 TAO | ~32 days | ~$825 |
| 5 WTAO | 0.128 TAO | 3.84 TAO | ~36 days | ~$2,325 |
| 10 WTAO | 0.256 TAO | 7.68 TAO | ~38 days | ~$4,825 |

(Based on 1,600 WTAO network total, 100 TAO/day emissions, @ $500/TAO)

---

## 🔧 Troubleshooting

### "OutOfFund" Error
- Your EVM address needs TAO for gas
- Send TAO to your SS58 address (it's automatically available to your EVM address)

### "Not Registered" Error
- Run: `pnpm miner` to associate your EVM address with your hotkey
- Only needed once per mining setup

### Can't Withdraw
- Make sure you have WTAO balance (check with `pnpm balance`)
- Gas costs ~0.0004 TAO per transaction

---

## 📈 Tracking Your Progress

### Weekly Check (Recommended)
```bash
pnpm track
```
This saves a snapshot and shows actual earnings vs estimates.

### Monthly Routine
1. Check earnings: `pnpm track`
2. Compound: `pnpm compound`
3. Celebrate! 🎉

---

## ⚠️ Important Notes

- **Earnings = Native TAO** (liquid, ready to use)
- **Mining Deposit = WTAO** (locked, but withdrawable anytime)
- **Gas costs are minimal** (~0.0004 TAO per transaction)
- **No lockup period** - withdraw anytime
- **Compound monthly** for exponential growth (7,000%+ over 1 year!)

---

## 🆘 Support

If you have issues:
1. Check your balance: `pnpm balance`
2. Check mining status: `pnpm mining-status`
3. Review this guide
4. Check the main README.md

---

**Happy Mining! 🌪️💰**

*Remember: Set that monthly calendar reminder to compound your earnings!*
