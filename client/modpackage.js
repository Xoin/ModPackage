let sevenBin = require('7zip-bin')
const Seven = require('node-7z')
const pathTo7zip = sevenBin.path7za
var glob = require("glob")
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
            serverjson = await GetJson(BuildURL(settings.serverurl, "game", runargs[1], "mod", runargs[2]));
            if (serverjson.status == 200) {
                console.log(serverjson.latest.filename);
                install(serverjson);
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
            switch (runargs[1]) {
                case "make":
                    if (runargs.length > 3) {
                        pack(runargs[2], runargs[3])
                    }
                    else {
                    }
                    break;
                case "clean":

                    break;

                default:
                    break;
            }
            break;
        default:
            break;
    }
}

function install(serverjson) {
    download(BuildURL(settings.serverurl, "files", runargs[1], runargs[2], serverjson.latest.filename), path.join(__dirname, "download", serverjson.latest.filename));

}

function update(parameter1, parameter2, parameter3) {
    // code to be executed
}

function remove(parameter1, parameter2, parameter3) {
    // code to be executed
}

function pack(name, version) {
    let packfile = {
        "modname": name,
        "version": version,
        "filename": name + ".7z",
        "description": "",
        "dependency": [],
        "date": "",
        "files": [
        ]
    }
    process.chdir(path.join(__dirname, "package"))
    let files = glob.sync("**/*.*", { mark: true });
    console.log(files)
    files.forEach(file => {
        packfile.files.push({
            "file": file,
            "dest": "modfolder",
            "overwrite": false
        });
    });

    console.log(packfile);
    WriteJSONFile(path.join(__dirname, "package", packfile.modname + "-" + packfile.version + ".json"), packfile);

    const seven = Seven.add(path.join(__dirname, "package", packfile.modname + "-" + packfile.version + '.7z'), '*.*', {
        $bin: pathTo7zip,
        recursive: true
    });
}

function download(url, filename) {
    var file = fs.createWriteStream(filename);
    var request = http.get(url, function (response) {
        response.pipe(file);
    });
}

async function GetJson(url) {
    let response = await fetch(url);
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

function WriteJSONFile(filename, json) {
    fs.writeFile(filename, JSON.stringify(json), (err) => {
    });
}

function BuildURL() {
    console.log(arguments);
    return Array.prototype.join.call(arguments, '/');
}