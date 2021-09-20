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
function sortRatings(profRatings, favorHigherRatings){
    profRatings.sort(function compareProfs(profObjLeft, profObjRight){
        if(favorHigherRatings){
            if(profObjLeft.rating > profObjRight.rating){
                return -1;
            }
            return 0;
        }else{
            if(profObjLeft.rating < profObjRight.rating){
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

/*
async function sendMessage(profTids){
    var promiseArr = [];
    for(profTid in profTids){
        let currPromise = new Promise(function(resolve, reject){
            chrome.runtime.sendMessage({tid: "" + profTid}, async function (response){
                console.log("We are in!");
                var parser = new DOMParser();
                var doc = parser.parseFromString(response.returned_text, "text/html");
                console.log("Here is doc: " + doc);
                console.log("Response: " + response.returned_text);
                var overallRatingDiv = scrapeOverallRating(doc);
                // diffRating = scrapeDifficultyRating(doc);
    
                var overallRating = -1;
                if(typeof overallRatingDiv != 'undefined'){
                    overallRating = overallRatingDiv.innerHTML;
                }
                resolve(overallRating);
            });
        });
        promiseArr.push(currPromise);
    }

    console.log("Promise array: " + promiseArr);
    Promise.all(promiseArr).then((values) => {
        console.log(values);
    });
}*/


async function sendMessage(profTid){
    let messageReceived = new Promise(function(resolve, reject){
        // What if I send a bunch of fetches at the same time?
        chrome.runtime.sendMessage({tid: "" + profTid}, async function(response) {
            var parser = new DOMParser();
            var doc = parser.parseFromString(response.returned_text, "text/html");
            var overallRatingDiv = scrapeOverallRating(doc);
            var diffRatingDiv = scrapeDifficultyRating(doc);

            var overallRating = -1;
            var diffRating = -1;
            if(typeof overallRatingDiv != 'undefined'){
                overallRating = overallRatingDiv.innerHTML;
            }
            if(typeof diffRatingDiv != 'undefined'){
                diffRating = diffRatingDiv.innerHTML;
            }
            
            resolve([overallRating, diffRating]);
            //resolve([scrapeOverallRating(doc), scrapeDifficultyRating(doc)]);
        });
    });

    let result = await messageReceived;
    return result;
}

async function getProfRatings(allClasses, profJson){
    for(var classIndex = 0; classIndex < allClasses.length; classIndex++){
        var profHrefs = allClasses[classIndex].getElementsByClassName("data-item-long active")[0].getElementsByClassName("float-left")[0].getElementsByClassName("clearfix")[0].getElementsByClassName("data-column")[4];
        var profName = getProfessorName(profHrefs);
        var profTid = getTid(profName, profJson);

        if(profTid != -1){
            const savedClassIndex = classIndex;
            let messageRecieved = new Promise(function(resolve, reject){
                chrome.runtime.sendMessage({tid: "" + profTid}, async function(response) {
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(response.returned_text, "text/html");
                    resolve(doc);
                });
            });
            let returnedHtml = await messageRecieved;
            var ratingDiv = null;
            if(sortByOverall){
                ratingDiv = scrapeOverallRating(returnedHtml);
                //console.log("Sorting by Overall");
            }else{
                ratingDiv = scrapeDifficultyRating(returnedHtml);
                //console.log("Sorting by Difficulty");
                //console.log("Rating div: " + ratingDiv);
                //console.log("Doc inner html: " + doc.DocumentNode.OuterHtml);
                //console.log("Returned text inner html: " + response.returned_text);
            } 

            if(typeof ratingDiv === 'undefined'){
                profRating = TBA_RATING;
            }else{
                profRating = ratingDiv.innerHTML;
                //console.log("Rating Divs inner html: " + ratingDiv.innerHTML);
            }
                
            profRatings.push({rating : profRating, classIndex : savedClassIndex});
            if(profRatings.length == allClasses.length){
                return profRatings;
            }
        }else{
            profRatings.push({rating : TBA_RATING, classIndex : classIndex});
        }
    }
}

function sortCurrentClasses(target, profJson, TBA_RATING, profRatings, sortByOverall, sortButton){
    var allClasses = target.getElementsByClassName("data-item");
    var savedClassData = [];
    var profRatings = [];
    var profTids = [];

    var origButtonHtml = sortButton.innerHTML;
    changeHtmlOfDiv(sortButton, "Loading...");

    if(profRatings.length == 0){
        profRatings = getProfRatings(allClasses, profJson);
    }

    profRatings = sortRatings(profRatings, sortByOverall);
    allClasses = changeHtmlOfRows(savedClassData, profRatings, allClasses);
    changeHtmlOfDiv(sortButton, origButtonHtml);
    console.log("Done, here are the sorted classes:");
    printProfRating(profRatings);

    return profRatings;
}

function createButton(buttonInnerHtml){
    var sortRatingButton = document.createElement('BUTTON');
    sortRatingButton.innerHTML = buttonInnerHtml
    return sortRatingButton;
}

/* Creates button prompting user to sort by overall rating, and then adds it to the user view (next to the search button) */
function createSortingButtons(target, profJson){
    var overallSortButton = createButton("Sort by Overall Rating");
    var diffSortButton = createButton("Sort by Difficulty");
    overallSortButton.onclick = () => {
        /*if(!profRatings.hasRatings()){
            profRatings.getRatings();
        }else{
            console.log("Has ratings: " + profRatings);
        }*/
        diffSortButton.innerHTML = "Sort by Difficulty";
        sortCurrentClasses(target, profJson, -1, true, overallSortButton);
    }
    diffSortButton.onclick = () => {
        /*if(!profRatings.hasRatings()){
            profRatings.getRatings();
        }else{
            console.log("Has ratings: " + profRatings);
        }*/
        overallSortButton.innerHTML = "Sort by Overall Rating";
        sortCurrentClasses(target, profJson, 6, false, diffSortButton);
    }
    return [overallSortButton, diffSortButton];
}

function createObserver(sortingButtonOverall, sortingButtonDifficulty, origOverallHtml, origDiffHtml){
    return new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            changeHtmlOfDiv(sortingButtonOverall, origOverallHtml);
            changeHtmlOfDiv(sortingButtonDifficulty, origDiffHtml);
            // Reset Professor Ratings now that search has reloaded 
            profRatings = [];
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

//sendMessage([2503455, 2585755]);
let messageReceived = sendMessage(2503455);
messageReceived.then((ratingsArr) => {
    console.log("First, Second: " + ratingsArr[0] + " " + ratingsArr[1]);
});
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
/*
const url = chrome.runtime.getURL('ProfTids.txt');
fetch(url)
.then((response) => response.json())
.then((profJson) => {
    //var profRatings = new Ratings();
    var inlineTarget = document.getElementById("inlineCourseResultsDiv");
    let inlineSortingButtons = createSortingButtons(inlineTarget, profJson);
    var inlineSortOverall = inlineSortingButtons[0];
    var inlineSortDifficulty = inlineSortingButtons[1];
    detectDomChange(inlineTarget, inlineSortOverall, inlineSortDifficulty);
    addToView(document.getElementsByClassName("course-search-crn-title-container")[0], inlineSortOverall, inlineSortDifficulty);

    var outlineTarget = document.getElementById("courseResultsDiv");
    let outlineSortingButtons = createSortingButtons(outlineTarget, profJson);
    var outlineSortOverall = outlineSortingButtons[0];
    var outlineSortDifficulty = outlineSortingButtons[1];
    detectDomChange(outlineTarget, outlineSortOverall, outlineSortDifficulty);
    var outlineSearchBar = document.getElementById("CoursesSearch").getElementsByClassName("modal-body")[0].getElementsByClassName("course-search-container")[0].getElementsByClassName("align-center")[0];
    addToView(outlineSearchBar, outlineSortOverall, outlineSortDifficulty);
});*/



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