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