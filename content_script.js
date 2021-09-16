var TBA_RATING = 6;

// Observe when DOM changes, meaning user searched for new classes
function createObserver(target, profJson){
    console.log("Prof Json: " + profJson + " " + profJson["E_Fuchs"]);
    
    return new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            
            var allClasses = target.getElementsByClassName("data-item");
            var savedClassData = [];
            var profRatings = [];
            var profTids = [];
            
            for(var classIndex = 0; classIndex < allClasses.length; classIndex++){
                savedClassData.push(allClasses[classIndex].innerHTML);
                
                var profHrefs = allClasses[classIndex].getElementsByClassName("data-item-long active")[0].getElementsByClassName("float-left")[0].getElementsByClassName("clearfix")[0].getElementsByClassName("data-column")[4];
                var profName = getProfessorName(profHrefs);
                var profTid = getTid(profName, profJson);
                
                if(profTid != -1){
                    chrome.runtime.sendMessage({tid: "" + profTid}, async function(response) {
                        let parser = new DOMParser();
                        let doc = parser.parseFromString(response.returned_text, "text/html");
                        //console.log(doc);
                        //console.log(doc.getElementsByClassName("RatingValue__Numerator-qw8sqy-2 liyUjw")[0].innerHTML)
                        rating_div = doc.getElementsByClassName("RatingValue__Numerator-qw8sqy-2 liyUjw")[0];
                        if(rating_div != undefined){
                            profRating = rating_div.innerHTML;
                        }else{
                            profRating = -1;
                        }
                        
                        //console.log("Class index: " + savedClassIndex);
                        //addRatingToClass(allClasses[savedClassIndex], profRating);
                        profRatings.push(profRating);
                        //console.log("Added!")
                        // idea: just check to see if profRatings size == allClasses.length, and if so then call function to sort profRatings with index, and then 
                        // call function to switch html divs
                        if(profRatings.length == allClasses.length - 1){
                            console.log("Prof ratings length: " + profRatings.length);
                            console.log("ProfRatings: " + profRatings);
                            // Call function that takes in profRatings and sorts it, and then calls function to sort html divs 
                            
                        }
                        /*if(savedClassIndex == allClasses.length - 1){
                            console.log("Prof ratings length: " + profRatings.length);
                            console.log("ProfRatings: " + profRatings);
                            // Call function that takes in profRatings and sorts it, and then calls function to sort html divs 
                            
                        }*/
                    });
                }else{
                    profRatings.push(-1);
                }
                
            }
            
            console.log(profRatings)
            
            /*sortedClasses = sortRatings(profRatings);
            
            for(var classIndex = 0; classIndex < allClasses.length; classIndex++){
                allClasses[classIndex].innerHTML= savedClassData[sortedClasses[classIndex].classIndex];
            }*/
        });
    });
}
/*
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function until(condition) {
    while (!fn()) {
        await sleep(0)
    }
}
async function myFunction(number) {
    
    await until(() => flag == true)
}*/

function addRatingToClass(givenClass, profRating){
    var clearfix = givenClass.getElementsByClassName("data-item-long active")[0].getElementsByClassName("float-left")[0].getElementsByClassName("clearfix")[0];
    var classRating = document.createElement("div");
    classRating.innerHTML = '<p> Overall: ' + profRating + '</p>';
    clearfix.appendChild(classRating);
}

function sortRatings(profRatings){
    profRatings.sort(function compareProfs(profObjLeft, profObjRight){
        console.log("Left, right rating: " + profObjLeft.rating + ", " + profObjRight.rating);
        console.log("Left, right class index: " + profObjLeft.classIndex + ", " + profObjRight.classIndex);

        if(profObjLeft.rating < profObjRight.rating){
            return -1;
        }
        return 0;
    });
    return profRatings;
}

function getProfRating(profTid){
    if(profTid == -1){
        return TBA_RATING;
    }
    var profRating = -1;
    chrome.runtime.sendMessage({tid: "" + profTid}, function(response) {
        let parser = new DOMParser();
        let doc = parser.parseFromString(response.returned_text, "text/html");
        console.log(doc);
        console.log(doc.getElementsByClassName("RatingValue__Numerator-qw8sqy-2 liyUjw")[0].innerHTML)
        profRating = doc.getElementsByClassName("RatingValue__Numerator-qw8sqy-2 liyUjw")[0].innerHTML;
    });
    /*if(profRating == -1){
        setTimeout(getProfRating, 300);
    }else{
        return profRating;
    }*/
}

function getTid(profName, profJson){
    if(profName == null){
        return -1;
    }
    var profNameInFormat = getNameInFormat(profName);
    return profJson[profNameInFormat];
}

function getNameInFormat(profName){
    return profName.replace(". ", "_");
}

function hasRMPLink(profInnerHtml){
    return profInnerHtml.includes("(<a href");
}

/* Assumes profInnerHtml contains an RMP Link */
function getOnlyName(profInnerHtml){
    return profInnerHtml.substring(0, profInnerHtml.indexOf("(<a href")-1);
}

/* Assumes that hasRMPLink of profInner Html is true*/
function extractNameFromHtml(firstProf){
    var givenProf = firstProf;
    if(hasRMPLink(givenProf)){
        givenProf = getOnlyName(givenProf);
    }
    return givenProf;
}

function getProfessorName(profHrefs){
    var profTags = profHrefs.getElementsByTagName("a");

    /* Later, be able to return all the professors of a class
    for(i = 0; i < profTags.length; i++){
        var profName = profHrefs.getElementsByTagName("a")[i].innerHTML;
        
    }*/
    if(profTags.length > 0){
        var profName = extractNameFromHtml(profTags[0].innerHTML);
        return getNameInFormat(profName);
    }
    return null;
}

function detectSearchChange(profJson){
    var genericConfig = { attributes: true, childList: true, characterData: true };
    var inlineTarget = document.getElementById("inlineCourseResultsDiv");
    var inlineObserver = createObserver(inlineTarget, profJson);
    inlineObserver.observe(inlineTarget, genericConfig);
}

const url = chrome.runtime.getURL('ProfTids.txt');
fetch(url)
.then((response) => response.json()) //assuming file contains json
.then((json) => detectSearchChange(json));

/*
// Add Rating header
            var rating_header = document.createElement("div");
            rating_header.innerHTML = '<div class="data-column column-header align-left" style="width:18%;"> Ratings </div>';
            document.getElementById("inlineCourseResultsContainer").getElementsByClassName("data-container-header")[0].getElementsByClassName("data-header-long data-row clearfix")[0].getElementsByClassName("float-left").appendChild(rating_header);

*/


/* Getting Professor Rating
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
*/