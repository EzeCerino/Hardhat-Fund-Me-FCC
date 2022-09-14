const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let deployer
          let mockV3Aggregartor
          const sendValue = ethers.utils.parseEther("1")
          //deploying contract
          //const accounts = await ethers.getSigner()
          //const accountZero = accounts[0]
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggregartor = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("constructor", async function () {
              it("set the aggregator address correctly", async function () {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3Aggregartor.address)
              })
          })

          describe("fund", async function () {
              it("Fails if you don't send enougth ETH", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })

              it("Update address to amount founded data strcuture", async function () {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getaddressToAmountFunded(
                      deployer
                  )
                  assert.equal(response.toString(), sendValue.toString())
              })

              it("Add funder to array", async function () {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.getFunders(0)
                  assert.equal(funder, deployer)
              })
          })
          describe("withdraw", async function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue })
              })
              it("withdraw ETH from a single founder", async function () {
                  //arrange
                  const startingContractBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingFunderBalance =
                      await fundMe.provider.getBalance(deployer)
                  //act
                  const txResponse = await fundMe.withdraw()
                  const txWait = await txResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = txWait
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingContractBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const endingFunderBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  //assert
                  assert.equal(endingContractBalance, 0)
                  assert.equal(
                      startingContractBalance
                          .add(startingFunderBalance)
                          .toString(),
                      endingFunderBalance.add(gasCost).toString()
                  )
              })
              it("allows to withdraw from multiple founders", async function () {
                  const accounts = await ethers.getSigners()
                  //arrange
                  for (let i = 1; i < 6; i++) {
                      const fundMeConectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConectedContract.fund({ value: sendValue })
                  }
                  const startingContractBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingFunderBalance =
                      await fundMe.provider.getBalance(deployer)
                  //act
                  const txResponse = await fundMe.withdraw()
                  const txWait = await txResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = txWait
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingContractBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const endingFunderBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  //assert
                  assert.equal(endingContractBalance, 0)
                  assert.equal(
                      startingContractBalance
                          .add(startingFunderBalance)
                          .toString(),
                      endingFunderBalance.add(gasCost).toString()
                  )
                  await expect(fundMe.getFunders(0)).to.be.reverted
                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getaddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })

              it("only owner can withdraw funds", async function () {
                  const accounts = await ethers.getSigners()
                  const attacker = accounts[1]
                  const contractConnectedAtacker = await fundMe.connect(
                      attacker
                  )
                  expect(
                      contractConnectedAtacker.withdraw()
                  ).to.be.revertedWith("FundMe__NotOwner")
              })

              it("Cheapwithdraw ETH from a single founder", async function () {
                  //arrange
                  const startingContractBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingFunderBalance =
                      await fundMe.provider.getBalance(deployer)
                  //act
                  const txResponse = await fundMe.cheapWithdraw()
                  const txWait = await txResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = txWait
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingContractBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const endingFunderBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  //assert
                  assert.equal(endingContractBalance, 0)
                  assert.equal(
                      startingContractBalance
                          .add(startingFunderBalance)
                          .toString(),
                      endingFunderBalance.add(gasCost).toString()
                  )
              })
              it("allows to cheap withdraw from multiple founders", async function () {
                  const accounts = await ethers.getSigners()
                  //arrange
                  for (let i = 1; i < 6; i++) {
                      const fundMeConectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConectedContract.fund({ value: sendValue })
                  }
                  const startingContractBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingFunderBalance =
                      await fundMe.provider.getBalance(deployer)
                  //act
                  const txResponse = await fundMe.cheapWithdraw()
                  const txWait = await txResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = txWait
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingContractBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const endingFunderBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  //assert
                  assert.equal(endingContractBalance, 0)
                  assert.equal(
                      startingContractBalance
                          .add(startingFunderBalance)
                          .toString(),
                      endingFunderBalance.add(gasCost).toString()
                  )
                  await expect(fundMe.getFunders(0)).to.be.reverted
                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getaddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
          })
      })
