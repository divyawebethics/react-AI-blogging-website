import React from "react";
import type { UseFormRegister } from "react-hook-form";
import type { FormData } from "../../../props/formTypes";

interface Props {
  register: UseFormRegister<FormData & { image_file?: FileList }>;
}

export const ImageUploadSection: React.FC<Props> = ({ register }) => (
  <section className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
    <label className="block text-sm font-semibold text-gray-700 mb-3">Upload Image</label>
    <input
      type="file"
      accept="image/*"
      {...register("image_file", {
        setValueAs: (files: FileList | undefined) => files,
      })}
      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
    />
  </section>
);
