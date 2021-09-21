// Observe when DOM changes, meaning user searched for new classes
/*function createObserver(target, profJson, TBA_RATING){
    return new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
           
                
            }
        });
    });
}*/

// Global variable
var profRatings = [];

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

async function sortCurrentClasses(target, profJson, TBA_RATINGS, sortButtons, sortButtonIds){

    let messageReceived = new Promise(function(resolve, reject){
        var allClasses = target.getElementsByClassName("data-item");
        var savedClassData = [];
        var profRatings = [];
        var profTids = [];

        savedClassData = getDataFromHtml(allClasses);
        for(var classIndex = 0; classIndex < allClasses.length; classIndex++){
            var profHrefs = allClasses[classIndex].getElementsByClassName("data-item-long active")[0].getElementsByClassName("float-left")[0].getElementsByClassName("clearfix")[0].getElementsByClassName("data-column")[4];
            var profName = getProfessorName(profHrefs);
            var profTid = getTid(profName, profJson);

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

        console.log("Button ids: " + sortButtonIds[0] + " " + sortButtonIds[1]);

        changeHtmlOfDiv(document.getElementById(sortButtonIds[0]), "Sort By Overall Rating");
        changeHtmlOfDiv(document.getElementById(sortButtonIds[1]), "Sort By Difficulty Rating");
        document.getElementById(sortButtonIds[0]).onclick = () => {
            profRatings = sortRatings(profRatings, true);
            console.log("Inside on click, here are prof ratings:");
            for(var i = 0; i < profRatings.length; i++){
                console.log("Overall, class index: " + profRatings[i].overallRating + " " + profRatings[i].classIndex);
            }
            for(var i = 0; i < profRatings.length; i++){
                console.log(savedClassData[i].innerHTML);
            }
            allClasses = changeHtmlOfRows(savedClassData, profRatings, target.getElementsByClassName("data-item"));
        };
        document.getElementById(sortButtonIds[1]).onclick = () => {
            profRatings = sortRatings(profRatings, false);
            console.log("Inside on click, here are prof ratings:");
            for(var i = 0; i < profRatings.length; i++){
                console.log("Overall, class index: " + profRatings[i].diffRating + " " + profRatings[i].classIndex);
            }
            allClasses = changeHtmlOfRows(savedClassData, profRatings, target.getElementsByClassName("data-item"));
        };
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
            sortCurrentClasses(target, profJson, [-1, 6], sortButtons, sortButtonIds);
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
    //var profRatings = new Ratings();
    var inlineTarget = document.getElementById("inlineCourseResultsDiv");
    var inlineButtonIds = ["inlineOverall", "inlineDiff"];
    let inlineSortingButtons = createSortingButtons(inlineButtonIds);
    detectDomChange(inlineTarget, profJson, inlineSortingButtons, inlineButtonIds);
    addToView(document.getElementsByClassName("course-search-crn-title-container")[0], inlineSortingButtons);

    /*var outlineTarget = document.getElementById("courseResultsDiv");
    let outlineSortingButtons = createSortingButtons(outlineTarget//);
    var outlineSortOverall = outlineSortingButtons[0];
    var outlineSortDifficulty = outlineSortingButtons[1];
    detectDomChange(outlineTarget, outlineSortOverall, outlineSortDifficulty);
    var outlineSearchBar = document.getElementById("CoursesSearch").getElementsByClassName("modal-body")[0].getElementsByClassName("course-search-container")[0].getElementsByClassName("align-center")[0];
    addToView(outlineSearchBar, outlineSortOverall, outlineSortDifficulty);*/
});



/* 
    TODO:
    2. Why does sortOverallButton id undefined inside the sortCurrentClasses function?
        a. Somethign with async functions or is it stupid mistake?
        b. I want to replace teh document.getElementbyId stuff (or maybe we should keep it?)
    3.  Update outline with the stuff
    3.5 Clean up code and seperate stuff in sortCurrentClasses and detectDomChange and createObserver, into functions!
    4. Submit to chrome 
    4 Handle case when mulitple professors
    5. Clean up code
        a. Split into classes?
        b. Search up google chrome extension projects and see how they are organized
    6. Other:
        a. make faster -> see if its the message passsing with background thats taking the most time or if its the fetching thats taking a bunch of time
            i. If its message passing, see how to pass all the urls at once and get back all the ratings
            ii. If its fetching, see how to fetch a bunch of urls at once quickly
*/