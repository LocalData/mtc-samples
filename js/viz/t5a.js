/**
 * Created by Mynor on 29/12/2014.
 */
//CREATE AREA CHART
var t5acountylist;
var counties = [];
var alameda = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var cc = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var marin =[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var napa =[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var sf = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var sm=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var sc = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var solano = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var sonoma = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var nc = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var others = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var series = [];

(function($) {
    $(function() {
        // Set the default highcharts separator
        Highcharts.setOptions({
            lang: {
                decimalPoint: '.',
                thousandsSep: ','
            }
        });

        //REQUEST COUNTY LIST DATA FROM SERVER
        $.ajax({
            dataType: "json",
            url: "http://vitalsigns-production.elasticbeanstalk.com/counties",
            //data: data,
            async: false,
            success: successCountyListt5a
        });
        function successCountyListt5a(data) {
            t5acountylist = data;
            //San joaquin
            t5acountylist.push({County:"San Joaquin"})

            for (var id in t5acountylist) {
                counties.push(t5acountylist[id].County);
            }
        }
        //REQUEST COUNTY DATA FROM SERVER
        $.ajax({
            dataType: "json",
            url: "http://vitalsigns-production.elasticbeanstalk.com/t5/flows",
            //data: data,
            async: false,
            success: successCountyDatat5a
        });
        function successCountyDatat5a(data) {
            t5acountydata = data;
            for (var id in t5acountydata) {
//********************Alameda
                if(t5acountydata[id]["Res_Geo_Short"]=="Alameda"){
                    switch(t5acountydata[id]["Work_Geo_Short"]){
                        case "Alameda":
                            alameda[0] = 0;
                            break;
                        case "Contra Costa":
                            alameda[1] = -t5acountydata[id]["Total"];
                            break;
                        case "Marin":
                            alameda[2] = -t5acountydata[id]["Total"];
                            break;
                        case "Napa":
                            alameda[3] = -t5acountydata[id]["Total"];
                            break;
                        case "San Francisco":
                            alameda[4] = -t5acountydata[id]["Total"];
                            break;
                        case "San Mateo":
                            alameda[5] = -t5acountydata[id]["Total"];
                            break;
                        case "Santa Clara":
                            alameda[6] = -t5acountydata[id]["Total"];
                            break;
                        case "Solano":
                            alameda[7] = -t5acountydata[id]["Total"];
                            break;
                        case "Sonoma":
                            alameda[8] = -t5acountydata[id]["Total"];
                            break;
                        case "San Joaquin":
                            alameda[9] = -t5acountydata[id]["Total"];
                            break;
                        default:
                            alameda[10] = alameda[10] - t5acountydata[id]["Total"];
                            break;
                    }
                }

                if(t5acountydata[id]["Work_Geo_Short"]=="Alameda"){
                    switch(t5acountydata[id]["Res_Geo_Short"]){
                        case "Alameda":
                            alameda[11] = 0;
                            break;
                        case "Contra Costa":
                            alameda[12] = t5acountydata[id]["Total"];
                            break;
                        case "Marin":
                            alameda[13] = t5acountydata[id]["Total"];
                            break;
                        case "Napa":
                            alameda[14] = t5acountydata[id]["Total"];
                            break;
                        case "San Francisco":
                            alameda[15] = t5acountydata[id]["Total"];
                            break;
                        case "San Mateo":
                            alameda[16] = t5acountydata[id]["Total"];
                            break;
                        case "Santa Clara":
                            alameda[17] = t5acountydata[id]["Total"];
                            break;
                        case "Solano":
                            alameda[18] = t5acountydata[id]["Total"];
                            break;
                        case "Sonoma":
                            alameda[19] = t5acountydata[id]["Total"];
                            break;
                        case "San Joaquin":
                            alameda[20] = t5acountydata[id]["Total"];
                            break;
                        default:
                            alameda[21] = alameda[21] + t5acountydata[id]["Total"];
                            break;
                    }
                }
//********************Contra Costa
                if(t5acountydata[id]["Res_Geo_Short"]=="Contra Costa"){
                    switch(t5acountydata[id]["Work_Geo_Short"]){
                        case "Alameda":
                            cc[0] = -t5acountydata[id]["Total"];
                            break;
                        case "Contra Costa":
                            cc[1] = 0;
                            break;
                        case "Marin":
                            cc[2] = -t5acountydata[id]["Total"];
                            break;
                        case "Napa":
                            cc[3] = -t5acountydata[id]["Total"];
                            break;
                        case "San Francisco":
                            cc[4] = -t5acountydata[id]["Total"];
                            break;
                        case "San Mateo":
                            cc[5] = -t5acountydata[id]["Total"];
                            break;
                        case "Santa Clara":
                            cc[6] = -t5acountydata[id]["Total"];
                            break;
                        case "Solano":
                            cc[7] = -t5acountydata[id]["Total"];
                            break;
                        case "Sonoma":
                            cc[8] = -t5acountydata[id]["Total"];
                            break;
                        case "San Joaquin":
                            cc[9] = -t5acountydata[id]["Total"];
                            break;
                        default:
                            cc[10] = cc[10] - t5acountydata[id]["Total"];
                            break;
                    }
                }

                if(t5acountydata[id]["Work_Geo_Short"]=="Contra Costa"){
                    switch(t5acountydata[id]["Res_Geo_Short"]){
                        case "Alameda":
                            cc[11] = t5acountydata[id]["Total"];;
                            break;
                        case "Contra Costa":
                            cc[12] = 0;
                            break;
                        case "Marin":
                            cc[13] = t5acountydata[id]["Total"];
                            break;
                        case "Napa":
                            cc[14] = t5acountydata[id]["Total"];
                            break;
                        case "San Francisco":
                            cc[15] = t5acountydata[id]["Total"];
                            break;
                        case "San Mateo":
                            cc[16] = t5acountydata[id]["Total"];
                            break;
                        case "Santa Clara":
                            cc[17] = t5acountydata[id]["Total"];
                            break;
                        case "Solano":
                            cc[18] = t5acountydata[id]["Total"];
                            break;
                        case "Sonoma":
                            cc[19] = t5acountydata[id]["Total"];
                            break;
                        case "San Joaquin":
                            cc[20] = t5acountydata[id]["Total"];
                            break;
                        default:
                            cc[21] = cc[21] + t5acountydata[id]["Total"];
                            break;
                    }
                }
//********************Marin
                if(t5acountydata[id]["Res_Geo_Short"]=="Marin"){
                    switch(t5acountydata[id]["Work_Geo_Short"]){
                        case "Alameda":
                            marin[0] = -t5acountydata[id]["Total"];
                            break;
                        case "Contra Costa":
                            marin[1] = -t5acountydata[id]["Total"];
                            break;
                        case "Marin":
                            marin[2] = 0;
                            break;
                        case "Napa":
                            marin[3] = -t5acountydata[id]["Total"];
                            break;
                        case "San Francisco":
                            marin[4] = -t5acountydata[id]["Total"];
                            break;
                        case "San Mateo":
                            marin[5] = -t5acountydata[id]["Total"];
                            break;
                        case "Santa Clara":
                            marin[6] = -t5acountydata[id]["Total"];
                            break;
                        case "Solano":
                            marin[7] = -t5acountydata[id]["Total"];
                            break;
                        case "Sonoma":
                            marin[8] = -t5acountydata[id]["Total"];
                            break;
                        case "San Joaquin":
                            marin[9] = -t5acountydata[id]["Total"];
                            break;
                        default:
                            marin[10] = marin[10] - t5acountydata[id]["Total"];
                            break;
                    }
                }

                if(t5acountydata[id]["Work_Geo_Short"]=="Marin"){
                    switch(t5acountydata[id]["Res_Geo_Short"]){
                        case "Alameda":
                            marin[11] = t5acountydata[id]["Total"];
                            break;
                        case "Contra Costa":
                            marin[12] = t5acountydata[id]["Total"];
                            break;
                        case "Marin":
                            marin[13] = 0;
                            break;
                        case "Napa":
                            marin[14] = t5acountydata[id]["Total"];
                            break;
                        case "San Francisco":
                            marin[15] = t5acountydata[id]["Total"];
                            break;
                        case "San Mateo":
                            marin[16] = t5acountydata[id]["Total"];
                            break;
                        case "Santa Clara":
                            marin[17] = t5acountydata[id]["Total"];
                            break;
                        case "Solano":
                            marin[18] = t5acountydata[id]["Total"];
                            break;
                        case "Sonoma":
                            marin[19] = t5acountydata[id]["Total"];
                            break;
                        case "San Joaquin":
                            marin[20] = t5acountydata[id]["Total"];
                            break;
                        default:
                            marin[21] = marin[21] + t5acountydata[id]["Total"];
                            break;
                    }
                }
//********************Napa
                if(t5acountydata[id]["Res_Geo_Short"]=="Napa"){
                    switch(t5acountydata[id]["Work_Geo_Short"]){
                        case "Alameda":
                            napa[0] = -t5acountydata[id]["Total"];
                            break;
                        case "Contra Costa":
                            napa[1] = -t5acountydata[id]["Total"];
                            break;
                        case "Marin":
                            napa[2] = -t5acountydata[id]["Total"];
                            break;
                        case "Napa":
                            napa[3] = 0;
                            break;
                        case "San Francisco":
                            napa[4] = -t5acountydata[id]["Total"];
                            break;
                        case "San Mateo":
                            napa[5] = -t5acountydata[id]["Total"];
                            break;
                        case "Santa Clara":
                            napa[6] = -t5acountydata[id]["Total"];
                            break;
                        case "Solano":
                            napa[7] = -t5acountydata[id]["Total"];
                            break;
                        case "Sonoma":
                            napa[8] = -t5acountydata[id]["Total"];
                            break;
                        case "San Joaquin":
                            napa[9] = -t5acountydata[id]["Total"];
                            break;
                        default:
                            napa[10] = napa[10] - t5acountydata[id]["Total"];
                            break;
                    }
                }

                if(t5acountydata[id]["Work_Geo_Short"]=="Napa"){
                    switch(t5acountydata[id]["Res_Geo_Short"]){
                        case "Alameda":
                            napa[11] = t5acountydata[id]["Total"];
                            break;
                        case "Contra Costa":
                            napa[12] = t5acountydata[id]["Total"];
                            break;
                        case "Marin":
                            napa[13] = t5acountydata[id]["Total"];
                            break;
                        case "Napa":
                            napa[14] = 0;
                            break;
                        case "San Francisco":
                            napa[15] = t5acountydata[id]["Total"];
                            break;
                        case "San Mateo":
                            napa[16] = t5acountydata[id]["Total"];
                            break;
                        case "Santa Clara":
                            napa[17] = t5acountydata[id]["Total"];
                            break;
                        case "Solano":
                            napa[18] = t5acountydata[id]["Total"];
                            break;
                        case "Sonoma":
                            napa[19] = t5acountydata[id]["Total"];
                            break;
                        case "San Joaquin":
                            napa[20] = t5acountydata[id]["Total"];
                            break;
                        default:
                            napa[21] = napa[21] + t5acountydata[id]["Total"];
                            break;
                    }
                }
//********************San Francisco
                if(t5acountydata[id]["Res_Geo_Short"]=="San Francisco"){
                    switch(t5acountydata[id]["Work_Geo_Short"]){
                        case "Alameda":
                            sf[0] = -t5acountydata[id]["Total"];
                            break;
                        case "Contra Costa":
                            sf[1] = -t5acountydata[id]["Total"];
                            break;
                        case "Marin":
                            sf[2] = -t5acountydata[id]["Total"];
                            break;
                        case "Napa":
                            sf[3] = -t5acountydata[id]["Total"];
                            break;
                        case "San Francisco":
                            sf[4] = 0;
                            break;
                        case "San Mateo":
                            sf[5] = -t5acountydata[id]["Total"];
                            break;
                        case "Santa Clara":
                            sf[6] = -t5acountydata[id]["Total"];
                            break;
                        case "Solano":
                            sf[7] = -t5acountydata[id]["Total"];
                            break;
                        case "Sonoma":
                            sf[8] = -t5acountydata[id]["Total"];
                            break;
                        case "San Joaquin":
                            sf[9] = -t5acountydata[id]["Total"];
                            break;
                        default:
                            sf[10] = sf[10] - t5acountydata[id]["Total"];
                            break;
                    }
                }

                if(t5acountydata[id]["Work_Geo_Short"]=="San Francisco"){
                    switch(t5acountydata[id]["Res_Geo_Short"]){
                        case "Alameda":
                            sf[11] = t5acountydata[id]["Total"];
                            break;
                        case "Contra Costa":
                            sf[12] = t5acountydata[id]["Total"];
                            break;
                        case "Marin":
                            sf[13] = t5acountydata[id]["Total"];
                            break;
                        case "Napa":
                            sf[14] = t5acountydata[id]["Total"];
                            break;
                        case "San Francisco":
                            sf[15] = 0;
                            break;
                        case "San Mateo":
                            sf[16] = t5acountydata[id]["Total"];
                            break;
                        case "Santa Clara":
                            sf[17] = t5acountydata[id]["Total"];
                            break;
                        case "Solano":
                            sf[18] = t5acountydata[id]["Total"];
                            break;
                        case "Sonoma":
                            sf[19] = t5acountydata[id]["Total"];
                            break;
                        case "San Joaquin":
                            sf[20] = t5acountydata[id]["Total"];
                            break;
                        default:
                            sf[21] = sf[21] + t5acountydata[id]["Total"];
                            break;
                    }
                }
//********************San Mateo
                if(t5acountydata[id]["Res_Geo_Short"]=="San Mateo"){
                    switch(t5acountydata[id]["Work_Geo_Short"]){
                        case "Alameda":
                            sm[0] = -t5acountydata[id]["Total"];
                            break;
                        case "Contra Costa":
                            sm[1] = -t5acountydata[id]["Total"];
                            break;
                        case "Marin":
                            sm[2] = -t5acountydata[id]["Total"];
                            break;
                        case "Napa":
                            sm[3] = -t5acountydata[id]["Total"];
                            break;
                        case "San Francisco":
                            sm[4] = -t5acountydata[id]["Total"];
                            break;
                        case "San Mateo":
                            sm[5] = 0;
                            break;
                        case "Santa Clara":
                            sm[6] = -t5acountydata[id]["Total"];
                            break;
                        case "Solano":
                            sm[7] = -t5acountydata[id]["Total"];
                            break;
                        case "Sonoma":
                            sm[8] = -t5acountydata[id]["Total"];
                            break;
                        case "San Joaquin":
                            sm[9] = -t5acountydata[id]["Total"];
                            break;
                        default:
                            sm[10] = sm[10] - t5acountydata[id]["Total"];
                            break;
                    }
                }

                if(t5acountydata[id]["Work_Geo_Short"]=="San Mateo"){
                    switch(t5acountydata[id]["Res_Geo_Short"]){
                        case "Alameda":
                            sm[11] = t5acountydata[id]["Total"];
                            break;
                        case "Contra Costa":
                            sm[12] = t5acountydata[id]["Total"];
                            break;
                        case "Marin":
                            sm[13] = t5acountydata[id]["Total"];
                            break;
                        case "Napa":
                            sm[14] = t5acountydata[id]["Total"];
                            break;
                        case "San Francisco":
                            sm[15] = t5acountydata[id]["Total"];
                            break;
                        case "San Mateo":
                            sm[16] = 0;
                            break;
                        case "Santa Clara":
                            sm[17] = t5acountydata[id]["Total"];
                            break;
                        case "Solano":
                            sm[18] = t5acountydata[id]["Total"];
                            break;
                        case "Sonoma":
                            sm[19] = t5acountydata[id]["Total"];
                            break;
                        case "San Joaquin":
                            sm[20] = t5acountydata[id]["Total"];
                            break;
                        default:
                            sm[21] = sm[21] + t5acountydata[id]["Total"];
                            break;
                    }
                }

//********************Santa Clara
                if(t5acountydata[id]["Res_Geo_Short"]=="Santa Clara"){
                    switch(t5acountydata[id]["Work_Geo_Short"]){
                        case "Alameda":
                            sc[0] = -t5acountydata[id]["Total"];
                            break;
                        case "Contra Costa":
                            sc[1] = -t5acountydata[id]["Total"];
                            break;
                        case "Marin":
                            sc[2] = -t5acountydata[id]["Total"];
                            break;
                        case "Napa":
                            sc[3] = -t5acountydata[id]["Total"];
                            break;
                        case "San Francisco":
                            sc[4] = -t5acountydata[id]["Total"];
                            break;
                        case "San Mateo":
                            sc[5] = -t5acountydata[id]["Total"];
                            break;
                        case "Santa Clara":
                            sc[6] = 0;
                            break;
                        case "Solano":
                            sc[7] = -t5acountydata[id]["Total"];
                            break;
                        case "Sonoma":
                            sc[8] = -t5acountydata[id]["Total"];
                            break;
                        case "San Joaquin":
                            sc[9] = -t5acountydata[id]["Total"];
                            break;
                        default:
                            sc[10] = sc[10] - t5acountydata[id]["Total"];
                            break;
                    }
                }

                if(t5acountydata[id]["Work_Geo_Short"]=="Santa Clara"){
                    switch(t5acountydata[id]["Res_Geo_Short"]){
                        case "Alameda":
                            sc[11] = t5acountydata[id]["Total"];
                            break;
                        case "Contra Costa":
                            sc[12] = t5acountydata[id]["Total"];
                            break;
                        case "Marin":
                            sc[13] = t5acountydata[id]["Total"];
                            break;
                        case "Napa":
                            sc[14] = t5acountydata[id]["Total"];
                            break;
                        case "San Francisco":
                            sc[15] = t5acountydata[id]["Total"];
                            break;
                        case "San Mateo":
                            sc[16] = t5acountydata[id]["Total"];
                            break;
                        case "Santa Clara":
                            sc[17] = 0;
                            break;
                        case "Solano":
                            sc[18] = t5acountydata[id]["Total"];
                            break;
                        case "Sonoma":
                            sc[19] = t5acountydata[id]["Total"];
                            break;
                        case "San Joaquin":
                            sc[20] = t5acountydata[id]["Total"];
                            break;
                        default:
                            sc[21] = sc[21] + t5acountydata[id]["Total"];
                            break;
                    }
                }

//********************Solano
                if(t5acountydata[id]["Res_Geo_Short"]=="Solano"){
                    switch(t5acountydata[id]["Work_Geo_Short"]){
                        case "Alameda":
                            solano[0] = -t5acountydata[id]["Total"];
                            break;
                        case "Contra Costa":
                            solano[1] = -t5acountydata[id]["Total"];
                            break;
                        case "Marin":
                            solano[2] = -t5acountydata[id]["Total"];
                            break;
                        case "Napa":
                            solano[3] = -t5acountydata[id]["Total"];
                            break;
                        case "San Francisco":
                            solano[4] = -t5acountydata[id]["Total"];
                            break;
                        case "San Mateo":
                            solano[5] = -t5acountydata[id]["Total"];
                            break;
                        case "Santa Clara":
                            solano[6] = -t5acountydata[id]["Total"];
                            break;
                        case "Solano":
                            solano[7] = 0;
                            break;
                        case "Sonoma":
                            solano[8] = -t5acountydata[id]["Total"];
                            break;
                        case "San Joaquin":
                            solano[9] = -t5acountydata[id]["Total"];
                            break;
                        default:
                            solano[10] = solano[10] - t5acountydata[id]["Total"];
                            break;
                    }
                }

                if(t5acountydata[id]["Work_Geo_Short"]=="Solano"){
                    switch(t5acountydata[id]["Res_Geo_Short"]){
                        case "Alameda":
                            solano[11] = t5acountydata[id]["Total"];
                            break;
                        case "Contra Costa":
                            solano[12] = t5acountydata[id]["Total"];
                            break;
                        case "Marin":
                            solano[13] = t5acountydata[id]["Total"];
                            break;
                        case "Napa":
                            solano[14] = t5acountydata[id]["Total"];
                            break;
                        case "San Francisco":
                            solano[15] = t5acountydata[id]["Total"];
                            break;
                        case "San Mateo":
                            solano[16] = t5acountydata[id]["Total"];
                            break;
                        case "Santa Clara":
                            solano[17] = t5acountydata[id]["Total"];
                            break;
                        case "Solano":
                            solano[18] = 0;
                            break;
                        case "Sonoma":
                            solano[19] = t5acountydata[id]["Total"];
                            break;
                        case "San Joaquin":
                            solano[20] = t5acountydata[id]["Total"];
                            break;
                        default:
                            solano[21] = solano[21] + t5acountydata[id]["Total"];
                            break;
                    }
                }

//********************Sonoma
                if(t5acountydata[id]["Res_Geo_Short"]=="Sonoma"){
                    switch(t5acountydata[id]["Work_Geo_Short"]){
                        case "Alameda":
                            sonoma[0] = -t5acountydata[id]["Total"];
                            break;
                        case "Contra Costa":
                            sonoma[1] = -t5acountydata[id]["Total"];
                            break;
                        case "Marin":
                            sonoma[2] = -t5acountydata[id]["Total"];
                            break;
                        case "Napa":
                            sonoma[3] = -t5acountydata[id]["Total"];
                            break;
                        case "San Francisco":
                            sonoma[4] = -t5acountydata[id]["Total"];
                            break;
                        case "San Mateo":
                            sonoma[5] = -t5acountydata[id]["Total"];
                            break;
                        case "Santa Clara":
                            sonoma[6] = -t5acountydata[id]["Total"];
                            break;
                        case "Solano":
                            sonoma[7] = -t5acountydata[id]["Total"];
                            break;
                        case "Sonoma":
                            sonoma[8] = 0;
                            break;
                        case "San Joaquin":
                            sonoma[9] = -t5acountydata[id]["Total"];
                            break;
                        default:
                            sonoma[10] = sonoma[10] - t5acountydata[id]["Total"];
                            break;
                    }
                }

                if(t5acountydata[id]["Work_Geo_Short"]=="Sonoma"){
                    switch(t5acountydata[id]["Res_Geo_Short"]){
                        case "Alameda":
                            sonoma[11] = t5acountydata[id]["Total"];
                            break;
                        case "Contra Costa":
                            sonoma[12] = t5acountydata[id]["Total"];
                            break;
                        case "Marin":
                            sonoma[13] = t5acountydata[id]["Total"];
                            break;
                        case "Napa":
                            sonoma[14] = t5acountydata[id]["Total"];
                            break;
                        case "San Francisco":
                            sonoma[15] = t5acountydata[id]["Total"];
                            break;
                        case "San Mateo":
                            sonoma[16] = t5acountydata[id]["Total"];
                            break;
                        case "Santa Clara":
                            sonoma[17] = t5acountydata[id]["Total"];
                            break;
                        case "Solano":
                            sonoma[18] = t5acountydata[id]["Total"];
                            break;
                        case "Sonoma":
                            sonoma[19] = 0;
                            break;
                        case "San Joaquin":
                            sonoma[20] = t5acountydata[id]["Total"];
                            break;
                        default:
                            sonoma[21] = sonoma[21] + t5acountydata[id]["Total"];
                            break;
                    }
                }

//********************San Joaquin
                if(t5acountydata[id]["Res_Geo_Short"]=="San Joaquin"){
                    switch(t5acountydata[id]["Work_Geo_Short"]){
                        case "Alameda":
                            nc[0] = -t5acountydata[id]["Total"];
                            break;
                        case "Contra Costa":
                            nc[1] = -t5acountydata[id]["Total"];
                            break;
                        case "Marin":
                            nc[2] = -t5acountydata[id]["Total"];
                            break;
                        case "Napa":
                            nc[3] = -t5acountydata[id]["Total"];
                            break;
                        case "San Francisco":
                            nc[4] = -t5acountydata[id]["Total"];
                            break;
                        case "San Mateo":
                            nc[5] = -t5acountydata[id]["Total"];
                            break;
                        case "Santa Clara":
                            nc[6] = -t5acountydata[id]["Total"];
                            break;
                        case "Solano":
                            nc[7] = -t5acountydata[id]["Total"];
                            break;
                        case "Sonoma":
                            nc[8] = -t5acountydata[id]["Total"];
                            break;
                        case "San Joaquin":
                            nc[9] = 0;
                            break;
                        default:
                            nc[10] = nc[10] - t5acountydata[id]["Total"];
                            break;
                    }
                }

                if(t5acountydata[id]["Work_Geo_Short"]=="San Joaquin"){
                    switch(t5acountydata[id]["Res_Geo_Short"]){
                        case "Alameda":
                            nc[11] = t5acountydata[id]["Total"];
                            break;
                        case "Contra Costa":
                            nc[12] = t5acountydata[id]["Total"];
                            break;
                        case "Marin":
                            nc[13] = t5acountydata[id]["Total"];
                            break;
                        case "Napa":
                            nc[14] = t5acountydata[id]["Total"];
                            break;
                        case "San Francisco":
                            nc[15] = t5acountydata[id]["Total"];
                            break;
                        case "San Mateo":
                            nc[16] = t5acountydata[id]["Total"];
                            break;
                        case "Santa Clara":
                            nc[17] = t5acountydata[id]["Total"];
                            break;
                        case "Solano":
                            nc[18] = t5acountydata[id]["Total"];
                            break;
                        case "Sonoma":
                            nc[19] = t5acountydata[id]["Total"];
                            break;
                        case "San Joaquin":
                            nc[20] = 0;
                            break;
                        default:
                            nc[21] = nc[21] + t5acountydata[id]["Total"];
                            break;
                    }
                }
/*
//********************Others
                if(counties.indexOf(t5acountydata[id]["Res_Geo_Short"])==-1){
                    switch(t5acountydata[id]["Work_Geo_Short"]){
                        case "Alameda":
                            others[0] = -t5acountydata[id]["Total"];
                            break;
                        case "Contra Costa":
                            others[1] = -t5acountydata[id]["Total"];
                            break;
                        case "Marin":
                            others[2] = -t5acountydata[id]["Total"];
                            break;
                        case "Napa":
                            others[3] = -t5acountydata[id]["Total"];
                            break;
                        case "San Francisco":
                            others[4] = -t5acountydata[id]["Total"];
                            break;
                        case "San Mateo":
                            others[5] = -t5acountydata[id]["Total"];
                            break;
                        case "Santa Clara":
                            others[6] = -t5acountydata[id]["Total"];
                            break;
                        case "Solano":
                            others[7] = -t5acountydata[id]["Total"];
                            break;
                        case "Sonoma":
                            others[8] = -t5acountydata[id]["Total"];
                            break;
                        case "San Joaquin":
                            others[9] = -t5acountydata[id]["Total"];
                            break;
                        default:
                            others[10] = 0;
                            break;
                    }
                }

                if(counties.indexOf(t5acountydata[id]["Work_Geo_Short"])==-1){
                    switch(t5acountydata[id]["Res_Geo_Short"]){
                        case "Alameda":
                            others[11] = t5acountydata[id]["Total"];
                            break;
                        case "Contra Costa":
                            others[12] = t5acountydata[id]["Total"];
                            break;
                        case "Marin":
                            others[13] = t5acountydata[id]["Total"];
                            break;
                        case "Napa":
                            others[14] = t5acountydata[id]["Total"];
                            break;
                        case "San Francisco":
                            others[15] = t5acountydata[id]["Total"];
                            break;
                        case "San Mateo":
                            others[16] = t5acountydata[id]["Total"];
                            break;
                        case "Santa Clara":
                            others[17] = t5acountydata[id]["Total"];
                            break;
                        case "Solano":
                            others[18] = t5acountydata[id]["Total"];
                            break;
                        case "Sonoma":
                            others[19] = t5acountydata[id]["Total"];
                            break;
                        case "San Joaquin":
                            others[20] = t5acountydata[id]["Total"];
                            break;
                        default:
                            others[21] = 0;
                            break;
                    }
                }
*/
            }

            $('#T5-A div:first').hide();

            var j =0;
            for (var id in t5acountylist) {
                series.push({
                    name: t5acountylist[id].County,
                    data: [alameda[j],cc[j],marin[j],napa[j],sf[j],sm[j],sc[j],solano[j],sonoma[j]]
                });
                j++;
            }
            series.push({
                name: "Other Counties",
                data: [alameda[j],cc[j],marin[j],napa[j],sf[j],sm[j],sc[j],solano[j],sonoma[j]]
            });
            j++;
            //var j =10;
            for (var id in t5acountylist) {
                series.push({
                    name: t5acountylist[id].County,
                    data: [alameda[j],cc[j],marin[j],napa[j],sf[j],sm[j],sc[j],solano[j],sonoma[j]],
                    showInLegend: false
                });
                j++;
            }
            series.push({
                name: "Other Counties",
                data: [alameda[j],cc[j],marin[j],napa[j],sf[j],sm[j],sc[j],solano[j],sonoma[j]],
                showInLegend: false
            });

            //We build the chart after the for
            $('#T5-A-chart').highcharts({
                chart: {
                    type: 'bar',
                    marginTop: 40
                },
                title: {
                  text: '',
                },
                exporting: {
                    chartOptions: {
                        title: {
                            text: '2010 Commute Flows between Bay Area Counties'
                        }
                    }
                },
                xAxis: {
                    categories: counties
                },
                yAxis: {
                    title: {
                        text: ''
                    },
                    labels:{
                        enabled:true,
                        formatter: function () {
                            return Math.abs(this.value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");;
                        }
                    }
                },
                colors: ['#EC7429','#3D9CC8','#62A60A','#D9B305','#65598A','#6B7078','#EA9E77','#88B5C4','#9DBF88','#DFC888','#8A82BB','#EC7429','#3D9CC8','#62A60A','#D9B305','#65598A','#6B7078','#EA9E77','#88B5C4','#9DBF88','#DFC888','#8A82BB'],
                legend: {
                    enabled: true
                },
                tooltip: {
                    followPointer:true,
                    formatter: function () {
                        if(this.y<0){
                            return "Exported Workers to " +  this.series.name + " = " + Math.abs(this.y).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        }else{
                            return "Imported Workers from " +  this.series.name + " = " + Math.abs(this.y).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        }

                    }
                },
                plotOptions: {
                    series: {
                        stacking: 'normal',
                        events: {
                            legendItemClick: function(event) {
                                return false;
                            }
                        }
                    }
                },
                series: series
            });

        }

    });
})(jQuery);
