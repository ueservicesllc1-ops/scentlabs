"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { customerRepository } from "@/lib/firestore/customer";
import { CustomerAddress } from "@/types/customer";
import { ShippoRate } from "@/types/shipping";
import { GoogleAddressAutocomplete } from "@/components/common/GoogleAddressAutocomplete";
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
import { 
  ShieldCheck, 
  Truck, 
  ArrowLeft, 
  Lock, 
  ShoppingBag, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  MapPin, 
  Loader2,
  RefreshCw 
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, summary, totalUnits } = useCart();
  const { user, profile } = useAuth();

  // Contact Info
  const [email, setEmail] = useState(user?.email || profile?.email || "");
  const [fullName, setFullName] = useState(profile?.displayName || "");
  const [phone, setPhone] = useState(profile?.phone || "");

  // Address Info
  const [streetAddress, setStreetAddress] = useState("");
  const [suite, setSuite] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("US");

  // Saved Addresses
  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([]);
  const [selectedSavedAddrId, setSelectedSavedAddrId] = useState<string>("new");

  // Shipping Rates
  const [rates, setRates] = useState<ShippoRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippoRate | null>(null);
  const [fetchingRates, setFetchingRates] = useState(false);
  const [ratesError, setRatesError] = useState<string | null>(null);

  // Submission
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Load saved addresses if user is logged in
  useEffect(() => {
    if (user) {
      customerRepository.getAddresses(user.uid).then((addrs) => {
        setSavedAddresses(addrs);
        const def = addrs.find((a) => a.isDefault) || addrs[0];
        if (def) {
          applyAddress(def);
          setSelectedSavedAddrId(def.id);
        }
      });
    }
  }, [user]);

  const applyAddress = (addr: Partial<CustomerAddress>) => {
    if (addr.firstName || addr.lastName) {
      setFullName(`${addr.firstName || ""} ${addr.lastName || ""}`.trim());
    } else if (addr.fullName || addr.name) {
      setFullName(addr.fullName || addr.name || "");
    }
    setStreetAddress(addr.line1 || addr.street1 || addr.streetAddress || "");
    setSuite(addr.line2 || addr.street2 || "");
    setCity(addr.city || "");
    setState(addr.state || "");
    setPostalCode(addr.postalCode || "");
    setCountry(addr.country || "US");
    if (addr.phone) setPhone(addr.phone);
  };

  // Fetch live Shippo rates whenever address changes
  const fetchLiveRates = async () => {
    if (!city.trim() || !postalCode.trim() || items.length === 0) return;

    setFetchingRates(true);
    setRatesError(null);

    try {
      const res = await fetch("/api/shipping/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shippingAddress: {
            line1: streetAddress,
            line2: suite,
            city,
            state,
            postalCode,
            country,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.rates && data.rates.length > 0) {
        setRates(data.rates);
        setSelectedRate(data.rates[0]);
      } else {
        setRatesError("We couldn't find automatic courier rates for this address.");
      }
    } catch (err: any) {
      setRatesError("Failed to fetch shipping rates. Default flat rate available.");
    } finally {
      setFetchingRates(false);
    }
  };

  useEffect(() => {
    if (city && postalCode && streetAddress) {
      fetchLiveRates();
    }
  }, [city, postalCode, streetAddress]);

  const shippingCost = selectedRate ? selectedRate.amount : 8.50;
  const grandTotal = summary.totalBeforeShipping + shippingCost;

  const handleCreateStripeSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !fullName.trim() || !streetAddress.trim() || !city.trim() || !postalCode.trim()) {
      setErrorMessage("Please complete all shipping address and contact fields.");
      return;
    }

    if (items.length === 0) {
      setErrorMessage("Your cart is empty.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customerEmail: email,
          customerId: user?.uid || null,
          shippingAddress: {
            fullName,
            streetAddress: `${streetAddress} ${suite}`.trim(),
            line1: streetAddress,
            line2: suite,
            city,
            state,
            postalCode,
            country,
            phone,
          },
          shippoRateId: selectedRate?.id || "rate_standard",
          carrier: selectedRate?.carrier || "USPS",
          service: selectedRate?.service || "USPS Ground Advantage",
          shippingCost,
          taxRate: 0,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Failed to initialize checkout session.");
      }

      window.location.href = data.url;
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during checkout initialization.");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center border border-lab-800 rounded-2xl bg-lab-950 space-y-4 font-mono">
        <div className="w-14 h-14 rounded-full bg-lab-900 border border-lab-800 flex items-center justify-center mx-auto text-lab-500">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-bold text-white uppercase">Cart is Empty</h1>
        <p className="text-xs text-lab-400">
          Please add items to your formulation cart before proceeding to checkout.
        </p>
        <Link
          href="/shop"
          className="inline-block px-5 py-2.5 rounded-lg text-xs font-bold uppercase bg-amber-500 text-lab-950 hover:brightness-110"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-mono space-y-8">
      {/* Header */}
      <div className="border-b border-lab-800 pb-4 flex justify-between items-end">
        <div>
          <span className="text-xs text-amber-400 font-bold uppercase tracking-widest block mb-1">
            SECURE FORMULATION DISPATCH
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase">
            Checkout & Fulfillment
          </h1>
        </div>
        <Link
          href="/cart"
          className="text-xs text-lab-400 hover:text-white transition flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
        </Link>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleCreateStripeSession} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Contact, Address, Shippo Selection */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Contact Information */}
          <div className="p-6 rounded-2xl border border-lab-800 bg-lab-950 space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-lab-950 flex items-center justify-center text-[10px] font-black">
                1
              </span>
              Contact & Formulation Recipient
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="formulator@scentlab.com"
                  className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3.5 py-2.5 text-white placeholder-lab-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3.5 py-2.5 text-white placeholder-lab-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3.5 py-2.5 text-white placeholder-lab-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* 2. Delivery Address with Google Places Autocomplete */}
          <div className="p-6 rounded-2xl border border-lab-800 bg-lab-950 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-lab-950 flex items-center justify-center text-[10px] font-black">
                  2
                </span>
                Shipping Destination
              </h2>

              {savedAddresses.length > 0 && (
                <div className="text-[10px] text-lab-400">
                  <select
                    value={selectedSavedAddrId}
                    onChange={(e) => {
                      setSelectedSavedAddrId(e.target.value);
                      if (e.target.value === "new") {
                        applyAddress({ line1: "", line2: "", city: "", state: "", postalCode: "" });
                      } else {
                        const found = savedAddresses.find((a) => a.id === e.target.value);
                        if (found) applyAddress(found);
                      }
                    }}
                    className="bg-lab-900 border border-lab-800 text-amber-400 px-2.5 py-1 rounded-lg text-xs"
                  >
                    <option value="new">+ Enter New Address</option>
                    {savedAddresses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.firstName} {a.lastName} ({a.city}, {a.state}) {a.isDefault ? "★" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Google Places Autocomplete Search */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-lab-400 uppercase block">Google Address Autocomplete</label>
              <GoogleAddressAutocomplete
                initialAddress={{ line1: streetAddress }}
                onAddressSelect={applyAddress}
              />
            </div>

            {/* Address Form Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="sm:col-span-2">
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Street Address</label>
                <input
                  type="text"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="123 Formulator Way"
                  className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3.5 py-2.5 text-white placeholder-lab-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Suite / Apt / Unit</label>
                <input
                  type="text"
                  value={suite}
                  onChange={(e) => setSuite(e.target.value)}
                  placeholder="Suite 400"
                  className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3.5 py-2.5 text-white placeholder-lab-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Miami"
                  className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3.5 py-2.5 text-white placeholder-lab-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-lab-400 block mb-1 uppercase text-[10px]">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="FL"
                    className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3.5 py-2.5 text-white placeholder-lab-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-lab-400 block mb-1 uppercase text-[10px]">ZIP Code</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="33122"
                    className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3.5 py-2.5 text-white placeholder-lab-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Shippo Real-Time Shipping Rates */}
          <div className="p-6 rounded-2xl border border-lab-800 bg-lab-950 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-lab-950 flex items-center justify-center text-[10px] font-black">
                  3
                </span>
                Shippo Courier Dispatch
              </h2>

              <button
                type="button"
                onClick={fetchLiveRates}
                disabled={fetchingRates}
                className="text-[10px] text-amber-400 hover:text-amber-300 font-bold uppercase flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${fetchingRates ? "animate-spin" : ""}`} /> Recalculate Rates
              </button>
            </div>

            {fetchingRates ? (
              <div className="p-6 text-center text-xs text-lab-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                Querying live USPS & UPS carrier rates via Shippo...
              </div>
            ) : ratesError ? (
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-300">
                {ratesError}
              </div>
            ) : rates.length === 0 ? (
              <div className="text-xs text-lab-500 text-center py-4">
                Enter your street address and ZIP code above to calculate live Shippo courier rates.
              </div>
            ) : (
              <div className="space-y-2.5">
                {rates.map((rate) => {
                  const isSelected = selectedRate?.id === rate.id;
                  return (
                    <div
                      key={rate.id}
                      onClick={() => setSelectedRate(rate)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition flex justify-between items-center text-xs ${
                        isSelected
                          ? "border-amber-500 bg-amber-500/10 text-white shadow-md shadow-amber-500/5"
                          : "border-lab-800 bg-lab-900/60 text-lab-300 hover:border-lab-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? "border-amber-400 bg-amber-400 text-lab-950" : "border-lab-700"
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-lab-950" />}
                        </div>

                        <div>
                          <div className="font-bold uppercase flex items-center gap-2">
                            <span>{rate.service}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-lab-850 text-lab-400 border border-lab-750">
                              {rate.carrier}
                            </span>
                          </div>
                          <div className="text-[10px] text-lab-400">
                            {rate.durationTerms || `${rate.estimatedDays || 3} business days`}
                          </div>
                        </div>
                      </div>

                      <div className="font-mono font-bold text-amber-400 text-sm">
                        {formatCurrency(rate.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary & Stripe Payment */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl border border-lab-800 bg-lab-950 space-y-5 sticky top-6 shadow-2xl">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-lab-900 pb-3 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-amber-400 font-mono">{totalUnits} units</span>
            </h2>

            {/* Line items mini scroll */}
            <div className="space-y-3 max-h-56 overflow-y-auto text-xs divide-y divide-lab-900/60">
              {items.map((item, idx) => (
                <div key={idx} className="pt-2.5 first:pt-0 flex justify-between items-start gap-2">
                  <div>
                    <div className="font-bold text-white uppercase text-[11px] leading-tight">
                      {item.productName}
                    </div>
                    <div className="text-[10px] text-lab-400">
                      {item.selectedPackage?.name || item.selectedPackage?.label || `${item.selectedPackage?.quantity || 1} Unit Pack`} • {item.packageCount} pack(s) ({item.totalUnits}u total)
                    </div>
                  </div>
                  <div className="font-mono text-lab-300 font-bold text-[11px]">
                    {formatCurrency(item.totalLinePrice ?? item.totalPrice ?? (item.packagePrice * item.packageCount))}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-lab-900 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-lab-400">
                <span>Items Subtotal</span>
                <span className="font-mono text-white">{formatCurrency(summary.subtotal)}</span>
              </div>

              {(summary.discountTotal > 0 || (summary.discount || 0) > 0) && (
                <div className="flex justify-between text-emerald-400">
                  <span>Volume Tier Savings</span>
                  <span className="font-mono">-{formatCurrency(summary.discountTotal || summary.discount || 0)}</span>
                </div>
              )}

              <div className="flex justify-between text-lab-400">
                <span>Shippo Dispatch ({selectedRate?.carrier || "Standard"})</span>
                <span className="font-mono text-white">{formatCurrency(shippingCost)}</span>
              </div>

              <div className="flex justify-between text-lab-400">
                <span>Estimated Tax</span>
                <span className="font-mono text-lab-500">$0.00</span>
              </div>

              <div className="border-t border-lab-900 pt-3 flex justify-between items-baseline">
                <span className="font-black text-white uppercase text-sm">Grand Total</span>
                <span className="font-black text-amber-400 text-xl font-mono">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            {/* Stripe Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-black text-sm uppercase tracking-wider hover:brightness-110 transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Initializing Stripe Payment...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Pay with Stripe
                </>
              )}
            </button>

            {/* Security Guarantee */}
            <div className="p-3 rounded-xl bg-lab-900/60 border border-lab-800 text-[10px] text-lab-400 space-y-1">
              <div className="flex items-center gap-1.5 text-white font-bold uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 256-Bit Encrypted Checkout
              </div>
              <p className="leading-relaxed">
                Payments are securely processed via Stripe. Shippo provides tracked multi-carrier dispatch with carrier liability protection.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
