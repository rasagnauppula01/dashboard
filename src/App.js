import './App.css';
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaChevronLeft, FaChevronRight, FaFilter, FaFolder, FaSort } from "react-icons/fa";
import { Modal, Button, Form } from "react-bootstrap";
import Dropdown from 'react-bootstrap/Dropdown';

const App= () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
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


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://leadsystem.highsierraleads.com/get-users");
        setUsers(response.data.users);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

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
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const toggleUserStatus = async (userId) => {
    try {
      await axios.post("https://leadsystem.highsierraleads.com/user/status-toggle", {
        user_id: userId,
      });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.user_id === userId
            ? { ...user, status: user.status === "active" ? "inactive" : "active" }
            : user
        )
      );
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setSelectedStates(user.states);
    setConstant(user.constant);
    setWebsite(user.website);
    setShowEditModal(true);
  };

  const handleSave = async () => {
    try {
      await axios.post("https://leadsystem.highsierraleads.com/user/update", {
        user_id: editUser.user_id,
        constant: constant,
        website: website,
        states: selectedStates,
      });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.user_id === editUser.user_id
            ? { ...user, constant, website, states: selectedStates }
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

  // Add state variables to manage active and inactive counts

useEffect(() => {
  setAllCount(users.length);
  setActiveCount(users.filter(user => user.status === "active").length);
  setInactiveCount(users.filter(user => user.status === "inactive").length);
}, [users]);




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


  return (
    <div className="table-container">
      <div className="header-bg">
        <header className="desktop-header">
          <h1>Dashboard</h1>
          <div className="search-folder">
            <input
              type="text"
              placeholder="Search by Name ..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
        </header>
      </div>

      <table className="user-table">
        <thead>
          <tr>
            <th>Sr No.</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>States</th>
            <th>Constant</th>
            <th>Leads Count</th>
            <th>Website</th>
            <th>Status</th>
            <th>Edit</th>
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
                  <button onClick={() => toggleUserStatus(user.user_id)}
                    style={{
                        backgroundColor: user.status === "active" ? "#9de09e" : "#faaaab",
                        color: "white",
                        border: "none",
                        padding: "5px 10px",
                        borderRadius: "5px",
                      }}>
                    {user.status === "active" ? "Activate" : "Inactivate"}
                  </button>
                </td>
                <td>
                  <button onClick={() => handleEdit(user)}>✏️Edit</button>
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
      
      <div className="filter-sort-row">
        {/* Filter By Dropdown */}
        <Dropdown>
          <Dropdown.Toggle variant="secondary" id="filter-sort-dropdown">
            <FaFilter /> Filter
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setSelectedFilter('name')}>Name</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => setSelectedFilter('leadCount')}>Lead Count</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        {/* Sort By Dropdown */}
        <Dropdown>
          <Dropdown.Toggle variant="secondary" id="sort-dropdown">
            <FaSort /> Sort
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {selectedFilter === "name" ? (
              <>
                <Dropdown.Item onClick={() => handleSortByName('asc')}>A to Z</Dropdown.Item>
                <Dropdown.Item onClick={() => handleSortByName('desc')}>Z to A</Dropdown.Item>
              </>
            ) : selectedFilter === "leadCount" ? (
              <>
                <Dropdown.Item onClick={() => handleSortByLeadCount('max')}>High to Low</Dropdown.Item>
                <Dropdown.Item onClick={() => handleSortByLeadCount('min')}>Low to High</Dropdown.Item>
              </>
            ) : (
              <Dropdown.ItemText>Select filter first</Dropdown.ItemText>
            )}
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <div className="status-counts">
        <span className="count-btn">All({allCount})</span>
        <span className="count-btn">Active({activeCount})</span>
        <span className="count-btn">Inactive({inactiveCount})</span>
      </div>
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
                <button className="edit-icon" onClick={() => handleEdit(user)}>
                  ✏️
                </button>
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
                
              </div>
            </div>
          ))
        ) : (
          <div>No data available</div>
        )}
      </div>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Participant</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="states" className="scrollable-checkboxes">
              <Form.Label>States</Form.Label>
              {states.map((state) => (
                <Form.Check
                  key={state}
                  type="checkbox"
                  label={state}
                  value={state}
                  checked={selectedStates.includes(state)}
                  onChange={() => handleStateChange(state)}
                />
              ))}
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
</div>

    </div>
  );
};

export default App;
