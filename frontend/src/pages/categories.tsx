import { createCategory, deleteCategory, fetchCategories, updateCategory } from "../apis/categoryApis";
import { SideBar } from "../components/sidebar";
import { useEffect, useState } from "react";

interface Category{
  id:number,
  name:string
}
export function Categories() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");


  useEffect(()=>{
    loadCategories()
  },[])

  const loadCategories = async() =>{
    const data = await fetchCategories();
    setCategories(data)
  }

  const handleAdd = async() =>{
    if(!newCategory) return;
    await createCategory(newCategory);
    setNewCategory("");
    loadCategories();
  }
  
  const handleDelete = async(id:number) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this category?")
    if (!isConfirmed) return;
    try{
      await deleteCategory(id);
      alert("Category deleted successfully!")
      loadCategories();
    }catch (error) {
    console.error("Failed to delete category:", error);
    alert("Failed to delete category. Please try again.");
  }

  }

  const handleUpdate = async(id:number) => {
    const newName = prompt("Enter new category name");
    if(!newName) return;
    await updateCategory(id, newName);
    loadCategories();
  }


  return (
    <div>
        <div className="flex min-h-screen bg-gray-50">
          <SideBar onToggle={setSidebarCollapsed} />
          <div
              className={`flex-1 transition-all duration-300 ${
                sidebarCollapsed ? "ml-20" : "ml-64"
              }`}
            >
            <div className="flex-1 flex flex-col p-3 place-items-center my-4">
              <div className="flex flex-row text-gray-500">
                <h1>Create a new category</h1>
              </div>
              <div className="container mx-auto my-10">
                <h1 className="text-center text-gray-400 text-3xl font-semibold mb-4">
                      Categories
                </h1>
                <div className="md:w-1/2 mx-auto">
                    <div className="bg-white shadow-md rounded-lg p-6 text-gray-500">
                        <form id="todo-form">
                            <div className="flex mb-4">
                                <input type="text" 
                                      className="w-full px-4 py-2 mr-2 rounded-lg border-gray-300 focus:outline-none focus:border-blue-500" id="todo-input" 
                                      placeholder="Add new category" 
                                      value={newCategory}
                                      onChange={(e)=>setNewCategory(e.target.value)}
                                      required/>
                                <button type="button" 
                                onClick={handleAdd}
                                className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Add</button>

                            </div>
                        </form>
                        <ul>
                          {categories.map((cat) => (
                            <li key={cat.id} className="flex justify-between items-center mb-2 p-2 bg-white rounded shadow-sm">
                              <span>{cat.name}</span>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleUpdate(cat.id)}
                                  className="px-2 py-1 text-white bg-green-500 rounded hover:bg-green-600 text-sm"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(cat.id)}
                                  className="px-2 py-1 text-white bg-red-500 rounded hover:bg-red-600 text-sm"
                                >
                                  Delete
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                    </div>  
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
}
