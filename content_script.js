// /* Functions not used yet */
// function printProfRating(profRatings){
//     for(let classIndex = 0; classIndex < profRatings.length; classIndex++){
//         //console.log("index, rating: " + profRatings[classIndex].classIndex + ", " + profRatings[classIndex].overallRating + ", " + profRatings[classIndex].diffRating);
//     }
// }

// function hasRMPLink(profInnerHtml){
//     return profInnerHtml.includes("(<a href");
// }

// function addRatingToClass(givenClass, profRating){
//     var clearfix = givenClass.getElementsByClassName("data-item-long active")[0].getElementsByClassName("float-left")[0].getElementsByClassName("clearfix")[0];
//     var classRating = document.createElement("div");
//     classRating.innerHTML = '<p> Overall: ' + profRating + '</p>';
//     clearfix.appendChild(classRating);
// }

// /* Function currently used */
// function sortRatings(profRatings, sortByOverall){
//     profRatings.sort(function compareProfs(profObjLeft, profObjRight){
//         if(sortByOverall){
//             if(profObjLeft.overallRating > profObjRight.overallRating){
//                 return -1;
//             }else if(profObjLeft.overallRating < profObjRight.overallRating){
//                 return 1;
//             }
//             return 0;
//         }else{
//             if(profObjLeft.diffRating < profObjRight.diffRating){
//                 return -1;
//             }else if(profObjLeft.diffRating > profObjRight.diffRating){
//                 return 1;
//             }
//             return 0;
//         }
        
//     });
//     return profRatings;
// }

// function changeHtmlOfRows(savedClassData, sortedClasses, htmlOfClassRows){
//     for(var classIndex = 0; classIndex < htmlOfClassRows.length; classIndex++){
//         htmlOfClassRows[classIndex].innerHTML = savedClassData[sortedClasses[classIndex].classIndex];
//     }
//     return htmlOfClassRows;
// }

// function changeHtmlOfDiv(div, html){
//     //console.log("AT changeHtmlofDiv, here is given html, div, and div.innerHtml: " + html + ", " + div + ", " + div.innerHTML);
//     div.innerHTML = html;
// }

// /* Assumes profInnerHtml contains an RMP Link */
// function getOnlyName(profInnerHtml){
//     return profInnerHtml.substring(0, profInnerHtml.indexOf("(<a href")-1);
// }

// /* Assumes that hasRMPLink of profInner Html is true*/
// function extractNameFromHtml(firstProf){
//     var givenProf = firstProf;
//     if(hasRMPLink(givenProf)){
//         givenProf = getOnlyName(givenProf);
//     }
//     return givenProf;
// }

// function getNameInFormat(profName){
//     return profName.replace(". ", "_");
// }


// function getProfessorName(profHrefs){
//     var profTags = profHrefs.getElementsByTagName("a");

//     /* Later, be able to return all the professors of a class
//     for(i = 0; i < profTags.length; i++){
//         var profName = profHrefs.getElementsByTagName("a")[i].innerHTML;
        
//     }*/
//     if(profTags.length > 0){
//         var profName = extractNameFromHtml(profTags[0].innerHTML);
//         return getNameInFormat(profName);
//     }
//     return null;
// }

// // Gets the tid of the professor of the current class
// function getTid(currClass, profJson){
//     let profHrefs = currClass.getElementsByClassName("data-item-long active")[0].getElementsByClassName("float-left")[0].getElementsByClassName("clearfix")[0].getElementsByClassName("data-column")[4];
//     let profName = getProfessorName(profHrefs)
    
//     if(profName == null){
//         return -1;
//     }
//     let profNameInFormat = getNameInFormat(profName);
//     return profJson[profNameInFormat];
// }

// /* Scrapes from RMP */
// function scrapeOverallRating(doc){
//     return doc.getElementsByClassName("RatingValue__Numerator-qw8sqy-2 liyUjw")[0];
// }

// function scrapeDifficultyRating(doc){
//     return doc.getElementsByClassName("FeedbackItem__FeedbackNumber-uof32n-1 kkESWs")[1];
// }

// function getDataFromHtml(allClasses){
//     var savedClasses = [];
//     for(var classInd = 0; classInd < allClasses.length; classInd++){
//         savedClasses.push(allClasses[classInd].innerHTML);
//     }
//     return savedClasses;
// }

// function sortOnButtonClick(target, button, profRatings, sortByOverall, allClasses, savedClassData){
//     button.onclick = () => {
//         profRatings = sortRatings(profRatings, sortByOverall);
//         allClasses = changeHtmlOfRows(savedClassData, profRatings, target.getElementsByClassName("data-item"));
//     };
// }

// function getTidFromProfName(profName, profJson) {
//     if(profName == null){
//         return -1;
//     }
//     let profNameInFormat = getNameInFormat(profName);
//     return profJson[profNameInFormat];
// }

// function getProfNameFromInnerHtml(innerHtml) {
//     return innerHtml.substring(innerHtml.indexOf(">") + 1, innerHtml.indexOf("</a>"))
// }

// async function sortCurrentClasses(target, profJson, TBA_RATINGS, sortButtonIds){

//     let messageReceived = new Promise(function(resolve, reject){
//         var classes = document.getElementsByClassName("results-instructor") 
//         var savedClassData = [];
//         var profOverallRatings = [];
//         var profDiffRatings = [];

//         for(let classIndex = 0; classIndex < classes.length; classIndex++) {
//             var profName = classes[classIndex].textContent;
//             var profTid = getTidFromProfName(profName, profJson);
//             if(profTid != -1 && profTid != undefined){
//                 const savedClassIndex = classIndex;
//                 chrome.runtime.sendMessage({tid: "" + profTid}, async function(response) {
//                     var parser = new DOMParser();
//                     var doc = parser.parseFromString(response.returned_text, "text/html");
//                     var overallRatingDiv = scrapeOverallRating(doc);
//                     var diffRatingDiv = scrapeDifficultyRating(doc);

//                     var overallRating = TBA_RATINGS[0];
//                     var diffRating = TBA_RATINGS[1];
//                     if(typeof overallRatingDiv != 'undefined' && overallRatingDiv.innerHTML != 'N/A'){
//                         overallRating = overallRatingDiv.innerHTML;
//                     }
//                     if(typeof diffRatingDiv != 'undefined' && diffRatingDiv.innerHTML != 'N/A'){
//                         diffRating = diffRatingDiv.innerHTML;
//                     }

//                     //profRatings.push({overallRating : overallRating, diffRating : diffRating, classIndex : savedClassIndex});
//                     profOverallRatings.push({overallRating : overallRating, classIndex : savedClassIndex});
//                     profDiffRatings.push({diffRating: diffRating, classIndex : savedClassIndex});
//                     if(profOverallRatings.length == classes.length){
//                         profOverallRatings = sortRatings(profOverallRatings, true);
//                         profDiffRatings = sortRatings(profDiffRatings, false);
//                         resolve([profOverallRatings, profDiffRatings, savedClassData, document.getElementsByClassName("course-container")]);
//                     }
//                 });
//             }else{
//                 profOverallRatings.push({overallRating : TBA_RATINGS[0], classIndex : classIndex});
//                 profDiffRatings.push({diffRating: TBA_RATINGS[1], classIndex : classIndex});
//             }
//         } 
//         if(profOverallRatings.length == classes.length){
//             profOverallRatings = sortRatings(profOverallRatings, true);
//             profDiffRatings = sortRatings(profDiffRatings, false);
//             resolve([profOverallRatings, profDiffRatings, savedClassData, classes]);
//         }
//     });
//     // why don't we just store two versions of prof ratings, one for overall, one for diff, so we don't have to sort every time
//     messageReceived.then((promiseArr) => {
//         var profRatingsOverall = promiseArr[0];
//         var profRatingsDiff = promiseArr[1];
//         console.log("Overall ratings length: " + profRatingsOverall.length);
//         for(let i = 0; i < profRatingsOverall.length; i++) {
//             console.log(profRatingsOverall[i].overallRating)
//         }
//         var savedClassData = promiseArr[2];
//         var allClasses = promiseArr[3];
//         var sortOverallButton = document.getElementById(sortButtonIds[0]);
//         var sortDiffButton = document.getElementById(sortButtonIds[1]);
        
//         changeHtmlOfDiv(sortOverallButton, "Sort By Overall Rating");
//         changeHtmlOfDiv(sortDiffButton, "Sort By Difficulty Rating");
//         sortOverallButton.onclick = () => {
//             //console.log('Overall Clicked');
//             if(savedClassData.length == 0) savedClassData = getDataFromHtml(allClasses);
//             console.log("document get elements: " + document.getElementsByClassName("course-container").innerHTML)
//             allClasses = changeHtmlOfRows(savedClassData, profRatingsOverall, document.getElementsByClassName("course-container"));
//         };
//         sortDiffButton.onclick = () => {
//             if(savedClassData.length == 0) savedClassData = getDataFromHtml(allClasses);
//             allClasses = changeHtmlOfRows(savedClassData, profRatingsDiff, target.getElementsByClassName("data-item"));
//         };
//         //sortOnButtonClick(target, sortOverallButton, profRatings, true, allClasses, savedClassData);
//         //sortOnButtonClick(target, sortDiffButton, profRatings, false, allClasses, savedClassData);
//     });
// }

// function createButton(buttonInnerHtml, buttonId){
//     var sortRatingButton = document.createElement('BUTTON');
//     sortRatingButton.id = buttonId;
//     sortRatingButton.innerHTML = buttonInnerHtml;
//     return sortRatingButton;
// }

// function createSpace(){
//     var space = document.createTextNode( '\u00A0' );
//     return space;
// }

// /* Creates button prompting user to sort by overall rating, and then adds it to the user view (next to the search button) */
// function createSortingButtons(sortButtonIds){
//     var overallSortButton = createButton("Sort by Overall Rating", sortButtonIds[0]);
//     var diffSortButton = createButton("Sort by Difficulty", sortButtonIds[1]);
//     return [overallSortButton, diffSortButton];
// }

// function createObserver(target, profJson, sortButtons, sortButtonIds){
//     //console.log("At the function createObserver")
//     return new MutationObserver(function(mutations) {
//         mutations.forEach(function(mutation) {
//             profRatings = [];
//             //console.log("First call to changeHtmlOfDiv")

//             changeHtmlOfDiv(sortButtons[0], "Loading...");
//             sortButtons[0].onclick = () => {
//                //console.log("Still need to load all classes");
//             }

//             //console.log("Second call to changeHtmlOfDiv")
//             changeHtmlOfDiv(sortButtons[1], "Loading...");
//             sortButtons[1].onclick = () => {
//                //console.log("Still need to load all classes");
//             }
//             sortCurrentClasses(target, profJson, [-1, 6], sortButtonIds);
//         });
//     });
// }

// function detectDomChange(target, profJson, sortButtons, sortButtonIds){
//     var config = { attributes: true, childList: true, characterData: true };
//     var observer = createObserver(target, profJson, sortButtons, sortButtonIds);
//     observer.observe(target, config);
// }

// function addToView(parentDiv, sortButtons){
//     parentDiv.appendChild(sortButtons[0]);
//     parentDiv.appendChild(createSpace());
//     parentDiv.appendChild(sortButtons[1]);
// }

// const url = chrome.runtime.getURL('ProfTids.txt');
// fetch(url)
// .then((response) => response.json())
// .then((profJson) => {
//     let inlineTarget = document.getElementById("inlineCourseResultsDiv");
//     let inlineButtonIds = ["inlineOverall", "inlineDiff"];
//     let inlineSortingButtons = createSortingButtons(inlineButtonIds);
//     detectDomChange(inlineTarget, profJson, inlineSortingButtons, inlineButtonIds);
//     let inlineSearchBar = document.getElementsByClassName("course-search-crn-title-container")[0];
//     addToView(inlineSearchBar, inlineSortingButtons);

//     let outlineTarget = document.getElementById("courseResultsDiv");
//     let outlineButtonIds = ["outlineOverall", "outlineDiff"];
//     let outlineSortingButtons = createSortingButtons(outlineButtonIds);
//     detectDomChange(outlineTarget, profJson, outlineSortingButtons, outlineButtonIds);
//     let outlineSearchBar = document.getElementById("CoursesSearch").getElementsByClassName("modal-body")[0].getElementsByClassName("course-search-container")[0].getElementsByClassName("align-center")[0];
//     addToView(outlineSearchBar, outlineSortingButtons);
// });

// /* 
// TODO:
// 2.5 Fix rmp links
//     i. Images that are used in the public view are blurry - fix!
//     ii. Make it so that for every professor, only capitalizes first letter, removes dashes, and if three words in name like first middle last, 
//     tries first_middle_last, first_last, and middle_last (just to decrease chance that professor has rmp page but our thing can't find it)
// 3. Submit

// BTW:
// 1. It works no matter what order they install sortbyrating and rmplinks (rmp-link-disappearing-after-sort bug gone)
// 2. It works on mac 

// */


function createButton(buttonInnerHtml, buttonId){
    var sortRatingButton = document.createElement('BUTTON');
    sortRatingButton.id = buttonId;
    sortRatingButton.innerHTML = buttonInnerHtml;
    return sortRatingButton;
}

const url = chrome.runtime.getURL('ProfTids.txt');
fetch(url)
.then((response) => response.json())
.then((profJson) => {
    /* Two parts of this:
        1. Figure out where the schedule builder page stores instructor(s) -> grab all these instructors
        2. Then execute the following
        professorFetchList = []
        for i = 0; i < num professors; i++ {
            professorFetchList.push(new Promise(resolve, reject) {
                // code to go to background.js, which then fetches from rmp
                chrome.runtime.sendMessage({tid: "" + profTid}, ...)
            })
        }
        Promise.all(professorFetchList).then((htmlPageOfallProfessors) {
            for htmlPage in results {
                parse html in order to find where rating is
            }
        })
    */
    let inlineSearchBar = document.getElementsByClassName("course-search-crn-title-container")[0];
    let overallSortButton = createButton("Sort by Overall Rating", "inline");
    inlineSearchBar.appendChild(overallSortButton);
    overallSortButton.onclick = () => {
        let listOfProfDivs = document.getElementsByClassName("results-instructor");
        let profFetchList = []
        for(i = 0; i < listOfProfDivs.length; i++) {
            let profName = listOfProfDivs[i].getElementsByTagName("a")[0].innerHTML;
            let profTid = profJson[profName.replace(". ", "_")];
            profFetchList.push(new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({tid: "" + profTid}, async function(response) {
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(response.returned_text, "text/html");
                    var overallRatingDiv = doc.getElementsByClassName("RatingValue__Numerator-qw8sqy-2 liyUjw")[0];
                    var diffRatingDiv = doc.getElementsByClassName("FeedbackItem__FeedbackNumber-uof32n-1 kkESWs")[1];
                    let overallRating = undefined;
                    let diffRating = undefined;
                    if(typeof overallRatingDiv != 'undefined' && overallRatingDiv.innerHTML != 'N/A'){
                        overallRating = overallRatingDiv.innerHTML;
                    }
                    if(typeof diffRatingDiv != 'undefined' && diffRatingDiv.innerHTML != 'N/A'){
                        diffRating = diffRatingDiv.innerHTML;
                    }
                    resolve([overallRating, diffRating]);
                }); 
            }));
        }
        Promise.all(profFetchList).then((profRatings) => {
            for(i = 0; i < profRatings.length; i++) {
                console.log("Rating: " + profRatings[i]);
            }
        });
    }
});