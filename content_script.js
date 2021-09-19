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

function changeHtmlOfDiv(div, html){
    div.innerHTML = html;
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

/* Scrapes from RMP */
function scrapeOverallRating(doc){
    return doc.getElementsByClassName("RatingValue__Numerator-qw8sqy-2 liyUjw")[0];
}

function scrapeDifficultyRating(doc){
    return doc.getElementsByClassName("FeedbackItem__FeedbackNumber-uof32n-1 kkESWs")[1];
}

function sortCurrentClasses(target, profJson, TBA_RATING, sortByOverall, sortButton){
    var allClasses = target.getElementsByClassName("data-item");
    var savedClassData = [];
    var profRatings = [];
    var profTids = [];

    var origButtonHtml = sortButton.innerHTML;
    changeHtmlOfDiv(sortButton, "Loading...");

    console.log("What is sort by overall: " + sortByOverall);
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

                var ratingDiv = null;
                if(sortByOverall){
                    ratingDiv = scrapeOverallRating(doc);
                    console.log("Sorting by Overall");
                }else{
                    ratingDiv = scrapeDifficultyRating(doc);
                    console.log("Sorting by Difficulty");
                } 

                if(typeof ratingDiv === 'undefined'){
                    profRating = TBA_RATING;
                }else{
                    profRating = ratingDiv.innerHTML;
                    console.log("Rating Divs inner html: " + ratingDiv.innerHTML);
                }
                
                profRatings.push({rating : profRating, classIndex : savedClassIndex});
                if(profRatings.length == allClasses.length){
                    profRatings = sortClasses(profRatings);
                    allClasses = changeHtmlOfRows(savedClassData, profRatings, allClasses);
                    changeHtmlOfDiv(sortButton, origButtonHtml);
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
function createSortingButton(sortByText, target, profJson, TBA_RATING, sortByOverall){
    var overallSort = createButton(sortByText);
    overallSort.onclick = () => {
        sortCurrentClasses(target, profJson, TBA_RATING, sortByOverall, overallSort);
    }
    return overallSort;
}

function createObserver(sortingButtonOverall, sortingButtonDifficulty, origOverallHtml, origDiffHtml){
    return new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            changeHtmlOfDiv(sortingButtonOverall, origOverallHtml);
            changeHtmlOfDiv(sortingButtonDifficulty, origDiffHtml);
        });
    });
}

function detectDomChange(target, sortingButtonOverall, sortingButtonDifficulty){
    var config = { attributes: true, childList: true, characterData: true };
    var observer = createObserver(sortingButtonOverall, sortingButtonDifficulty, sortingButtonOverall.innerHTML, sortingButtonDifficulty.innerHTML);
    observer.observe(target, config);
}

function addToView(parentDiv, overallSortDiv, diffSortDiv){
    parentDiv.appendChild(overallSortDiv);
    parentDiv.appendChild(diffSortDiv);
}

const url = chrome.runtime.getURL('ProfTids.txt');
fetch(url)
.then((response) => response.json())
.then((profJson) => {
    var inlineTarget = document.getElementById("inlineCourseResultsDiv");
    var inlineSortOverall = createSortingButton("Sort By Overall Rating", inlineTarget, profJson, -1, true);
    var inlineSortDifficulty = createSortingButton("Sort by Difficulty", inlineTarget, profJson, -1, false);
    detectDomChange(inlineTarget, inlineSortOverall, inlineSortDifficulty);
    addToView(document.getElementsByClassName("course-search-crn-title-container")[0], inlineSortOverall, inlineSortDifficulty);

    /*var outlineTarget = document.getElementById("courseResultsDiv");
    var outlineSort = createSortingButton("Sort by Overall Rating", outlineTarget, profJson, -1);
    detectDomChange(outlineTarget, outlineSort);
    addToView(document.getElementById("CoursesSearch").getElementsByClassName("modal-body")[0].getElementsByClassName("course-search-container")[0].getElementsByClassName("align-center")[0], outlineSort)
    */
});

//var buttonDiv = createButton("It worked!");
//document.getElementById("CoursesSearch").getElementsByClassName("modal-body")[0].getElementsByClassName("course-search-container")[0].getElementsByClassName("align-center")[0].innerHTML += buttonDiv.innerHTML;

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
    2. Add a sort by easiest button 
    3. Make the buttons prettier 
    4 Handle case when mulitple professors
    5. Clean up code
        a. Split into classes?
        b. Search up google chrome extension projects and see how they are organized
    6. Other:
        a. make faster -> see if its the message passsing with background thats taking the most time or if its the fetching thats taking a bunch of time
            i. If its message passing, see how to pass all the urls at once and get back all the ratings
            ii. If its fetching, see how to fetch a bunch of urls at once quickly
*/