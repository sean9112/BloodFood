import Web3 from "web3";
import fs from "fs";

const etherBaseAccount = "0xbedd39b93dc7d8c21234302bb3719b1ea5cfef12"

// 外部 Function

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))

// 創建帳戶
async function createAccount(password) {
    try {
        const account = await web3.eth.personal.newAccount(password);
        console.log("成功創建帳戶")
        console.log("帳戶:" + account);
        await web3.eth.personal.unlockAccount(etherBaseAccount, "0");
        await web3.eth.sendTransaction({ from: etherBaseAccount, to: account, value: "1000000000000000000" });//1eth
        return account;
    } catch (error) {
        console.error("創建帳戶出錯:", error);
        throw error;
    }
}

// 回傳餘額
async function getBalance(address) {
    try {
        const balance = await web3.eth.getBalance(address);
        console.log("成功獲得帳戶餘額");
        console.log("帳戶餘額:" + balance);
        return balance;
    } catch (error) {
        console.error("獲得餘額出錯:", error);
        throw error;
    }
}

// 註冊合約

// 發布註冊合約
async function deploySignUp() {
    console.log("開始部署合約...");
    const Account = etherBaseAccount;
    const Password = "0";
    await new Promise(resolve => setTimeout(resolve, 5000));
    try {
        try {
            await web3.eth.personal.unlockAccount(Account, Password);
            console.log("成功解鎖帳戶");
        } catch (error) {
            console.error("解鎖帳戶出錯:", error);
            throw error;
        }
        const ABI = JSON.parse(fs.readFileSync('./SignUp.abi', 'utf8'));
        const bin = fs.readFileSync('./SignUp.bin', 'utf8');
        const myContract = new web3.eth.Contract(ABI, '0x6ee9957aef5f4073c6af71441ec7962527c37671', {
            from: Account,
        });
        let _signUpContract;
        await myContract.deploy({
            data: bin,
        }).send({
            from: Account,
            gasPrice: '1000000000'
        }).then(function (newContractInstance) {
            _signUpContract = newContractInstance.options.address;
        });
        console.log("成功發布合約");
        console.log("合約地址:", _signUpContract);
        return _signUpContract;
    } catch (error) {
        console.error("部署合約出錯:", error);
        throw error;
    }
}

// 註冊新合約
async function signUpAddContract(signUpContract, _storeWallet, _storePassword, _contract) {
    try {
        const Account = _storeWallet;
        const Password = _storePassword;
        await new Promise(resolve => setTimeout(resolve, 5000));
        try {
            await web3.eth.personal.unlockAccount(Account, Password);
            console.log("成功解鎖帳戶");
        } catch (error) {
            console.error("解鎖帳戶出錯:", error);
            return;
        }
        const ABI = JSON.parse(fs.readFileSync('./SignUp.abi', 'utf8'));
        const SC = signUpContract;
        const Contract = new web3.eth.Contract(ABI, SC);

        const transactionReceipt = await Contract.methods.addContract(_contract)
            .send({ from: Account });
        console.log(transactionReceipt);
        if (transactionReceipt.status) {
            console.log("新增訂單合約成功")
            return true;
        } else {
            console.error("新增訂單合約失敗");
            return false;
        }
    } catch (error) {
        console.error("新增訂單合約出錯", error);
        throw error;
    }
}

// // 註銷合約
// async function signUpRemoveContract(signUpContract, _storeWallet, _storePassword, _enrollID) {
//     try {
//         const Account = _storeWallet;
//         const Password = _storePassword;
//         await new Promise(resolve => setTimeout(resolve, 5000));
//         try {
//             await web3.eth.personal.unlockAccount(Account, Password);
//             console.log("成功解鎖帳戶");
//         } catch (error) {
//             console.error("解鎖帳戶出錯:", error);
//             throw error;
//         }
//         const ABI = JSON.parse(fs.readFileSync('./SignUp.abi', 'utf8'));
//         const SC = signUpContract;
//         const Contract = new web3.eth.Contract(ABI, SC);

//         const transactionReceipt = await Contract.methods.removeContract(_enrollID).send({ from: Account });
//         console.log(transactionReceipt);
//         if (transactionReceipt.status) {
//             console.log("註銷合約成功")
//             return true;
//         } else {
//             console.error("註銷合約成功");
//             return false;
//         }
//     } catch (error) {
//         console.error("獲得所有合約出錯", error);
//         throw error;
//     }
// }

// 獲得所有合約
async function signUpGetContract(signUpContract, account) {
    try {
        const Account = account;
        await new Promise(resolve => setTimeout(resolve, 5000));

        const ABI = JSON.parse(fs.readFileSync('./SignUp.abi', 'utf8'));
        const SC = signUpContract;
        const Contract = new web3.eth.Contract(ABI, SC);

        const _contracts = await Contract.methods.getContract().call({ from: Account });
        console.log("contracts:", _contracts);
        return _contracts;
    } catch (error) {
        console.error("獲得所有合約出錯", error);
        throw error;
    }
}

// 登入比對
async function signUpCheck(signUpContract, storeWallet, storePassword, _contractAddress) {
    try {
        const Account = storeWallet;
        const Password = storePassword;
        await new Promise(resolve => setTimeout(resolve, 5000));

        console.log("正在檢查店家合約是否在註冊合約中...")
        try {
            await web3.eth.personal.unlockAccount(Account, Password);
            console.log("成功解鎖帳戶");
        } catch (error) {
            console.error("帳號密碼有誤或解鎖帳戶出錯:", error);
            return false;
        }

        const ABI1 = JSON.parse(fs.readFileSync('./SignUp.abi', 'utf8'));
        const SC1 = signUpContract;
        const Contract1 = new web3.eth.Contract(ABI1, SC1);

        const _signUpResult = await Contract1.methods.check(_contractAddress).call({ from: Account });
        console.log("signUpResult:", _signUpResult);
        if (_signUpResult == false) {
            console.log("店家合約沒在註冊合約中");
            return false;
        } else {
            console.log("正在檢查帳戶與店家合約是否匹配...");
            try {
                await web3.eth.personal.unlockAccount(Account, Password);
                console.log("成功解鎖帳戶");
            } catch (error) {
                console.error("解鎖帳戶出錯:", error);
                return false;
            }

            const ABI2 = JSON.parse(fs.readFileSync('./Order.abi', 'utf8'));
            const SC2 = _contractAddress;
            const Contract2 = new web3.eth.Contract(ABI2, SC2);

            const _orderResult = await Contract2.methods.getStore().call({ from: Account });
            console.log("orderResult:", _orderResult);
            if (_orderResult['3'].toLowerCase() == storeWallet.toLowerCase()) {
                console.log("完成確認");
                return true;
            } else {
                console.log("此帳戶與店家合約不匹配");
                return false;
            }
        }

    } catch (error) {
        console.error("比對出錯", error);
        return false;
    }
}

// 訂單合約

// 部署合約
async function deploy(storePassword, _storeName, _storeAddress, _storePhone, _storeWallet, _storeTag, _latitudeAndLongitude, _menuLink, _storeEmail) {
    console.log("開始部署合約...");
    const Account = _storeWallet;
    const Password = storePassword
    await new Promise(resolve => setTimeout(resolve, 5000));
    try {
        try {
            await web3.eth.personal.unlockAccount(Account, Password);
            console.log("成功解鎖帳戶");
        } catch (error) {
            console.error("解鎖帳戶出錯:", error);
            throw error;
        }
        const ABI = JSON.parse(fs.readFileSync('./Order.abi', 'utf8'));
        const bin = fs.readFileSync('./Order.bin', 'utf8');
        const myContract = new web3.eth.Contract(ABI, '0x6ee9957aef5f4073c6af71441ec7962527c37671', {
            from: Account,
        });
        let _contractAddress;
        await myContract.deploy({
            data: bin,
            arguments: [
                _storeName,
                _storeAddress,
                _storePhone,
                web3.utils.toChecksumAddress(_storeWallet),
                _storeTag,
                _latitudeAndLongitude,
                _menuLink,
                _storeEmail
            ]
        }).send({
            from: Account,
            gasPrice: '1000000000'
        }).then(function (newContractInstance) {
            _contractAddress = newContractInstance.options.address;
        });
        console.log("成功發布合約");
        console.log("合約地址:", _contractAddress);
        return _contractAddress;
    } catch (error) {
        console.error("部署合約出錯:", error);
        throw error;
    }
}

// 合約內 Function

// 獲得店家資訊
async function contractGetStore(contractAddress, wallet) {
    try {
        const Account = wallet;
        await new Promise(resolve => setTimeout(resolve, 5000));

        const ABI = JSON.parse(fs.readFileSync('./Order.abi', 'utf8'));
        const SC = contractAddress;
        const Contract = new web3.eth.Contract(ABI, SC);
        let _result = await Contract.methods.getStore().call({ from: Account });
        console.log("result:", _result);
        return _result;
    } catch (error) {
        console.error("獲得店家資訊出錯", error);
        throw error;
    }
}

// 更改店家資訊
async function contractSetStore(contractAddress, storePassword, _storeName, _storeAddress, _storePhone, _storeWallet, _storeTag, _latitudeAndLongitude, _storeEmail) {
    try {
        const Account = _storeWallet;
        const Password = storePassword;
        await new Promise(resolve => setTimeout(resolve, 5000));
        try {
            await web3.eth.personal.unlockAccount(Account, Password);
            console.log("成功解鎖帳戶");
        } catch (error) {
            console.error("解鎖帳戶出錯:", error);
            return;
        }
        const ABI = JSON.parse(fs.readFileSync('./Order.abi', 'utf8'));
        const SC = contractAddress;
        const Contract = new web3.eth.Contract(ABI, SC);

        const transactionReceipt = await Contract.methods.setStore(_storeName, _storeAddress, _storePhone, _storeWallet, _storeTag, _latitudeAndLongitude, _storeEmail)
            .send({ from: Account });

        console.log(transactionReceipt);
        if (transactionReceipt.status) {
            console.log("更改店家資訊成功")
            return true;
        } else {
            console.error("更改店家資訊失敗");
            return false;
        }

    } catch (error) {
        console.error("更改店家資訊出錯", error);
        throw error;
    }
}

// 獲得店家休業狀態
async function contractGetClosedStatus(contractAddress, storeWallet) {
    try {
        const Account = storeWallet;
        await new Promise(resolve => setTimeout(resolve, 5000));

        const ABI = JSON.parse(fs.readFileSync('./Order.abi', 'utf8'));
        const SC = contractAddress;
        const Contract = new web3.eth.Contract(ABI, SC);

        const _closedStatus = await Contract.methods.getClosedStatus().call({ from: Account });
        console.log("closedStatus:", _closedStatus);
        return _closedStatus;
    } catch (error) {
        console.error("獲得店家休業狀態出錯", error);
        throw error;
    }
}

// 更改店家休業狀態
async function contractSetClosedStatus(contractAddress, storeWallet, storePassword, _closedStatus) {
    try {
        const Account = storeWallet;
        const Password = storePassword;
        await new Promise(resolve => setTimeout(resolve, 5000));
        try {
            await web3.eth.personal.unlockAccount(Account, Password);
            console.log("成功解鎖帳戶");
        } catch (error) {
            console.error("解鎖帳戶出錯:", error);
            return;
        }
        const ABI = JSON.parse(fs.readFileSync('./Order.abi', 'utf8'));
        const SC = contractAddress;
        const Contract = new web3.eth.Contract(ABI, SC);

        const transactionReceipt = await Contract.methods.setClosedStatus(_closedStatus)
            .send({ from: Account });

        console.log(transactionReceipt);
        if (transactionReceipt.status) {
            console.log("更改店家休業狀態成功")
            return true;
        } else {
            console.error("更改店家休業狀態失敗");
            return false;
        }

    } catch (error) {
        console.error("更改店家休業狀態出錯", error);
        throw error;
    }
}

// 更改菜單
async function contractMenuUpdate(contractAddress, storeWallet, storePassword, _updateMenuLink) {
    try {
        const Account = storeWallet;
        const Password = storePassword;
        await new Promise(resolve => setTimeout(resolve, 5000));
        try {
            await web3.eth.personal.unlockAccount(Account, Password);
            console.log("成功解鎖帳戶");
        } catch (error) {
            console.error("解鎖帳戶出錯:", error);
            return;
        }
        const ABI = JSON.parse(fs.readFileSync('./Order.abi', 'utf8'));
        const SC = contractAddress;
        const Contract = new web3.eth.Contract(ABI, SC);

        const transactionReceipt = await Contract.methods.menuUpdate(_updateMenuLink)
            .send({ from: Account });

        console.log(transactionReceipt);
        if (transactionReceipt.status) {
            console.log("更改菜單成功")
            return true;
        } else {
            console.error("更改菜單失敗");
            return false;
        }

    } catch (error) {
        console.error("更改菜單出錯", error);
        throw error;
    }
}

// 查看菜單版本
async function contractGetMenuVersion(contractAddress, wallet) {
    try {
        const Account = wallet;
        await new Promise(resolve => setTimeout(resolve, 5000));

        const ABI = JSON.parse(fs.readFileSync('./Order.abi', 'utf8'));
        const SC = contractAddress;
        const Contract = new web3.eth.Contract(ABI, SC);

        const _menuVersion = await Contract.methods.getMenuVersion().call({ from: Account });
        console.log("menuVersion:", _menuVersion);
        return _menuVersion;
    } catch (error) {
        console.error("查看菜單版本出錯", error);
        throw error;
    }
}

// 獲得菜單
async function contractGetMenu(contractAddress, wallet, _menuVersion) {
    try {
        const Account = wallet;
        await new Promise(resolve => setTimeout(resolve, 5000));

        const ABI = JSON.parse(fs.readFileSync('./Order.abi', 'utf8'));
        const SC = contractAddress;
        const Contract = new web3.eth.Contract(ABI, SC);

        const _menuLink = await Contract.methods.getMenu(_menuVersion).call({ from: Account });
        console.log("menuLink:", _menuLink);
        return _menuLink;
    } catch (error) {
        console.error("獲得菜單出錯", error);
        throw error;
    }
}

// 建立訂單
async function contractCreateOrder(contractAddress, consumerPassword, _consumerName, _consumerAddress, _consumerPhone, _consumerWallet, _fee, _note, _foodCost, _consumerEmail) {
    try {
        const Account = _consumerWallet;
        const Password = consumerPassword;
        await new Promise(resolve => setTimeout(resolve, 5000));
        try {
            await web3.eth.personal.unlockAccount(Account, Password);
            console.log("成功解鎖帳戶");
        } catch (error) {
            console.error("解鎖帳戶出錯:", error);
            throw error;
        }
        const ABI = JSON.parse(fs.readFileSync('./Order.abi', 'utf8'));
        const SC = contractAddress;
        const Contract = new web3.eth.Contract(ABI, SC);

        const transactionReceipt = await Contract.methods.createOrder(_consumerName, _consumerAddress, _consumerPhone, _consumerWallet, _fee, _note, _foodCost, _consumerEmail)
            .send({ from: Account });
        console.log(transactionReceipt);
        const _ID = transactionReceipt.events.Status.returnValues[0];
        console.log("ID:", _ID);
        console.log("成功建立訂單");
        return _ID;
    } catch (error) {
        console.error("建立訂單出錯", error);
        throw error;
    }
}

// 推送餐點內容
async function contractPushOrderContent(contractAddress, consumerWallet, consumerPassword, _id, _orderID, _num) {
    try {
        const Account = consumerWallet;
        const Password = consumerPassword;
        await new Promise(resolve => setTimeout(resolve, 5000));
        try {
            await web3.eth.personal.unlockAccount(Account, Password);
            console.log("成功解鎖帳戶");
        } catch (error) {
            console.error("解鎖帳戶出錯:", error);
            return;
        }
        const ABI = JSON.parse(fs.readFileSync('./Order.abi', 'utf8'));
        const SC = contractAddress;
        const Contract = new web3.eth.Contract(ABI, SC);

        const transactionReceipt = await Contract.methods.pushOrderContent(_id, _orderID, _num)
            .send({ from: Account });
        console.log(transactionReceipt);
        if (transactionReceipt.status) {
            console.log("推送餐點成功")
            return true;
        } else {
            console.error("推送餐點內容失敗");
            return false;
        }
    } catch (error) {
        console.error("推送餐點內容出錯", error);
        throw error;
    }
}

// 回傳餐點內容
async function contractGetOrderContent(contractAddress, wallet, _id) {
    try {
        const Account = wallet;
        await new Promise(resolve => setTimeout(resolve, 5000));

        const ABI = JSON.parse(fs.readFileSync('./Order.abi', 'utf8'));
        const SC = contractAddress;
        const Contract = new web3.eth.Contract(ABI, SC);

        const _orderContent = await Contract.methods.getOrderContent(_id).call({ from: Account });
        console.log("orderContent:", _orderContent);
        return _orderContent;
    } catch (error) {
        console.error("獲得餐點出錯", error);
        throw error;
    }
}


// 更改店家接單狀態
async function contractStoreAcceptOrder(contractAddress, storeWallet, storePassword, _id, _storeAccept) {
    try {
        const Account = storeWallet;
        const Password = storePassword;
        await new Promise(resolve => setTimeout(resolve, 5000));
        try {
            await web3.eth.personal.unlockAccount(Account, Password);
            console.log("成功解鎖帳戶");
        } catch (error) {
            console.error("解鎖帳戶出錯:", error);
            throw error;
        }
        const ABI = JSON.parse(fs.readFileSync('./Order.abi', 'utf8'));
        const SC = contractAddress;
        const Contract = new web3.eth.Contract(ABI, SC);

        const transactionReceipt = await Contract.methods.storeAcceptOrder(_id, _storeAccept)
            .send({ from: Account });
        console.log(transactionReceipt);
        if (transactionReceipt.status) {
            console.log("店家接單狀態更改成功")
            return true;
        } else {
            console.error("接單狀態更改失敗");
            return false;
        }
    } catch (error) {
        console.error("接單狀態更改出錯", error);
        throw error;
    }
}

// 寫入外送員資訊
async function contractDeliveryAcceptOrder(contractAddress, _id, _deliveryName, _deliveryPhone, _deliveryWallet, deliveryPassword, _deliveryEmail) {
    try {
        const Account = _deliveryWallet;
        const Password = deliveryPassword;
        await new Promise(resolve => setTimeout(resolve, 5000));
        try {
            await web3.eth.personal.unlockAccount(Account, Password);
            console.log("成功解鎖帳戶");
        } catch (error) {
            console.error("解鎖帳戶出錯:", error);
            throw error;
        }
        const ABI = JSON.parse(fs.readFileSync('./Order.abi', 'utf8'));
        const SC = contractAddress;
        const Contract = new web3.eth.Contract(ABI, SC);

        const transactionReceipt = await Contract.methods.deliveryAcceptOrder(_id, _deliveryName, _deliveryPhone, _deliveryWallet, _deliveryEmail)
            .send({ from: Account });
        console.log(transactionReceipt);
        if (transactionReceipt.status) {
            console.log("寫入外送員資訊成功")
            return true;
        } else {
            console.error("寫入外送員資訊失敗");
            return false;
        }
    } catch (error) {
        console.error("寫入外送員資訊出錯", error);
        throw error;
    }
}

// 店家超時
async function contractStoreOvertime(contractAddress, storeWallet, storePassword, _id) {
    try {
        const Account = storeWallet;
        const Password = storePassword;
        await new Promise(resolve => setTimeout(resolve, 5000));
        try {
            await web3.eth.personal.unlockAccount(Account, Password);
            console.log("成功解鎖帳戶");
        } catch (error) {
            console.error("解鎖帳戶出錯:", error);
            throw error;
        }
        const ABI = JSON.parse(fs.readFileSync('./Order.abi', 'utf8'));
        const SC = contractAddress;
        const Contract = new web3.eth.Contract(ABI, SC);

        const transactionReceipt = await Contract.methods.storeOvertime(_id)
            .send({ from: Account });
        console.log(transactionReceipt);
        if (transactionReceipt.status) {
            console.log("更改店家超時狀態成功")
            return true;
        } else {
            console.error("更改店家超時狀態失敗");
            return false;
        }
    } catch (error) {
        console.error("更改店家超時狀態出錯", error);
        throw error;
    }

}

// 尋找外送員超時
async function contractFindDeliveryManOvertime(contractAddress, consumerWallet, consumerPassword, _id) {
    try {
        const Account = consumerWallet;
        const Password = consumerPassword;
        await new Promise(resolve => setTimeout(resolve, 5000));
        try {
            await web3.eth.personal.unlockAccount(Account, Password);
            console.log("成功解鎖帳戶");
        } catch (error) {
            console.error("解鎖帳戶出錯:", error);
            throw error;
        }
        const ABI = JSON.parse(fs.readFileSync('./Order.abi', 'utf8'));
        const SC = contractAddress;
        const Contract = new web3.eth.Contract(ABI, SC);
        const transactionReceipt = await Contract.methods.findDeliveryManOvertime(_id)
            .send({ from: Account });
        console.log(transactionReceipt);
        if (transactionReceipt.status) {
            console.log("更改尋找外送員超時狀態成功")
            return true;
        } else {
            console.error("更改尋找外送員超時狀態失敗");
            return false;
        }
    } catch {
        console.error("更改尋找外送員超時狀態出錯", error);
        throw error;
    }
}

// 外送員收餐確認
async function confirmPickUp(contractAddress, deliveryWallet, deliveryPassword, _id) {
    const Account = deliveryWallet;
    const Password = deliveryPassword;
    await new Promise(resolve => setTimeout(resolve, 5000));
    try {
        await web3.eth.personal.unlockAccount(Account, Password);
        console.log("成功解鎖帳戶");
    } catch (error) {
        console.error("解鎖帳戶出錯:", error);
        throw error;
    }
    const ABI = JSON.parse(fs.readFileSync('./Order.abi', 'utf8'));
    const SC = contractAddress;
    const Contract = new web3.eth.Contract(ABI, SC);
    const transactionReceipt = await Contract.methods.confirmPickUp(_id)
        .send({ from: Account });
    console.log(transactionReceipt);
    if (transactionReceipt.status) {
        console.log("外送員收餐確認成功")
        return true;
    } else {
        console.error("外送員收餐確認失敗");
        return false;
    }
}

// 外送員已送達
async function confirmDelivery(contractAddress, deliveryWallet, deliveryPassword, _id) {
    const Account = deliveryWallet;
    const Password = deliveryPassword;
    await new Promise(resolve => setTimeout(resolve, 5000));
    try {
        await web3.eth.personal.unlockAccount(Account, Password);
        console.log("成功解鎖帳戶");
    } catch (error) {
        console.error("解鎖帳戶出錯:", error);
        throw error;
    }
    const ABI = JSON.parse(fs.readFileSync('./Order.abi', 'utf8'));
    const SC = contractAddress;
    const Contract = new web3.eth.Contract(ABI, SC);
    const transactionReceipt = await Contract.methods.confirmDelivery(_id)
        .send({ from: Account });
    console.log(transactionReceipt);
    if (transactionReceipt.status) {
        console.log("外送員已送達成功")
        return true;
    } else {
        console.error("外送員已送達失敗");
        return false;
    }
}

// 消費者確認簽收
async function confirmReceipt(contractAddress, consumerWallet, consumerPassword, _id, cost) {
    const Account = consumerWallet;
    const Password = consumerPassword;
    await new Promise(resolve => setTimeout(resolve, 5000));
    try {
        await web3.eth.personal.unlockAccount(Account, Password);
        console.log("成功解鎖帳戶");
    } catch (error) {
        console.error("解鎖帳戶出錯:", error);
        throw error;
    }
    const ABI = JSON.parse(fs.readFileSync('./Order.abi', 'utf8'));
    const SC = contractAddress;
    const Contract = new web3.eth.Contract(ABI, SC);
    const transactionReceipt = await Contract.methods.confirmReceipt(_id)
        .send({ from: Account, gas: 3000000, value: cost });
    console.log(transactionReceipt);
    if (transactionReceipt.status) {
        console.log("消費者確認簽收成功")
        return true;
    } else {
        console.error("消費者確認簽收失敗");
        return false;
    }
}

// 回傳訂單全部訂單狀態
async function contractGetOrder(contractAddress, wallet, _id) {
    try {
        const Account = wallet;
        await new Promise(resolve => setTimeout(resolve, 5000));

        const ABI = JSON.parse(fs.readFileSync('./Order.abi', 'utf8'));
        const SC = contractAddress;
        const Contract = new web3.eth.Contract(ABI, SC);
        let _result = await Contract.methods.getOrder(_id).call({ from: Account });
        console.log("result:", _result);
        return _result;
    } catch (error) {
        console.error("回傳訂單全部訂單狀態出錯", error);
        throw error;
    }
}


// 回傳部分訂單狀態
async function contractGetOrderStatus(contractAddress, wallet, _id) {
    try {
        const Account = wallet;
        await new Promise(resolve => setTimeout(resolve, 5000));

        const ABI = JSON.parse(fs.readFileSync('./Order.abi', 'utf8'));
        const SC = contractAddress;
        const Contract = new web3.eth.Contract(ABI, SC);
        let _result = await Contract.methods.getOrderStatus(_id).call({ from: Account });
        console.log("result:", _result);
        return _result;
    } catch (error) {
        console.error("回傳部分訂單狀態出錯", error);
        throw error;
    }
}


export { createAccount, getBalance, deploy, contractCreateOrder, contractPushOrderContent, contractStoreAcceptOrder, contractDeliveryAcceptOrder, deploySignUp, signUpAddContract, signUpGetContract, signUpCheck, contractGetStore, contractSetStore, contractGetClosedStatus, contractSetClosedStatus, contractMenuUpdate, contractGetMenuVersion, contractGetMenu, contractGetOrderContent, contractStoreOvertime, contractFindDeliveryManOvertime, confirmPickUp, confirmDelivery, confirmReceipt, contractGetOrder, contractGetOrderStatus };
