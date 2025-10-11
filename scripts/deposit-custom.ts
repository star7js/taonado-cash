import { deposit } from "./deposit";
import { config } from "../config";
import { ethers } from "hardhat";

async function main() {
  // Get the wallet with provider
  const wallet = new ethers.Wallet(config.ethPrivateKey, ethers.provider);

  // Check current balance
  const balance = await ethers.provider.getBalance(wallet.address);
  console.log("Current TAO Balance:", ethers.formatEther(balance), "TAO");

  // Reserve 0.02 TAO for gas fees, deposit the rest
  const gasReserve = ethers.parseEther("0.02");
  const amountToDeposit = balance - gasReserve;

  if (amountToDeposit <= 0n) {
    console.log("Not enough TAO to deposit after reserving gas fees");
    process.exit(1);
  }

  console.log(
    "Depositing:",
    ethers.formatEther(amountToDeposit),
    "TAO (keeping 0.02 for gas)"
  );

  await deposit(wallet, amountToDeposit);

  console.log("\n✅ Deposit successful!");
  console.log("Checking new WTAO balance...");

  // Check new WTAO balance
  const { Contracts } = await import("./contracts");
  const { getDeployedContract } = await import("./store");
  const wtaoDeployed = await getDeployedContract(Contracts.WTAO);
  const wtao = await ethers.getContractAt(
    "WTAO",
    wtaoDeployed.target.toString(),
    wallet
  );

  const wtaoBalance = await wtao.balanceOf(wallet.address);
  console.log("New WTAO Balance:", ethers.formatUnits(wtaoBalance, 18), "WTAO");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
