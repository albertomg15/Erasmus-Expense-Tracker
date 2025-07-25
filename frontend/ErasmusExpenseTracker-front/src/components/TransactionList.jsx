import { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../utils/formatters";
import { deleteTransaction } from "../services/transactionService";
import { deleteRecurringTransaction } from "../services/recurringTransactionService";

export default function TransactionList({ transactions, onDelete }) {
  const { t } = useTranslation("transactions");
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const handleDelete = async () => {
    const tx = selectedTransaction;
    const confirmed = window.confirm(t("confirmDelete", { defaultValue: "Are you sure you want to delete this transaction?" }));
    if (!confirmed) return;
    try {
      if (tx.recurrencePattern) {
        await deleteRecurringTransaction(tx.transactionId);
      } else {
        await deleteTransaction(tx.transactionId);
      }
      onDelete?.(tx.transactionId);
      setSelectedTransaction(null);
    } catch (err) {
      console.error("Error deleting transaction", err);
      alert(t("deleteError", { defaultValue: "Error deleting transaction." }));
    }
  };

  return (
    <>
      <ul className="divide-y">
        {transactions.map((tx) => {
          const isIncome = tx.type === "INCOME";
          const isRecurring = !!tx.recurrencePattern;
          const categoryName = tx.categoryEmoji
            ? `${tx.categoryEmoji} ${tx.categoryName}`
            : tx.categoryName || tx.category?.name || t("uncategorized", { defaultValue: "Uncategorized" });

          const dateFormatted = new Date(tx.date).toLocaleDateString();

          const amountFormatted = isRecurring
            ? tx.active
              ? `${t("nextExecution")}: ${new Date(tx.nextExecution).toLocaleDateString()}`
              : t("cancelled", { defaultValue: "Cancelled" })
            : `${isIncome ? "+" : "-"}${formatCurrency(tx.amount)}`;

          const amountClass = isRecurring
            ? tx.active
              ? "text-blue-600"
              : "text-red-600"
            : isIncome
              ? "text-green-600"
              : "text-red-600";

          return (
            <li
              key={tx.transactionId}
              onClick={() => setSelectedTransaction(tx)}
              className="py-3 px-2 flex justify-between hover:bg-gray-100 cursor-pointer rounded"
            >
              <div>
                <div className="flex gap-2 items-center">
                  <strong>{tx.description}</strong>
                  {isRecurring && <span title={t("recurring")}>🔁</span>}
                </div>
                <span className="text-sm text-gray-500">({categoryName})</span>
                {tx.tripName && (
                  <div className="text-xs text-gray-500 italic mt-1">
                    {t("associatedTripOptional")}: {tx.tripName}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className={`font-semibold ${amountClass}`}>{amountFormatted}</div>
                <div className="text-xs text-gray-500">{dateFormatted}</div>
              </div>
            </li>
          );
        })}
      </ul>

      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg relative">
            <button
              onClick={() => setSelectedTransaction(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">{t("details", { defaultValue: "Transaction Details" })}</h2>
            <div className="space-y-2 text-sm">
              <div><strong>{t("description")}:</strong> {selectedTransaction.description}</div>
              <div><strong>{t("amount")}:</strong> {formatCurrency(selectedTransaction.amount)} {selectedTransaction.currency}</div>
              <div><strong>{t("type")}:</strong> {t(selectedTransaction.type.toLowerCase())}</div>
              <div><strong>{t("date")}:</strong> {new Date(selectedTransaction.date).toLocaleDateString()}</div>
              <div><strong>{t("category")}:</strong> {selectedTransaction.category?.name || t("uncategorized")}</div>
              {selectedTransaction.tripName && (
                <div><strong>{t("associatedTripOptional")}:</strong> {selectedTransaction.tripName}</div>
              )}
              {selectedTransaction.recurrencePattern && (
                <>
                  <hr className="my-2" />
                  <div><strong>{t("recurrencePattern")}:</strong> {t(selectedTransaction.recurrencePattern.toLowerCase())}</div>
                  <div><strong>{t("nextExecution")}:</strong> {new Date(selectedTransaction.nextExecution).toLocaleDateString()}</div>
                  {selectedTransaction.recurrenceEndDate && (
                    <div><strong>{t("recurrenceEndDate")}:</strong> {new Date(selectedTransaction.recurrenceEndDate).toLocaleDateString()}</div>
                  )}
                  <div><strong>{t("maxOccurrences")}:</strong> {selectedTransaction.executedOccurrences}</div>
                  <div><strong>{t("active")}:</strong> {selectedTransaction.active ? t("active") : t("inactive", { defaultValue: "Inactive" })}</div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  window.location.href = `/transactions/edit/${selectedTransaction.transactionId}`;
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {t("editTitle")}
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                {t("delete", { defaultValue: "Delete" })}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
