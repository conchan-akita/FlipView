// 空白のテンプレートの概要については、次のドキュメントを参照してください:
// http://go.microsoft.com/fwlink/?LinkId=232509

var nowDataArray = null;
var changeNum = 0;

(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var displayInfo = Windows.Graphics.Display.DisplayInformation.getForCurrentView();
    var rawDpiX = displayInfo.rawDpiX;
    var rawDpiY = displayInfo.rawDpiY;
    var pixels = displayInfo.resolutionScale;
    var wi = window.screen.width;
    var he = window.screen.height;
    var app_bar = document.getElementById("appBar");
    var CREATEMODE = 0;
    var EXEMODE = 1;
    var nowMode = CREATEMODE;
    var flipView = document.getElementById("FlipView");
    //var currentPage = flipView.winControl.currentPage;
    var container = Windows.Storage.ApplicationData.current.localSettings;
  
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

        // new 0919 23:20
        var folder = Windows.Storage.ApplicationData.current.localFolder;
        var textFileName = "";
        var msg = document.getElementById("msg").textContent;
        var loopPromise = loopAsync(0, function (controller) {
            //dataArray = controller.prevStepValue;
            if (controller.count >= 9) {
                controller.stopLoop();
            }
            var tmp = controller.count;
            textFileName = "data4_" + tmp + ".txt";
            console.log("now for = " + textFileName);
            folder.getFileAsync(textFileName).then(function (file) {
                // success
                return Windows.Storage.FileIO.readTextAsync(file);
            }, function (err) {
                // error
                return null;
            }).then(function (data) {
                // success
                if (data != null) {
                    var newObject = { type: 'item', title: tmp, picture: data };
                    //dataArray.push(newObject);
                    // このへんでcontroller.countを取ると、変数tmpと違う値になっている.
                    //dataArray.splice(controller.count - 1, 1, newObject);
                    dataArray.splice(tmp, 1, newObject);

                    // 本番モードを使用可能にする
                    document.getElementById("exeMode").disabled = false;

                    //dataArray.push(newObject);
                }
                //return dataArray;
                return;
            }, function (err) {
                // error
                //return dataArray;
                return;
            });

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

                //document.querySelector("#msg").textContent = wi + " , " + he;//pixels;//rawDpiX + " , " + rawDpiY;
                document.querySelector("#FlipView").style.width = wi + "px";
                document.querySelector("#FlipView").style.height = he + "px";

                // eventListener
                document.getElementById("createMode").addEventListener("click", CreateMode, false);
                document.getElementById("exeMode").addEventListener("click", ExeMode, false);
                document.getElementById("register").addEventListener("click", Register3, false);
                document.getElementById("delete").addEventListener("click", Delete, false);
                document.getElementById("testbutton").addEventListener("click", SetAtTest, false);

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

    // 現在表示画像の取得
    
    // デフォルト画像なら削除ボタン隠す
    var nowImageObj = flipView.itemDataSource.list.getAt(currentPage);
    var nowImageTitle = nowImageObj["title"];
    document.getElementById("msg2").textContent = nowImageTitle;
    if (String(nowImageTitle).indexOf("default") != -1) {
        // hide
        document.getElementById("delete").disabled = true;
    } else {
        // 以下文は必須。先にtrueしていると全画像でhideされたまま。
        document.getElementById("delete").disabled = false;
    }
}

function Delete(e) {
    var flipView = document.getElementById("FlipView");
    //var cur = new WinJS.UI.FlipView(flipView).currentPage;
    var cur2 = flipView.winControl.currentPage;
    document.getElementById("msg2").textContent = cur2;

    var dataArray = flipView.winControl.itemDataSource;
    dataArray.list.splice(cur2, 1);

    var textFile = "data4_" + cur2 + ".txt";

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
    //flipView.itemDataSource.beginEdits();
    //flipView.itemDataSource = nowDataArray;
    flipView.itemDataSource = new WinJS.Binding.List(nowDataArray).dataSource;
    //flipView.itemDataSource.endEdits();

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
        //dataArray = controller.prevStepValue;
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

function SetAtTest() {
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

            flipView.winControl.itemDataSource.list.setAt(currentPage, newObject);
        }
    });
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
            promises.push(OnLoad(file));    // return write_data
            // return file(書き込むテキストファイル)
            //promises.push(ChangeImage_and_CreateFile2(currentPage, newObject));
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

//Comp(),Err()が呼びだせない！これはだめ！
// 原因わかった、Promiseオブジェクトを返す最初の関数はreturnできない。
// つまりfolder.createFileAsync()はreturnで書けない。
function CreateFile3(currentPage) {
    var flipView = document.getElementById("FlipView");

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

        return folder.createFileAsync(fileName, mode);
    }).then(function (file) {
        Comp(file);
    }, function (err) {
        Err(err);
    });
}

function ChangeImage_and_CreateFile2(currentPage, newObject) {
    var flipView = document.getElementById("FlipView");
    flipView.winControl.itemDataSource.beginEdits();
    // changeについて、itemDataSourceからではなくdataArrayからできない？
    // ui.js line2229
    //// flipView.winControl.itemDataSource.list.setAt();
    var hoge = currentPage;
    if (changeNum > 0) {
        hoge = 6;
    }

    return new WinJS.Promise(function (Comp, Err) {
        // 2買い目のchangeが失敗する件、newObjectが配列最後尾に入って、
        // 入れ替わり対象の配列indexが空になるからか？
        //  ↑たぶん違う。一度changeして別画像をchangeしようとしても事案発生する.
        flipView.winControl.itemDataSource.change(hoge, newObject).then(
            function () {
                // change success
                changeNum++;
                flipView.winControl.itemDataSource.endEdits();
                document.getElementById("msg2").textContent = "change success!";

                // 本番モードを使えるようにする
                document.getElementById("exeMode").disabled = false;

                // 本番モードから作成モードに復帰時用
                //nowDataArray = flipView.winControl.itemDataSource.list;
                nowDataArray.splice(currentPage, 1, newObject);

                // 画像データを書き込むテキストファイルを準備
                var folder = Windows.Storage.ApplicationData.current.localFolder;
                var mode = Windows.Storage.CreationCollisionOption.replaceExisting;
                var fileName = "data4_" + currentPage + ".txt";

                return folder.createFileAsync(fileName, mode);
            }, function (err) {
                // change miss
                return new WinJS.Promise.wrapError(err);
            }
        ).then(
            function (file) {
                // create file success
                return Comp(file);
            }, function (err) {
                // create file miss
                return Err(err);
            }
        );
    });
}

// うまくreturnできていないっぽい。return先にfileが返るはずなのに返っていない。
function ChangeImage_and_CreateFile(currentPage, newObject) {
    var flipView = document.getElementById("FlipView");

    flipView.winControl.itemDataSource.beginEdits();
    flipView.winControl.itemDataSource.change(currentPage, newObject).then(
        function () {
            // change success
            flipView.winControl.itemDataSource.endEdits();
            document.getElementById("msg2").textContent = "change success!";

            // 本番モードを使えるようにする
            document.getElementById("exeMode").disabled = false;

            // 本番モードから作成モードに復帰時用
            //nowDataArray = flipView.winControl.itemDataSource.list;
            nowDataArray.splice(currentPage, 1, newObject);

            // 画像データを書き込むテキストファイルを準備
            var folder = Windows.Storage.ApplicationData.current.localFolder;
            var mode = Windows.Storage.CreationCollisionOption.replaceExisting;
            var fileName = "data4_" + currentPage + ".txt";

            return folder.createFileAsync(fileName, mode);
        }, function (err) {
            // change miss
            return new WinJS.Promise.wrapError(err);
        }
    );
}

function Register2(e) {
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

    //var folder;
    //var mode;
    var flipView = document.getElementById("FlipView");
    var write_data = "";
    var fileName = "";

    var tt = picker.pickSingleFileAsync().then(
        function (file) {
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


                document.getElementById("msg").textContent = newObject["picture"];
                //DataExample.itemList.push("type: 'item', title: 'nothing', picture:" + file.path);
                filePath = file.path;

                // http://hakuhin.jp/js/data_uri_scheme.html#DATA_URI_SCHEME_02
                // 1. 下文を外に
                file_reader = new FileReader();
                file_reader.readAsDataURL(file);
                // TODO : write_dataが確実に格納されてからfileに書き込む方法はあるか？
                // WinJS.Promise(// write).then
                // 2. onload{}を外に
                file_reader.onload = function (e) {
                    document.getElementById("msg").textContent = file_reader.result;
                    write_data = file_reader.result;
                    // 3. return ~.change()以下をここに。
                }

                // 表示中画像を特定し、その画像の後ろに新画像追加し、表示中画像削除
                flipView = document.getElementById("FlipView");

                flipView.winControl.itemDataSource.beginEdits();
                return flipView.winControl.itemDataSource.change(currentPage, newObject);
            } else {
                // cancel
                //return new Error("cancel");
                //tt.cancel();
                return new WinJS.Promise.wrapError();
            }
        }, function (err) {
            return new WinJS.Promise.wrapError();
        }).then(
            function () {
                //change success
                flipView.winControl.itemDataSource.endEdits();
                document.getElementById("msg2").textContent = "change success!";

                // 本番モードを使えるようにする
                document.getElementById("exeMode").disabled = false;

                // 本番モードから作成モードに復帰時用
                //nowDataArray = flipView.winControl.itemDataSource.list;
                nowDataArray.splice(currentPage, 1, newObject);

                // write
                var folder = Windows.Storage.ApplicationData.current.localFolder;
                // 上書きモード
                var mode = Windows.Storage.CreationCollisionOption.replaceExisting;
                fileName = "data4_" + currentPage + ".txt";
                return folder.createFileAsync(fileName, mode);

            }, function (err) {
                // change miss
                return new WinJS.Promise.wrapError(err);
            }
        ).then(
            function (file) {
                return Windows.Storage.FileIO.writeTextAsync(file, write_data);
            }, function (err) {
                // change miss
                return new WinJS.Promise.wrapError(err);
            }
        ).then(
            function () {
                document.getElementById("msg").textContent = "file write success!";
            },
            function (e) {
                document.getElementById("msg").textContent = e;
            }
        );

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
