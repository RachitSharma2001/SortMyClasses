const url = chrome.runtime.getURL('ProfTids.txt');
fetch(url)
.then((response) => response.json())
.then((profJson) => {
    let inlineOverallSortButton = createButton("Sort by Overall Rating", "inline");
    let inlineDiffSortButton = createButton("Sort by Difficulty Rating", "inline");
    let outlineOverallSortButton = createButton("Sort by Overall Rating", "outline");
    let outlineDiffSortButton = createButton("Sort by Difficulty Rating", "outline");

    addInlineSortButtonToView(inlineOverallSortButton);
    addInlineSortButtonToView(inlineDiffSortButton);
    addOutlineSortButton(outlineOverallSortButton);
    addOutlineSortButton(outlineDiffSortButton);

    inlineOverallSortButton.onclick = () => {   
        sortByOverallRating(profJson, inlineOverallSortButton)
    }

    inlineDiffSortButton.onclick = () => {   
        sortByDiffRating(profJson, inlineDiffSortButton)
    }

    outlineOverallSortButton.onclick = () => {
        sortByOverallRating(profJson, outlineOverallSortButton);
    }

    outlineDiffSortButton.onclick = () => {   
        sortByDiffRating(profJson, outlineDiffSortButton)
    }
});

function createButton(buttonInnerText, buttonId){
    var sortRatingButton = document.createElement('BUTTON');
    sortRatingButton.id = buttonId;
    sortRatingButton.innerText = buttonInnerText;
    sortRatingButton.style.marginRight = "8px";
    return sortRatingButton;
}

function addInlineSortButtonToView(inlineOverallSortButton) {
    let inlineSearchBar = document.getElementsByClassName("course-search-crn-title-container")[0];
    inlineSearchBar.appendChild(inlineOverallSortButton);
}

function addOutlineSortButton(outlineOverallSortButton) {
    let outlineSearchBar = document.getElementById("CoursesSearch").getElementsByClassName("modal-body")[0].getElementsByClassName("course-search-container")[0].getElementsByClassName("align-center")[0];
    outlineSearchBar.appendChild(outlineOverallSortButton)
}

function sortByOverallRating(profJson, sortButton) {
    sortButton.innerText = "Loading...";
    let listOfProfDivs = document.getElementsByClassName("results-instructor");
    let profRatings = []
    for(i = 0; i < listOfProfDivs.length; i++) {
        let profName = listOfProfDivs[i].getElementsByTagName("a")[0].innerHTML;
        let profTid = profJson[profName.replace(". ", "_")];
        const indexOfProf = i;
        profRatings.push(new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({tid: "" + profTid}, async function(response) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(response.returned_text, "text/html");
                var overallRatingDiv = doc.getElementsByClassName("RatingValue__Numerator-qw8sqy-2 liyUjw")[0];
                var diffRatingDiv = doc.getElementsByClassName("FeedbackItem__FeedbackNumber-uof32n-1 kkESWs")[1];
                let overallRating = undefined;
                let diffRating = undefined;
                if(typeof overallRatingDiv != 'undefined' && overallRatingDiv.innerHTML != 'N/A'){
                    overallRating = overallRatingDiv.innerHTML;
                } else {
                    overallRating = -1;
                }

                if(typeof diffRatingDiv != 'undefined' && diffRatingDiv.innerHTML != 'N/A'){
                    diffRating = diffRatingDiv.innerHTML;
                } else {
                    diffRating = -1;
                }
                resolve([indexOfProf, overallRating, diffRating]);
            }); 
        }));
    }

    let overallRatings = [];
    Promise.all(profRatings).then((profRatings) => {
        for(let i = 0; i < profRatings.length; i++) {
            overallRatings.push({"OrigIndex": profRatings[i][0], "OverallRating" : profRatings[i][1]});
        } 
        overallRatings.sort((firstProf, secondProf) => {
            if(firstProf["OverallRating"] < secondProf["OverallRating"]) {
                return 1;
            } else {
                return -1;
            }
        });

        sortButton.innerText = "Sort By Overall Rating";

        let oldCourseOrder = document.getElementsByClassName("course-container");
        let newSortedProfsHtml = []
        for(let classIndex = 0; classIndex < oldCourseOrder.length; classIndex++){
            console.log("For " + classIndex + ", the overall ratings: " + overallRatings[classIndex]["OrigIndex"] + ", " + overallRatings[classIndex]["OverallRating"]);
            newSortedProfsHtml.push(oldCourseOrder[overallRatings[classIndex]["OrigIndex"]].innerHTML);
        }    
        
        for(let classIndex = 0; classIndex < oldCourseOrder.length; classIndex++){
            oldCourseOrder[classIndex].innerHTML = newSortedProfsHtml[classIndex];
        }
    });
}

function sortByDiffRating(profJson, sortButton) {
    sortButton.innerText = "Loading...";
    let listOfProfDivs = document.getElementsByClassName("results-instructor");
    let profRatings = []
    for(i = 0; i < listOfProfDivs.length; i++) {
        let profName = listOfProfDivs[i].getElementsByTagName("a")[0].innerHTML;
        let profTid = profJson[profName.replace(". ", "_")];
        const indexOfProf = i;
        profRatings.push(new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({tid: "" + profTid}, async function(response) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(response.returned_text, "text/html");
                var diffRatingDiv = doc.getElementsByClassName("FeedbackItem__FeedbackNumber-uof32n-1 kkESWs")[1];
                let diffRating = undefined;

                if(typeof diffRatingDiv != 'undefined' && diffRatingDiv.innerHTML != 'N/A'){
                    diffRating = diffRatingDiv.innerHTML;
                } else {
                    diffRating = 6;
                }
                resolve([indexOfProf, diffRating]);
            }); 
        }));
    }

    let diffRatings = [];
    Promise.all(profRatings).then((profRatings) => {
        for(let i = 0; i < profRatings.length; i++) {
            diffRatings.push({"OrigIndex": profRatings[i][0], "DiffRating" : profRatings[i][1]});
        } 
        diffRatings.sort((firstProf, secondProf) => {
            if(firstProf["DiffRating"] > secondProf["DiffRating"]) {
                return 1;
            } else {
                return -1;
            }
        });

        sortButton.innerText = "Sort By Difficulty Rating";

        let oldCourseOrder = document.getElementsByClassName("course-container");
        let newSortedProfsHtml = []
        for(let classIndex = 0; classIndex < oldCourseOrder.length; classIndex++){
            console.log("For " + classIndex + ", the diff ratings: " + diffRatings[classIndex]["OrigIndex"] + ", " + diffRatings[classIndex]["DiffRating"]);
            newSortedProfsHtml.push(oldCourseOrder[diffRatings[classIndex]["OrigIndex"]].innerHTML);
        }    
        
        for(let classIndex = 0; classIndex < oldCourseOrder.length; classIndex++){
            oldCourseOrder[classIndex].innerHTML = newSortedProfsHtml[classIndex];
        }
    });
}

