// 空白のテンプレートの概要については、次のドキュメントを参照してください:
// http://go.microsoft.com/fwlink/?LinkId=232509

var nowDataArray = null;

(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var wi = window.screen.width;
    var he = window.screen.height;
  
    // 画像のリストを定義
    var dataArray = [
        { type: "item", title: "default_絶壁", picture: "images/default_Cliff.jpg" },
        { type: "item", title: "default_葡萄", picture: "images/default_Grapes.jpg" },
        { type: "item", title: "恵比寿", picture: "images/test.jpg" },
        { type: "item", title: "default_レーニア山", picture: "images/default_Rainier.jpg" },
        { type: "item", title: "default_夕焼け", picture: "images/default_Sunset.jpg" },
        { type: "item", title: "default_渓谷", picture: "images/default_Valley.jpg" }
    ];
    // dataArrayが更新されると勝手にnowDataArrayも更新されているっぽい.
    // 参照渡しなのか？
    nowDataArray = dataArray;


    document.addEventListener("DOMContentLoaded", function (a) {
        console.log("domcontentloaded start");

        WinJS.UI.processAll();

        var folder = Windows.Storage.ApplicationData.current.localFolder;
        var textFileName = "";
        var msg = document.getElementById("msg").textContent;
        var loopPromise = loopAsync(0, function (controller) {
            if (controller.count >= 9) {
                controller.stopLoop();
            }
            var nowLoopCount = controller.count;
            textFileName = "data4_" + nowLoopCount + ".txt";
            console.log("now for = " + textFileName);
            folder.getFileAsync(textFileName).then(
                function (file) {
                    // success
                    return Windows.Storage.FileIO.readTextAsync(file);
                },
                function (err) {
                    // error
                    return new WinJS.Promise.wrapError(err);
                }
            ).then(
                function (data) {
                    // success
                    if (data != null) {
                        var newObject = { type: 'item', title: nowLoopCount, picture: data };
                        dataArray.splice(nowLoopCount, 1, newObject);

                        // 本番モードを使用可能にする
                        document.getElementById("exeMode").disabled = false;
                    }
                    return;
                },
                function (err) {
                    // error
                    return;
                }
            );
        });
        loopPromise.done(function () {
            var itemTemp = document.getElementById("ItemTemplate");
            var flipView = document.getElementById("FlipView").winControl;
            flipView.itemDataSource = new WinJS.Binding.List(dataArray).dataSource;
            flipView.itemTemplate = itemTemp;
        });

        console.log("domcontentloaded end");
    }, false);


    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: このアプリケーションは新しく起動しました。ここでアプリケーションを
                // 初期化します。

                console.log("onactivated start");

                document.querySelector("#FlipView").style.width = wi + "px";
                document.querySelector("#FlipView").style.height = he + "px";

                // eventListener
                document.getElementById("createMode").addEventListener("click", CreateMode, false);
                document.getElementById("exeMode").addEventListener("click", ExeMode, false);
                document.getElementById("register").addEventListener("click", Register3, false);
                document.getElementById("delete").addEventListener("click", Delete, false);
                //document.getElementById("testbutton").addEventListener("click", SetAtTest, false);

                // appbar event
                document.getElementById("appBar").addEventListener("beforeshow", BeforeAppBarShow, false);


                console.log("onactivated end");

            } else {
                // TODO: このアプリケーションは中断状態から再度アクティブ化されました。
                // ここでアプリケーションの状態を復元します。
            }
        }
    };

    app.oncheckpoint = function (args) {
        // TODO: このアプリケーションは中断しようとしています。ここで中断中に
        // 維持する必要のある状態を保存します。中断中に自動的に保存され、
        // 復元される WinJS.Application.sessionState オブジェクトを使用
        // できます。アプリケーションを中断する前に非同期操作を完了する
        // 必要がある場合は、args.setPromise() を呼び出して
        // ください。
    };

    // load act ready no zyunnban

    app.start();
})();

function BeforeAppBarShow(e) {
    var flipView = document.getElementById("FlipView").winControl;
    var app_bar = document.getElementById("appBar").winControl;
    var currentPage = flipView.currentPage;
    
    // appBar呼び出し時の表示画像がデフォルト画像なら削除ボタン隠す
    var nowImageObj = flipView.itemDataSource.list.getAt(currentPage);
    var nowImageTitle = nowImageObj["title"];
    document.getElementById("msg2").textContent = nowImageTitle;
    if (String(nowImageTitle).indexOf("default") != -1) {
        // 画像タイトルにdefaultが含まれている ... 隠す。
        document.getElementById("delete").disabled = true;
    } else {
        // 以下文は必須。先にtrueしていると全画像でhideされたまま。
        document.getElementById("delete").disabled = false;
    }
}

function Delete(e) {
    var flipView = document.getElementById("FlipView");
    var currentPage = flipView.winControl.currentPage;
    var dataArray = flipView.winControl.itemDataSource;

    // 画像をflipViewから外す
    dataArray.list.splice(currentPage, 1);

    var textFile = "data4_" + currentPage + ".txt";

    // TODO : textFileを削除しますか？ウィンドウ
    
    // textFileが存在するなら、次回起動時に読み込まないようにするため、削除する.
    var folder = Windows.Storage.ApplicationData.current.localFolder;
    folder.getFileAsync(textFile).then(function (file) {
        if (file) {
            // success
            return file.deleteAsync();
        } else {
            return;
            //return new WinJS.Promise.wrapError();
        }
    }, function (e) {
        // error
        return;
        //return new WinJS.Promise.wrapError();
    });
    // TODO : default imageを代わりに入れたい
}

// 作成モードボタンが押されたら呼ばれる
function CreateMode(e) {
    // 作成モードボタンは無効
    document.getElementById("createMode").disabled = true;
    // 代わりに、本番モードボタンを有効
    document.getElementById("exeMode").disabled = false;

    // 本番モードからの復帰
    var flipView = document.getElementById("FlipView").winControl;
    flipView.itemDataSource = new WinJS.Binding.List(nowDataArray).dataSource;

    var app_bar = document.getElementById("appBar").winControl;
    app_bar.hide();
}

// 本番モードボタンが押されたら呼ばれる
function ExeMode(e) {
    // 本番モードボタンは無効
    document.getElementById("exeMode").disabled = true;
    // 代わりに、作成モードボタンを有効
    document.getElementById("createMode").disabled = false;

    // default image delete
    var flipView = document.getElementById("FlipView").winControl;
    var dataArray = flipView.itemDataSource;
    var dataArrayLength_beforeLoop = dataArray.list.length;
    //nowDataArray = dataArray.list;
    var deleteImageNum = 0;
    var loopPromise = loopAsync(0, function (controller) {
        var nowCount = controller.count;
        console.log("nowCount = " + nowCount);

        /* 後ろからループ開始してdefault image じゃなくなるまで
        if (String(nowImageTitle).indexOf("default") == -1) {
            controller.stopLoop();
        }*/
        if (nowCount >= dataArrayLength_beforeLoop) {
            controller.stopLoop();
        } else {
            // getAtの引数はnowCountにすると、画像削除後次にチェックする画像を飛ばしてしまう
            var nowImageObj = flipView.itemDataSource.list.getAt(nowCount-deleteImageNum);
            var nowImageTitle = nowImageObj["title"];
            if (String(nowImageTitle).indexOf("default") == -1) {
                // NOT default image
                return;
            } else {
                // default imageなので削除
                dataArray.list.splice(nowCount - deleteImageNum, 1);
                deleteImageNum++;
                return;
            }
        }

    });

    loopPromise.done(function () {
        var app_bar = document.getElementById("appBar").winControl;
        app_bar.hide();
    }, function (err) {

    });

    //var app_bar = document.getElementById("appBar").winControl;
    //app_bar.hide();
}

function Register3(e) {
    // ファイルピッカーを開く
    var view = Windows.UI.ViewManagement.ApplicationView.value;
    if (view === Windows.UI.ViewManagement.ApplicationViewState.snapped &&
        !Windows.UI.ViewManagement.ApplicationView.tryUnsnap()) {
        // TODO : tryUnsnap ha hisuishou
        return;
    }
    // FileOpenPickerオブジェクトを生成
    var picker = new Windows.Storage.Pickers.FileOpenPicker();
    // 表示モード
    picker.viewMode = Windows.Storage.Pickers.PickerViewMode.thumbnail;
    // 開くフォルダーの指定
    picker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.picturesLibrary;
    // 表示ファイルをフィルター
    picker.fileTypeFilter.replaceAll([".png", ".jpg", ".jpeg"]);
    // 「開く」ボタンの表記を変更
    picker.commitButtonText = "決定";


    var flipView = document.getElementById("FlipView");
    var write_data = "";
    var fileName = "";

    var tt = picker.pickSingleFileAsync().then(function (file) {
        if (file) {
            currentPage = flipView.winControl.currentPage;

            // 追加のオブジェクトを生成
            newObject = { type: 'item', title: '-1', picture: 'no_picture' };
            // オブジェクトに追加写真のURIを設定
            newObject["picture"] = URL.createObjectURL(file, { oneTimeOnly: true });
            // TODO : 削除時ファイル名出したいので.
            //newObject["title"] = file.name;
            // for develop
            newObject["title"] = currentPage;

            // image change
            flipView.winControl.itemDataSource.list.setAt(currentPage, newObject);

            var promises = [];
            // return write_data
            promises.push(OnLoad(file));
            // return file(書き込むテキストファイル)
            promises.push(CreateFileAsync(currentPage));
            return WinJS.Promise.join(promises);
        } else {
            // file pick miss
            // throw new Error(); ??
            return new WinJS.Promise.wrapError();
        }
    }, function (err) {
        return new WinJS.Promise.wrapError(err);
    }).then(function (args) {
        return Windows.Storage.FileIO.writeTextAsync(args[1], args[0]);
    }, function (err) {
        // join miss
        return new WinJS.Promise.wrapError(err);
    }).then(
            function () {
                document.getElementById("msg").textContent = "file write success!";
            },
            function (e) {
                document.getElementById("msg").textContent = e;
            }
        );
}

// promiseで処理してwrite_dataを返す
function OnLoad(file) {
    // TODO : file read miss時の処理. onloaded?
    var file_reader = new FileReader();
    file_reader.readAsDataURL(file);
    return new WinJS.Promise(function (comp, err) {
        file_reader.onload = function (e) {
            document.getElementById("msg").textContent = file_reader.result;
            comp(file_reader.result);
        }
    });
}

function CreateFileAsync(currentPage) {
    // return new WinJS.Pro ... のnewがないとfileが返されないっぽい。new必須。
    return new WinJS.Promise(function (Comp, Err) {
        // 本番モードを使えるようにする
        document.getElementById("exeMode").disabled = false;

        // 本番モードから作成モードに復帰時用
        //nowDataArray = flipView.winControl.itemDataSource.list;
        //// nowDataArray.splice(currentPage, 1, newObject);

        // 画像データを書き込むテキストファイルを準備
        var folder = Windows.Storage.ApplicationData.current.localFolder;
        var mode = Windows.Storage.CreationCollisionOption.replaceExisting;
        var fileName = "data4_" + currentPage + ".txt";

        folder.createFileAsync(fileName, mode).then(
            function (file) {
                // create file success!!
                Comp(file);
            },
            function (err) {
                // create file miss
                Err(err);
            }
        );
    });
}

function loopAsync(initVal, fun) {
        if (typeof initVal === "function" && typeof fun === "undefined") {
            fun = initVal;
            initVal = void 0;
        }
        var toBeStopped = false;
        var canceled = false;
        var loopController = {
            get stopLoop() {
                return function () { toBeStopped = true };
            },
            count: 0,
            prevStepValue: void 0
        };
        Object.seal(loopController);
        // cancel できるように Promise を保持しておくための変数
        var processingPromise = null;
        // ここより上では例外を出さないように
        return new WinJS.Promise(
            function (success, error, prog) {
                // この中から例外を送出した場合は Promise のチェインの後ろに ErrorPromise が伝搬する

                var c = 0;
                f(initVal);

                function f(value) {
                    loopController.prevStepValue = value;
                    loopController.count = c;
                    if (canceled) {
                        return;
                    }
                    // timeout メソッドを使うことで関数呼び出しごとにスタックが深くなることを防ぐ
                    processingPromise = WinJS.Promise.timeout(0).then(function () {
                        return fun(loopController);
                    });
                    processingPromise.done(function (val) {
                        processingPromise = null;
                        if (toBeStopped) {
                            success(val);
                            return;
                        }
                        c++;
                        f(val);
                    }, function onError(err) {
                        processingPromise = null;
                        // canceled の場合は外側で ErrorPromise にしてくれるのであえて error を呼び出さなくてもよい
                        if (!canceled) {
                            error(err);
                        }
                    });
                }
            },
            function onCancel() {
                canceled = true;
                if (processingPromise) processingPromise.cancel();
            }
        );
    }
