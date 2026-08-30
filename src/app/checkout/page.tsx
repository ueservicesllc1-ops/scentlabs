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
import { formatCurrency } from "@/lib/utils";
import { 
  ShieldCheck, 
  ArrowLeft, 
  Lock, 
  AlertCircle, 
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
          toAddress: {
            name: fullName || "Guest Buyer",
            street1: streetAddress,
            street2: suite,
            city,
            state,
            zip: postalCode,
            country,
            phone,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to calculate courier shipping rates.");
      }

      const data = await res.json();
      if (data.rates && data.rates.length > 0) {
        setRates(data.rates);
        // Default select cheapest
        const sorted = [...data.rates].sort((a, b) => Number(a.amount) - Number(b.amount));
        setSelectedRate(sorted[0]);
      } else {
        setRates([]);
        setSelectedRate(null);
        setRatesError("No shipping services available for this destination address.");
      }
    } catch (err: any) {
      setRatesError(err.message || "Unable to fetch Shippo rates.");
      setRates([]);
      setSelectedRate(null);
    } finally {
      setFetchingRates(false);
    }
  };

  // Auto query rates when zip/city changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (streetAddress && city && state && postalCode) {
        fetchLiveRates();
      }
    }, 1200);

    return () => clearTimeout(delayDebounce);
  }, [streetAddress, city, state, postalCode]);

  const shippingCost = selectedRate ? Number(selectedRate.amount) : 0;
  const grandTotal = summary.totalBeforeShipping + shippingCost;

  const handleCreateStripeSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (!selectedRate) {
      setErrorMessage("Please select a Shippo shipping courier rate option.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      // 1. Validate alignment with Margin Guard first
      const validationRes = await fetch("/api/orders/validate-margins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shippingAddress: {
            name: fullName,
            line1: streetAddress,
            line2: suite,
            city,
            state,
            postalCode,
            country,
            phone,
          },
          shippingMethod: selectedRate.service,
          shippingCost,
        }),
      });

      const validationData = await validationRes.json();
      if (!validationRes.ok) {
        throw new Error(
          validationData.message || "Margin Guard validation failed. Discount levels exceed allowed margin caps."
        );
      }

      // 2. Create Stripe checkout session
      const stripeRes = await fetch("/api/checkout/stripe-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customerId: user?.uid || "guest",
          customerEmail: email,
          shippingAddress: {
            name: fullName,
            line1: streetAddress,
            line2: suite,
            city,
            state,
            postalCode,
            country,
            phone,
          },
          shippingRate: selectedRate,
          grandTotal,
        }),
      });

      if (!stripeRes.ok) {
        const stripeErr = await stripeRes.json();
        throw new Error(stripeErr.message || "Stripe checkout session initialization failed.");
      }

      const stripeSession = await stripeRes.json();
      if (stripeSession.checkoutUrl) {
        router.push(stripeSession.checkoutUrl);
      } else {
        throw new Error("Stripe checkout redirection URL is missing.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Checkout transaction error.");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-24 space-y-6 px-4 font-body-md text-on-surface">
        <h2 className="font-display-hero text-headline-lg text-primary uppercase">No Selection Active</h2>
        <p className="font-caption text-caption text-secondary">
          Add raw materials, compounding vessels, or labels to your bag before checking out.
        </p>
        <Link href="/shop" className="flat-btn px-8 py-3.5 w-full uppercase">
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 md:py-14 font-body-md text-on-surface space-y-6 sm:space-y-8">
      
      {/* Header */}
      <div className="border-b border-outline-variant pb-3 sm:pb-4 flex justify-between items-end">
        <div>
          <span className="font-label-caps text-label-caps text-secondary uppercase tracking-[0.2em] block mb-1">
            Secure Fulfillment
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-primary uppercase font-serif">
            Secure Checkout
          </h1>
        </div>
        <Link
          href="/cart"
          className="font-label-caps text-label-caps text-secondary hover:text-primary transition flex items-center gap-1.5 uppercase"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
        </Link>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-sm bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleCreateStripeSession} className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        
        {/* Left Column: Contact, Address, Shippo Selection (Stitch 7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Contact Information */}
          <div className="p-6 border border-outline-variant bg-surface-bright rounded-sm space-y-4">
            <h2 className="font-label-caps text-label-caps text-primary uppercase flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-primary text-on-primary flex items-center justify-center text-[10px] font-semibold">
                1
              </span>
              Contact & Recipient
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-body-md">
              <div className="sm:col-span-2">
                <label className="text-secondary block mb-1 uppercase text-[10px] font-semibold">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-surface border border-outline-variant rounded-sm px-3.5 py-2.5 text-primary placeholder:text-secondary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-secondary block mb-1 uppercase text-[10px] font-semibold">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full bg-surface border border-outline-variant rounded-sm px-3.5 py-2.5 text-primary placeholder:text-secondary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-secondary block mb-1 uppercase text-[10px] font-semibold">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full bg-surface border border-outline-variant rounded-sm px-3.5 py-2.5 text-primary placeholder:text-secondary focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* 2. Delivery Address */}
          <div className="p-6 border border-outline-variant bg-surface-bright rounded-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-label-caps text-label-caps text-primary uppercase flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-primary text-on-primary flex items-center justify-center text-[10px] font-semibold">
                  2
                </span>
                Shipping Destination
              </h2>

              {savedAddresses.length > 0 && (
                <div className="text-[10px] text-primary">
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
                    className="bg-surface border border-outline-variant text-primary px-2.5 py-1 rounded-sm text-xs focus:outline-none focus:border-primary"
                  >
                    <option value="new">+ Enter New Address</option>
                    {savedAddresses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.firstName} {a.lastName} ({a.city}, {a.state})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Google Places Autocomplete Search */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-secondary uppercase block font-semibold">Google Address Autocomplete</label>
              <GoogleAddressAutocomplete
                initialAddress={{ line1: streetAddress }}
                onAddressSelect={applyAddress}
              />
            </div>

            {/* Address Form Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-body-md pt-1">
              <div className="sm:col-span-2">
                <label className="text-secondary block mb-1 uppercase text-[10px] font-semibold">Street Address</label>
                <input
                  type="text"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="123 Compounding Way"
                  className="w-full bg-surface border border-outline-variant rounded-sm px-3.5 py-2.5 text-primary placeholder:text-secondary focus:outline-none focus:border-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-secondary block mb-1 uppercase text-[10px] font-semibold">Suite / Apt / Unit</label>
                <input
                  type="text"
                  value={suite}
                  onChange={(e) => setSuite(e.target.value)}
                  placeholder="Suite 400"
                  className="w-full bg-surface border border-outline-variant rounded-sm px-3.5 py-2.5 text-primary placeholder:text-secondary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-secondary block mb-1 uppercase text-[10px] font-semibold">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Miami"
                  className="w-full bg-surface border border-outline-variant rounded-sm px-3.5 py-2.5 text-primary placeholder:text-secondary focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-secondary block mb-1 uppercase text-[10px] font-semibold">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="FL"
                    className="w-full bg-surface border border-outline-variant rounded-sm px-3.5 py-2.5 text-primary placeholder:text-secondary focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-secondary block mb-1 uppercase text-[10px] font-semibold">ZIP Code</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="33122"
                    className="w-full bg-surface border border-outline-variant rounded-sm px-3.5 py-2.5 text-primary placeholder:text-secondary focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Shippo Real-Time Shipping Rates */}
          <div className="p-6 border border-outline-variant bg-surface-bright rounded-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-label-caps text-label-caps text-primary uppercase flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-primary text-on-primary flex items-center justify-center text-[10px] font-semibold">
                  3
                </span>
                Shippo Shipping Dispatch
              </h2>

              <button
                type="button"
                onClick={fetchLiveRates}
                disabled={fetchingRates}
                className="font-label-caps text-label-caps text-secondary hover:text-primary transition uppercase flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${fetchingRates ? "animate-spin" : ""}`} /> Recalculate
              </button>
            </div>

            {fetchingRates ? (
              <div className="p-6 text-center text-xs text-secondary flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                Querying carrier rates via Shippo API...
              </div>
            ) : ratesError ? (
              <div className="p-3.5 rounded-sm bg-red-50 border border-red-200 text-xs text-red-800">
                {ratesError}
              </div>
            ) : rates.length === 0 ? (
              <div className="text-xs text-secondary text-center py-4">
                Enter shipping destination address above to calculate live Shippo freight rates.
              </div>
            ) : (
              <div className="space-y-2.5">
                {rates.map((rate) => {
                  const isSelected = selectedRate?.id === rate.id;
                  return (
                    <div
                      key={rate.id}
                      onClick={() => setSelectedRate(rate)}
                      className={`p-4 border cursor-pointer transition flex justify-between items-center rounded-sm text-xs ${
                        isSelected
                          ? "border-primary bg-surface-container text-primary font-medium"
                          : "border-outline-variant bg-surface text-secondary hover:border-primary"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? "border-primary bg-primary text-on-primary" : "border-outline-variant"
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-on-primary" />}
                        </div>

                        <div>
                          <div className="font-semibold uppercase flex items-center gap-2">
                            <span>{rate.service}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-surface-bright border border-outline-variant">
                              {rate.carrier}
                            </span>
                          </div>
                          <div className="text-[10px] text-secondary">
                            {rate.durationTerms || `${rate.estimatedDays || 3} business days`}
                          </div>
                        </div>
                      </div>

                      <div className="font-semibold text-primary text-sm">
                        {formatCurrency(Number(rate.amount))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary & Stripe Payment (Stitch 5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 border border-outline-variant bg-surface-bright rounded-sm space-y-5 lg:sticky lg:top-24">
            
            <h2 className="font-label-caps text-label-caps text-primary uppercase border-b border-outline-variant pb-3 flex justify-between">
              <span>Bag Summary</span>
              <span>{totalUnits} Units</span>
            </h2>

            {/* Line items list */}
            <div className="space-y-3 max-h-56 overflow-y-auto text-xs divide-y divide-outline-variant/60">
              {items.map((item, idx) => (
                <div key={idx} className="pt-2.5 first:pt-0 flex justify-between items-start gap-2">
                  <div>
                    <div className="font-semibold text-primary uppercase text-[11px] leading-tight">
                      {item.productName}
                    </div>
                    <div className="text-[10px] text-secondary">
                      {item.selectedPackage?.name || `${item.selectedPackage?.quantity || 1} u`} &bull; Qty: {item.packageCount} ({item.totalUnits}u total)
                    </div>
                  </div>
                  <span className="font-mono text-primary font-medium">
                    {formatCurrency(item.totalLinePrice ?? item.totalPrice ?? 0)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-outline-variant pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-secondary">
                <span>Subtotal</span>
                <span className="text-primary font-medium">{formatCurrency(summary.subtotal)}</span>
              </div>

              {summary.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Volume Tier Savings</span>
                  <span>-${formatCurrency(summary.discountTotal)}</span>
                </div>
              )}

              <div className="flex justify-between text-secondary">
                <span>Shippo Freight ({selectedRate?.carrier || "Standard"})</span>
                <span className="text-primary font-medium">{formatCurrency(shippingCost)}</span>
              </div>

              <div className="flex justify-between text-secondary">
                <span>Taxes &amp; Customs</span>
                <span className="text-primary">$0.00</span>
              </div>

              <div className="border-t border-outline-variant pt-3 flex justify-between items-baseline">
                <span className="font-label-caps text-label-caps text-primary uppercase">Grand Total</span>
                <span className="font-headline-md text-headline-md text-primary font-semibold">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            {/* Stripe Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="flat-btn w-full py-4 uppercase flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Initializing Payment...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Pay with Stripe
                </>
              )}
            </button>

            {/* Security Guarantee */}
            <div className="p-3.5 border border-outline-variant bg-surface-container-low text-[10px] text-secondary rounded-sm space-y-1">
              <div className="flex items-center gap-1.5 text-primary font-semibold uppercase text-[9px] tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Secure Payment &amp; Logistics
              </div>
              <p className="leading-relaxed font-light">
                Direct integration with Stripe API ensures PCI compliance. Tracked Shippo courier integration provides transit protections.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
