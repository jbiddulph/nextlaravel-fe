import React from "react";
import PaginationLinks from "@/components/PaginationLinks";
import { SchoolType } from "@/types/SchoolType"; // Import the shared SchoolType interface
import { Paginator } from "@/types/Paginator"; // Import the shared Paginator interface

interface TableProps {
  schools: SchoolType[];
  paginator: Paginator;
  handleEditClick: (school: SchoolType) => void;
}

const Table: React.FC<TableProps> = ({ schools, paginator, handleEditClick }) => {
  return (
    <div>
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Address</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Phase</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {schools.map((school, index) => (
            <tr key={index}>
              <td className="border border-gray-300 px-4 py-2">{school.establishment_name}</td>
              <td className="border border-gray-300 px-4 py-2">
                {school.street && <span>{school.street}, </span>}
                {school.locality && <span>{school.locality}, </span>}
                {school.address3 && <span>{school.address3}, </span>}
                {school.town && <span>{school.town}</span>}
              </td>
              <td className="border border-gray-300 px-4 py-2">{school.establishment_type_group}</td>
              <td className="border border-gray-300 px-4 py-2">{school.phase_of_education}</td>
              <td className="border border-gray-300 px-4 py-2">
                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition mr-2"
                  onClick={() => handleEditClick(school)}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="container mx-auto bg-gray-100 mt-4">
        <PaginationLinks section="map" paginator={paginator} />
      </div>
    </div>
  );
};

export default Table;
