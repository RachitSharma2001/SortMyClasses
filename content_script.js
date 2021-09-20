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

async function sortCurrentClasses(target, profJson, TBA_RATINGS, sortByOverall, sortButton){

    let messageReceived = new Promise(function(resolve, reject){
        var allClasses = target.getElementsByClassName("data-item");
        var savedClassData = [];
        var profRatings = [];
        var profTids = [];

        var origButtonHtml = sortButton.innerHTML;
        savedClassData = getDataFromHtml(allClasses);
        for(var classIndex = 0; classIndex < allClasses.length; classIndex++){
            var profHrefs = allClasses[classIndex].getElementsByClassName("data-item-long active")[0].getElementsByClassName("float-left")[0].getElementsByClassName("clearfix")[0].getElementsByClassName("data-column")[4];
            var profName = getProfessorName(profHrefs);
            var profTid = getTid(profName, profJson);

            console.log("Prof name and tid: " + profName + " " + profTid);

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
                        profRatings = sortRatings(profRatings, sortByOverall);
                            /*allClasses = changeHtmlOfRows(savedClassData, profRatings, allClasses);
                            changeHtmlOfDiv(sortButton, origButtonHtml);
                            console.log("Done, here are the sorted classes:");
                            printProfRating(profRatings);
                            console.log("Prof ratings length: " + profRatings.length);*/
                        resolve(profRatings);
                    }
                });
            }else{
                profRatings.push({overallRating : -1, diffRating : -1, classIndex : classIndex});
            }
        }
        if(profRatings.length == allClasses.length){
            resolve(profRatings);
        }
    });

    messageReceived.then((profRatings) => {
        changeHtmlOfDiv(sortButton, "Sort By Overall Rating");
        /*for(rating in profRatings){
            console.log(rating.overallRating);
        }*/
        sortButton.onclick = () => {
            //sortingButtonDifficulty.innerHTML = "Sort by Difficulty";
            console.log("Inside on click, here are prof ratings:");
            for(var i = 0; i < profRatings.length; i++){
                console.log("Overall, class index: " + profRatings[i].overallRating + " " + profRatings[i].classIndex);
            }
        };
    });
}

function createButton(buttonInnerHtml){
    var sortRatingButton = document.createElement('BUTTON');
    sortRatingButton.innerHTML = buttonInnerHtml
    return sortRatingButton;
}

/* Creates button prompting user to sort by overall rating, and then adds it to the user view (next to the search button) */
function createSortingButtons(target/*, profJson*/){
    var overallSortButton = createButton("Sort by Overall Rating");
    var diffSortButton = createButton("Sort by Difficulty");
    /*overallSortButton.onclick = () => {
        diffSortButton.innerHTML = "Sort by Difficulty";
        sortCurrentClasses(target, profJson, [-1, 6], true, overallSortButton);
    }
    diffSortButton.onclick = () => {
        overallSortButton.innerHTML = "Sort by Overall Rating";
        sortCurrentClasses(target, profJson, [-1, 6], false, diffSortButton);
    }*/
    return [overallSortButton, diffSortButton];
}

function createObserver(target, profJson, sortingButtonOverall, sortingButtonDifficulty, origOverallHtml, origDiffHtml){
    return new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            //changeHtmlOfDiv(sortingButtonOverall, origOverallHtml);
            //changeHtmlOfDiv(sortingButtonDifficulty, origDiffHtml);
            // Reset Professor Ratings now that search has reloaded 
            console.log("Resetting profRatings");
            profRatings = [];
            changeHtmlOfDiv(sortingButtonOverall, "Loading...");
            sortingButtonOverall.onclick = () => {
               console.log("Still need to load all classes");
            }
            changeHtmlOfDiv(sortingButtonDifficulty, "Loading...");
            sortingButtonDifficulty.onclick = () => {
               console.log("Still need to load all classes");
            }
            sortCurrentClasses(target, profJson, [-1, 6], true, sortingButtonOverall);
            /*messageReceived.then(() => {
                sortingButtonOverall.onclick = () => {
                    sortingButtonDifficulty.innerHTML = "Sort by Difficulty";
                    console.log("Here are prof ratings: " + profRatings)
                }
                sortingButtonDifficulty.onclick = () => {
                    sortingButtonOverall.innerHTML = "Sort by Overall Rating";
                    console.log("Here are prof ratings: " + profRatings)
                }
            });*/
        });
    });
}

function detectDomChange(target, profJson, sortingButtonOverall, sortingButtonDifficulty){
    var config = { attributes: true, childList: true, characterData: true };
    var observer = createObserver(target, profJson, sortingButtonOverall, sortingButtonDifficulty, sortingButtonOverall.innerHTML, sortingButtonDifficulty.innerHTML);
    observer.observe(target, config);
}

function addToView(parentDiv, overallSortDiv, diffSortDiv){
    parentDiv.appendChild(overallSortDiv);
    parentDiv.appendChild(diffSortDiv);
}

//sendMessage([2503455, 2585755]);
/*let messageReceived = sendMessage(2503455);
messageReceived.then((ratingsArr) => {
    console.log("First, Second: " + ratingsArr[0] + " " + ratingsArr[1]);
});*/
/*
let messageReceived = sendMessage(2503455);
messageReceived.then((doc) => {
    console.log("Doc: " + doc);
});
let messageReceived2 = sendMessage(2585755);
messageReceived2.then((doc) => {
    console.log("Doc: " + doc);
});*/
//console.log("Here is result: " + result.result);

const url = chrome.runtime.getURL('ProfTids.txt');
fetch(url)
.then((response) => response.json())
.then((profJson) => {
    //var profRatings = new Ratings();
    var inlineTarget = document.getElementById("inlineCourseResultsDiv");
    let inlineSortingButtons = createSortingButtons(inlineTarget/*, profJson*/);
    var inlineSortOverall = inlineSortingButtons[0];
    var inlineSortDifficulty = inlineSortingButtons[1];
    detectDomChange(inlineTarget, profJson, inlineSortOverall, inlineSortDifficulty);
    addToView(document.getElementsByClassName("course-search-crn-title-container")[0], inlineSortOverall, inlineSortDifficulty);

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
    2. Fix weird bug
        a. What we want to do is create a Ratings class that gets the ratings right when the dom changes (meaning a new class search occurs) or one of the buttons is clicked 
        for the first time since the dom changed. This is so that we never have to call fetch a second time (which is what causes our bug)
        b. Details on bug
            a. The bug is that, when we call fetch a second time after we dom changes, fetch returns an html that isn't really the html of the ratings page of that 
            professor, so we can't scrape for difficulty or overall ratings since that is not in that html (the returned html has 45 kb on second time compared to 
                250 the first time)
            b. I'm not sure the reason for this. It may be that when dom changes and page is reloaded, somehow there is something that changes that allows fetch to be called
            again.
            c. Or maybe when we call fetch the first time it never actually finished, so during the second time it returns teh last bit that wasn't finished from teh first time
            d. So maybe we should analyze more the 45 kb html that is returned the second time fetch is called. 
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