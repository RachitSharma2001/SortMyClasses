// Observe when DOM changes, meaning user searched for new classes
/*function createObserver(target, profJson, TBA_RATING){
    return new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
           
                
            }
        });
    });
}*/

/* Functions not used yet */
function printProfRating(profRatings){
    for(let classIndex = 0; classIndex < profRatings.length; classIndex++){
        console.log("index, rating: " + profRatings[classIndex].classIndex + ", " + profRatings[classIndex].rating);
    }
}


function hasRMPLink(profInnerHtml){
    return profInnerHtml.includes("(<a href");
}


function addRatingToClass(givenClass, profRating){
    var clearfix = givenClass.getElementsByClassName("data-item-long active")[0].getElementsByClassName("float-left")[0].getElementsByClassName("clearfix")[0];
    var classRating = document.createElement("div");
    classRating.innerHTML = '<p> Overall: ' + profRating + '</p>';
    clearfix.appendChild(classRating);
}

/* Function currently used */
function sortRatings(profRatings){
    profRatings.sort(function compareProfs(profObjLeft, profObjRight){
        if(profObjLeft.rating > profObjRight.rating){
            return -1;
        }
        return 0;
    });
    return profRatings;
}

function sortClasses(profRatings){
    return sortRatings(profRatings);
}

function changeHtmlOfRows(savedClassData, sortedClasses, htmlOfClassRows){
    for(var classIndex = 0; classIndex < htmlOfClassRows.length; classIndex++){
        htmlOfClassRows[classIndex].innerHTML = savedClassData[sortedClasses[classIndex].classIndex];
    }
    return htmlOfClassRows;
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

function getNameInFormat(profName){
    return profName.replace(". ", "_");
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

function getTid(profName, profJson){
    if(profName == null){
        return -1;
    }
    var profNameInFormat = getNameInFormat(profName);
    return profJson[profNameInFormat];
}

function sortCurrentClasses(target, profJson, TBA_RATING){
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
}

function createButton(buttonInnerHtml){
    var sortRatingButton = document.createElement('div');
    sortRatingButton.innerHTML = '<button type = "button">' + buttonInnerHtml + '</button>';
    return sortRatingButton;
}

/* Creates button prompting user to sort by overall rating, and then adds it to the user view (next to the search button) */
function sortByOverall(target, profJson, TBA_RATING){
    var overallSort = createButton('Sort by Overall Rating');
    overallSort.onclick = () => {
        sortCurrentClasses(target, profJson, TBA_RATING);
    }
    document.getElementsByClassName("course-search-crn-title-container")[0].appendChild(overallSort);
    // target.getElementsByClassName("course-search-crn-title-container")[0].innerHtml += overallSort.innerHtml;
}

/*
const url = chrome.runtime.getURL('ProfTids.txt');
fetch(url)
.then((response) => response.json()) //assuming file contains json
.then((profJson) => {
    var inlineTarget = document.getElementById("inlineCourseResultsDiv");
    sortByOverall(inlineTarget, profJson, -1);
    document.getEle
});*/

var buttonDiv = createButton("It worked!");
document.getElementById("CoursesSearch").getElementsByClassName("modal-body")[0].getElementsByClassName("course-search-container")[0].getElementsByClassName("align-center")[0].innerHTML += buttonDiv.innerHTML;

// <button type="button" class="btn btn-primary" onclick=

/*
    We want to insert the sort button into:
        <div class="modal-footer align-center">
			<button type="button"  class="btn closer btn-close">Close</button>
			<button type="button" class="btn btn-clear" onClick="javascript:UCD.SAOT.COURSES_SEARCH.clearFilters();">Clear</button>
			<button type="button" class="btn btn-primary" onClick="javascript:UCD.SAOT.COURSES_SEARCH.textSearch();">Search</button>
	    </div>
*/

/* 
    TODO:
    1. Add button to sort by overall rating in the advanced search options
        a. We need to figure out what exackly gets added to the DOM tree when we click add/search courses
        b. What I know so far is that all of the buttons(Close, Clear, Search) and the advanced course options actually exist even when the added/search courses button is 
        not clicked
        c. So when the add/search courses button is clicked, somehow those go from invisible to visible
        d. There are actually no changes to the DOM tree when the add/search courses button is clicked (we've tested this with mutation observer)
        e. So how do we detect when that button is clicked -> essentially, how do we detect when all those things that are defined for the popup (close, search, advanced options) 
        go from invisible to visible?
        f. Search up how to do this in js
    2. Add functionality that detects if user clicked search button after clicked our button to sort classes (so that we can stop the process and prevent schedule builder 
        from crashing)
    3. Add a loading bar that moves until the classes are loaded (copy their code for when they load -> they have a loading circle on the search button)
    4. Add a sort by easiest button 
    5. Make the buttons prettier 
    6. Clean up code
        a. Split into classes?
    7. Other:
        a. make faster -> see if its the message passsing with background thats taking the most time or if its the fetching thats taking a bunch of time
            i. If its message passing, see how to pass all the urls at once and get back all the ratings
            ii. If its fetching, see how to fetch a bunch of urls at once quickly
*/