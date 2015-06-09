//START CITY LIST
var citylist = [{
    "City": "Alameda",
    "County": "Alameda",
    "CountyID": 1
}, {
    "City": "Albany",
    "County": "Alameda",
    "CountyID": 1
}, {
    "City": "American Canyon",
    "County": "Napa",
    "CountyID": 4
}, {
    "City": "Antioch",
    "County": "Contra Costa",
    "CountyID": 2
}, {
    "City": "Atherton",
    "County": "San Mateo",
    "CountyID": 6
}, {
    "City": "Belmont",
    "County": "San Mateo",
    "CountyID": 6
}, {
    "City": "Belvedere",
    "County": "Marin",
    "CountyID": 3
}, {
    "City": "Benicia",
    "County": "Solano",
    "CountyID": 8
}, {
    "City": "Berkeley",
    "County": "Alameda",
    "CountyID": 1
}, {
    "City": "Brentwood",
    "County": "Contra Costa",
    "CountyID": 2
}, {
    "City": "Brisbane",
    "County": "San Mateo",
    "CountyID": 6
}, {
    "City": "Burlingame",
    "County": "San Mateo",
    "CountyID": 6
}, {
    "City": "Calistoga",
    "County": "Napa",
    "CountyID": 4
}, {
    "City": "Campbell",
    "County": "Santa Clara",
    "CountyID": 7
}, {
    "City": "Clayton",
    "County": "Contra Costa",
    "CountyID": 2
}, {
    "City": "Cloverdale",
    "County": "Sonoma",
    "CountyID": 9
}, {
    "City": "Colma",
    "County": "San Mateo",
    "CountyID": 6
}, {
    "City": "Concord",
    "County": "Contra Costa",
    "CountyID": 2
}, {
    "City": "Corte Madera",
    "County": "Marin",
    "CountyID": 3
}, {
    "City": "Cotati",
    "County": "Sonoma",
    "CountyID": 9
}, {
    "City": "Cupertino",
    "County": "Santa Clara",
    "CountyID": 7
}, {
    "City": "Daly City",
    "County": "San Mateo",
    "CountyID": 6
}, {
    "City": "Danville",
    "County": "Contra Costa",
    "CountyID": 2
}, {
    "City": "Dixon",
    "County": "Solano",
    "CountyID": 8
}, {
    "City": "Dublin",
    "County": "Alameda",
    "CountyID": 1
}, {
    "City": "East Palo Alto",
    "County": "San Mateo",
    "CountyID": 6
}, {
    "City": "El Cerrito",
    "County": "Contra Costa",
    "CountyID": 2
}, {
    "City": "El Cerrito",
    "County": "Contra Costa",
    "CountyID": 2
}, {
    "City": "Emeryville",
    "County": "Alameda",
    "CountyID": 1
}, {
    "City": "Fairfax",
    "County": "Marin",
    "CountyID": 3
}, {
    "City": "Fairfield",
    "County": "Solano",
    "CountyID": 8
}, {
    "City": "Foster City",
    "County": "San Mateo",
    "CountyID": 6
}, {
    "City": "Fremont",
    "County": "Alameda",
    "CountyID": 1
}, {
    "City": "Gilroy",
    "County": "Santa Clara",
    "CountyID": 7
}, {
    "City": "Half Moon Bay",
    "County": "San Mateo",
    "CountyID": 6
}, {
    "City": "Hayward",
    "County": "Alameda",
    "CountyID": 1
}, {
    "City": "Healdsburg",
    "County": "Sonoma",
    "CountyID": 9
}, {
    "City": "Hercules",
    "County": "Contra Costa",
    "CountyID": 2
}, {
    "City": "Hillsborough",
    "County": "San Mateo",
    "CountyID": 6
}, {
    "City": "Lafayette",
    "County": "Contra Costa",
    "CountyID": 2
}, {
    "City": "Larkspur",
    "County": "Marin",
    "CountyID": 3
}, {
    "City": "Livermore",
    "County": "Alameda",
    "CountyID": 1
}, {
    "City": "Los Altos",
    "County": "Santa Clara",
    "CountyID": 7
}, {
    "City": "Los Altos Hills",
    "County": "Santa Clara",
    "CountyID": 7
}, {
    "City": "Los Gatos",
    "County": "Santa Clara",
    "CountyID": 7
}, {
    "City": "Martinez",
    "County": "Contra Costa",
    "CountyID": 2
}, {
    "City": "Menlo Park",
    "County": "San Mateo",
    "CountyID": 6
}, {
    "City": "Mill Valley",
    "County": "Marin",
    "CountyID": 3
}, {
    "City": "Millbrae",
    "County": "San Mateo",
    "CountyID": 6
}, {
    "City": "Milpitas",
    "County": "Santa Clara",
    "CountyID": 7
}, {
    "City": "Monte Sereno",
    "County": "Santa Clara",
    "CountyID": 7
}, {
    "City": "Moraga",
    "County": "Contra Costa",
    "CountyID": 2
}, {
    "City": "Morgan Hill",
    "County": "Santa Clara",
    "CountyID": 7
}, {
    "City": "Mountain View",
    "County": "Contra Costa",
    "CountyID": 2
}, {
    "City": "Mountain View",
    "County": "Santa Clara",
    "CountyID": 7
}, {
    "City": "Napa",
    "County": "Napa",
    "CountyID": 4
}, {
    "City": "Newark",
    "County": "Alameda",
    "CountyID": 1
}, {
    "City": "Novato",
    "County": "Marin",
    "CountyID": 3
}, {
    "City": "Oakland",
    "County": "Alameda",
    "CountyID": 1
}, {
    "City": "Oakley",
    "County": "Contra Costa",
    "CountyID": 2
}, {
    "City": "Orinda",
    "County": "Contra Costa",
    "CountyID": 2
}, {
    "City": "Pacifica",
    "County": "San Mateo",
    "CountyID": 6
}, {
    "City": "Palo Alto",
    "County": "Santa Clara",
    "CountyID": 7
}, {
    "City": "Petaluma",
    "County": "Sonoma",
    "CountyID": 9
}, {
    "City": "Piedmont",
    "County": "Alameda",
    "CountyID": 1
}, {
    "City": "Pinole",
    "County": "Contra Costa",
    "CountyID": 2
}, {
    "City": "Pittsburg",
    "County": "Contra Costa",
    "CountyID": 2
}, {
    "City": "Pleasant Hill",
    "County": "Contra Costa",
    "CountyID": 2
}, {
    "City": "Pleasanton",
    "County": "Alameda",
    "CountyID": 1
}, {
    "City": "Portola Valley",
    "County": "San Mateo",
    "CountyID": 6
}, {
    "City": "Redwood City",
    "County": "San Mateo",
    "CountyID": 6
}, {
    "City": "Richmond",
    "County": "Contra Costa",
    "CountyID": 2
}, {
    "City": "Rio Vista",
    "County": "Solano",
    "CountyID": 8
}, {
    "City": "Rohnert Park",
    "County": "Sonoma",
    "CountyID": 9
}, {
    "City": "Ross",
    "County": "Marin",
    "CountyID": 3
}, {
    "City": "San Anselmo",
    "County": "Marin",
    "CountyID": 3
}, {
    "City": "San Bruno",
    "County": "San Mateo",
    "CountyID": 6
}, {
    "City": "San Carlos",
    "County": "San Mateo",
    "CountyID": 6
}, {
    "City": "San Francisco",
    "County": "San Francisco",
    "CountyID": 5
}, {
    "City": "San Jose",
    "County": "Santa Clara",
    "CountyID": 7
}, {
    "City": "San Leandro",
    "County": "Alameda",
    "CountyID": 1
}, {
    "City": "San Mateo",
    "County": "San Mateo",
    "CountyID": 6
}, {
    "City": "San Pablo",
    "County": "Contra Costa",
    "CountyID": 2
}, {
    "City": "San Rafael",
    "County": "Marin",
    "CountyID": 3
}, {
    "City": "San Ramon",
    "County": "Contra Costa",
    "CountyID": 2
}, {
    "City": "Santa Clara",
    "County": "Santa Clara",
    "CountyID": 7
}, {
    "City": "Santa Rosa",
    "County": "Sonoma",
    "CountyID": 9
}, {
    "City": "Saratoga",
    "County": "Santa Clara",
    "CountyID": 7
}, {
    "City": "Sausalito",
    "County": "Marin",
    "CountyID": 3
}, {
    "City": "Sebastopol",
    "County": "Sonoma",
    "CountyID": 9
}, {
    "City": "Sonoma",
    "County": "Sonoma",
    "CountyID": 9
}, {
    "City": "South San Francisco",
    "County": "San Mateo",
    "CountyID": 6
}, {
    "City": "St. Helena",
    "County": "Napa",
    "CountyID": 4
}, {
    "City": "Suisun City",
    "County": "Solano",
    "CountyID": 8
}, {
    "City": "Sunnyvale",
    "County": "Santa Clara",
    "CountyID": 7
}, {
    "City": "Tiburon",
    "County": "Marin",
    "CountyID": 3
}, {
    "City": "Union City",
    "County": "Alameda",
    "CountyID": 1
}, {
    "City": "Vacaville",
    "County": "Solano",
    "CountyID": 8
}, {
    "City": "Vallejo",
    "County": "Solano",
    "CountyID": 8
}, {
    "City": "Walnut Creek",
    "County": "Contra Costa",
    "CountyID": 2
}, {
    "City": "Windsor",
    "County": "Sonoma",
    "CountyID": 9
}, {
    "City": "Woodside",
    "County": "San Mateo",
    "CountyID": 6
}, {
    "City": "Yountville",
    "County": "Napa",
    "CountyID": 4
}];
//END CITY LIST

//START COUNTY LIST
var countylist = [{
    "County": "Bay Area",
    "CountyID": 0
}, {
    "County": "Alameda",
    "CountyID": 1
}, {
    "County": "Contra Costa",
    "CountyID": 2

}, {
    "County": "Marin",
    "CountyID": 3
}, {
    "County": "Napa",
    "CountyID": 4
}, {
    "County": "San Francisco",
    "CountyID": 5
}, {
    "County": "San Mateo",
    "CountyID": 6
}, {
    "County": "Santa Clara",
    "CountyID": 7
}, {
    "County": "Solano",
    "CountyID": 8
}, {
    "County": "Sonoma",
    "CountyID": 9
}];
//END COUNTY LIST