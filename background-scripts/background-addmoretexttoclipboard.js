(function() {
  // contextMenus
  function onCreated() {
    if (browser.runtime.lastError) {
      // console.log(`Error: ${browser.runtime.lastError}`);
    } else {
      // console.log("Item created successfully");
    }
  }
  function onError(error) {
    // console.log(`Error: ${error}`);
  }
  browser.contextMenus.create({
    id: "contextMenu_addmoretexttoclipboard",
    title: "Append",
    contexts: ["selection"]
  }, onCreated);
  browser.contextMenus.create({
    id: "contextMenu_addmoretexttoclipboard_withline",
    title: "Append with newline",
    contexts: ["selection"]
  }, onCreated);

  // main
  var isApending = false;
  var isClearing = false;
  var curData  = "";
  var copyedText = "";
  var isWithNewLine = false;

  browser.contextMenus.onClicked.addListener(function(info, tab) {
    // set input
    switch (info.menuItemId) {
    case "contextMenu_addmoretexttoclipboard":
      isWithNewLine = false;
      break;
    case "contextMenu_addmoretexttoclipboard_withline":
      isWithNewLine = true;
      break;
    }
    copyedText = info.selectionText;

    // main
    appendText();
  });

  browser.commands.onCommand.addListener(function(command) {
       // console.log('Command:', command);

       switch (command) {
       case "toggle-Append":
         isWithNewLine = false;
         break;
       case "toggle-Append-With-New-Line":
         isWithNewLine = true;
         break;
       }

       browser.tabs.query({currentWindow: true, active: true}).then(
         function (tabs) {
           var sending = browser.tabs.sendMessage(tabs[0].id, {text: "selection"});
           sending.then(response => {
             if (response.text) {
               copyedText = response.text;
               appendText();
             }
             else {
               clearClipboard();
             }

           }).catch(onError);

         }
       ).catch(onError);

  });

  function appendText() {
    // start append
    isApending = true;

    // create textarea
    var ta = document.createElement("textarea");
    ta.setAttribute("id", "appendTextarea")
    document.body.appendChild(ta);

    ta.focus();
    if (document.execCommand('paste')) {
      // console.log("pasted: ", curData);
      document.execCommand("copy");
    }

    // delete textarea
    ta.parentElement.removeChild(ta);

    // end append
    isApending = false;
  }

  function clearClipboard() {
    isClearing = true;
    document.execCommand("copy");
    isClearing = false;

    browser.notifications.create({
      "type": "basic",
      "iconUrl": browser.extension.getURL("icons/icon-addmoretexttoclipboard-64.png"),
      "title": "AddMoreTextToClipboard",
      "message": "Clear Clipboard!"
    });
  }

  document.addEventListener('paste', function(e) {
    if (isApending) {
      // console.log("fire paste");
      curData = e.clipboardData.getData("text/plain");
    }
  });

  document.addEventListener('copy', function(e) {
    if (isApending) {
      // console.log("fire Append");
      var data = "";
      if (isWithNewLine) {
        data = curData + newLine() + copyedText;
      }
      else {
        data = curData + copyedText;
      }
      e.clipboardData.setData('text/plain', data);
      e.preventDefault();
    }
    else if(isClearing) {
      var data = "";
      e.clipboardData.setData('text/plain', data);
      e.preventDefault();
    }
  });

  function newLine() {
    var platform = navigator.platform.toLowerCase();
    if (platform.indexOf('win') != -1) {
        return "\r\n";
    }
    else if (platform.indexOf('mac') != -1) {
        return "\r";
    }
    else {
        return "\n";
    }
  }
})();
