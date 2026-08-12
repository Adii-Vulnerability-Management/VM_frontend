// ParentComponent.js
import { useState } from 'react';
import Nis2Forms from '../Nis2selfassesment/Nis2Form.js';

function ParentComponent() {
  const [showModal, setShowModal] = useState(false);
  console.log(showModal,'showModal');
  

  return (
    <div>
      <button 
        onClick={() => setShowModal(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Open Assessment Form
      </button>

      {showModal && (
        <Nis2Forms setShowModal={setShowModal} />
      )}
    </div>
  );
}

export default ParentComponent;