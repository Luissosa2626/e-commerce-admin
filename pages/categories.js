import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import { withSwal } from "react-sweetalert2"

function Categories({swal}) {
    const [editedCategory, setEditedCategory] = useState(null)
    const [name, setName] = useState('')
    const [parentCategory, setParentCategory] = useState('')
    const [categories, setCategories] = useState([])
    const [properties, setProperties] = useState([])

    useEffect(() => {
        fetchCategories();
    }, [])

    // Creo esta funcion y la pongo dentro del useEffect para que se ejecute una vez y luego en saveCategory para que se refresque automaticamente
    function fetchCategories() {
        axios.get('/api/categories').then(result => {
            // console.log(result); // Este result contiene un parametro llamado data donde esta el nombre de las categories que lo usare para crear parte de la tabla
            // El get esta en pages>api
            setCategories(result.data)
        })
    }

    async function saveCategory(e) {
        e.preventDefault()
        const data = {
            name, 
            parentCategory, 
            properties: properties.map(p => ({
                name:p.name, values: p.values.split(',')
            }))
        }
        if(editedCategory) {
            await axios.put('/api/categories', {...data,
                _id: editedCategory._id})  // Para agregar tambien el id para poder actualizar solo debo agregar el spreadOperator y luego el _id que esta en data 
                setEditedCategory(null)
            } else {
            await axios.post('/api/categories', data);
        }
        setName('')
        setParentCategory('')
        setProperties([])
        fetchCategories()
    }

    function editCategory(category) {
        setEditedCategory(category)
        setName(category.name)
        setParentCategory(category.parent?._id)
        setProperties(category.properties.map(({name, values}) => (
            {name,
            values:values.join(',')}
        )))
    }

    function deleteCategory(category) {
        swal.fire({
            title: 'Are you Sure?',
            text: `Do you want to delete ${category.name}?`,
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonText: 'Yes, delete!',
            confirmButtonColor: '#d55',
            reverseButtons: true
        }).then(async result => {
            // console.log(result);    // Tiene la propiedad isConfirmed para saber si se dio click en borrar
            if(result.isConfirmed) {
                const {_id} = category
                await axios.delete('/api/categories?_id='+_id )
                fetchCategories()   //Llamo esto por que refresca el contenido, es decir lo llama de nuevo. Por eso esta en un useEffect
            }
        })
    }

    function addProperty(e) {
        setProperties(prev => {
           return [...prev, {name: '', value: ''}]  //Agregar un objeto, no esta llamando a nadie solo creando un objeto
        })
    }

    function handlePropertyNameChange(index, property, newName) {
        // console.log(index, property, newName);
        setProperties(prev => {
            const properties = [...prev]    //Me traiga el objeto completo
            properties[index].name = newName
            return properties
        })
    }

    function handlePropertyValuesChange(index, property, newValues) {
        setProperties(prev => {
            const properties = [...prev]
            properties[index].values = newValues
            return properties
        })
    }

    function removeProperty(indexToRemove) {
        setProperties(prev => {
            return [...prev].filter((prop, propIndex) => {
                return propIndex !== indexToRemove
            })
        })
    }

    return (
        <Layout>
            <h1>Categories</h1>
            <label>{editedCategory ? `Edit category ${editedCategory.name}` : 'Create new category'}</label>
            <form onSubmit={saveCategory}>
                <div className="flex gap-1">
                <input 
                type="text"
                placeholder='Category name'
                onChange={e => setName(e.target.value)}
                value={name}/>
                <select value={parentCategory} onChange={e => setParentCategory(e.target.value)}>
                    <option value="0">No parent category</option>
                    {categories.length > 0 && categories.map(category => (
                        <option value={category._id}>{category.name}</option>
                    ))}
                </select>
                </div>
                <div className="mb-2">
                    <label className="block">Properties</label>
                    <button type="button" onClick={addProperty} className="btn-default text-sm mb-2">Add new property</button>
                    {properties.length > 0 && properties.map((property, index) => (
                        <div className="flex gap-1 mb-2">
                            <input type="text" value={property.name} className="mb-0"
                            onChange={e => handlePropertyNameChange(index, property, e.target.value)} placeholder="property name(example: color)"/>
                            <input type="text" value={property.values} className="mb-0"
                            onChange={e => handlePropertyValuesChange(index, property, e.target.value)} placeholder="values, comma separated"/>
                            <button type="button" onClick={() => removeProperty(index)} className="btn-red">Remove</button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-1">
                {editedCategory && (
                <button type="button" onClick={() => {
                    setEditedCategory(null)
                    setName('')
                    setParentCategory('')
                    setProperties([])
                }} className="btn-default">Cancel</button>
                )}
                <button type="submit" className="btn-primary py-1">Save</button>
                </div>
            </form>
            {!editedCategory && (
            <table className="basic mt-4">
                <thead>
                    <tr>
                        <td>Category name</td>
                        <td>Parent category</td>
                        <td></td>
                    </tr>
                </thead>
                <tbody>
                    {categories.length > 0 && categories.map(category => (
                        <tr>
                            <td>{category.name}</td>
                            <td>{category?.parent?.name}</td>
                            <td>
                            <button onClick={() => editCategory(category)} className="btn-default mr-1">Edit</button>
                            <button onClick={() => deleteCategory(category)} className="btn-red">Delete</button>
                            </td>
                        </tr>  
                    ))}
                </tbody>
            </table>
            )}
        </Layout>
    )
}

export default withSwal(({swal}, ref) => (
    <Categories swal={swal}/>
))