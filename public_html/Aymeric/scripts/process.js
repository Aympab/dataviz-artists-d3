
var wasabiData;
var continentData;
var genreInfo;

async function getData() {
    wasabiData = await getJSON("source/wasabi-artist.json");
    wasabiData = getValidData();
    continentData = await getJSON("source/continentInfos.json");
    genreInfo = await getJSON("source/genreInfo.json");
    return [wasabiData, continentData]
}


function traiterApresDecoupage(obj) {
    obj.children.forEach(function (child) {
        if (child.children != undefined) {
            child.children.forEach(function (c) {
                if ((c.children != undefined) & (c.value != undefined)) {
                    delete c.value
                    traiterApresDecoupage(c)
                }
                else {

                }
            })
        }
    })

    return obj
}

//Methode récursive incroybale
function decouperEnObjet(hashMap, name) {
    var objReturn = {
        name: name,
    }

    var bool = true;
    var count = 0

    for (const [key, value] of Object.entries(hashMap)) {
        count = 0;
        //Remise en place du loc0
        value.forEach(objJson => {
            if (objJson.locationInfo.length == 0) {
                objJson.loc0 = "Autres";
                count++;
            }
            else {
                objJson.loc0 = objJson.locationInfo.shift()
                bool = false;
            }
        });


        if (bool) {
            objReturn["value"] = count
        }
        else {
            if (objReturn["children"] == undefined) {
                objReturn["children"] = []
            }

            objReturn["children"].push(decouperEnObjet(groupBy(value, "loc0"), key))


            if (objReturn["value"] != undefined) {
                delete objReturn["value"]
            }
        }
    }
    return objReturn;
}


function getValidData() {

    const validData = [];

    var validJson = {}

    for (let i = 0; i < wasabiData.length; i++) {


        //Application des tris pour ranger les données
        let locArray = wasabiData[i].locationInfo
        let genresArray = wasabiData[i].genres
        let dbpGenreArray = wasabiData[i].dbp_genre

        locArray = splitTextArray(locArray)
        genresArray = splitTextArray(genresArray)
        dbpGenreArray = splitTextArray(dbpGenreArray)

        //On veut que locInfo et genres ne soient pas vides
        if ((locArray != null) & (genresArray != null)) {

            if (dbpGenreArray != null) {
                genresArray.concat(dbpGenreArray)
            }

            wasabiData[i].locationInfo = locArray;
            wasabiData[i].genres = genresArray;


            validJson = {
                loc0: wasabiData[i].locationInfo.shift(),
                locationInfo: wasabiData[i].locationInfo,
                genres: wasabiData[i].genres,
            }

            validData.push(validJson)
        }
    }

    return validData;
}


//Permet de découper array en string en un tableau
function splitTextArray(textArray) {
    //Si on a que 2 caractères le tableau est vide
    if (textArray.length < 3) {
        return null
    }



    textArray = textArray.replaceAll('\[', "")
    textArray = textArray.replaceAll('\]', "")


    textArray = textArray.replaceAll('"', "")
    if (!textArray.includes(",")) {
        textArray = [textArray]
        // array.push(textAray);     
    }
    else {
        textArray = textArray.split(",")
    }

    return textArray;
}

//Retourne un tableau comportant 7 tableaux 
function groupByContinent(coolData) {
    //On va découper dans différents continents
    var asia = []
    var africa = []
    var europe = []
    var oceania = []
    var northAmerica = []
    var southAmerica = []
    var multinational = []

    //  getLocationData().then(function (cont) {
    var pays = ""
    var continentObj = {}

    coolData.forEach(function (e) {

        pays = e.loc0
        continentObj = continentData.find(element => element.country == pays)
        // continent = continentObj.continent
        if (continentObj == undefined) {
            multinational.push(e)
        }
        else {
            switch (continentObj.continent) {
                case "Asia":
                    asia.push(e)
                    break;
                case "Africa":
                    africa.push(e)
                    break;
                case "Europe":
                    europe.push(e)
                    break;
                case "Oceania":
                    oceania.push(e)
                    break;
                case "North America":
                    northAmerica.push(e)
                    break;
                case "South America":
                    southAmerica.push(e)
                    break;
                default:
                    multinational.push(e)
                    break;
            }
        }
    })

    asia = groupBy(asia, "loc0")
    africa = groupBy(africa, "loc0")
    europe = groupBy(europe, "loc0")
    oceania = groupBy(oceania, "loc0")
    northAmerica = groupBy(northAmerica, "loc0")
    southAmerica = groupBy(southAmerica, "loc0")
    multinational = groupBy(multinational, "loc0")

    return [asia, northAmerica, southAmerica, europe, oceania, africa, multinational]

}

// La fonction groupBy exploitant la puissance du reduce
function groupBy(tableauObjets, propriete) {
    return tableauObjets.reduce(function (acc, obj) {
        var cle = obj[propriete];
        if (!acc[cle]) {
            acc[cle] = [];
        }
        acc[cle].push(obj);
        return acc;
    }, {});
}

//recupération du json
function getJSON(url) {
    return new Promise(resolve => {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);

        request.onload = function () {
            if (this.status >= 200 && this.status < 400) {
                resolve(JSON.parse(this.response));
            } else {
                console.error("Erreur lors de l'aquisition de la base wasabi")
            }
        };

        request.onerror = function () {
            console.error("Erreur lors de l'aquisition de la base wasabi")
        };

        request.send();
    })
}
