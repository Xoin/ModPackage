var express = require('express')
var app = express()
const port = 3000
const path = require('path');
app.use('/files', express.static(path.join(__dirname, 'public')))
const fs = require('fs');
const filesFolder = path.join(__dirname, 'public') + '/';

// respond with "hello world" when a GET request is made to the homepage
app.get('/test', function (req, res) {
    let rawdata = fs.readFileSync('student.json');
    let student = JSON.parse(rawdata);
    res.send(req.params)
})

app.get('/games', function (req, res) {
    const mods = fs.readdirSync(filesFolder);

    res.send(mods)
})

app.get('/game/:gameName/mod/:modName', function (req, res) {
    let rawdata = fs.readFileSync(path.join(filesFolder, req.params.gameName, req.params.modName, "list.json"));
    let list = JSON.parse(rawdata);

    const mods = fs.readdirSync(path.join(filesFolder, req.params.gameName, req.params.modName));
    mods.sort();
    list.latest = JSON.parse(fs.readFileSync(path.join(filesFolder, req.params.gameName, req.params.modName, mods[mods.length - 1])));
    mods.forEach(file => {
        if (path.extname(file) == ".json" && file != "list.json") {
            let data = ReadJSONFile(filesFolder + req.params.gameName + '/' + req.params.modName + "/" + file);
            list.files.push(data);
        }
    })
    res.send(list)
})

app.listen(port, () => console.log(`Serving files on ${port}!`))

function ReadJSONFile(filename) {
    rawdata = fs.readFileSync(filename);
    return JSON.parse(rawdata);
}