
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


var genericConfig = { attributes: true, childList: true, characterData: true };
var inlineTarget = document.getElementById("inlineCourseResultsDiv");
var inlineObserver = createObserver(inlineTarget);
inlineObserver.observe(inlineTarget, genericConfig);