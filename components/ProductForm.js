import Layout from "@/components/Layout";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Spinner from "./Spinner";
import { ReactSortable } from "react-sortablejs";

export default function ProductForm({
    _id, 
    title: existingTitle, 
    description: existingDescription, 
    price: existingPrice, 
    images: existingImages,
    category: assignedCategory,
    properties: assignedProperties
}) {    
    const [title, setTitle] = useState(existingTitle || '')
    const [description, setDescription] = useState(existingDescription || '')
    const [category, setCategory] = useState(assignedCategory || '')
    const [productProperties, setProductProperties] = useState(assignedProperties || {})
    const [price, setPrice] = useState(existingPrice || '')
    const [images, setImages] = useState(existingImages || [])

    // Para volver a Add new product nuevamente
    const [goToProducts, setGoToProducts] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    const [categories, setCategories] = useState([])
    const router = useRouter()

    // Uso esto para poder llamar o traer toda la informacion de Categories a este componente de Products
    useEffect(() => {
        axios.get('/api/categories').then(result => {
            setCategories(result.data)
        })
    }, [])

    async function saveProduct(e) {
        e.preventDefault()
        const data = {title, description, price, images, category, properties:productProperties}
        if(_id) {
            // Para editar 
            await axios.put('/api/products', {...data, _id})
        } else {
            await axios.post('/api/products', data)
        }
        setGoToProducts(true)
    }

    // Es solo routing para volver atras
    if(goToProducts) {
        router.push('/products')
    }

    async function uploadImage(e) {
        const files = e.target?.files;
        if(files?.length > 0) {
            setIsUploading(true)
            const data = new FormData()
            for(const file of files) {
                data.append('file', file)
            }
            const res = await axios.post('/api/upload', data)
            console.log(res.data);
            setImages(oldImages => {
                return [...oldImages, ...res.data.links]
            })
            setIsUploading(false)
            // (FUNCIONA LO DE ABAJO PERO CONTINUO CON AXIOS)
            // const res = await fetch('/api/upload', {
            //     method: 'POST',
            //     body: data,
            // })
            // console.log(res);
        }
    }

    function updateImagesOrder(images) {
        // console.log(images);
        setImages(images)
    }

    function setProductProp(propName, value) {
        setProductProperties(prev => {
            const newProductProps = {...prev}
            newProductProps[propName] = value
            return newProductProps
        })
    }

    const propertiesToFill = []
    if(categories.length > 0 && category) {
       let catInfo = categories.find(({_id}) => _id === category)
        // console.log({catInfo})
        propertiesToFill.push(...catInfo.properties)
        while(catInfo?.parent?._id) {
            const parentCat = categories.find(({_id}) => _id === catInfo?.parent?._id)
            propertiesToFill.push(...parentCat.properties)
            catInfo = parentCat
        }
    }

    return (
        <form onSubmit={saveProduct}>
            <label>Product Name</label>
            <input type="text" placeholder="Product name" value={title} onChange={e => setTitle(e.target.value)}/>
            <label>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">Uncategorized</option>
                {categories.length > 0 && categories.map( c => (
                    <option value={c._id}>{c.name}</option>
                ))}
            </select>
            {propertiesToFill.length > 0 && propertiesToFill.map(p =>(
                <div className="">
                    <label>{p.name[0].toUpperCase() + p.name.substring(1)}</label>  {/*Para convertir la 1ra letra en mayuscula */}
                    <div>
                        <select value={productProperties[p.name]} onChange={(e) => setProductProp(p.name, e.target.value)}>
                            {p.values.map(v => (
                                <option value={v}>{v}</option>
                            ))}
                        </select>
                    </div>
                </div>
            ))}
            <label>
                Photo
            </label>
            <div className="mb-2 flex flex-wrap gap-1">
                <ReactSortable 
                list={images} 
                className="flex flex-wrap gap-1"
                setList={updateImagesOrder}>
                {!!images?.length && images.map(link => (
                    <div key={link} className="h-24 bg-white p-4 shadow-sm rounded-sm border border-gray-200">
                        {/* {link} */}
                        <img src={link} alt="" className="rounded-lg"/>
                    </div>
                ))}
                </ReactSortable>
                {isUploading && (
                    <div className="h-24 flex items-center">
                        <Spinner/>
                    </div>
                )}
                <label className="w-24 h-24 text-center flex flex-col items-center justify-center text-sm -gap-1 text-gray-500 rounded-mg bg-gray-300 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <div>Upload</div>
                <input type="file" onChange={uploadImage} className="hidden"/>
                </label>
            </div>
            <label>Description</label>
            <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)}></textarea>
            <label>Price (in USD)</label>
            <input type="text" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)}></input>
            <button type="submit" className="btn-primary">Save</button>
        </form>
    )
}