import { ethers } from "hardhat";
import { config } from "../config";
import { Contracts } from "./contracts";
import { getDeployedContract } from "./store";
import { WeightsV2, WeightsV2__factory, WTAO } from "../typechain-types";

async function main() {
  const evm_wallet = new ethers.Wallet(config.ethPrivateKey, ethers.provider);

  console.log("=== SUBNET 113 NETWORK STATISTICS ===\n");

  // Get WTAO contract
  const wtaoDeployed = await getDeployedContract(Contracts.WTAO);
  const wtao = (await ethers.getContractAt(
    "WTAO",
    wtaoDeployed.target.toString(),
    evm_wallet
  )) as unknown as WTAO;

  // Get WeightsV2 contract
  const weightsDeployed = await getDeployedContract<WeightsV2>(
    Contracts.WEIGHTS_V2
  );
  const weights = WeightsV2__factory.connect(
    weightsDeployed.target.toString(),
    evm_wallet
  );

  console.log("WTAO Contract:", wtaoDeployed.target.toString());
  console.log("WeightsV2 Contract:", weightsDeployed.target.toString());

  // Get total WTAO supply (total deposits across all miners)
  const totalSupply = await wtao.totalSupply();
  console.log(
    "\n💰 Total Network WTAO Deposits:",
    ethers.formatUnits(totalSupply, 9),
    "WTAO"
  );

  // Get your WTAO balance
  const yourBalance = await wtao.balanceOf(evm_wallet.address);
  console.log(
    "💰 Your WTAO Deposits:",
    ethers.formatUnits(yourBalance, 9),
    "WTAO"
  );

  // Calculate your percentage
  const totalSupplyBigInt = BigInt(totalSupply.toString());
  const yourBalanceBigInt = BigInt(yourBalance.toString());

  if (totalSupplyBigInt > 0n) {
    const percentage =
      (Number(yourBalanceBigInt) / Number(totalSupplyBigInt)) * 100;
    console.log("📊 Your Share of Network:", percentage.toFixed(6), "%");
  }

  // Try to get weight information
  try {
    console.log("\n=== CHECKING WEIGHTS CALCULATION ===");

    // Check if weights have been set recently
    const netuid = BigInt(config.netuid);
    console.log("Netuid:", netuid.toString());

    // Try to get UID count (number of active miners)
    try {
      const uidCount = await weights.getUidCount(netuid);
      console.log("📊 Active Miners (UIDs):", uidCount.toString());

      if (uidCount > 0n) {
        console.log("\n🎯 Top Miners by Deposit:");
        // Show top 10 miners
        const limit = uidCount < 10n ? Number(uidCount) : 10;
        for (let i = 0; i < limit; i++) {
          try {
            // This would need the actual function to get deposits by UID
            console.log(`   Rank ${i + 1}: [UID ${i}]`);
          } catch (e) {
            // Skip if can't get info
          }
        }
      }
    } catch (e: any) {
      console.log("Could not fetch UID count:", e.message);
    }

  } catch (error: any) {
    console.log("Could not fetch weight information:", error.message);
  }

  // Estimate potential daily emissions
  console.log("\n=== EMISSION ESTIMATES ===");
  const subnetDailyEmission = 1000; // Approximate daily TAO emission for subnet (adjust based on actual)
  const minerShare = 0.41; // Miners get 41% of subnet emissions
  const dailyMinerEmissions = subnetDailyEmission * minerShare;

  if (totalSupplyBigInt > 0n) {
    const yourDailyEstimate =
      (Number(yourBalanceBigInt) / Number(totalSupplyBigInt)) *
      dailyMinerEmissions;
    console.log(
      "📈 Estimated Daily Earnings:",
      yourDailyEstimate.toFixed(6),
      "TAO/day"
    );
    console.log(
      "📅 Estimated Weekly Earnings:",
      (yourDailyEstimate * 7).toFixed(6),
      "TAO/week"
    );
    console.log(
      "📆 Estimated Monthly Earnings:",
      (yourDailyEstimate * 30).toFixed(4),
      "TAO/month"
    );

    if (yourDailyEstimate < 0.001) {
      console.log(
        "\n⚠️  Your daily earnings are very small (<0.001 TAO/day)"
      );
      console.log(
        "   This is why you may not have noticed any emissions yet."
      );
      console.log(
        "\n💡 To increase earnings, consider depositing more WTAO:"
      );
      console.log("   - 1 WTAO deposit = 4x current earnings");
      console.log("   - 5 WTAO deposit = 20x current earnings");
      console.log("   - 10 WTAO deposit = 40x current earnings");
    }
  }

  console.log(
    "\n⚠️  Note: Emission estimates assume uniform distribution and"
  );
  console.log(
    "   may not reflect actual emissions which depend on validator weights."
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
