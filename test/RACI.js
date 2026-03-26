const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RACI", function () {
  const MAX_SUPPLY = ethers.parseUnits("100000000000", 18);
  const BURN_AMOUNT = ethers.parseUnits("1000", 18);
  const TRANSFER_AMOUNT = ethers.parseUnits("2500", 18);
  const APPROVE_AMOUNT = ethers.parseUnits("750", 18);
  const PERMIT_AMOUNT = ethers.parseUnits("1500", 18);

  async function deployToken() {
    const [owner, holder, recipient, spender] = await ethers.getSigners();
    const RACI = await ethers.getContractFactory("RACI");
    const token = await RACI.deploy(holder.address, owner.address);
    await token.waitForDeployment();

    return { token, owner, holder, recipient, spender };
  }

  it("sets fixed metadata and initial supply on deployment", async function () {
    const { token, owner, holder } = await deployToken();

    expect(await token.name()).to.equal("RACI Token");
    expect(await token.symbol()).to.equal("RACI");
    expect(await token.decimals()).to.equal(18);
    expect(await token.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
    expect(await token.totalSupply()).to.equal(MAX_SUPPLY);
    expect(await token.owner()).to.equal(owner.address);
    expect(await token.balanceOf(holder.address)).to.equal(MAX_SUPPLY);
  });

  it("transfers tokens between holders", async function () {
    const { token, holder, recipient } = await deployToken();

    await expect(token.connect(holder).transfer(recipient.address, TRANSFER_AMOUNT))
      .to.emit(token, "Transfer")
      .withArgs(holder.address, recipient.address, TRANSFER_AMOUNT);

    expect(await token.balanceOf(recipient.address)).to.equal(TRANSFER_AMOUNT);
    expect(await token.balanceOf(holder.address)).to.equal(MAX_SUPPLY - TRANSFER_AMOUNT);
  });

  it("supports approve and transferFrom", async function () {
    const { token, holder, recipient, spender } = await deployToken();

    await expect(token.connect(holder).approve(spender.address, APPROVE_AMOUNT))
      .to.emit(token, "Approval")
      .withArgs(holder.address, spender.address, APPROVE_AMOUNT);

    await expect(
      token.connect(spender).transferFrom(holder.address, recipient.address, APPROVE_AMOUNT)
    )
      .to.emit(token, "Transfer")
      .withArgs(holder.address, recipient.address, APPROVE_AMOUNT);

    expect(await token.balanceOf(recipient.address)).to.equal(APPROVE_AMOUNT);
    expect(await token.allowance(holder.address, spender.address)).to.equal(0);
  });

  it("supports permit approvals by signature", async function () {
    const { token, holder, recipient, spender } = await deployToken();
    const deadline = (await ethers.provider.getBlock("latest")).timestamp + 3600;
    const nonce = await token.nonces(holder.address);
    const chainId = (await ethers.provider.getNetwork()).chainId;
    const tokenAddress = await token.getAddress();

    const domain = {
      name: "RACI Token",
      version: "1",
      chainId,
      verifyingContract: tokenAddress
    };

    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" }
      ]
    };

    const values = {
      owner: holder.address,
      spender: spender.address,
      value: PERMIT_AMOUNT,
      nonce,
      deadline
    };

    const signature = await holder.signTypedData(domain, types, values);
    const { v, r, s } = ethers.Signature.from(signature);

    await expect(
      token.permit(holder.address, spender.address, PERMIT_AMOUNT, deadline, v, r, s)
    )
      .to.emit(token, "Approval")
      .withArgs(holder.address, spender.address, PERMIT_AMOUNT);

    expect(await token.allowance(holder.address, spender.address)).to.equal(PERMIT_AMOUNT);

    await expect(
      token.connect(spender).transferFrom(holder.address, recipient.address, PERMIT_AMOUNT)
    )
      .to.emit(token, "Transfer")
      .withArgs(holder.address, recipient.address, PERMIT_AMOUNT);
  });

  it("burns caller tokens and reduces total supply", async function () {
    const { token, holder } = await deployToken();

    await expect(token.connect(holder).burn(BURN_AMOUNT))
      .to.emit(token, "Transfer")
      .withArgs(holder.address, ethers.ZeroAddress, BURN_AMOUNT);

    expect(await token.totalSupply()).to.equal(MAX_SUPPLY - BURN_AMOUNT);
    expect(await token.balanceOf(holder.address)).to.equal(MAX_SUPPLY - BURN_AMOUNT);
  });

  it("reverts burn when amount exceeds balance", async function () {
    const { token, holder } = await deployToken();

    await expect(
      token.connect(holder).burn(MAX_SUPPLY + 1n)
    ).to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
  });

  it("reverts deployment with the zero address", async function () {
    const RACI = await ethers.getContractFactory("RACI");

    await expect(RACI.deploy(ethers.ZeroAddress, ethers.ZeroAddress)).to.be.reverted;
  });

  it("allows holder to move tokens without changing owner", async function () {
    const { token, owner, holder, recipient } = await deployToken();

    await token.connect(holder).transfer(recipient.address, TRANSFER_AMOUNT);

    expect(await token.owner()).to.equal(owner.address);
    expect(await token.balanceOf(recipient.address)).to.equal(TRANSFER_AMOUNT);
  });

  it("reverts deployment with a zero token owner", async function () {
    const [holder] = await ethers.getSigners();
    const RACI = await ethers.getContractFactory("RACI");

    await expect(RACI.deploy(holder.address, ethers.ZeroAddress)).to.be.revertedWithCustomError(
      RACI,
      "OwnableInvalidOwner"
    );
  });

  it("reverts permit with an expired deadline", async function () {
    const { token, holder, spender } = await deployToken();
    const deadline = 1n;
    const nonce = await token.nonces(holder.address);
    const chainId = (await ethers.provider.getNetwork()).chainId;

    const domain = {
      name: "RACI Token",
      version: "1",
      chainId,
      verifyingContract: await token.getAddress()
    };

    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" }
      ]
    };

    const values = {
      owner: holder.address,
      spender: spender.address,
      value: PERMIT_AMOUNT,
      nonce,
      deadline
    };

    const signature = await holder.signTypedData(domain, types, values);
    const { v, r, s } = ethers.Signature.from(signature);

    await expect(
      token.permit(holder.address, spender.address, PERMIT_AMOUNT, deadline, v, r, s)
    ).to.be.revertedWithCustomError(token, "ERC2612ExpiredSignature");
  });
});
