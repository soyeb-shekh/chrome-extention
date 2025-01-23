// This function handles the OAuth2 authentication and token fetching.
function getAuthToken(callback) {
  try {
    chrome.identity.getAuthToken({ interactive: true }, function(token) {
      if (chrome.runtime.lastError || !token) {
        console.log('Error fetching token:', chrome.runtime.lastError);
        return;
      }
      callback(token);
    });
  } catch (error) {
    console.log('Error in getAuthToken:', error);
  }
}

// This function fetches the list of Gmail messages and their details.
function fetchMessages() {
  try {
    getAuthToken((token) => {
      fetch('https://www.googleapis.com/gmail/v1/users/me/messages', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token,
        },
      })
      .then(response => response.json())
      .then(async(data) => {
        if (data.messages) {
          console.log('Fetched messages:', data.messages);
          // Fetch details for each message
          const messageDetailsPromises = await data.messages.map(message => fetchMessageDetails(message.id, token));
          
          // Once all message details are fetched, store the result in chrome.storage.local
          Promise.all(messageDetailsPromises)
            .then(messages => {
              chrome.storage.local.set({ gmailMessages: messages }, function() {
                console.log('Messages stored in chrome.storage.local');
              });
            });
        }
      })
      .catch(error => {
        console.log('Error fetching messages:', error);
      });
    });
  } catch (error) {
    console.log('Error in fetchMessages:', error);
  }
}

// Fetch detailed message content
function fetchMessageDetails(messageId, token) {
  return fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token,
    },
  })
  .then(response => response.json())
  .then(messageData => {
    const headers = messageData.payload.headers;
    const subject = headers.find(header => header.name === 'Subject')?.value || 'No Subject';
    const from = headers.find(header => header.name === 'From')?.value || 'Unknown Sender';
    const snippet = messageData.snippet || 'No Snippet Available';
    
    return {
      id: messageData.id,
      subject: subject,
      from: from,
      snippet: snippet,
    };
  })
  .catch(error => {
    console.log('Error fetching message details:', error);
    return { id: messageId, subject: 'Error fetching subject', from: 'Error', snippet: 'Error fetching snippet' };
  });
}

// Define archiveEmail function at the top
function archiveEmail(messageId) {
  console.log("🚀 ~ archiveEmail ~ messageId:", messageId)
  try {
    getAuthToken((token) => {
      const url = `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`;
      const body = {
        // removeLabelIds: ['INBOX'],  // Remove from the inbox (archive the email)
      };

      fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      .then(response => response.json())
      .then(data => {
        console.log('Email archived:', data);
      })
      .catch(error => {
        console.log('Error archiving email:', error);
      });
    });
  } catch (error) {
    console.log('Error in archiveEmail:', error);
  }
}

// Now listen for messages and handle actions
chrome.runtime.onConnect.addListener((port) => {
  console.log('Popup connected');
  
  port.onMessage.addListener((message) => {
    if (message.type === 'ARCHIVE_EMAIL') {
      // Archive the email when requested
      archiveEmail(message.messageId);  // Call archiveEmail here
    }
  });
});

// Listen for messages or connections from popup
chrome.runtime.onConnect.addListener((port) => {
  console.log('Popup connected');
  
  // Listen for messages sent by the popup
  port.onMessage.addListener((message) => {
    if (message.type === 'FETCH_MESSAGES') {
      // Fetch Gmail messages when requested by the popup
      fetchMessages();
    } else if (message.type === 'ARCHIVE_EMAIL') {
      // Archive the email when requested
      archiveEmail(message.messageId);
    }
  });
});

// Event listener for the installation of the extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed!');
  // You can call fetchMessages() here if you want to auto-fetch messages on installation
  fetchMessages();  
});