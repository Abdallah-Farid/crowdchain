import { useEffect } from 'react'
import { FaPlus, FaInfoCircle } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { getMilestones } from '../services/blockchain'
import { useGlobalState, setGlobalState } from '../store'
import MilestoneItem from './MilestoneItem'
import CreateMilestone from './CreateMilestone'
import MilestoneProgress from './MilestoneProgress'
import Tooltip from './Tooltip'

const MilestoneList = ({ project }) => {
  const [milestones] = useGlobalState('milestones')
  const [connectedAccount] = useGlobalState('connectedAccount')
  const isOwner = project?.owner === connectedAccount

  useEffect(() => {
    const fetchMilestones = async () => {
      await getMilestones(project.id)
    }
    
    if (project?.id) {
      fetchMilestones()
    }
  }, [project])

  const handleCreateMilestone = () => {
    if (project?.status !== 1) {
      return toast.warning('Project must be approved before adding milestones')
    }
    setGlobalState('createMilestoneModal', 'scale-100')
  }

  const pendingMilestones = milestones.filter(m => m.status === 0)
  const completedMilestones = milestones.filter(m => m.status === 3)
  const rejectedMilestones = milestones.filter(m => m.status === 2)

  return (
    <div className="flex flex-col px-6 md:w-2/3 mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">Project Milestones</h2>
          <p className="text-sm text-gray-500 mt-1">
            Milestones help ensure project funds are released as progress is made
          </p>
        </div>
        {isOwner && project?.hasMilestones && project?.status === 1 && (
          <button
            onClick={handleCreateMilestone}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-full shadow-md hover:bg-green-700 transition-colors"
          >
            <FaPlus className="mr-2" /> Add Milestone
          </button>
        )}
      </div>

      {/* Milestone Progress Bar */}
      <MilestoneProgress project={project} />

      {/* Milestone Stats */}
      {project?.hasMilestones && milestones.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-6 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Pending</h3>
              <span className="text-yellow-500 text-lg font-bold">{pendingMilestones.length}</span>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Completed</h3>
              <span className="text-green-500 text-lg font-bold">{completedMilestones.length}</span>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Rejected</h3>
              <span className="text-red-500 text-lg font-bold">{rejectedMilestones.length}</span>
            </div>
          </div>
        </div>
      )}

      {!project?.hasMilestones ? (
        <div className="bg-gray-100 rounded-lg p-6 text-center">
          <p className="text-gray-500">This project does not use milestone-based funding.</p>
          <p className="text-gray-500 text-sm mt-2">All funds will be released to the project owner once the funding goal is reached.</p>
        </div>
      ) : milestones.length === 0 ? (
        <div className="bg-gray-100 rounded-lg p-6 text-center">
          <p className="text-gray-500">No milestones have been created yet.</p>
          {isOwner && (
            <p className="text-gray-500 text-sm mt-2">
              As the project owner, you can add milestones to receive funding in stages as you complete project goals.
            </p>
          )}
        </div>
      ) : (
        <div>
          {pendingMilestones.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <h3 className="text-lg font-semibold">Pending Milestones</h3>
                <Tooltip content="These milestones need votes from backers to be approved">
                  <FaInfoCircle className="ml-2 text-gray-400 hover:text-gray-600 cursor-pointer" />
                </Tooltip>
              </div>
              <div className="space-y-4">
                {pendingMilestones.map((milestone) => (
                  <MilestoneItem 
                    key={milestone.id} 
                    milestone={milestone} 
                    projectId={project.id}
                    isOwner={isOwner}
                  />
                ))}
              </div>
            </div>
          )}

          {completedMilestones.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Completed Milestones</h3>
              <div className="space-y-4">
                {completedMilestones.map((milestone) => (
                  <MilestoneItem 
                    key={milestone.id} 
                    milestone={milestone} 
                    projectId={project.id}
                    isOwner={isOwner}
                  />
                ))}
              </div>
            </div>
          )}

          {rejectedMilestones.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Rejected Milestones</h3>
              <div className="space-y-4">
                {rejectedMilestones.map((milestone) => (
                  <MilestoneItem 
                    key={milestone.id} 
                    milestone={milestone} 
                    projectId={project.id}
                    isOwner={isOwner}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <CreateMilestone project={project} />
    </div>
  )
}

export default MilestoneList
