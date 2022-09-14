const { ethers, getNamedAccounts } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts()
    const FundMe = await ethers.getContract("FundMe", deployer)
    console.log("Withdrawing...")
    const fundTxResponse = await FundMe.withdraw()
    await fundTxResponse.wait(1)
    console.log("Contract has been withdrawed suesfully!!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
