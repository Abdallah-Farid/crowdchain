import React from 'react'

const MilestoneProgress = ({ project }) => {
  // If project doesn't have milestones or milestone count is 0, return null
  if (!project?.hasMilestones || !project?.milestoneCount) {
    return null
  }

  const completedCount = project.milestonesCompleted || 0
  const totalCount = project.milestoneCount || 0
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">Milestone Progress</span>
        <span className="text-sm font-medium text-gray-700">{completedCount} of {totalCount} completed</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-green-600 h-2.5 rounded-full" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {progressPercentage.toFixed(0)}% of milestones completed
      </p>
    </div>
  )
}

export default MilestoneProgress
