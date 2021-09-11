//var in for , while, if-else is global
//whereas let,const is local
//always use fucking let,const
const express = require("express");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const Date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();


app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
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

const item1 = new Item({
    name: "First Item",
});

const item2 = new Item({
    name: "Second Item",
});

const item3 = new Item({
    name: "Third Item",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

let day = Date.getDate();
app.get("/", async function (req, res) {

    await Item.find({}, function (err, foundItems) {
        if (foundItems.length == 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) console.log(err) //handlerror was throwing random shit in console;
                else console.log("successfully saved default items");
                res.redirect("/");
            });
        } else {
            res.render("list", { listTitle: day, newListItems: foundItems });
        }
    }).catch(function () {
        console.log("Promise Rejected");
    });


});

app.post("/", function (req, res) {
    const itemName = req.body.newItem;

    const listName = req.body.list;

    const item = new Item({
        name: itemName,
    });

    if (listName === day) {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }


});

app.post("/delete", async function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === day) {
        await Item.findByIdAndRemove(checkedItemId, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("successfully deleted");
                res.redirect("/");
            }
        }).catch(function () {
            console.log("Promise Rejected");
        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err, foundList) {
            if (!err) {
                res.redirect("/" + listName);
            }
        })
    }

});

app.get("/:customListName", async function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    await List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });

                list.save();
                res.redirect("/" + customListName);
            } else {
                res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
            }
        }
    }).catch(function () {
        console.log("Promise Rejected");
    });

});

app.get("/about", function (req, res) {
    res.render("about");
});


app.listen(3000, function () {
    console.log("Server started on port 3000");
});