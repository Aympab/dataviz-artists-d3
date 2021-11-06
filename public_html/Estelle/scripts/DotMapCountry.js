/*
 *  Représentation des artistes dans le monde 
 * 
 *  @Estelle ALLAIN 
 * 
 */

//Initialisation des variables
var myJson = '[';
var json;
var myMap = new Map();


/*
d3.json("wasabi-artist.json").then(function (data) {
    //Récupération des données qui vont être utile pour la DotMap
    configureData(data);
    
});*/

/*
 * Fonction qui configure les données qui vont être ensuite stockées dans country.json
 */
function configureData(data) {
    data.forEach(function (d) {

        var nbArtistes = 1; //Permet de compter le nombre d'artiste / pays 

        //Récupération du nom des pays du json
        if (d.location.country.length != 0) {
            if (myMap.get(d.location.country) != null) {
                nbArtistes = myMap.get(d.location.country) + 1;
            }
            myMap.set(d.location.country, nbArtistes);
        } else {
            country = d.locationInfo.substring(2, d.locationInfo.indexOf('"', 3));
            if (myMap.get(country) != null) {
                nbArtistes = myMap.get(country) + 1;
            }
            myMap.set(country, nbArtistes);
        }
    });

    //Mise en concordance des pays du json avec la database des pays du monde entier 
    d3.json("localisation.json").then(function (data) {
        data.forEach(function (d) {
            if (typeof myMap.get(d.name) !== "undefined") {
                json = '{"name":"' + d.name + '","id": "' + d.id + '" ,"size":' + myMap.get(d.name) + '}';
                myJson = myJson + json + ',';
            }
        });
        myJson = myJson.substring(0, myJson.length - 1);
        myJson = myJson + ']';

    });
    //console.log(myJson) -> à faire au niveau de la console du navigateur pour récupérer les données des pays 
}

$(document).ready(function () {
    dotMapCountry();
});
/*
 * Fonction qui affiche la DotMap 
 */ 
function dotMapCountry() {

    document.getElementById('container').innerHTML = "";
    var nombreArtistesTotal = 77492; //Récupérer en amont = taille du fichier json qui correspond au nombre d'artistes total
   
    anychart.data.loadJsonFile(
            'country.json',
            function (data) {
                // Creates Map Chart
                var map = anychart.map();
                map.geoData('anychart.maps.world').padding(0);

                map
                        .unboundRegions()
                        .enabled(true)
                        .fill('#E1E1E1')
                        .stroke('#D2D2D2');

                // Sets Chart Title
                map
                        .title()
                        .enabled(true)
                        .padding([0, 0, 20, 0])
                        .text('Répartition des artistes dans le monde')

                // Creates data set
                var dataSet = anychart.data.set(data).mapAs();

                // helper function to create several series
                var createSeries = function (size, name, data, color) {
                    // sets marker series and series settings
                    var series = map.marker(data);
                    series
                            .name(name)
                            .fill(color)
                            .stroke('2 #E1E1E1')
                            .type('circle')

                            .size(size)
                            .labels(false)
                            .selectionMode('none');

                    series.hovered().stroke('2 #fff').size(size * 2);

                    series
                            .legendItem()
                            .iconType('circle')
                            .iconFill(color)
                            .iconStroke('2 #E1E1E1');
                };


                createSeries(
                        4,
                        '⩽50 artistes',
                        dataSet.filter('size', filterFunction(0, 50)),
                        '#64b5f6'
                        );
                createSeries(
                        6,
                        '50 - 200',
                        dataSet.filter('size', filterFunction(50, 200)),
                        '#1976d2'
                        );
                createSeries(
                        8,
                        '200 - 500',
                        dataSet.filter('size', filterFunction(200, 500)),
                        '#23418C'
                        );
                createSeries(
                        10,
                        '500 - 1000',
                        dataSet.filter('size', filterFunction(500, 1000)),
                        '#5C3883'
                        );
                createSeries(
                        11,
                        '1000 - 5500',
                        dataSet.filter('size', filterFunction(1000, 5500)),
                        '#880e4f'
                        );
                createSeries(
                        12,
                        'More than 5500 artistes',
                        dataSet.filter('size', filterFunction(5500, 0)),
                        '#E70942'
                        );

                map.tooltip().title().fontColor('#fff');
                map.tooltip().titleFormat(function () {
                    return this.getData('name');
                });
                //create tooltip
                map
                        .tooltip()
                        .useHtml(true)
                        .title({fontColor: '#7c868e'})
                        .padding([8, 13, 10, 13])
                        .width(350)
                        .fontSize(12)
                        .fontColor('#e6e6e6')
                        .format(function () {
                            var value =
                                    '<span style="color: #e0e6ec; font-size: 12px; font-weight: bold">';
                            var description =
                                    '<br/><span style="color: #7c868e; font-size: 12px; font-style: italic">Soit ';

                            if (this.getData('name') !== '') {

                                var pourcentage = (this.getData('size') / nombreArtistesTotal) * 100;
                                return (
                                        value +
                                        this.getData('size') +
                                        ' Artiste(s) dans ce pays </span></strong>' +
                                        description +
                                        roundDecimal(pourcentage, 2) +
                                        '% </span>'
                                        );
                            }

                        });


                map.legend(true);
                
                // create zoom controls
                var zoomController = anychart.ui.zoom();
                zoomController.render(map);

                // Sets container id for the chart
                map.container('container');
                // Initiates chart drawing
                map.draw();
            }
    );
}
// helper function to bind data field to the local var.
function filterFunction(val1, val2) {
    if (val2) {
        return function (fieldVal) {
            return val1 <= fieldVal && fieldVal < val2;
        };
    }
    return function (fieldVal) {
        return val1 <= fieldVal;
    };
}
/*
 * Fonction qui permet un arrondi
 */
function roundDecimal(nombre, precision) {
    var precision = precision || 2;
    var tmp = Math.pow(10, precision);
    return Math.round(nombre * tmp) / tmp;
}