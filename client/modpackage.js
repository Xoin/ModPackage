let sevenBin = '7zip-bin'
const Seven = 'node-7z'
const pathTo7zip = sevenBin.path7za
let http = require('http');
let fs = require('fs');
let runargs = process.argv.slice(2);
const fetch = require('node-fetch');
const path = require('path');
let settings = ReadJSONFile(path.join(__dirname, 'settings.json'));


MainMeal();
async function MainMeal(server) {
    console.log("Running ModPackage");
    switch (runargs[0]) {
        case "install":
            serverjson = await GetJson("game/" + runargs[1] + "/mod/" + runargs[2]);
            if (serverjson.status == 200) {
                console.log(serverjson.latest.filename);
                download(settings.serverurl + "files/" + runargs[1] + "/" + runargs[2] + "/" + serverjson.latest.filename, serverjson.latest.filename);
            }
            else {
                console.log("nothing there");
            }
            break;
        case "update":

            break;
        case "remove":

            break;
        case "package":
            break;
        default:
            break;
    }
}

function install(parameter1, parameter2, parameter3) {
    download("", "test.7z");
}

function update(parameter1, parameter2, parameter3) {
    // code to be executed
}

function remove(parameter1, parameter2, parameter3) {
    // code to be executed
}

function download(url, filename) {
    var file = fs.createWriteStream(filename);
    var request = http.get(url, function (response) {
        response.pipe(file);
    });
}

async function GetJson(url) {
    let response = await fetch(settings.serverurl + url);
    let data;
    if (response.status == 200) {
        data = await response.json();
        data.status = 200;
    }
    else {
        data = { "status": response.status };
    }

    return data;
}

function ReadJSONFile(filename) {
    rawdata = fs.readFileSync(filename);
    return JSON.parse(rawdata);
}