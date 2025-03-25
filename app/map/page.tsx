"use client";

import "mapbox-gl/dist/mapbox-gl.css"; // Import Mapbox GL CSS
import React, { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl"; // Import Mapbox GL
import { useSearchParams, useRouter } from "next/navigation"; // You need to use 'next/navigation' for the App Router in Next.js 13
import axios from "axios";
import { myAppHook } from "@/context/AppProvider";
import PaginationLinks from "@/components/PaginationLinks";
import EditSchoolForm from "@/components/EditSchoolForm"; // Import the new component
import toast from "react-hot-toast";

interface Paginator {
  current_page: number;
  last_page: number;
  links: { url: string | null; label: string; active: boolean }[];
  total: number;
  per_page: number;
  from: number; // Add 'from' property
  to: number;   // Add 'to' property
}

interface SchoolType {
  id?: string;
  uprn?: number;
  establishment_name: string;
  address?: string;
  street?: string;
  locality?: string;
  address3?: string;
  town?: string;
  establishment_type_group?: string;
}

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ""; // Set Mapbox access token

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
  const [formData, setFormData] = useState<SchoolType>({
    id: "",
    uprn: 0,
    establishment_name: "",
    street: "",
    locality: "",
    address3: "",
    town: "",
    establishment_type_group: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null); // Ref for the map container

  useEffect(() => {
    if (!authToken) {
      router.push("/auth");
      return;
    }
    fetchAllSchools(page || "1");
  }, [authToken, page, router]);

  useEffect(() => {
    if (mapContainerRef.current) {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current, // Map container
        style: "mapbox://styles/mapbox/streets-v11", // Map style
        center: [-0.1276, 51.5072], // Initial map center [lng, lat] (e.g., London)
        zoom: 10, // Initial zoom level
      });

      return () => map.remove(); // Cleanup map instance on component unmount
    }
  }, []);

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
      <div className="bg-white shadow-md h-[100vh] flex items-center flex-col md:flex-row justify-between bg-gray-100 py-6 px-6">
        <div ref={mapContainerRef} className="w-full h-[81vh] mb-6" />
        <div className="p-6 w-full">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Address</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schools.data.map((school, index) => (
                <tr key={index}>
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
          <div className="container mx-auto bg-gray-100 mt-4">
            <PaginationLinks section="schools" paginator={schools.paginator} />
            </div>
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
