import { useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { createMilestone } from '../services/blockchain'
import { useGlobalState, setGlobalState } from '../store'

const CreateMilestone = ({ project }) => {
  const [createMilestoneModal] = useGlobalState('createMilestoneModal')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title || !description || !amount) {
      return toast.warning('Please fill all fields')
    }

    if (parseFloat(amount) <= 0) {
      return toast.error('Amount must be greater than 0')
    }

    try {
      await createMilestone(project.id, title, description, amount)
      toast.success('Milestone created successfully')
      onClose()
    } catch (error) {
      console.error(error)
      toast.error('Failed to create milestone')
    }
  }

  const onClose = () => {
    setGlobalState('createMilestoneModal', 'scale-0')
    reset()
  }

  const reset = () => {
    setTitle('')
    setDescription('')
    setAmount('')
  }

  return (
    <div
      className={`fixed top-0 left-0 w-screen h-screen flex
    items-center justify-center bg-black bg-opacity-50
    transform transition-transform duration-300 ${createMilestoneModal}`}
    >
      <div
        className="bg-white shadow-xl shadow-black
        rounded-xl w-11/12 md:w-2/5 h-7/12 p-6"
      >
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex justify-between items-center">
            <p className="font-semibold">Add Milestone</p>
            <button
              onClick={onClose}
              type="button"
              className="border-0 bg-transparent focus:outline-none"
            >
              <FaTimes />
            </button>
          </div>

          <div
            className="flex justify-between items-center
          bg-gray-300 rounded-xl mt-5"
          >
            <input
              className="block w-full bg-transparent
            border-0 text-sm text-slate-500 focus:outline-none
            focus:ring-0"
              type="text"
              name="title"
              placeholder="Milestone Title"
              onChange={(e) => setTitle(e.target.value)}
              value={title}
              required
            />
          </div>

          <div
            className="flex justify-between items-center
          bg-gray-300 rounded-xl mt-5"
          >
            <textarea
              className="block w-full bg-transparent
            border-0 text-sm text-slate-500 focus:outline-none
            focus:ring-0"
              name="description"
              placeholder="Milestone Description"
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              required
            ></textarea>
          </div>

          <div
            className="flex justify-between items-center
          bg-gray-300 rounded-xl mt-5"
          >
            <input
              className="block w-full bg-transparent
            border-0 text-sm text-slate-500 focus:outline-none
            focus:ring-0"
              type="number"
              step={0.01}
              min={0.01}
              name="amount"
              placeholder="Amount (ETH)"
              onChange={(e) => setAmount(e.target.value)}
              value={amount}
              required
            />
          </div>

          <button
            type="submit"
            className="inline-block px-6 py-2.5 bg-green-600
            text-white font-medium text-md leading-tight
            rounded-full shadow-md hover:bg-green-700 mt-5"
          >
            Create Milestone
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateMilestone
