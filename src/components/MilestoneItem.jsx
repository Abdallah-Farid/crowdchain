import { useState } from 'react'
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaThumbsUp, FaThumbsDown, FaCheck, FaInfoCircle } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { voteMilestone, executeMilestone } from '../services/blockchain'
import { useGlobalState } from '../store'
import Tooltip from './Tooltip'

const MilestoneItem = ({ milestone, projectId, isOwner }) => {
  const [connectedAccount] = useGlobalState('connectedAccount')
  const [isVoting, setIsVoting] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [showVoteInfo, setShowVoteInfo] = useState(false)

  const formatDate = (dateString) => {
    if (!dateString) return 'Not completed'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status) => {
    switch (parseInt(status)) {
      case 0: // PENDING
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FaHourglassHalf className="mr-1" />
            Pending
          </span>
        )
      case 1: // APPROVED
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <FaCheckCircle className="mr-1" />
            Approved
          </span>
        )
      case 2: // REJECTED
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FaTimesCircle className="mr-1" />
            Rejected
          </span>
        )
      case 3: // EXECUTED
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="mr-1" />
            Completed
          </span>
        )
      default:
        return null
    }
  }

  const handleVote = async (approve) => {
    try {
      setIsVoting(true)
      await voteMilestone(projectId, milestone.id, approve)
      toast.success(`Vote ${approve ? 'approved' : 'rejected'} successfully`)
    } catch (error) {
      console.error(error)
      toast.error('Failed to vote on milestone')
    } finally {
      setIsVoting(false)
    }
  }

  const handleExecute = async () => {
    try {
      setIsExecuting(true)
      await executeMilestone(projectId, milestone.id)
      toast.success('Milestone executed successfully')
    } catch (error) {
      console.error(error)
      toast.error('Failed to execute milestone')
    } finally {
      setIsExecuting(false)
    }
  }

  const canExecute = isOwner && milestone.status === 0 && milestone.yesVotes > milestone.noVotes

  const progressPercentage = milestone.yesVotes + milestone.noVotes > 0
    ? (milestone.yesVotes / (milestone.yesVotes + milestone.noVotes)) * 100
    : 0

  return (
    <div className="bg-white shadow-md rounded-lg p-4 border border-gray-200 transition-all hover:shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-lg">{milestone.title}</h3>
            {getStatusBadge(milestone.status)}
          </div>
          <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-green-600">{milestone.amount} ETH</p>
          <p className="text-xs text-gray-500">Created: {formatDate(milestone.createdAt)}</p>
          {milestone.completedAt && (
            <p className="text-xs text-gray-500">Completed: {formatDate(milestone.completedAt)}</p>
          )}
        </div>
      </div>

      {milestone.status === 0 && (
        <div className="mt-4">
          <div className="flex items-center mb-1">
            <div className="flex-grow">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-600 h-2.5 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center ml-3 relative">
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowVoteInfo(!showVoteInfo)}
                aria-label="Show voting information"
              >
                <FaInfoCircle />
              </button>
              {showVoteInfo && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 text-xs">
                  <div className="px-4 py-2">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center">
                        <FaThumbsUp className="text-green-500 mr-1" />
                        Approve
                      </span>
                      <span className="font-medium">{milestone.yesVotes}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="flex items-center">
                        <FaThumbsDown className="text-red-500 mr-1" />
                        Reject
                      </span>
                      <span className="font-medium">{milestone.noVotes}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>{milestone.yesVotes} approvals</span>
            <span>{milestone.noVotes} rejections</span>
          </div>
        </div>
      )}

      {milestone.status === 0 && (
        <div className="mt-4 flex flex-wrap justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => handleVote(true)}
              disabled={isVoting}
              className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-full shadow-md hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <FaThumbsUp className="mr-1" /> Approve
            </button>
            <button
              onClick={() => handleVote(false)}
              disabled={isVoting}
              className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-full shadow-md hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              <FaThumbsDown className="mr-1" /> Reject
            </button>
          </div>

          {canExecute && (
            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-full shadow-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <FaCheck className="mr-1" /> Complete Milestone
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default MilestoneItem
