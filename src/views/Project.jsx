import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import BackProject from '../components/BackProject'
import DeleteProject from '../components/DeleteProject'
import ProjectBackers from '../components/ProjectBackers'
import ProjectDetails from '../components/ProjectDetails'
import UpdateProject from '../components/UpdateProject'
import MilestoneList from '../components/MilestoneList'
import MilestoneProgress from '../components/MilestoneProgress'
import { getBackers, loadProject, getMilestones } from '../services/blockchain'
import { useGlobalState } from '../store'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import { FaRegClock, FaRegCheckCircle, FaRegListAlt } from 'react-icons/fa'

const Project = () => {
  const { id } = useParams()
  const [loaded, setLoaded] = useState(false)
  const [project] = useGlobalState('project')
  const [backers] = useGlobalState('backers')
  const [activeTab, setActiveTab] = useState('details')

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        await loadProject(id)
        await getBackers(id)
        await getMilestones(id)
        setLoaded(true)
      } catch (error) {
        console.error('Error loading project data:', error)
      }
    }
    
    fetchProjectData()
  }, [id])
  
  if (!loaded) {
    return (
      <div className="container-custom py-16">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
            <p className="mt-4 text-gray-600">Loading project details...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-custom py-8 md:py-16">
      {/* Back button */}
      <Link 
        to="/" 
        className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-green-600 mb-6 transition-colors"
        aria-label="Back to projects"
      >
        <HiOutlineArrowLeft className="mr-2" />
        Back to Projects
      </Link>
      
      {/* Project Details */}
      <ProjectDetails project={project} />
      
      {/* Milestone Progress (if applicable) */}
      {project?.hasMilestones && (
        <div className="mt-6 px-6 md:w-2/3 mx-auto">
          <MilestoneProgress project={project} />
        </div>
      )}
      
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mt-12">
        <nav className="-mb-px flex space-x-8" aria-label="Project sections">
          <button
            onClick={() => setActiveTab('details')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'details'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            aria-current={activeTab === 'details' ? 'page' : undefined}
          >
            <FaRegListAlt className="mr-2" />
            Project Details
          </button>
          
          {project?.hasMilestones && (
            <button
              onClick={() => setActiveTab('milestones')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'milestones'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-current={activeTab === 'milestones' ? 'page' : undefined}
            >
              <FaRegCheckCircle className="mr-2" />
              Milestones
              {project?.milestoneCount > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {project.milestonesCompleted}/{project.milestoneCount}
                </span>
              )}
            </button>
          )}
          
          <button
            onClick={() => setActiveTab('backers')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'backers'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            aria-current={activeTab === 'backers' ? 'page' : undefined}
          >
            <FaRegClock className="mr-2" />
            Backers
            {backers.length > 0 && (
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {backers.length}
              </span>
            )}
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="py-8">
        {activeTab === 'details' && (
          <div className="space-y-8">
            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold mb-4">About this project</h3>
              <p className="text-gray-700">{project?.description}</p>
              
              {project?.hasMilestones && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-md font-medium mb-2">Milestone-based Funding</h4>
                  <p className="text-sm text-gray-600">
                    This project uses milestone-based funding. Funds will be released to the project owner as milestones are completed and approved by backers.
                  </p>
                  <button
                    onClick={() => setActiveTab('milestones')}
                    className="mt-3 text-sm font-medium text-green-600 hover:text-green-700"
                  >
                    View Milestones →
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4">
              <BackProject project={project} />
              <UpdateProject project={project} />
              <DeleteProject project={project} />
            </div>
          </div>
        )}
        
        {activeTab === 'milestones' && project?.hasMilestones && (
          <MilestoneList project={project} />
        )}
        
        {activeTab === 'backers' && (
          <ProjectBackers backers={backers} />
        )}
      </div>
    </div>
  )
}

export default Project
