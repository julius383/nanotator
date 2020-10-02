Annotator.Plugin.CustomStore = (function () {
  function CustomStore(element, options) {
    this.element = element;
    this.options = options;
    console.log("CustomStore annotator plugin");
  }

  function onError(err) {
    console.error(err);
  }

  function storeAnnotation(key, annotation) {
    delete annotation.highlights;
    let current = browser.storage.local.get(key);
    console.log(`Storing annotation in ${key}`);
    console.log(annotation);
    current.then((obj) => {
      console.log(obj);
      let anns, enabled;
      if (obj[key] === undefined) {
        anns = [annotation];
        enabled = false;
      } else {
        anns = obj[key]?.annotations || []
        anns.push(annotation);
        enabled = obj[key].enabled;
      }
      browser.storage.local.set({ [key] : {annotations: anns, enabled: enabled } }).then(() => {
        console.log("Stored new annotation");
      }, onError);
    }, onError);
  }

  CustomStore.prototype.pluginInit = function () {
    // Check if annotator is working
    if (!Annotator.supported()) {
      return;
    }
    // annotations are specific to a site so use url as key
    let annkey = window.location.toString();
    let existingAnnotations = browser.storage.local.get(annkey);
    existingAnnotations.then((results) => {
      console.log(`Initializing annotations ${annkey}`);
      console.log(browser.storage.local);
      this.annotator.loadAnnotations(results[annkey] !== undefined ? results[annkey].annotations : []);
    });
    // console.log(this);
    console.log("Initialized with annotator: ", this.annotator);
    this.annotator.on(
      "annotationCreated",
      function (ann) {
        storeAnnotation(annkey, ann);
      },
      onError
    );
  }

  return CustomStore;
})();

function initializeAnnotator() {
  let ann = new Annotator(document.body);
  console.log("Annotator instances", Annotator._instances);
  ann.addPlugin("Filter");
  ann.addPlugin("Tags");
  ann.addPlugin("CustomStore");
}

initializeAnnotator();
