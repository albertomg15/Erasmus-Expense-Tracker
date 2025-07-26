import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserInfo, updateUser } from "../services/userService";
import { changePassword } from "../services/userService";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { getSupportedCurrencies } from "../services/exchangeRateService";




const Profile = () => {
  const { token, userId } = useAuth();

 const [user, setUser] = useState(null);
const [loadError, setLoadError] = useState(false);

  const [editing, setEditing] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const { t, i18n } = useTranslation("profile");
  const [availableCurrencies, setAvailableCurrencies] = useState([]);


  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  useEffect(() => {
  getUserInfo()
    .then(setUser)
    .catch((err) => {
      console.error("Error loading user:", err);
      setLoadError(true);
    });
}, []);

useEffect(() => {
  async function fetchCurrencies() {
    try {
      const currencies = await getSupportedCurrencies();
      setAvailableCurrencies(currencies);
    } catch (err) {
      console.error("Error loading currencies", err);
    }
  }

  fetchCurrencies();
}, []);


  const handleSave = async () => {
    if (!user.email || !user.language || !user.preferredCurrency) {
      toast.error(t("errorIncomplete"));
      return;
    }

    try {
      await updateUser(user);
      i18n.changeLanguage(user.language);
      toast.success(t("updateSuccess"));
      setEditing(false);
    } catch (err) {
      console.error(err);
      toast.error(t("updateError"));
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword || !currentPassword) return;

    if (newPassword !== confirmPassword) {
      toast.error(t("passwordMismatch"));
      return;
    }

    try {
      await changePassword(userId, currentPassword, newPassword);
      toast.success(t("passwordSuccess"));
      setShowPasswordForm(false);
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
    } catch (err) {
      console.error(err);
      toast.error(t("passwordError"));
    }
  };

  if (!user) return <div className="p-6">{t("loading") || "Loading..."}</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>

      <div className="bg-white shadow p-6 rounded-2xl space-y-4">
        <h2 className="text-lg font-semibold">{t("personalData")}</h2>

        <div>
          <label className="block mb-1">{t("email")}</label>
          <input
            type="email"
            className="w-full p-2 border rounded"
            value={user.email}
            disabled
          />
        </div>

        <div className="mb-4">
          <label htmlFor="language" className="block font-medium mb-1">
            {t("language")}
          </label>
          <select
            id="language"
            value={user.language}
            onChange={(e) => setUser({ ...user, language: e.target.value })}
            disabled={!editing}
            className={`w-full border rounded px-3 py-2 ${
              editing ? "bg-white" : "bg-gray-100 text-gray-500"
            }`}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>



        <div className="mb-4">
          <label htmlFor="preferredCurrency" className="block font-medium mb-1">
            {t("preferredCurrency")}
          </label>
          <select
            id="preferredCurrency"
            value={user.preferredCurrency || ""}
            onChange={(e) => setUser({ ...user, preferredCurrency: e.target.value })}
            disabled={!editing}
            className={`w-full border rounded px-3 py-2 ${
              editing ? "bg-white" : "bg-gray-100 text-gray-500"
            }`}
          >
            <option value="">{t("selectCurrency")}</option>
            {availableCurrencies.map((cur) => (
              <option key={cur} value={cur}>
                {cur}
              </option>
            ))}
          </select>
        </div>


        <div className="flex gap-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => {
              if (editing) handleSave();
              else setEditing(true);
            }}
          >
            {editing ? t("saveChanges") : t("edit")}
          </button>

          {editing && (
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded"
              onClick={() => {
                setEditing(false);
              }}
            >
              {t("cancel")}
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 bg-white shadow p-6 rounded-2xl space-y-4">
        <h2 className="text-lg font-semibold">{t("password")}</h2>

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => setShowPasswordForm(!showPasswordForm)}
        >
          {showPasswordForm ? t("hideForm") : t("changePassword")}
        </button>

        {showPasswordForm && (
          <div className="space-y-4">
            <div>
              <label className="block mb-1">{t("currentPassword")}</label>
              <input
                type="password"
                className="w-full p-2 border rounded"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1">{t("newPassword")}</label>
              <input
                type="password"
                className="w-full p-2 border rounded"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1">{t("confirmPassword")}</label>
              <input
                type="password"
                className="w-full p-2 border rounded"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={handlePasswordChange}
            >
              {t("updatePassword")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
