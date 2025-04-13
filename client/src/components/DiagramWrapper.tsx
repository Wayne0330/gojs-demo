// import * as go from 'gojs';
// import { ReactDiagram } from 'gojs-react';
// import * as React from 'react';

// // props passed in from a parent component holding state, some of which will be passed to ReactDiagram
// interface WrapperProps {
//     nodeDataArray: Array<go.ObjectData>;
//     linkDataArray: Array<go.ObjectData>;
//     modelData: go.ObjectData;
//     skipsDiagramUpdate: boolean;
//     onDiagramEvent: (e: go.DiagramEvent) => void;
//     onModelChange: (e: go.IncrementalData) => void;
// }

// export class DiagramWrapper extends React.Component<WrapperProps, {}> {

//     private diagramRef: React.RefObject<ReactDiagram | null>;

//     constructor(props: WrapperProps) {
//         super(props);
//         this.diagramRef = React.createRef<ReactDiagram>();
//     }

//     public componentDidMount() {
//         if (!this.diagramRef.current) return;
//         const diagram = this.diagramRef.current?.getDiagram();
//         if (diagram instanceof go.Diagram) {
//             diagram.addDiagramListener('ChangedSelection', this.props.onDiagramEvent);
//         }
//     }

//     public componentWillUnmount() {
//         if (!this.diagramRef.current) return;
//         const diagram = this.diagramRef.current.getDiagram();
//         if (diagram instanceof go.Diagram) {
//             diagram.removeDiagramListener('ChangedSelection', this.props.onDiagramEvent);
//         }
//     }


//     private initDiagram(): go.Diagram {
  

//         return diagram;
//     }



//     public render() {
//         return (
//             <ReactDiagram
//                 ref={this.diagramRef}
//                 divClassName='diagram-container'
//                 initDiagram={this.initDiagram}
//                 nodeDataArray={this.props.nodeDataArray}
//                 linkDataArray={this.props.linkDataArray}
//                 modelData={this.props.modelData}
//                 onModelChange={this.props.onModelChange}
//                 skipsDiagramUpdate={this.props.skipsDiagramUpdate}
//             />
//         );
//     }
// }