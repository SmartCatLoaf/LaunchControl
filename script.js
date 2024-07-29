// LaunchControl App
const colorpicker = document.getElementById("colorpicker");
const colorValue = document.getElementById("colorValue");
const messageType = document.getElementById("messageType");
const messageValue = document.getElementById("messageValue");
const controls = document.querySelectorAll("#encoders button, #pads button");
const menuToggle = document.getElementById("menuToggle");
const settingsToggle = document.getElementById("settingsToggle");
const menuPanel = document.getElementById("menuPanel");
const settingsPanel = document.getElementById("settingsPanel");
const closeMenu = document.getElementById("closeMenu");
const closeSettings = document.getElementById("closeSettings");
const themeSwitch = document.getElementById("themeSwitch");
const accentColor = document.getElementById("accentColor");
const colorFormat = document.getElementById("colorFormat");
const inspectTitle = document.querySelector("#inspect h2");
let selectedControl = null;

controls.forEach((control) => {
  control.addEventListener("click", () => {
    if (selectedControl) {
      selectedControl.classList.remove("selected");
    }
    selectedControl = control;
    selectedControl.classList.add("selected");
    if (selectedControl.textContent === "--") {
      selectedControl.textContent = "CC 0";
      messageType.value = "cc";
      messageValue.value = "0";
      messageValue.disabled = false;
    }
    updateInspector();
  });
});

colorpicker.addEventListener("input", updateControlColor);
colorValue.addEventListener("input", updateColorFromValue);
messageType.addEventListener("change", updateControlMessage);
messageValue.addEventListener("input", updateControlMessage);

menuToggle.addEventListener("click", () => {
  menuPanel.classList.toggle("visible");
});

settingsToggle.addEventListener("click", () => {
  settingsPanel.classList.toggle("visible");
});

closeMenu.addEventListener("click", () => {
  menuPanel.classList.remove("visible");
});

closeSettings.addEventListener("click", () => {
  settingsPanel.classList.remove("visible");
});

themeSwitch.addEventListener("change", () => {
  document.documentElement.classList.toggle("dark-mode");
  updateAccentColor();
});

accentColor.addEventListener("input", () => {
  document.documentElement.style.setProperty(
    "--accent-color",
    accentColor.value
  );
});

colorFormat.addEventListener("change", updateInspector);

function updateInspector() {
  if (selectedControl) {
    let controlType = selectedControl.id.startsWith("enc") ? "Encoder" : "Pad";
    let controlNumber = selectedControl.id.replace(/\D/g, "");
    inspectTitle.textContent = `Inspect: ${controlType} ${controlNumber}`;

    let color = selectedControl.style.backgroundColor;
    if (color) {
      colorpicker.value = rgbToHex(color);
      updateColorValue(color);
    } else {
      colorpicker.value = "#969696";
      updateColorValue("#969696");
    }
    let [type, value] = selectedControl.textContent.split(" ");
    messageType.value = type === "--" ? "--" : type.toLowerCase();
    messageValue.value = value || "0";

    let isNone = messageType.value === "--";
    let isEncoder = selectedControl.id.startsWith("enc");

    colorpicker.parentElement.style.display =
      isNone || isEncoder ? "none" : "block";
    colorValue.parentElement.style.display =
      isNone || isEncoder ? "none" : "block";
    messageValue.disabled = isNone;

    if (isEncoder) {
      messageType.innerHTML = `
        <option value="--">None</option>
        <option value="cc">Control Change (CC)</option>
      `;
    } else {
      messageType.innerHTML = `
        <option value="--">None</option>
        <option value="cc">Control Change (CC)</option>
        <option value="pc">Program Change (PC)</option>
        <option value="nn">Note Number (NN)</option>
      `;
    }
  }
}

function updateControlColor() {
  if (selectedControl && !selectedControl.id.startsWith("enc")) {
    selectedControl.style.backgroundColor = colorpicker.value;
    updateColorValue(colorpicker.value);
  }
}

function updateColorFromValue() {
  if (isValidColor(colorValue.value) && !selectedControl.id.startsWith("enc")) {
    colorpicker.value = colorValue.value;
    updateControlColor();
  }
}

function updateControlMessage() {
  if (selectedControl) {
    if (messageType.value === "--") {
      selectedControl.textContent = "--";
      messageValue.disabled = true;
      colorpicker.parentElement.style.display = "none";
      colorValue.parentElement.style.display = "none";
    } else {
      selectedControl.textContent = `${messageType.value.toUpperCase()} ${
        messageValue.value
      }`;
      messageValue.disabled = false;
      if (!selectedControl.id.startsWith("enc")) {
        colorpicker.parentElement.style.display = "block";
        colorValue.parentElement.style.display = "block";
      }
    }
  }
}

function updateColorValue(color) {
  switch (colorFormat.value) {
    case "hex":
      colorValue.value = rgbToHex(color);
      break;
    case "rgb":
      colorValue.value = color;
      break;
    case "hsl":
      colorValue.value = rgbToHsl(color);
      break;
  }
}

function rgbToHex(rgb) {
  if (!rgb) return "#969696";
  if (rgb.startsWith("#")) return rgb;
  let [r, g, b] = rgb.match(/\d+/g);
  return (
    "#" +
    ((1 << 24) + (parseInt(r) << 16) + (parseInt(g) << 8) + parseInt(b))
      .toString(16)
      .slice(1)
  );
}

function rgbToHsl(rgb) {
  let [r, g, b] = rgb.match(/\d+/g).map((x) => x / 255);
  let max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(
    l * 100
  )}%)`;
}

function isValidColor(color) {
  let s = new Option().style;
  s.color = color;
  return s.color !== "";
}

// Initialize with the first control selected
if (controls.length > 0) {
  selectedControl = controls[0];
  selectedControl.classList.add("selected");
  updateInspector();
}

// Close panels when clicking outside
document.addEventListener("click", (event) => {
  if (!menuPanel.contains(event.target) && !menuToggle.contains(event.target)) {
    menuPanel.classList.remove("visible");
  }
  if (
    !settingsPanel.contains(event.target) &&
    !settingsToggle.contains(event.target)
  ) {
    settingsPanel.classList.remove("visible");
  }
});

// Update message type options
messageType.innerHTML = `
  <option value="--">None</option>
  <option value="cc">Control Change (CC)</option>
  <option value="pc">Program Change (PC)</option>
  <option value="nn">Note Number (NN)</option>
`;
