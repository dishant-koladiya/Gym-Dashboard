import { useState } from "react";
import { SubscriptionPlan } from "../types";
import {
  Power,
  Edit3,
  CheckCircle2,
  X,
  Save,
  DollarSign,
  AlertCircle,
} from "lucide-react";

interface SubscriptionPlansViewProps {
  plans: SubscriptionPlan[];
  onSave: (plans: SubscriptionPlan[]) => void;
}

export default function SubscriptionPlansView({
  plans,
  onSave,
}: SubscriptionPlansViewProps) {
  const [localPlans, setLocalPlans] = useState<SubscriptionPlan[]>(
    plans.map((p) => ({ ...p }))
  );
  const [saved, setSaved] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editFeatures, setEditFeatures] = useState("");
  const [editPriceError, setEditPriceError] = useState("");

  const handleToggleActive = (name: string, value: string) => {
    const updated = localPlans.map((p) =>
      p.name === name ? { ...p, active: value === "active" } : p
    );
    setLocalPlans(updated);
  };

  const openEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setEditName(plan.name);
    setEditPrice(String(plan.price));
    setEditFeatures(plan.features.join("\n"));
    setEditPriceError("");
  };

  const closeEdit = () => {
    setEditingPlan(null);
  };

  const handleEditSave = () => {
    const priceNum = parseInt(editPrice);
    if (!editPrice.trim() || isNaN(priceNum) || priceNum < 0) {
      setEditPriceError("Enter a valid price");
      return;
    }
    const features = editFeatures
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);
    const updated = localPlans.map((p) =>
      p.name === editingPlan!.name
        ? { ...p, name: editName, price: priceNum, features }
        : p
    );
    setLocalPlans(updated);
    closeEdit();
  };

  const handleGlobalSave = () => {
    onSave(localPlans);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const hasUnsavedChanges =
    JSON.stringify(localPlans) !== JSON.stringify(plans);

  const badges: Record<string, string> = {
    "SHORT TERM": "bg-slate-100 text-slate-600",
    POPULAR: "bg-orange-50 text-orange-700",
    "BEST VALUE": "bg-emerald-50 text-emerald-700",
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Subscription Plans
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Manage pricing, features and availability
          </p>
        </div>

        <button
          onClick={handleGlobalSave}
          disabled={!hasUnsavedChanges}
          className={`bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 text-sm transition cursor-pointer ${
            hasUnsavedChanges
              ? "hover:bg-blue-700 active:scale-[0.98]"
              : "opacity-50 cursor-not-allowed"
          }`}
        >
          <Save className="w-3.5 h-3.5" />
          Save
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-lg text-sm font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          Plans saved successfully!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {localPlans.map((plan) => {
          const badgeClass = badges[plan.term] || "bg-slate-100 text-slate-600";
          return (
            <div
              key={plan.name}
              className={`bg-white border rounded-xl overflow-hidden shadow-sm flex flex-col transition ${
                plan.active
                  ? "border-slate-200"
                  : "border-rose-200 opacity-70"
              }`}
            >
              {/* Card Header */}
              <div className="p-6 pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      {plan.name}
                    </h3>
                    <span
                      className={`inline-block text-[11px] font-bold px-3 py-1 rounded uppercase tracking-wider mt-1 ${badgeClass}`}
                    >
                      {plan.term}
                    </span>
                  </div>
                  <div className="relative">
                    <Power className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select
                      value={plan.active ? "active" : "inactive"}
                      onChange={(e) =>
                        handleToggleActive(plan.name, e.target.value)
                      }
                      className={`pl-8 pr-3 py-1.5 border rounded-lg text-xs font-bold appearance-none cursor-pointer bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 ${
                        plan.active
                          ? "text-emerald-700 border-emerald-200"
                          : "text-rose-700 border-rose-200"
                      }`}
                    >
                      <option value="active" className="text-slate-800">
                        Active
                      </option>
                      <option value="inactive" className="text-slate-800">
                        Inactive
                      </option>
                    </select>
                  </div>
                </div>

                {/* Price */}
                <p className="text-2xl font-black text-blue-900 mt-3">
                  ₹{plan.price.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  +18% GST — ₹
                  {(plan.price + Math.round(plan.price * 0.18)).toLocaleString()}{" "}
                  total
                </p>
              </div>

              {/* Features */}
              <div className="px-6 flex-1">
                <ul className="text-sm text-slate-500 space-y-2 pb-4">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Edit Button */}
              <div className="px-6 pb-6">
                <button
                  onClick={() => openEdit(plan)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Plan
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingPlan && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-300 w-full max-w-lg rounded-lg overflow-hidden shadow-xl animate-scale-in">
            <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                <Edit3 className="w-4 h-4 text-blue-600" />
                Edit {editingPlan.name}
              </h3>
              <button
                onClick={closeEdit}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Plan Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-600 transition"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Price (₹)
                </label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min={0}
                    className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded text-sm font-bold focus:outline-none transition ${
                      editPriceError
                        ? "border-red-400 focus:border-red-500"
                        : "border-slate-200 focus:border-blue-600"
                    }`}
                    value={editPrice}
                    onChange={(e) => {
                      setEditPrice(e.target.value);
                      setEditPriceError("");
                    }}
                  />
                </div>
                {editPriceError && (
                  <p className="text-[11px] text-red-500 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {editPriceError}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Features (one per line)
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-600 transition resize-none"
                  value={editFeatures}
                  onChange={(e) => setEditFeatures(e.target.value)}
                />
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                <button
                  onClick={closeEdit}
                  className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded text-[11px] font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  className="px-5 py-1.5 bg-blue-600 text-white rounded text-[11px] font-bold hover:bg-blue-700 transition cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
