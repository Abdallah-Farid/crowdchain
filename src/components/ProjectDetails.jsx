import Identicons from 'react-identicons'
import { FaEthereum, FaRegCalendarAlt, FaRegLightbulb, FaRegCheckCircle } from 'react-icons/fa'
import { HiOutlineClock, HiOutlineUsers, HiOutlineCheckCircle, HiOutlineShare, HiOutlineExclamation } from 'react-icons/hi'
import {
  daysRemaining,
  setGlobalState,
  truncate,
  useGlobalState,
} from '../store'
import { payoutProject } from '../services/blockchain'

const ProjectDetails = ({ project }) => {
  const [connectedAccount] = useGlobalState('connectedAccount')
  const expired = new Date().getTime() > Number(project?.expiresAt + '000')
  const daysLeft = daysRemaining(project?.expiresAt)
  const isUrgent = daysLeft <= 3 && !expired

  const getMilestoneProgress = () => {
    if (!project?.hasMilestones || !project?.milestoneCount) return 0
    return (project.milestonesCompleted / project.milestoneCount) * 100
  }

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
  const progressPercentage = (project?.raised / project?.cost) * 100
  
  const handleShareProject = () => {
    if (navigator.share) {
      navigator.share({
        title: project?.title,
        text: `Check out this project on CrowdChain: ${project?.title}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Project link copied to clipboard!')
    }
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Project Image */}
          <div className="relative h-[300px] md:h-auto">
            <img
              src={project?.imageURL || 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'}
              alt={project?.title}
              className="w-full h-full object-cover"
            />
            
            <div className="absolute top-4 right-4">
              <span className={`${statusBadge.color}`}>
                {statusBadge.text}
              </span>
            </div>
            
            {project?.hasMilestones && (
              <div className="absolute bottom-4 left-4">
                <span className="badge-primary">
                  Milestone-based
                </span>
              </div>
            )}
          </div>
          
          {/* Project Info */}
          <div className="p-6 md:p-8 flex flex-col">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                {project?.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full">
                  <Identicons
                    className="rounded-full"
                    string={project?.owner}
                    size={20}
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    {truncate(project?.owner, 4, 4, 11)}
                  </span>
                </div>
                
                <div className={`flex items-center ${isUrgent ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'} px-3 py-1.5 rounded-full`}>
                  <HiOutlineClock className="mr-1.5" />
                  <span className="text-sm font-medium">
                    {expired ? 'Expired' : daysLeft + ' days left'}
                  </span>
                </div>
                
                <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full text-gray-600">
                  <HiOutlineUsers className="mr-1.5" />
                  <span className="text-sm font-medium">
                    {project?.backers} Backer{project?.backers == 1 ? '' : 's'}
                  </span>
                </div>
                
                <button
                  onClick={handleShareProject}
                  className="flex items-center bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full text-gray-600 transition-colors"
                  aria-label="Share project"
                >
                  <HiOutlineShare className="mr-1.5" />
                  <span className="text-sm font-medium">Share</span>
                </button>
              </div>
            </div>
            
            {/* Funding Progress */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="font-medium text-gray-700">Funding Progress</span>
                <span className="font-medium text-gray-700">{Math.min(progressPercentage, 100).toFixed(1)}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
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
              
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-2xl font-bold text-gray-900">{project?.raised} ETH</span>
                  <span className="text-gray-500 ml-1">raised of {project?.cost} ETH</span>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <FaEthereum className="text-primary-500 mr-1" />
                  <span className="font-medium">Ethereum</span>
                </div>
              </div>
            </div>
            
            {/* Milestone Progress (if applicable) */}
            {project?.hasMilestones && project?.milestoneCount > 0 && (
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="font-medium text-gray-700">Milestone Progress</span>
                  <span className="font-medium text-gray-700">
                    {project?.milestonesCompleted} of {project?.milestoneCount} completed
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                  <div
                    className="bg-primary-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${getMilestoneProgress()}%` }}
                    aria-valuenow={getMilestoneProgress()}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    role="progressbar"
                  ></div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {Array.from({ length: project?.milestoneCount }).map((_, index) => (
                    <div 
                      key={index}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index < project?.milestonesCompleted 
                          ? 'bg-primary-100 text-primary-600' 
                          : 'bg-gray-100 text-gray-400'
                      }`}
                      title={`Milestone ${index + 1} ${index < project?.milestonesCompleted ? 'completed' : 'pending'}`}
                    >
                      {index < project?.milestonesCompleted ? (
                        <FaRegCheckCircle className="w-4 h-4" />
                      ) : (
                        <span className="text-xs font-medium">{index + 1}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Project Status Info */}
            {project?.status === 1 && project?.hasMilestones && project?.milestonesCompleted < project?.milestoneCount && (
              <div className="mb-6 bg-blue-50 p-4 rounded-lg flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <HiOutlineExclamation className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Milestone-based Funding</h3>
                  <div className="mt-1 text-sm text-blue-700">
                    <p>
                      This project uses milestone-based funding. Funds will be released as milestones are completed and approved by backers.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="mt-auto pt-4 flex flex-wrap gap-3">
              {project?.status == 0 ? (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setGlobalState('backModal', 'scale-100')}
                >
                  Back This Project
                </button>
              ) : null}

              {connectedAccount == project?.owner ? (
                project?.status != 3 ? (
                  project?.status == 1 ? (
                    <button
                      type="button"
                      className="btn-primary bg-yellow-600 hover:bg-yellow-700 flex items-center"
                      onClick={() => payoutProject(project?.id)}
                      disabled={project?.hasMilestones && project?.milestonesCompleted < project?.milestoneCount}
                      title={project?.hasMilestones && project?.milestonesCompleted < project?.milestoneCount ? 
                        "All milestones must be completed before payout" : ""}
                    >
                      <FaEthereum className="mr-2" />
                      Request Payout
                    </button>
                  ) : project?.status != 4 ? (
                    <>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setGlobalState('updateModal', 'scale-100')}
                      >
                        Edit Project
                      </button>
                      <button
                        type="button"
                        className="btn-outline border-red-500 text-red-500 hover:bg-red-50"
                        onClick={() => setGlobalState('deleteModal', 'scale-100')}
                      >
                        Delete Project
                      </button>
                    </>
                  ) : (
                    <div className="bg-green-50 p-3 rounded-lg flex items-center text-green-700 w-full">
                      <FaRegCheckCircle className="mr-2" />
                      <span>Project successfully funded and closed</span>
                    </div>
                  )
                ) : null
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetails
