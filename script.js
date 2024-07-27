// LaunchControl App

const colorpicker = document.getElementById("colorpicker");
const pad1 = document.getElementById("pad1");

function changeColor() {
  pad1.style.background = colorpicker.value;
}
