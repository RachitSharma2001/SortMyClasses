/* 
    TODO:
    1. We can change the html rows that represent the classes (and hence sort)
    2. We can scrape the rating of a professor 
    3. Now what we need to do:
        a. Make a function getProfessorNames which returns the names of all the professors
        b. Make a function that takes in a professor name and outputs tid
        c. Make a function to scrape rating of each professor
        d. Somehow sort the rating 
        e. Sort the html div elements to reflect the rating
        f. Show the rating on schedule builder (or don't show it if they also have that thing that shows rating)
            BTW, you are obviously allowed to use two extensions for same website, as we literally use the RMP thing and this for 
            schedule builder and both are applied. So someone using the green red extension thing can also use our rmp thing and also 
            use our sorting thing
*/
/*
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        fetch('https://www.ratemyprofessors.com/ShowRatings.jsp?tid=' + request.tid)
            .then(response => response.text())
            .then(text => sendResponse({returned_text:text}))
            .catch(error => console.log("Error: " + error));
        return true;
    }
  );*/
  /*
  let parser = new DOMParser();
        let doc = parser.parseFromString(response.returned_text, "text/html");
        console.log(doc);
        console.log(doc.getElementsByClassName("RatingValue__Numerator-qw8sqy-2 liyUjw")[0].innerHTML)*/
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        urls = request.urls;
        var parser = new DOMParser();
        Promise.all(urls.map(url => fetch(url)
            .then(response => response.text())
            .then(profHTML => parser.parseFromString(profHTML, "text/html").getElementsByClassName("RatingValue__Numerator-qw8sqy-2 liyUjw")[0].innerHTML)))
            .then(scores => sendResponse({returned_scors:scores}))
            .catch(error => console.log("Error: " + error))
        return true;
    }
  );
