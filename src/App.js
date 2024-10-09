import './App.css';
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaChevronLeft, FaChevronRight, FaFilter, FaSort } from "react-icons/fa";
import { Modal, Button, Form } from "react-bootstrap";
import Dropdown from 'react-bootstrap/Dropdown';
import Multiselect from 'multiselect-react-dropdown';

const App= () => {
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
const [selectedFilter, setSelectedFilter] = useState(""); 
const [locations, setLocations] = useState([]); 
const [selectedLocation, setSelectedLocation] = useState(""); 
const [locationId, setLocationId] = useState(null);
const [selectedLocations, setSelectedLocations] = useState([]);



  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("https://leadsystem.highsierraleads.com/get-users");
        setUsers(response.data.users);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(()=>{
    setCloneUsers([...users])
  },[users])

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await axios.get("https://leadsystem.highsierraleads.com/get-states");
        setStates(response.data.states);
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };

    fetchStates();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };


  const handleEdit = (user) => {
    setEditUser(user);
    setSelectedStates(user.states);
    setConstant(user.constant);
    setWebsite(user.website);
    setLocationId(user.location_id); 
    setShowEditModal(true);
    
  };

  const handleSave = async () => {
    try {
      await axios.post("https://leadsystem.highsierraleads.com/user/update", {
        user_id: editUser.user_id,
        constant: constant,
        website: website,
        states: selectedStates,
        location_id: locationId,
      });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.user_id === editUser.user_id
            ? { ...user, constant, website, states: selectedStates, location_id: locationId }
            : user
        )
      );
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleStateChange = (state) => {
    setSelectedStates((prev) =>
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]
    );
  };


// Sorting by Name (A-Z, Z-A)
const handleSortByName = (order) => {
  const sortedUsers = [...users].sort((a, b) => {
    if (order === 'asc') {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });
  setUsers(sortedUsers);
};

// Sorting by Lead Count (Max to Min, Min to Max)
const handleSortByLeadCount = (order) => {
  const sortedUsers = [...users].sort((a, b) => {
    if (order === 'max') {
      return b.leads_count - a.leads_count;
    } else {
      return a.leads_count - b.leads_count;
    }
  });
  setUsers(sortedUsers);
};

// Sorting by constant (Max to Min, Min to Max)
const handleSortByConstant = (order) => {
  const sortedUsers = [...users].sort((a, b) => {
    if (order === 'max') {
      return b.constant - a.constant;
    } else {
      return a.constant - b.constant;
    }
  });
  setUsers(sortedUsers);
};

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await axios.post("https://leadsystem.highsierraleads.com/get-users");
      const usersData = response.data.users;
      setUsers(usersData);
      
      // Extract unique locations
      const uniqueLocations = [...new Set(usersData.map(user => user.location_name))];
      setLocations(uniqueLocations);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  fetchData();
}, []);

const filteredUserLocation = users.filter((user) =>
  user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
  (selectedLocation === "" || user.location_name === selectedLocation)
);


useEffect(() => {
  const fetchUsers = async () => {
    try {
      const response = await axios.post("https://leadsystem.highsierraleads.com/get-users");
      const usersData = response.data.users;
      setUsers(usersData);
      
      setAllCount(usersData.length);
      setActiveCount(usersData.filter(user => user.active).length);
      setInactiveCount(usersData.filter(user => !user.active).length);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  fetchUsers();
}, []);

const toggleUserStatus = async (userId) => {
  try {
    await axios.post("https://leadsystem.highsierraleads.com/user/status-toggle", {
      user_id: userId,
    });
    
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.user_id === userId ? { ...user, active: !user.active } : user
      )
    );

    const updatedUsers = users.map(user =>
      user.user_id === userId ? { ...user, active: !user.active } : user
    );
    setAllCount(updatedUsers.length);
    setActiveCount(updatedUsers.filter(user => user.active).length);
    setInactiveCount(updatedUsers.filter(user => !user.active).length);
    
  } catch (error) {
    console.error("Error toggling user status:", error);
  }
};



useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await axios.post("https://leadsystem.highsierraleads.com/get-users");
      setUsers(response.data.users);
      

      const uniqueLocations = [...new Set(response.data.users.map(user => user.location_name))];
      setLocations(uniqueLocations);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  fetchData();
}, []);

const handleLocationChange = async (selectedList) => {
  setSelectedLocations(selectedList);
//  console.log(selectedList)
  // Prepare the location ID array from selected list
  const locationIds = selectedList.map(location => {
    const user = users.find(user => user.location_name === location);
    console.log(user)
    return user ? user.location_id : null;
  }).filter(id => id !== null);

  console.log(locationIds)
  // Make the API call with the selected location IDs
  try {
    const response = await axios.post("https://leadsystem.highsierraleads.com/get-users", {
      locations: locationIds
    });
    setCloneUsers(response.data.users);
  } catch (error) {
    console.error("Error fetching filtered users:", error);
  }
};


  return (
    <div className="table-container">
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
        <span className="count-btn">Active({activeCount})</span>
        <span className="count-btn">Inactive({inactiveCount})</span>
      </div>
      
      {/* Multi-Select Dropdown for Location Filter */}
      <div className='locations-drp'>
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
        </div>
      

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
                  <Dropdown.Item onClick={() => handleSortByName('asc')}>
                    A to Z
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={() => handleSortByName('desc')}>
                    Z to A
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

            </th>
            <th>Email</th>
            <th>Phone</th>
            <th>States</th>
            <th>Locations</th>

            <th><Dropdown>
                <Dropdown.Toggle variant="string" id="string">
                CONSTANT
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => handleSortByConstant('max')}>
                    High to Low
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={() => handleSortByConstant('min')}>
                    Low to High
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </th>
            <th>
            <Dropdown>
                <Dropdown.Toggle variant="string" id="string">
                  LEAD COUNT
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => handleSortByLeadCount('max')}>
                    High to Low
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={() => handleSortByLeadCount('min')}>
                    Low to High
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </th>
            <th>Website</th>
            <th>Status</th>
            <th>Edit</th>
            {/* Location Filter Dropdown */}
            
          </tr>
        </thead>
        <tbody>
        
          {currentUsers.length > 0 ? (
            currentUsers.map((user, index) => (
              <tr key={user.user_id}>
                <td>{indexOfFirstUser + index + 1}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone || "N/A"}</td>
                <td>{user.states.length > 0 ? user.states.join(", ") : "N/A"}</td>
                <td>{user.location_name || "N/A"}</td>
                <td>{user.constant || "N/A"}</td>
                <td>{user.leads_count}</td>
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
                  <button
                  onClick={() => toggleUserStatus(user.user_id)}
                  style={{
                    backgroundColor: user.active ? "#9de09e" : "#faaaab",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "5px",
                  }}>
                  {user.active ? "Active" : "Inactive"}
                </button>
                </td>
                <td>
                  <button onClick={() => handleEdit(user)} className='Edit-Button'>✏️Edit</button>
                </td>
                
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10">No data available</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Mobile view */}
      <div className="mobile-user-table">
        
    <div className="mobile-user-table">
      {/* Filter By Dropdown */}
      
  </div>
  <div className="location-dropdown-center">
  <Dropdown>
    <Dropdown.Toggle variant="warning" id="location-filter-dropdown">
      <FaFilter /> Location
    </Dropdown.Toggle>

    <Dropdown.Menu>
      <Dropdown.Item onClick={() => setSelectedLocation("")}>All Locations</Dropdown.Item>
      {locations.map((location, index) => (
        <Dropdown.Item key={index} onClick={() => setSelectedLocation(location)}>
          {location}
        </Dropdown.Item>
      ))}
    </Dropdown.Menu>
  </Dropdown>
</div>



        {currentUsers.length > 0 ? (
          currentUsers.map((user) => (
            <div key={user.user_id} className="mobile-user">
              <div className="status-row">
                <button onClick={() => toggleUserStatus(user.user_id)}
                    style={{
                        backgroundColor: user.status === "active" ? "#9de09e" : "#faaaab",
                        color: "white",
                        border: "none",
                        padding: "5px 10px",
                        borderRadius: "5px",
                      }} className="status-btn">
                    {user.status === "active" ? "Activate" : "Inactivate"}
                  </button>
                <button className='Edit-Button' onClick={() => handleEdit(user)}>✏️</button>
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
                <span className="info-left">Name:</span> 
                <span className="info-right">{user.name}</span> 
              </div>
              <div className="info-row">
              <span className="info-left">States:</span>
              <span className="info-right">{user.states.length > 0 ? user.states.join(", ") : "N/A"}</span>
              </div>
              <div className="info-row">
              <span className="info-left">Email:</span>
                <span className="info-right">{user.email}</span>
              </div>
              <div className="info-details">
                <div className="column">
                  <span className="th">Phone: </span>
                  <span>{user.phone || "N/A"}</span>
                </div>
                <div className="column">
                  <span className="th">Lead Count: </span>
                  <span>{user.leads_count}</span>
                </div>
                <div className="column">
                  <span className="th">Constant: </span>
                  <span>{user.constant}</span>
                </div>
                <div className="column">
                  <span className="th">Location: </span>
                  <span>{user.location_name || "N/A"}</span>
                </div>
                
              </div>
            </div>
          ))
        ) : (
          <div>No data available</div>
        )}
      </div>

<Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Participant</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="states">
              <Form.Label>States</Form.Label>
              <Multiselect
                options={states} // List of options
                selectedValues={selectedStates} // Preselected values
                onSelect={(selectedList) => setSelectedStates(selectedList)} // Function when an item is selected
                onRemove={(selectedList) => setSelectedStates(selectedList)} // Function when an item is removed
                displayValue="name" // Property to display
                isObject={false} // States array is a list of strings, not objects
              />
            </Form.Group>
            <Form.Group controlId="website">
              <Form.Label>Website URL</Form.Label>
              <Form.Control
                type="url"
                placeholder="Enter website URL"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="constant">
              <Form.Label>Constant (%)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                max="100"
                value={constant}
                onChange={(e) => setConstant(e.target.value)}
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

  <div className="pagination">
  <button
    onClick={() => handlePageChange(currentPage - 1)}
    disabled={currentPage === 1}
  >
   <FaChevronLeft />
  </button>
  
  {Array.from({ length: totalPages }, (_, i) => (
    <button
      key={i + 1}
      onClick={() => handlePageChange(i + 1)}
      className={currentPage === i + 1 ? "active" : ""}
    >
      {i + 1}
    </button>
  ))}

  <button
    onClick={() => handlePageChange(currentPage + 1)}
    disabled={currentPage === totalPages}
  >
    <FaChevronRight />
  </button>

  <select id="itemsPerPage" value={usersPerPage} onChange={(e)=>setUsersPerPage(e.target.value)}>
    {
      (itemsPerPage && itemsPerPage.length > 0)
      &&
      itemsPerPage.map((opt, index)=>(
        <option key={index} value={opt}>{opt}</option>
      ))
    }
  </select>
</div>

    </div>
  );
};

export default App;
