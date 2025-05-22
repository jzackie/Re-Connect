import React, { useState, useEffect, useContext } from "react";
import { NotificationContext } from "../../context/NotificationContext";
import "./LostAndFoundPage.css";

const LostAndFound = () => {
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });


  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("lostFoundActiveTab") || "unclaimed";
  });

  const [items, setItems] = useState(() => {
    const storedItems = localStorage.getItem("lostFoundItems");
    if (storedItems) {
      return JSON.parse(storedItems);
    } else {
      return {
        unclaimed: [],
        claimed: [],
      };
    }
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { addNotification } = useContext(NotificationContext);

  const [formData, setFormData] = useState({
    description: "",
    location: "",
    foundDate: "",
    status: "Unclaimed",
    image: null,
    imagePreview: null,
    link: "",
  });

  const [editData, setEditData] = useState({
    description: "",
    location: "",
    foundDate: "",
    status: "Unclaimed",
    link: "", // Added link here for editing
  });

  useEffect(() => {
    localStorage.setItem("lostFoundActiveTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem("lostFoundItems", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    return () => {
      if (formData.imagePreview) {
        URL.revokeObjectURL(formData.imagePreview);
      }
    };
  }, [formData.imagePreview]);

  const openModal = (item) => {
    setSelectedItem(item);
    setEditData({
      description: item.description,
      location: item.location,
      foundDate: item.foundDate,
      status: item.status,
      link: item.link || "", // Populate link on edit
    });
    setIsEditing(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
    setIsEditing(false);
  };

  const openAdminModal = () => {
    setAdminModalOpen(true);
  };

  const closeAdminModal = () => {
    setAdminModalOpen(false);
    if (formData.imagePreview) {
      URL.revokeObjectURL(formData.imagePreview);
    }
    setFormData({
      description: "",
      location: "",
      foundDate: "",
      status: "Unclaimed",
      image: null,
      imagePreview: null,
      link: "", // reset link on close
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (formData.imagePreview) {
        URL.revokeObjectURL(formData.imagePreview);
      }
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();

    if (
      !formData.description.trim() ||
      !formData.location.trim() ||
      !formData.foundDate.trim()
    ) {
      alert("Please fill all fields");
      return;
    }

    let base64Image = null;

    if (formData.image) {
      base64Image = await fileToBase64(formData.image);
    }

    const newItem = {
      id: Date.now(),
      description: formData.description,
      location: formData.location,
      foundDate: formData.foundDate,
      status: formData.status,
      image: base64Image, // Save base64 image string
      link: formData.link,
    };

    setItems((prev) => {
      const key = formData.status.toLowerCase();
      return {
        ...prev,
        [key]: [newItem, ...prev[key]],
      };
    });

    addNotification(`New item added: "${formData.description}"`);

    closeAdminModal();
    setActiveTab(formData.status.toLowerCase());
  };


  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = () => {
    if (
      !editData.description.trim() ||
      !editData.location.trim() ||
      !editData.foundDate.trim()
    ) {
      alert("Please fill all fields");
      return;
    }

    setItems((prev) => {
      const oldStatusKey = selectedItem.status.toLowerCase();
      const filteredOldList = prev[oldStatusKey].filter(
        (item) => item.id !== selectedItem.id
      );

      const updatedItem = {
        ...selectedItem,
        description: editData.description,
        location: editData.location,
        foundDate: editData.foundDate,
        status: editData.status,
        link: editData.link, // save updated link here
      };

      const newStatusKey = editData.status.toLowerCase();
      return {
        ...prev,
        [oldStatusKey]: filteredOldList,
        [newStatusKey]: [updatedItem, ...prev[newStatusKey]],
      };
    });

    setSelectedItem((prev) => ({
      ...prev,
      description: editData.description,
      location: editData.location,
      foundDate: editData.foundDate,
      status: editData.status,
      link: editData.link,
    }));

    setIsEditing(false);
    setActiveTab(editData.status.toLowerCase());
  };

  const handleDeleteItem = (itemToDelete) => {
    if (
      window.confirm(
        `Are you sure you want to delete the item: "${itemToDelete.description}"?`
      )
    ) {
      setItems((prev) => {
        const key = itemToDelete.status.toLowerCase();
        return {
          ...prev,
          [key]: prev[key].filter((item) => item.id !== itemToDelete.id),
        };
      });

      if (selectedItem && selectedItem.id === itemToDelete.id) {
        closeModal();
      }
    }
  };

  const renderItems = (list) => {
    return list.map((item) => (
      <div
        className="list-item"
        key={item.id}
        onClick={() => openModal(item)}
        style={{ cursor: "pointer" }}
      >
        {item.image ? (
          <img src={item.image} alt="Item" className="item-image" />
        ) : (
          <div className="item-image" />
        )}
        <div className="item-info">
          <p className="item-description">{item.description}</p>
          <p className="item-location">Location: {item.location}</p>
          <p className="item-date">Found Date: {item.foundDate}</p>
          <p className="item-status">Status: {item.status}</p>
          {item.link && (
            <p className="item-link">
              Link:{" "}
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                {item.link}
              </a>
            </p>
          )}
        </div>
      </div>
    ));
  };

  return (
    <div className="item2">
      <h3>Lost and Found</h3>

      <div className="tabs">
        <button
          className={`unclaimedbtn ${activeTab === "unclaimed" ? "tabs-active" : ""}`}
          onClick={() => setActiveTab("unclaimed")}
        >
          Unclaimed
        </button>
        <button
          className={`claimedbtn ${activeTab === "claimed" ? "tabs-active" : ""}`}
          onClick={() => setActiveTab("claimed")}
        >
          Claimed
        </button>
      </div>

      <div
        className="unclaimed-list"
        style={{ display: activeTab === "unclaimed" ? "block" : "none" }}
      >
        {renderItems(items.unclaimed)}
      </div>

      <div
        className="claimed-list"
        style={{ display: activeTab === "claimed" ? "block" : "none" }}
      >
        {renderItems(items.claimed)}
      </div>

      {modalOpen && selectedItem && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {selectedItem.image ? (
              <img
                src={selectedItem.image}
                alt="Item"
                className="modal-item-image"
              />
            ) : (
              <div className="modal-item-image" />
            )}

            {!isEditing ? (
              <>
                <h3 className="modal-description-heading1">Description</h3>
                <p>{selectedItem.description}</p>
                <p>Location: {selectedItem.location}</p>
                <p>Found Date: {selectedItem.foundDate}</p>
                <p>Status: {selectedItem.status}</p>
                {selectedItem.link && (
                  <p>
                    Link:{" "}
                    <a
                      href={selectedItem.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {selectedItem.link}
                    </a>
                  </p>
                )}

                <div className="modal-buttons">
                  <button onClick={() => setIsEditing(true)}>Edit</button>
                  <button onClick={() => handleDeleteItem(selectedItem)}>
                    Delete
                  </button>
                  <button onClick={closeModal}>Close</button>
                </div>
              </>
            ) : (
              <>
                <label>
                  Description:
                  <input
                    type="text"
                    name="description"
                    value={editData.description}
                    onChange={handleEditChange}
                  />
                </label>
                <label>
                  Location:
                  <input
                    type="text"
                    name="location"
                    value={editData.location}
                    onChange={handleEditChange}
                  />
                </label>
                <label>
                  Found Date:
                  <input
                    type="date"
                    name="foundDate"
                    value={editData.foundDate}
                    onChange={handleEditChange}
                  />
                </label>
                <label>
                  Status:
                  <select
                    name="status"
                    value={editData.status}
                    onChange={handleEditChange}
                  >
                    <option value="Unclaimed">Unclaimed</option>
                    <option value="Claimed">Claimed</option>
                  </select>
                </label>
                <label>
                  Link:
                  <input
                    type="url"
                    name="link"
                    value={editData.link}
                    onChange={handleEditChange}
                    placeholder="https://example.com"
                  />
                </label>

                <div className="modal-buttons">
                  <button onClick={handleSaveEdit}>Save</button>
                  <button onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {adminModalOpen && (
        <div className="modal" onClick={closeAdminModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add Item</h3>
            <form onSubmit={handleAddItem}>
              <label>
                Description:
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <label>
                Location:
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <label>
                Found Date:
                <input
                  type="date"
                  name="foundDate"
                  value={formData.foundDate}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <label>
                Status:
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="Unclaimed">Unclaimed</option>
                  <option value="Claimed">Claimed</option>
                </select>
              </label>
              <label>
                Link:
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                />
              </label>
              <label>
                Image:
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
              {formData.imagePreview && (
                <img
                  src={formData.imagePreview}
                  alt="Preview"
                  className="image-preview"
                />
              )}
              <div className="modal-buttons">
                <button type="submit">Add Item</button>
                <button type="button" onClick={closeAdminModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <button
        className="floating-admin-button"
        onClick={openAdminModal}
        aria-label="Add new lost or found item"
        title="Add new item"
      >
        +
      </button>
    </div>
  );
};

export default LostAndFound;

