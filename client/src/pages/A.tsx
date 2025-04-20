import "./styles/A.css";

import * as go from "gojs";
import { ReactDiagram } from "gojs-react";

function initDiagram() {
  const diagram = new go.Diagram({
    // 啟用撤銷管理器
    "undoManager.isEnabled": true,

    // 設定點擊創建工具的原型節點資料
    "clickCreatingTool.archetypeNodeData": {
      text: "new node", // 節點的文字內容
      color: "lightblue", // 節點的顏色
    },

    // 設定圖表模型為 GraphLinksModel，並指定連結的鍵值屬性
    model: new go.GraphLinksModel({
      linkKeyProperty: "key", // 連結的鍵值屬性名稱
    }),
  });

  // 設定節點模板
  diagram.nodeTemplate = new go.Node("Auto")
    // 綁定位置屬性，實現位置的雙向數據綁定
    .bindTwoWay("location", "loc", go.Point.parse, go.Point.stringify)
    .add(
      // 設定節點的形狀為圓角矩形
      new go.Shape("RoundedRectangle", {
        name: "SHAPE", // 圖形的名稱
        fill: "white", // 填充顏色為白色
        strokeWidth: 0, // 邊框寬度為 0
      }).bind("fill", "color"), // 綁定顏色屬性

      // 設定文本框，並允許編輯
      new go.TextBlock({ margin: 8, editable: true }).bindTwoWay("text") // 綁定文本屬性，實現文本的雙向數據綁定
    );

  // 定義滑塊的行為邏輯
  function sliderActions(alwaysVisible: any) {
    return {
      // 設定該操作為可操作
      isActionable: true,

      // 當按下滑塊時的操作
      actionDown: (e: any, obj: any) => {
        obj._dragging = true; // 標記為正在拖動
        obj._original = obj.part.data.value; // 保存原始值
      },

      // 當滑塊移動時的操作
      actionMove: (e: any, obj: any) => {
        if (!obj._dragging) return; // 如果沒有拖動，就跳過
        const scale = obj.part.findObject("SCALE"); // 查找刻度對象
        const pt = e.diagram.lastInput.documentPoint; // 獲取當前鼠標位置
        const loc = scale.getLocalPoint(pt); // 將鼠標位置轉換為本地坐標
        const val = Math.round(scale.graduatedValueForPoint(loc)); // 根據位置計算對應的值
        // 提交修改，更新模型的值
        e.diagram.model.commit((m: any) => {
          m.set(obj.part.data, "value", val);
        }, null);
      },

      // 當滑塊釋放時的操作
      actionUp: (e: any, obj: any) => {
        if (!obj._dragging) return; // 如果沒有拖動，就跳過
        obj._dragging = false; // 標記拖動結束
        const scale = obj.part.findObject("SCALE"); // 查找刻度對象
        const pt = e.diagram.lastInput.documentPoint; // 獲取當前鼠標位置
        const loc = scale.getLocalPoint(pt); // 將鼠標位置轉換為本地坐標
        const val = Math.round(scale.graduatedValueForPoint(loc)); // 根據位置計算對應的值

        // 提交修改，重設為原始值
        e.diagram.model.commit((m: any) => {
          m.set(obj.part.data, "value", obj._original);
        }, null);

        // 提交修改，更新為新值
        e.diagram.model.commit((m: any) => {
          m.set(obj.part.data, "value", val);
        }, "dragged slider");
      },

      // 當操作被取消時的處理
      actionCancel: (e: any, obj: any) => {
        obj._dragging = false; // 標記為停止拖動
        // 提交修改，重設為原始值
        e.diagram.model.commit((m: any) => {
          m.set(obj.part.data, "value", obj._original);
        }, null);
      },
    };
  }

  // 定義通用節點樣式
  function commonNodeStyle() {
    return {
      // 設定節點的定位點為中心
      locationSpot: go.Spot.Center,

      // 設定連接的起點為右下角的邊緣
      fromSpot: go.Spot.BottomRightSides,

      // 設定連接的終點為左上角的邊緣
      toSpot: go.Spot.TopLeftSides,

      // 設定節點是否可以移動
      movable: false,
    };
  }

  // 應用通用節點樣式綁定
  function applyCommonNodeStyleBindings(object: go.Node) {
    // 將節點的位置進行雙向綁定
    object.bindTwoWay("location", "loc", go.Point.parse, go.Point.stringify);
    return object;
  }

  // 應用通用刻度樣式綁定
  function applyCommonScaleBindings(object: go.Panel) {
    // 將刻度最小值、最大值、刻度單位和可編輯性進行綁定
    object
      .bind("graduatedMin", "min") // 綁定最小值
      .bind("graduatedMax", "max") // 綁定最大值
      .bind("graduatedTickUnit", "unit") // 綁定刻度單位
      .bind("isEnabled", "editable"); // 綁定可編輯性
    return object;
  }

  // 定義通用的滑塊形狀，根據方向（垂直或水平）來設置
  function commonSlider(vert: boolean) {
    return new go.Shape("RoundedRectangle", {
      name: "SLIDER", // 設定滑塊的名稱
      fill: "white", // 設定滑塊的填充顏色為白色
      // 根據方向設置滑塊的大小，垂直方向或水平方向
      desiredSize: vert ? new go.Size(20, 6) : new go.Size(6, 20),
      // 根據方向設置對齊方式
      alignment: vert ? go.Spot.Top : go.Spot.Right,
      // 應用滑塊的行為邏輯
      ...sliderActions(false),
    });
  }

  // 將節點模板 "Horizontal" 添加到 nodeTemplateMap 中
  diagram.nodeTemplateMap.add(
    "Horizontal",
    new go.Node("Auto", commonNodeStyle()) // 創建自動佈局的節點，並應用通用節點樣式
      .apply(applyCommonNodeStyleBindings) // 應用通用節點樣式綁定
      .add(
        // 設定節點的形狀，填充顏色為淺灰色，邊框為灰色
        new go.Shape({ fill: "lightgray", stroke: "gray" }),

        // 創建表格面板，並設置邊距和拉伸
        new go.Panel("Table", { margin: 1, stretch: go.Stretch.Fill }).add(
          // header 部分顯示節點的文字信息
          new go.TextBlock({ row: 0, font: "bold 10pt sans-serif" }).bind(
            "text" // 綁定文本內容
          ),

          // 設定刻度面板
          new go.Panel("Spot", { row: 1 }).add(
            applyCommonScaleBindings(
              // 應用通用刻度樣式綁定
              new go.Panel("Graduated", {
                name: "SCALE",
                margin: new go.Margin(0, 6),
                graduatedTickUnit: 10, // 設定刻度單位
                isEnabled: false, // 禁用刻度
              }).add(
                // 畫出水平刻度線
                new go.Shape({
                  geometryString: "M0 0 H200",
                  height: 0,
                  name: "PATH",
                }),
                // 畫出垂直的刻度線
                new go.Shape({
                  geometryString: "M0 0 V16",
                  alignmentFocus: go.Spot.Center,
                  stroke: "gray",
                }),
                // 畫出間隔的刻度線
                new go.Shape({
                  geometryString: "M0 0 V20",
                  alignmentFocus: go.Spot.Center,
                  interval: 5,
                  strokeWidth: 1.5,
                })
              )
            ),

            // 設定指示條（紅色的 BAR）
            new go.Panel("Spot", {
              alignment: go.Spot.Left,
              alignmentFocus: go.Spot.Left,
              alignmentFocusName: "BAR",
            })
              .add(
                // 設定 BAR 的外觀和行為
                new go.Shape({
                  name: "BAR",
                  fill: "red",
                  strokeWidth: 0,
                  height: 8,
                })
                  .bind("fill", "color") // 綁定 BAR 的顏色
                  .bind("desiredSize", "value", (v, shp) => {
                    // 根據值計算 BAR 的寬度
                    const scale = shp.part.findObject("SCALE");
                    const path = scale.findMainElement();
                    const len =
                      ((v - scale.graduatedMin) /
                        (scale.graduatedMax - scale.graduatedMin)) *
                      path.geometry.bounds.width;
                    return new go.Size(len, 10); // 返回計算後的大小
                  })
              )
              .add(commonSlider(false)) // 添加滑塊（水平）
          ),

          // state 信息顯示最小值
          new go.TextBlock("0", { row: 2, alignment: go.Spot.Left }).bind(
            "text",
            "min" // 綁定顯示最小值
          ),
          // state 信息顯示最大值
          new go.TextBlock("100", { row: 2, alignment: go.Spot.Right }).bind(
            "text",
            "max" // 綁定顯示最大值
          ),
          // 編輯文本框，顯示當前值，並支持編輯
          new go.TextBlock({
            row: 2,
            background: "white",
            font: "bold 10pt sans-serif",
            isMultiline: false,
            editable: true, // 設定為可編輯
          }).bindTwoWay(
            "text", // 綁定文本內容
            "value", // 綁定節點的值
            (v) => v.toString(), // 將值轉為字符串顯示
            (s) => parseFloat(s) // 將字符串轉為數字
          )
        )
      )
  );

  // 將節點模板 "Vertical" 添加到 nodeTemplateMap 中
  diagram.nodeTemplateMap.add(
    "Vertical",
    new go.Node("Auto", commonNodeStyle()) // 創建自動佈局的節點，並應用通用節點樣式
      .apply(applyCommonNodeStyleBindings) // 應用通用節點樣式綁定
      .add(
        // 設定節點的形狀，填充顏色為淺灰色，邊框為灰色
        new go.Shape({ fill: "lightgray", stroke: "gray" }),

        // 創建表格面板，並設置邊距和拉伸
        new go.Panel("Table", {
          margin: 1,
          stretch: go.Stretch.Fill, // 設置拉伸方式為填滿
        }).add(
          // header 部分顯示節點的文字信息
          new go.TextBlock({
            row: 0,
            font: "bold 10pt sans-serif",
          }).bind("text"), // 綁定文本內容

          // 設定刻度面板
          new go.Panel("Spot", { row: 1 }).add(
            applyCommonScaleBindings(
              // 應用通用刻度樣式綁定
              new go.Panel("Graduated", {
                name: "SCALE",
                margin: new go.Margin(6, 0),
                graduatedTickUnit: 10, // 設定刻度單位
                isEnabled: false, // 禁用刻度
              })
            ).add(
              // 畫出垂直刻度線
              new go.Shape({
                geometryString: "M0 0 V-200",
                width: 0,
                name: "PATH",
              }),
              // 畫出刻度線
              new go.Shape({
                geometryString: "M0 0 V16",
                alignmentFocus: go.Spot.Center,
                stroke: "gray",
              }),
              // 畫出間隔的刻度線
              new go.Shape({
                geometryString: "M0 0 V20",
                alignmentFocus: go.Spot.Center,
                interval: 5,
                strokeWidth: 1.5,
              })
            ),

            // 設定指示條（紅色的 BAR）
            new go.Panel("Spot", {
              alignment: go.Spot.Bottom,
              alignmentFocus: go.Spot.Bottom,
              alignmentFocusName: "BAR",
            }).add(
              // 設定 BAR 的外觀和行為
              new go.Shape({
                name: "BAR",
                fill: "red",
                strokeWidth: 0,
                height: 8,
              })
                .bind("fill", "color") // 綁定 BAR 的顏色
                .bind("desiredSize", "value", (v, shp) => {
                  // 根據值計算 BAR 的高度
                  const scale = shp.part.findObject("SCALE");
                  const path = scale.findMainElement();
                  const len =
                    ((v - scale.graduatedMin) /
                      (scale.graduatedMax - scale.graduatedMin)) *
                    path.geometry.bounds.height;
                  return new go.Size(10, len); // 返回計算後的大小
                }),
              commonSlider(true) // 添加滑塊（垂直）
            )
          ),

          // state 信息顯示最小值
          new go.TextBlock("0", { row: 2, alignment: go.Spot.Left }).bind(
            "text",
            "min" // 綁定顯示最小值
          ),
          // state 信息顯示最大值
          new go.TextBlock("100", { row: 2, alignment: go.Spot.Right }).bind(
            "text",
            "max" // 綁定顯示最大值
          ),
          // 編輯文本框，顯示當前值，並支持編輯
          new go.TextBlock({
            row: 2,
            background: "white",
            font: "bold 10pt sans-serif",
            isMultiline: false,
            editable: true, // 設定為可編輯
          }).bindTwoWay(
            "text", // 綁定文本內容
            "value", // 綁定節點的值
            (v) => v.toString(), // 將值轉為字符串顯示
            (s) => parseFloat(s) // 將字符串轉為數字
          )
        )
      )
  );

  // 添加 "NeedleMeter" 節點模板到 nodeTemplateMap 中
  diagram.nodeTemplateMap.add(
    "NeedleMeter",
    new go.Node("Auto", commonNodeStyle()) // 創建自動佈局的節點，並應用通用節點樣式
      .apply(applyCommonNodeStyleBindings) // 應用通用節點樣式綁定
      .add(
        // 設定節點的背景形狀
        new go.Shape({ fill: "darkslategray" }),

        // 創建 Spot 面板，用於放置刻度和指針
        new go.Panel("Spot").add(
          // 創建 Position 面板，用於放置刻度
          new go.Panel("Position").add(
            // 創建 Graduated 面板，用於顯示刻度
            new go.Panel("Graduated", { name: "SCALE", margin: 10 })
              .apply(applyCommonScaleBindings) // 應用通用刻度樣式綁定
              .add(
                // 畫出刻度的弧線
                new go.Shape({
                  name: "PATH",
                  geometryString: "M0 0 A120 120 0 0 1 200 0", // 定義弧線的幾何形狀
                  stroke: "white", // 設定弧線顏色為白色
                }),
                // 畫出刻度線
                new go.Shape({
                  geometryString: "M0 0 V10", // 定義刻度線的幾何形狀
                  stroke: "white", // 設定刻度線顏色為白色
                }),
                // 添加刻度上的文字
                new go.TextBlock({
                  segmentOffset: new go.Point(0, 12), // 設定文字的偏移量
                  segmentOrientation: go.Orientation.Along, // 設定文字沿著弧線排列
                  stroke: "white", // 設定文字顏色為白色
                })
              ),
            // 添加指針
            new go.Shape({
              stroke: "red", // 設定指針顏色為紅色
              strokeWidth: 4, // 設定指針寬度
              isGeometryPositioned: true, // 啟用幾何定位
              ...sliderActions(true), // 應用滑塊行為邏輯
            }).bind("geometry", "value", (v, shp) => {
              // 根據值計算指針的幾何形狀
              const scale = shp.part.findObject("SCALE"); // 獲取刻度對象
              const pt = scale.graduatedPointForValue(v); // 根據值計算指針的終點
              const geo = new go.Geometry(go.GeometryType.Line); // 創建線段幾何
              geo.startX = 100 + scale.margin.left; // 設定指針起點 X 坐標
              geo.startY = 90 + scale.margin.top; // 設定指針起點 Y 坐標
              geo.endX = pt.x + scale.margin.left; // 設定指針終點 X 坐標
              geo.endY = pt.y + scale.margin.top; // 設定指針終點 Y 坐標
              return geo; // 返回計算後的幾何形狀
            })
          ),
          // 添加顯示當前值的文字
          new go.TextBlock({
            alignment: new go.Spot(0.5, 0.5, 0, 20), // 設定文字的對齊方式
            stroke: "white", // 設定文字顏色為白色
            font: "bold 10pt sans-serif", // 設定文字字體
          })
            .bind("text") // 綁定文字內容
            .bind("stroke", "color"), // 綁定文字顏色

          // 添加可編輯的文字框，用於顯示和編輯當前值
          new go.TextBlock({
            alignment: go.Spot.Top, // 設定文字框的對齊方式
            margin: new go.Margin(4, 0, 0, 0), // 設定文字框的邊距
            stroke: "white", // 設定文字框文字顏色為白色
            font: "bold italic 13pt sans-serif", // 設定文字框字體
            isMultiline: false, // 禁用多行輸入
            editable: true, // 設定文字框為可編輯
          })
            .bindTwoWay(
              "text", // 雙向綁定文字內容
              "value", // 綁定節點的值
              (v) => v.toString(), // 將值轉為字符串顯示
              (s) => parseFloat(s) // 將字符串轉為數字
            )
            .bind("stroke", "color") // 綁定文字框文字顏色
        )
      )
  );

  // 添加 "CircularMeter" 節點模板到 nodeTemplateMap 中
  diagram.nodeTemplateMap.add(
    "CircularMeter",
    new go.Node("Table", commonNodeStyle()) // 創建表格佈局的節點，並應用通用節點樣式
      .apply(applyCommonNodeStyleBindings) // 應用通用節點樣式綁定
      .add(
        // 添加自動佈局面板
        new go.Panel("Auto", { row: 0 }).add(
          // 添加圓形背景
          new go.Shape("Circle", {
            stroke: "orange", // 邊框顏色為橙色
            strokeWidth: 5, // 邊框寬度為 5
            spot1: go.Spot.TopLeft, // 左上角對齊
            spot2: go.Spot.BottomRight, // 右下角對齊
          }).bind("stroke", "color"), // 綁定顏色屬性

          // 添加 Spot 面板，用於放置刻度和指針
          new go.Panel("Spot").add(
            // 添加刻度面板，並應用通用刻度樣式綁定
            applyCommonScaleBindings(
              new go.Panel("Graduated", {
                name: "SCALE", // 設定名稱為 SCALE
                margin: 14, // 設定邊距
                graduatedTickUnit: 2.5, // 設定刻度單位
                stretch: go.Stretch.None, // 不拉伸
              })
            ).add(
              // 添加刻度弧線
              new go.Shape({
                name: "PATH", // 設定名稱為 PATH
                geometryString: "M-70.7107 70.7107 B135 270 0 0 100 100 M0 100", // 定義弧線幾何形狀
                stroke: "white", // 設定弧線顏色為白色
                strokeWidth: 4, // 設定弧線寬度
              }),
              // 添加刻度線
              new go.Shape({
                geometryString: "M0 0 V10", // 定義刻度線幾何形狀
                stroke: "white", // 設定刻度線顏色為白色
                strokeWidth: 1, // 設定刻度線寬度
              }),
              // 添加間隔為 2 的刻度線
              new go.Shape({
                geometryString: "M0 0 V12", // 定義刻度線幾何形狀
                stroke: "white", // 設定刻度線顏色為白色
                strokeWidth: 2, // 設定刻度線寬度
                interval: 2, // 設定間隔
              }),
              // 添加間隔為 4 的刻度線
              new go.Shape({
                geometryString: "M0 0 V15", // 定義刻度線幾何形狀
                stroke: "white", // 設定刻度線顏色為白色
                strokeWidth: 3, // 設定刻度線寬度
                interval: 4, // 設定間隔
              }),
              // 添加刻度上的文字
              new go.TextBlock({
                interval: 4, // 設定文字間隔
                alignmentFocus: go.Spot.Center, // 對齊中心
                font: "bold italic 14pt sans-serif", // 設定字體樣式
                stroke: "white", // 設定文字顏色為白色
                segmentOffset: new go.Point(0, 30), // 設定文字偏移量
              })
            ),
            // 添加顯示當前值的文字框
            new go.TextBlock({
              alignment: new go.Spot(0.5, 0.9), // 設定對齊方式
              stroke: "white", // 設定文字顏色為白色
              font: "bold italic 14pt sans-serif", // 設定字體樣式
              ...sliderActions(true),
            }).bind("angle", "value", (v, shp) => {
              const scale = shp.part.findObject("SCALE");
              const p = scale.graduatedPointForValue(v);
              const path = shp.part.findObject("PATH");
              const c = path.actualBounds.center;
              return c.directionPoint(p);
            }),
            new go.Shape("Circle", { width: 2, height: 2, fill: "#444" })
          )
        ),
        new go.TextBlock({
          row: 1,
          font: "bold 11pt sans-serif",
        }).bind("text")
      )
  );

  // 添加 "BarMeter" 節點模板到 nodeTemplateMap 中
  diagram.nodeTemplateMap.add(
    "BarMeter",
    new go.Node("Table", {
      ...commonNodeStyle(), // 應用通用節點樣式
      scale: 0.8, // 設定縮放比例
    })
      .apply(applyCommonNodeStyleBindings) // 應用通用節點樣式綁定
      .add(
        // 添加自動佈局面板
        new go.Panel("Auto", { row: 0 }).add(
          // 添加圓形背景
          new go.Shape("Circle", {
            stroke: "orange", // 邊框顏色為橙色
            strokeWidth: 5, // 邊框寬度為 5
            spot1: go.Spot.TopLeft, // 左上角對齊
            spot2: go.Spot.BottomRight, // 右下角對齊
          }).bind("stroke", "color"), // 綁定顏色屬性

          // 添加 Spot 面板，用於放置刻度和指針
          new go.Panel("Spot").add(
            // 添加刻度面板，並應用通用刻度樣式綁定
            new go.Panel("Graduated", {
              name: "SCALE", // 設定名稱為 SCALE
              margin: 14, // 設定邊距
              graduatedTickUnit: 2.5, // 設定刻度單位
              stretch: go.Stretch.None, // 不拉伸
            })
              .apply(applyCommonScaleBindings) // 應用通用刻度樣式綁定
              .add(
                // 添加刻度弧線
                new go.Shape({
                  name: "PATH", // 設定名稱為 PATH
                  geometryString:
                    "M-70.7107 70.7107 B135 270 0 0 100 100 M0 100", // 定義弧線幾何形狀
                  stroke: "white", // 設定弧線顏色為白色
                  strokeWidth: 4, // 設定弧線寬度
                }),
                // 添加刻度線
                new go.Shape({
                  geometryString: "M0 0 V10", // 定義刻度線幾何形狀
                  stroke: "white", // 設定刻度線顏色為白色
                  strokeWidth: 1, // 設定刻度線寬度
                }),
                // 添加間隔為 2 的刻度線
                new go.Shape({
                  geometryString: "M0 0 V12", // 定義刻度線幾何形狀
                  stroke: "white", // 設定刻度線顏色為白色
                  strokeWidth: 2, // 設定刻度線寬度
                  interval: 2, // 設定間隔
                }),
                // 添加間隔為 4 的刻度線
                new go.Shape({
                  geometryString: "M0 0 V15", // 定義刻度線幾何形狀
                  stroke: "white", // 設定刻度線顏色為白色
                  strokeWidth: 3, // 設定刻度線寬度
                  interval: 4, // 設定間隔
                }),
                // 添加刻度上的文字
                new go.TextBlock({
                  interval: 4, // 設定文字間隔
                  alignmentFocus: go.Spot.Center, // 對齊中心
                  font: "bold italic 14pt sans-serif", // 設定字體樣式
                  stroke: "white", // 設定文字顏色為白色
                  segmentOffset: new go.Point(0, 30), // 設定文字偏移量
                })
              ),
            // 添加顯示當前值的文字框
            new go.TextBlock({
              alignment: go.Spot.Center, // 設定對齊方式
              stroke: "white", // 設定文字顏色為白色
              font: "bold italic 14pt sans-serif", // 設定字體樣式
              editable: true, // 設定文字框為可編輯
            })
              .bindTwoWay(
                "text", // 雙向綁定文字內容
                "value", // 綁定節點的值
                (v) => v.toString(), // 將值轉為字符串顯示
                (s) => parseFloat(s) // 將字符串轉為數字
              )
              .bind("stroke", "color"), // 綁定文字顏色

            // 添加指針形狀
            new go.Shape({
              fill: "red", // 設定指針顏色為紅色
              strokeWidth: 0, // 設定指針邊框寬度
              ...sliderActions(true), // 應用滑塊行為邏輯
            }).bind("geometry", "value", (v, shp) => {
              // 根據值計算指針的幾何形狀
              const scale = shp.part.findObject("SCALE"); // 獲取刻度對象
              const p0 = scale.graduatedPointForValue(scale.graduatedMin); // 計算最小值位置
              const pv = scale.graduatedPointForValue(v); // 計算當前值位置
              const path = shp.part.findObject("PATH"); // 獲取刻度弧線
              const radius = path.actualBounds.width / 2; // 計算半徑
              const c = path.actualBounds.center; // 獲取中心點
              const a0 = c.directionPoint(p0); // 計算起始角度
              const av = c.directionPoint(pv); // 計算當前角度
              let sweep = av - a0; // 計算角度範圍
              if (sweep < 0) sweep += 360; // 確保角度範圍為正值
              const layerThickness = 8; // 設定指針厚度
              return new go.Geometry()
                .add(new go.PathFigure(-radius, -radius)) // 添加外圓
                .add(new go.PathFigure(radius, radius)) // 添加內圓
                .add(
                  new go.PathFigure(p0.x - radius, p0.y - radius) // 添加指針起點
                    .add(
                      new go.PathSegment(
                        go.SegmentType.Arc, // 添加弧線
                        a0,
                        sweep,
                        0,
                        0,
                        radius,
                        radius
                      )
                    )
                    .add(
                      new go.PathSegment(
                        go.SegmentType.Line, // 添加指針終點
                        pv.x - radius,
                        pv.y - radius
                      )
                    )
                    .add(
                      new go.PathSegment(
                        go.SegmentType.Arc, // 添加內弧線
                        av,
                        -sweep,
                        0,
                        0,
                        radius - layerThickness,
                        radius - layerThickness
                      ).close() // 關閉路徑
                    )
                );
            }),
            // 添加中心點
            new go.Shape("Circle", { width: 2, height: 2, fill: "#444" })
          )
        ),
        // 添加顯示文字
        new go.TextBlock({ row: 1, font: "bold 11pt sans-serif" }).bind("text")
      )
  );

  loop();

  // 設定連結模板
  diagram.linkTemplate = new go.Link({
    routing: go.Routing.AvoidsNodes, // 設定路由方式為避開節點
    corner: 12, // 設定連結的圓角半徑
  }).add(
    // 添加主要連結形狀，設定為灰色，寬度為 9
    new go.Shape({ isPanelMain: true, stroke: "gray", strokeWidth: 9 }),
    // 添加次要連結形狀，設定為淺灰色，寬度為 5
    new go.Shape({ isPanelMain: true, stroke: "lightgray", strokeWidth: 5 }),
    // 添加最外層連結形狀，設定為白煙色
    new go.Shape({ isPanelMain: true, stroke: "whitesmoke" })
  );

  // 定義一個循環函數，用於模擬數據的動態變化
  function loop() {
    setTimeout(() => {
      // 提交對圖表的更改
      diagram.commit((diag) => {
        // 遍歷所有的連結
        diag.links.each((l) => {
          // 隨機跳過部分連結
          if (Math.random() < 0.2) return;

          // 獲取連結起點和終點的當前值
          const prev = l.fromNode?.data?.value ?? 0; // 起點的值
          const now = l.toNode?.data?.value ?? 0; // 終點的值

          // 如果起點和終點存在，並且起點的值大於最小值，終點的值小於最大值
          if (
            l.fromNode &&
            l.toNode &&
            prev > (l.fromNode.data.min || 0) && // 起點值大於最小值
            now < (l.toNode.data.max || 100) // 終點值小於最大值
          ) {
            // 減少起點的值
            diag.model.set(l.fromNode.data, "value", prev - 1);
            // 增加終點的值
            diag.model.set(l.toNode.data, "value", now + 1);
          }
        });
      });
      // 遞歸調用 loop 函數，實現持續的數據更新
      loop();
    }, 500); // 每隔 500 毫秒執行一次
  }
  return diagram;
}

function A() {
  return (
    <div>
      {/* 使用 ReactDiagram 組件來初始化和渲染 GoJS 圖表 */}
      <ReactDiagram
        initDiagram={initDiagram} // 初始化圖表的函數
        divClassName="diagram-container" // 圖表容器的 CSS 類名
        nodeDataArray={[
          // 節點數據陣列
          {
            key: 1, // 節點的唯一鍵值
            value: 87, // 節點的值
            text: "Vertical", // 節點的文字
            category: "Vertical", // 節點的類別（對應模板）
            loc: "30 0", // 節點的位置
            editable: true, // 節點是否可編輯
            color: "yellow", // 節點的顏色
          },
          {
            key: 2,
            value: 23,
            text: "Circular Meter",
            category: "CircularMeter",
            loc: "250 -120",
            editable: true,
            color: "skyblue",
          },
          {
            key: 3,
            value: 56,
            text: "Needle Meter",
            category: "NeedleMeter",
            loc: "250 110",
            editable: true,
            color: "lightsalmon",
          },
          {
            key: 4,
            value: 16,
            max: 120, // 節點的最大值
            text: "Horizontal",
            category: "Horizontal",
            loc: "550 0",
            editable: true,
            color: "green",
          },
          {
            key: 5,
            value: 23,
            max: 200,
            unit: 5, // 刻度單位
            text: "Bar Meter",
            category: "BarMeter",
            loc: "550 200",
            editable: true,
            color: "orange",
          },
        ]}
        linkDataArray={[
          // 連結數據陣列
          { key: -1, from: 1, to: 2 }, // 從節點 1 到節點 2 的連結
          { key: -2, from: 1, to: 3 },
          { key: -3, from: 2, to: 4 },
          { key: -4, from: 3, to: 4 },
          { key: -5, from: 4, to: 5 },
        ]}
      />
    </div>
  );
}

export default A;
