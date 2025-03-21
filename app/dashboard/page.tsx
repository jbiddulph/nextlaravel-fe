"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation"; // You need to use 'next/navigation' for the App Router in Next.js 13
import axios from "axios";
import Image from "next/image";
import { myAppHook } from "@/context/AppProvider";
import ImageUpload from "@/components/ImageUpload";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import PaginationLinks from "@/components/PaginationLinks";

interface Paginator {
  current_page: number;
  last_page: number;
  links: { url: string | null; label: string; active: boolean }[];
  total: number;
  per_page: number;
}

interface ProductType {
  id?: number;
  title: string;
  description?: string;
  cost?: number;
  banner_image: string;
}

const Dashboard: React.FC = () => {
  const { authToken } = myAppHook();
  const [routerMounted, setRouterMounted] = useState(false);  // Track if router is mounted
  const router = useRouter(); // Use router hook
  const searchParams = useSearchParams()
  const page = searchParams.get('page')
  const [products, setProducts] = React.useState<{ data: ProductType[], paginator: Paginator }>({
    data: [],
    paginator: {
      current_page: 1,
      last_page: 1,
      links: [],
      total: 0,
      per_page: 10,
    },
  });
  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  const defaultImg =
    "https://res.cloudinary.com/dagb1kdy2/image/upload/v1742230696/listings/iv6anzgdy1cpymxhddew.jpg";
  const [formData, setFormData] = React.useState<ProductType>({
    title: "",
    description: "",
    cost: 0,
    banner_image: defaultImg,
  });

    const handleImageChange = (imageUrl: string | null) => {
    setFormData({
      ...formData,
      banner_image: imageUrl || "",
    });
  };

  // On Change Form Inputs
  const handleOnchangeEvent = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  // Run once to set routerMounted to true
  useEffect(() => {
    setRouterMounted(true);
  }, []);

  // Wait for router to be ready and then fetch products
  useEffect(() => {
    if (!authToken) {
      router.push("/auth");
      return;
    }
    if (routerMounted) {
      // const page = router.query?.page || 1; // Ensure router.query is defined before accessing 'page'
      fetchAllProducts(page || "1");
    }
  }, [authToken, routerMounted, page, router]); // Add routerMounted and router.query as dependencies

  const fetchAllProducts = async (page: string | number) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/products?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      setProducts({
        data: response.data.products.data,
        paginator: response.data.products,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (isEditing) {
        // Edit Product
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/products/${formData.id}`,
          {
            ...formData,
            _method: "PUT",
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (response.data.status) {
          toast.success(response.data.message);
          fetchAllProducts(page || 1);
          setFormData({
            title: "",
            description: "",
            cost: 0,
            banner_image: defaultImg,
          });
          setIsEditing(false);
        }
      } else {
        // Add Product
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/products`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (response.data.status) {
          toast.success(response.data.message);
          fetchAllProducts(page || 1);
          setFormData({
            title: "",
            description: "",
            cost: 0,
            banner_image: defaultImg,
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(
            `${process.env.NEXT_PUBLIC_API_URL}/products/${id}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );
          if (response.data.status) {
            toast.success(response.data.message);
            fetchAllProducts(page || 1);
          }
        } catch (error) {
          console.log(error);
        }
      }
    });
  };

  return (
    <>
      <div className="flex items-center justify-center bg-gray-100 py-6 px-6 flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Add Product Form */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h4 className="text-lg font-bold mb-4">{isEditing ? "Edit" : "Add"} Product</h4>
            <form onSubmit={handleFormSubmit}>
              <input
                className="border border-gray-300 rounded w-full p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                name="title"
                value={formData.title}
                onChange={handleOnchangeEvent}
                placeholder="Title"
                required
              />
              <input
                className="border border-gray-300 rounded w-full p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                name="description"
                value={formData.description}
                onChange={handleOnchangeEvent}
                placeholder="Description"
                required
              />
              <input
                className="border border-gray-300 rounded w-full p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                name="cost"
                value={formData.cost}
                onChange={handleOnchangeEvent}
                placeholder="Cost"
                type="number"
                required
              />
              <div className="mb-3">
                <ImageUpload
                  listingImage={formData.banner_image}
                  onImageChange={handleImageChange}
                />
              </div>
              <button
                className="bg-indigo-500 text-white w-full py-2 rounded hover:bg-indigo-600 transition"
                type="submit"
              >
                {isEditing ? "Update" : "Add"} Product
              </button>
            </form>
          </div>
          {/* Product Table */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Title</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Banner</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Cost</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.data.map((product, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2">{product.id}</td>
                    <td className="border border-gray-300 px-4 py-2">{product.title}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {product.banner_image ? (
                        <Image src={product.banner_image} alt="Product" height={50} width={50} />
                      ) : (
                        <span>No Image</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">${product.cost}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <button
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition mr-2"
                        onClick={() => {
                          setFormData({
                            id: product.id,
                            title: product.title,
                            description: product.description,
                            cost: product.cost,
                            banner_image: product.banner_image,
                          });
                          setIsEditing(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                        onClick={() => product.id !== undefined && handleDeleteProduct(product.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="container mx-auto bg-gray-100 mt-4">
          <PaginationLinks section="dashboard" paginator={products.paginator} />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
