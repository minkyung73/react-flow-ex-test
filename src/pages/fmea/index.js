import React, { useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap, 
  useReactFlow,
  ReactFlowProvider,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes = [
  {
    id: 'horizontal-1',
    sourcePosition: 'right',
    type: 'input',
    data: { label: 'Input' },
    position: { x: 0, y: 0 },
    depth: 1,
    className: `depth-1`, 
  },
  {
    id: 'horizontal-3',
    sourcePosition: 'right',
    targetPosition: 'left',
    data: { label: 'Node 3' },
    position: { x: 250, y: 0 },
    depth: 2,
    className: `depth-2`, 
  },
  {
    id: 'horizontal-5',
    sourcePosition: 'right',
    targetPosition: 'left',
    data: { label: 'Node 5' },
    position: { x: 500, y: 0 },
    depth: 3,
    className: `depth-3`, 
  },
  {
    id: 'horizontal-7',
    sourcePosition: 'right',
    targetPosition: 'left',
    data: { label: 'Node 7' },
    position: { x: 750, y: 0 },
    depth: 4,
    className: `depth-4`, 
  },
];

const initialEdges = [
  {
    id: 'horizontal-e1-3',
    source: 'horizontal-1',
    type: 'smoothstep',
    target: 'horizontal-3',
    animated: true,
  },
  {
    id: 'horizontal-e3-5',
    source: 'horizontal-3',
    type: 'smoothstep',
    target: 'horizontal-5',
    animated: true,
  },
  {
    id: 'horizontal-e5-7',
    source: 'horizontal-5',
    type: 'smoothstep',
    target: 'horizontal-7',
    animated: true,
  },
];

const nodeColor = (node) => {
  switch (node.depth) {
    case 1:
      return '#f28b82';
    case 2:
      return '#fbbc04';
    case 3:
      return '#34a853';
    case 4:
      return '#4285f4';
    default: 
      return '#000000';
  }
};

let id = 1;
const getId = () => `${id++}`;
const nodeOrigin = [0.5, 0];

const AddNodeOnEdgeDrop = () => {
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback((event, node) => {
    console.log(`Node Info:`, node);
  }, []);

  const onConnect = useCallback(
    (params) => {
      console.log(params);

      const sourceNode = nodes.find(node => node.id === params.source);
      const targetNode = nodes.find(node => node.id === params.target);

      console.log(sourceNode, targetNode);

      // [VALIDATION 1] 두 노드의 depth 차이가 1이 아닐 경우 연결을 하지 않음
      if (sourceNode && targetNode && Math.abs(sourceNode.depth - targetNode.depth) !== 1) {
        console.log('Connection not allowed: depth difference is not 1');
        return;
      }

      // [VALIDATION 2] sourceNode.depth가 3일 경우 이미 연결된 targetNode가 있는지 확인
      const isAlreadyConnectedSource = sourceNode.depth === 3 && edges.some(edge => edge.source === sourceNode.id);
      if (isAlreadyConnectedSource) {
        console.log('Cannot connect nodes: sourceNode is already connected.');
        return;
      }

      // [VALIDATION 3] targetNode.depth가 4일 경우 이미 연결된 sourceNode가 있는지 확인
      const isAlreadyConnectedTarget = targetNode.depth === 4 && edges.some(edge => edge.target === targetNode.id);
      if (isAlreadyConnectedTarget) {
        console.log('Cannot connect nodes: targetNode is already connected.');
        return;
      }

      // 엣지 추가
      setEdges((eds) => addEdge({ ...params, type: 'step' }, eds));
    },
    [edges],
  );

  const onConnectEnd = useCallback(
    (event, connectionState) => {
      if (!connectionState.isValid) {
        const id = getId();
        const { clientX, clientY } =
          'changedTouches' in event ? event.changedTouches[0] : event;

        // [VALIDATION 1] 3-2까지 생성 가능 (depth = 4)
        if (connectionState.fromNode.depth >= 4) return;

        // [VALIDATION 2] 3-1과 3-2는 1:1 mapping
        // 현재 edges 상태를 참조하여 fromNode가 이미 연결되어 있는지 확인
        const fromNodeId = connectionState.fromNode.id;
        const fromNodeDepth = connectionState.fromNode.depth;

        const isAlreadyConnected = fromNodeDepth === 3 && edges.some(edge => edge.source === fromNodeId);
        if (isAlreadyConnected) {
          console.log('Cannot create a new node: fromNode is already connected.');
          return;
        }

        // add node
        const newNode = {
          id,
          position: screenToFlowPosition({
            x: clientX,
            y: clientY,
          }),
          data: { label: `Node ${id}` },
          sourcePosition: 'right',
          targetPosition: 'left',
          origin: [0.5, 0.0],
          depth: connectionState.fromNode.depth + 1,
          className: `depth-${connectionState.fromNode.depth + 1}`
        };

        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) =>
          eds.concat({ id, source: connectionState.fromNode.id, target: id, type: 'step' }),
        );
      }
    },
    [edges, screenToFlowPosition],
  );

  const onNodesDelete = useCallback(
    (deleted) => {
      setEdges(
        deleted.reduce((acc, node) => {
          const incomers = getIncomers(node, nodes, edges);
          const outgoers = getOutgoers(node, nodes, edges);
          const connectedEdges = getConnectedEdges([node], edges);

          const remainingEdges = acc.filter(
            (edge) => !connectedEdges.includes(edge),
          );

          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => ({
              id: `${source}->${target}`,
              source,
              target,
            })),
          );

          return [...remainingEdges, ...createdEdges];
        }, edges),
      );
    },
    [nodes, edges],
  );

  const onCheckNodes = () => {
    console.log('nodes: ', nodes);
  }

  const onCheckEdges = () => {
    console.log('edges: ', edges);
  }

  return (
    <div className="wrapper" ref={reactFlowWrapper} style={{ width: "100vw", height: "90vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={onNodeClick}
        onNodesChange={onNodesChange}
        onNodesDelete={onNodesDelete}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        nodesDraggable={true}
        fitView
        // fitViewOptions={{ padding: 2 }}
        nodeOrigin={nodeOrigin}
      >
        <MiniMap nodeColor={nodeColor} nodeStrokeWidth={3} zoomable pannable />
        <Panel position='topleft'>
          <div>
            <button onClick={onCheckNodes}>
              check the nodes
            </button>
            <button onClick={onCheckEdges}>
              check the edges
            </button>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default function () {
  return (
    <ReactFlowProvider>
      <AddNodeOnEdgeDrop />
    </ReactFlowProvider>
  )
};
