import {mongooseConnect} from "@/lib/mongoose";
import {isAdminRequest} from "@/pages/api/auth/[...nextauth]";
import {Admin} from "@/models/Admin";

export default async function handle(req, res) {
  await mongooseConnect();
  await isAdminRequest(req, res);

  if (req.method === 'POST') {
    const {email} = req.body;   // email del body cuando se ejecute
    if (await Admin.findOne({email})) {
      res.status(400).json({message:'Admin already exists!'});
    } else {
      res.json(await Admin.create({email}));    //models>Admins.js just email sent
    }
  }

  if (req.method === 'DELETE') {
    const {_id} = req.query;    //Toma el _id de la funcion que borra. Es un query por que lo tomamos de ahi, si fuera un parametro fuera body
    await Admin.findByIdAndDelete(_id);
    res.json(true);
  }

  if (req.method === 'GET') {
    res.json( await Admin.find() );
  }
}