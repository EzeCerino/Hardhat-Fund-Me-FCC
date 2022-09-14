const { ethers, getNamedAccounts } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts()
    const FundMe = await ethers.getContract("FundMe", deployer)
    console.log("funding contract...")
    const fundTxResponse = await FundMe.fund({
        value: ethers.utils.parseEther("0.1"),
    })
    await fundTxResponse.wait(1)
    console.log("Contract has been funded suesfully!!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
