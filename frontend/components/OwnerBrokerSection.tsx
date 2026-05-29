"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, Plus, Search } from "lucide-react";
import { useOwnerSearch, useBrokerSearch, Owner, Broker, createOwner, createBroker } from "@/hooks/useOwnerBrokerSearch";
import { toast } from "sonner";

interface OwnerBrokerSectionProps {
  accessType: string;
  selectedOwner: Owner | null;
  selectedBroker: Broker | null;
  onOwnerSelect: (owner: Owner) => void;
  onBrokerSelect: (broker: Broker) => void;
  onOwnerCreated?: (owner: Owner) => void;
  onBrokerCreated?: (broker: Broker) => void;
}

export default function OwnerBrokerSection({
  accessType,
  selectedOwner,
  selectedBroker,
  onOwnerSelect,
  onBrokerSelect,
  onOwnerCreated,
  onBrokerCreated,
}: OwnerBrokerSectionProps) {
  // Owner search
  const { owners, isLoadingOwners, searchOwners } = useOwnerSearch();
  const [ownerSearch, setOwnerSearch] = useState("");
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
  const [showCreateOwner, setShowCreateOwner] = useState(false);

  // Broker search
  const { brokers, isLoadingBrokers, searchBrokers } = useBrokerSearch();
  const [brokerSearch, setBrokerSearch] = useState("");
  const [showBrokerDropdown, setShowBrokerDropdown] = useState(false);
  const [showCreateBroker, setShowCreateBroker] = useState(false);

  // Create owner form
  const [newOwnerForm, setNewOwnerForm] = useState({
    name: "",
    phone: "",
    email: "",
    whatsapp: "",
    address: "",
  });

  // Create broker form
  const [newBrokerForm, setNewBrokerForm] = useState({
    name: "",
    phone: "",
    email: "",
    whatsapp: "",
    areaOfOperation: "",
  });

  const [isSubmittingOwner, setIsSubmittingOwner] = useState(false);
  const [isSubmittingBroker, setIsSubmittingBroker] = useState(false);

  // Handle owner search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (ownerSearch) searchOwners(ownerSearch);
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [ownerSearch, searchOwners]);

  // Handle broker search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (brokerSearch) searchBrokers(brokerSearch);
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [brokerSearch, searchBrokers]);

  const handleCreateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOwnerForm.name || !newOwnerForm.phone || !newOwnerForm.email) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsSubmittingOwner(true);
      const createdOwner = await createOwner(newOwnerForm);
      toast.success("Owner created successfully!");
      onOwnerSelect(createdOwner);
      onOwnerCreated?.(createdOwner);
      setShowCreateOwner(false);
      setNewOwnerForm({ name: "", phone: "", email: "", whatsapp: "", address: "" });
    } catch (error) {
      toast.error("Failed to create owner");
      console.error(error);
    } finally {
      setIsSubmittingOwner(false);
    }
  };

  const handleCreateBroker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrokerForm.name || !newBrokerForm.phone || !newBrokerForm.email) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsSubmittingBroker(true);
      const createdBroker = await createBroker(newBrokerForm);
      toast.success("Broker created successfully!");
      onBrokerSelect(createdBroker);
      onBrokerCreated?.(createdBroker);
      setShowCreateBroker(false);
      setNewBrokerForm({ name: "", phone: "", email: "", whatsapp: "", areaOfOperation: "" });
    } catch (error) {
      toast.error("Failed to create broker");
      console.error(error);
    } finally {
      setIsSubmittingBroker(false);
    }
  };

  return (
    <div className="bg-neutral-900/60 backdrop-blur border border-neutral-800 rounded-xl p-4 sm:p-6 space-y-6">
      {/* Direct Owner Section */}
      {accessType === "Direct Owner" && (
        <div className="space-y-4">
          <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-3">
            Select Owner
          </label>

          {selectedOwner ? (
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{selectedOwner.name}</p>
                <p className="text-sm text-neutral-400">{selectedOwner.phone} • {selectedOwner.email}</p>
              </div>
              <button
                type="button"
                onClick={() => onOwnerSelect(null as any)}
                className="text-sm text-yellow-400 hover:text-yellow-300"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Search Box */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search owner by name, phone, or email..."
                  value={ownerSearch}
                  onChange={(e) => {
                    setOwnerSearch(e.target.value);
                    setShowOwnerDropdown(true);
                  }}
                  onFocus={() => setShowOwnerDropdown(true)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400 transition-all"
                />
              </div>

              {/* Owner Dropdown */}
              {showOwnerDropdown && (
                <div className="border border-neutral-700 rounded-lg bg-neutral-800 max-h-60 overflow-y-auto z-50">
                  {isLoadingOwners ? (
                    <div className="p-3 text-center text-neutral-400 text-sm">
                      Loading owners...
                    </div>
                  ) : owners.length > 0 ? (
                    <div className="p-2 space-y-1">
                      {owners.map((owner) => (
                        <button
                          key={owner.id}
                          type="button"
                          onClick={() => {
                            onOwnerSelect(owner);
                            setShowOwnerDropdown(false);
                            setOwnerSearch("");
                          }}
                          className="w-full text-left p-3 hover:bg-neutral-700 rounded-lg transition-colors text-sm"
                        >
                          <p className="text-white font-medium">{owner.name}</p>
                          <p className="text-xs text-neutral-400">{owner.phone} • {owner.email}</p>
                        </button>
                      ))}
                    </div>
                  ) : ownerSearch ? (
                    <div className="p-3 text-center">
                      <p className="text-neutral-400 text-sm mb-2">No owners found</p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowOwnerDropdown(false);
                          setShowCreateOwner(true);
                        }}
                        className="text-yellow-400 text-sm hover:text-yellow-300 flex items-center justify-center gap-1 mx-auto"
                      >
                        <Plus className="w-3 h-3" /> Create new owner
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 text-center text-neutral-400 text-sm">
                      Start typing to search owners
                    </div>
                  )}
                </div>
              )}

              {/* Create Owner Form */}
              {showCreateOwner && (
                <form onSubmit={handleCreateOwner} className="border border-yellow-500/20 bg-yellow-500/5 rounded-lg p-4 space-y-3">
                  <p className="text-sm text-yellow-400 font-medium mb-3">Create New Owner</p>
                  <input
                    type="text"
                    placeholder="Owner Name *"
                    value={newOwnerForm.name}
                    onChange={(e) => setNewOwnerForm({ ...newOwnerForm, name: e.target.value })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
                  />
                  <input
                    type="tel"
                    placeholder="Phone *"
                    value={newOwnerForm.phone}
                    onChange={(e) => setNewOwnerForm({ ...newOwnerForm, phone: e.target.value })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
                  />
                  <input
                    type="email"
                    placeholder="Email *"
                    value={newOwnerForm.email}
                    onChange={(e) => setNewOwnerForm({ ...newOwnerForm, email: e.target.value })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
                  />
                  <input
                    type="tel"
                    placeholder="WhatsApp"
                    value={newOwnerForm.whatsapp}
                    onChange={(e) => setNewOwnerForm({ ...newOwnerForm, whatsapp: e.target.value })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
                  />
                  <textarea
                    placeholder="Address"
                    value={newOwnerForm.address}
                    onChange={(e) => setNewOwnerForm({ ...newOwnerForm, address: e.target.value })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40 resize-none"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isSubmittingOwner}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-500/50 text-black font-medium py-2 rounded-lg transition-colors text-sm"
                    >
                      {isSubmittingOwner ? "Creating..." : "Create Owner"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateOwner(false)}
                      className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white font-medium py-2 rounded-lg transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* Broker Section */}
      {accessType === "+1 Broker" && (
        <div className="space-y-4">
          <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-3">
            Select Broker
          </label>

          {selectedBroker ? (
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{selectedBroker.name}</p>
                <p className="text-sm text-neutral-400">{selectedBroker.phone} • {selectedBroker.email}</p>
              </div>
              <button
                type="button"
                onClick={() => onBrokerSelect(null as any)}
                className="text-sm text-yellow-400 hover:text-yellow-300"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Search Box */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search broker by name, phone, or email..."
                  value={brokerSearch}
                  onChange={(e) => {
                    setBrokerSearch(e.target.value);
                    setShowBrokerDropdown(true);
                  }}
                  onFocus={() => setShowBrokerDropdown(true)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400 transition-all"
                />
              </div>

              {/* Broker Dropdown */}
              {showBrokerDropdown && (
                <div className="border border-neutral-700 rounded-lg bg-neutral-800 max-h-60 overflow-y-auto z-50">
                  {isLoadingBrokers ? (
                    <div className="p-3 text-center text-neutral-400 text-sm">
                      Loading brokers...
                    </div>
                  ) : brokers.length > 0 ? (
                    <div className="p-2 space-y-1">
                      {brokers.map((broker) => (
                        <button
                          key={broker.id}
                          type="button"
                          onClick={() => {
                            onBrokerSelect(broker);
                            setShowBrokerDropdown(false);
                            setBrokerSearch("");
                          }}
                          className="w-full text-left p-3 hover:bg-neutral-700 rounded-lg transition-colors text-sm"
                        >
                          <p className="text-white font-medium">{broker.name}</p>
                          <p className="text-xs text-neutral-400">{broker.phone} • {broker.email}</p>
                        </button>
                      ))}
                    </div>
                  ) : brokerSearch ? (
                    <div className="p-3 text-center">
                      <p className="text-neutral-400 text-sm mb-2">No brokers found</p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowBrokerDropdown(false);
                          setShowCreateBroker(true);
                        }}
                        className="text-yellow-400 text-sm hover:text-yellow-300 flex items-center justify-center gap-1 mx-auto"
                      >
                        <Plus className="w-3 h-3" /> Create new broker
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 text-center text-neutral-400 text-sm">
                      Start typing to search brokers
                    </div>
                  )}
                </div>
              )}

              {/* Create Broker Form */}
              {showCreateBroker && (
                <form onSubmit={handleCreateBroker} className="border border-yellow-500/20 bg-yellow-500/5 rounded-lg p-4 space-y-3">
                  <p className="text-sm text-yellow-400 font-medium mb-3">Create New Broker</p>
                  <input
                    type="text"
                    placeholder="Broker Name *"
                    value={newBrokerForm.name}
                    onChange={(e) => setNewBrokerForm({ ...newBrokerForm, name: e.target.value })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
                  />
                  <input
                    type="tel"
                    placeholder="Phone *"
                    value={newBrokerForm.phone}
                    onChange={(e) => setNewBrokerForm({ ...newBrokerForm, phone: e.target.value })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
                  />
                  <input
                    type="email"
                    placeholder="Email *"
                    value={newBrokerForm.email}
                    onChange={(e) => setNewBrokerForm({ ...newBrokerForm, email: e.target.value })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
                  />
                  <input
                    type="tel"
                    placeholder="WhatsApp"
                    value={newBrokerForm.whatsapp}
                    onChange={(e) => setNewBrokerForm({ ...newBrokerForm, whatsapp: e.target.value })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
                  />
                  <textarea
                    placeholder="Areas of Operation (comma-separated)"
                    value={newBrokerForm.areaOfOperation}
                    onChange={(e) => setNewBrokerForm({ ...newBrokerForm, areaOfOperation: e.target.value })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40 resize-none"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isSubmittingBroker}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-500/50 text-black font-medium py-2 rounded-lg transition-colors text-sm"
                    >
                      {isSubmittingBroker ? "Creating..." : "Create Broker"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateBroker(false)}
                      className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white font-medium py-2 rounded-lg transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
