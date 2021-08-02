const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const workItems = [];
//mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser : true , useUnifiedTopology : true , useFindAndModify : false});
mongoose.connect("mongodb+srv://vkunal:Vishu@1111@cluster0.2gkto.mongodb.net/todolistDB",{useNewUrlParser : true , useUnifiedTopology : true , useFindAndModify : false});

const itemsSchema =  new mongoose.Schema (
  {
    name : String
  }
);

const Item = mongoose.model ("Item",itemsSchema);

const item1 = new Item (
  {
    name : "Welcome to your ToDolist"
  }
);

const item2 = new Item (
  {
    name : "Hit the + button to add a new item"
  }
);

const item3 = new Item (
  {
    name : "<-- Hit this to delete an item"
  }
);

const defaultItems = [item1,item2,item3];


const listSchema = new mongoose.Schema (
  {
    name : String,
    items : [itemsSchema]
  }
);

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({},function(err,result)
  {
    if(result.length === 0)
    {
      Item.insertMany(defaultItems,function (err)
      {
        if(err)
        {
          console.log(err);
        }
        else
        {
          console.log("Successfully inserted");
        }
      });
      res.redirect("/");
    }
    else
    {
      res.render("list", {listTitle: "Today", newListItems: result});
    }
  });

});

app.get("/:customList",function(req,res)
{
  const customListName = _.capitalize(_.lowerCase(req.params.customList));

  List.findOne({name : customListName},function(err,result)
  {
    if(!result)
    {
      const list = new List(
        {
          name : customListName,
          items : defaultItems
        }
      );
      List.insertMany([list],function(err)
      {
        if(err)
        {
          console.log(err);
        }
        else
        {
          console.log("Successfully inserted");
        }
      });
      res.redirect("/" + customListName);
    }
    else{
      res.render("list",{listTitle : result.name , newListItems : result.items});
    }
  });

});

app.get("/user/lists",function (req,res)
{
  List.find({},function (err,result)
  {
      if(!err)
      {
        res.render("lists",{listsCreated : result});
      }
  });

});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item (
    {
      name : itemName
    }
    );

  if(listName === "Today")
  {
    newItem.save();
    res.redirect("/");
  }
  else
  {
    List.findOne({name : listName}, function (err , foundItem)
    {
        foundItem.items.push(newItem);
        foundItem.save();
        res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req,res)
{
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today")
  {
    Item.deleteOne({_id : checkedItemId},function (err)
    {
        console.log("Item deleted Successfully");
    });

    res.redirect("/");
  }
  else
  {
    List.findOneAndUpdate({name : listName},{$pull:{items:{_id:checkedItemId}}},function (err,result)
  {
    if(!err)
    {
      res.redirect("/" + listName);
    }
  });
  }


});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started Successfully");
});
