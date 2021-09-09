//var in for , while, if-else is global
//whereas let,const is local
//always use fucking let,const
const express = require("express");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const Date = require(__dirname + "/date.js");

const app = express();


app.set("view engine", "ejs");

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

//connecting mongoose with mongodb
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/todolistDB');
}

const itemsSchema = new Schema({
    name: String
});

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item ({
    name: "First Item",
});

const item2 = new Item ({
    name: "Second Item",
});

const item3 = new Item ({
    name: "Third Item",
});

const defaultItems = [item1, item2, item3];


app.get("/", async function(req,res){
    let day = Date.getDate();
    
    await Item.find({}, function (err, foundItems) {
        if (foundItems.length == 0) {
            Item.insertMany(defaultItems, function(err) {
                if (err) console.log(err) //handlerror was throwing random shit in console;
                else console.log("successfully saved defaultfuckingitems");
                res.redirect("/");
            });            
        } else {
            res.render("list", {listTitle: day, newListItems: foundItems});            
        }
    })

    
});

app.post("/", function(req,res){
    let item = req.body.newItem;
    if (req.body.list === "Work") {
        workItems.push(item);
        res.redirect("/work");
        
    } else {
        items.push(item);
        res.redirect("/");
    }
});

app.get("/work", function (req,res) {
    res.render("list", {listTitle: "Work", newListItems: workItems});
});

app.get("/about", function (req,res) {
    res.render("about");
});

app.post("/work",function(req,res) {
    let workItem = req.body.newItem;
    
});

app.listen(3000, function(){
    console.log("Server started on port 3000");
});