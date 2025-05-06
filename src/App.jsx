import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './views/Home'
import Project from './views/Project'
import { isWallectConnected } from './services/blockchain'
import { getCurrentUser } from './services/auth'
import { setGlobalState } from './store'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const initApp = async () => {
      setGlobalState('authLoading', true)
      
      try {
        // Initialize blockchain connection
        await isWallectConnected()
        console.log('Blockchain loaded')
        
        // Check for authenticated user
        const { success, user } = await getCurrentUser()
        if (success && user) {
          console.log('User authenticated:', user.email)
        } else {
          console.log('No authenticated user')
        }
      } catch (error) {
        console.error('Error initializing app:', error)
      } finally {
        setGlobalState('authLoading', false)
        setLoaded(true)
      }
    }
    
    initApp()
  }, [])

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
          <p className="mt-4 text-gray-600">Loading CrowdChain...</p>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects/:id" element={<Project />} />
      </Routes>
    </Layout>
  )
}

export default App
