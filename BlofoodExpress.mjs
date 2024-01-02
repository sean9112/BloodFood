import { createAccount, getBalance, deploy, contractCreateOrder, contractPushOrderContent, contractStoreAcceptOrder, contractDeliveryAcceptOrder, deploySignUp, signUpAddContract, signUpGetContract, signUpCheck, contractGetStore, contractSetStore, contractGetClosedStatus, contractSetClosedStatus, contractMenuUpdate, contractGetMenuVersion, contractGetMenu, contractGetOrderContent, contractStoreOvertime, contractFindDeliveryManOvertime, confirmPickUp, confirmDelivery, confirmReceipt, contractGetOrder, contractGetOrderStatus, contractStorePrepared, contractCurrentLocation, contractStoreUndone, contractDeliveryUndone, contractGetMessage, contractSendMessage, contractCheckAvailableOrder, contractGetAvailableOrder, signUpReset, checkUser, contractGetTime, contractSetPreparationTime, contractSetDeliveryTime, contractCancelOrder, contractGetOrderMenuVersion } from "./BlofoodWeb3.mjs";
import express from "express";
import bodyParser from 'body-parser';
const app = express();
const port = 15000;

app.use(bodyParser.urlencoded({ extended: true }));

let signUpContract = "0xe483f0AA99180D2BA259C9Cf73f934FBcfc1A492";


// 創建帳戶
app.post("/createAccount", async (req, res) => {
    console.log("執行 createAccount");
    try {
        let { password } = req.body;
        console.log("密碼:", password);
        let account = await createAccount(password);
        res.status(200).json({ account: account });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("createAccount 執行完畢");
})

// 獲得餘額
app.post("/getBalance", async (req, res) => {
    console.log("執行 getBalance");
    try {
        let { account } = req.body;
        console.log("帳戶:", account);
        let balance = await getBalance(account);
        res.status(200).json({ balance: balance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("getBalance 執行完畢");
})

// 重置註冊合約
app.post("/signUp/reset", async (req, res) => {
    console.log("執行 reset");
    try {
        console.log("reset");
        let _status = await signUpReset(signUpContract);
        res.status(200).json({ status: _status });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("reset 執行完畢");
});

// 獲得所有合約
app.post("/signUp/getContract", async (req, res) => {
    console.log("執行 getContract");
    try {
        console.log(req.body);
        let { account } = req.body;
        let _contracts = await signUpGetContract(signUpContract, account);
        res.status(200).json({ contracts: _contracts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("getContract 執行完畢");
})

// 店家登入比對
app.post("/signUp/check", async (req, res) => {
    console.log("執行 check");
    try {
        console.log(req.body);
        let { storeWallet, storePassword, contractAddress } = req.body;
        let _result = false
        _result = await signUpCheck(signUpContract, storeWallet, storePassword, contractAddress);
        res.status(200).json({ result: _result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("check 執行完畢");
})

// 使用者登入比對
app.post("/checkUser", async (req, res) => {
    console.log("執行 checkUser");
    try {
        console.log(req.body);
        let { wallet, password } = req.body;
        let _result = await checkUser(wallet, password);
        res.status(200).json({ result: _result });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("checkUser 執行完畢");
});


// 發布合約
app.post("/deploy", async (req, res) => {
    console.log("執行 deploy");
    try {
        console.log(req.body);
        let { storePassword, storeName, storeAddress, storePhone, storeWallet, storeTag, latitudeAndLongitude, menuLink, storeEmail, storeImageLink } = req.body;
        let contractAddress = await deploy(storePassword, storeName, storeAddress, storePhone, storeWallet, storeTag, latitudeAndLongitude, menuLink, storeEmail, storeImageLink);
        let _status = await signUpAddContract(signUpContract, storeWallet, storePassword, contractAddress);
        res.status(200).json({ contractAddress: contractAddress, addContractStatus: _status });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("deploy 執行完畢");
})

// 合約內

// 獲得店家資訊
app.post("/contract/getStore", async (req, res) => {
    console.log("執行 getStore");
    try {
        console.log(req.body);
        let { contractAddress, wallet } = req.body;
        let result = await contractGetStore(contractAddress, wallet);
        res.status(200).json({ storeName: result['0'], storeAddress: result['1'], storePhone: result['2'], storeWallet: result['3'], currentID: result['4'], storeTag: result['5'], latitudeAndLongitude: result['6'], menuLink: result['7'], storeEmail: result['8'], storeImageLink: result['9'], menuVersion: result['10'] })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("getStore 執行完畢");
})

// 更改店家資訊
app.post("/contract/setStore", async (req, res) => {
    console.log("執行 setStore");
    try {
        console.log(req.body);
        let { contractAddress, storePassword, storeName, storeAddress, storePhone, storeWallet, storeTag, latitudeAndLongitude, storeEmail, storeImageLink } = req.body;
        let _status = await contractSetStore(contractAddress, storePassword, storeName, storeAddress, storePhone, storeWallet, storeTag, latitudeAndLongitude, storeEmail, storeImageLink);
        res.status(200).json({ status: _status });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("setStore 執行完畢");
})

// 獲得店家休業狀態
app.post("/contract/getClosedStatus", async (req, res) => {
    console.log("執行 getClosedStatus");
    try {
        console.log(req.body);
        let { contractAddress, storeWallet } = req.body;
        let _closedStatus = await contractGetClosedStatus(contractAddress, storeWallet);
        res.status(200).json({ closedStatus: _closedStatus });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("getClosedStatus 執行完畢");
})

// 更改店家休業狀態
app.post("/contract/setClosedStatus", async (req, res) => {
    console.log("執行 setClosedStatus");
    try {
        console.log(req.body);
        let { contractAddress, storeWallet, storePassword, closedStatus } = req.body;
        let _status = await contractSetClosedStatus(contractAddress, storeWallet, storePassword, closedStatus);
        res.status(200).json({ status: _status });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("setClosedStatus 執行完畢");
})

// 更新菜單
app.post("/contract/menuUpdate", async (req, res) => {
    console.log("執行 menuUpdate");
    try {
        console.log(req.body);
        let { contractAddress, storeWallet, storePassword, updateMenuLink } = req.body;
        let _status = await contractMenuUpdate(contractAddress, storeWallet, storePassword, updateMenuLink);
        res.status(200).json({ status: _status });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("menuUpdate 執行完畢");
})

// 查看菜單版本
app.post("/contract/getMenuVersion", async (req, res) => {
    console.log("執行 getMenuVersion");
    try {
        console.log(req.body);
        let { contractAddress, wallet } = req.body;
        let _menuVersion = await contractGetMenuVersion(contractAddress, wallet);
        res.status(200).json({ menuVersion: _menuVersion });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("getMenuVersion 執行完畢");
})

// 查看菜單
app.post("/contract/getMenu", async (req, res) => {
    console.log("執行 getMenu");
    try {
        console.log(req.body);
        let { contractAddress, wallet, menuVersion } = req.body;
        let _menuLink = await contractGetMenu(contractAddress, wallet, menuVersion);
        res.status(200).json({ menuLink: _menuLink });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("getMenu 執行完畢");
})

// 建立訂單
app.post("/contract/createOrder", async (req, res) => {
    console.log("執行 createOrder");
    try {
        console.log(req.body);
        let { contractAddress, consumerPassword, consumerName, consumerAddress, consumerPhone, consumerWallet, fee, note, foodCost, consumerEmail } = req.body;
        let _id = await contractCreateOrder(contractAddress, consumerPassword, consumerName, consumerAddress, consumerPhone, consumerWallet, fee, note, foodCost, consumerEmail);
        res.status(200).json({ id: _id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("createOrder 執行完畢");
})

// 回傳訂單菜單版本
app.post("/contract/getOrderMenuVersion", async (req, res) => {
    console.log("執行 getOrderMenuVersion");
    try {
        console.log(req.body);
        let { contractAddress, wallet, id } = req.body;
        let _orderMenuVersion = await contractGetOrderMenuVersion(contractAddress, wallet, id);
        res.status(200).json({ orderMenuVersion: _orderMenuVersion });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("getOrderMenuVersion 執行完畢");
})

// 推送餐點內容
app.post("/contract/pushOrderContent", async (req, res) => {
    console.log("執行 pushOrderContent");
    try {
        console.log(req.body);
        let { contractAddress, consumerWallet, consumerPassword, id, orderID, num, price } = req.body;
        let status = await contractPushOrderContent(contractAddress, consumerWallet, consumerPassword, id, orderID, num, price);
        res.status(200).json({ status: status });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("pushOrderContent 執行完畢");
})

// 回傳餐點內容
app.post("/contract/getOrderContent", async (req, res) => {
    console.log("執行 getOrderContent");
    try {
        console.log(req.body);
        let { contractAddress, wallet, id } = req.body;
        let _orderContent = await contractGetOrderContent(contractAddress, wallet, id);
        res.status(200).json({ orderContent: _orderContent });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("getOrderContent 執行完畢");
})

// 更改店家接單狀態
app.post("/contract/storeAcceptOrder", async (req, res) => {
    console.log("執行 storeAcceptOrder");
    try {
        console.log(req.body);
        let { contractAddress, storeWallet, storePassword, id, storeAccept } = req.body;
        let status = await contractStoreAcceptOrder(contractAddress, storeWallet, storePassword, id, storeAccept);
        res.status(200).json({ status: status });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("storeAcceptOrder 執行完畢");
})

// 寫入外送員資訊
app.post("/contract/deliveryAcceptOrder", async (req, res) => {
    console.log("執行 deliveryAcceptOrder");
    try {
        console.log(req.body);
        let { contractAddress, id, deliveryName, deliveryPhone, deliveryWallet, deliveryPassword, deliveryEmail } = req.body;
        let status = await contractDeliveryAcceptOrder(contractAddress, id, deliveryName, deliveryPhone, deliveryWallet, deliveryPassword, deliveryEmail);
        res.status(200).json({ status: status });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("deliveryAcceptOrder 執行完畢");
})

// 店家回應超時
app.post("/contract/storeOvertime", async (req, res) => {
    console.log("執行 storeOvertime");
    try {
        console.log(req.body);
        let { contractAddress, storeWallet, storePassword, id } = req.body;
        let status = await contractStoreOvertime(contractAddress, storeWallet, storePassword, id);
        res.status(200).json({ status: status });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("storeOvertime 執行完畢");
})

// 尋找外送員超時
app.post("/contract/findDeliveryManOvertime", async (req, res) => {
    console.log("執行 findDeliveryManOvertime");
    try {
        console.log(req.body);
        let { contractAddress, consumerWallet, consumerPassword, id } = req.body;
        let status = await contractFindDeliveryManOvertime(contractAddress, consumerWallet, consumerPassword, id);
        res.status(200).json({ status: status });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("findDeliveryManOvertime 執行完畢");
})

// 外送員收餐確認
app.post("/contract/confirmPickUp", async (req, res) => {
    console.log("執行 confirmPickUp");
    try {
        console.log(req.body);
        let { contractAddress, deliveryWallet, deliveryPassword, id } = req.body;
        let status = await confirmPickUp(contractAddress, deliveryWallet, deliveryPassword, id);
        res.status(200).json({ status: status });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("confirmPickUp 執行完畢");
})

// 外送員已送達
app.post("/contract/confirmDelivery", async (req, res) => {
    console.log("執行 confirmDelivery");
    try {
        console.log(req.body);
        let { contractAddress, deliveryWallet, deliveryPassword, id } = req.body;
        let status = await confirmDelivery(contractAddress, deliveryWallet, deliveryPassword, id);
        res.status(200).json({ status: status });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("confirmDelivery 執行完畢");
})

// 消費者確認簽收
app.post("/contract/confirmReceipt", async (req, res) => {
    console.log("執行 confirmReceipt");
    try {
        console.log(req.body);
        let { contractAddress, consumerWallet, consumerPassword, id, cost } = req.body;
        let status = await confirmReceipt(contractAddress, consumerWallet, consumerPassword, id, cost);
        res.status(200).json({ status: status });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("confirmReceipt 執行完畢");
})

// 回傳訂單資訊
app.post("/contract/getOrder", async (req, res) => {
    console.log("執行 getOrder");
    try {
        console.log(req.body);
        let { contractAddress, wallet, id } = req.body;
        let _result = await contractGetOrder(contractAddress, wallet, id);
        res.status(200).json({
            id: _result['0'], consumer: _result['1'], fee: _result['2'], note: _result['3'], foodCost: _result['4'], storeAccept: _result['5'], delivery: _result['6'], storeStatus: _result['7'], orderStatus: _result['8'], deliveryLocation: _result['9'], receiveConfirm: _result['10'], deliveryConfirm: _result['11']
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("getOrder 執行完畢");
})

// 回傳訂單狀態
app.post("/contract/getOrderStatus", async (req, res) => {
    console.log("執行 getOrderStatus");
    try {
        console.log(req.body);
        let { contractAddress, wallet, id } = req.body;
        let _result = await contractGetOrderStatus(contractAddress, wallet, id);
        res.status(200).json({ storeStatus: _result['0'], orderStatus: _result['1'], deliveryLocation: _result['2'], receiveConfirm: _result['3'], deliveryConfirm: _result['4'] });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("getOrderStatus 執行完畢");
})

// 更改店家準備狀態
app.post("/contract/storePrepared", async (req, res) => {
    console.log("執行 storePrepared");
    try {
        console.log(req.body);
        let { contractAddress, storeWallet, storePassword, id } = req.body;
        let status = await contractStorePrepared(contractAddress, storeWallet, storePassword, id);
        res.status(200).json({ status: status });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("storePrepared 執行完畢");
})

// 更改外送員當前位置
app.post("/contract/currentLocation", async (req, res) => {
    console.log("執行 currentLocation");
    try {
        console.log(req.body);
        let { contractAddress, deliveryWallet, deliveryPassword, id, deliveryLocation } = req.body;
        let status = await contractCurrentLocation(contractAddress, deliveryWallet, deliveryPassword, id, deliveryLocation);
        res.status(200).json({ status: status });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("currentLocation 執行完畢");
})

// 店家違約
app.post("/contract/storeUndone", async (req, res) => {
    console.log("執行 storeUndone");
    try {
        console.log(req.body);
        let { contractAddress, storeWallet, storePassword, id, cost } = req.body;
        let status = await contractStoreUndone(contractAddress, storeWallet, storePassword, id, cost);
        res.status(200).json({ status: status });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("storeUndone 執行完畢");
})

// 外送員違約
app.post("/contract/deliveryUndone", async (req, res) => {
    console.log("執行 deliveryUndone");
    try {
        console.log(req.body);
        let { contractAddress, deliveryWallet, deliveryPassword, id, cost } = req.body;
        let status = await contractDeliveryUndone(contractAddress, deliveryWallet, deliveryPassword, id, cost);
        res.status(200).json({ status: status });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("deliveryUndone 執行完畢");
})

// 獲取訊息
app.post("/contract/getMessage", async (req, res) => {
    console.log("執行 getMessage");
    try {
        console.log(req.body);
        let { contractAddress, wallet, id } = req.body;
        let _result = await contractGetMessage(contractAddress, wallet, id);
        res.status(200).json({ message: _result });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("getMessage 執行完畢");
})

// 發送訊息
app.post("/contract/sendMessage", async (req, res) => {
    console.log("執行 sendMessage");
    try {
        console.log(req.body);
        let { contractAddress, wallet, password, id, sender, receiver, messageContent } = req.body;
        let status = await contractSendMessage(contractAddress, wallet, password, id, sender, receiver, messageContent);
        res.status(200).json({ status: status });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("sendMessage 執行完畢");
})

// 檢查是否有可接單
app.post("/contract/checkAvailableOrder", async (req, res) => {
    console.log("執行 checkAvailableOrder");
    try {
        console.log(req.body);
        let { contractAddress, wallet } = req.body;
        let _result = await contractCheckAvailableOrder(contractAddress, wallet);
        res.status(200).json({ result: _result });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("checkAvailableOrder 執行完畢");
})

// 獲取可接單ID
app.post("/contract/getAvailableOrder", async (req, res) => {
    console.log("執行 getAvailableOrder");
    try {
        console.log(req.body);
        let { contractAddress, wallet } = req.body;
        let _availableOrderID = await contractGetAvailableOrder(contractAddress, wallet);
        res.status(200).json({ availableOrderID: _availableOrderID });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("getAvailableOrder 執行完畢");
})

// 監聽event狀態
app.post("/contract/eventStatus", async (req, res) => {
    console.log("執行 eventStatus");
    try {
        console.log(req.body);
        let { contractAddress, wallet, id } = req.body;
        let _result = await contractEvent(contractAddress, wallet, id);
        res.status(200).json({ result: _result });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("eventStatus 執行完畢");
});


// 獲得訂單時間、店家準備時間以及外送員路線估計時間
app.post("/contract/getTime", async (req, res) => {
    console.log("執行 getTime");
    try {
        console.log(req.body);
        let { contractAddress, wallet, id } = req.body;
        let _result = await contractGetTime(contractAddress, wallet, id);
        res.status(200).json({ result: _result });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("getTime 執行完畢");
});

// 寫入店家準備時間
app.post("/contract/setPreparationTime", async (req, res) => {
    console.log("執行 setPreparationTime");
    try {
        console.log(req.body);
        let { contractAddress, storeWallet, storePassword, id, preparationTime } = req.body;
        let status = await contractSetPreparationTime(contractAddress, storeWallet, storePassword, id, preparationTime);
        res.status(200).json({ status: status });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("setPreparationTime 執行完畢");
});

// 寫入外送員路線估計時間
app.post("/contract/setDeliveryTime", async (req, res) => {
    console.log("執行 setDeliveryTime");
    try {
        console.log(req.body);
        let { contractAddress, consumerWallet, consumerPassword, id, deliveryTime } = req.body;
        let status = await contractSetDeliveryTime(contractAddress, consumerWallet, consumerPassword, id, deliveryTime);
        res.status(200).json({ status: status });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("setDeliveryTime 執行完畢");
});


// 取消訂單
app.post("/contract/cancelOrder", async (req, res) => {
    console.log("執行 cancelOrder");
    try {
        console.log(req.body);
        let { contractAddress, consumerWallet, consumerPassword, id } = req.body;
        let status = await contractCancelOrder(contractAddress, consumerWallet, consumerPassword, id);
        res.status(200).json({ status: status });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("cancelOrder 執行完畢");
});

// 消費者確認店家準備時間
app.post("/contract/preparationTimeConfirm", async (req, res) => {
    console.log("執行 preparationTimeConfirm");
    try {
        console.log(req.body);
        let { contractAddress, consumerWallet, consumerPassword, id } = req.body;
        let status = await contractPreparationTimeConfirm(contractAddress, consumerWallet, consumerPassword, id);
        res.status(200).json({ status: status });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }

    console.log("preparationTimeConfirm 執行完畢");
});

app.listen(port, () => {
    console.log(`伺服器正在本地執行，Port 為 : ${port}`)
});
