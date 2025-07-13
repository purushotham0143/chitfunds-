import React from 'react'
import {Link} from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
function About() {
  return (


    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-8">
      <h1 className="text-2xl font-bold mb-4 text-orange-600">Chit Fund Details</h1>
      
      <h2 className="text-xl font-semibold mb-2">Chit Value:</h2>
      <p className="mb-4">₹1,00,000</p>

      <h2 className="text-xl font-semibold mb-2">Total Members:</h2>
      <p className="mb-4">20 Members</p>
 
      <h2 className="text-xl font-semibold mb-2">Rules and Regulations:</h2>
      <ul className="list-disc pl-5 mb-4 space-y-2">
        <li>Each member contributes ₹5,000 per month.</li>
        <li>Duration of the chit is 20 months.</li>
        <li>Monthly auction is conducted to determine the winning bidder.</li>
        <li>The winning member receives the chit amount after deducting the commission and foreman charges.</li>
        <li>Each member can win only once in the entire cycle.</li>
        <li>Timely payment is mandatory; penalties apply for delays.</li>
        <li>Members must attend all monthly meetings or auctions physically or virtually.</li>
        <li>Foreman commission: 5% on total chit amount.</li>
        <li>Legal action will be taken if a member defaults on payment repeatedly.</li>
        <li>ID proof and address proof are required at the time of joining.</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">Benefits:</h2>
      <ul className="list-disc pl-5 mb-4 space-y-2">
        <li>Easy and disciplined savings.</li>
        <li>Low-interest borrowing in times of need.</li>
        <li>Transparent and community-based system.</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">Note:</h2>
      <p>All participants are advised to read the agreement carefully before joining. By joining, you agree to abide by the rules mentioned above.</p>
  
    
  

    

      {/* About Owner and His Photo */}
<div className="bg-orange-100 w-full py-10">
  <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center px-4 gap-8">
    
    {/* Left: Owner Image */}
    <div className="w-full md:w-1/3">
      <img 
        src="/imagess/owner.png" 
        alt="Owner" 
        className="w-full h-auto rounded-lg shadow-lg object-cover" 
      />
    </div>

    {/* Right: About Text */}
    <div className="w-full md:w-2/3 text-gray-800">
      <h2 className="text-2xl font-bold mb-4">About the Owner</h2>
      <p className="mb-2">
        Mr. Srinivasulu is the founder and managing director of Srinivasulu Chitfunds. With over 15 years of experience in financial management and chitfund operations, he has built a trusted and transparent organization.
      </p>
      <p>
        His deep understanding of customer needs and commitment to ethical practices have made this chitfund one of the most reliable in the region.
      </p>
    </div>
  </div>
</div>
    <Link to='/' className='bg-red-700 text-red-50 px-3 py-1 rounded inline-flex items-center'>
  <FontAwesomeIcon icon={faArrowLeft} className='mr-2' />
  Back
</Link>
    </div>
  )
}

export default About
