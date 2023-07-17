import Layout from "@/components/Layout";
import ProductForm from "@/components/ProductForm";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function EditProductPage() {
    const [productInfo, setProductInfo] = useState(null)

    const router = useRouter()
    // console.log({router});  // Me sale un parametro con el nombre id, lo puedo utilizar para hacer ediciones

    const {id} = router.query;

    useEffect(() => {
        if(!id) {
            return;
        }
        axios.get('/api/products?id='+id).then(res => {
            console.log(res.data)
            setProductInfo(res.data)
        })
    }, [id])

    return (
        <Layout>
            <h1>Edit product</h1>
            {productInfo && (
                <ProductForm {...productInfo}/>
            )}
        </Layout>
    )
}