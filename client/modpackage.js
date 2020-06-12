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
        case "i":
        case "install":
            serverjson = await GetJson(BuildURL(settings.serverurl, "game", runargs[1], "mod", runargs[2]));
            if (serverjson.status == 200) {
                if (serverjson.game == "" || serverjson.name == "") {
                    serverjson.game = runargs[1];
                    serverjson.name = runargs[2];
                }
                console.log(serverjson.latest.filename);
                install(serverjson);
            }
            else {
                console.log("mod or game does not exist");
            }
            break;
        case "d":
        case "download":
            serverjson = await GetJson(BuildURL(settings.serverurl, "game", runargs[1], "mod", runargs[2]));
            if (serverjson.status == 200) {
                if (serverjson.game == "" || serverjson.name == "") {
                    serverjson.game = runargs[1];
                    serverjson.name = runargs[2];
                }
                console.log(serverjson.latest.filename);
                download(serverjson);
            }
            else {
                console.log("mod or game does not exist");
            }
            break;
        case "u":
        case "update":

            break;
        case "r":
        case "remove":

            break;
        case "p":
        case "package":
            switch (runargs[1]) {
                case "make":
                    if (runargs.length > 3) {
                        pack(runargs[2], runargs[3])
                    }
                    else {
                    }
                    break;
                case "config":
                    if (runargs.length > 3) {
                        config(runargs[2], runargs[3])
                    }
                    else {
                    }
                    break;
                case "clean":
                    if (fs.existsSync(path.join(__dirname, "package"))) {
                        fs.rmdirSync(path.join(__dirname, "package"), { recursive: true });
                        fs.mkdirSync(path.join(__dirname, "package"));
                        fs.mkdirSync(path.join(__dirname, "package", "gamefolder"));
                        fs.mkdirSync(path.join(__dirname, "package", "modfolder"));
                        console.log("package folder created")
                    }
                    else {
                        fs.mkdirSync(path.join(__dirname, "package"));
                        fs.mkdirSync(path.join(__dirname, "package", "gamefolder"));
                        fs.mkdirSync(path.join(__dirname, "package", "modfolder"));
                        console.log("package folder created, aditional folders can be created")
                    }
                    break;

                default:
                    console.log("invalid")
                    break;
            }
            break;
        default:
            break;
    }
}

function install(serverjson) {
    let jsoninstalled = ReadJSONFile(path.join(__dirname, "installed.json"));
    console.log(serverjson);
    if (serverjson.dependency == undefined) {
        const myStream = Seven.extractFull(path.join(__dirname, "download", serverjson.latest.filename), path.join(__dirname, "download", serverjson.latest.modname), {
            $bin: pathTo7zip,
            $progress: true
        })
    }
}

async function download(serverjson) {
    let jsoninstalled = ReadJSONFile(path.join(__dirname, "installed.json"));
    if (serverjson.dependency == undefined) {
        if (!fs.existsSync(path.join(__dirname, "download", serverjson.game))) {
            fs.mkdirSync(path.join(__dirname, "download", serverjson.game));
        }
        GetDownload(BuildURL(settings.serverurl, "files", serverjson.game, serverjson.name, serverjson.latest.filename), path.join(__dirname, "download", serverjson.game, serverjson.latest.filename));
        if (jsoninstalled.downloads[serverjson.game]) {
            jsoninstalled.downloads[serverjson.game].push(serverjson.latest);
        }
        else {
            jsoninstalled.downloads.push(serverjson.game, "");
            jsoninstalled.downloads[serverjson.game].push(serverjson.latest);
        }
        WriteJSONFile("installed.json", jsoninstalled);
    }
}

function update(parameter1, parameter2, parameter3) {
    let jsoninstalled = ReadJSONFile(path.join(__dirname, "installed.json"));
}

function remove(parameter1, parameter2, parameter3) {
    let jsoninstalled = ReadJSONFile(path.join(__dirname, "installed.json"));
}

function config(name, version) {
    let packfile = {
        "modname": name,
        "version": version,
        "filename": name + "-" + version + ".7z",
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
}

function pack(name, version) {
    process.chdir(path.join(__dirname, "package"))
    let packfile = ReadJSONFile(path.join(__dirname, "package", name + "-" + version + ".json"));
    const seven = Seven.add(path.join(__dirname, "package", packfile.modname + "-" + packfile.version + '.7z'), '*.*', {
        $bin: pathTo7zip,
        recursive: true
    });

    seven.on('end', function () {
        console.log("archive done")
    })

}

function GetDownload(url, filename) {
    var file = fs.createWriteStream(filename);
    http.get(url, function (response) {
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
    return Array.prototype.join.call(arguments, '/');
}