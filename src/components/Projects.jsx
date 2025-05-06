import Identicons from 'react-identicons'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { truncate, daysRemaining, setGlobalState } from '../store'
import { FaEthereum, FaRegLightbulb } from 'react-icons/fa'
import { HiOutlineClock, HiOutlineUsers, HiOutlineFilter, HiOutlineSearch } from 'react-icons/hi'

const Projects = ({ projects }) => {
  const [end, setEnd] = useState(8)
  const [count] = useState(4)
  const [collection, setCollection] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const getCollection = () => {
    const filtered = searchTerm 
      ? projects.filter(p => 
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : projects
    
    return filtered.slice(0, end)
  }

  useEffect(() => {
    setCollection(getCollection())
  }, [projects, end, searchTerm])

  const handleLoadMore = () => {
    setIsLoading(true)
    // Simulate loading delay
    setTimeout(() => {
      setEnd(end + count)
      setIsLoading(false)
    }, 600)
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setEnd(count) // Reset pagination when searching
  }

  return (
    <div className="w-full">
      {projects.length > 0 ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h3 className="text-xl font-bold text-gray-900">
              {searchTerm ? 'Search Results' : 'Discover Projects'}
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({collection.length} of {searchTerm ? projects.filter(p => 
                  p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  p.description.toLowerCase().includes(searchTerm.toLowerCase())
                ).length : projects.length})
              </span>
            </h3>
            
            <div className="flex w-full md:w-auto gap-2">
              <div className="relative flex-grow md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiOutlineSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="input pl-10 py-2 text-sm"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
                {searchTerm && (
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setSearchTerm('')}
                    aria-label="Clear search"
                  >
                    <span className="text-gray-400 hover:text-gray-600">✕</span>
                  </button>
                )}
              </div>
              
              <button
                type="button"
                className="btn-outline flex items-center"
                aria-label="Filter projects"
              >
                <HiOutlineFilter className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">Filter</span>
              </button>
            </div>
          </div>

          {collection.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {collection.map((project, i) => (
                <ProjectCard key={i} project={project} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl">
              <div className="bg-white p-4 rounded-full shadow-soft mb-4">
                <HiOutlineSearch className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Projects Found</h3>
              <p className="text-gray-500 text-center max-w-md mb-4">
                We couldn't find any projects matching your search criteria.
              </p>
              <button
                type="button"
                className="btn-outline"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </button>
            </div>
          )}

          {projects.length > collection.length && collection.length > 0 ? (
            <div className="flex justify-center mt-12">
              <button
                type="button"
                className="btn-primary"
                onClick={handleLoadMore}
                disabled={isLoading}
                aria-label="Load more projects"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </span>
                ) : (
                  'Load More Projects'
                )}
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl">
          <div className="bg-primary-100 p-6 rounded-full mb-6">
            <FaRegLightbulb className="h-12 w-12 text-primary-600" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Projects Yet</h3>
          <p className="text-gray-600 text-center max-w-md mb-8">
            There are no projects available at the moment. Be the first to create a project and start your crowdfunding journey!
          </p>
          <button
            type="button"
            className="btn-primary btn-lg"
            onClick={() => setGlobalState('createModal', 'scale-100')}
          >
            Create a Project
          </button>
        </div>
      )}
    </div>
  )
}

const ProjectCard = ({ project }) => {
  const expired = new Date().getTime() > Number(project?.expiresAt + '000')
  const progressPercentage = (project.raised / project.cost) * 100
  
  // Status badge styling
  const getStatusBadge = () => {
    if (expired) {
      return { text: 'Expired', color: 'badge-danger' }
    }
    
    switch(project?.status) {
      case 0:
        return { text: 'Open', color: 'badge-info' }
      case 1:
        return { text: 'Accepted', color: 'badge-success' }
      case 2:
        return { text: 'Reverted', color: 'badge-secondary' }
      case 3:
        return { text: 'Deleted', color: 'badge-danger' }
      case 4:
        return { text: 'Paid', color: 'badge-warning' }
      default:
        return { text: 'Unknown', color: 'badge-secondary' }
    }
  }
  
  const statusBadge = getStatusBadge()
  const daysLeft = daysRemaining(project.expiresAt)
  const isUrgent = daysLeft <= 3 && !expired

  return (
    <div className="card group h-full flex flex-col transition-all duration-300 hover:translate-y-[-8px] hover:shadow-card">
      <Link to={'/projects/' + project.id} className="flex flex-col h-full">
        <div className="relative">
          <img
            src={project.imageURL || 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'}
            alt={project.title}
            className="h-48 w-full object-cover rounded-t-xl"
          />
          
          <div className="absolute top-3 right-3">
            <span className={`${statusBadge.color}`}>
              {statusBadge.text}
            </span>
          </div>
          
          {project.hasMilestones && (
            <div className="absolute bottom-3 left-3">
              <span className="badge-primary">
                Milestone-based
              </span>
            </div>
          )}
        </div>

        <div className="p-5 flex-grow flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
            {truncate(project.title, 25, 0, 28)}
          </h3>
          
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {truncate(project.description, 80, 0, 83)}
          </p>
          
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              <Identicons
                className="rounded-full"
                string={project.owner}
                size={20}
              />
              <span className="ml-2 text-sm text-gray-600">
                {truncate(project.owner, 4, 4, 11)}
              </span>
            </div>
          </div>
          
          <div className="mt-auto">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <div className="flex items-center">
                <HiOutlineClock className={`mr-1 ${isUrgent ? 'text-red-500' : ''}`} />
                <span className={isUrgent ? 'text-red-500 font-medium' : ''}>
                  {expired ? 'Expired' : daysLeft + ' days left'}
                </span>
              </div>
              <div className="flex items-center">
                <HiOutlineUsers className="mr-1" />
                <span>{project.backers} Backer{project.backers == 1 ? '' : 's'}</span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ease-out ${
                  progressPercentage >= 100 
                    ? 'bg-green-500' 
                    : progressPercentage > 75 
                      ? 'bg-primary-500' 
                      : progressPercentage > 40 
                        ? 'bg-primary-400' 
                        : 'bg-primary-300'
                }`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                aria-valuenow={progressPercentage}
                aria-valuemin="0"
                aria-valuemax="100"
                role="progressbar"
              ></div>
            </div>
            
            <div className="flex justify-between items-center text-sm font-medium">
              <div className="text-gray-900">
                <span className="font-bold">{project.raised} ETH</span>
                <span className="text-gray-500 ml-1">raised</span>
              </div>
              <div className="flex items-center text-gray-900">
                <FaEthereum className="text-primary-500 mr-1" />
                <span>{project.cost} ETH</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default Projects
