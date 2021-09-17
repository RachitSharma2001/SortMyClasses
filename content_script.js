// Observe when DOM changes, meaning user searched for new classes
function createObserver(target, profJson, TBA_RATING){
    return new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            console.log("New Mutation");

            var allClasses = target.getElementsByClassName("data-item");
            var savedClassData = [];
            var profRatings = [];
            var profTids = [];
            
            console.log("all classes length: " + allClasses.length);
            for(var classIndex = 0; classIndex < allClasses.length; classIndex++){
                savedClassData.push(allClasses[classIndex].innerHTML);
                
                var profHrefs = allClasses[classIndex].getElementsByClassName("data-item-long active")[0].getElementsByClassName("float-left")[0].getElementsByClassName("clearfix")[0].getElementsByClassName("data-column")[4];
                var profName = getProfessorName(profHrefs);
                var profTid = getTid(profName, profJson);
                
                if(profTid != -1){
                    const savedClassIndex = classIndex
                    chrome.runtime.sendMessage({tid: "" + profTid}, async function(response) {
                        let parser = new DOMParser();
                        let doc = parser.parseFromString(response.returned_text, "text/html");

                        ratingDiv = doc.getElementsByClassName("RatingValue__Numerator-qw8sqy-2 liyUjw")[0];
                        //console.log("Class index: " + savedClassIndex + ", prof rating: " + profRating);
                        if(typeof ratingDiv === 'undefined'){
                            profRating = TBA_RATING;
                        }else{
                            profRating = ratingDiv.innerHTML;
                        }
                        
                        profRatings.push({rating : profRating, classIndex : savedClassIndex});
                        if(profRatings.length == allClasses.length){
                            profRatings = sortClasses(profRatings);
                            allClasses = changeHtmlOfRows(savedClassData, profRatings, allClasses);
                            console.log("Done, here are the sorted classes:");
                            printProfRating(profRatings);
                        }
                    });
                }else{
                    profRatings.push({rating : TBA_RATING, classIndex : classIndex});
                }
                
            }
        });
    });
}

function printProfRating(profRatings){
    for(let classIndex = 0; classIndex < profRatings.length; classIndex++){
        console.log("index, rating: " + profRatings[classIndex].classIndex + ", " + profRatings[classIndex].rating);
    }
}


function changeHtmlOfRows(savedClassData, sortedClasses, htmlOfClassRows){
    for(var classIndex = 0; classIndex < htmlOfClassRows.length; classIndex++){
        htmlOfClassRows[classIndex].innerHTML = savedClassData[sortedClasses[classIndex].classIndex];
    }
    return htmlOfClassRows;
}

function sortClasses(profRatings){
    return sortRatings(profRatings);
}

function addRatingToClass(givenClass, profRating){
    var clearfix = givenClass.getElementsByClassName("data-item-long active")[0].getElementsByClassName("float-left")[0].getElementsByClassName("clearfix")[0];
    var classRating = document.createElement("div");
    classRating.innerHTML = '<p> Overall: ' + profRating + '</p>';
    clearfix.appendChild(classRating);
}

function sortRatings(profRatings){
    profRatings.sort(function compareProfs(profObjLeft, profObjRight){
        if(profObjLeft.rating > profObjRight.rating){
            return -1;
        }
        return 0;
    });
    return profRatings;
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
    var inlineObserver = createObserver(inlineTarget, profJson, -1);
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