/* Functions not used yet */
function printProfRating(profRatings){
    for(let classIndex = 0; classIndex < profRatings.length; classIndex++){
        console.log("index, rating: " + profRatings[classIndex].classIndex + ", " + profRatings[classIndex].overallRating + ", " + profRatings[classIndex].diffRating);
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
function sortRatings(profRatings, sortByOverall){
    profRatings.sort(function compareProfs(profObjLeft, profObjRight){
        if(sortByOverall){
            if(profObjLeft.overallRating > profObjRight.overallRating){
                return -1;
            }
            return 0;
        }else{
            if(profObjLeft.diffRating < profObjRight.diffRating){
                return -1;
            }
            return 0;
        }
        
    });
    return profRatings;
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

// Gets the tid of the professor of the current class
function getTid(currClass, profJson){
    let profHrefs = currClass.getElementsByClassName("data-item-long active")[0].getElementsByClassName("float-left")[0].getElementsByClassName("clearfix")[0].getElementsByClassName("data-column")[4];
    let profName = getProfessorName(profHrefs)
    
    if(profName == null){
        return -1;
    }
    let profNameInFormat = getNameInFormat(profName);
    return profJson[profNameInFormat];
}

/* Scrapes from RMP */
function scrapeOverallRating(doc){
    return doc.getElementsByClassName("RatingValue__Numerator-qw8sqy-2 liyUjw")[0];
}

function scrapeDifficultyRating(doc){
    return doc.getElementsByClassName("FeedbackItem__FeedbackNumber-uof32n-1 kkESWs")[1];
}

async function sendMessage(profTid, OVERALL_TBA_RATING, DIFF_TBA_RATING){
    let messageReceived = new Promise(function(resolve, reject){
        // What if I send a bunch of fetches at the same time?
        chrome.runtime.sendMessage({tid: "" + profTid}, async function(response) {
            var parser = new DOMParser();
            var doc = parser.parseFromString(response.returned_text, "text/html");
            var overallRatingDiv = scrapeOverallRating(doc);
            var diffRatingDiv = scrapeDifficultyRating(doc);

            var overallRating = OVERALL_TBA_RATING;
            var diffRating = DIFF_TBA_RATING;
            if(typeof overallRatingDiv != 'undefined'){
                overallRating = overallRatingDiv.innerHTML;
            }
            if(typeof diffRatingDiv != 'undefined'){
                diffRating = diffRatingDiv.innerHTML;
            }
            
            resolve([overallRating, diffRating]);
        });
    });

    let result = await messageReceived;
    return result;
}

function getDataFromHtml(allClasses){
    var savedClasses = [];
    for(var classInd = 0; classInd < allClasses.length; classInd++){
        savedClasses.push(allClasses[classInd].innerHTML);
    }
    return savedClasses;
}

function sortOnButtonClick(target, button, profRatings, sortByOverall, allClasses, savedClassData){
    button.onclick = () => {
        profRatings = sortRatings(profRatings, sortByOverall);
        allClasses = changeHtmlOfRows(savedClassData, profRatings, target.getElementsByClassName("data-item"));
    };
}

async function sortCurrentClasses(target, profJson, TBA_RATINGS, sortButtonIds){

    let messageReceived = new Promise(function(resolve, reject){
        var allClasses = target.getElementsByClassName("data-item");
        var savedClassData = [];
        var profRatings = [];
        var profTids = [];

        for(var classIndex = 0; classIndex < allClasses.length; classIndex++){
            var profTid = getTid(allClasses[classIndex], profJson);

            if(profTid != -1){
                const savedClassIndex = classIndex;
                chrome.runtime.sendMessage({tid: "" + profTid}, async function(response) {
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(response.returned_text, "text/html");
                    var overallRatingDiv = scrapeOverallRating(doc);
                    var diffRatingDiv = scrapeDifficultyRating(doc);

                    var overallRating = TBA_RATINGS[0];
                    var diffRating = TBA_RATINGS[1];
                    if(typeof overallRatingDiv != 'undefined'){
                        overallRating = overallRatingDiv.innerHTML;
                    }
                    if(typeof diffRatingDiv != 'undefined'){
                        diffRating = diffRatingDiv.innerHTML;
                    }

                    profRatings.push({overallRating : overallRating, diffRating : diffRating, classIndex : savedClassIndex});
                    if(profRatings.length == allClasses.length){
                        resolve([profRatings, savedClassData, allClasses]);
                    }
                });
            }else{
                profRatings.push({overallRating : TBA_RATINGS[0], diffRating : TBA_RATINGS[1], classIndex : classIndex});
            }
        }
        if(profRatings.length == allClasses.length){
            resolve([profRatings, savedClassData, allClasses]);
        }
    });

    messageReceived.then((promiseArr) => {
        var profRatings = promiseArr[0];
        var savedClassData = promiseArr[1];
        var allClasses = promiseArr[2];
        var sortOverallButton = document.getElementById(sortButtonIds[0]);
        var sortDiffButton = document.getElementById(sortButtonIds[1]);
        
        changeHtmlOfDiv(sortOverallButton, "Sort By Overall Rating");
        changeHtmlOfDiv(sortDiffButton, "Sort By Difficulty Rating");
        sortOverallButton.onclick = () => {
            if(savedClassData.length == 0) savedClassData = getDataFromHtml(allClasses);
            profRatings = sortRatings(profRatings, true);
            allClasses = changeHtmlOfRows(savedClassData, profRatings, target.getElementsByClassName("data-item"));
        };
        sortDiffButton.onclick = () => {
            if(savedClassData.length == 0) savedClassData = getDataFromHtml(allClasses);
            profRatings = sortRatings(profRatings, false);
            allClasses = changeHtmlOfRows(savedClassData, profRatings, target.getElementsByClassName("data-item"));
        };
        //sortOnButtonClick(target, sortOverallButton, profRatings, true, allClasses, savedClassData);
        //sortOnButtonClick(target, sortDiffButton, profRatings, false, allClasses, savedClassData);
    });
}

function createButton(buttonInnerHtml, buttonId){
    var sortRatingButton = document.createElement('BUTTON');
    sortRatingButton.id = buttonId;
    sortRatingButton.innerHTML = buttonInnerHtml;
    return sortRatingButton;
}

/* Creates button prompting user to sort by overall rating, and then adds it to the user view (next to the search button) */
function createSortingButtons(sortButtonIds){
    var overallSortButton = createButton("Sort by Overall Rating", sortButtonIds[0]);
    var diffSortButton = createButton("Sort by Difficulty", sortButtonIds[1]);
    return [overallSortButton, diffSortButton];
}

function createObserver(target, profJson, sortButtons, sortButtonIds){
    return new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            profRatings = [];
            changeHtmlOfDiv(sortButtons[0], "Loading...");
            sortButtons[0].onclick = () => {
               console.log("Still need to load all classes");
            }
            changeHtmlOfDiv(sortButtons[1], "Loading...");
            sortButtons[1].onclick = () => {
               console.log("Still need to load all classes");
            }
            sortCurrentClasses(target, profJson, [-1, 6], sortButtonIds);
        });
    });
}

function detectDomChange(target, profJson, sortButtons, sortButtonIds){
    var config = { attributes: true, childList: true, characterData: true };
    var observer = createObserver(target, profJson, sortButtons, sortButtonIds);
    observer.observe(target, config);
}

function addToView(parentDiv, sortButtons){
    parentDiv.appendChild(sortButtons[0]);
    parentDiv.appendChild(sortButtons[1]);
}

const url = chrome.runtime.getURL('ProfTids.txt');
fetch(url)
.then((response) => response.json())
.then((profJson) => {
    let inlineTarget = document.getElementById("inlineCourseResultsDiv");
    let inlineButtonIds = ["inlineOverall", "inlineDiff"];
    let inlineSortingButtons = createSortingButtons(inlineButtonIds);
    detectDomChange(inlineTarget, profJson, inlineSortingButtons, inlineButtonIds);
    let inlineSearchBar = document.getElementsByClassName("course-search-crn-title-container")[0];
    addToView(inlineSearchBar, inlineSortingButtons);

    let outlineTarget = document.getElementById("courseResultsDiv");
    let outlineButtonIds = ["outlineOverall", "outlineDiff"];
    let outlineSortingButtons = createSortingButtons(outlineButtonIds);
    detectDomChange(outlineTarget, profJson, outlineSortingButtons, outlineButtonIds);
    let outlineSearchBar = document.getElementById("CoursesSearch").getElementsByClassName("modal-body")[0].getElementsByClassName("course-search-container")[0].getElementsByClassName("align-center")[0];
    addToView(outlineSearchBar, outlineSortingButtons);
});
