console.log('popup.js is loaded');

// Create a connection to the background script
const port = chrome.runtime.connect({ name: 'popup' });

// Log the connection attempt
console.log('Attempting to connect to the background script');

// Send a message to fetch Gmail messages (this will now only trigger the background script to fetch and store messages)
port.postMessage({ type: 'FETCH_MESSAGES' });

// Function to display the messages in the popup
function displayMessages(messages) {
  console.log('Displaying messages:', messages);  // Log the messages to verify
  const messagesList = document.getElementById('messagesList');
  messagesList.innerHTML = ''; // Clear the current list

  if (messages.length === 0) {
    messagesList.innerHTML = '<li>No messages found.</li>';
  } else {
    messages.forEach((message) => {
      const listItem = document.createElement('li');
      listItem.classList.add('messageItem');

      // Create message content structure
      const subject = document.createElement('div');
      subject.classList.add('subject');
      subject.textContent = `Subject: ${message.subject}`;

      const sender = document.createElement('div');
      sender.classList.add('sender');
      sender.textContent = `From: ${message.from}`;

      const snippet = document.createElement('div');
      snippet.classList.add('snippet');
      snippet.textContent = `Snippet: ${message.snippet}`;

      listItem.appendChild(subject);
      listItem.appendChild(sender);
      listItem.appendChild(snippet);

      // Toggle selection on click
      listItem.addEventListener('click', () => {
        listItem.classList.toggle('selected');
      });

      messagesList.appendChild(listItem);
    });
  }
}

// Add event listener for "Archive Selected Email" button
// When archiving emails, ensure you're sending the correct messageId
document.getElementById('archiveButton').addEventListener('click', () => {
    const selectedMessages = document.querySelectorAll('.selected');
    selectedMessages.forEach((messageItem) => {
      const messageId = messageItem.textContent.trim();  // Get the message ID
      console.log("🚀 ~ selectedMessages.forEach ~ messageId:", messageId)
      console.log('Archiving message with ID:', messageId);  // Log the message ID
      port.postMessage({
        type: 'ARCHIVE_EMAIL',
        messageId: messageId,  // Send the messageId to the background script
      });
    });
  });
  

// Read messages from chrome.storage.local and display them
window.onload = function() {
  chrome.storage.local.get('gmailMessages', function(result) {
    if (result.gmailMessages && result.gmailMessages.length > 0) {
      displayMessages(result.gmailMessages);
    } else {
      console.log('No messages in chrome.storage.local.');
      document.getElementById('messagesList').innerHTML = '<li>No messages available.</li>';
    }
  });
};
