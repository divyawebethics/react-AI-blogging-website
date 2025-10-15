import './App.css'
import './style.css'
import { Route, Routes } from 'react-router-dom'
import { Login } from './pages/Login'
import { SignUp } from './pages/Signup'
import { PostsDashboard } from './pages/postDashboard'
import { Home } from './pages/home'
import { Categories } from './pages/categories'
import { CreatePost } from './pages/createPost'
import { PostDetail } from './pages/read_post'
import { EditPost } from './pages/editPost'
import { ProtectedRoute } from './components/ProtectedRoutes'
import { PublicRoute } from './components/publicRoute'
import { LandingPage } from './pages/landingPage'
import { About } from './pages/about'

function App() {
  return (
    <Routes>
      <Route path='/' element={<LandingPage />} />
      <Route path='/about' element={<About />} />
      <Route path='/contact' element={<LandingPage />} />

      <Route path="/signup" element={
        <PublicRoute>
          <SignUp />
        </PublicRoute>
      } />
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />

      {/* Protected routes with role-based access */}
      
      {/* Home page - accessible to all authenticated users but shows different content */}
      <Route path="/home" element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />

      {/* Admin-only routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute requiredRole="admin">
          <PostsDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/posts" element={
        <ProtectedRoute requiredRole="admin">
          <PostsDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/categories" element={
        <ProtectedRoute requiredRole="admin">
          <Categories />
        </ProtectedRoute>
      } />

      {/* Common routes for both admin and users */}
      <Route path="/post/create-post" element={
        <ProtectedRoute>
          <CreatePost />
        </ProtectedRoute>
      } />
      
      <Route path="/post/:id" element={
        <ProtectedRoute>
          <PostDetail />
        </ProtectedRoute>
      } />
      
      <Route path="/post/edit/:id" element={
        <ProtectedRoute>
          <EditPost />
        </ProtectedRoute>
      } />

    </Routes>
  )
}

export default App