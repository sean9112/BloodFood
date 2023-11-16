// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract SignUp {
    address[] public StoresContract;
    uint count = 0;

    // 註冊合約
    function addContract(address _contract) public {
        StoresContract.push(_contract);
        count++;
    }

    // 獲得所有合約
    function getContract() public view returns (address[] memory) {
        return StoresContract;
    }

    // 店家登入
    function check(address _contractAddress) public view returns (bool) {
        for (uint i = 0; i < count; i++) {
            if (StoresContract[i] == _contractAddress) {
                return true;
            }
        }
        return false;
    }

    function reset() public {
        delete StoresContract;
        count = 0;
    }
}
