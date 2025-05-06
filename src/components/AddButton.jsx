import { setGlobalState } from '../store'
import { BsPlusLg } from 'react-icons/bs'

const AddButton = () => {
  return (
    <div className="fixed right-6 bottom-6 md:right-10 md:bottom-10 z-20">
      <button
        type="button"
        className="flex justify-center items-center w-14 h-14 bg-green-600
        text-white rounded-full shadow-lg hover:bg-green-700 transition-colors
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        onClick={() => setGlobalState('createModal', 'scale-100')}
        aria-label="Create new project"
        title="Create new project"
      >
        <BsPlusLg className='font-bold' size={24} />
      </button>
      
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 w-auto">
        <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Create Project
        </div>
      </div>
    </div>
  )
}

export default AddButton
