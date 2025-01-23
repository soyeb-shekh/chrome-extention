// devtools.js

chrome.devtools.panels.create(
    "Gmail Archive", // Panel name
    "icons/icon-16.png", // Optional icon
    "panel.html", // HTML file for the panel content
    function(panel) {
      // Optional: You can set up event listeners for the panel here
      console.log('DevTools panel created!');
    }
  );
  