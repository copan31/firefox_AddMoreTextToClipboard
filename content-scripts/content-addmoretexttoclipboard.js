(function () {
  browser.runtime.onMessage.addListener((message) => {
    // Get selected text
    var selectedString="";
    selectedString = window.getSelection().toString();
    if (!selectedString) {
      var selectedTextArea = document.activeElement;
      
      try {
        selectedString = selectedTextArea.value.substring(selectedTextArea.selectionStart, selectedTextArea.selectionEnd);
      }
      catch(e) {
        // console.log(e);
      }
    }

    // send selected text to search on background
    // console.log(selectedString);
    return Promise.resolve({text: selectedString});
  });
})();
