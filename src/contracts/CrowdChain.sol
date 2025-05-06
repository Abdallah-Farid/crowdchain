//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CrowdChain is ReentrancyGuard {
    address public owner;
    uint public projectTax;
    uint public projectCount;
    uint public balance;
    statsStruct public stats;
    projectStruct[] projects;

    mapping(address => projectStruct[]) projectsOf;
    mapping(uint => backerStruct[]) backersOf;
    mapping(uint => bool) public projectExist;
    mapping(uint => milestoneStruct[]) milestonesOf;
    mapping(uint => mapping(address => mapping(uint => bool))) public milestoneVoted;

    enum statusEnum {
        OPEN,
        APPROVED,
        REVERTED,
        DELETED,
        PAIDOUT
    }

    enum milestoneStatusEnum {
        PENDING,
        APPROVED,
        REJECTED,
        EXECUTED
    }

    struct statsStruct {
        uint totalProjects;
        uint totalBacking;
        uint totalDonations;
        uint totalMilestones;
        uint totalMilestonesCompleted;
    }

    struct backerStruct {
        address owner;
        uint contribution;
        uint timestamp;
        bool refunded;
    }

    struct milestoneStruct {
        uint id;
        string title;
        string description;
        uint amount;
        uint yesVotes;
        uint noVotes;
        uint createdAt;
        uint completedAt;
        milestoneStatusEnum status;
    }

    struct projectStruct {
        uint id;
        address owner;
        string title;
        string description;
        string imageURL;
        uint cost;
        uint raised;
        uint timestamp;
        uint expiresAt;
        uint backers;
        uint milestoneCount;
        uint milestonesCompleted;
        bool hasMilestones;
        statusEnum status;
    }

    modifier ownerOnly(){
        require(msg.sender == owner, "Owner reserved only");
        _;
    }

    modifier projectOwnerOnly(uint projectId){
        require(msg.sender == projects[projectId].owner, "Project owner reserved only");
        _;
    }

    modifier validProject(uint projectId){
        require(projectExist[projectId], "Project not found");
        _;
    }

    modifier isContributor(uint projectId){
        bool contributorFound = false;
        
        for(uint i = 0; i < backersOf[projectId].length; i++) {
            if(backersOf[projectId][i].owner == msg.sender) {
                contributorFound = true;
                break;
            }
        }
        
        require(contributorFound, "Only contributors can vote on milestones");
        _;
    }

    event Action (
        uint256 id,
        string actionType,
        address indexed executor,
        uint256 timestamp
    );

    event MilestoneAction (
        uint256 projectId,
        uint256 milestoneId,
        string actionType,
        address indexed executor,
        uint256 timestamp
    );

    constructor(uint _projectTax) {
        owner = msg.sender;
        projectTax = _projectTax;
    }

    function createProject(
        string memory title,
        string memory description,
        string memory imageURL,
        uint cost,
        uint expiresAt,
        bool _hasMilestones
    ) public returns (bool) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(bytes(imageURL).length > 0, "ImageURL cannot be empty");
        require(cost > 0 ether, "Cost cannot be zero");

        projectStruct memory project;
        project.id = projectCount;
        project.owner = msg.sender;
        project.title = title;
        project.description = description;
        project.imageURL = imageURL;
        project.cost = cost;
        project.timestamp = block.timestamp;
        project.expiresAt = expiresAt;
        project.hasMilestones = _hasMilestones;

        projects.push(project);
        projectExist[projectCount] = true;
        projectsOf[msg.sender].push(project);
        stats.totalProjects += 1;

        emit Action (
            projectCount++,
            "PROJECT CREATED",
            msg.sender,
            block.timestamp
        );
        return true;
    }

    function updateProject(
        uint id,
        string memory title,
        string memory description,
        string memory imageURL,
        uint expiresAt
    ) public returns (bool) {
        require(msg.sender == projects[id].owner, "Unauthorized Entity");
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(bytes(imageURL).length > 0, "ImageURL cannot be empty");

        projects[id].title = title;
        projects[id].description = description;
        projects[id].imageURL = imageURL;
        projects[id].expiresAt = expiresAt;

        emit Action (
            id,
            "PROJECT UPDATED",
            msg.sender,
            block.timestamp
        );

        return true;
    }

    function deleteProject(uint id) public nonReentrant returns (bool) {
        require(projects[id].status == statusEnum.OPEN, "Project no longer opened");
        require(msg.sender == projects[id].owner, "Unauthorized Entity");

        projects[id].status = statusEnum.DELETED;
        performRefund(id);

        emit Action (
            id,
            "PROJECT DELETED",
            msg.sender,
            block.timestamp
        );

        return true;
    }

    function performRefund(uint id) internal {
        for(uint i = 0; i < backersOf[id].length; i++) {
            address _owner = backersOf[id][i].owner;
            uint _contribution = backersOf[id][i].contribution;
            
            backersOf[id][i].refunded = true;
            backersOf[id][i].timestamp = block.timestamp;
            payTo(_owner, _contribution);

            stats.totalBacking -= 1;
            stats.totalDonations -= _contribution;
        }
    }

    function backProject(uint id) public payable nonReentrant returns (bool) {
        require(msg.value > 0 ether, "Ether must be greater than zero");
        require(projectExist[id], "Project not found");
        require(projects[id].status == statusEnum.OPEN, "Project no longer opened");

        stats.totalBacking += 1;
        stats.totalDonations += msg.value;
        projects[id].raised += msg.value;
        projects[id].backers += 1;

        backersOf[id].push(
            backerStruct(
                msg.sender,
                msg.value,
                block.timestamp,
                false
            )
        );

        emit Action (
            id,
            "PROJECT BACKED",
            msg.sender,
            block.timestamp
        );

        if(projects[id].raised >= projects[id].cost) {
            projects[id].status = statusEnum.APPROVED;
            balance += projects[id].raised;
            
            // If project has milestones, don't perform payout immediately
            if(!projects[id].hasMilestones) {
                performPayout(id);
            }
            
            return true;
        }

        if(block.timestamp >= projects[id].expiresAt) {
            projects[id].status = statusEnum.REVERTED;
            performRefund(id);
            return true;
        }

        return true;
    }

    function performPayout(uint id) internal {
        uint raised = projects[id].raised;
        uint tax = (raised * projectTax) / 100;

        projects[id].status = statusEnum.PAIDOUT;

        payTo(projects[id].owner, (raised - tax));
        payTo(owner, tax);

        balance -= projects[id].raised;

        emit Action (
            id,
            "PROJECT PAID OUT",
            msg.sender,
            block.timestamp
        );
    }

    function requestRefund(uint id) public nonReentrant returns (bool) {
        require(
            projects[id].status == statusEnum.REVERTED ||
            projects[id].status == statusEnum.DELETED,
            "Project not marked as revert or delete"
        );
        
        projects[id].status = statusEnum.REVERTED;
        performRefund(id);
        return true;
    }

    function payOutProject(uint id) public nonReentrant returns (bool) {
        require(projects[id].status == statusEnum.APPROVED, "Project not APPROVED");
        require(
            msg.sender == projects[id].owner ||
            msg.sender == owner,
            "Unauthorized Entity"
        );
        
        // If project has milestones, all milestones must be completed before payout
        if(projects[id].hasMilestones) {
            require(
                projects[id].milestonesCompleted == projects[id].milestoneCount && 
                projects[id].milestoneCount > 0,
                "All milestones must be completed before payout"
            );
        }

        performPayout(id);
        return true;
    }

    function changeTax(uint _taxPct) public ownerOnly {
        projectTax = _taxPct;
    }

    // Milestone-related functions
    
    function createMilestone(
        uint projectId,
        string memory title,
        string memory description,
        uint amount
    ) public projectOwnerOnly(projectId) validProject(projectId) returns (bool) {
        require(projects[projectId].hasMilestones, "Project does not support milestones");
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(amount > 0 ether, "Amount must be greater than zero");
        
        // Check that total milestone amounts don't exceed project raised amount
        uint totalMilestoneAmount = 0;
        for(uint i = 0; i < milestonesOf[projectId].length; i++) {
            totalMilestoneAmount += milestonesOf[projectId][i].amount;
        }
        
        require(
            totalMilestoneAmount + amount <= projects[projectId].cost,
            "Total milestone amounts cannot exceed project cost"
        );
        
        uint milestoneId = projects[projectId].milestoneCount;
        
        milestoneStruct memory milestone;
        milestone.id = milestoneId;
        milestone.title = title;
        milestone.description = description;
        milestone.amount = amount;
        milestone.createdAt = block.timestamp;
        milestone.status = milestoneStatusEnum.PENDING;
        
        milestonesOf[projectId].push(milestone);
        projects[projectId].milestoneCount += 1;
        stats.totalMilestones += 1;
        
        emit MilestoneAction(
            projectId,
            milestoneId,
            "MILESTONE CREATED",
            msg.sender,
            block.timestamp
        );
        
        return true;
    }
    
    function voteMilestone(
        uint projectId,
        uint milestoneId,
        bool approve
    ) public validProject(projectId) isContributor(projectId) returns (bool) {
        require(projects[projectId].hasMilestones, "Project does not support milestones");
        require(milestoneId < projects[projectId].milestoneCount, "Milestone not found");
        require(milestonesOf[projectId][milestoneId].status == milestoneStatusEnum.PENDING, "Milestone not in pending state");
        require(!milestoneVoted[projectId][msg.sender][milestoneId], "Already voted on this milestone");
        
        milestoneVoted[projectId][msg.sender][milestoneId] = true;
        
        if(approve) {
            milestonesOf[projectId][milestoneId].yesVotes += 1;
        } else {
            milestonesOf[projectId][milestoneId].noVotes += 1;
        }
        
        emit MilestoneAction(
            projectId,
            milestoneId,
            approve ? "MILESTONE VOTE YES" : "MILESTONE VOTE NO",
            msg.sender,
            block.timestamp
        );
        
        return true;
    }
    
    function executeMilestone(
        uint projectId,
        uint milestoneId
    ) public validProject(projectId) nonReentrant returns (bool) {
        require(
            msg.sender == projects[projectId].owner || msg.sender == owner,
            "Only project owner or contract owner can execute milestone"
        );
        require(projects[projectId].hasMilestones, "Project does not support milestones");
        require(milestoneId < projects[projectId].milestoneCount, "Milestone not found");
        require(milestonesOf[projectId][milestoneId].status == milestoneStatusEnum.PENDING, "Milestone not in pending state");
        
        // Milestone can be executed if it has more yes votes than no votes
        require(
            milestonesOf[projectId][milestoneId].yesVotes > milestonesOf[projectId][milestoneId].noVotes,
            "Milestone does not have enough yes votes"
        );
        
        milestonesOf[projectId][milestoneId].status = milestoneStatusEnum.EXECUTED;
        milestonesOf[projectId][milestoneId].completedAt = block.timestamp;
        
        projects[projectId].milestonesCompleted += 1;
        stats.totalMilestonesCompleted += 1;
        
        // Release funds for this milestone to the project owner
        uint amount = milestonesOf[projectId][milestoneId].amount;
        payTo(projects[projectId].owner, amount);
        balance -= amount;
        
        emit MilestoneAction(
            projectId,
            milestoneId,
            "MILESTONE EXECUTED",
            msg.sender,
            block.timestamp
        );
        
        return true;
    }
    
    function rejectMilestone(
        uint projectId,
        uint milestoneId
    ) public ownerOnly validProject(projectId) returns (bool) {
        require(projects[projectId].hasMilestones, "Project does not support milestones");
        require(milestoneId < projects[projectId].milestoneCount, "Milestone not found");
        require(milestonesOf[projectId][milestoneId].status == milestoneStatusEnum.PENDING, "Milestone not in pending state");
        
        milestonesOf[projectId][milestoneId].status = milestoneStatusEnum.REJECTED;
        
        emit MilestoneAction(
            projectId,
            milestoneId,
            "MILESTONE REJECTED",
            msg.sender,
            block.timestamp
        );
        
        return true;
    }

    function getProject(uint id) public view returns (projectStruct memory) {
        require(projectExist[id], "Project not found");

        return projects[id];
    }
    
    function getProjects() public view returns (projectStruct[] memory) {
        return projects;
    }
    
    function getBackers(uint id) public view returns (backerStruct[] memory) {
        return backersOf[id];
    }
    
    function getMilestones(uint projectId) public view returns (milestoneStruct[] memory) {
        require(projectExist[projectId], "Project not found");
        return milestonesOf[projectId];
    }
    
    function getMilestone(uint projectId, uint milestoneId) public view returns (milestoneStruct memory) {
        require(projectExist[projectId], "Project not found");
        require(milestoneId < projects[projectId].milestoneCount, "Milestone not found");
        return milestonesOf[projectId][milestoneId];
    }

    function payTo(address to, uint256 amount) internal {
        (bool success, ) = payable(to).call{value: amount}("");
        require(success);
    }

    /// @notice Prevent accidental ETH transfers
    receive() external payable {
        revert("Use backProject to fund the project");
    }
    fallback() external payable {
        revert("Use backProject to fund the project");
    }
}
