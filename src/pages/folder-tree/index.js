import FolderTree, { testData } from "react-folder-tree";

// add fake url to data for testing purpose
const addUrl = (node) => {
  const fakeUrl = `root/${node.name}`;
  if (node.children) {
    node.url = fakeUrl;
    node.children = node.children.map((c) => addUrl(c));
  } else {
    node.url = fakeUrl;
  }
  //   console.log(node);

  return node;
};

// simulate a download function
const fakeDownload = (nodeData) => console.log("downloading...", nodeData);

// custom event handler for node name click
const onNameClick = ({ defaultOnClick, nodeData }) => {
  const {
    // internal data
    path,
    name,
    checked,
    isOpen,
    // custom data
    url,
    ...whateverRest
  } = nodeData;

  fakeDownload({ name, url });
};

export default function CustomNodeClickDemo() {
  return (
    <FolderTree
      data={addUrl(testData)}
      onNameClick={onNameClick}
      showCheckbox={false}
    />
  );
}
