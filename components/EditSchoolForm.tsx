import React from "react";
import ImageUpload from "./ImageUpload";
import { Button } from "./ui/button";
import { SchoolType } from "@/types/SchoolType";

interface EditSchoolFormProps {
  formData: SchoolType;
  setFormData: React.Dispatch<React.SetStateAction<SchoolType>>;
  isEditing: boolean;
  handleFormSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  handleCloseModal: () => void;
}

const EditSchoolForm: React.FC<EditSchoolFormProps> = ({
  formData,
  setFormData,
  isEditing,
  handleFormSubmit,
  handleCloseModal,
}) => {
  const handleOnChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };
  const handleImageChange = (imageUrl: string | null) => {
    setFormData({
      ...formData,
      featured_image: imageUrl || "",
    });
  };
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      role="dialog"
      aria-labelledby="edit-school-form-title"
      aria-modal="true"
    >
      <div className="bg-white shadow-md rounded-lg p-6 w-[400px]">
        <h4
          id="edit-school-form-title"
          className="text-lg font-bold mb-4"
        >
          {isEditing ? "Edit" : "Add"} School
        </h4>
        <form onSubmit={handleFormSubmit}>
          <ImageUpload
            listingImage={formData.featured_image}
            preset="nextSchools"
            onImageChange={handleImageChange}
          />
          <input
            className="border border-gray-300 rounded w-full p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            name="establishment_name"
            value={formData.establishment_name || ""} // Use empty string as fallback
            onChange={handleOnChangeInput}
            placeholder="Name"
            required
          />
          <input
            className="border border-gray-300 rounded w-full p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            name="street"
            value={formData.street || ""} // Use empty string as fallback
            onChange={handleOnChangeInput}
            placeholder="Street"
          />
          <input
            className="border border-gray-300 rounded w-full p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            name="locality"
            value={formData.locality || ""} // Use empty string as fallback
            onChange={handleOnChangeInput}
            placeholder="Locality"
          />
          <input
            className="border border-gray-300 rounded w-full p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            name="address3"
            value={formData.address3 || ""} // Use empty string as fallback
            onChange={handleOnChangeInput}
            placeholder="Address Line 3"
          />
          <input
            className="border border-gray-300 rounded w-full p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            name="town"
            value={formData.town || ""} // Use empty string as fallback
            onChange={handleOnChangeInput}
            placeholder="Town"
          />
          <input
            className="border border-gray-300 rounded w-full p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            name="establishment_type_group"
            value={formData.establishment_type_group || ""} // Use empty string as fallback
            onChange={handleOnChangeInput}
            placeholder="Establishment Type Group"
          />
          <div className="flex justify-between">
            <Button
              variant="primary"
              type="submit"
            >
              {isEditing ? "Update" : "Add"} School
            </Button>
            <Button
              className="primary"
              type="button"
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSchoolForm;
