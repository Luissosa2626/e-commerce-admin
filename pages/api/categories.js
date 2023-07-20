import { Category } from "@/models/Category";
import {mongooseConnect} from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import {authOptions, isAdminRequest} from "@/pages/api/auth/[...nextauth]";

// IMPORT MONGOOSECONNECT 
export default async function handle(req, res) {
    const { method } = req;
    await mongooseConnect();
    await isAdminRequest(req, res)

    // Cuando menciono Category me refiero al archivo Category.js que esta en models, se refiere a las tablas en MongoDB

    if(method == 'GET') {
        res.json(await Category.find().populate('parent'))
    }

    if (method === 'POST') {
        const {name, parentCategory, properties} = req.body;
        const categoryDoc = await Category.create({
            name, 
            parent:parentCategory || undefined,
            properties
        })
        res.json(categoryDoc)
    }

    // updateOne puede pasar otro parametro para actualizar 1ro, {_id} object
    if(method === 'PUT') {
        const {name, parentCategory, properties, _id} = req.body;
        const categoryDoc = await Category.updateOne({_id},{
            name, 
            parent:parentCategory || undefined,
            properties
        })
        res.json(categoryDoc)
    }

    if(method === 'DELETE') {
        const {_id} = req.query;
        await Category.deleteOne({_id})
        res.json('ok')
    }
}