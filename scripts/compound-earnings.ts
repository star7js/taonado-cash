/**
 * Monthly Compounding Script
 *
 * This script automates the process of compounding your mining earnings:
 * 1. Checks your current TAO and WTAO balances
 * 2. Calculates how much you can safely deposit (keeping gas reserve)
 * 3. Deposits available TAO back into WTAO mining pool
 * 4. Shows your updated position and earnings rate
 *
 * Run this monthly (1st of each month) for optimal compounding!
 */

import { ethers } from "hardhat";
import { config } from "../config";
import { Contracts } from "./contracts";
import { getDeployedContract } from "./store";
import { deposit } from "./deposit";

async function main() {
  const wallet = new ethers.Wallet(config.ethPrivateKey, ethers.provider);

  console.log("=== MONTHLY COMPOUNDING SCRIPT ===\n");
  console.log("Date:", new Date().toLocaleDateString());
  console.log("Wallet:", wallet.address, "\n");

  // Get WTAO contract
  const wtaoDeployed = await getDeployedContract(Contracts.WTAO);
  const wtao = await ethers.getContractAt(
    "WTAO",
    wtaoDeployed.target.toString(),
    wallet
  );

  // Check current balances
  const wtaoBalanceBefore = await wtao.balanceOf(wallet.address);
  const taoBalanceBefore = await ethers.provider.getBalance(wallet.address);
  const totalSupply = await wtao.totalSupply();

  console.log("=== BEFORE COMPOUNDING ===");
  console.log(
    "WTAO (Mining):",
    ethers.formatUnits(wtaoBalanceBefore, 18),
    "WTAO"
  );
  console.log("TAO (Available):", ethers.formatUnits(taoBalanceBefore, 18), "TAO");

  const totalSupplyNum = Number(ethers.formatUnits(totalSupply, 18));
  const wtaoBeforeNum = Number(ethers.formatUnits(wtaoBalanceBefore, 18));
  const percentageBefore = (wtaoBeforeNum / totalSupplyNum) * 100;

  console.log(
    "Network Share:",
    percentageBefore.toFixed(4),
    "% of",
    totalSupplyNum.toFixed(2),
    "WTAO\n"
  );

  // Calculate amount to deposit (keep 0.02 TAO for gas)
  const gasReserve = ethers.parseEther("0.02");
  const amountToDeposit = taoBalanceBefore - gasReserve;

  if (amountToDeposit <= 0n) {
    console.log("❌ Not enough TAO to compound (need >0.02 TAO)");
    console.log("   Come back next month when you've accumulated more earnings!");
    return;
  }

  const depositAmount = Number(ethers.formatUnits(amountToDeposit, 18));

  if (depositAmount < 0.01) {
    console.log("⚠️  Only", depositAmount.toFixed(6), "TAO available to compound");
    console.log("   Consider waiting another month to accumulate more earnings");
    console.log("   (Reduces gas costs per TAO deposited)\n");

    // Ask for confirmation (in real use, you might want a prompt here)
    console.log("Proceeding with deposit anyway...\n");
  }

  console.log("=== COMPOUNDING ===");
  console.log("Depositing:", depositAmount.toFixed(6), "TAO");
  console.log("(Keeping 0.02 TAO for gas)\n");

  // Make the deposit
  await deposit(wallet, amountToDeposit);

  // Check new balances
  const wtaoBalanceAfter = await wtao.balanceOf(wallet.address);
  const taoBalanceAfter = await ethers.provider.getBalance(wallet.address);
  const totalSupplyAfter = await wtao.totalSupply();

  console.log("\n=== AFTER COMPOUNDING ===");
  console.log(
    "WTAO (Mining):",
    ethers.formatUnits(wtaoBalanceAfter, 18),
    "WTAO"
  );
  console.log("TAO (Available):", ethers.formatUnits(taoBalanceAfter, 18), "TAO");

  const totalSupplyAfterNum = Number(ethers.formatUnits(totalSupplyAfter, 18));
  const wtaoAfterNum = Number(ethers.formatUnits(wtaoBalanceAfter, 18));
  const percentageAfter = (wtaoAfterNum / totalSupplyAfterNum) * 100;

  console.log(
    "Network Share:",
    percentageAfter.toFixed(4),
    "% of",
    totalSupplyAfterNum.toFixed(2),
    "WTAO\n"
  );

  // Calculate earnings improvement
  const subnetDailyEmission = 100;
  const minerShare = 0.41;
  const dailyMinerEmissions = subnetDailyEmission * minerShare;

  const dailyEarningsBefore =
    (wtaoBeforeNum / totalSupplyNum) * dailyMinerEmissions;
  const dailyEarningsAfter =
    (wtaoAfterNum / totalSupplyAfterNum) * dailyMinerEmissions;

  console.log("=== EARNINGS UPDATE ===");
  console.log("Before:", dailyEarningsBefore.toFixed(6), "TAO/day");
  console.log("After:", dailyEarningsAfter.toFixed(6), "TAO/day");

  const increase =
    ((dailyEarningsAfter - dailyEarningsBefore) / dailyEarningsBefore) * 100;
  console.log("Increase:", "+" + increase.toFixed(2), "%");

  console.log("\nMonthly Earnings (new rate):", (dailyEarningsAfter * 30).toFixed(4), "TAO");
  console.log("Yearly Earnings (new rate):", (dailyEarningsAfter * 365).toFixed(2), "TAO");

  console.log("\n✅ Compounding complete!");
  console.log("💡 Set reminder for next month (1st) to compound again!");
  console.log("📈 Keep compounding monthly for exponential growth!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
