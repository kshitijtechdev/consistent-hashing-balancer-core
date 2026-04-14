const API_URL = "";

const usernameInput = document.getElementById("username-input");
const nodeNameInput = document.getElementById("node-name-input");
const sendBtn = document.getElementById("send-btn");
const addNodeBtn = document.getElementById("add-node-btn");
const removeNodeBtn = document.getElementById("remove-node-btn");
const resetBtn = document.getElementById("reset-btn");
const nodesContainer = document.getElementById("nodes-container");
const stepsContainer = document.getElementById("steps-container");
const resultMessage = document.getElementById("result-message");

const toastContainer = document.createElement("div");
toastContainer.className = "toast-container";
document.body.appendChild(toastContainer);

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "toastOut 0.3s ease forwards";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

async function fetchNodes() {
  try {
    const response = await fetch(`${API_URL}/nodes`);
    const nodes = await response.json();
    renderNodes(nodes);
  } catch (error) {
    console.error("Error fetching nodes:", error);
    showToast("Failed to fetch nodes", "error");
  }
}

function renderNodes(nodes) {
  if (nodes.length === 0) {
    nodesContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; color: var(--text-muted); padding: 40px;">
        <i data-lucide="inbox" width="48" height="48" style="margin-bottom: 12px; opacity: 0.5;"></i>
        <p>No nodes in the cluster. Click "Add Node" to get started.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  let html = "";

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const statusClass = node.status;
    const capacityPercent = (node.currentLoad / node.capacity) * 100;

    let barColor = "green";
    if (capacityPercent >= 100) {
      barColor = "red";
    } else if (capacityPercent >= 50) {
      barColor = "yellow";
    }

    let usersHTML = "";
    if (node.users.length === 0) {
      usersHTML = `<span class="no-users-text">No users assigned</span>`;
    } else {
      for (let j = 0; j < node.users.length; j++) {
        usersHTML += `
          <span class="user-chip">
            <span class="user-chip-icon" style="display:flex;"><i data-lucide="user" width="14" height="14"></i></span>
            ${node.users[j]}
          </span>
        `;
      }
    }

    html += `
      <div class="node-card ${statusClass}" id="node-card-${node.name}">
        <div class="node-header">
          <span class="node-name" style="display: flex; align-items: center; gap: 6px;"><i data-lucide="server" width="20" height="20"></i> ${node.name}</span>
          <span class="status-badge ${statusClass}">
            ${statusClass === "available" ? "Available" : "Full"}
          </span>
        </div>

        <div class="capacity-section">
          <div class="capacity-label">
            <span>Capacity</span>
            <span>${node.currentLoad} / ${node.capacity}</span>
          </div>
          <div class="capacity-bar-bg">
            <div class="capacity-bar-fill ${barColor}" style="width: ${capacityPercent}%"></div>
          </div>
        </div>

        <div class="users-section">
          <div class="users-label">Users</div>
          ${usersHTML}
        </div>
      </div>
    `;
  }

  nodesContainer.innerHTML = html;
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function getTimestamp() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function appendLog(text, type = "default") {
  const placeholder = stepsContainer.querySelector(".terminal-placeholder");
  if (placeholder) placeholder.remove();

  const line = document.createElement("div");
  line.className = `log-line log-${type}`;
  line.innerHTML = `<span class="log-ts">${getTimestamp()}</span> <span class="log-prefix">&gt;&gt;</span> ${text}`;
  stepsContainer.appendChild(line);
  stepsContainer.scrollTop = stepsContainer.scrollHeight;
}

function renderSteps(steps) {
  for (let i = 0; i < steps.length; i++) {
    const stepText = steps[i];
    let type = "default";
    if (stepText.includes("FULL")) type = "error";
    else if (stepText.includes("Assigned")) type = "success";
    else if (stepText.includes("All nodes are busy")) type = "error";
    else if (stepText.includes("Hash value")) type = "hash";
    else if (stepText.includes("Mapped to")) type = "info";
    else if (stepText.includes("Moving to")) type = "warn";

    setTimeout(() => appendLog(stepText, type), i * 80);
  }
}

function clearLogs() {
  stepsContainer.innerHTML = `<p class="terminal-placeholder">&gt;&gt; Awaiting simulator input...</p>`;
  resultMessage.textContent = "";
  resultMessage.className = "result-message";
}

async function sendRequest() {
  const username = usernameInput.value.trim();

  if (!username) {
    showToast("Please enter a username!", "error");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username }),
    });

    const data = await response.json();

    if (data.error) {
      resultMessage.textContent = data.error;
      resultMessage.className = "result-message error";
      showToast(data.error, "error");
      return;
    }

    resultMessage.textContent = "";
    resultMessage.className = "result-message";

    if (data.steps) {
      renderSteps(data.steps);
    }

    if (data.success) {
      showToast(data.message, "success");

      setTimeout(() => {
        const card = document.getElementById(`node-card-${data.assignedNode}`);
        if (card) {
          card.classList.add("just-assigned");
          setTimeout(() => card.classList.remove("just-assigned"), 700);
        }
      }, 100);
    } else {
      showToast(data.message, "error");
    }

    await fetchNodes();

    usernameInput.value = "";
  } catch (error) {
    console.error("Error sending request:", error);
    showToast("Server error! Is the backend running?", "error");
  }
}

async function addNode() {
  const nodeName = nodeNameInput ? nodeNameInput.value.trim() : "";
  try {
    const response = await fetch(`${API_URL}/add-node`, { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodeName: nodeName })
    });
    const data = await response.json();

    if (data.error) {
      showToast(data.error, "error");
      return;
    }

    if (nodeNameInput) nodeNameInput.value = "";
    appendLog(data.message, "success");
    showToast(data.message, "success");

    await fetchNodes();
  } catch (error) {
    console.error("Error adding node:", error);
    showToast("Failed to add node", "error");
  }
}

async function removeNode() {
  try {
    const response = await fetch(`${API_URL}/remove-node`, { method: "POST" });
    const data = await response.json();

    if (data.error) {
      showToast(data.error, "error");
      return;
    }

    appendLog(data.message, "warn");
    showToast(data.message, "info");

    await fetchNodes();
  } catch (error) {
    console.error("Error removing node:", error);
    showToast("Failed to remove node", "error");
  }
}

async function resetAll() {
  try {
    const response = await fetch(`${API_URL}/reset`, { method: "POST" });
    const data = await response.json();

    appendLog(data.message, "info");
    showToast(data.message, "info");

    await fetchNodes();
  } catch (error) {
    console.error("Error resetting:", error);
    showToast("Failed to reset", "error");
  }
}

sendBtn.addEventListener("click", sendRequest);

usernameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendRequest();
  }
});

addNodeBtn.addEventListener("click", addNode);
removeNodeBtn.addEventListener("click", removeNode);
resetBtn.addEventListener("click", resetAll);

const clearLogsBtn = document.getElementById("clear-logs-btn");
if (clearLogsBtn) clearLogsBtn.addEventListener("click", clearLogs);

fetchNodes();
