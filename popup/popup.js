browser.tabs.query({active: true, currentWindow: true}).then((tabInfo) => {
  let toggle = document.getElementById("annotationToggle");
  console.log(tabInfo);

  let annkey = tabInfo[0].url;
  console.log("Key is", annkey);

  // Initialize checkbox
  function setCheckbox() {
    let currentStorage = browser.storage.local.get(annkey);
    currentStorage
      .then((obj) => {
        let existing = obj[annkey] || { }
        toggle.checked = existing?.enabled || false;
      });
  }

  function updateStorage(updates) {
    let storage = browser.storage.local.get(annkey);
    storage
      .then((obj) => {
        console.log("Current Storage", obj);
        let existing = obj[annkey] || { }
        let merged = {...existing, ...updates};
        browser.storage.local.set({
          [annkey]: merged,
        });
        console.log("Updated ", updates);
      })
      .catch((e) => {
        console.log("Could not set key", e);
      });
  }

  function loadContentScripts() {
    browser.tabs
      .executeScript({ file: "/libs.min.js" })
      .then(() => {
        console.log("Loaded libs");
        browser.tabs.insertCSS(tabInfo[0].id, {file: "/annotator.min.css"}).then(() => {
          browser.tabs
            .executeScript({ file: "/index.js" })
            .then(() => {
              console.log("Loaded plugin");
            }, (e) =>  { console.log(e) } );
        }, (err) => { console.log("Can't load css", err) });
      }, (e) => {
        console.error(e);
      });
  }

  function toggleAnnotator() {
    console.log("toggling");
    let storage = browser.storage.local.get(annkey);
    storage.then((obj) => {
      if (toggle.checked) {
        loadContentScripts();
      } else {
        browser.tabs
          .executeScript({
            code: "Annotator._instances.forEach((v) => { v.destroy(); });",
          })
          .then(() => {
            browser.tabs.removeCSS(tabInfo[0].id, {file: "/annotator.min.css"}).then(() => {
              console.log("Annotator is unloaded");
            });
          })
          .catch((e) => {
            console.error(e);
          });
      }
      updateStorage({ enabled: toggle.checked });
    }, (err) => { console.log("Could not access storage", err) });
  }

  setCheckbox();
  toggle.addEventListener("click", toggleAnnotator);
});
