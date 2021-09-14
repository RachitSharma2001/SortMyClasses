chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.greeting === "hello"){
        //sendResponse({returned_json : "Returned a json"});
        fetch('https://www.ratemyprofessors.com/ShowRatings.jsp?tid=786121')
            .then(response => response.text())
            .then(text => sendResponse({returned_text:text}))
            .catch(error => console.log("Error: " + error));
        return true;
      }
    }
  );

