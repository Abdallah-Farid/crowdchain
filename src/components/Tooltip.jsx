import React, { useState, useRef, useEffect } from 'react'

const Tooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false)
  const tooltipRef = useRef(null)

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  }

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-800 border-l-transparent border-r-transparent',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-800 border-l-transparent border-r-transparent',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-800 border-t-transparent border-b-transparent',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-800 border-t-transparent border-b-transparent',
  }

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setIsVisible(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative inline-block" ref={tooltipRef}>
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
      >
        {children}
      </div>

      {isVisible && (
        <div
          className={`absolute z-10 px-3 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg shadow-sm opacity-100 ${positionClasses[position]}`}
          role="tooltip"
        >
          {content}
          <div
            className={`absolute w-2 h-2 ${arrowClasses[position]}`}
          ></div>
        </div>
      )}
    </div>
  )
}

export default Tooltip
