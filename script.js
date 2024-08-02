const controls = document.querySelectorAll("#encoders button, #pads button");
const messageType = document.getElementById("messageType");
const messageValue = document.getElementById("messageValue");
const colorpicker = document.getElementById("colorpicker");
const hexColor = document.getElementById("hexColor");
const themeSwitch = document.getElementById("themeSwitch");
const inspectTitle = document.getElementById("inspectTitle");
const colorControls = document.getElementById("colorControls");
const controlProperties = document.getElementById("controlProperties");
let selectedControl = null;

function initializeControls() {
  const encodersContainer = document.getElementById("encoders");
  const padsContainer = document.getElementById("pads");

  for (let i = 1; i <= 4; i++) {
    const encoder = document.createElement("button");
    encoder.id = `enc${i}`;
    encoder.className = "enc";
    encoder.textContent = "--";
    encodersContainer.appendChild(encoder);
  }

  for (let i = 1; i <= 32; i++) {
    const pad = document.createElement("button");
    pad.id = `pad${i}`;
    pad.textContent = "--";
    padsContainer.appendChild(pad);
  }

  document
    .querySelectorAll("#encoders button, #pads button")
    .forEach(addControlListener);
}

function addControlListener(control) {
  control.addEventListener("click", () => {
    if (selectedControl) selectedControl.classList.remove("selected");
    selectedControl = control;
    selectedControl.classList.add("selected");
    if (selectedControl.textContent === "--") {
      selectedControl.textContent = "CC 0";
    }
    updateInspector();
  });
}

function updateInspector() {
  if (selectedControl) {
    controlProperties.style.display = "flex";
    const controlType = selectedControl.id.startsWith("enc")
      ? "Encoder"
      : "Pad";
    const controlNumber = selectedControl.id.replace(/\D/g, "");
    inspectTitle.textContent = `Inspect: ${controlType} ${controlNumber}`;

    const [type, value] = selectedControl.textContent.split(" ");
    messageType.value = type === "--" ? "cc" : type.toLowerCase();
    messageValue.value = value || "0";

    if (selectedControl.id.startsWith("enc")) {
      messageType.innerHTML = `
        <option value="cc">Control Change (CC)</option>
        <option value="pc">Program Change (PC)</option>
        <option value="--">None</option>
      `;
      colorControls.style.display = "none";
    } else {
      messageType.innerHTML = `
        <option value="cc">Control Change (CC)</option>
        <option value="pc">Program Change (PC)</option>
        <option value="nn">Note Number (NN)</option>
        <option value="--">None</option>
      `;
      updateColorControls();
    }
  } else {
    resetInspect();
  }
}

function updateControlMessage() {
  if (selectedControl) {
    if (messageType.value === "--") {
      selectedControl.textContent = "--";
      messageValue.disabled = true;
      selectedControl.style.backgroundColor = "";
    } else {
      selectedControl.textContent = `${messageType.value.toUpperCase()} ${
        messageValue.value
      }`;
      messageValue.disabled = false;
    }
    updateColorControls();
  }
}

function updateColorControls() {
  const isEncoder = selectedControl.id.startsWith("enc");
  const isNone = messageType.value === "--";
  colorControls.style.display = !isEncoder && !isNone ? "flex" : "none";
  if (!isEncoder && !isNone) {
    const currentColor = selectedControl.style.backgroundColor || "#969696";
    colorpicker.value = rgbToHex(currentColor);
    hexColor.value = colorpicker.value;
  }
}

function rgbToHex(rgb) {
  if (rgb.startsWith("#")) return rgb;
  const [r, g, b] = rgb.match(/\d+/g);
  return "#" + ((1 << 24) + (+r << 16) + (+g << 8) + +b).toString(16).slice(1);
}

function toggleTheme() {
  document.documentElement.classList.toggle("dark-mode");
}

function resetInspect() {
  inspectTitle.textContent = "Inspect";
  controlProperties.style.display = "none";
}

messageType.addEventListener("change", updateControlMessage);
messageValue.addEventListener("input", () => {
  messageValue.value = Math.max(0, Math.min(127, messageValue.value));
  updateControlMessage();
});

colorpicker.addEventListener("input", () => {
  if (
    selectedControl &&
    !selectedControl.id.startsWith("enc") &&
    messageType.value !== "--"
  ) {
    selectedControl.style.backgroundColor = colorpicker.value;
    hexColor.value = colorpicker.value;
  }
});

hexColor.addEventListener("input", () => {
  if (/^#[0-9A-F]{6}$/i.test(hexColor.value)) {
    colorpicker.value = hexColor.value;
    selectedControl.style.backgroundColor = hexColor.value;
  }
});

themeSwitch.addEventListener("change", toggleTheme);

function closeAllPanels() {
  document.getElementById("menuPanel").style.transform = "translateX(-100%)";
  document.getElementById("settingsPanel").style.transform = "translateX(100%)";
}

document.body.addEventListener("click", closeAllPanels);

["menuPanel", "settingsPanel"].forEach((panelId) => {
  const panel = document.getElementById(panelId);
  panel.addEventListener("click", (e) => e.stopPropagation());
});

["menuToggle", "settingsToggle"].forEach((id) => {
  document.getElementById(id).addEventListener("click", (e) => {
    e.stopPropagation();
    const panelId = id.includes("menu") ? "menuPanel" : "settingsPanel";
    const panel = document.getElementById(panelId);
    panel.style.transform =
      panel.style.transform === "translateX(0px)" ? "" : "translateX(0px)";
  });
});

document.getElementById("closeMenu").addEventListener("click", (e) => {
  e.stopPropagation();
  document.getElementById("menuPanel").style.transform = "translateX(-100%)";
});

document.getElementById("closeSettings").addEventListener("click", (e) => {
  e.stopPropagation();
  document.getElementById("settingsPanel").style.transform = "translateX(100%)";
});

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  initializeControls();
  resetInspect();
  document.documentElement.classList.add("dark-mode");
  themeSwitch.checked = false;
});
