class HashingService {
  constructor() {
    this.nodes = [
      { name: "node1", capacity: 2, users: [] },
      { name: "node2", capacity: 2, users: [] },
      { name: "node3", capacity: 2, users: [] },
      { name: "node4", capacity: 2, users: [] },
    ];
    this.nodeCounter = 4;
  }

  hash(str) {
    let sum = 0;
    for (let i = 0; i < str.length; i++) {
      sum += str.charCodeAt(i);
    }
    return sum;
  }

  getNodes() {
    return this.nodes.map((node) => ({
      name: node.name,
      capacity: node.capacity,
      users: node.users,
      currentLoad: node.users.length,
      status: node.users.length < node.capacity ? "available" : "busy",
    }));
  }

  assignUser(username) {
    if (!username || username.trim() === "") {
      throw new Error("Username cannot be empty");
    }

    if (this.nodes.length === 0) {
      throw new Error("No nodes available. Add a node first!");
    }

    for (const node of this.nodes) {
      if (node.users.includes(username)) {
        throw new Error(`User "${username}" is already assigned to ${node.name}`);
      }
    }

    const hashValue = this.hash(username);
    const startIndex = hashValue % this.nodes.length;
    const steps = [];

    steps.push(`Hash value of "${username}" = ${hashValue}`);
    steps.push(`${hashValue} % ${this.nodes.length} (total nodes) = ${startIndex}`);
    steps.push(`Mapped to → ${this.nodes[startIndex].name}`);

    let assigned = false;
    let assignedNodeName = null;

    for (let attempt = 0; attempt < this.nodes.length; attempt++) {
      const currentIndex = (startIndex + attempt) % this.nodes.length;
      const currentNode = this.nodes[currentIndex];

      if (currentNode.users.length < currentNode.capacity) {
        currentNode.users.push(username);
        assigned = true;
        assignedNodeName = currentNode.name;
        steps.push(`${currentNode.name} has space (${currentNode.users.length}/${currentNode.capacity}) → Assigned!`);
        break;
      } else {
        steps.push(`${currentNode.name} is FULL (${currentNode.users.length}/${currentNode.capacity})`);
        if (attempt + 1 < this.nodes.length) {
          const nextIndex = (startIndex + attempt + 1) % this.nodes.length;
          steps.push(`Moving to next node → ${this.nodes[nextIndex].name}`);
        }
      }
    }

    return {
      success: assigned,
      message: assigned 
        ? `User "${username}" assigned to ${assignedNodeName}` 
        : "All nodes are busy!",
      assignedNode: assignedNodeName,
      steps: steps,
    };
  }

  addNode(customName) {
    if (customName && this.nodes.some(n => n.name === customName)) {
      throw new Error(`Node "${customName}" already exists!`);
    }

    this.nodeCounter++;
    const newNode = {
      name: customName || `node${this.nodeCounter}`,
      capacity: 2,
      users: [],
    };
    this.nodes.push(newNode);
    return newNode;
  }

  removeNode() {
    if (this.nodes.length === 0) {
      throw new Error("No nodes to remove!");
    }
    return this.nodes.pop();
  }

  reset() {
    for (const node of this.nodes) {
      node.users = [];
    }
  }
}

module.exports = new HashingService();
