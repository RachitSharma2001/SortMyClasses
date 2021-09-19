class Ratings{
    constructor(){
        this.hasRatings = false;
        this.overallRatings = null;
        this.diffRatings = null;
    }

    hasRatings(){
        return this.hasRatings;
    }

    updateHasRatings(){
        this.hasRatings = true;
    }

    getRatings(allClasses){
        this.overallRatings = [];
        this.diffRatings = [];
        for(var classIndex = 0; classIndex < allClasses.length; classIndex++){
            this.overallRatings.push({rating : 6, classIndex : classIndex});
            this.diffRatings.push({rating : 6, classIndex : classIndex});
        }
        updateHasRatings();
        return ratings;
    }
};