import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { TbBusinessplan } from 'react-icons/tb'
import { HiOutlineMenuAlt3, HiX } from 'react-icons/hi'
import { connectWallet } from '../services/blockchain'
import { signIn, signOut, signUp } from '../services/auth'
import { truncate, useGlobalState, setGlobalState } from '../store'

const Header = () => {
  const [connectedAccount] = useGlobalState('connectedAccount')
  const [user] = useGlobalState('user')
  const [authLoading] = useGlobalState('authLoading')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [authError, setAuthError] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location])
  
  // Add scroll effect to header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleAuth = async (e) => {
    e.preventDefault()
    setAuthError('')
    
    if (!email || !password) {
      setAuthError('Email and password are required')
      return
    }
    
    if (isSignUp) {
      const { success, message } = await signUp(email, password)
      if (!success) {
        setAuthError(message)
      } else {
        setShowAuthModal(false)
        setEmail('')
        setPassword('')
      }
    } else {
      const { success, message } = await signIn(email, password)
      if (!success) {
        setAuthError(message)
      } else {
        setShowAuthModal(false)
        setEmail('')
        setPassword('')
      }
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-sm shadow-md' 
            : 'bg-white shadow-sm'
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center space-x-2 text-xl font-bold text-gray-900"
              aria-label="CrowdChain Home"
            >
              <TbBusinessplan className="w-8 h-8 text-primary-600" />
              <span>CrowdChain</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/' 
                    ? 'text-primary-600 border-b-2 border-primary-600 pb-1' 
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                Home
              </Link>
              <a 
                href="#projects" 
                className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
              >
                Projects
              </a>
              <a 
                href="#how-it-works" 
                className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
              >
                How It Works
              </a>
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Wallet Connection Button */}
              {connectedAccount ? (
                <button
                  type="button"
                  className="btn-primary btn-sm"
                  aria-label="Connected wallet address"
                >
                  <span className="flex items-center">
                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                    {truncate(connectedAccount, 4, 4, 11)}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-primary btn-sm"
                  onClick={connectWallet}
                  aria-label="Connect wallet"
                >
                  Connect Wallet
                </button>
              )}

              {/* User Authentication Button */}
              {user ? (
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={handleSignOut}
                  aria-label="Sign out"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => setShowAuthModal(true)}
                  aria-label="Sign in"
                >
                  {authLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-primary-50 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? (
                <HiX className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <HiOutlineMenuAlt3 className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out transform ${
            isMenuOpen 
              ? 'opacity-100 max-h-screen' 
              : 'opacity-0 max-h-0 overflow-hidden'
          }`}
          id="mobile-menu"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === '/'
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
              }`}
            >
              Home
            </Link>
            <a
              href="#projects"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
            >
              Projects
            </a>
            <a
              href="#how-it-works"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
            >
              How It Works
            </a>
            
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-3 space-x-3">
                {/* Mobile Wallet Connection Button */}
                {connectedAccount ? (
                  <button
                    type="button"
                    className="btn-primary text-xs w-full"
                  >
                    <span className="flex items-center justify-center">
                      <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                      {truncate(connectedAccount, 4, 4, 11)}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-primary text-xs w-full"
                    onClick={connectWallet}
                  >
                    Connect Wallet
                  </button>
                )}

                {/* Mobile User Authentication Button */}
                {user ? (
                  <button
                    type="button"
                    className="btn-secondary text-xs w-full"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-secondary text-xs w-full"
                    onClick={() => {
                      setShowAuthModal(true);
                      setIsMenuOpen(false);
                    }}
                  >
                    {authLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                      </span>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="auth-modal"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" 
              aria-hidden="true"
              onClick={() => setShowAuthModal(false)}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-fade-in">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 
                      className="text-xl font-semibold text-gray-900 mb-1"
                      id="auth-modal-title"
                    >
                      {isSignUp ? 'Create an Account' : 'Sign In to Your Account'}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {isSignUp 
                        ? 'Join CrowdChain to create and back blockchain-based crowdfunding projects' 
                        : 'Welcome back! Sign in to access your account'}
                    </p>
                    <div className="mt-4">
                      <form onSubmit={handleAuth} className="space-y-4">
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input mt-1"
                            autoComplete="email"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                          </label>
                          <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input mt-1"
                            autoComplete={isSignUp ? 'new-password' : 'current-password'}
                            required
                          />
                        </div>
                        {authError && (
                          <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100" role="alert">
                            {authError}
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                          <button
                            type="button"
                            className="text-sm text-primary-600 hover:text-primary-500"
                            onClick={() => setIsSignUp(!isSignUp)}
                          >
                            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                          </button>
                          <button
                            type="submit"
                            className="btn-primary"
                            disabled={authLoading}
                          >
                            {authLoading ? (
                              <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                              </span>
                            ) : (
                              isSignUp ? 'Sign Up' : 'Sign In'
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="btn-outline w-full sm:w-auto"
                  onClick={() => setShowAuthModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Header
