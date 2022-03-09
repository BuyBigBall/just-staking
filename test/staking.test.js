const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Staking", async function () {
  let staking;  
  const [deployer, user1, user2] = await ethers.getSigners()
  before(async () => {
    const Staking = await ethers.getContractFactory("Staking")
    staking = await Staking.deploy(user2.address)
    await staking.deployed()

  })
  it("Should return the new greeting once it's changed", async function () {
/*    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello, world!");
    await greeter.deployed();

    expect(await greeter.greet()).to.equal("Hello, world!");

    const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await greeter.greet()).to.equal("Hola, mundo!");
*/
  });
});
