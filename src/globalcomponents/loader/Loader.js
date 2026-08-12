import React from "react";
import { FaSpinner } from "react-icons/fa";

const Loader = () => {
  return (
    <div className="flex justify-center items-center">
      <FaSpinner className="animate-spin text-2xl text-gray-400" />
      {/* <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-[#3F2073]"></div> */}
    </div>
    // <div className="flex justify-center items-center h-screen">
    //           <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500">
    //             <Loader />
    //           </div>
    //         </div>
  );
};

export default Loader;
