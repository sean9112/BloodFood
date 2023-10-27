// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Order {
    event Status(uint orderID, uint statusNum);
    event Message(uint orderID);

    string public storeName; // 店家資訊
    string public storeAddress;
    string public storePhone;
    address payable public storeWallet;
    uint public currentID; // 下一筆單號
    string public storeTag;
    string public latitudeAndLongitude; // 店家經緯度
    uint public menuVersion;

    bool public closedStatus;

    uint public nextOrderToCheck = 0;

    mapping(uint => string) public menuLink; // 用菜單版本指向菜單連結

    constructor(
        string memory _storeName,
        string memory _storeAddress,
        string memory _storePhone,
        address payable _storeWallet,
        string memory _storeTag,
        string memory _latitudeAndLongitude,
        string memory _menuLink
    ) {
        // 建立合約時寫入店家資訊
        storeName = _storeName;
        storeAddress = _storeAddress;
        storePhone = _storePhone;
        storeWallet = _storeWallet;
        storeTag = _storeTag;
        latitudeAndLongitude = _latitudeAndLongitude;
        menuLink[0] = _menuLink;
    }

    // 店家資訊

    function getStore()
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            address,
            uint,
            string memory,
            string memory,
            string memory
        )
    {
        // 獲得店家資訊
        return (
            storeName,
            storeAddress,
            storePhone,
            storeWallet,
            currentID,
            storeTag,
            latitudeAndLongitude,
            menuLink[menuVersion]
        );
    }

    function setStore(
        string memory _storeName,
        string memory _storeAddress,
        string memory _storePhone,
        address payable _storeWallet,
        string memory _storeTag,
        string memory _latitudeAndLongitude
    ) public {
        // 更改店家資訊
        storeName = _storeName;
        storeAddress = _storeAddress;
        storePhone = _storePhone;
        storeWallet = _storeWallet;
        storeTag = _storeTag;
        latitudeAndLongitude = _latitudeAndLongitude;
    }

    function getClosedStatus() public view returns (bool) {
        // 獲得休業狀態
        return closedStatus;
    }

    function setClosedStatus(bool _closedStatus) public {
        // 更改休業狀態
        closedStatus = _closedStatus;
    }

    function menuUpdate(string memory _updateMenuLink) public {
        // 更改菜單
        menuVersion += 1;
        menuLink[menuVersion] = _updateMenuLink;
    }

    function getMenuVersion() public view returns (uint) {
        // 查看菜單版本
        return menuVersion;
    }

    function getMenu(uint _menuVersion) public view returns (string memory) {
        return menuLink[_menuVersion];
    }

    enum OrderStatus {
        // 訂單當前狀態
        WaitForStore,
        FindDeliveryMan,
        StorePreparing,
        DeliveryPicksUp,
        Delivering,
        ToBeConfirmed,
        Confirmed,
        StoreReject,
        StoreOvertime,
        FindDeliveryManOvertime,
        StoreUndone,
        DeliveryUndone
    }

    struct MessageStruct {
        // 訊息結構
        uint sender;
        uint receiver;
        string messageContent;
    }

    struct OrderContentStruct {
        // 餐點內容結構
        string id;
        string num;
    }

    mapping(uint => OrderStruct) public orders; // 使用映射存儲訂單
    mapping(uint => MessageStruct[]) public messages; // 使用映射存儲訊息
    mapping(uint => OrderContentStruct[]) public orderContents; // 使用映射存儲餐點內容
    mapping(uint => uint) public currentMenuVersion;
    mapping(uint => uint) public orderTime;

    struct Consumer {
        // 消費者資訊
        string Name;
        string Address;
        string Phone;
        address payable Wallet;
    }

    struct Delivery {
        // 外送員資訊
        string Name;
        string Phone;
        address payable Wallet;
    }

    struct OrderStruct {
        uint orderID; // 訂單單號
        Consumer consumer; // 宣告消費者資訊結構
        uint fee; // 外送費
        string note; // 備註文字
        uint foodCost; // 餐點費用
        bool storeAccept; // 店家接受訂單
        Delivery delivery; // 宣告外送員資訊結構
        bool storeStatus; // 店家準備狀態
        OrderStatus orderStatus; // 訂單當前狀態
        string deliveryLocation; // 外送員當前位置
        bool receiveConfirm; // 收餐確認
        bool deliveryConfirm; // 送達確認
    }

    // 點餐 function
    function createOrder(
        // 建立訂單
        string memory _consumerName,
        string memory _consumerAddress,
        string memory _consumerPhone,
        address payable _consumerWallet,
        uint _fee,
        string memory _note,
        uint _foodCost
    ) public {
        OrderStruct memory newOrder; // 宣告新結構
        newOrder.orderID = currentID; // 寫入這則訂單的單號
        newOrder.consumer.Name = _consumerName; // 寫入消費者與設定的訂單資訊
        newOrder.consumer.Address = _consumerAddress;
        newOrder.consumer.Phone = _consumerPhone;
        newOrder.consumer.Wallet = _consumerWallet;
        newOrder.fee = _fee;
        newOrder.note = _note;
        newOrder.foodCost = _foodCost;
        newOrder.orderStatus = OrderStatus.WaitForStore;

        orders[newOrder.orderID] = newOrder; // 將訂單結構存入映射
        currentMenuVersion[newOrder.orderID] = menuVersion;
        currentID++;
        orderTime[newOrder.orderID] = block.timestamp;
        emit Status(newOrder.orderID, 0);
    }

    function pushOrderContent(
        uint _id,
        string memory _orderid,
        string memory _num
    ) public {
        // push 餐點內容至訂單
        orderContents[_id].push(OrderContentStruct({id: _orderid, num: _num}));
    }

    function getOrderContent(
        uint _id
    ) public view returns (OrderContentStruct[] memory) {
        // 回傳餐點內容
        return orderContents[_id];
    }

    // 接受訂單
    function storeAcceptOrder(uint _id, bool _storeAccept) public {
        // 店家是否接受訂單
        if (_storeAccept == false) {
            // 店家拒絕
            orders[_id].orderStatus = OrderStatus.StoreReject;
            emit Status(_id, 7);
        } else if (_storeAccept == true) {
            // 店家接受
            orders[_id].storeAccept = _storeAccept;
            orders[_id].orderStatus = OrderStatus.FindDeliveryMan;
            emit Status(_id, 1);
        }
    }

    function deliveryAcceptOrder(
        uint _id,
        string memory _deliveryName,
        string memory _deliveryPhone,
        address payable _deliveryWallet
    ) public {
        // 寫入外送員資訊
        orders[_id].delivery.Name = _deliveryName;
        orders[_id].delivery.Phone = _deliveryPhone;
        orders[_id].delivery.Wallet = _deliveryWallet;
        orders[_id].orderStatus = OrderStatus.StorePreparing;
        emit Status(_id, 2);
    }

    // 超時 function
    function storeOvertime(uint _id) public {
        // 店家回應超時
        orders[_id].orderStatus = OrderStatus.StoreOvertime;
        emit Status(_id, 8);
    }

    function findDeliveryManOvertime(uint _id) public {
        // 尋找外送員超時
        orders[_id].orderStatus = OrderStatus.FindDeliveryManOvertime;
        emit Status(_id, 9);
    }

    // 確認 function
    function confirmPickUp(uint _id) public {
        // 外送員收餐確認
        orders[_id].orderStatus = OrderStatus.Delivering;
        orders[_id].receiveConfirm = true;
        emit Status(_id, 4);
    }

    function confirmDelivery(uint _id) public {
        // 外送員已送達
        orders[_id].orderStatus = OrderStatus.ToBeConfirmed;
        emit Status(_id, 5);
    }

    function confirmReceipt(uint _id) public payable {
        // 消費者確認簽收
        storeWallet.transfer(orders[_id].foodCost); // 轉帳給店家
        orders[_id].delivery.Wallet.transfer(orders[_id].fee); // 轉帳給外送員

        orders[_id].orderStatus = OrderStatus.Confirmed;
        orders[_id].deliveryConfirm = true;
        emit Status(_id, 6);
    }

    // 狀態 function
    function firstGetOrder(uint _id) public view returns (OrderStruct memory) {
        // 回傳訂單全部訂單狀態
        return orders[_id];
    }

    function getOrder(
        uint _id
    ) public view returns (bool, OrderStatus, string memory, bool, bool) {
        // 回傳部分訂單狀態
        return (
            orders[_id].storeStatus,
            orders[_id].orderStatus,
            orders[_id].deliveryLocation,
            orders[_id].receiveConfirm,
            orders[_id].deliveryConfirm
        );
    }

    function storePrepared(uint _id) public {
        // 店家已準備好餐點
        orders[_id].storeStatus = true;
        orders[_id].orderStatus = OrderStatus.DeliveryPicksUp;
        emit Status(_id, 3);
    }

    function currentLocation(uint _id, string memory _deliveryLocation) public {
        // 寫入外送員當前位置
        orders[_id].deliveryLocation = _deliveryLocation;
    }

    // 違約 function
    function storeUndone(uint _id) public {
        orders[_id].consumer.Wallet.transfer(orders[_id].fee); // 轉帳給消費者違約金
        orders[_id].delivery.Wallet.transfer(orders[_id].fee); // 轉帳給外送員違約金
        orders[_id].orderStatus = OrderStatus.StoreUndone;
        emit Status(_id, 10);
    }

    function deliveryUndone(uint _id) public {
        storeWallet.transfer(orders[_id].foodCost); // 轉帳給店家餐錢
        orders[_id].consumer.Wallet.transfer(orders[_id].fee); // 轉帳給消費者違約金
        orders[_id].orderStatus = OrderStatus.DeliveryUndone;
        emit Status(_id, 11);
    }

    // 訊息 function
    function sendMessage(
        uint _id,
        uint _sender,
        uint _receiver,
        string memory _messageContent
    ) public {
        // 發送訊息
        messages[_id].push(
            MessageStruct({
                sender: _sender,
                receiver: _receiver,
                messageContent: _messageContent
            })
        );
        emit Message(_id);
    }

    function getMessage(uint _id) public view returns (MessageStruct[] memory) {
        // 回傳訊息
        return messages[_id];
    }

    // 外送員查看
    function availableOrder() public returns (bool) {
        // 查看是否有可接訂單
        uint i;
        for (i = nextOrderToCheck; i < currentID; i++) {
            if (
                orders[i].orderStatus != OrderStatus.WaitForStore ||
                orders[i].orderStatus != OrderStatus.FindDeliveryMan
            ) {
                break;
            }
        }
        nextOrderToCheck = i;
        for (; i < currentID; i++) {
            if (orders[i].orderStatus == OrderStatus.FindDeliveryMan) {
                return true;
            }
        }
        return false;
    }

    function getAvailableOrder() public view returns (uint[] memory) {
        // 獲得可接訂單 ID
        uint[] memory availableOrderID;
        uint j = 0;
        for (uint i = nextOrderToCheck; i < currentID; i++) {
            if (orders[i].orderStatus == OrderStatus.FindDeliveryMan) {
                availableOrderID[j] = i;
                j++;
            }
        }
        return availableOrderID;
    }
}
