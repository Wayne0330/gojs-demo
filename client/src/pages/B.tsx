import "./styles/A.css";
import * as go from "gojs";
import { ReactDiagram } from "gojs-react";

function B() {
  // 定義數個自訂的 Shape 幾何路徑
  const tank1 = "F M 0 0 L 0 75 25 100 50 75 50 0z"; // 50x100 的圖形：梯形水槽
  const tank2 = "F M 0 0 L 0 100 10 100 10 90 40 90 40 100 50 100 50 0z"; // 50x100 的圖形：帶底座結構的水槽
  const tank3 = "F M 0 100 L 0 25 A 25 25 0 0 1 50 25 L 50 100 z"; // 50x100 的圖形：上半部為圓弧形的水槽

  // 左側標籤圖形（像是指示牌）
  const labelLeft = "F M 0 20 L 30 40 100 40 100 0 30 0 z";

  // 右側標籤圖形
  const labelRight = "F M 0 0 L 70 0 100 20 70 40 0 40 z";

  // 閥門圖形
  const valve = "F1 M0 0 L40 20 40 0 0 20z M20 10 L20 30 M12 30 L28 30";

  // 幫浦圖形（有圓形符號）
  const pump = "F M 8 10 A 2 2 0 1 1 6 8 L 9 8 L 9 10 Z M 5 11 A 1 1 0 0 1 7 9";

  // 感測器圖形
  const sensor =
    "F M 0 0 L 15 15 L 15 20 L 5 20 L 5 15 L 0 15 L 0 10 L -2 10 L -2 4 L 0 4 Z";

  // 顏色常數定義
  const colors = {
    black: "#151c26", // 黑色
    white: "#ffffff", // 白色
    gray: "#2c323b", // 灰色
    green: "#7ba961", // 綠色
    blue: "#00a9b0", // 藍色
    pink: "#e483a2", // 粉紅色
    yellow: "#f9c66a", // 黃色
    orange: "#e48042", // 橘色
    red: "#ed2d44", // 紅色
  };

  // 預設文字樣式
  const textDefaults = {
    font: "10px InterVariable, sans-serif", // 字型大小與字體
    stroke: colors.white, // 描邊顏色為白色
  };

  // 建立一個可用於水槽的連接埠 (port) 元件
  // 每個 port 指定其在水槽上的對齊位置（alignment spot）
  // 並可選擇指定來源(fromSpot)與目的(toSpot)
  const tankPort = new go.Panel()
    .bind("alignment", "a") // 綁定對齊位置
    .bind("portId", "p") // 綁定 port 的 ID
    .bind("fromSpot", "fs") // 綁定輸出點
    .bind("toSpot", "ts") // 綁定輸入點
    .add(
      // 使用菱形表示 port，大小為 10x10，填充為白色
      new go.Shape("Diamond", { width: 10, height: 10, fill: colors.white })
    );

  const initDiagram = () => {
    const diagram = new go.Diagram({
      "animationManager.isEnabled": false, // 關閉動畫效果
      "undoManager.isEnabled": true, // 啟用復原功能（必要，才能監聽 model 的變化）
      "rotatingTool.snapAngleMultiple": 90, // 旋轉時角度固定每 90 度
      "rotatingTool.snapAngleEpsilon": 45, // 在 ±45 度內會 snap 到 90 度的倍數
      model: new go.GraphLinksModel({
        linkKeyProperty: "key", // 每條連線的唯一識別鍵
        copiesArrays: true, // 允許複製陣列（例如節點的 ports）
        copiesArrayObjects: true, // 允許複製陣列中的物件（確保 ports 內容正確複製）
        linkFromPortIdProperty: "fromPort", // 連線來源的 port 屬性名稱
        linkToPortIdProperty: "toPort", // 連線目的地的 port 屬性名稱
      }),
    });

    // 設定節點樣板，使用空字串代表預設樣板
    diagram.nodeTemplateMap.add(
      "",
      new go.Node("Spot", {
        itemTemplate: tankPort, // 使用先前定義的 port 樣板
        movable: false, // 節點不可拖曳（固定位置）
      })
        // 雙向綁定節點位置（模型中的 pos 屬性）
        .bindTwoWay("location", "pos", go.Point.parse, go.Point.stringify)
        // 綁定節點的 ports 陣列到 itemArray
        .bind("itemArray", "ports")
        .add(
          // 內層 Spot 面板，包含圖形與文字
          new go.Panel("Spot").add(
            // 加入 Shape（水槽外觀）
            new go.Shape({
              geometryString: tank1, // 預設幾何圖形
              strokeWidth: 1, // 外框粗細
              stroke: "gray", // 外框顏色
              width: 75, // 圖形寬度
              height: 140, // 圖形高度
              fill: new go.Brush("Linear", {
                0: go.Brush.darken(colors.white), // 線性漸層從左到右
                0.2: colors.white,
                0.33: go.Brush.lighten(colors.white),
                0.5: colors.white,
                1: go.Brush.darken(colors.white),
                start: go.Spot.Left,
                end: go.Spot.Right,
              }),
            })
              // 綁定 width、height 可根據模型自訂
              .bind("width")
              .bind("height")
              .bind("geometryString", "tankType"), // 綁定圖形幾何路徑，可變換為 tank2、tank3 等

            // 加入 TextBlock（標籤文字）
            new go.TextBlock({
              font: "bold 13px InterVariable, sans-serif", // 文字樣式
              stroke: colors.black, // 文字顏色
            }).bind("text", "key") // 綁定文字內容為節點的 key
          )
        )
    );

    diagram.nodeTemplateMap.add(
      "label",
      new go.Node("Auto", {
        movable: false, // 標籤不可拖曳
      })
        .bindTwoWay("location", "pos", go.Point.parse, go.Point.stringify) // 雙向綁定位置
        .add(
          // 加入 Shape 作為標籤底圖
          new go.Shape({
            portId: "", // 空字串代表此 Shape 可作為連接埠
            fromSpot: go.Spot.Right, // 出口連線點
            toSpot: go.Spot.LeftRightSides, // 可從左右兩側接入
            geometryString: labelRight, // 預設右向標籤圖形
            strokeWidth: 4,
            fill: colors.black, // 填色
          })
            .bind("width")
            .bind("height")
            .bind("geometryString", "direction", (d) =>
              d === "right" ? labelRight : labelLeft
            ) // 根據方向決定圖形（左或右）
            .bind("stroke", "color"), // 可自定邊框顏色

          // 加入文字內容
          new go.TextBlock({
            margin: new go.Margin(8, 40, 8, 8), // 預設右側寬一點
            textAlign: "center",
            font: "12px sans-serif",
            stroke: colors.white,
            alignment: new go.Spot(0.1, 0.5), // 位置偏左
          })
            .bind("margin", "direction", (d) =>
              d === "right"
                ? new go.Margin(8, 40, 8, 8)
                : new go.Margin(8, 8, 8, 40)
            ) // 根據方向調整內距
            .bind("alignment", "direction", (d) =>
              d === "right" ? new go.Spot(0.3, 0.5) : new go.Spot(0.7, 0.5)
            ) // 調整文字對齊
            .bind("text") // 綁定文字內容
        )
    );
    diagram.nodeTemplateMap.add(
      "valve",
      new go.Node("Vertical", {
        locationSpot: new go.Spot(0.5, 1, 0, -21), // 定位點靠下，微調 Y 軸
        locationObjectName: "SHAPE", // 以 Shape 元件作為定位基準
        selectionObjectName: "SHAPE", // 選取時以此元件為主
        rotatable: true, // 可旋轉
        movable: false, // 不可拖曳
      })
        .bindTwoWay("angle") // 綁定角度，可旋轉
        .bindTwoWay("location", "pos", go.Point.parse, go.Point.stringify)
        .add(
          new go.TextBlock({
            background: colors.black,
            alignment: go.Spot.Center,
            textAlign: "center",
            margin: 2,
            editable: true,
          })
            .set(textDefaults)
            .bind("text", "key")
            .bindObject("angle", "angle", (a) => (a === 180 ? 180 : 0)), // 180 度時文字也要倒過來

          new go.Shape({
            name: "SHAPE",
            geometryString: valve, // 使用 valve 的 SVG path
            strokeWidth: 2,
            portId: "", // 可作為連接埠
            fromSpot: new go.Spot(1, 0.35), // 右邊 35% 高的位置
            toSpot: new go.Spot(0, 0.35), // 左邊 35% 高的位置
          })
            .bind("fill", "color")
            .bind("stroke", "color", (c) => go.Brush.darkenBy(c, 0.3)) // 邊框為顏色加深版
        )
    );
    diagram.nodeTemplateMap.add(
      "pump", // 定義一個名為 "pump" 的節點模板
      new go.Node("Vertical", {
        // 節點布局設為 "Vertical"（垂直）
        locationSpot: new go.Spot(0.5, 1, 0, -21), // 設定節點位置的基準點，置於底部中心並調整 Y 軸位置
        locationObjectName: "SHAPE", // 設定 "SHAPE" 作為定位的物件名稱
        selectionObjectName: "SHAPE", // 當選取此節點時，會以 "SHAPE" 作為選取的物件
        rotatable: true, // 設定節點為可旋轉
        movable: false, // 設定節點為不可移動
      })
        .bindTwoWay("angle") // 雙向綁定節點的角度，允許旋轉時更新角度
        .bindTwoWay("location", "pos", go.Point.parse, go.Point.stringify) // 雙向綁定節點的位置，使用 pos 屬性來存儲位置
        .add(
          // 新增文字區塊，顯示節點的標題或標籤
          new go.TextBlock({
            background: colors.black, // 設定文字背景顏色為黑色
            alignment: go.Spot.Center, // 文字居中對齊
            textAlign: "center", // 文字對齊方式為居中
            margin: 2, // 設定文字區塊的外邊距
            editable: true, // 使文字可編輯
          })
            .set(textDefaults) // 設定文字的預設樣式（來自 textDefaults）
            .bind("text", "key") // 綁定文字內容顯示 "key" 屬性的值
            .bindObject("angle", "angle", (a) => (a === 180 ? 180 : 0)), // 綁定角度，當角度為 180 度時，文字將反向顯示

          // 新增形狀（幫浦的圖形）
          new go.Shape({
            name: "SHAPE", // 設定形狀名稱為 "SHAPE"
            geometryString: pump, // 使用 "pump" 的 SVG 路徑來描述形狀
            width: 45, // 設定形狀的寬度為 45
            height: 40, // 設定形狀的高度為 40
            strokeWidth: 2, // 設定邊框的寬度為 2
            portId: "", // 設定連接埠 ID 為空，表示該形狀可以作為連接埠
            fromSpot: new go.Spot(1, 0.25), // 設定輸出端點（右側，位置為 1 的 25% 高度）
            toSpot: new go.Spot(0, 0.5), // 設定輸入端點（左側，位置為 0 的 50% 高度）
          })
            .bind("fill", "color") // 綁定形狀的填充顏色，來自 "color" 屬性
            .bind("stroke", "color", (c) => go.Brush.darkenBy(c, 0.3)) // 綁定邊框顏色，顏色會稍微加深
        )
    );

    // 這是 "monitor" 節點模板的一個組件，用來顯示數值表格中的一行項目
    const valuesTableItem = new go.Panel("TableRow").add(
      // 顯示標籤的文字區塊
      new go.TextBlock("").set(textDefaults).bind("text", "label"),
      new go.Panel("Spot", { column: 1 }).add(
        // 顯示數值的形狀（矩形）和文字區塊
        new go.Shape({
          stroke: colors.orange, // 邊框顏色為橙色
          fill: colors.black, // 填充顏色為黑色
          margin: 2, // 邊距為 2
          width: 40, // 寬度為 40
          height: 15, // 高度為 15
        }),
        // 顯示數值的文字區塊
        new go.TextBlock("", {}).set(textDefaults).bind("text", "value")
      ),
      // 顯示單位的文字區塊
      new go.TextBlock("", { column: 2, alignment: go.Spot.Left })
        .set(textDefaults)
        .bind("text", "unit")
    );

    // 定義數值表格的 Panel，並綁定到節點的 `values` 屬性
    const valuesTable = new go.Panel("Table", {
      itemTemplate: valuesTableItem, // 使用 `valuesTableItem` 作為項目模板
    }).bind("itemArray", "values"); // 綁定到節點的 `values` 屬性，用來顯示表格的數據

    // 這是 "monitor" 節點模板的一個組件，用來顯示動態數量的狀態區塊
    const statusPanelTemplate = new go.Panel("Spot").add(
      // 顯示狀態的圓形圖形
      new go.Shape({ width: 18, height: 18, fill: colors.white }).bind("fill"),
      // 顯示狀態的文字區塊
      new go.TextBlock().set(textDefaults).bind("text")
    );

    // 定義狀態區塊的 Panel，使用水平布局
    const statusPanel = new go.Panel("Horizontal", {
      width: 90, // 設定面板的寬度為 90
      height: 20, // 設定面板的高度為 20
      itemTemplate: statusPanelTemplate, // 使用 `statusPanelTemplate` 作為項目模板
    }).bind("itemArray", "statuses"); // 綁定到節點的 `statuses` 屬性，用來顯示狀態區塊

    // "monitor" 節點，用來顯示監控值，與泵或閥門相連
    diagram.nodeTemplateMap.add(
      "monitor",
      new go.Node("Auto", {
        movable: false, // 不允許移動
      })
        .bindTwoWay("location", "pos", go.Point.parse, go.Point.stringify) // 綁定位置
        .add(
          // 設定背景形狀
          new go.Shape({
            fill: colors.black, // 填充顏色為黑色
            stroke: colors.white, // 邊框顏色為白色
            strokeWidth: 2, // 邊框寬度為 2
          }),
          // 垂直布局面板，包含標題、通知和數值表格
          new go.Panel("Vertical", { margin: 4 }).add(
            // 標題
            new go.TextBlock("Title", {})
              .set(textDefaults)
              .bind("text", "title"), // 綁定節點的 `title` 屬性
            // 顯示通知區塊（使用之前定義的 `statusPanel`）
            statusPanel,
            // 顯示數值表格（使用之前定義的 `valuesTable`）
            valuesTable
          )
        )
    );

    // "sensor" 節點，與儲罐相連
    diagram.nodeTemplateMap.add(
      "sensor",
      new go.Node("Vertical", {
        movable: false, // 不允許移動
      })
        .bindTwoWay("location", "pos", go.Point.parse, go.Point.stringify) // 綁定位置
        .add(
          // 水平布局面板，包含形狀和文字
          new go.Panel("Horizontal", { margin: 4 }).add(
            new go.Shape({
              fill: colors.black, // 填充顏色為黑色
              stroke: colors.white, // 邊框顏色為白色
              strokeWidth: 2, // 邊框寬度為 2
              geometryString: sensor, // 設定形狀
              portId: "", // 設定端口 ID
              fromSpot: new go.Spot(0, 0.4, 0, 0), // 設定端口的位置
            }),
            // 顯示感測器的名稱
            new go.TextBlock({ margin: 2 })
              .set(textDefaults)
              .bind("text", "key") // 綁定節點的 `key` 屬性
          ),
          // 顯示數值和單位的區塊
          new go.Panel("Horizontal").add(
            new go.Panel("Spot", { column: 1 }).add(
              // 顯示數值的形狀和數字
              new go.Shape({
                stroke: colors.orange, // 邊框顏色為橙色
                fill: colors.black, // 填充顏色為黑色
                margin: 2, // 邊距為 2
                width: 40, // 寬度為 40
                height: 15, // 高度為 15
              }),
              // 顯示數值的文字區塊
              new go.TextBlock("", {}).set(textDefaults).bind("text", "value")
            ),
            // 顯示單位的文字區塊
            new go.TextBlock("", { column: 2, alignment: go.Spot.Left })
              .set(textDefaults)
              .bind("text", "unit")
          )
        )
    );

    diagram.linkTemplateMap.add(
      "",
      new go.Link({
        routing: go.Routing.AvoidsNodes, // 連線會避開節點
        corner: 12, // 拐角圓弧半徑
        layerName: "Background", // 放在背景圖層
        toShortLength: 3, // 連線末端縮短長度
      })
        // 綁定連線起點與終點的 segment 長度
        .bind("fromEndSegmentLength", "fromEndSeg")
        .bind("toEndSegmentLength", "toEndSeg")
        .add(
          // 底層粗線（黑色）
          new go.Shape({
            strokeWidth: 8,
            stroke: colors.black,
            isPanelMain: true, // 標記為主要路徑
          }),
          // 上層較細的綠色線（顯示實際顏色）
          new go.Shape({
            strokeWidth: 3.5,
            stroke: colors.green,
            isPanelMain: true,
          }).bind("stroke", "color"), // 綁定資料模型中的 color 屬性

          // 箭頭形狀，表示方向
          new go.Shape({
            stroke: colors.green,
            fill: colors.green,
            toArrow: "Triangle", // 使用三角形箭頭
          })
            .bind("stroke", "color") // 綁定箭頭的邊框顏色
            .bind("fill", "color"), // 綁定箭頭的填充顏色

          // 連線上的標籤（預設為隱藏）
          new go.Panel("Auto", { visible: false }) // Auto panel 會根據內容自動調整大小
            .bind("visible", "text", () => true) // 有 text 屬性時顯示
            .add(
              new go.Shape("RoundedRectangle", {
                strokeWidth: 1,
                fill: colors.gray,
              }),
              new go.TextBlock({ margin: new go.Margin(3, 1, 1, 1) }) // 文字區塊，有邊距
                .set(textDefaults)
                .bind("text") // 綁定 text 屬性
            )
        )
    );

    diagram.linkTemplateMap.add(
      "monitor",
      new go.Link({
        curve: go.Curve.Bezier, // 使用貝茲曲線（平滑彎曲）
        layerName: "Background", // 放在背景圖層
        fromSpot: go.Spot.Top, // 起點錨點設在上方
        fromEndSegmentLength: 30, // 起點段長度
      })
        .bind("fromSpot", "fs") // 綁定資料中的起點錨點位置
        .bind("toSpot", "ts") // 綁定資料中的終點錨點位置
        .add(
          new go.Shape({
            strokeWidth: 3, // 線條粗細
            stroke: colors.white, // 預設白色
            strokeDashArray: [3, 4], // 虛線樣式：畫 3px，空 4px
            isPanelMain: true, // 這是主要連線形狀
          }).bind("stroke", "color") // 可依據資料變色
        )
    );

    // end model assignment

    // Simulate data coming in to the monitor
    // This randomly assigns new data to the itemArrays in the monitor nodes
    // and the data in the sensor nodes
    setInterval(() => {
      // 模擬感測器節點的數值更新
      diagram.commit(() => {
        // 根據 key 找到對應的感測器節點（例如 S1、S2）
        const sensorKeys = ["S1", "S2"].map((k) => diagram.findNodeForKey(k));

        // 對每一個感測器節點進行數值更新
        for (const n of sensorKeys) {
          const d = n?.data; // 取得節點的資料物件（NodeData）

          // 使用隨機數字模擬資料變動後，更新節點的 value 欄位
          diagram.model.set(
            d,
            "value",
            roundAndFloor(parseFloat(d.value) + random(-0.5, 0.55), 1)
          );
        }
      }, null); // 第二個參數為 null，表示這次變更不納入 Undo 管理

      // 使用當前時間的毫秒數判斷是否跳過後續更新（約有一半的機率不執行以下邏輯）
      if (+new Date() % 2 === 0) return; // 使下面的更新邏輯每兩次只執行一次
      diagram.commit(() => {
        // 根據節點 key 找出對應的節點物件
        const controlNodes = ["cTCV102", "cFCV101", "cFM102", "cFM103"].map(
          (k) => diagram.findNodeForKey(k) // 依據節點 key 取得節點
        );

        // 遍歷每個節點並更新其 values 中的三個數值
        for (const n of controlNodes) {
          const vals = n?.data.values; // 取得節點的 values 資料陣列

          // 模擬數值變動：對每個數值加上一定範圍內的隨機值，並四捨五入到小數點一位
          diagram.model.set(
            vals[0],
            "value",
            roundAndFloor(parseFloat(vals[0].value) + random(-0.5, 0.55), 1)
          );
          diagram.model.set(
            vals[1],
            "value",
            roundAndFloor(parseFloat(vals[1].value) + random(-0.3, 0.35), 1)
          );
          diagram.model.set(
            vals[2],
            "value",
            roundAndFloor(parseFloat(vals[2].value) + random(-0.2, 0.2), 1)
          );
        }
      }, null); // null 表示不使用 Undo 管理器，這樣更新不會進入還原堆疊

      // 偶爾（大約每 15 次才會執行一次）隨機變更 monitor 的顏色區塊
      if (+new Date() % 15 === 0) return;

      // 使用 GoJS 的 commit 方法來執行一批資料更新操作，null 表示跳過 Undo 記錄
      diagram.commit(() => {
        // 根據節點 key 找出控制類型的節點 (例如閥門、流量計等)
        const controlNodes = ["cTCV102", "cFCV101", "cFM102", "cFM103"].map(
          (k) => diagram.findNodeForKey(k) // 根據 key 從圖中取得對應節點
        );

        // 對每個節點進行狀態顏色的隨機更新
        for (const n of controlNodes) {
          const vals = n?.data.statuses; // 取得節點的 statuses 陣列

          // 隨機決定第一個狀態的填色為綠色或白色
          diagram.model.set(
            vals[0],
            "fill",
            Math.random() > 0.5 ? colors.green : colors.white
          );

          // 隨機決定第二個狀態的填色為黃色或白色
          diagram.model.set(
            vals[1],
            "fill",
            Math.random() > 0.5 ? colors.yellow : colors.white
          );
        }
      }, null); // null 表示這次更新不加入 Undo 系統，不可還原
    }, 550);

    return diagram;
  };

  function roundAndFloor(num: number, decimalPlaces: number = 0): number {
    // 通過將小數點右移，四捨五入，然後再將小數點左移
    const rounded = Math.round(Number(num + "e" + decimalPlaces));

    // 返回四捨五入後的數字，確保它不小於 0
    return Math.max(Number(rounded + "e" + -decimalPlaces), 0);
  }

  function random(min: number, max: number): number {
    // 生成一個介於 min 和 max 之間的隨機數字（min 包含，max 不包含）
    return Math.random() * (max - min) + min;
  }
  return (
    <div>
      <ReactDiagram
        initDiagram={initDiagram}
        divClassName="diagram-container"
        nodeDataArray={[
          // LABELS
          {
            key: "1",
            category: "label",
            text: "Steam Condensate\nHeader",
            color: colors.red,
            direction: "left",
            pos: "0 -20",
          },
          {
            key: "2",
            category: "label",
            text: "From LP Steam\nHeader",
            color: colors.red,
            pos: "0 160",
          },
          {
            key: "3",
            category: "label",
            text: "Soft Water",
            color: colors.green,
            pos: "80 240",
          },
          {
            key: "4",
            category: "label",
            text: "From ME-01A",
            color: colors.yellow,
            pos: "0 299.5",
          },
          {
            key: "5",
            category: "label",
            text: "To MRF-02",
            color: colors.yellow,
            direction: "left",
            pos: "0 360.5",
          },
          {
            key: "6",
            category: "label",
            text: "CPO+PFAO\nFrom Storage Tank",
            color: colors.yellow,
            pos: "0 423",
          },
          {
            key: "7",
            category: "label",
            text: "To MCOT",
            color: colors.yellow,
            direction: "left",
            pos: "0 541",
          },
          {
            key: "8",
            category: "label",
            text: "To MPHE-02",
            color: colors.yellow,
            direction: "left",
            pos: "0 615",
          },
          // TANKS
          {
            key: "MHWT",
            tankType: tank3,
            color: colors.black,
            pos: "287 19",
            ports: [
              { p: "BL1", a: new go.Spot(0, 1, 0, -50) },
              { p: "BL2", a: new go.Spot(0, 1, 0, -30) },
              { p: "BL3", a: new go.Spot(0, 1, 0, -10) },
              { p: "BR", fs: go.Spot.RightSide, a: new go.Spot(1, 1, 0, -30) },
              {
                p: "SensorR",
                type: "sensor",
                ts: go.Spot.RightSide,
                a: new go.Spot(1, 0.5, 0, 0),
              },
            ],
          },
          {
            key: "MSF",
            color: colors.black,
            pos: "244 418",
            ports: [
              { p: "TL", a: new go.Spot(0, 0, 0, 30) },
              { p: "BR", a: new go.Spot(1, 1, 0, -50), fs: go.Spot.Right },
              { p: "B", a: new go.Spot(0.5, 1, 0, 0) },
            ],
          },
          {
            key: "ME-01",
            color: colors.black,
            tankType: tank2,
            pos: "297 261",
            width: 70,
            height: 120,
            ports: [
              { p: "TL", a: new go.Spot(0, 0, 0, 30) },
              { p: "BL", a: new go.Spot(0, 1, 0, -30) },
              { p: "TR", fs: go.Spot.RightSide, a: new go.Spot(1, 0, 0, 30) },
              { p: "BR", ts: go.Spot.RightSide, a: new go.Spot(1, 1, 0, -30) },
            ],
          },
          {
            key: "MRM",
            color: colors.black,
            pos: "529 370",
            width: 60,
            height: 80,
            ports: [
              { p: "T1", a: new go.Spot(0, 0, 10, 0), ts: go.Spot.Top },
              { p: "T2", a: new go.Spot(0, 0, 30, 0), ts: go.Spot.Top },
              { p: "T3", a: new go.Spot(0, 0, 50, 0), ts: go.Spot.Top },
              { p: "B", a: new go.Spot(0.5, 1, 0, 0), fs: go.Spot.Bottom },
            ],
          },
          {
            key: "MZM",
            color: colors.black,
            pos: "680 440",
            width: 50,
            height: 80,
            ports: [
              { p: "T", a: new go.Spot(0.5, 0, 0, 0), fs: go.Spot.Top },
              { p: "B", a: new go.Spot(0.5, 1, 0, 0), ts: go.Spot.Bottom },
            ],
          },
          {
            key: "MPAT",
            color: colors.black,
            pos: "865 30",
            ports: [{ p: "L", a: new go.Spot(0, 0.5, 0, 0), fs: go.Spot.Left }],
          },
          {
            key: "MPHE-01",
            color: colors.black,
            tankType: tank2,
            pos: "860 282",
            width: 70,
            height: 120,
            ports: [
              { p: "TL", a: new go.Spot(0, 0, 0, 30), fs: go.Spot.LeftSide },
              { p: "BL", a: new go.Spot(0, 1, 0, -30) },
              {
                p: "TR",
                fs: go.Spot.RightSide,
                a: new go.Spot(1, 0, 0, 30),
                ts: go.Spot.RightSide,
              },
              { p: "BR", fs: go.Spot.RightSide, a: new go.Spot(1, 1, 0, -30) },
            ],
          },
          {
            key: "MHT",
            color: colors.black,
            pos: "769 440",
            ports: [
              { p: "T", a: new go.Spot(0.5, 0, 0, 0), fs: go.Spot.Top },
              { p: "B", a: new go.Spot(0.5, 1, 0, 0), fs: go.Spot.Bottom },
              {
                p: "SensorB",
                a: new go.Spot(1, 0.7, 0, 0),
                type: "sensor",
                ts: go.Spot.RightSide,
              },
            ],
          },
          // VALVES
          {
            key: "TCV102",
            category: "valve",
            color: colors.red,
            pos: "197 130",
          },
          {
            key: "FCV101",
            category: "valve",
            color: colors.red,
            pos: "477 585",
          },
          {
            key: "LCV101",
            category: "valve",
            color: colors.red,
            pos: "620 615.88",
            angle: 180,
          },
          {
            key: "FM102",
            category: "valve",
            color: colors.white,
            pos: "508 167",
          },
          {
            key: "FM103",
            category: "valve",
            color: colors.white,
            pos: "706 184",
            angle: 180,
          },
          {
            key: "FIC101",
            category: "valve",
            color: colors.white,
            pos: "396 585",
          },
          { key: "P03", category: "pump", color: colors.pink, pos: "429 178" },
          {
            key: "P04",
            category: "pump",
            color: colors.pink,
            pos: "800 173.5",
            angle: 180,
          },
          {
            key: "P102",
            category: "pump",
            color: colors.pink,
            pos: "720 605.3",
            angle: 180,
          },
          // MONITOR PANELS
          {
            key: "cTCV102",
            title: "Monitor TCV102",
            category: "monitor",
            pos: "32 35",
            values: [
              { label: "SV", unit: "°C", value: "12.0" },
              { label: "PV", unit: "°C", value: "12.0" },
              { label: "OP", unit: "%", value: "25.0" },
            ],
            statuses: [
              { fill: colors.green },
              { fill: colors.green },
              { fill: colors.green },
            ],
          },
          {
            key: "cFCV101",
            title: "Monitor FCV101",
            category: "monitor",
            pos: "360 413",
            values: [
              { label: "SV", unit: "KG/hr", value: "0.0" },
              { label: "PV", unit: "KG/hr", value: "0.0" },
              { label: "OP", unit: "%", value: "25.0" },
            ],
            statuses: [
              { fill: colors.green },
              { fill: colors.white },
              { fill: colors.white },
            ],
          },
          {
            key: "cFM102",
            title: "Monitor FM102",
            category: "monitor",
            pos: "465 18",
            values: [
              { label: "SV", unit: "KG/hr", value: "0.0" },
              { label: "PV", unit: "KG/hr", value: "0.0" },
              { label: "OP", unit: "%", value: "25.0" },
            ],
            statuses: [{ fill: colors.white }, { fill: colors.white }],
          },
          {
            key: "cFM103",
            title: "Monitor FM103",
            category: "monitor",
            pos: "594 28",
            values: [
              { label: "SV", unit: "KG/hr", value: "0.0" },
              { label: "PV", unit: "KG/hr", value: "0.0" },
              { label: "OP", unit: "%", value: "25.0" },
            ],
            statuses: [
              { fill: colors.green },
              { fill: colors.white },
              { fill: colors.white },
            ],
          },
          // SENSORS:
          {
            key: "S1",
            category: "sensor",
            value: "12.0",
            pos: "385 68",
            unit: "°C",
          },
          {
            key: "S2",
            category: "sensor",
            value: "12.0",
            pos: "870 515",
            unit: "°C",
          },
        ]}
        linkDataArray={[
          {
            from: "MHWT",
            to: "1",
            text: "LPS",
            color: colors.red,
            fromPort: "BL1",
          },
          {
            from: "MPHE-01",
            to: "1",
            text: "SCH",
            color: colors.red,
            fromPort: "BR",
            fromEndSeg: 25,
          },
          { from: "2", to: "TCV102", text: "SC", color: colors.red },
          { from: "TCV102", to: "MHWT", color: colors.red, toPort: "BL2" },
          { from: "2", to: "MPHE-01", color: colors.red, toPort: "TR" },
          { from: "3", to: "MHWT", toPort: "BL3" },

          {
            from: "4",
            to: "ME-01",
            text: "DO",
            toPort: "TL",
            color: colors.yellow,
          },
          {
            from: "5",
            to: "ME-01",
            text: "DO",
            toPort: "BL",
            color: colors.yellow,
          },
          {
            from: "6",
            to: "MSF",
            text: "CPO",
            color: colors.yellow,
            toPort: "TL",
          },
          {
            from: "MSF",
            to: "7",
            text: "CPO",
            color: colors.yellow,
            fromPort: "B",
          },
          { from: "LCV101", to: "8", text: "CPO", color: colors.yellow },

          { from: "MSF", to: "FIC101", fromPort: "BR" },
          { from: "FIC101", to: "FCV101" },
          { from: "FCV101", to: "ME-01", toPort: "BR" },
          {
            from: "ME-01",
            to: "MRM",
            color: colors.green,
            fromPort: "TR",
            toPort: "T2",
          },

          { from: "MHWT", to: "P03", color: colors.green, fromPort: "BR" },
          { from: "P03", to: "FM102", color: colors.green },
          { from: "FM102", to: "MRM", color: colors.green, toPort: "T1" },
          { from: "MPAT", to: "P04", color: colors.yellow, fromPort: "L" },
          { from: "P04", to: "FM103", color: colors.yellow },
          { from: "FM103", to: "MRM", color: colors.yellow, toPort: "T3" },
          { from: "MRM", to: "MZM", fromPort: "B", toPort: "B", toEndSeg: 15 },
          { from: "MZM", to: "MPHE-01", fromPort: "T", toPort: "BL" },
          { from: "MPHE-01", to: "MHT", fromPort: "TL", toPort: "T" },
          { from: "P102", to: "LCV101" },
          { from: "MHT", to: "P102", fromPort: "B" },

          {
            category: "monitor",
            from: "TCV102",
            to: "cTCV102",
            ts: go.Spot.Right,
          },
          {
            category: "monitor",
            from: "FCV101",
            to: "cFCV101",
            ts: go.Spot.Right,
          },
          {
            category: "monitor",
            from: "FCV101",
            to: "FIC101",
            ts: go.Spot.Top,
          },
          {
            category: "monitor",
            from: "FM102",
            to: "cFM102",
            ts: go.Spot.Bottom,
          },
          {
            category: "monitor",
            from: "FM103",
            to: "cFM103",
            fs: go.Spot.Bottom,
            ts: go.Spot.Bottom,
          },
          { category: "sensor", from: "S1", to: "MHWT", toPort: "SensorR" },
          { category: "sensor", from: "S2", to: "MHT", toPort: "SensorB" },
        ]}
        onModelChange={(e) => {
          console.log(e);
        }}
      />
    </div>
  );
}
export default B;
