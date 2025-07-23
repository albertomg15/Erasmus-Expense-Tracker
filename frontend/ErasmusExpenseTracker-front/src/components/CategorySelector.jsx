import { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { toast } from "react-hot-toast";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categoryService";

export default function CategorySelector({
  categories,
  setCategories,
  selectedCategoryId,
  setSelectedCategoryId,
  userId,
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const dropdownRef = useRef(null);

  const selectedCategory = categories.find(
    (c) => c.categoryId === selectedCategoryId
  );

  // Cierre automático al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSave = async () => {
    try {
      const payload = { name, emoji };

      if (editingCategoryId) {
        const updated = await updateCategory(editingCategoryId, payload, userId);
        setCategories((prev) =>
          prev.map((cat) =>
            cat.categoryId === editingCategoryId ? updated : cat
          )
        );
        toast.success("Category updated");
      } else {
        const created = await createCategory(payload, userId);
        setCategories((prev) => [...prev, created]);
        setSelectedCategoryId(created.categoryId);
        toast.success("Category created");
      }

      resetForm();
    } catch (err) {
      console.error("Error saving category", err);
      toast.error("Error saving category");
    }
  };

  const handleDelete = async (id) => {
  try {
    await deleteCategory(id);
    setCategories((prev) => prev.filter((cat) => cat.categoryId !== id));
    if (selectedCategoryId === id) setSelectedCategoryId("");
    toast.success("Category deleted");
  } catch (err) {
    console.error("Error deleting category", err);
    toast.error(err.message.includes("used by existing transactions")
      ? "Cannot delete: this category is used in existing transactions."
      : err.message || "Error deleting category");
  }
};


  const resetForm = () => {
    setShowForm(false);
    setEditingCategoryId(null);
    setName("");
    setEmoji("");
  };

  return (
    <div className="w-full relative" ref={dropdownRef}>
      <label className="block mb-1 font-medium">Category</label>

      {/* Selector cerrado */}
      <button
        type="button"
        onClick={() => setShowDropdown((prev) => !prev)}
        className="w-full flex justify-between items-center p-2 border rounded bg-white"
      >
        <span>
          {selectedCategory ? (
            <>
              {selectedCategory.emoji && (
                <span className="mr-1">{selectedCategory.emoji}</span>
              )}
              {selectedCategory.name}
            </>
          ) : (
            "Select category"
          )}
        </span>
        <span className="ml-2">▼</span>
      </button>

      {/* Desplegable */}
      {showDropdown && (
  <div className="absolute z-10 w-full bg-white border rounded shadow mt-1">
    {/* Área scrollable con las categorías */}
    <div className="max-h-64 overflow-y-auto">
      {categories.map((cat) => (
        <div
          key={cat.categoryId}
          className="flex items-center justify-between px-2 py-1 hover:bg-gray-100"
        >
          <button
            type="button"
            onClick={() => {
              setSelectedCategoryId(cat.categoryId);
              setShowDropdown(false);
            }}
            className="flex-1 text-left"
          >
            {cat.emoji && <span className="mr-1">{cat.emoji}</span>}
            {cat.name}
          </button>

          {!cat.default && (
            <div className="flex items-center gap-1 ml-2">
              <button
                type="button"
                className="text-sm bg-blue-500 text-white px-2 rounded"
                onClick={() => {
                  setEditingCategoryId(cat.categoryId);
                  setName(cat.name);
                  setEmoji(cat.emoji || "");
                  setShowForm(true);
                  setShowDropdown(false);
                }}
              >
                ✎
              </button>
              <button
                type="button"
                className="text-sm bg-red-500 text-white px-2 rounded"
                onClick={() => handleDelete(cat.categoryId)}
              >
                🗑
              </button>
            </div>
          )}
        </div>
      ))}
    </div>

    {/* Botón fijo abajo */}
    <div className="sticky bottom-0 bg-white border-t p-2">
      <button
        type="button"
        className="w-full bg-green-600 text-white px-3 py-1 rounded"
        onClick={() => {
          resetForm();
          setShowForm(true);
          setShowDropdown(false);
        }}
      >
        + New Category
      </button>
    </div>
  </div>
)}


      {/* Formulario emergente */}
      {showForm && (
        <div className="mt-3 bg-gray-100 p-4 rounded shadow">
          <label className="block font-medium mb-1">
            {editingCategoryId ? "Edit Category" : "New Category"}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />

          {emoji && <div className="text-3xl mb-2">Selected: {emoji}</div>}

          <label className="block font-medium mb-1">Choose Emoji</label>
          <EmojiPicker onEmojiClick={(e) => setEmoji(e.emoji)} height={300} />

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="bg-gray-400 text-white px-3 py-1 rounded"
              onClick={resetForm}
            >
              Cancel
            </button>
            <button
              type="button"
              className="bg-green-600 text-white px-3 py-1 rounded"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
