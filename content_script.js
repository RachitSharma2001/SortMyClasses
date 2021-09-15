var TBA_RATING = 6;

// Observe when DOM changes, meaning user searched for new classes
function createObserver(target, profJson){
    console.log("Prof Json: " + profJson + " " + profJson["E_Fuchs"]);
    
    return new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            var allClasses = target.getElementsByClassName("data-item");
            var savedClassData = [];
            var profRatings = [];

            
            for(var classIndex = 0; classIndex < allClasses.length; classIndex++){
                savedClassData.push(allClasses[classIndex].innerHTML);
                
                var profHrefs = allClasses[classIndex].getElementsByClassName("data-item-long active")[0].getElementsByClassName("float-left")[0].getElementsByClassName("clearfix")[0].getElementsByClassName("data-column")[4];
                var profName = getProfessorName(profHrefs);
                var profTid = getTid(profName, profJson);
                var profScore = getProfRating(profTid);
                
                console.log("Professor score: " + profScore);
                /*var profObj = {rating : profScore, classIndex : classIndex};
                profRatings.push(profObj);*/
            } 
            /*sortedClasses = sortRatings(profRatings);
            
            for(var classIndex = 0; classIndex < allClasses.length; classIndex++){
                allClasses[classIndex].innerHTML= savedClassData[sortedClasses[classIndex].classIndex];
            }*/
        });
    });
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