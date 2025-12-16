const { ethers } = require("hardhat");

async function main() {
  // Get the deployer account
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Treasury wallet address (use deployer for demo, replace with actual treasury)
  const treasuryWallet = deployer.address;

  // Deploy VeoPayment contract
  const VeoPayment = await ethers.getContractFactory("VeoPayment");
  const veoPayment = await VeoPayment.deploy(treasuryWallet);

  await veoPayment.deployed();

  console.log("VeoPayment deployed to:", veoPayment.address);
  console.log("Treasury wallet:", treasuryWallet);

  // Verify deployment by checking tier prices
  const basicPrice = await veoPayment.getTierPrice(0); // BASIC
  const premiumPrice = await veoPayment.getTierPrice(1); // PREMIUM
  const enterprisePrice = await veoPayment.getTierPrice(2); // ENTERPRISE

  console.log("\nTier Prices:");
  console.log("Basic:", ethers.utils.formatEther(basicPrice), "ETH");
  console.log("Premium:", ethers.utils.formatEther(premiumPrice), "ETH");
  console.log("Enterprise:", ethers.utils.formatEther(enterprisePrice), "ETH");

  // Save deployment info
  const deploymentInfo = {
    contractAddress: veoPayment.address,
    treasuryWallet: treasuryWallet,
    deployerAddress: deployer.address,
    network: hre.network.name,
    deploymentTime: new Date().toISOString(),
    tierPrices: {
      basic: ethers.utils.formatEther(basicPrice),
      premium: ethers.utils.formatEther(premiumPrice),
      enterprise: ethers.utils.formatEther(enterprisePrice)
    }
  };

  const fs = require("fs");
  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\nDeployment info saved to deployment-info.json");
  console.log("Contract Address:", veoPayment.address);
  console.log("\nUpdate your .env.local file with:");
  console.log(`NEXT_PUBLIC_X402_PAYMENT_ADDRESS="${veoPayment.address}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });