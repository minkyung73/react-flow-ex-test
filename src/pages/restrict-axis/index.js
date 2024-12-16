import React, { useCallback, useState, useRef } from "react";

import {
  ReactFlow,
  Node,
  addEdge,
  Background,
  Edge,
  Connection,
  applyNodeChanges,
  useEdgesState,
  NodeChange,
} from "@xyflow/react";

const initialNodes = [
  {
    id: "1",
    type: "input",
    data: { label: "Node 1", fixedY: 5 },
    position: { x: 250, y: 5 },
  },
  {
    id: "2",
    data: { label: "Node 2", fixedY: 100 },
    position: { x: 100, y: 100 },
  },
  {
    id: "3",
    data: { label: "Node 3", fixedY: 100 },
    position: { x: 400, y: 100 },
  },
  {
    id: "4",
    data: { label: "Node 4", fixedY: 200 },
    position: { x: 400, y: 200 },
  },
];

const initialEdges = [
  { id: "e1-2", source: "1", target: "2", animated: true },
  { id: "e1-3", source: "1", target: "3" },
];

const BasicFlow = () => {
  const reactFlowWrapper = useRef(null);

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback(
    (params) => setEdges((els) => addEdge(params, els)),
    [setEdges]
  );

  // y축 고정으로 변경 예정
  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => {
      const parsedChanges = changes.map((change) => {
        if (change.type === "position" && change.position) {
          const node = nds.find((node) => change.id === node.id);
          if (node) {
            // Y축을 고정된 값으로 설정
            change.position.y = node.data.fixedY;
            change.y = node.data.fixedY; // 절대 위치도 고정
          }
        }
        return change;
      });

      return applyNodeChanges(parsedChanges, nds);
    });
  }, []);

  return (
    <div
      className="wrapper"
      ref={reactFlowWrapper}
      style={{ display: "flex", width: "100vw", height: "90vh" }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Background />
      </ReactFlow>
    </div>
  );
};

export default BasicFlow;
