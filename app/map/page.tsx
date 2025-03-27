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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import Table from "@/components/Table"; // Import the new Table component
import { SchoolType } from "@/types/SchoolType"; // Import the shared SchoolType interface
import { Paginator } from "@/types/Paginator"; // Import the shared Paginator interface
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ""; // Set Mapbox access token

const Schools: React.FC = () => {
  const { authToken } = myAppHook();
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = searchParams ? searchParams.get("page") : null;
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
    phase_of_education: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null); // Ref for the map container
  const mapRef = useRef<mapboxgl.Map | null>(null); // Ref to store the map instance
  const rightPaneRef = useRef<HTMLDivElement | null>(null); // Ref for the right pane
  const [isPaneOpen, setIsPaneOpen] = useState(true); // State to track pane visibility

  const [status, setStatus] = useState<{
    Open: boolean;
    Closed: boolean;
  }>({
    Open: true,
    Closed: false,
  });

  const [filters, setFilters] = useState<{
    Nursery: boolean;
    Primary: boolean;
    Secondary: boolean;
    "Not applicable": boolean;
    Other: boolean;
  }>({
    Nursery: true,
    Primary: true,
    Secondary: true,
    "Not applicable": true,
    Other: true,
  });

  const handleEstStatusChange = (state: keyof typeof status) => {
    setStatus((prevStatus) => ({
      ...prevStatus,
      [state]: !prevStatus[state],
    }));
  };
  
  const handleFilterChange = (filter: keyof typeof filters) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filter]: !prevFilters[filter],
    }));
  };

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

      mapRef.current = map; // Store the map instance in the ref

      map.on("load", () => {
        // Add the source for the school layer
        map.addSource("schools", {
          type: "vector",
          url: "mapbox://jbiddulph.schools", // Tileset ID
        });

        // Add a layer to display circles for the school locations
        map.addLayer({
          id: "school-circles",
          type: "circle",
          source: "schools",
          "source-layer": "schools", // Layer name in the Tileset
          paint: {
            "circle-radius": 9, // Circle size
            "circle-color": [
              "case",
              ["all", ["==", ["get", "establishment_status"], "Open"], status.Open],
              [
                "match",
                ["get", "phase_of_education"], // Get the phase_of_education property
                "Nursery", filters.Nursery ? "#FFDE21" : "transparent", // Yellow for Nursery
                "Primary", filters.Primary ? "#007cbf" : "transparent", // Blue for Primary
                "Secondary", filters.Secondary ? "#800080" : "transparent", // Purple for Secondary
                "Not applicable", filters["Not applicable"] ? "#ff69b4" : "transparent", // Pink for Not applicable
                filters.Other ? "#666666" : "transparent", // Default color (gray) for other values
              ],
              ["all", ["==", ["get", "establishment_status"], "Closed"], status.Closed],
              [
                "match",
                ["get", "phase_of_education"], // Get the phase_of_education property
                "Nursery", filters.Nursery ? "#FFDE21" : "transparent", // Yellow for Nursery
                "Primary", filters.Primary ? "#007cbf" : "transparent", // Blue for Primary
                "Secondary", filters.Secondary ? "#800080" : "transparent", // Purple for Secondary
                "Not applicable", filters["Not applicable"] ? "#ff69b4" : "transparent", // Pink for Not applicable
                filters.Other ? "#666666" : "transparent", // Default color (gray) for other values
              ],
              "transparent", // Default to transparent if establishment_status is not visible
            ],
          },
        });

        // Add popup functionality
        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
        });

        // Mouseenter event to show popup
        map.on("mouseenter", "school-circles", (e) => {
          map.getCanvas().style.cursor = "pointer";

          const coordinates = e.lngLat;
          const properties = e.features?.[0]?.properties;

          if (properties) {
            popup
              .setLngLat(coordinates)
              .setHTML(`
                <div>
                  <strong>${properties.establishment_name}</strong><br />
                  ${properties.street || ""} ${properties.locality || ""}<br />
                  ${properties.town || ""}
                </div>
              `)
              .addTo(map);
          }
        });

        // Mouseout event to hide popup
        map.on("mouseout", "school-circles", () => {
          map.getCanvas().style.cursor = "";
          popup.remove();
        });
      });

      return () => map.remove(); // Cleanup map instance on component unmount
    }
  }, []); // Only run on mount

  useEffect(() => {
    const map = mapRef.current; // Access the map instance from the ref
    if (map && map.getLayer("school-circles")) {
      map.setPaintProperty("school-circles", "circle-color", [
        "case",
        ["all", ["==", ["get", "establishment_status"], "Open"], status.Open],
        [
          "match",
          ["get", "phase_of_education"],
          "Nursery", filters.Nursery ? "#FFDE21" : "transparent",
          "Primary", filters.Primary ? "#007cbf" : "transparent",
          "Secondary", filters.Secondary ? "#800080" : "transparent",
          "Not applicable", filters["Not applicable"] ? "#ff69b4" : "transparent",
          filters.Other ? "#666666" : "transparent",
        ],
        ["all", ["==", ["get", "establishment_status"], "Closed"], status.Closed],
        [
          "match",
          ["get", "phase_of_education"],
          "Nursery", filters.Nursery ? "#FFDE21" : "transparent",
          "Primary", filters.Primary ? "#007cbf" : "transparent",
          "Secondary", filters.Secondary ? "#800080" : "transparent",
          "Not applicable", filters["Not applicable"] ? "#ff69b4" : "transparent",
          filters.Other ? "#666666" : "transparent",
        ],
        "transparent",
      ]);
    }
  }, [filters, status]); // Update when filters or status change

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
      phase_of_education: "",
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

  const togglePane = () => {
    if (rightPaneRef.current && mapContainerRef.current && mapRef.current) {
      // Toggle the pane state
      setIsPaneOpen(!isPaneOpen);

      if (isPaneOpen) {
        // Close the right pane
        rightPaneRef.current.style.display = "none"; // Hide the right pane
        mapContainerRef.current.style.flex = "1"; // Make the map container take full width
      } else {
        // Open the right pane
        rightPaneRef.current.style.display = "block"; // Show the right pane
        mapContainerRef.current.style.flex = "2"; // Reset the map container to 2/3 width
      }

      // Notify Mapbox of the size change
      setTimeout(() => {
        mapRef.current?.resize();
      }, 300); // Delay to match the CSS transition duration
    }
  };

  return (
    <>
      <div className="bg-white shadow-md w-full h-[100vh] flex bg-gray-100">
        {/* Map Container */}
        <div
          ref={mapContainerRef}
          className="h-full transition-all duration-300 ease-in-out"
          style={{
            flex: isPaneOpen ? "2" : "1", // Dynamically adjust flex based on isPaneOpen
          }}
        />
          {/* Toggle Button */}
          <button
            onClick={togglePane}
            className="border z-10 fixed -right-[6px] top-1/2 transform -translate-y-1/2 bg-yellow-500 text-white px-3 py-2 rounded shadow-md hover:bg-blue-600 transition"
          >
            {isPaneOpen ? "→" : "←"}
          </button>
        {/* Right Pane */}
        <div
          id="rightPane"
          ref={rightPaneRef}
          className={`relative p-6 transition-transform duration-300 ease-in-out h-full bg-white shadow-md`}
          style={{
            flex: "1", // Fixed width for the right pane
            display: isPaneOpen ? "block" : "none", // Hide or show the pane
          }}
        >
          <Tabs defaultValue="account" className="w-100 h-100">
            <TabsList>
              <TabsTrigger value="account">Filters</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
              <div className="mb-4">
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Phase of Education</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex gap-4">
                        {(["Nursery", "Primary", "Secondary", "Not applicable", "Other"] as Array<keyof typeof filters>).map((filter) => (
                            <label key={filter} className="flex items-center gap-2">
                            <Checkbox 
                                checked={filters[filter]}
                                onCheckedChange={() => handleFilterChange(filter)}
                            />
                            {filter}
                            </label>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Establishment Status</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex gap-4">
                        {(["Open", "Closed"] as Array<keyof typeof status>).map((state) => (
                            <label key={state} className="flex items-center gap-2">
                            <Checkbox 
                                checked={status[state]}
                                onCheckedChange={() => handleEstStatusChange(state)}
                            />
                            {state}
                            </label>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Is it wee wee?</AccordionTrigger>
                    <AccordionContent>
                      Yes. It adheres to the WAI-ARIA design pattern.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </TabsContent>
            <TabsContent value="table">
              <Table
                schools={schools.data}
                paginator={schools.paginator}
                handleEditClick={handleEditClick}
              />
            </TabsContent>
          </Tabs>
          <Drawer>
            <DrawerTrigger>Open</DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Are you absolutely sure?</DrawerTitle>
                <DrawerDescription>This action cannot be undone.</DrawerDescription>
              </DrawerHeader>
              <DrawerFooter>
                <Button>Submit</Button>
                <DrawerClose asChild>
                  <div>
                    <Button variant="outline">Cancel</Button>
                  </div>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
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
