import './App.css'

import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';

function initDiagram() {

  
  const diagram = new go.Diagram({
    "undoManager.isEnabled": true, // must be set to allow for model change listening
    // 'undoManager.maxHistoryLength': 0,  // uncomment disable undo/redo functionality
    "clickCreatingTool.archetypeNodeData": {
      text: "new node",
      color: "lightblue",
    },
    model: new go.GraphLinksModel({
      linkKeyProperty: "key", // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
    }),
  });

  diagram.nodeTemplate = new go.Node("Auto")
    .bindTwoWay("location", "loc", go.Point.parse, go.Point.stringify)
    .add(
      new go.Shape("RoundedRectangle", {
        name: "SHAPE",
        fill: "white",
        strokeWidth: 0,
      }).bind("fill", "color"),
      new go.TextBlock({ margin: 8, editable: true }).bindTwoWay("text")
    );

  function sliderActions(alwaysVisible: any) {
    return {
      isActionable: true,
      actionDown: (e: any, obj: any) => {
        obj._dragging = true;
        obj._original = obj.part.data.value;
      },
      actionMove: (e: any, obj: any) => {
        if (!obj._dragging) return;
        var scale = obj.part.findObject('SCALE');
        var pt = e.diagram.lastInput.documentPoint;
        var loc = scale.getLocalPoint(pt);
        var val = Math.round(scale.graduatedValueForPoint(loc));
        // just set the data.value temporarily, not recorded in UndoManager
        e.diagram.model.commit((m: any) => {
          m.set(obj.part.data, 'value', val);
        }, null); // null means skipsUndoManager
      },
      actionUp: (e: any, obj: any) => {
        if (!obj._dragging) return;
        obj._dragging = false;
        var scale = obj.part.findObject('SCALE');
        var pt = e.diagram.lastInput.documentPoint;
        var loc = scale.getLocalPoint(pt);
        var val = Math.round(scale.graduatedValueForPoint(loc));
        e.diagram.model.commit((m: any) => {
          m.set(obj.part.data, 'value', obj._original);
        }, null); // null means skipsUndoManager
        // now set the data.value for real
        e.diagram.model.commit((m: any) => {
          m.set(obj.part.data, 'value', val);
        }, 'dragged slider');
      },
      actionCancel: (e: any, obj: any) => {
        obj._dragging = false;
        e.diagram.model.commit((m: any) => {
          m.set(obj.part.data, 'value', obj._original);
        }, null); // null means skipsUndoManager
      }
    };
  }

  function commonNodeStyle() {
    return {
      locationSpot: go.Spot.Center,
      fromSpot: go.Spot.BottomRightSides,
      toSpot: go.Spot.TopLeftSides,
      movable: false,
    };
  }

  function applyCommonNodeStyleBindings(object: go.Node) {
    object.bindTwoWay('location', 'loc', go.Point.parse, go.Point.stringify);
    return object;
  }

  function applyCommonScaleBindings(object: go.Panel) {
    object
      .bind('graduatedMin', 'min')
      .bind('graduatedMax', 'max')
      .bind('graduatedTickUnit', 'unit')
      .bind('isEnabled', 'editable');
    return object;
  }

  function commonSlider(vert: boolean) {
    return new go.Shape('RoundedRectangle', {
      name: 'SLIDER',
      fill: 'white',
      desiredSize: vert ? new go.Size(20, 6) : new go.Size(6, 20),
      alignment: vert ? go.Spot.Top : go.Spot.Right,
      ...sliderActions(false)
    });
  }

  diagram.nodeTemplateMap.add('Horizontal',
    new go.Node('Auto', commonNodeStyle())
      .apply(applyCommonNodeStyleBindings)
      .add(
        new go.Shape({ fill: 'lightgray', stroke: 'gray' }),
        new go.Panel('Table', { margin: 1, stretch: go.Stretch.Fill })
          .add(
            // header information
            new go.TextBlock({ row: 0, font: 'bold 10pt sans-serif' }).bind('text'),
            new go.Panel('Spot', { row: 1 }).add(
              applyCommonScaleBindings(
                new go.Panel('Graduated', {
                  name: 'SCALE',
                  margin: new go.Margin(0, 6),
                  graduatedTickUnit: 10,
                  isEnabled: false
                })
                  .add(
                    new go.Shape({ geometryString: 'M0 0 H200', height: 0, name: 'PATH' }),
                    new go.Shape({
                      geometryString: 'M0 0 V16',
                      alignmentFocus: go.Spot.Center,
                      stroke: 'gray'
                    }),
                    new go.Shape({
                      geometryString: 'M0 0 V20',
                      alignmentFocus: go.Spot.Center,
                      interval: 5,
                      strokeWidth: 1.5
                    })
                  )
              ),
              new go.Panel('Spot', {
                alignment: go.Spot.Left,
                alignmentFocus: go.Spot.Left,
                alignmentFocusName: 'BAR'
              })
                // the indicator (a bar)
                .add(
                  new go.Shape({ name: 'BAR', fill: 'red', strokeWidth: 0, height: 8 })
                    .bind('fill', 'color')
                    .bind('desiredSize', 'value', (v, shp) => {
                      var scale = shp.part.findObject('SCALE');
                      var path = scale.findMainElement();
                      var len =
                        ((v - scale.graduatedMin) / (scale.graduatedMax - scale.graduatedMin)) *
                        path.geometry.bounds.width;
                      return new go.Size(len, 10);
                    })
                )
                .add(commonSlider(false))
            ),
            // state information
            new go.TextBlock('0', { row: 2, alignment: go.Spot.Left }).bind('text', 'min'),
            new go.TextBlock('100', { row: 2, alignment: go.Spot.Right }).bind('text', 'max'),
            new go.TextBlock({
              row: 2,
              background: 'white',
              font: 'bold 10pt sans-serif',
              isMultiline: false,
              editable: true
            })
              .bindTwoWay(
                'text',
                'value',
                (v) => v.toString(),
                (s) => parseFloat(s)
              )
          )
      )
  );

  diagram.nodeTemplateMap.add('Vertical',
    new go.Node('Auto', commonNodeStyle())
      .apply(applyCommonNodeStyleBindings)
      .add(
        new go.Shape({ fill: 'lightgray', stroke: 'gray' }),
        new go.Panel('Table', {
          margin: 1,
          stretch: go.Stretch.Fill
        })
          // header information
          .add(
            new go.TextBlock({
              row: 0,
              font: 'bold 10pt sans-serif'
            })
              .bind('text'),
            new go.Panel('Spot', { row: 1 })
              .add(
                applyCommonScaleBindings(
                  new go.Panel('Graduated', {
                    name: 'SCALE',
                    margin: new go.Margin(6, 0),
                    graduatedTickUnit: 10,
                    isEnabled: false
                  })
                )
                  .add(
                    // NOTE: path goes upward!
                    new go.Shape({ geometryString: 'M0 0 V-200', width: 0, name: 'PATH' }),
                    new go.Shape({
                      geometryString: 'M0 0 V16',
                      alignmentFocus: go.Spot.Center,
                      stroke: 'gray'
                    }),
                    new go.Shape({
                      geometryString: 'M0 0 V20',
                      alignmentFocus: go.Spot.Center,
                      interval: 5,
                      strokeWidth: 1.5
                    })
                  ),
                new go.Panel('Spot', {
                  alignment: go.Spot.Bottom,
                  alignmentFocus: go.Spot.Bottom,
                  alignmentFocusName: 'BAR'
                })
                  // the indicator (a bar)
                  .add(
                    new go.Shape({ name: 'BAR', fill: 'red', strokeWidth: 0, height: 8 })
                      .bind('fill', 'color')
                      .bind('desiredSize', 'value', (v, shp) => {
                        var scale = shp.part.findObject('SCALE');
                        var path = scale.findMainElement();
                        var len =
                          ((v - scale.graduatedMin) /
                            (scale.graduatedMax - scale.graduatedMin)) *
                          path.geometry.bounds.height;
                        return new go.Size(10, len);
                      }),
                    commonSlider(true)
                  )
              ),
            // state information
            new go.TextBlock('0', { row: 2, alignment: go.Spot.Left })
              .bind('text', 'min'),
            new go.TextBlock('100', { row: 2, alignment: go.Spot.Right })
              .bind('text', 'max'),
            new go.TextBlock({
              row: 2,
              background: 'white',
              font: 'bold 10pt sans-serif',
              isMultiline: false,
              editable: true
            })
              .bindTwoWay(
                'text',
                'value',
                (v) => v.toString(),
                (s) => parseFloat(s)
              )
          )
      )
  );

  diagram.nodeTemplateMap.add('NeedleMeter',
    new go.Node('Auto', commonNodeStyle())
      .apply(applyCommonNodeStyleBindings)
      .add(
        new go.Shape({ fill: 'darkslategray' }),
        new go.Panel('Spot')
          .add(
            new go.Panel('Position')
              .add(
                new go.Panel('Graduated', { name: 'SCALE', margin: 10 })
                  .apply(applyCommonScaleBindings)
                  .add(
                    new go.Shape({
                      name: 'PATH',
                      geometryString: 'M0 0 A120 120 0 0 1 200 0',
                      stroke: 'white'
                    }),
                    new go.Shape({ geometryString: 'M0 0 V10', stroke: 'white' }),
                    new go.TextBlock({
                      segmentOffset: new go.Point(0, 12),
                      segmentOrientation: go.Orientation.Along,
                      stroke: 'white'
                    })
                  ),
                new go.Shape({
                  stroke: 'red',
                  strokeWidth: 4,
                  isGeometryPositioned: true,
                  ...sliderActions(true)
                })
                  .bind('geometry', 'value', (v, shp) => {
                    var scale = shp.part.findObject('SCALE');
                    var pt = scale.graduatedPointForValue(v);
                    var geo = new go.Geometry(go.GeometryType.Line);
                    geo.startX = 100 + scale.margin.left;
                    geo.startY = 90 + scale.margin.top;
                    geo.endX = pt.x + scale.margin.left;
                    geo.endY = pt.y + scale.margin.top;
                    return geo;
                  })
              ),
            new go.TextBlock({
              alignment: new go.Spot(0.5, 0.5, 0, 20),
              stroke: 'white',
              font: 'bold 10pt sans-serif'
            })
              .bind('text')
              .bind('stroke', 'color'),
            new go.TextBlock({
              alignment: go.Spot.Top,
              margin: new go.Margin(4, 0, 0, 0),
              stroke: 'white',
              font: 'bold italic 13pt sans-serif',
              isMultiline: false,
              editable: true
            })
              .bindTwoWay('text', 'value', (v) => v.toString(), (s) => parseFloat(s))
              .bind('stroke', 'color')
          )
      )
  );

  diagram.nodeTemplateMap.add('CircularMeter',
    new go.Node('Table', commonNodeStyle())
      .apply(applyCommonNodeStyleBindings)
      .add(
        new go.Panel('Auto', { row: 0 })
          .add(
            new go.Shape('Circle', {
              stroke: 'orange',
              strokeWidth: 5,
              spot1: go.Spot.TopLeft,
              spot2: go.Spot.BottomRight
            })
              .bind('stroke', 'color'),
            new go.Panel('Spot')
              .add(
                applyCommonScaleBindings(
                  new go.Panel('Graduated', {
                    name: 'SCALE',
                    margin: 14,
                    graduatedTickUnit: 2.5, // tick marks at each multiple of 2.5
                    stretch: go.Stretch.None // needed to avoid unnecessary re-measuring!!!
                  })
                )
                  .add(
                    // the main path of the graduated panel, an arc starting at 135 degrees and sweeping for 270 degrees
                    new go.Shape({
                      name: 'PATH',
                      geometryString: 'M-70.7107 70.7107 B135 270 0 0 100 100 M0 100',
                      stroke: 'white',
                      strokeWidth: 4
                    }),
                    // three differently sized tick marks
                    new go.Shape({ geometryString: 'M0 0 V10', stroke: 'white', strokeWidth: 1 }),
                    new go.Shape({
                      geometryString: 'M0 0 V12',
                      stroke: 'white',
                      strokeWidth: 2,
                      interval: 2
                    }),
                    new go.Shape({
                      geometryString: 'M0 0 V15',
                      stroke: 'white',
                      strokeWidth: 3,
                      interval: 4
                    }),
                    new go.TextBlock({
                      // each tick label
                      interval: 4,
                      alignmentFocus: go.Spot.Center,
                      font: 'bold italic 14pt sans-serif',
                      stroke: 'white',
                      segmentOffset: new go.Point(0, 30)
                    })
                  ),
                new go.TextBlock({
                  alignment: new go.Spot(0.5, 0.9),
                  stroke: 'white',
                  font: 'bold italic 14pt sans-serif',
                  editable: true
                })
                  .bindTwoWay(
                    'text',
                    'value',
                    (v) => v.toString(),
                    (s) => parseFloat(s)
                  )
                  .bind('stroke', 'color'),
                new go.Shape({
                  fill: 'red',
                  strokeWidth: 0,
                  geometryString: 'F1 M-6 0 L0 -6 100 0 0 6z x M-100 0',
                  ...sliderActions(true)
                })
                  .bind('angle', 'value', (v, shp) => {
                    // this determines the angle of the needle, based on the data.value argument
                    var scale = shp.part.findObject('SCALE');
                    var p = scale.graduatedPointForValue(v);
                    var path = shp.part.findObject('PATH');
                    var c = path.actualBounds.center;
                    return c.directionPoint(p);
                  }),
                new go.Shape('Circle', { width: 2, height: 2, fill: '#444' })
              )
          ),
        new go.TextBlock({
          row: 1,
          font: 'bold 11pt sans-serif'
        })
          .bind('text')
      )
  );

  diagram.nodeTemplateMap.add('BarMeter',
    new go.Node('Table', {
      ...commonNodeStyle(),
      scale: 0.8
    })
      .apply(applyCommonNodeStyleBindings)
      .add(
        new go.Panel('Auto', { row: 0 })
          .add(
            new go.Shape('Circle', {
              stroke: 'orange',
              strokeWidth: 5,
              spot1: go.Spot.TopLeft,
              spot2: go.Spot.BottomRight
            })
              .bind('stroke', 'color'),
            new go.Panel('Spot')
              .add(
                new go.Panel('Graduated', {
                  name: 'SCALE',
                  margin: 14,
                  graduatedTickUnit: 2.5, // tick marks at each multiple of 2.5
                  stretch: go.Stretch.None // needed to avoid unnecessary re-measuring!!!
                })
                  .apply(applyCommonScaleBindings)
                  .add(
                    // the main path of the graduated panel, an arc starting at 135 degrees and sweeping for 270 degrees
                    new go.Shape({
                      name: 'PATH',
                      geometryString: 'M-70.7107 70.7107 B135 270 0 0 100 100 M0 100',
                      stroke: 'white',
                      strokeWidth: 4
                    }),
                    // three differently sized tick marks
                    new go.Shape({ geometryString: 'M0 0 V10', stroke: 'white', strokeWidth: 1 }),
                    new go.Shape({
                      geometryString: 'M0 0 V12',
                      stroke: 'white',
                      strokeWidth: 2,
                      interval: 2
                    }),
                    new go.Shape({
                      geometryString: 'M0 0 V15',
                      stroke: 'white',
                      strokeWidth: 3,
                      interval: 4
                    }),
                    new go.TextBlock({
                      // each tick label
                      interval: 4,
                      alignmentFocus: go.Spot.Center,
                      font: 'bold italic 14pt sans-serif',
                      stroke: 'white',
                      segmentOffset: new go.Point(0, 30)
                    })
                  ),
                new go.TextBlock({
                  alignment: go.Spot.Center,
                  stroke: 'white',
                  font: 'bold italic 14pt sans-serif',
                  editable: true
                })
                  .bindTwoWay(
                    'text',
                    'value',
                    (v) => v.toString(),
                    (s) => parseFloat(s)
                  )
                  .bind('stroke', 'color'),
                new go.Shape({
                  fill: 'red',
                  strokeWidth: 0,
                  ...sliderActions(true)
                })
                  .bind('geometry', 'value', (v, shp) => {
                    var scale = shp.part.findObject('SCALE');
                    var p0 = scale.graduatedPointForValue(scale.graduatedMin);
                    var pv = scale.graduatedPointForValue(v);
                    var path = shp.part.findObject('PATH');
                    var radius = path.actualBounds.width / 2;
                    var c = path.actualBounds.center;
                    var a0 = c.directionPoint(p0);
                    var av = c.directionPoint(pv);
                    var sweep = av - a0;
                    if (sweep < 0) sweep += 360;
                    var layerThickness = 8;
                    return new go.Geometry()
                      .add(new go.PathFigure(-radius, -radius)) // always make sure the Geometry includes the top left corner
                      .add(new go.PathFigure(radius, radius)) // and the bottom right corner of the whole circular area
                      .add(
                        new go.PathFigure(p0.x - radius, p0.y - radius)
                          .add(
                            new go.PathSegment(
                              go.SegmentType.Arc,
                              a0,
                              sweep,
                              0,
                              0,
                              radius,
                              radius
                            )
                          )
                          .add(
                            new go.PathSegment(go.SegmentType.Line, pv.x - radius, pv.y - radius)
                          )
                          .add(
                            new go.PathSegment(
                              go.SegmentType.Arc,
                              av,
                              -sweep,
                              0,
                              0,
                              radius - layerThickness,
                              radius - layerThickness
                            ).close()
                          )
                      );
                  }),
                new go.Shape('Circle', { width: 2, height: 2, fill: '#444' })
              )
          ),
        new go.TextBlock({ row: 1, font: 'bold 11pt sans-serif' }).bind('text')
      )
  );

  // diagram.model = new go.GraphLinksModel(
  //   [
  //     {
  //       key: 1,
  //       value: 87,
  //       text: 'Vertical',
  //       category: 'Vertical',
  //       loc: '30 0',
  //       editable: true,
  //       color: 'yellow'
  //     },
  //     {
  //       key: 2,
  //       value: 23,
  //       text: 'Circular Meter',
  //       category: 'CircularMeter',
  //       loc: '250 -120',
  //       editable: true,
  //       color: 'skyblue'
  //     },
  //     {
  //       key: 3,
  //       value: 56,
  //       text: 'Needle Meter',
  //       category: 'NeedleMeter',
  //       loc: '250 110',
  //       editable: true,
  //       color: 'lightsalmon'
  //     },
  //     {
  //       key: 4,
  //       value: 16,
  //       max: 120,
  //       text: 'Horizontal',
  //       category: 'Horizontal',
  //       loc: '550 0',
  //       editable: true,
  //       color: 'green'
  //     },
  //     {
  //       key: 5,
  //       value: 23,
  //       max: 200,
  //       unit: 5,
  //       text: 'Bar Meter',
  //       category: 'BarMeter',
  //       loc: '550 200',
  //       editable: true,
  //       color: 'orange'
  //     }
  //   ],
  //   [
  //     { from: 1, to: 2 },
  //     { from: 1, to: 3 },
  //     { from: 2, to: 4 },
  //     { from: 3, to: 4 },
  //     { from: 4, to: 5 }
  //   ]
  // );

  loop();

  diagram.linkTemplate = new go.Link({
    routing: go.Routing.AvoidsNodes,
    corner: 12
  }).add(
    new go.Shape({ isPanelMain: true, stroke: 'gray', strokeWidth: 9 }),
    new go.Shape({ isPanelMain: true, stroke: 'lightgray', strokeWidth: 5 }),
    new go.Shape({ isPanelMain: true, stroke: 'whitesmoke' })
  );

  function loop() {
    setTimeout(() => {
      diagram.commit((diag) => {
        diag.links.each((l) => {
          if (Math.random() < 0.2) return;
          var prev = l.fromNode?.data?.value ?? 0;
          var now = l.toNode?.data?.value ?? 0;
          if (l.fromNode && l.toNode && prev > (l.fromNode.data.min || 0) && now < (l.toNode.data.max || 100)) {
            diag.model.set(l.fromNode.data, 'value', prev - 1);
            diag.model.set(l.toNode.data, 'value', now + 1);
          }
        });
      });
      loop();
    }, 500);
  }
  return diagram;
}


function App() {
  return (
    <div>
      <ReactDiagram
        initDiagram={initDiagram}
        divClassName='diagram-container'
        nodeDataArray={[
          {
            key: 1,
            value: 87,
            text: 'Vertical',
            category: 'Vertical',
            loc: '30 0',
            editable: true,
            color: 'yellow'
          },
          {
            key: 2,
            value: 23,
            text: 'Circular Meter',
            category: 'CircularMeter',
            loc: '250 -120',
            editable: true,
            color: 'skyblue'
          },
          {
            key: 3,
            value: 56,
            text: 'Needle Meter',
            category: 'NeedleMeter',
            loc: '250 110',
            editable: true,
            color: 'lightsalmon'
          },
          {
            key: 4,
            value: 16,
            max: 120,
            text: 'Horizontal',
            category: 'Horizontal',
            loc: '550 0',
            editable: true,
            color: 'green'
          },
          {
            key: 5,
            value: 23,
            max: 200,
            unit: 5,
            text: 'Bar Meter',
            category: 'BarMeter',
            loc: '550 200',
            editable: true,
            color: 'orange'
          }
        ]}
        linkDataArray={[
          { key: -1, from: 1, to: 2 },
          { key: -2, from: 1, to: 3 },
          { key: -3, from: 2, to: 4 },
          { key: -4, from: 3, to: 4 },
          { key: -5, from: 4, to: 5 }
        ]}
      />
    </div>
  );
}

export default App
