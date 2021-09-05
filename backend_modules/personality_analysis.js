
const thesaurus = require('thesaurus');
function analyzeResultsPI(response, getTraitNames, onlyBigFiveTraits) {
    
    if (getTraitNames == null || getTraitNames == undefined) getTraitNames = false;
    
    if (response !== undefined && onlyBigFiveTraits == true) {
        let outputData = {};
        if (response.hasOwnProperty('personality')) {
            response.personality.forEach(el => {
                outputData[el.name.toLowerCase()] = el.percentile;
            })
        }
        return outputData;
    }
    
    else if (response !== undefined && getTraitNames == true) {
        const threshold = 0.6;
        var traits = new Array(0);
        
        if (response.hasOwnProperty('personality')) {
            response.personality.forEach(persEl => {
                
                if (persEl.percentile >= threshold) traits.push(persEl.name.toLowerCase());
                if (persEl.children.length !== 0) {
                    
                    persEl.children.forEach(el => {
                        if (el.percentile >= threshold)
                            traits.push(el.name.toLowerCase())
                    })
                }
            })
        }
        
        if (response.hasOwnProperty('needs')) {
            response.needs.forEach(el => {
                if (el.percentile >= threshold)
                    traits.push(el.name.toLowerCase())
            })
        }
        
        if (response.hasOwnProperty('values')) {
            response.values.forEach(el => {
                if (el.percentile >= threshold)
                    traits.push(el.name.toLowerCase())
            })
        }
        
        if (response.hasOwnProperty('behaviour')) {
            response.behaviour.forEach(el => {
                if (el.percentile >= threshold)
                    traits.push(el.name.toLowerCase());
            })
        }
        
        if (response.hasOwnProperty('consumption_preferences')) {
            response.consumption_preferences.forEach(el => {
                if (el.percentile >= threshold)
                    traits.push(el.name);
            })
        }
        var similarTraits = new Array(0);
        traits.forEach(el => {
            
            if (el.indexOf(" ") == el.lastIndexOf(" ")) {
                thesaurus.find(el).forEach(thEl => {
                    similarTraits.push(thEl)
                })
            }
        })
        return traits.concat(similarTraits);
    }
    
    else if (response !== undefined && getTraitNames == false) {
        var resData = new Object();
        if (response.hasOwnProperty("personality")) {
            response.personality.forEach(el => {
                resData[el.name.toLowerCase()] = el.percentile;
                el.children.forEach(thisEl => {
                    resData[thisEl.name.toLowerCase()] = thisEl.percentile;
                })
            })
        }
        if (response.hasOwnProperty("needs")) {
            response.needs.forEach(el => {
                resData[el.name.toLowerCase()] = el.percentile;
            })
        }
        if (response.hasOwnProperty("values")) {
            response.values.forEach(el => {
                resData[el.name.toLowerCase()] = el.percentile;
            })
        }
        if (response.hasOwnProperty("behaviour")) {
            response.behaviour.forEach(el => {
                resData[el.name.toLowerCase()] = el.percentile;
            })
        }
        if (response.hasOwnProperty("consumption_preference")) {
            response.consumption_preferences.forEach(el => {
                resData[el.name.toLowerCase()] = el.percentile;
            })
        }
        return resData;
    }
    else return null;       
}
function matchPersonality(robotPers, personPers) {
    const matchDiff = 0.2;                      
    var x;
    var index = 0;
    var length = Object.keys(robotPers).length; 
    var returnData = new Array(length);
    returnData.fill(false);                     
    for (x in robotPers) {
        index++;
        if (Math.abs(robotPers[x] - personPers[x]) <= matchDiff)
            returnData[index] = true;
    }
    return returnData;
}
module.exports.analyzeResultsPI = analyzeResultsPI;
module.exports.matchPersonality = matchPersonality;