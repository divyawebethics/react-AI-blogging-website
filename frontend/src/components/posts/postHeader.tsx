import React from "react";

export const PostHeader: React.FC = () => {
  return (
    <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Create New Post</h1>
          <p className="text-gray-600 mt-1">
            Write and share your thoughts with the world.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            type="button"
          >
            Save Draft
          </button>
          <button
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
            type="button"
          >
            Preview
          </button>
        </div>
      </div>
    </div>
  );
};
