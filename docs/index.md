## UC Davis Sort My Classes ([Install] () )

Schedule Builder is a website UC Davis students use to search and sign up for courses. Often, when deciding which courses to sign up for, 
students use the ratemyprofessor ratings of the professor of a course. However, if there are several different courses that a student
can take, then it takes up a lot of time to search for the ratings of each of the professors of the courses. 

This extension helps reduce this time to a mere few seconds. Two buttons are provided, one labeled "Sort by Overall Rating", and another labeled
"Sort by Difficulty". After entering a course to search, you can click either of the two buttons and the classes that show up from the search 
will change order to reflect the sorting method you chose.

For example, lets say I am searching for a G.E to sign up this quarter, and I know I want the G.E to satisfy the Domestic Diversity and World Cultures. After entering these in and clicking search, many classes show up with many different professors. I want to take the classes with 
the highest overall rated professors, so I click the "Sort By Overall Rating" button. After a second or two, the class options get sorted such that the top few classes are from the highest rated professors: (image). Now my course selection is easy: I just need to decide from the top few classes. 

### What I learned

The main challenge in making this was parsing the rating data of a particular professor. In Javascript, the way to do this is through fetch. 
Using fetch, you can get access the HTML of a particular webpage:

```markdown
# Background.js
fetch('https://www.ratemyprofessors.com/ShowRatings.jsp?tid=' + request.tid)
    .then(response => response.text())
    .then(text => sendResponse({returned_text:text}))
    .catch(error => console.log("Error: " + error));

```

Then, with access to the html, you can convert it to a JSON and search for whatever data field you are looking for. For me, I was looking for the rating datafield, which was stored in the html code with class name of "RatingValue__Numerator-qw8sqy-2 liyUjw". Here is the code I used:

```markdown
# Send a message to background.js to fetch the html of particular professor
chrome.runtime.sendMessage({tid: "" + profTid}, async function(response) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(response.returned_text, "text/html");
    var overallRatingDiv = scrapeOverallRating(doc);
    var diffRatingDiv = scrapeDifficultyRating(doc);
}

# Given html, parse the ratings
function scrapeOverallRating(doc){
    return doc.getElementsByClassName("RatingValue__Numerator-qw8sqy-2 liyUjw")[0];
}

function scrapeDifficultyRating(doc){
    return doc.getElementsByClassName("FeedbackItem__FeedbackNumber-uof32n-1 kkESWs")[1];
}

```

For more details see [GitHub Flavored Markdown](https://guides.github.com/features/mastering-markdown/).

### Jekyll Themes

Your Pages site will use the layout and styles from the Jekyll theme you have selected in your [repository settings](https://github.com/RachitSharma2001/SortMyClasses/settings/pages). The name of this theme is saved in the Jekyll `_config.yml` configuration file.

### Support or Contact

Having trouble with Pages? Check out our [documentation](https://docs.github.com/categories/github-pages-basics/) or [contact support](https://support.github.com/contact) and we’ll help you sort it out.
