const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")

const app = express()

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))


mongoose.connect("mongodb+srv://chamyalhemsingh:Logarithms1234@cluster0.rmt1jtc.mongodb.net/todolistDB");

const itemSchema = new mongoose.Schema({
    task: String,
})

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    task: "Welcome to your to do list"
})
const item2 = new Item({
    task: "Hit the + button to add a new item."
})
const item3 = new Item({
    task: "<-- Hit this to delete an item"
})

const listSchema = new mongoose.Schema({
    name:String,
    items:[itemSchema]
});

const List = mongoose.model("List", listSchema);



app.get("/", (req, res) => {
    Item.find({}).then((data) => {
        if (data.length == 0) {
            Item.insertMany([item1, item2, item3]).then((data) => {
                console.log("Successfully Inserted")
            }).catch((err) => {
                console.log(err);
                return;
            })
            res.redirect("/")
        } else {
            res.render("list", { listTitle: "Today", newListItem: data });
        }
    }).catch((err) => {
        console.log(err)
        return;
    })
});


app.post("/", (req, res) => {
    const item = req.body.newItem;
    const listName = req.body.list;
    const newItem = new Item({
        task: item
    })
    if(listName == "Today"){
        newItem.save();
        res.redirect("/")
    }else{
        List.findOne({name:listName}).then((data)=>{
            data.items.push(newItem)
            data.save();
            res.redirect("/"+listName);
        })
    }
})

app.post("/delete", (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listname
  

    if(listName == "Today"){
        Item.findByIdAndRemove(checkedItemId).then((data) => {
            console.log("Removed Successfully")
        }).catch((err) => {
            console.log(err)
        })
        res.redirect("/")
    }else{
       List.findOneAndUpdate({name:listName}, {$pull:{items: {_id:checkedItemId}}}).then((data)=>{
        console.log("Successfully Pulled from the array")
        res.redirect("/"+listName)
       }).catch((err)=>{
        console.log(err)
       })
    }
})

app.get("/:nameRoute", async (req, res) => {
    const customListName =_.capitalize(req.params.nameRoute);
    

     await List.findOne({name:customListName}).then((data)=>{
        if(!data){
            const list = new List({
                name:customListName,
                items: [item1, item2, item3]
            });
            list.save(); 
            res.redirect("/" + customListName)
        }else{
            res.render("list", {listTitle:data.name, newListItem:data.items})
        }
    }).catch((err)=>{
        console.log(err)
    })
   
})

app.listen(3000, () => {
    console.log("Server is started at port 3000");
})

