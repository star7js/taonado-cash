import { ethers } from "hardhat";
import { getWTAOContract } from "./contracts";
import { config } from "../config";
import { WTAO__factory } from "../typechain-types";

async function main() {
  let instance = await getWTAOContract();
  if (!instance) {
    console.warn("WTAO contract not found, please check env");
    return;
  }

  const address = instance.target;
  console.log(`WTAO address: ${address}`);

  // Get the wallet with provider
  const wallet = new ethers.Wallet(config.ethPrivateKey, ethers.provider);

  // Create contract instance with proper typing
  const contract = WTAO__factory.connect(address.toString(), wallet);

  // Get token info
  const name = await contract.name();
  const symbol = await contract.symbol();
  console.log("Contract name:", name);
  console.log("Token symbol:", symbol);

  // Check current balances
  const wtaoBalanceBefore = await contract.balanceOf(wallet.address);
  const taoBalanceBefore = await ethers.provider.getBalance(wallet.address);

  console.log("\n=== BEFORE WITHDRAWAL ===");
  console.log("WTAO Balance:", ethers.formatEther(wtaoBalanceBefore), "WTAO");
  console.log("TAO Balance:", ethers.formatEther(taoBalanceBefore), "TAO");

  // Test withdrawal - withdraw 0.1 WTAO (small test amount)
  const amountToWithdraw = ethers.parseEther("0.1");
  console.log(`\nWithdrawing ${ethers.formatEther(amountToWithdraw)} WTAO...`);

  // Make the withdrawal
  const tx = await contract.withdraw(amountToWithdraw);
  console.log(`Transaction hash: ${tx.hash}`);

  // Wait for the transaction to be mined
  const receipt = await tx.wait();
  if (receipt) {
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
  }

  // Get the updated balances
  const wtaoBalanceAfter = await contract.balanceOf(wallet.address);
  const taoBalanceAfter = await ethers.provider.getBalance(wallet.address);

  console.log("\n=== AFTER WITHDRAWAL ===");
  console.log("WTAO Balance:", ethers.formatEther(wtaoBalanceAfter), "WTAO");
  console.log("TAO Balance:", ethers.formatEther(taoBalanceAfter), "TAO");

  // Calculate changes
  const wtaoChange = wtaoBalanceBefore - wtaoBalanceAfter;
  const taoChange = taoBalanceAfter - taoBalanceBefore;

  console.log("\n=== CHANGES ===");
  console.log("WTAO Withdrawn:", ethers.formatEther(wtaoChange), "WTAO");
  console.log("TAO Received:", ethers.formatEther(taoChange), "TAO (after gas)");

  console.log("\n✅ Test withdrawal successful!");
  console.log("You can now withdraw more or deposit additional TAO.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
