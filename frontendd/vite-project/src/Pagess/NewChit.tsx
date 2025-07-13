import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
// Define Member interface
interface Member {
  id: string;
  name: string;
  address: string;
  phone: string;
  photo: string;
  editable: boolean;
  paid: boolean;
  paymentDate: string;
  paidMonths: { name: string; year: number }[];
  status: string;
}

// Define ChitFund interface
interface ChitFund {
  id: string;
  name: string;
  members: number;
  amount: number;
  selectedNumbers: string[];
  chitSongDate: string; 
  memberDetails: Member[];
  createdAt: Date;
}


const NewChit = () => {
  // State for chit data
  const [chitData, setChitData] = useState({
    name: "",
    members: 0,
    amount: 0,
    selectedNumbers: [] as string[],
    chitSongDate: "",
  });

  // State for member details
  const [memberDetails, setMemberDetails] = useState<Member[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [photos, setPhotos] = useState({});
  const [paymentMonths, setPaymentMonths] = useState<{
    [key: string]: boolean;
  }>({});
  const [showPaymentOptions, setShowPaymentOptions] = useState<string | null>(
    null
  );
  const [savedChits, setSavedChits] = useState<ChitFund[]>([]);
  const [viewingChitId, setViewingChitId] = useState<string | null>(null);
  // Load saved chits from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("chitFunds");
    if (saved) {
      setSavedChits(JSON.parse(saved));
    }
  }, []);

  // Save chits to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("chitFunds", JSON.stringify(savedChits));
  }, [savedChits]);

  // Function to generate future months
  const getFutureMonths = (count: number) => {
    const months = [];
    const date = new Date();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    for (let i = 0; i < count; i++) {
      months.push({
        name: monthNames[date.getMonth()],
        year: date.getFullYear(),
      });
      date.setMonth(date.getMonth() + 1);
    }
    return months;
  };

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setChitData((prev) => ({
      ...prev,
      [name]: name === "members" ? Number(value) : value,
    }));
  };

  // Handle photo change
  const handlePhotoChange = (id: string, file: File) => {
    setPhotos((prev) => ({
      ...prev,
      [id]: file,
    }));
  };

  // Handle form submission
  const handleSubmit = () => {
    if (chitData.members <= 0) return;

    const details = Array.from({ length: chitData.members }, (_, i) => ({
      id: `member-${i + 1}`,
      name: `Member ${i + 1}`,
      address: `Address ${i + 1}`,
      phone: `+91 ${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      photo: `https://placehold.co/200x200?text=M+${i + 1}`,
      editable: false,
      paid: false,
      paymentDate: "",
      paidMonths: [],
      status: "In Progress",
    }));

    setMemberDetails(details);
    setIsSubmitted(true);
  };

  // Handle photo upload
  const handleUpload = async (id: string) => {
    const formData = new FormData();
    formData.append("photo", photos[id]);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/upload`,
        formData
      );
      handleSave(id, "photo", response.data.filePath);
    } catch (error) {
      toast.error("Error uploading photo: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  // Toggle edit mode for member
  const toggleEdit = (id: string) => {
    setMemberDetails((prev) =>
      prev.map((member) =>
        member.id === id ? { ...member, editable: !member.editable } : member
      )
    );
    <div className="mt-2">
  <label className="block text-sm text-gray-600">Status:</label>
  <select
    value={member.status}
    onChange={(e) => handleSave(member.id, "status", e.target.value)}
    className="w-full px-2 py-1 border rounded text-sm"
  >
     <option value="In Progress">In Progress</option>
    <option value="Completed">Completed</option>
  </select>
</div>

  };

  // Handle saving member details
  const handleSave = (id: string, field: string, value: any) => {
    setMemberDetails((prev) =>
      prev.map((member) =>
        member.id === id
          ? { ...member, [field]: value, editable: false }
          : member
      )
    );
  };

  // Handle payment options toggle
  const handlePayment = (id: string) => {
    setShowPaymentOptions((prev) => (prev === id ? null : id));
    setPaymentMonths((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  // Handle month payment
  const handleMonthPayment = async (
    memberId: string,
    month: { name: string; year: number }
  ) => {
    try {
      console.log(
        `Redirecting to payment for ${memberId} for ${month.name} ${month.year}`
      );
      setTimeout(() => {
        toast.success(`Payment successful for ${month.name} ${month.year}`);
        setMemberDetails((prev) =>
          prev.map((member) =>
            member.id === memberId
              ? {
                  ...member,
                  paid: true,
                  paymentDate: new Date().toLocaleDateString(),
                  paidMonths: [...member.paidMonths, month],
                }
              : member
          )
        );
        setShowPaymentOptions(null);
      }, 1000);
    } catch (error) {
      toast.error("Payment failed: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  // Toggle number selection
  const toggleNumberSelection = (number: string) => {
    setChitData((prev) => {
      const newNumbers = prev.selectedNumbers.includes(number)
        ? prev.selectedNumbers.filter((n) => n !== number)
        : [...prev.selectedNumbers, number];

      // Limit selection to number of members
      if (newNumbers.length > (chitData.members || 0)) {
        return prev;
      }

      return {
        ...prev,
        selectedNumbers: newNumbers,
      };
    });
  };

  // Handle saving all chit data
  const handleSaveAll = async () => {
    const updatedChit: ChitFund = {
      id:
        viewingChitId ??
        `${chitData.name.replace(/\s+/g, "_").toLowerCase()}_${Date.now()}`,
      name: chitData.name,
      members: chitData.members,
      amount: chitData.amount,
      selectedNumbers: chitData.selectedNumbers,
      chitSongDate:
        chitData.chitSongDate || chitData.selectedNumbers.join(", "),
      memberDetails: memberDetails,
      createdAt: new Date(),
    };

    try {
      if (viewingChitId) {
        // Update existing chit
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/updatechit/${viewingChitId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedChit),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const updatedList = savedChits.map((chit) =>
          chit.id === viewingChitId ? data : chit
        );
        setSavedChits(updatedList);
        toast.success("Chit fund updated successfully!");
      } else {
        // Save as new chit
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/savechit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedChit),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setSavedChits((prev) => [...prev, data]);
        toast.success("Chit fund saved successfully!");
      }

      // Reset form
      setChitData({
        name: "",
        members: 0,
        amount: 0,
        selectedNumbers: [],
        chitSongDate: "",
      });
      setMemberDetails([]);
      setIsSubmitted(false);
      setViewingChitId(null);
    } catch (error) {
      console.error("Error saving/updating chit:", error);
      toast.error("Failed to save or update chit fund. Please try again.");
    }
  };

  ///View handle
  const handleViewChit = (chit: ChitFund) => {
    setChitData({
      name: chit.name,
      members: chit.members,
      amount: chit.amount,
      selectedNumbers: chit.selectedNumbers,
      chitSongDate: chit.chitSongDate || "",
    });
    setMemberDetails(chit.memberDetails);
    setIsSubmitted(true);
    setViewingChitId(chit.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  //Delete The Chit
  const handleDeleteChit = async (chitId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/deletechit/${chitId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Filter out the deleted chit from savedChits
      const updatedChits = savedChits.filter((chit) => chit.id !== chitId);

      // Update both state and localStorage explicitly
      setSavedChits(updatedChits);
      localStorage.setItem("chitFunds", JSON.stringify(updatedChits));

      toast.success("Chit fund deleted successfully!");
    } catch (error) {
      console.error("Error deleting chit:", error);
      toast.error("Failed to delete chit fund. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Form Section */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 mb-8">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">
          Create A New Chit Fund
        </h1>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chit Name
            </label>
            <input
              type="text"
              name="name"
              value={chitData.name}
              onChange={handleInputChange}
              placeholder="Enter name"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Members
            </label>
            <input
              type="number"
              name="members"
              value={chitData.members}
              onChange={handleInputChange}
              placeholder="Enter members"
              min="1"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹)
            </label>
            <input
              type="number"
              name="amount"
              value={chitData.amount}
              onChange={handleInputChange}
              placeholder="Enter amount"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
        </div>

        {/* Select the Number  */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chit Song Date
          </label>
          <input
            type="text"
            name="chitSongDate"
            value={chitData.chitSongDate}
            onChange={(e) =>
              setChitData((prev) => ({ ...prev, chitSongDate: e.target.value }))
            }
            placeholder="Eg: 1,2 or 5 or 10"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={chitData.members <= 0}
          className={`w-full md:w-auto px-6 py-3 text-white font-medium rounded-lg transition duration-300 shadow-md ${
            chitData.members <= 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          Generate Member List
        </button>
        {/* Save Every new Chit to The MongoDb */}

        <button
          onClick={handleSaveAll}
          disabled={!isSubmitted || chitData.members <= 0}
          className={`w-full md:w-auto px-6 py-3 text-white font-medium rounded-lg transition duration-300 shadow-md ${
            !isSubmitted || chitData.members <= 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {viewingChitId ? "Update Chit" : "Save New Chit"}
        </button>
      </div>

      {/* Members Grid Section */}
      {isSubmitted && (
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {memberDetails.map((member) => (
              <div
                key={member.id}
                className={`bg-white rounded-xl overflow-hidden shadow-md transition-all hover:shadow-lg ${
                  member.paid
                    ? "border-2 border-green-400"
                    : "border border-gray-200"
                }`}
              >
                <div className="p-4">
                  <div className="flex justify-center mb-3">
                    <img
                      src={member.photo}
                      alt={`Profile of ${member.name}`}
                      className="w-24 h-24 rounded-full object-cover border-2 border-indigo-200"
                      onError={(e) => {
                        e.target.src =
                          "https://placehold.co/200x200?text=No+Image";
                      }}
                    />
                  </div>

                  {member.editable ? (
                    <div className="space-y-3">
                      <select
  defaultValue={member.status}
  onChange={(e) => (member.status = e.target.value)}
  className="w-full px-3 py-2 border rounded"
>
  <option value="In Progress">In Progress</option>
<option value="Completed">Completed</option>

</select>

                      <input
                        type="text"
                        defaultValue={member.name}
                        onChange={(e) => (member.name = e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        placeholder="Name"
                      />
                      <input
                        type="text"
                        defaultValue={member.address}
                        onChange={(e) => (member.address = e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        placeholder="Address"
                      />
                      <input
                        type="text"
                        defaultValue={member.phone}
                        onChange={(e) => (member.phone = e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        placeholder="Phone"
                      />
                      <input
                        type="file"
                        onChange={(e) =>
                          handlePhotoChange(member.id, e.target.files[0])
                        }
                        className="w-full border rounded"
                      />
                      <button
                        onClick={() => handleUpload(member.id)}
                        className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                      >
                        Upload Photo
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            handleSave(member.id, "name", member.name);
                            handleSave(member.id, "address", member.address);
                            handleSave(member.id, "phone", member.phone);
                            handleSave(member.id, "status", member.status);

                          }}
                          className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                        >
                          Save All
                        </button>
                        <button
                          onClick={() => toggleEdit(member.id)}
                          className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium text-center">
                        {member.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Address:</span>{" "}
                        {member.address}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Phone:</span>{" "}
                        {member.phone}
                      </p>
                      <p className="text-xs text-gray-500">ID: {member.id}</p>

                      {member.paid && (
                        <p className="text-xs text-green-600 mt-1">
                          Paid on: {member.paymentDate}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 mt-3">
                        <button
                          onClick={() => toggleEdit(member.id)}
                          className="flex-1 bg-yellow-500 text-white py-1.5 rounded text-sm hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handlePayment(member.id)}
                          className={`flex-1 py-1.5 rounded text-sm hover:opacity-90 ${
                            member.paid
                              ? "bg-green-500 text-white"
                              : "bg-indigo-500 text-white"
                          }`}
                        >
                          {member.paid ? "Paid Now" : "Pay Now"}
                        </button>
                      </div>

                      {/* Month Payment Buttons */}
                      {showPaymentOptions === member.id && (
                        <div className="mt-4 border-t pt-3">
                          <h4 className="text-sm font-medium mb-2">
                            Select Payment Month:
                          </h4>

                          {/*  Show Count */}
                          <div className="mb-2 text-sm text-gray-700">
                            <p>
                              ✅{" "}
                              <span className="font-semibold">
                                Paid Months:
                              </span>{" "}
                              {member.paidMonths.length} / {chitData.members}
                            </p>
                            <p>
                              ⏳{" "}
                              <span className="font-semibold">Remaining:</span>{" "}
                              {chitData.members - member.paidMonths.length}
                            </p>
                          </div>

                          {/* Month Buttons */}
                          <div className="grid grid-cols-2 gap-2">
                            {getFutureMonths(chitData.members).map((month) => (
                              <button
                                key={`${month.name}-${month.year}`}
                                onClick={() =>
                                  handleMonthPayment(member.id, month)
                                }
                                disabled={member.paidMonths.some(
                                  (m) =>
                                    m.name === month.name &&
                                    m.year === month.year
                                )}
                                className={`text-xs p-2 rounded flex flex-col items-center ${
                                  member.paidMonths.some(
                                    (m) =>
                                      m.name === month.name &&
                                      m.year === month.year
                                  )
                                    ? "bg-green-100 text-green-800"
                                    : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                }`}
                              >
                                <span>{month.name}</span>
                                <span className="text-xs">{month.year}</span>
                              </button>
                            ))}
                          </div>

                          {/* Already Paid List */}
                          <div className="mt-2 text-xs text-gray-600">
                            {member.paidMonths.length > 0 && (
                              <p className="mt-2">Paid:</p>
                            )}
                            {member.paidMonths.map((month) => (
                              <span
                                key={`${month.name}-${month.year}`}
                                className="inline-block bg-gray-100 px-2 py-1 rounded mr-1 mt-1"
                              >
                                {month.name} {month.year}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Saved Chits Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Saved Chit Funds
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedChits.map((chit) => (
            <div
              key={chit.id}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              <h3 className="text-xl font-semibold text-indigo-700">
                {chit.name}
              </h3>
              <div className="mt-4 space-y-2">
                <p>
                  <span className="font-medium">Members:</span> {chit.members}
                </p>
                <p>
                  <span className="font-medium">Amount:</span> ₹{chit.amount}
                </p>
                <p>
                  <span className="font-medium">Created At:</span>{" "}
                  {new Date(chit.createdAt).toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">Chit Song Date:</span>{" "}
                  {chit.chitSongDate || "Not specified"}
                </p>
              </div>
              {/* Delete Button */}
              <button
                onClick={() => handleDeleteChit(chit.id)}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={() => handleViewChit(chit)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                View
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewChit;
