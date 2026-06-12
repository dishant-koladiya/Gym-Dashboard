import React, { useState } from "react";
import { z } from "zod";
import { Member, SubscriptionPlan } from "../types";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Camera,
  CreditCard,
  Banknote,
  QrCode,
  User,
  ShieldCheck,
} from "lucide-react";

interface WizardResult {
  member: Omit<Member, "id">;
  planName: string;
  planPrice: number;
  paymentType: "UPI" | "Cash";
}

interface AddMemberWizardProps {
  members: Member[];
  plans: SubscriptionPlan[];
  onComplete: (result: WizardResult) => void;
  onCancel: () => void;
}

const addressSchema = z
  .string()
  .min(1, "Address is required")
  .min(5, "Address must be at least 5 characters")
  .max(200, "Address must be at most 200 characters");

export default function AddMemberWizard({
  members,
  plans,
  onComplete,
  onCancel,
}: AddMemberWizardProps) {
  const [step, setStep] = useState(1);
  const activePlans = plans.filter((p) => p.active);

  // Step 1: Member Details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [address, setAddress] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Step 2: Plan Selection
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(
    activePlans[1] || activePlans[0]
  );

  // Step 3: Payment
  const [paymentType, setPaymentType] = useState<"UPI" | "Cash">("UPI");
  const [isProcessing, setIsProcessing] = useState(false);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateName = (v: string) =>
    !v.trim() ? "Name is required" : "";
  const validateEmail = (v: string) =>
    !v.trim()
      ? "Email is required"
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      ? "Enter a valid email address"
      : "";
  const validatePhone = (v: string) => {
    const digits = v.replace(/\D/g, "");
    if (!digits) return "Phone number is required";
    if (digits.length === 12 && digits.startsWith("91"))
      return digits.slice(2).length !== 10 || !/^[6-9]/.test(digits.slice(2))
        ? "Enter a valid 10-digit mobile number"
        : "";
    if (digits.length === 10)
      return !/^[6-9]/.test(digits)
        ? "Indian mobile must start with 6, 7, 8, or 9"
        : "";
    return "Enter a valid 10-digit mobile number";
  };
  const validateAge = (v: string) => {
    const n = parseInt(v);
    return !v.trim()
      ? "Age is required"
      : isNaN(n) || n < 12 || n > 90
      ? "Age must be between 12 and 90"
      : "";
  };
  const validateAddress = (v: string) => {
    const result = addressSchema.safeParse(v);
    return result.success ? "" : result.error.issues[0].message;
  };



  const validateField = (field: string, value: string) => {
    let err = "";
    if (field === "name") err = validateName(value);
    else if (field === "email") err = validateEmail(value);
    else if (field === "phone") err = validatePhone(value);
    else if (field === "age") err = validateAge(value);
    else if (field === "address") err = validateAddress(value);
    setErrors((prev) => ({ ...prev, [field]: err }));
    return err;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const val =
      field === "name"
        ? name
        : field === "email"
        ? email
        : field === "phone"
        ? phone
        : field === "age"
        ? age
        : field === "address"
        ? address
        : "";
    validateField(field, val);
  };

  const formatPhone = (v: string) => {
    const digits = v.replace(/\D/g, "");
    if (digits.length <= 10) return digits;
    if (digits.startsWith("91") && digits.length <= 12)
      return "+91 " + digits.slice(2);
    return v;
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed (JPEG, PNG, GIF, etc.)");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validateStep1 = () => {
    const allTouched = {
      name: true,
      email: true,
      phone: true,
      age: true,
      address: true,
    };
    setTouched((prev) => ({ ...prev, ...allTouched }));
    const nameErr = validateField("name", name);
    const emailErr = validateField("email", email);
    const phoneErr = validateField("phone", phone);
    const ageErr = validateField("age", age);
    const addressErr = validateField("address", address);
    if (nameErr || emailErr || phoneErr || ageErr || addressErr) return false;

    const duplicateEmail = members.some(
      (m) => m.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (duplicateEmail) {
      setErrors((prev) => ({
        ...prev,
        email: "A member with this email already exists",
      }));
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleConfirm = () => {
    setIsProcessing(true);

    const today = new Date();
    const joinDateStr = today.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    const expiry = new Date();
    if (selectedPlan.name.includes("6 Months")) {
      expiry.setMonth(expiry.getMonth() + 6);
    } else if (
      selectedPlan.name.includes("Year") ||
      selectedPlan.name.includes("Annual")
    ) {
      expiry.setFullYear(expiry.getFullYear() + 1);
    } else {
      expiry.setMonth(expiry.getMonth() + 1);
    }
    const expiryDateStr = expiry.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    setTimeout(() => {
      onComplete({
        member: {
          name: name.trim(),
          email: email.trim(),
          phone: phone.startsWith("+")
            ? phone
            : "+91 " + phone.replace(/\D/g, ""),
          age: parseInt(age),
          address: address.trim(),
          joinDate: joinDateStr,
          expiryDate: expiryDateStr,
          plan: selectedPlan.name,
          price: selectedPlan.price + Math.round(selectedPlan.price * 0.18),
          status: "Active" as const,
          lastActive: joinDateStr,
          homeBranch: "Downtown Central",
          avatarUrl: avatarUrl || undefined,
        },
        planName: selectedPlan.name,
        planPrice: selectedPlan.price + Math.round(selectedPlan.price * 0.18),
        paymentType,
      });
      setIsProcessing(false);
    }, 1500);
  };

  const subtotal = selectedPlan.price;
  const tax = Math.round(subtotal * 0.18);
  const totalAmount = subtotal + tax;

  const steps = [
    { num: 1, label: "Details" },
    { num: 2, label: "Plan" },
    { num: 3, label: "Payment" },
  ];

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Members</span>
        </button>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Add New Member
        </h2>
      </div>

      {/* Step Indicator */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    step > s.num
                      ? "bg-emerald-500 text-white"
                      : step === s.num
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {step > s.num ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    s.num
                  )}
                </div>
                <span
                  className={`text-sm font-semibold hidden sm:inline ${
                    step === s.num
                      ? "text-blue-700"
                      : step > s.num
                      ? "text-emerald-600"
                      : "text-slate-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 mx-4">
                  <div
                    className={`h-0.5 rounded-full transition-all duration-500 ${
                      step > s.num ? "bg-emerald-400" : "bg-slate-200"
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        {/* Step 1: Details */}
        {step === 1 && (
          <div className="p-6 space-y-5">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Personal Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Patel"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded text-sm focus:outline-none transition ${
                    touched.name && errors.name
                      ? "border-red-400 focus:border-red-500"
                      : "border-slate-200 focus:border-blue-600"
                  }`}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (touched.name) validateField("name", e.target.value);
                  }}
                  onBlur={() => handleBlur("name")}
                />
                {touched.name && errors.name && (
                  <p className="text-[11px] text-red-500 font-medium mt-0.5">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="name@gmail.com"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded text-sm focus:outline-none transition ${
                    touched.email && errors.email
                      ? "border-red-400 focus:border-red-500"
                      : "border-slate-200 focus:border-blue-600"
                  }`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (touched.email) validateField("email", e.target.value);
                  }}
                  onBlur={() => handleBlur("email")}
                />
                {touched.email && errors.email && (
                  <p className="text-[11px] text-red-500 font-medium mt-0.5">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  maxLength={18}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded text-sm focus:outline-none transition ${
                    touched.phone && errors.phone
                      ? "border-red-400 focus:border-red-500"
                      : "border-slate-200 focus:border-blue-600"
                  }`}
                  value={phone}
                  onChange={(e) => {
                    setPhone(formatPhone(e.target.value));
                    if (touched.phone)
                      validateField("phone", formatPhone(e.target.value));
                  }}
                  onBlur={() => handleBlur("phone")}
                />
                {touched.phone && errors.phone && (
                  <p className="text-[11px] text-red-500 font-medium mt-0.5">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Age
                </label>
                <input
                  type="number"
                  placeholder="e.g. 25"
                  min={12}
                  max={120}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded text-sm focus:outline-none transition ${
                    touched.age && errors.age
                      ? "border-red-400 focus:border-red-500"
                      : "border-slate-200 focus:border-blue-600"
                  }`}
                  value={age}
                  onChange={(e) => {
                    setAge(e.target.value);
                    if (touched.age) validateField("age", e.target.value);
                  }}
                  onBlur={() => handleBlur("age")}
                />
                {touched.age && errors.age && (
                  <p className="text-[11px] text-red-500 font-medium mt-0.5">
                    {errors.age}
                  </p>
                )}
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Address
                </label>
                <textarea
                  placeholder="e.g. 42, MG Road, Bangalore - 560001"
                  rows={2}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded text-sm focus:outline-none transition resize-none ${
                    touched.address && errors.address
                      ? "border-red-400 focus:border-red-500"
                      : "border-slate-200 focus:border-blue-600"
                  }`}
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (touched.address)
                      validateField("address", e.target.value);
                  }}
                  onBlur={() => handleBlur("address")}
                />
                {touched.address && errors.address && (
                  <p className="text-[11px] text-red-500 font-medium mt-0.5">
                    {errors.address}
                  </p>
                )}
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Profile Photo (optional)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <label className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded text-xs font-bold hover:bg-slate-200 transition cursor-pointer">
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </label>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl("")}
                      className="text-xs text-red-500 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Plan Selection */}
        {step === 2 && (
          <div className="p-6 space-y-5">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ChevronRight className="w-5 h-5 text-blue-600" />
              Select Subscription Plan
            </h3>
            <p className="text-sm text-slate-500 -mt-3">
              Choose a membership plan for the new member
            </p>

            <div className="grid grid-cols-1 gap-4">
              {activePlans.map((pkg) => {
                const isSelected = selectedPlan.name === pkg.name;
                return (
                  <div
                    key={pkg.name}
                    onClick={() => setSelectedPlan(pkg)}
                    className={`border p-5 rounded-lg flex items-center justify-between gap-4 cursor-pointer transition relative ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/40 ring-1 ring-blue-200"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center mt-1.5 flex-shrink-0 ${
                          isSelected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-base">
                            {pkg.name} Duration
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                              pkg.term === "POPULAR"
                                ? "bg-orange-50 text-orange-700"
                                : pkg.term === "BEST VALUE"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {pkg.term}
                          </span>
                        </div>
                        <ul className="text-xs text-slate-500 mt-2 space-y-1">
                          {pkg.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-1.5 leading-none">
                              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-extrabold text-blue-900">
                        ₹{pkg.price.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                        +18% GST
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Payment
            </h3>

            {/* Payment Type Selector */}
            <div className="max-w-md mx-auto">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentType("UPI")}
                  className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 font-bold text-sm transition cursor-pointer ${
                    paymentType === "UPI"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  UPI
                </button>
                <button
                  onClick={() => setPaymentType("Cash")}
                  className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 font-bold text-sm transition cursor-pointer ${
                    paymentType === "Cash"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                  Cash
                </button>
              </div>
            </div>

            {/* QR Code (UPI) */}
            {paymentType === "UPI" && (
              <div className="flex flex-col items-center justify-center py-6 bg-slate-50 rounded-lg border border-slate-100 space-y-3">
                <div className="w-[140px] h-[140px] bg-white border p-2 rounded shadow-xs">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9gx_lh02_1xwiNE_5lrzO3Mfbb7htKq9WuZFtuajFSqIzFRu2F0j4wRWAvAxhP2GDjhoyU5g3_7sQA1JlN8dbwILuL46In3zCGjkPS6BkSIrlxKP5kwoQH2tn3TEOI7ezzB8fR0LNUNeRAvnZm1eyDGq97k60bVRIACQZ23okzZ8ltqXjH9ism0lAUZucJ5Rf1-2jJ-b2TxBrt5B1qEOyuZUJSV-LVOnjOkfLlLfdTJBl3guDBDeVqpPcXXxXyH6VC0UTBP3UQcLB"
                    alt="UPI QR Code"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs font-semibold text-slate-600">BHIM UPI • Paytm • PhonePe • GPay</p>
              </div>
            )}

            {/* Cash Display */}
            {paymentType === "Cash" && (
              <div className="flex flex-col items-center justify-center py-8 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Banknote className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="text-sm font-bold text-slate-700">Cash Payment</p>
                <p className="text-xs text-slate-500">Collect at the front desk.</p>
              </div>
            )}

            {/* Order Summary */}
            <div className="max-w-md mx-auto border-t border-slate-100 pt-5">
              <h4 className="text-sm font-bold text-slate-700 mb-3">
                Order Summary
              </h4>
              <div className="bg-slate-50 rounded-lg p-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Plan</span>
                  <span className="font-semibold">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST @ 18%</span>
                  <span className="font-semibold">₹{tax.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-200 pt-1.5 flex justify-between text-slate-800 font-bold">
                  <span>Total</span>
                  <span className="text-blue-900">
                    ₹{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
              {isProcessing && (
                <div className="flex items-center justify-center gap-2 mt-3 text-blue-600 text-sm font-semibold">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  Processing payment...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-lg flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded text-xs font-bold hover:bg-slate-50 transition flex items-center gap-2 cursor-pointer"
              disabled={isProcessing}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          ) : (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
          )}

          <div className="flex items-center gap-2">
            {step < 3 && (
              <button
                onClick={handleNext}
                className="px-5 py-2 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition flex items-center gap-2 cursor-pointer"
              >
                Next
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {step === 3 && (
              <button
                onClick={handleConfirm}
                disabled={isProcessing}
                className="px-5 py-2 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                {isProcessing ? "Processing..." : "Confirm & Pay"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
