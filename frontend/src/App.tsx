import './App.css'
import './style.css'
import { Route, Routes } from 'react-router-dom'
import { Login } from './pages/Login'
import { SignUp } from './pages/Signup'
import { PostsDashboard } from './pages/postDashboard'
import { Home } from './pages/home'
import {Categories} from './pages/categories'
import { CreatePost } from './pages/createPost'
import { PostDetail } from './pages/read_post'
import { EditPost } from './pages/editPost'

function App() {

  return (
    <Routes>
      <Route path='/' element={<Login/>}/>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/post" element={<PostsDashboard />} />
      <Route path="/post/create-post" element={<CreatePost />} />
      <Route path="/home" element={<Home />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/post/:id" element={<PostDetail />} />
      <Route path="/post/edit/:id" element={<EditPost />} />

    </Routes>
  )
}

export default App
