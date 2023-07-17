import { Category } from "@/models/Category";
import {mongooseConnect} from "@/lib/mongoose";
import { getServerSession } from "next-auth";
// import { authOptions, isAdminRequest } from "./auth/[...nextauth]";
import {authOptions, isAdminRequest} from "@/pages/api/auth/[...nextauth]";

// IMPORTAR SIEMPRE MONGOOSECONNECT 
// Es ASYNC por que hay que esperar que la base de datos devuelva una respuesta
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

    // Para actualizar la data
    // COn updateOne se puede pasar otro parametro para saber cualquier debe actualizar 1ro, en este caso es el objeto {_id}
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