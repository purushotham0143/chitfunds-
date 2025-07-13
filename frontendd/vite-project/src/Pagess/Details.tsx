import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';

//Here We are not   Deleting the  the data in the mongoDb  for safelt and security 

interface ChitEntry {
  _id?: string;
  chitName: string;
  monthNumber: string;
  remainingMonths: string;
  chitSongAmount: string;
  balanceAmount: string;
  amountToPay: string;
}

const Details = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    chitName: '',
    monthNumber: '',
    remainingMonths: '',
    chitSongAmount: '',
    balanceAmount: '',
    amountToPay: '',
  });

  const [chits, setChits] = useState<ChitEntry[]>([]);

  // Fetch chits from MongoDB
  const fetchChits = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/localchit`);
      const data = await res.json();

      const deletedIds = JSON.parse(localStorage.getItem('deletedChits') || '[]');
      const filteredData = data.filter((chit: ChitEntry) => !deletedIds.includes(chit._id));
      setChits(filteredData);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/Login');
    } else {
      fetchChits();
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/localchit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (result.success) {
        setChits([result.chit, ...chits]);
        setFormData({
          chitName: '',
          monthNumber: '',
          remainingMonths: '',
          chitSongAmount: '',
          balanceAmount: '',
          amountToPay: '',
        });
      }
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  const handleDelete = (id?: string) => {
    if (!id) return;

    const updated = chits.filter((chit) => chit._id !== id);
    setChits(updated);

    const deletedIds = JSON.parse(localStorage.getItem('deletedChits') || '[]');
    deletedIds.push(id);
    localStorage.setItem('deletedChits', JSON.stringify(deletedIds));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-orange-600 mb-4">Server Chit Records</h2>

      {user?.role === 'admin' && (
        <form onSubmit={handleSubmit} className="bg-white shadow p-6 rounded mb-6">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="chitName"
              value={formData.chitName}
              onChange={handleChange}
              placeholder="Chit Name"
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              name="monthNumber"
              value={formData.monthNumber}
              onChange={handleChange}
              placeholder="Month Number"
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              name="remainingMonths"
              value={formData.remainingMonths}
              onChange={handleChange}
              placeholder="Remaining Months"
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              name="chitSongAmount"
              value={formData.chitSongAmount}
              onChange={handleChange}
              placeholder="Chit Song Amount"
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              name="balanceAmount"
              value={formData.balanceAmount}
              onChange={handleChange}
              placeholder="Balance Amount"
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              name="amountToPay"
              value={formData.amountToPay}
              onChange={handleChange}
              placeholder="Amount to Pay This Month"
              className="border p-2 rounded"
              required
            />
          </div>
          <button type="submit" className="mt-4 w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600">
            Submit
          </button>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {chits.length === 0 ? (
          <p className="text-center text-gray-500">No chit records found.</p>
        ) : (
          chits.map((chit) => (
            <div
              key={chit._id}
              className="bg-white p-4 rounded shadow space-y-1 text-sm relative group"
            >
              <p><strong>Chit Name:</strong> {chit.chitName}</p>
              <p><strong>Present Month #:</strong> {chit.monthNumber}</p>
              <p><strong>Remaining Months:</strong> {chit.remainingMonths}</p>
              <p><strong>Chit Song Amount:</strong> ₹{chit.chitSongAmount}</p>
              <p><strong>Chit Balance Amount:</strong> ₹{chit.balanceAmount}</p>
              <p><strong>Amount to Pay:</strong> ₹{chit.amountToPay}</p>

              {user?.role === 'admin' && (
                <button
                  onClick={() => handleDelete(chit._id)}
                  className="absolute top-2 right-2 text-red-500 hover:underline text-sm"
                >
                  Delete
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Details;
