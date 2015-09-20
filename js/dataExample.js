(function () {
    "use strict";

    // 画像のリストを定義
    var dataArray = [
        { type: "item", title: "絶壁", picture: "images/Cliff.jpg" },
        { type: "item", title: "葡萄", picture: "images/Grapes.jpg" },
        { type: "item", title: "恵比寿", picture: "images/test.jpg" },
        { type: "item", title: "レーニア山", picture: "images/Rainier.jpg" },
        { type: "item", title: "夕焼け", picture: "images/Sunset.jpg" },
        { type: "item", title: "渓谷", picture: "images/Valley.jpg" }
    ];

    var dataList = new WinJS.Binding.List(dataArray, {binding : true});

    var publicMembers =
        {
            itemList: dataList,
            array: dataArray
        };
    WinJS.Namespace.define("DataExample", publicMembers);
})();