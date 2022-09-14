const { assert } = require("chai")
const { ethers, getNamedAccounts, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe Staging Test", async function () {
          let fundMe
          let deployer
          const sendValue = ethers.utils.parseEther("0.05")
          beforeEach(async function () {
              deployer = await getNamedAccounts().deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })

          it("allow to fund and witdraw", async function () {
              const fundingTx = await fundMe.fund({ value: sendValue })
              await fundingTx.wait(1)
              const withdrawTx = await fundMe.withdraw()
              await withdrawTx.wait(1)
              const endingBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              assert.equal(endingBalance.toString(), "0")
          })
      })
