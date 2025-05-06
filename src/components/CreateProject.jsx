import { useState } from 'react'
import { FaTimes, FaPlus, FaTrash, FaInfoCircle } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { createProject } from '../services/blockchain'
import { useGlobalState, setGlobalState } from '../store'
import { uploadImage, getImageUrl } from '../services/supabase'
import Tooltip from './Tooltip'

const CreateProject = () => {
  const [createModal] = useGlobalState('createModal')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [cost, setCost] = useState('')
  const [date, setDate] = useState('')
  const [imageURL, setImageURL] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [hasMilestones, setHasMilestones] = useState(false)
  const [milestones, setMilestones] = useState([])
  const [milestoneTitle, setMilestoneTitle] = useState('')
  const [milestoneDescription, setMilestoneDescription] = useState('')
  const [milestoneAmount, setMilestoneAmount] = useState('')
  const [step, setStep] = useState(1) // 1: Project Details, 2: Milestones

  const toTimestamp = (dateStr) => {
    const dateObj = Date.parse(dateStr)
    return dateObj / 1000
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!imageFile) {
      return toast.warning('Please select an image for your project')
    }

    if (hasMilestones && step === 1) {
      // Move to milestone step if milestone-based funding is enabled
      setStep(2)
      return
    }

    if (!title || !description || !cost || !date) {
      return toast.warning('Please fill all required fields')
    }

    if (hasMilestones && milestones.length === 0) {
      return toast.warning('Please add at least one milestone or disable milestone-based funding')
    }

    let finalImageURL = imageURL
    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}.${ext}`
      const { data, error } = await uploadImage(imageFile, fileName)
      if (error) {
        toast.error('Image upload failed')
        return
      }
      finalImageURL = getImageUrl(data.path)
    }

    const params = {
      title,
      description,
      cost,
      expiresAt: toTimestamp(date),
      imageURL: finalImageURL,
      hasMilestones,
      milestones: milestones,
    }

    try {
      await createProject(params)
      toast.success('Project created successfully. It may take up to 30 s to appear.')
      onClose()
    } catch (error) {
      console.error(error)
      toast.error('Failed to create project')
    }
  }

  const addMilestone = () => {
    if (!milestoneTitle || !milestoneDescription || !milestoneAmount) {
      return toast.warning('Please fill all milestone fields')
    }

    // Check if total milestone amounts don't exceed project cost
    const totalMilestoneAmount = milestones.reduce((sum, m) => sum + parseFloat(m.amount), 0) + parseFloat(milestoneAmount)
    if (totalMilestoneAmount > parseFloat(cost)) {
      return toast.error('Total milestone amounts cannot exceed project cost')
    }

    const newMilestone = {
      title: milestoneTitle,
      description: milestoneDescription,
      amount: milestoneAmount,
    }

    setMilestones([...milestones, newMilestone])
    setMilestoneTitle('')
    setMilestoneDescription('')
    setMilestoneAmount('')
  }

  const removeMilestone = (index) => {
    const updatedMilestones = [...milestones]
    updatedMilestones.splice(index, 1)
    setMilestones(updatedMilestones)
  }

  const onClose = () => {
    setGlobalState('createModal', 'scale-0')
    reset()
  }

  const reset = () => {
    setTitle('')
    setCost('')
    setDescription('')
    setImageURL('')
    setImageFile(null)
    setDate('')
    setHasMilestones(false)
    setMilestones([])
    setMilestoneTitle('')
    setMilestoneDescription('')
    setMilestoneAmount('')
    setStep(1)
  }

  const goBack = () => {
    setStep(1)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImageURL(URL.createObjectURL(file))
  }

  const totalMilestoneAmount = milestones.reduce((sum, m) => sum + parseFloat(m.amount), 0)
  const remainingAmount = parseFloat(cost) - totalMilestoneAmount

  return (
    <div
      className={`fixed z-50 top-0 left-0 w-screen h-screen flex
    items-center justify-center bg-black bg-opacity-50
    transform transition-transform duration-300 ${createModal}`}
    >
      <div
        className="bg-white shadow-xl shadow-black
        rounded-xl w-11/12 md:w-2/5 h-7/12 p-6 overflow-y-auto max-h-screen"
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold text-xl">
              {step === 1 ? 'Create Project' : 'Define Milestones'}
            </p>
            {step === 2 && (
              <p className="text-sm text-gray-500">
                Step 2 of 2
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            type="button"
            className="border-0 bg-transparent focus:outline-none"
          >
            <FaTimes />
          </button>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="flex justify-center items-center mt-5">
              <div className="rounded-xl overflow-hidden h-20 w-20">
                <img
                  src={
                    imageURL ||
                    'https://media.wired.com/photos/5926e64caf95806129f50fde/master/pass/AnkiHP.jpg'
                  }
                  alt="project title"
                  className="h-full w-full object-cover cursor-pointer"
                />
              </div>
            </div>

            <div
              className="flex justify-between items-center
            bg-gray-300 rounded-xl mt-5"
            >
              <input
                className="block w-full bg-transparent
              border-0 text-sm text-slate-500 focus:outline-none
              focus:ring-0 px-4 py-2.5"
                type="text"
                name="title"
                placeholder="Title"
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                required
              />
            </div>

            <div
              className="flex justify-between items-center
            bg-gray-300 rounded-xl mt-5"
            >
              <input
                className="block w-full bg-transparent
              border-0 text-sm text-slate-500 focus:outline-none
              focus:ring-0 px-4 py-2.5"
                type="number"
                step={0.01}
                min={0.01}
                name="cost"
                placeholder="Cost (ETH)"
                onChange={(e) => setCost(e.target.value)}
                value={cost}
                required
              />
            </div>

            <div
              className="flex justify-between items-center
            bg-gray-300 rounded-xl mt-5"
            >
              <input
                className="block w-full bg-transparent
              border-0 text-sm text-slate-500 focus:outline-none
              focus:ring-0 px-4 py-2.5"
                type="date"
                name="date"
                placeholder="Expires"
                onChange={(e) => setDate(e.target.value)}
                value={date}
                required
              />
            </div>

            <div
              className="flex justify-between items-center
            bg-gray-300 rounded-xl mt-5"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full bg-transparent border-0 text-sm text-slate-500 focus:outline-none focus:ring-0 px-4 py-2.5"
              />
            </div>

            <div
              className="flex justify-between items-center
            bg-gray-300 rounded-xl mt-5"
            >
              <textarea
                className="block w-full bg-transparent
              border-0 text-sm text-slate-500 focus:outline-none
              focus:ring-0 px-4 py-2.5"
                type="text"
                name="description"
                placeholder="Description"
                onChange={(e) => setDescription(e.target.value)}
                value={description}
                required
                rows={4}
              ></textarea>
            </div>

            <div className="flex items-center mt-5">
              <input
                type="checkbox"
                id="hasMilestones"
                checked={hasMilestones}
                onChange={(e) => setHasMilestones(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="hasMilestones" className="text-sm text-slate-500 flex items-center">
                Enable milestone-based funding
                <Tooltip content="Milestone-based funding allows you to receive funds in stages as you complete project goals. Backers vote to approve each milestone.">
                  <FaInfoCircle className="ml-2 text-gray-400 hover:text-gray-600 cursor-pointer" />
                </Tooltip>
              </label>
            </div>

            <button
              type="submit"
              className="inline-block px-6 py-2.5 bg-green-600
              text-white font-medium text-md leading-tight
              rounded-full shadow-md hover:bg-green-700 mt-5"
            >
              {hasMilestones ? 'Continue to Milestones' : 'Create Project'}
            </button>
          </form>
        ) : (
          <div className="flex flex-col">
            <div className="mt-5 border-b pb-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-md">Project Milestones</h3>
                <div className="text-sm text-gray-500">
                  <span className="font-medium">{milestones.length}</span> milestones defined
                </div>
              </div>
              
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Project Budget:</span>
                  <span className="font-medium">{cost} ETH</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Allocated to Milestones:</span>
                  <span className="font-medium">{totalMilestoneAmount} ETH</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Remaining to Allocate:</span>
                  <span className={`font-medium ${remainingAmount < 0 ? 'text-red-500' : ''}`}>
                    {remainingAmount.toFixed(2)} ETH
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
                  <div 
                    className={`h-1.5 rounded-full ${
                      remainingAmount < 0 ? 'bg-red-500' : 'bg-green-600'
                    }`}
                    style={{ width: `${Math.min(100, (totalMilestoneAmount / parseFloat(cost)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {milestones.length > 0 && (
              <div className="mt-5 mb-5">
                <h4 className="font-medium text-sm mb-3">Defined Milestones</h4>
                <div className="space-y-2">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="bg-gray-100 p-3 rounded-lg flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="bg-gray-200 text-gray-700 text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center mr-2">
                            {index + 1}
                          </span>
                          <h4 className="font-medium text-sm">{milestone.title}</h4>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{milestone.description}</p>
                        <p className="text-xs font-medium mt-1 text-green-600">{milestone.amount} ETH</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMilestone(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-200 p-4 rounded-lg mt-3">
              <h4 className="font-medium text-sm mb-3">Add New Milestone</h4>
              <div className="mb-2">
                <input
                  className="block w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                  type="text"
                  placeholder="Milestone Title"
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                />
              </div>
              <div className="mb-2">
                <textarea
                  className="block w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Milestone Description"
                  value={milestoneDescription}
                  onChange={(e) => setMilestoneDescription(e.target.value)}
                  rows={2}
                ></textarea>
              </div>
              <div className="mb-3">
                <input
                  className="block w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                  type="number"
                  step={0.01}
                  min={0.01}
                  placeholder="Amount (ETH)"
                  value={milestoneAmount}
                  onChange={(e) => setMilestoneAmount(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={addMilestone}
                className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-full shadow-md hover:bg-green-700 transition-colors"
              >
                <FaPlus className="mr-1" /> Add Milestone
              </button>
            </div>

            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={goBack}
                className="inline-block px-6 py-2.5 bg-gray-200 text-gray-700
                font-medium text-md leading-tight rounded-full
                shadow-md hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              
              <button
                type="button"
                onClick={handleSubmit}
                disabled={milestones.length === 0}
                className={`inline-block px-6 py-2.5 bg-green-600
                text-white font-medium text-md leading-tight
                rounded-full shadow-md hover:bg-green-700 transition-colors
                ${milestones.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Create Project
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateProject
