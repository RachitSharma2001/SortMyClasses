/*
// Observe when DOM changes, meaning user searched for new classes
function createObserver(target){
    return new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            var allClasses = target.getElementsByClassName("data-item");

            console.log("allclasses[0] inner html: " + allClasses[0].innerHTML);
            console.log("allclasses[1] inner html: " + allClasses[1].innerHTML);

            var saveFirstClass = allClasses[0].innerHTML;
            allClasses[0].innerHTML = allClasses[allClasses.length - 1].innerHTML;
            allClasses[allClasses.length - 1].innerHTML = saveFirstClass;
        });
    });
}

function detectSearchChange(){
    var genericConfig = { attributes: true, childList: true, characterData: true };
    var inlineTarget = document.getElementById("inlineCourseResultsDiv");
    var inlineObserver = createObserver(inlineTarget);
    inlineObserver.observe(inlineTarget, genericConfig);
}

function getProfessorName(){

}*/

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

chrome.runtime.sendMessage({tid: "786121"}, function(response) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(response.returned_text, "text/html");
    console.log(doc.getElementsByClassName("RatingValue__Numerator-qw8sqy-2 liyUjw")[0].innerHTML);
  });

  chrome.runtime.sendMessage({tid: "2585755"}, function(response) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(response.returned_text, "text/html");
    console.log(doc.getElementsByClassName("RatingValue__Numerator-qw8sqy-2 liyUjw")[0].innerHTML);
  });

  chrome.runtime.sendMessage({tid: "2503455"}, function(response) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(response.returned_text, "text/html");
    console.log(doc.getElementsByClassName("RatingValue__Numerator-qw8sqy-2 liyUjw")[0].innerHTML);
  });