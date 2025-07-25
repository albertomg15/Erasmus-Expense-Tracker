import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import {
  getAllTags,
  createTag,
  deleteTag,
  updateTag,
} from "../services/tagService";
import { useTranslation } from "react-i18next";

export default function TagSelector({ selectedTags, setSelectedTags }) {
  const { t } = useTranslation("common");
  const [allTags, setAllTags] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTagId, setEditingTagId] = useState(null);
  const [name, setName] = useState("");
  const [nameBeforeEdit, setNameBeforeEdit] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const tags = await getAllTags();
      setAllTags(tags);
    } catch (err) {
      console.error("Failed to load tags", err);
    }
  };

  const handleTagToggle = (name) => {
    setSelectedTags((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    try {
      if (editingTagId) {
        const updated = await updateTag(editingTagId, name);
        setAllTags((prev) =>
          prev.map((tag) => (tag.tagId === editingTagId ? updated : tag))
        );
        setSelectedTags((prev) =>
          prev.includes(nameBeforeEdit)
            ? prev.map((t) => (t === nameBeforeEdit ? updated.name : t))
            : prev
        );
        toast.success(t("tags.updated"));
      } else {
        const created = await createTag(name.trim());
        setAllTags((prev) => [...prev, created]);
        setSelectedTags((prev) => [...prev, created.name]);
        toast.success(t("tags.created"));
      }

      resetForm();
    } catch (err) {
      console.error("Error saving tag", err);
      toast.error(t("tags.saveError"));
    }
  };

  const handleDelete = async (id, name) => {
    try {
      await deleteTag(id);
      setAllTags((prev) => prev.filter((tag) => tag.tagId !== id));
      setSelectedTags((prev) => prev.filter((t) => t !== name));
      toast.success(t("tags.deleted"));
    } catch (err) {
      console.error("Error deleting tag", err);
      toast.error(t("tags.deleteError"));
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingTagId(null);
    setName("");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block font-medium mb-1">{t("tags.label")}</label>

      <button
        type="button"
        onClick={() => setShowDropdown((prev) => !prev)}
        className="w-full border p-2 rounded bg-white text-left"
      >
        {selectedTags.length > 0
          ? selectedTags.join(", ")
          : t("tags.placeholder")}
        <span className="float-right">▼</span>
      </button>

      {showDropdown && (
        <div className="absolute z-10 w-full bg-white border rounded shadow mt-1">
          <div className="max-h-64 overflow-y-auto">
            {allTags.map((tag) => (
              <div
                key={tag.tagId}
                className="flex items-center justify-between px-2 py-1 hover:bg-gray-100"
              >
                <label className="flex-1 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={selectedTags.includes(tag.name)}
                    onChange={() => handleTagToggle(tag.name)}
                  />
                  {tag.name}
                </label>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    type="button"
                    className="text-sm bg-blue-500 text-white px-2 rounded"
                    onClick={() => {
                      setEditingTagId(tag.tagId);
                      setName(tag.name);
                      setNameBeforeEdit(tag.name);
                      setShowForm(true);
                      setShowDropdown(false);
                    }}
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    className="text-sm bg-red-500 text-white px-2 rounded"
                    onClick={() => handleDelete(tag.tagId, tag.name)}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>

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
              + {t("tags.new")}
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="mt-3 bg-gray-100 p-4 rounded shadow">
          <label className="block font-medium mb-1">
            {editingTagId ? t("tags.edit") : t("tags.new")}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded mb-3"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="bg-gray-400 text-white px-3 py-1 rounded"
              onClick={resetForm}
            >
              {t("tags.cancel")}
            </button>
            <button
              type="button"
              className="bg-green-600 text-white px-3 py-1 rounded"
              onClick={handleSave}
            >
              {t("tags.save")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
