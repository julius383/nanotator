
let ann = new Annotator(document.body);
console.log("Annotator instances", Annotator._instances);
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
      console.log("Current is");
      console.log(obj);
      let vals = obj[key];
      console.log(vals);
      if ($.isArray(vals)) {
        vals.push(annotation);
      } else {
        vals = [annotation];
      }
      browser.storage.local.set({ [key] : vals }).then(() => {
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
    let annotations;
    existingAnnotations.then((results) => {
      console.log("Initializing annotations");
      console.log(results[annkey]);
      console.log(results);
      this.annotator.loadAnnotations(results[annkey]);
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
  };

  return CustomStore;
})();

ann.addPlugin("Filter");
ann.addPlugin("Tags");
ann.addPlugin("CustomStore");

// ann.setupPlugins();
// console.log(ann);
