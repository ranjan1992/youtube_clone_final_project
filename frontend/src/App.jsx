import React, { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import Header from './components/Header.jsx'
import Sidebar from './components/Sidebar.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import VideoPlayer from './pages/VideoPlayer.jsx'
import Channel from './pages/Channel.jsx'
import './App.css'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <>
      <Header
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        onSearch={setSearchQuery}
      />
      <Sidebar isOpen={sidebarOpen} />
      <main
        className={`main-content ${
          sidebarOpen
            ? 'main-content--sidebar-open'
            : 'main-content--sidebar-collapsed'
        }`}
      >
        {React.cloneElement(children, { searchQuery })}
      </main>
    </>
  )
}

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route
          path='/'
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path='/video/:id'
          element={
            <Layout>
              <VideoPlayer />
            </Layout>
          }
        />
        <Route
          path='/channel/my'
          element={
            <Layout>
              <Channel />
            </Layout>
          }
        />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
)

export default App
