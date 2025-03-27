"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation"; // You need to use 'next/navigation' for the App Router in Next.js 13
import axios from "axios";
import { myAppHook } from "@/context/AppProvider";
import PaginationLinks from "@/components/PaginationLinks";
import EditSchoolForm from "@/components/EditSchoolForm"; // Import the new component
import toast from "react-hot-toast";
import { Paginator } from "@/types/Paginator"; // Import the shared Paginator interface
import { SchoolType } from "@/types/SchoolType"; // Import the shared SchoolType interface

const Schools: React.FC = () => {
  const { authToken } = myAppHook();
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const [schools, setSchools] = useState<{ data: SchoolType[]; paginator: Paginator }>({
    data: [],
    paginator: {
      current_page: 1,
      last_page: 1,
      links: [],
      total: 0,
      per_page: 10,
      from: 0,
      to: 0,
    },
  });
  const defaultImg =
    "https://res.cloudinary.com/dagb1kdy2/image/upload/v1742230696/listings/iv6anzgdy1cpymxhddew.jpg";
  const [formData, setFormData] = useState<SchoolType>({
    id: "",
    uprn: 0,
    establishment_name: "",
    street: "",
    locality: "",
    address3: "",
    town: "",
    establishment_type_group: "",
    featured_image: defaultImg,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!authToken) {
      router.push("/auth");
      return;
    }
    fetchAllSchools(page || "1");
  }, [authToken, page, router]);

  const fetchAllSchools = async (page: string | number) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/schools?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      setSchools({
        data: response.data.schools.data,
        paginator: response.data.schools,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditClick = (school: SchoolType) => {
    setFormData({
        ...school,
        id: String(school.id || ""), // Ensure id is explicitly cast to a string
    });
    console.log("formData after setting in handleEditClick:", formData); // Log the form data
    setIsEditing(true);
    setShowModal(true);
};

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      id: "",
      establishment_name: "",
      street: "",
      locality: "",
      address3: "",
      town: "",
      establishment_type_group: "",
      featured_image: "",
    });
    setIsEditing(false);
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      console.log("FormData being sent: ", formData); // Log formData to debug
      if (isEditing) {
        // Edit School
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/schools/${formData.id || ""}`, // Ensure id is a string
          formData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        toast.success(response.data.message);
        if (response.data.status) {
          fetchAllSchools(page || "1");
          handleCloseModal();
        }
      } else {
        // Add School
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/schools`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        if (response.data.status) {
          fetchAllSchools(page || "1");
          handleCloseModal();
        }
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center bg-gray-100 py-6 px-6 flex-col">
        <div className="bg-white shadow-md rounded-lg p-6 w-full">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Pic</th>
                <th className="border border-gray-300 px-4 py-2 text-left">UPRN</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Address</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schools.data.map((school, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2"><img src={school.featured_image} alt="" width={100} height={100} /></td>
                  <td className="border border-gray-300 px-4 py-2">{school.uprn}</td>
                  <td className="border border-gray-300 px-4 py-2">{school.establishment_name}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {school.street && <span>{school.street}, </span>}
                    {school.locality && <span>{school.locality}, </span>}
                    {school.address3 && <span>{school.address3}, </span>}
                    {school.town && <span>{school.town}</span>}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{school.establishment_type_group}</td>
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
        </div>
        <div className="container mx-auto bg-gray-100 mt-4">
          <PaginationLinks section="schools" paginator={schools.paginator} />
        </div>
      </div>

      {/* EditSchoolForm Modal */}
      {showModal && (
        <EditSchoolForm
          formData={formData}
          setFormData={setFormData}
          isEditing={isEditing}
          handleFormSubmit={handleFormSubmit}
          handleCloseModal={handleCloseModal}
        />
      )}
    </>
  );
};

export default Schools;
