/**
 * Earnings Tracker
 *
 * This script helps you track your mining performance over time.
 * It saves a snapshot of your balances and calculates actual earnings.
 *
 * Run this weekly or monthly to see your real earnings!
 */

import { ethers } from "hardhat";
import { config } from "../config";
import { Contracts } from "./contracts";
import { getDeployedContract } from "./store";
import * as fs from "fs";
import * as path from "path";

interface Snapshot {
  date: string;
  timestamp: number;
  wtaoBalance: string;
  taoBalance: string;
  totalValue: string;
  networkTotal: string;
  networkShare: string;
  estimatedDailyEarnings: string;
}

const SNAPSHOT_FILE = path.join(__dirname, "..", "earnings-history.json");

async function main() {
  const wallet = new ethers.Wallet(config.ethPrivateKey, ethers.provider);

  console.log("=== EARNINGS TRACKER ===\n");
  console.log("Date:", new Date().toLocaleString());
  console.log("Wallet:", wallet.address, "\n");

  // Get WTAO contract
  const wtaoDeployed = await getDeployedContract(Contracts.WTAO);
  const wtao = await ethers.getContractAt(
    "WTAO",
    wtaoDeployed.target.toString(),
    wallet
  );

  // Get current balances
  const wtaoBalance = await wtao.balanceOf(wallet.address);
  const taoBalance = await ethers.provider.getBalance(wallet.address);
  const totalSupply = await wtao.totalSupply();

  const wtaoNum = Number(ethers.formatUnits(wtaoBalance, 18));
  const taoNum = Number(ethers.formatUnits(taoBalance, 18));
  const totalValue = wtaoNum + taoNum;
  const networkTotal = Number(ethers.formatUnits(totalSupply, 18));
  const networkShare = (wtaoNum / networkTotal) * 100;

  // Calculate estimated daily earnings
  const subnetDailyEmission = 100;
  const minerShare = 0.41;
  const dailyMinerEmissions = subnetDailyEmission * minerShare;
  const estimatedDaily = (wtaoNum / networkTotal) * dailyMinerEmissions;

  // Create current snapshot
  const currentSnapshot: Snapshot = {
    date: new Date().toISOString(),
    timestamp: Date.now(),
    wtaoBalance: wtaoNum.toFixed(6),
    taoBalance: taoNum.toFixed(6),
    totalValue: totalValue.toFixed(6),
    networkTotal: networkTotal.toFixed(2),
    networkShare: networkShare.toFixed(4),
    estimatedDailyEarnings: estimatedDaily.toFixed(6),
  };

  // Load previous snapshots
  let snapshots: Snapshot[] = [];
  if (fs.existsSync(SNAPSHOT_FILE)) {
    const data = fs.readFileSync(SNAPSHOT_FILE, "utf-8");
    snapshots = JSON.parse(data);
  }

  // Display current status
  console.log("=== CURRENT POSITION ===");
  console.log("WTAO (Mining):", wtaoNum.toFixed(6), "WTAO");
  console.log("TAO (Available):", taoNum.toFixed(6), "TAO");
  console.log("Total Value:", totalValue.toFixed(6), "TAO");
  console.log("Network Share:", networkShare.toFixed(4), "%");
  console.log("Est. Daily Earnings:", estimatedDaily.toFixed(6), "TAO/day\n");

  // Compare with previous snapshots
  if (snapshots.length > 0) {
    const lastSnapshot = snapshots[snapshots.length - 1];
    const daysSince =
      (currentSnapshot.timestamp - lastSnapshot.timestamp) / (1000 * 60 * 60 * 24);

    console.log("=== COMPARISON WITH LAST CHECK ===");
    console.log("Last Check:", new Date(lastSnapshot.date).toLocaleString());
    console.log("Days Since:", daysSince.toFixed(1), "days\n");

    const wtaoChange = wtaoNum - Number(lastSnapshot.wtaoBalance);
    const taoChange = taoNum - Number(lastSnapshot.taoBalance);
    const totalChange = totalValue - Number(lastSnapshot.totalValue);

    console.log("Changes:");
    console.log(
      "  WTAO:",
      wtaoChange >= 0 ? "+" : "",
      wtaoChange.toFixed(6),
      "WTAO"
    );
    console.log(
      "  TAO:",
      taoChange >= 0 ? "+" : "",
      taoChange.toFixed(6),
      "TAO"
    );
    console.log(
      "  Total:",
      totalChange >= 0 ? "+" : "",
      totalChange.toFixed(6),
      "TAO"
    );

    if (daysSince > 0) {
      const actualDailyEarnings = totalChange / daysSince;
      console.log(
        "\nActual Earnings Rate:",
        actualDailyEarnings.toFixed(6),
        "TAO/day"
      );
      console.log(
        "Estimated Rate:",
        estimatedDaily.toFixed(6),
        "TAO/day"
      );

      const variance =
        ((actualDailyEarnings - estimatedDaily) / estimatedDaily) * 100;
      console.log("Variance:", variance.toFixed(2), "%");

      // Projections
      console.log("\n=== PROJECTIONS (Based on Actual Rate) ===");
      console.log("Weekly:", (actualDailyEarnings * 7).toFixed(4), "TAO");
      console.log("Monthly:", (actualDailyEarnings * 30).toFixed(4), "TAO");
      console.log("Yearly:", (actualDailyEarnings * 365).toFixed(2), "TAO");
      console.log(
        "At $500/TAO:",
        "$" + (actualDailyEarnings * 365 * 500).toFixed(2),
        "per year"
      );
    }
  } else {
    console.log("=== FIRST SNAPSHOT ===");
    console.log("This is your first earnings snapshot!");
    console.log("Run this script again in a week to see your actual earnings.\n");
  }

  // Save current snapshot
  snapshots.push(currentSnapshot);
  fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(snapshots, null, 2));

  console.log("\n✅ Snapshot saved!");
  console.log("📊 Total snapshots:", snapshots.length);
  console.log(
    "💡 Run this script regularly to track your actual earnings over time!"
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
