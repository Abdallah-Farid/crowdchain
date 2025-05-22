import { setGlobalState, useGlobalState } from '../store'
import { FaLightbulb, FaEthereum, FaCheckCircle } from 'react-icons/fa'

const Hero = () => {
  const [stats] = useGlobalState('stats')

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 pt-16">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <svg className="absolute left-0 top-0 h-full w-full" width="100%" height="100%" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="800" height="800" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container-custom relative z-10 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 mb-6 animate-pulse-light">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                Decentralized Crowdfunding
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
              <span className="block">Bring creative projects</span>
              <span className="block text-primary-600">to life with blockchain</span>
            </h1>
            
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto lg:mx-0">
              CrowdChain is a decentralized crowdfunding platform that uses milestone-based funding to ensure 
              transparency and accountability for all projects.
            </p>
            
            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4">
              <button
                type="button"
                className="btn-primary btn-lg"
                onClick={() => setGlobalState('createModal', 'scale-100')}
                aria-label="Start a project"
              >
                Start a Project
              </button>

              <a
                href="#projects"
                className="btn-secondary btn-lg"
                aria-label="Explore projects"
              >
                Explore Projects
              </a>
            </div>
          </div>
          
          <div className="hidden lg:block">
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
              <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-8 right-20 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>
              
              {/* Main image */}
              <div className="relative">
                <div className="w-full h-full rounded-2xl overflow-hidden shadow-card">
                  <img 
                    src="/images.jpg" 
                    alt="People collaborating on a project" 
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Floating card elements */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-card animate-fade-in">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <FaEthereum className="text-primary-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Secure Funding</div>
                        <div className="text-sm font-semibold">Smart Contracts</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <FaCheckCircle className="text-green-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Transparent</div>
                        <div className="text-sm font-semibold">Milestone Tracking</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="mt-16 md:mt-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 text-center hover:border-primary-200 hover:translate-y-[-4px]">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {stats?.totalProjects || 0}
              </div>
              <div className="text-gray-600 font-medium">Projects Launched</div>
            </div>
            
            <div className="card p-6 text-center hover:border-primary-200 hover:translate-y-[-4px]">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {stats?.totalBacking || 0}
              </div>
              <div className="text-gray-600 font-medium">Total Backings</div>
            </div>
            
            <div className="card p-6 text-center hover:border-primary-200 hover:translate-y-[-4px]">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4 mx-auto">
                <FaEthereum className="h-6 w-6 text-primary-600" />
              </div>
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {stats?.totalDonations || 0} ETH
              </div>
              <div className="text-gray-600 font-medium">Funds Raised</div>
            </div>
          </div>
        </div>
        
        {/* How It Works Section */}
        <div className="mt-24" id="how-it-works">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How CrowdChain Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform combines the power of blockchain with milestone-based funding to create a transparent and accountable crowdfunding experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-8 hover:border-primary-200 hover:translate-y-[-4px]">
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mb-6 mx-auto md:mx-0">
                <FaLightbulb className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center md:text-left">Create a Project</h3>
              <p className="text-gray-600 text-center md:text-left">
                Define your project with clear milestones and funding goals. Each milestone represents a specific deliverable with its own timeline and budget.
              </p>
            </div>
            
            <div className="card p-8 hover:border-primary-200 hover:translate-y-[-4px]">
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mb-6 mx-auto md:mx-0">
                <FaEthereum className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center md:text-left">Get Funded</h3>
              <p className="text-gray-600 text-center md:text-left">
                Backers contribute ETH to your project. Funds are held in a smart contract and released as milestones are completed, ensuring accountability.
              </p>
            </div>
            
            <div className="card p-8 hover:border-primary-200 hover:translate-y-[-4px]">
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mb-6 mx-auto md:mx-0">
                <FaCheckCircle className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center md:text-left">Complete Milestones</h3>
              <p className="text-gray-600 text-center md:text-left">
                As you complete each milestone, backers vote to approve and release the next portion of funds to continue your project development.
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <button
              type="button"
              className="btn-primary"
              onClick={() => setGlobalState('createModal', 'scale-100')}
            >
              Start Your Project Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
