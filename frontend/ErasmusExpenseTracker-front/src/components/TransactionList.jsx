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
    if (!window.confirm(t("confirmDelete", { defaultValue: "Are you sure you want to delete this transaction?" }))) return;
    try {
      const isRecurring = tx?.isRecurring ?? !!tx?.recurrencePattern;
      if (isRecurring) await deleteRecurringTransaction(tx.transactionId);
      else await deleteTransaction(tx.transactionId);
      onDelete?.(tx.transactionId);
      setSelectedTransaction(null);
    } catch (err) {
      console.error("Error deleting transaction", err);
      alert(t("deleteError", { defaultValue: "Error deleting transaction." }));
    }
  };

  return (
    <>
      {/* móvil: tarjetas; desktop: lista dividida */}
      <ul className="grid gap-2 md:gap-0 md:block md:divide-y">
        {transactions.map((tx) => {
          const isIncome = tx.type === "INCOME";
          const isRecurring = tx.isRecurring ?? !!tx.recurrencePattern;
          const isActive = tx.active ?? true;

          const categoryName = tx.categoryEmoji
            ? `${tx.categoryEmoji} ${tx.categoryName}`
            : tx.categoryName || tx.category?.name || t("uncategorized", { defaultValue: "Uncategorized" });

          const dateFormatted = new Date(tx.date).toLocaleDateString();
          const amountTop = `${isRecurring ? "" : (isIncome ? "+" : "-")}${formatCurrency(tx.amount, tx.currency)}`;
          const amountClass = isRecurring
            ? (isActive ? "text-gray-600" : "text-gray-400 line-through")
            : (isIncome ? "text-green-600" : "text-red-600");

          return (
            <li
              key={tx.transactionId}
              onClick={() => setSelectedTransaction(tx)}
              className="rounded-lg md:rounded-none border md:border-0 bg-white md:bg-transparent p-3 md:px-2 hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <strong className="truncate max-w-[60vw] sm:max-w-none">{tx.description}</strong>
                    {isRecurring && (
                      <>
                        <span title={t("recurring")}>🔁</span>
                        <span className="text-[10px] uppercase bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                          {t("recurring")}
                        </span>
                        {!isActive && (
                          <span className="text-[10px] uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            {t("inactive", { defaultValue: "Inactive" })}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">({categoryName})</span>
                  {tx.tripName && (
                    <div className="text-xs text-gray-500 italic mt-1">
                      {t("associatedTripOptional")}: {tx.tripName}
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <div className={`font-semibold ${amountClass}`}>{amountTop}</div>
                  {isRecurring && (
                    <div className="text-xs text-gray-500">
                      {isActive
                        ? `${t("nextExecution")}: ${
                            tx.nextExecution ? new Date(tx.nextExecution).toLocaleDateString() : "—"
                          }`
                        : t("inactive", { defaultValue: "Inactive" })}
                    </div>
                  )}
                  {tx.currency !== tx.convertedCurrency && tx.convertedAmount != null && (
                    <div className={`text-xs italic ${isRecurring ? "text-gray-400" : "text-gray-500"}`}>
                      ≈ {formatCurrency(tx.convertedAmount, tx.convertedCurrency)}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">{dateFormatted}</div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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
              <div><strong>{t("amount")}:</strong> {formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}</div>
              <div><strong>{t("type")}:</strong> {t(selectedTransaction.type.toLowerCase())}</div>
              <div><strong>{t("date")}:</strong> {new Date(selectedTransaction.date).toLocaleDateString()}</div>
              <div><strong>{t("category")}:</strong> {selectedTransaction.categoryName || t("uncategorized")}</div>
              {selectedTransaction.tripName && (
                <div><strong>{t("associatedTripOptional")}:</strong> {selectedTransaction.tripName}</div>
              )}
              {(selectedTransaction.isRecurring ?? !!selectedTransaction.recurrencePattern) && (
                <>
                  <hr className="my-2" />
                  <div><strong>{t("recurrencePattern")}:</strong> {t(selectedTransaction.recurrencePattern?.toLowerCase() || "recurring")}</div>
                  <div>
                    <strong>{t("nextExecution")}:</strong>{" "}
                    {selectedTransaction.active
                      ? (selectedTransaction.nextExecution ? new Date(selectedTransaction.nextExecution).toLocaleDateString() : "—")
                      : t("inactive", { defaultValue: "Inactive" })}
                  </div>
                  {selectedTransaction.recurrenceEndDate && (
                    <div><strong>{t("recurrenceEndDate")}:</strong> {new Date(selectedTransaction.recurrenceEndDate).toLocaleDateString()}</div>
                  )}
                  <div><strong>{t("active")}:</strong> {selectedTransaction.active ? t("active") : t("inactive", { defaultValue: "Inactive" })}</div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => (window.location.href = `/transactions/edit/${selectedTransaction.transactionId}`)}
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
