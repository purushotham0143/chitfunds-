import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWhatsapp,
  faFacebook,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { UserContext } from "../Pagess/UserContext";
import { toast } from "react-toastify";

const Landing = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [current, setCurrent] = useState(0);
  const [chits, setChits] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null); // holds selected image
  const [selectedFile, setSelectedFile] = useState(null);

  const images = [
    "/imagess/image1.png",
    "/imagess/image2.png",
    "/imagess/image3.png",
    "/imagess/image4.png",
  ];

  const handleToggle = () => {
    setShowDropdown(!showDropdown);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
      });

      localStorage.removeItem("user");
      setUser(null); //  Clear the user from React context
      toast.success("Logged out successfully");
      navigate("/"); //  Optionally redirect
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed");
    }
  };

  const handleChitSongDateChange = async (selectedValue) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/getchitsong/${selectedValue}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch chits for date ${selectedValue}`);
      }
      const data = await response.json();
      setChits(data);
    } catch (error) {
      console.error("Error fetching chits:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewPhoto(reader.result); // Show preview
      setSelectedFile(reader.result); // Save base64 to upload later
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!selectedFile || !user?._id) return;

    try {
      const updatedUser = { ...user, photo: selectedFile };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      const response = await fetch(
        `http://localhost:5000/api/users/${user._id}/upload-photo`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ photo: selectedFile }),
        }
      );

      if (!response.ok) throw new Error("Upload failed");

      toast.success("Profile photo updated!");
      setPreviewPhoto(null);
      setSelectedFile(null);
      setShowDropdown(false);
    } catch (error) {
      toast.error(
        " Error uploading photo: " +
          (error instanceof Error ? error.message : String(error))
      );
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const completedCount = chits.reduce((total, chit) => {
    return (
      total +
      chit.memberDetails.filter((member) => member.status === "Completed")
        .length
    );
  }, 0);

  const inProgressCount = chits.reduce((total, chit) => {
    return (
      total +
      chit.memberDetails.filter((member) => member.status === "In Progress")
        .length
    );
  }, 0);

  return (
    <div>
      <nav className="flex justify-between bg-orange-500 text-black p-2 rounded-sm items-center">
        <img
          className="w-10 h-10 rounded-full"
          src="/imagess/image1.png"
          alt="Logo"
        />
        <input
          type="search"
          placeholder="Search.."
          className="px-2 py-1 rounded"
        />
        <Link to="/">Home</Link>
        <Link to="/About">About</Link>
        <Link to="/Details">Details</Link>

        {/* Move this inside a user check */}
        {user && (
          <select
            defaultValue=""
            onChange={(e) => handleChitSongDateChange(e.target.value)}
            className="px-2 py-1 rounded"
          >
            <option value="" disabled>
              Select Chit Song Date
            </option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="5">5</option>
            <option value="10">10</option>
          </select>
        )}

        {user?.role === "admin" && (
          <>
            <Link to="/NewChit" className="text-blue-700 hover:underline">
              Create new Chitfund
            </Link>
            <Link to="/Add" className="text-blue-700 hover:underline">
              AddMember
            </Link>
          </>
        )}

        {user ? (
          <button
            onClick={handleLogout}
            className="text-red-600 hover:underline"
          >
            Logout
          </button>
        ) : (
          <Link to="/Login" className="hover:underline">
            Login
          </Link>
        )}

        <div className="relative flex items-center gap-2">
          {/*  Profile Image with Zoom on Hover */}
          <img
            src={user?.photo || "/imagess/image2.png"}
            alt="User"
            className="w-10 h-10 rounded-full cursor-pointer object-cover transition-transform duration-300 hover:scale-150"
            onClick={() => setShowModal(true)}
          />

          {/*  Dropdown Toggle Button */}
          <button
            className="text-white bg-orange-400 px-2 py-1 rounded hover:bg-orange-600 text-sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown((prev) => !prev);
            }}
          >
            ⚙️ Edit
          </button>

          {/*  Dropdown Menu */}
          {showDropdown && user && (
            <div className="absolute top-14 right-0 bg-white border p-4 rounded shadow z-50 min-w-[200px]">
              <p className="font-bold mb-2">{user.name}</p>

              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Profile Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-sm"
              />

              {/*  Preview of selected image */}
              {previewPhoto && (
                <img
                  src={previewPhoto}
                  alt="Preview"
                  className="w-16 h-16 mt-2 rounded-full object-cover border"
                />
              )}

              {/* Save &  Reset Buttons */}
              <div className="flex gap-2 mt-3">
                {selectedFile && (
                  <button
                    onClick={handleSave}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    Save
                  </button>
                )}

                {user?.photo && (
                  <button
                    onClick={async () => {
                      const confirmed = window.confirm(
                        "Are you sure you want to remove the profile photo?"
                      );
                      if (!confirmed) return;

                      const updatedUser = { ...user, photo: null };
                      setUser(updatedUser);
                      localStorage.setItem("user", JSON.stringify(updatedUser));

                      try {
                        const response = await fetch(
                          `http://localhost:5000/api/users/${user._id}/upload-photo`,
                          {
                            method: "PUT",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ photo: null }),
                          }
                        );

                        if (!response.ok) throw new Error("Delete failed");
                        toast.success(" Profile photo removed!");
                      } catch (error) {
                        console.error("Error removing photo:", error);
                      }
                    }}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 🖼️ Fullscreen Modal for Viewing */}
          {showModal && user?.photo && (
            <div
              className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
              onClick={() => setShowModal(false)}
            >
              <div
                className="relative bg-white p-4 rounded-lg shadow-lg max-w-[90%] max-h-[90%]"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={user.photo}
                  alt="Full View"
                  className="max-h-[75vh] w-auto object-contain mx-auto"
                />
                <button
                  className="absolute top-2 right-2 text-black bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                  onClick={() => setShowModal(false)}
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {chits.length > 0 ? (
        <div className="p-4">
          <h2 className="text-2xl font-bold text-orange-600 mb-6 text-center">
            Chit Members Overview
          </h2>

          <div>
            <h3 className="text-green-600 font-semibold">
              Completed: {completedCount}
            </h3>
            <h3 className="text-yellow-600 font-semibold">
              In Progress: {inProgressCount}
            </h3>
          </div>

          {chits.map((chit) => (
            <div key={chit.id}>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Chit Name: {chit.name}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {chit.memberDetails.map((member, index) => {
                  const paidCount = member.paidMonths.length;
                  const totalMonths = 10;

                  return (
                    <div
                      key={index}
                      className="bg-white shadow-md rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex flex-col items-center mb-4">
                        {member.photo ? (
                          <img
                            src={member.photo}
                            alt={member.name}
                            className="w-20 h-20 rounded-full object-cover border"
                          />
                        ) : (
                          <div className="w-20 h-20 flex items-center justify-center bg-gray-300 text-xl font-semibold rounded-full text-gray-700">
                            {member.name?.charAt(0)}
                          </div>
                        )}
                        <h4 className="text-lg font-bold mt-2">
                          {member.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Address: {member.address}
                        </p>
                        <p className="text-sm text-gray-500">
                          Phone: {member.phone}
                        </p>
                        <p className="text-sm text-gray-400">ID: {member.id}</p>
                        <p
                          className={`text-sm ${
                            member.status === "Completed"
                              ? "text-red-500"
                              : "text-gray-700"
                          }`}
                        >
                          Status: {member.status}
                        </p>
                      </div>

                      <div className="border-t pt-2 text-sm">
                        <p className="text-green-600 mb-1">
                          Paid Months: {paidCount} / {totalMonths}
                        </p>
                        <div className="grid grid-cols-2 gap-1">
                          {member.paidMonths.map((month, i) => (
                            <span
                              key={i}
                              className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs text-center"
                            >
                              {month.name} {month.year}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/*  Move Footer OUTSIDE .map() and inside this main div */}
          <div className="w-full bg-orange-500 text-white text-center py-6 mt-10 rounded-sm">
            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div>
                <h2 className="font-bold text-lg mb-2">
                  Srinivasulu Chitfunds
                </h2>
                <p>&copy; 2025 All rights reserved.</p>
              </div>
              <div>
                <h2 className="font-bold text-lg mb-2">Contact</h2>
                <p>
                  <FontAwesomeIcon icon={faPhone} className="mr-2" /> +91
                  9893559863
                </p>
                <p>
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2" />{" "}
                  support@chitfunds.com
                </p>
              </div>
              <div>
                <h2 className="font-bold text-lg mb-2">Connect</h2>
                <div className="flex flex-col gap-1">
                  <a href="/about" className="hover:underline">
                    About
                  </a>
                  <a href="/details" className="hover:underline">
                    Details
                  </a>
                  <div className="flex gap-4 mt-2 text-2xl">
                    <a
                      href="https://wa.me/919876543210"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FontAwesomeIcon
                        icon={faWhatsapp}
                        className="hover:text-green-300"
                      />
                    </a>
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FontAwesomeIcon
                        icon={faFacebook}
                        className="hover:text-blue-200"
                      />
                    </a>
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FontAwesomeIcon
                        icon={faTwitter}
                        className="hover:text-blue-400"
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="relative w-full h-[70vh] mx-auto mt-0.5 overflow-hidden">
            <img
              src={images[current]}
              alt="No image"
              className="w-full h-full object-cover rounded-lg shadow-md"
            />

            <button
              onClick={prevSlide}
              className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black text-white p-2 rounded-full"
            >
              ❮
            </button>
            <button
              onClick={nextSlide}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black text-white p-2 rounded-full"
            >
              ❯
            </button>
          </div>

          <div className="bg-orange-100 w-full py-10">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center px-4 gap-8">
              <div className="w-full md:w-1/3">
                <img
                  src="/imagess/owner.png"
                  alt="Owner"
                  className="w-full h-auto rounded-lg shadow-lg object-cover"
                />
              </div>
              <div className="w-full md:w-2/3 text-gray-800">
                <h2 className="text-2xl font-bold mb-4">About the Owner</h2>
                <p className="mb-2">
                  Mr. Srinivasulu is the founder and managing director of
                  Srinivasulu Chitfunds. With over 15 years of experience in
                  financial management and chitfund operations, he has built a
                  trusted and transparent organization.
                </p>
                <p>
                  His deep understanding of customer needs and commitment to
                  ethical practices have made this chitfund one of the most
                  reliable in the region.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full bg-orange-500 text-white text-center py-6 mt-auto rounded-sm">
            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div>
                <h2 className="font-bold text-lg mb-2">
                  Srinivasulu Chitfunds
                </h2>
                <p>&copy; 2025 All rights reserved.</p>
              </div>
              <div>
                <h2 className="font-bold text-lg mb-2">Contact</h2>
                <p>
                  <FontAwesomeIcon icon={faPhone} className="mr-2" /> +91
                  9893559863
                </p>
                <p>
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2" />{" "}
                  support@chitfunds.com
                </p>
              </div>
              <div>
                <h2 className="font-bold text-lg mb-2">Connect</h2>
                <div className="flex flex-col gap-1">
                  <a href="/about" className="hover:underline">
                    About
                  </a>
                  <a href="/details" className="hover:underline">
                    Details
                  </a>
                  <div className="flex gap-4 mt-2 text-2xl">
                    <a
                      href="https://wa.me/919876543210"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FontAwesomeIcon
                        icon={faWhatsapp}
                        className="hover:text-green-300"
                      />
                    </a>
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FontAwesomeIcon
                        icon={faFacebook}
                        className="hover:text-blue-200"
                      />
                    </a>
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FontAwesomeIcon
                        icon={faTwitter}
                        className="hover:text-blue-400"
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Landing;
