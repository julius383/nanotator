
function toggleAnnotator() {
  console.log("toggling");
  if (document.getElementById("annotationToggle").checked) {
    browser.tabs.executeScript({ file: "/libs.min.js" })
      .then(() => {
        console.log("Loaded libs");
        browser.tabs.executeScript({ file: "/index.js" })
          .then(() => { console.log("Loaded plugin"); })
          .catch((e) => { console.error(e); });
      })
      .catch((e) => { console.error(e); });
  } else {
    // Annotator._instances.forEach((v) => { v.destroy(); })
    browser.tabs.executeScript( {code: "Annotator._instances.forEach((v) => { v.destroy(); });"} )
      .then(() => { console.log("Annotator is unloaded"); })
      .catch((e) => { console.error(e); });
  }
}

document.getElementById("annotationToggle").addEventListener("click", toggleAnnotator);
