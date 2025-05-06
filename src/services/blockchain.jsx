import abi from '../abis/src/contracts/CrowdChain.sol/CrowdChain.json'
import { getGlobalState, setGlobalState } from '../store'
import { ethers } from 'ethers'

const { ethereum } = window
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS
const contractAbi = abi.abi
let tx

const network = process.env.REACT_APP_NETWORK || 'goerli'
const infuraProjectId = process.env.REACT_APP_INFURA_PROJECT_ID
const infuraProjectSecret = process.env.REACT_APP_INFURA_PROJECT_SECRET

const connectWallet = async () => {
  try {
    if (!ethereum) return alert('Please install Metamask')
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
    setGlobalState('connectedAccount', accounts[0]?.toLowerCase())
  } catch (error) {
    reportError(error)
  }
}

const isWallectConnected = async () => {
  try {
    if (!ethereum) return alert('Please install Metamask')

    // For local network, ensure MetaMask is on Hardhat chain
    if (network === 'localhost' || network === 'hardhat') {
      const localChainId = '0x7A69' // 31337 in hex
      try {
        await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: localChainId }] })
      } catch (switchError) {
        if (switchError.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{ chainId: localChainId, chainName: 'Hardhat Local', rpcUrls: ['http://127.0.0.1:8545'], nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 } }]
          })
        } else {
          throw switchError
        }
      }
    }
    const accounts = await ethereum.request({ method: 'eth_accounts' })
    setGlobalState('connectedAccount', accounts[0]?.toLowerCase())

    window.ethereum.on('chainChanged', (chainId) => {
      window.location.reload()
    })

    window.ethereum.on('accountsChanged', async () => {
      setGlobalState('connectedAccount', accounts[0]?.toLowerCase())
      await isWallectConnected()
    })

    if (accounts.length) {
      setGlobalState('connectedAccount', accounts[0]?.toLowerCase())
    } else {
      alert('Please connect wallet.')
      console.log('No accounts found.')
    }
  } catch (error) {
    reportError(error)
  }
}

const getDefaultProvider = () => {
  // Local hardhat/localhost network uses JSON-RPC provider
  if (network === 'localhost' || network === 'hardhat') {
    return new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')
  }
  // Otherwise fall back to Infura for public testnets/mainnet
  return new ethers.providers.InfuraProvider(network, {
    projectId: infuraProjectId,
    projectSecret: infuraProjectSecret,
  })
}

const getEtheriumContract = async () => {
  const defaultProvider = getDefaultProvider()

  if (window.ethereum) {
    // Ensure MetaMask is on Hardhat local chain if needed
    if (network === 'localhost' || network === 'hardhat') {
      const localChainId = '0x7A69'
      try {
        await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: localChainId }] })
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [{ chainId: localChainId, chainName: 'Hardhat Local', rpcUrls: ['http://127.0.0.1:8545'], nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 } }] })
        } else {
          throw switchError
        }
      }
    }
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
    await window.ethereum.request({ method: 'eth_requestAccounts' })
    const signer = web3Provider.getSigner()
    return new ethers.Contract(contractAddress, contractAbi, signer)
  }

  // Fallback read-only provider
  return new ethers.Contract(contractAddress, contractAbi, defaultProvider)
}

const createProject = async ({
  title,
  description,
  imageURL,
  cost,
  expiresAt,
  hasMilestones,
  milestones = [],
}) => {
  try {
    if (!window.ethereum) return alert('Please install Metamask')

    const contract = await getEtheriumContract()
    cost = ethers.utils.parseEther(cost)
    
    // Create the project first
    tx = await contract.createProject(title, description, imageURL, cost, expiresAt, hasMilestones)
    await tx.wait()
    
    // If project has milestones, create them
    if (hasMilestones && milestones.length > 0) {
      // Get the newly created project ID
      const projects = await contract.getProjects()
      const projectId = projects[projects.length - 1].id.toNumber()
      
      // Create each milestone
      for (const milestone of milestones) {
        const milestoneAmount = ethers.utils.parseEther(milestone.amount)
        tx = await contract.createMilestone(
          projectId,
          milestone.title,
          milestone.description,
          milestoneAmount
        )
        await tx.wait()
      }
    }
    
    await loadProjects()
  } catch (error) {
    reportError(error)
  }
}

const updateProject = async ({
  id,
  title,
  description,
  imageURL,
  expiresAt,
}) => {
  try {
    if (!window.ethereum) return alert('Please install Metamask')

    const contract = await getEtheriumContract()
    tx = await contract.updateProject(id, title, description, imageURL, expiresAt)
    await tx.wait()
    await loadProject(id)
  } catch (error) {
    reportError(error)
  }
}

const deleteProject = async (id) => {
  try {
    if (!window.ethereum) return alert('Please install Metamask')
    const contract = await getEtheriumContract()
    await contract.deleteProject(id)
  } catch (error) {
    reportError(error)
  }
}

const loadProjects = async () => {
  try {
    // Read-only: use JSON-RPC provider to avoid Metamask network mismatch
    const contract = new ethers.Contract(contractAddress, contractAbi, getDefaultProvider())
    const projects = await contract.getProjects()
    const stats = await contract.stats()

    setGlobalState('stats', structureStats(stats))
    setGlobalState('projects', structuredProjects(projects))
  } catch (error) {
    reportError(error)
  }
}

const loadProject = async (id) => {
  try {
    // Read-only: use JSON-RPC provider to avoid Metamask network mismatch
    const contract = new ethers.Contract(contractAddress, contractAbi, getDefaultProvider())
    const project = await contract.getProject(id)

    setGlobalState('project', structuredProjects([project])[0])
  } catch (error) {
    alert(JSON.stringify(error.message))
    reportError(error)
  }
}

const backProject = async (id, amount) => {
  try {
    if (!window.ethereum) return alert('Please install Metamask')
    const connectedAccount = getGlobalState('connectedAccount')
    const contract = await getEtheriumContract()
    amount = ethers.utils.parseEther(amount)

    tx = await contract.backProject(id, {
      from: connectedAccount,
      value: amount._hex,
    })

    await tx.wait()
    await getBackers(id)
  } catch (error) {
    reportError(error)
  }
}

const getBackers = async (id) => {
  try {
    // Read-only: use JSON-RPC provider to avoid Metamask network mismatch
    const contract = new ethers.Contract(contractAddress, contractAbi, getDefaultProvider())
    let backers = await contract.getBackers(id)

    setGlobalState('backers', structuredBackers(backers))
  } catch (error) {
    reportError(error)
  }
}

const payoutProject = async (id) => {
  try {
    if (!window.ethereum) return alert('Please install Metamask')
    const connectedAccount = getGlobalState('connectedAccount')
    const contract = await getEtheriumContract()

    tx = await contract.payOutProject(id, {
      from: connectedAccount,
    })

    await tx.wait()
    await getBackers(id)
  } catch (error) {
    reportError(error)
  }
}

// Milestone-related functions
const createMilestone = async (projectId, title, description, amount) => {
  try {
    if (!window.ethereum) return alert('Please install Metamask')
    const contract = await getEtheriumContract()
    amount = ethers.utils.parseEther(amount)

    tx = await contract.createMilestone(projectId, title, description, amount)
    await tx.wait()
    await getMilestones(projectId)
  } catch (error) {
    reportError(error)
  }
}

const voteMilestone = async (projectId, milestoneId, approve) => {
  try {
    if (!window.ethereum) return alert('Please install Metamask')
    const contract = await getEtheriumContract()

    tx = await contract.voteMilestone(projectId, milestoneId, approve)
    await tx.wait()
    await getMilestones(projectId)
  } catch (error) {
    reportError(error)
  }
}

const executeMilestone = async (projectId, milestoneId) => {
  try {
    if (!window.ethereum) return alert('Please install Metamask')
    const contract = await getEtheriumContract()

    tx = await contract.executeMilestone(projectId, milestoneId)
    await tx.wait()
    await getMilestones(projectId)
    await loadProject(projectId) // Reload project to update milestone counts
  } catch (error) {
    reportError(error)
  }
}

const rejectMilestone = async (projectId, milestoneId) => {
  try {
    if (!window.ethereum) return alert('Please install Metamask')
    const contract = await getEtheriumContract()

    tx = await contract.rejectMilestone(projectId, milestoneId)
    await tx.wait()
    await getMilestones(projectId)
  } catch (error) {
    reportError(error)
  }
}

const getMilestones = async (projectId) => {
  try {
    // Read-only: use JSON-RPC provider to avoid Metamask network mismatch
    const contract = new ethers.Contract(contractAddress, contractAbi, getDefaultProvider())
    let milestones = await contract.getMilestones(projectId)

    setGlobalState('milestones', structuredMilestones(milestones))
  } catch (error) {
    reportError(error)
  }
}

const structuredMilestones = (milestones) =>
  milestones
    .map((milestone) => ({
      id: milestone.id.toNumber(),
      title: milestone.title,
      description: milestone.description,
      amount: parseInt(milestone.amount._hex) / 10 ** 18,
      yesVotes: milestone.yesVotes.toNumber(),
      noVotes: milestone.noVotes.toNumber(),
      createdAt: new Date(milestone.createdAt.toNumber() * 1000).toJSON(),
      completedAt: milestone.completedAt.toNumber() > 0 
        ? new Date(milestone.completedAt.toNumber() * 1000).toJSON() 
        : null,
      status: milestone.status,
    }))

const structuredBackers = (backers) =>
  backers
    .map((backer) => ({
      owner: backer.owner.toLowerCase(),
      refunded: backer.refunded,
      timestamp: new Date(backer.timestamp.toNumber() * 1000).toJSON(),
      contribution: parseInt(backer.contribution._hex) / 10 ** 18,
    }))
    .reverse()

const structuredProjects = (projects) =>
  projects
    .map((project) => ({
      id: project.id.toNumber(),
      owner: project.owner.toLowerCase(),
      title: project.title,
      description: project.description,
      timestamp: new Date(project.timestamp.toNumber()).getTime(),
      expiresAt: new Date(project.expiresAt.toNumber()).getTime(),
      date: toDate(project.expiresAt.toNumber() * 1000),
      imageURL: project.imageURL,
      raised: parseInt(project.raised._hex) / 10 ** 18,
      cost: parseInt(project.cost._hex) / 10 ** 18,
      backers: project.backers.toNumber(),
      status: project.status,
      hasMilestones: project.hasMilestones,
      milestoneCount: project.milestoneCount ? project.milestoneCount.toNumber() : 0,
      milestonesCompleted: project.milestonesCompleted ? project.milestonesCompleted.toNumber() : 0,
    }))
    .reverse()

const toDate = (timestamp) => {
  const date = new Date(timestamp)
  const dd = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`
  const mm =
    date.getMonth() + 1 > 9 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`
  const yyyy = date.getFullYear()
  return `${yyyy}-${mm}-${dd}`
}

const structureStats = (stats) => ({
  totalProjects: stats.totalProjects.toNumber(),
  totalBacking: stats.totalBacking.toNumber(),
  totalDonations: parseInt(stats.totalDonations._hex) / 10 ** 18,
  totalMilestones: stats.totalMilestones ? stats.totalMilestones.toNumber() : 0,
  totalMilestonesCompleted: stats.totalMilestonesCompleted ? stats.totalMilestonesCompleted.toNumber() : 0,
})

const reportError = (error) => {
  console.error('Blockchain error:', error)
}

export {
  connectWallet,
  isWallectConnected,
  createProject,
  updateProject,
  deleteProject,
  loadProjects,
  loadProject,
  backProject,
  getBackers,
  payoutProject,
  createMilestone,
  voteMilestone,
  executeMilestone,
  rejectMilestone,
  getMilestones,
}
