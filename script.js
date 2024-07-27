// LaunchControl App
const colorpicker = document.getElementById("colorpicker");
const hexColor = document.getElementById("hexColor");
const messageType = document.getElementById("messageType");
const messageValue = document.getElementById("messageValue");
const controls = document.querySelectorAll("#encoders button, #pads button");
let selectedControl = null;

controls.forEach((control) => {
  control.addEventListener("click", () => {
    if (selectedControl) {
      selectedControl.classList.remove("selected");
    }
    selectedControl = control;
    selectedControl.classList.add("selected");

    // If the control hasn't been set before, automatically set it to CC
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
hexColor.addEventListener("input", updateColorFromHex);
messageType.addEventListener("change", updateControlMessage);
messageValue.addEventListener("input", updateControlMessage);

function updateInspector() {
  if (selectedControl) {
    let color = selectedControl.style.backgroundColor;
    if (color) {
      colorpicker.value = rgbToHex(color);
      hexColor.value = colorpicker.value;
    } else {
      colorpicker.value = "#969696";
      hexColor.value = "#969696";
    }
    let [type, value] = selectedControl.textContent.split(" ");
    messageType.value = type === "--" ? "--" : type.toLowerCase();
    messageValue.value = value || "0";
    messageValue.disabled = messageType.value === "--";
  }
}

function updateControlColor() {
  if (selectedControl) {
    selectedControl.style.backgroundColor = colorpicker.value;
    hexColor.value = colorpicker.value;
  }
}

function updateColorFromHex() {
  if (hexColor.value.match(/^#[0-9A-Fa-f]{6}$/)) {
    colorpicker.value = hexColor.value;
    updateControlColor();
  }
}

function updateControlMessage() {
  if (selectedControl) {
    if (messageType.value === "--") {
      selectedControl.textContent = "--";
      messageValue.disabled = true;
    } else {
      selectedControl.textContent = `${messageType.value.toUpperCase()} ${
        messageValue.value
      }`;
      messageValue.disabled = false;
    }
  }
}

// Helper function to convert RGB to HEX
function rgbToHex(rgb) {
  if (!rgb) return "#969696";
  let [r, g, b] = rgb.match(/\d+/g);
  return (
    "#" +
    ((1 << 24) + (parseInt(r) << 16) + (parseInt(g) << 8) + parseInt(b))
      .toString(16)
      .slice(1)
  );
}

// Initialize with the first control selected
if (controls.length > 0) {
  selectedControl = controls[0];
  selectedControl.classList.add("selected");
  updateInspector();
}
