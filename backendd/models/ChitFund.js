import mongoose from 'mongoose';

const chitFundSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  members: Number,
  amount: Number,
  selectedNumbers: [String],
  chitSongDate: String,
  memberDetails: [
    {
      id: String,
      name: String,
      address: String,
      phone: String,
      photo: String,
      editable: Boolean,
      paid: Boolean,
      paymentDate: String,
      paidMonths: [
        {
          name: String,
          year: Number,
        },
      ],
    },
  ],
  createdAt: Date,
});

const ChitFund = mongoose.model('ChitFund', chitFundSchema, 'ChitFunds');

export default ChitFund;
