import React from "react";
import Pagination from "react-js-pagination";

const CustomPagination = ({
  totalDataCount,
  dataPerPage,
  setDataPerPage,
  setActivePage,
  activePage,
}) => {
  const pageHandler = (e) => {
    setDataPerPage(e.target.value);
    setActivePage(1);
  };

  const handlePageClick = (event) => {
    setActivePage(event);
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mt-5 space-y-4 md:space-y-0">
      <div className="flex items-center space-x-3">
        <label htmlFor="data-per-page" className="text-sm font-medium text-gray-700">
          Data Per Page:
        </label>
        <select
          id="data-per-page"
          value={dataPerPage}
          onChange={pageHandler}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={20}>20</option>
        </select>
      </div>
      <div className="flex items-center">
        <Pagination
          activePage={Number(activePage)}
          totalItemsCount={totalDataCount}
          itemsCountPerPage={parseInt(dataPerPage)}
          pageRangeDisplayed={3}
          onChange={handlePageClick}
          innerClass="flex space-x-2"
          itemClass="border border-gray-300 rounded px-3 py-1 text-sm"
          linkClass="hover:bg-gray-200 transition duration-150"
          activeClass="bg-blue-500 text-white"
        />
      </div>
    </div>
  );
};

export default CustomPagination;
