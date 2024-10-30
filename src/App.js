import './App.css';
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaChevronLeft, FaChevronRight, FaFilter } from "react-icons/fa";
import { Modal, Button, Form } from "react-bootstrap";
import Dropdown from 'react-bootstrap/Dropdown';
import Multiselect from 'multiselect-react-dropdown';
import { TailSpin } from 'react-loader-spinner';  
import { toast, ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const [users, setUsers] = useState([]);
  const [cloneUsers, setCloneUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const itemsPerPage = [10, 20, 50, 100];
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [states, setStates] = useState([]);
  const [selectedStates, setSelectedStates] = useState([]);
  const [constant, setConstant] = useState(0);
  const [website, setWebsite] = useState("");
  const [allCount, setAllCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [locations, setLocations] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [locationId, setLocationId] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(""); 
  const [loading, setLoading] = useState(true);  

  // Fetch users
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Setting loader to true before fetching data
      try {
        const response = await axios.post("https://leadsystem.highsierraleads.com/get-users");
        const usersData = response.data.users;
        setUsers(usersData);
        setCloneUsers(usersData); // Clone for sorting and filtering

        setAllCount(usersData.length);
        setActiveCount(usersData.filter(user => user.active).length);
        setInactiveCount(usersData.filter(user => !user.active).length);
        
        // Extract unique locations
        const uniqueLocations = [...new Set(usersData.map(user => user.location_name))];
        setLocations(uniqueLocations);
      } catch (error) {
        toast.error("Something went wrong! Please try again later."); 
        // console.error("Error fetching data:", error);
      } finally {
        setLoading(false); 
      }
    };
    fetchData();
  }, []);

  // Fetch states
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await axios.get("https://leadsystem.highsierraleads.com/get-states");
        setStates(response.data.states);
      } catch (error) {
        toast.error("Something went wrong! Please try again later."); 
        // console.error("Error fetching states:", error);
      }
    };
    fetchStates();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Filtered users by search term and selected locations
  const filteredUsers = cloneUsers
    .filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(user => 
      selectedLocations.length === 0 || selectedLocations.includes(user.location_name)
    );

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  let currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle Edit User
  const handleEdit = (user) => {
    // setEditUser(user);
    // setShowEditModal(true);

    setEditUser(user);
    setSelectedStates(user.states);
    setConstant(user.constant);
    setWebsite(user.website);
    setLocationId(user.location_id); 
    setShowEditModal(true);
    
  };



  const handleSave = async () => {
    try {
      let payload = {
        user_id: editUser.user_id,
        
        website: website,
        location_id: locationId,
      };
  
      let resp = await axios.post("https://leadsystem.highsierraleads.com/user/update", payload);
  
      if (resp.data) {
        // Create new updated users array
        let updatedUsers = users.map((user) =>
          user.user_id === editUser.user_id ? { ...user, ...payload } : user
        );
        toast.success("URL is updated")
        setUsers(updatedUsers);
        setCloneUsers(updatedUsers);
  
        // Close the modal after saving
        setShowEditModal(false);
      } else {
        toast.error("fail to update URL")
        alert("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };
  


  const toggleUserStatus = async (userId, isCurrentlyActive) => {
    try {
        let newStatus = !isCurrentlyActive; 
        
        let resp = await axios.post("https://leadsystem.highsierraleads.com/user/status-toggle", {
            user_id: userId,
            active: newStatus, 
        });

        if (resp.data) {
            let updatedUsers = users.map(user =>
                user.user_id === userId ? { ...user, active: newStatus } : user
            );
            setUsers(updatedUsers);
            setCloneUsers(updatedUsers);
            setActiveCount(updatedUsers.filter(user => user.active).length);
            setInactiveCount(updatedUsers.filter(user => !user.active).length);
        } else {
            alert("Something went wrong! Please try again.");
        }
    } catch (error) {
        console.error("Error toggling user status:", error);
    }
};


  // Handle sorting by Name, Lead Count, and Constant
  const handleSort = (field, order) => {
    const sortedUsers = [...cloneUsers].sort((a, b) => {
      if (order === 'asc' || order === 'min') {
        return a[field] > b[field] ? 1 : -1;
      } else {
        return a[field] < b[field] ? 1 : -1;
      }
    });
    setCloneUsers(sortedUsers);
  };

  // Handle location filter
  // const handleLocationChange = (selectedList) => {
  //   setSelectedLocations(selectedList);
  // };

  const handleLocationChange = (selectedList) => {
    setSelectedLocations(selectedList);
  
    // Filter users by the selected locations
    const filteredUsersByLocation = cloneUsers.filter(user =>
      selectedList.length === 0 || selectedList.includes(user.location_name)
    );
  
    // Recalculate active and inactive counts based on the filtered users
    setActiveCount(filteredUsersByLocation.filter(user => user.active).length);
    setInactiveCount(filteredUsersByLocation.filter(user => !user.active).length);
    setAllCount(filteredUsersByLocation.length);
  
    // Update the filtered users to display in the table
    setUsers(filteredUsersByLocation);
  };
  

  return (
    <div className="table-container">
      {loading ? (
         <div className="loader-container">
         <TailSpin color="#00BFFF" height={80} width={80} />
       </div>
     ) : (
       <>
      <div className="header-bg">
        <header className="desktop-header">
          <h1>Dashboard</h1>
          <div className="search-folder">
            <input
              type="text"
              placeholder="Search by Name or Email ..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
        </header>
      </div>

      <div className="status-counts">
        <span className="count-btn">All({allCount})</span>
        {/* <span className="count-btn">Active({activeCount})</span>
        <span className="count-btn">Inactive({inactiveCount})</span> */}
      </div>

      {/* Multi-Select Dropdown for Location Filter */}
      {/* <div className='locations-drp'>
        <Multiselect
          options={locations}
          isObject={false}
          selectedValues={selectedLocations}
          onSelect={handleLocationChange}
          onRemove={handleLocationChange}
          placeholder="Filter by Location"
          showCheckbox
          closeOnSelect={false}
          avoidHighlightFirstOption
        />
      </div> */}

      <table className="user-table">
        <thead>
          <tr>
            <th>Sr No.</th>
            <th>
              <Dropdown>
                <Dropdown.Toggle variant="string" id="string">
                  NAME
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => handleSort('name', 'asc')}>
                    A to Z
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleSort('name', 'desc')}>
                    Z to A
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </th>
            <th>Email</th>
            <th>Phone</th>
            <th>Website</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user, index) => (
            <tr key={user.user_id}>
              <td>{index + 1 + indexOfFirstUser}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone || "N/A"}</td>
              <td>
                  {user.website ? (
                    <a href={user.website} target="_blank" rel="noopener noreferrer">
                      {user.website}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </td>
              
              <td>
                <button onClick={() => handleEdit(user)} className='Edit-Button'>✏️Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>


      {/* Mobile view */}
      <div className="mobile-user-table">
        
    
  <div className="location-dropdown-center">
</div>

        {currentUsers.length > 0 ? (
          currentUsers.map((user) => (
            <div key={user.user_id} className="mobile-user">
              <div className="status-row">
                <button className='Edit-Button' onClick={() => handleEdit(user)}>✏️Edit</button>
              </div>

              <div className="column">
                  <span>
                 
                  {user.website ? (
                    <a href={user.website} target="_blank" rel="noopener noreferrer">
                      {user.website}
                    </a>
                  ) : (
                    "N/A"
                  )}
                
                  </span>
                  
                </div>
                <br></br>
              <div className="info-row">
                <span className="info-left">Name: </span> 
                <span className="info-right"> {user.name}</span> 
              </div>
              <div className="info-row">
              <span className="info-left">Email: </span>
                <span className="info-right">{user.email}</span>
              </div>
              <div className="info-details">
                <div className="column">
                  <span className="th">Phone: </span>
                  <span>{user.phone || "N/A"}</span>
                </div> 
              </div>
            </div>
          ))
        ) : (
          <div>No data available</div>
        )}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <div className="pagination-controls">
          <FaChevronLeft
            onClick={() => handlePageChange(currentPage > 1 ? currentPage - 1 : 1)}
          />
          {Array.from({ length: totalPages }, (_, i) => (
            <span
              key={i + 1}
              className={i + 1 === currentPage ? "active" : ""}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </span>
          ))}
          <FaChevronRight
            onClick={() => handlePageChange(currentPage < totalPages ? currentPage + 1 : totalPages)}
          />
        </div>
        <div className="pagination-items-per-page">
         
          <Dropdown>
            <Dropdown.Toggle variant="string" id="string">
              {usersPerPage}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {itemsPerPage.map((item) => (
                <Dropdown.Item key={item} onClick={() => setUsersPerPage(item)}>
                  {item}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Participant</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            
            <Form.Group controlId="website">
              <Form.Label>Website URL</Form.Label>
              <Form.Control
                type="url"
                placeholder="Enter website URL"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </Form.Group>
            
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
      </>
     )}
     <ToastContainer/>
    </div>
  );
};

export default App;