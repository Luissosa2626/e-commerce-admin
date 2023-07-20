import mongoose, {model, models, Schema} from "mongoose";

const CategorySchema = new Schema({
  name: {type:String,required:true},
  parent: {type:mongoose.Types.ObjectId, ref: "Category"},
  properties: [{type: Object}]  //Arreglo de objetos
});

export const Category = models?.Category || model('Category', CategorySchema);