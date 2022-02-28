
const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const app = express();
const _=require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Natraj:Natraj123@Cluster0.glrwy.mongodb.net/todolistDB?retryWrites=true&w=majority");
const itemSchema={
  name:String
};
const Item =mongoose.model("item",itemSchema);

const Item1=new Item({
  name:"Wellcome to todolist"
});
const Item2=new Item({
  name:"press the + button to add"
});
const Item3=new Item({
  name:"tick the checkbox to delete"
});
const listSchema={
  name:String,
  items:[itemSchema]
}
const List=mongoose.model("List",listSchema);

const defaultItems=[Item1,Item2,Item3];

app.get("/", function(req, res) {

 Item.find({},function(err,foundItem){
if(foundItem.length==0){
  Item.insertMany(defaultItems,function(err){
  if(err){
    console.log(err);
  }
  else{
    console.log("sucess");
  }
  res.redirect("/");
});
}
else{
   res.render("list", {listTitle: "Today", newListItems: foundItem});
}
  });
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName=req.body.list;
  // console.log(listName);
  const item=new Item({
    name:itemName

  });
  if(listName=="Today"){
    item.save(); 
    res.redirect("/"); 

  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});

app.get("/about", function(req, res){
  res.render("about");
});
app.post("/delete",function(req,res){
  const listName=req.body.listName;
const checkedItemid=req.body.checkbox;
if(listName==="Today"){

  Item.findByIdAndRemove(checkedItemid,function(err){
  if(!err){
    console.log("deleted sucessfully");
    res.redirect("/");
  }
  });
}
else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemid}}},function(err,foundList){
    if(!err){
      res.redirect("/"+listName);
    }


  });
}
});
app.get("/:customlist",function(req,res){
const customListName=_.capitalize(req.params.customlist);
List.findOne({name:customListName},function(err,foundList){
if(!err){
 if(!foundList){
  //create a new List
  const list=new List({
    name:customListName,
    items:defaultItems
  });
  list.save();
  res.redirect("/"+customListName);
  }
 else{
   //show an EXISTING List
   res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
 }
}

});



});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);

app.listen(port, function() {
  console.log("Server started Sucessfully");
});
