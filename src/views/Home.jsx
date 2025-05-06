import { useEffect } from 'react'
import AddButton from '../components/AddButton'
import CreateProject from '../components/CreateProject'
import Hero from '../components/Hero'
import Projects from '../components/Projects'
import { loadProjects } from '../services/blockchain'
import { useGlobalState } from '../store'

const Home = () => {
  const [projects] = useGlobalState('projects')

  useEffect(() => {
    const fetchProjects = async () => {
      await loadProjects()
    }
    
    fetchProjects()
  }, [])
  
  return (
    <div className="min-h-screen">
      <Hero />
      
      <section id="projects" className="py-16 bg-white">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center mb-12">Discover Projects</h2>
          <Projects projects={projects} />
        </div>
      </section>
      
      <CreateProject />
      <AddButton />
    </div>
  )
}

export default Home
