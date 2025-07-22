import { useEffect, useState } from "react";
import { getDefaultBudget, updateDefaultBudget } from "../services/budgetService";
import { getUserInfo, updateUser, changePassword } from "../services/userService";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

export default function Profile() {
  const { token } = useAuth();
  const [user, setUser] = useState({
    email: "",
    language: "",
    preferredCurrency: "",
  });

  const [budget, setBudget] = useState({
    budgetId: null,
    maxSpending: "",
    warningThreshold: "",
  });

  const [editing, setEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    async function fetchData() {
      try {
  const userData = await getUserInfo();
  setUser(userData);

  try {
    const budgetData = await getDefaultBudget();
    if (budgetData) {
      const { budgetId, maxSpending, warningThreshold } = budgetData;
      setBudget({ budgetId, maxSpending, warningThreshold });
    }
  } catch (budgetErr) {
    // Si devuelve 404, asumimos que no hay presupuesto aún
    console.warn("No default budget found");
    setBudget(null);
  }

} catch (err) {
  console.error("Error loading profile data:", err);
}

    }

    fetchData();
  }, []);

  const handleUserChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleBudgetChange = (e) => {
    setBudget({ ...budget, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!user.email || !user.language || !user.preferredCurrency) {
      toast.error("Please complete all personal data fields.");
      return;
    }

    const maxSpendingNum = parseFloat(budget.maxSpending);
    const warningThresholdNum = parseFloat(budget.warningThreshold);

    if (isNaN(maxSpendingNum) || isNaN(warningThresholdNum)) {
      toast.error("Budget values must be valid numbers.");
      return;
    }

    try {
      await updateUser(user);
      await updateDefaultBudget({
        maxSpending: maxSpendingNum,
        warningThreshold: warningThresholdNum,
      });


      toast.success("Data updated successfully.");
      setEditing(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update data.");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password updated successfully.");
      setShowPasswordForm(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.message || "Failed to change password.");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>

      {/* Personal Data */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Personal Data</h2>
        <input
          type="email"
          name="email"
          value={user.email}
          onChange={handleUserChange}
          className="w-full mb-2 p-2 border rounded"
          disabled
        />
        <div className="mb-2">
          <label className="block mb-1">Language</label>
          <select
            name="language"
            value={user.language}
            onChange={handleUserChange}
            className="w-full p-2 border rounded"
            disabled={!editing}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
          </select>
        </div>
        <div className="mb-2">
          <label className="block mb-1">Preferred Currency</label>
          <input
            name="preferredCurrency"
            value={user.preferredCurrency}
            onChange={handleUserChange}
            className="w-full p-2 border rounded"
            disabled={!editing}
          />
        </div>
      </section>

      {/* Budget */}
      <section className="mb-6">
  <h2 className="text-xl font-semibold mb-2">Default Budget</h2>

  {(budget || editing) ? (
    <>
      <div className="mb-2">
        <label className="block mb-1">Monthly Maximum Spending</label>
        <input
          type="number"
          name="maxSpending"
          value={budget?.maxSpending || ""}
          onChange={handleBudgetChange}
          className="w-full p-2 border rounded"
          disabled={!editing}
        />
      </div>
      <div>
        <label className="block mb-1">Warning Threshold</label>
        <input
          type="number"
          name="warningThreshold"
          value={budget?.warningThreshold || ""}
          onChange={handleBudgetChange}
          className="w-full p-2 border rounded"
          disabled={!editing}
        />
      </div>
    </>
  ) : (
    <p className="text-gray-600 italic">
      No default budget set. Click "Edit" to establish one.
    </p>
  )}
</section>



      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button onClick={() => setEditing(!editing)} className="bg-erasmus-blue text-white px-4 py-2 rounded">
          {editing ? "Cancel" : "Edit"}
        </button>
        {editing && (
          <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded">
            Save Changes
          </button>
        )}
      </div>

      {/* Password Section */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Password</h2>
        <button
          onClick={() => setShowPasswordForm(!showPasswordForm)}
          className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          {showPasswordForm ? "Hide form" : "Change password"}
        </button>

        {showPasswordForm && (
          <form onSubmit={handlePasswordSubmit} className="space-y-2 mt-2">
            <input
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              placeholder="Current Password"
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="New Password"
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              placeholder="Confirm New Password"
              className="w-full p-2 border rounded"
              required
            />
            <button type="submit" className="bg-erasmus-blue text-white px-4 py-2 rounded">
              Update Password
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
