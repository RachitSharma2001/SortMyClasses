chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        fetch('https://www.ratemyprofessors.com/ShowRatings.jsp?tid=' + request.tid)
            .then(response => response.text())
            .then(text => sendResponse({returned_text:text}))
            .catch(error => console.log("Error: " + error));
        return true;
    }
  );

