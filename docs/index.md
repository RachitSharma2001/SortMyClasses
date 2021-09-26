## UC Davis Sort My Classes

[Install Here](https://chrome.google.com/webstore/detail/sort-my-classes/bnidhdgmmbkcagojcfopaeedlnbnlhfe?hl=en&authuser=0)

Schedule Builder is a website UC Davis students use to search and sign up for courses. Often, when deciding which courses to sign up for, 
students use the ratemyprofessor ratings of the professor of a course. However, if there are several different courses that a student
can take, then it takes up a lot of time to search for the ratings of each of the professors of the courses. 

This extension helps reduce this time to a mere few seconds. Two buttons are provided, one labeled "Sort by Overall Rating", and another labeled
"Sort by Difficulty". After entering a course to search, you can click either of the two buttons and the classes that show up from the search 
will change order to reflect the sorting method you chose.

For example, lets say I am searching for a G.E to sign up this quarter, and I know I want the G.E to satisfy the Domestic Diversity and World Cultures. After entering these in and clicking search, many classes show up with many different professors. I want to take the classes with 
the highest overall rated professors, so I click the "Sort By Overall Rating" button. After a second or two, the class options get sorted such that the top few classes are from the highest rated professors: <img src="https://rachitsharma2001.github.io/SortMyClasses/images/SortExample.png" style="display: block; margin: auto;" /> Now my course selection is easy: I just need to decide from the top few classes. 

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

Another new concept I learned was the concept of promises. For chrome extension, you can only fetch in a background script, not in your main program script that is ran on ScheduleBuilder. Hence I need to send a message between content script and background sciript. The problem with this is that javascript treats this is as an asychronous command. This means that, after sending messages to get the ratings of professors 
of each course, javascript will move on to the next command rather than wait for the messages to be responded to. This is problematic, because the next command after sending messages will use the responses from the messages. 

This lead to into the javascript concept of Promises. With promises, you can execute asychronous command and then wait for them to finish and 
return a value. Here is how I implemented this:

```markdown
let messageReceived = new Promise(function(resolve, reject){
        ... send messages to background script in order to get html of professor pages, and then scrape for the ratings from the html.
    });
// wait for the above code to finish and return values. Then, add functionality to sort classes by ratings
messageReceived.then((promiseArr) => {
    ... Add sorting fuctionality
}
```

### How it can be improved

If you use this extension, you may notice that if there are a lot of classes that result from your search, then it takes a few seconds before sorting functionality can be added to the page (the buttons just show loading for first few seconds). The reason for this is that my content script only sends one url request to the background rather than a load of urls. 

There is a function called Promise.all() that allows one to send many requests all at once to the background script. This would likely speed up my extension. However, when trying this, some strange phenomenon happened. Instead of returning the html of all the urls, it would return a generic html that did not contain information on ratings. I need to look into this bug. 

If you have any suggestion on how to improve the code, 
### Contact

If you have any suggestions on how I can improve the extension or the code design, please feel free to contact me. 
My email: rachitsharma613@gmail.com
