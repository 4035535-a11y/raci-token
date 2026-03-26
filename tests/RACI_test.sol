// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.20;
import "remix_tests.sol";
import "../contracts/RACI.sol";

contract RACITest {
    uint256 constant FIXED_SUPPLY = 100_000_000_000 * 10 ** 18;
    uint256 constant BURN_AMOUNT = 1_000 * 10 ** 18;

    RACI token;

    function beforeAll() public {
        token = new RACI(address(this));
    }

    function testTokenInitialValues() public {
        Assert.equal(token.name(), "RACI Token", "token name did not match");
        Assert.equal(token.symbol(), "RACI", "token symbol did not match");
        Assert.equal(uint256(token.decimals()), uint256(18), "token decimals did not match");
        Assert.equal(token.MAX_SUPPLY(), FIXED_SUPPLY, "max supply did not match");
        Assert.equal(token.totalSupply(), FIXED_SUPPLY, "token supply did not match");
        Assert.equal(token.balanceOf(address(this)), FIXED_SUPPLY, "holder balance did not match");
    }

    function testBurnReducesBalanceAndSupply() public {
        uint256 supplyBefore = token.totalSupply();
        uint256 balanceBefore = token.balanceOf(address(this));

        token.burn(BURN_AMOUNT);

        Assert.equal(token.totalSupply(), supplyBefore - BURN_AMOUNT, "total supply was not reduced");
        Assert.equal(token.balanceOf(address(this)), balanceBefore - BURN_AMOUNT, "holder balance was not reduced");
    }

    function testBurnMoreThanBalanceReverts() public {
        try token.burn(token.balanceOf(address(this)) + 1) {
            Assert.ok(false, "burn should revert when amount exceeds balance");
        } catch {
            Assert.ok(true, "burn reverted as expected");
        }
    }
}
