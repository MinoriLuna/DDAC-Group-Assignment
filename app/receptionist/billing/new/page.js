'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  DocumentCheckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const API = 'http://localhost:5230/api/receptionist';

export default function GenerateInvoicePage() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lineItems, setLineItems] = useState([
    { id: 1, description: '', quantity: 1, unitPrice: '' }
  ]);

  useEffect(() => {
    fetch(`${API}/patients`)
      .then(r => r.json())
      .then(data => setPatients(data))
      .catch(console.error)
      .finally(() => setLoadingPatients(false));
  }, []);

  const addLineItem = () => {
    setLineItems(prev => [...prev, { id: Date.now(), description: '', quantity: 1, unitPrice: '' }]);
  };

  const removeLineItem = (id) => {
    if (lineItems.length > 1) setLineItems(prev => prev.filter(item => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setLineItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const getLineAmount = (item) => (parseFloat(item.unitPrice) || 0) * (parseInt(item.quantity) || 0);

  const subtotal = lineItems.reduce((acc, item) => acc + getLineAmount(item), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) return alert('Please select a patient.');
    setIsSubmitting(true);

    const items = lineItems.map(item => {
      const qty       = parseInt(item.quantity) || 1;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      return {
        description: item.description,
        quantity:    qty,
        unitPrice:   unitPrice,
        amount:      qty * unitPrice
      };
    });

    try {
      const res = await fetch(`${API}/invoices`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ patientId: selectedPatientId, items })
      });

      if (res.ok) {
        router.push('/receptionist/billing');
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Failed to create invoice: ${err.message || 'Unknown error'}`);
      }
    } catch {
      alert('Network error. Could not reach the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">

        <Link href="/receptionist/billing" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-red-600 transition-colors">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Billing Dashboard
        </Link>

        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Generate Invoice</h2>
          <p className="mt-1 text-sm text-gray-500">
            Create a new bill for a patient's consultation, medication, or administrative services.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Section 1: Patient Selection */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-red-100 text-red-600 h-8 w-8 rounded-full flex items-center justify-center text-sm mr-3">1</span>
              Patient Details
            </h3>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Select Patient *</label>
              <select
                required
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                disabled={loadingPatients}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-900 outline-none focus:ring-2 focus:ring-red-500 transition-all cursor-pointer disabled:opacity-50"
              >
                <option value="" disabled>
                  {loadingPatients ? 'Loading patients...' : '-- Select a registered patient --'}
                </option>
                {patients.map(p => (
                  <option key={p.realId} value={p.realId}>
                    {p.name} ({p.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Line Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <span className="bg-red-100 text-red-600 h-8 w-8 rounded-full flex items-center justify-center text-sm mr-3">2</span>
                Billable Items
              </h3>
              <div className="hidden sm:flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                <InformationCircleIcon className="h-4 w-4 mr-1.5" />
                Guide: Consultation ($50) · Specialist ($100) · Admin Fee ($10)
              </div>
            </div>

            <div className="sm:hidden mb-4 flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
              <InformationCircleIcon className="h-4 w-4 mr-1.5 shrink-0" />
              Guide: Consultation ($50) · Specialist ($100) · Admin Fee ($10)
            </div>

            {/* Table header */}
            <div className="hidden sm:grid grid-cols-12 gap-3 text-xs font-bold text-gray-500 uppercase tracking-wider px-1 mb-2">
              <div className="col-span-5">Description</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-3 text-right">Unit Price ($)</div>
              <div className="col-span-1 text-right">Amount</div>
              <div className="col-span-1"></div>
            </div>

            <div className="space-y-3">
              {lineItems.map((item) => {
                const lineAmt = getLineAmount(item);
                return (
                  <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-gray-50 sm:bg-transparent p-4 sm:p-0 rounded-xl border sm:border-none border-gray-200">
                    <div className="sm:col-span-5">
                      <label className="sm:hidden text-xs font-bold text-gray-500 mb-1 block">Description</label>
                      <input
                        type="text" required
                        placeholder="e.g. General Consultation"
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="sm:hidden text-xs font-bold text-gray-500 mb-1 block">Quantity</label>
                      <input
                        type="number" min="1" required
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium text-center"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="sm:hidden text-xs font-bold text-gray-500 mb-1 block">Unit Price ($)</label>
                      <input
                        type="number" step="0.01" min="0" required
                        placeholder="0.00"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium text-right font-mono"
                      />
                    </div>
                    <div className="sm:col-span-1 text-right text-sm font-black text-gray-800 font-mono">
                      <span className="sm:hidden text-xs font-bold text-gray-500 mr-1">Amount:</span>
                      ${lineAmt.toFixed(2)}
                    </div>
                    <div className="sm:col-span-1 flex justify-end sm:justify-center">
                      <button
                        type="button"
                        onClick={() => removeLineItem(item.id)}
                        disabled={lineItems.length === 1}
                        className={`p-2 rounded-lg transition-colors ${lineItems.length === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button" onClick={addLineItem}
              className="mt-4 flex items-center text-sm font-bold text-red-600 hover:text-red-800 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add another item
            </button>

            <div className="mt-8 pt-6 border-t border-gray-100 space-y-2">
              <div className="flex justify-end">
                <div className="w-full sm:w-72 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span className="font-medium">{lineItems.length} item{lineItems.length !== 1 ? 's' : ''}</span>
                    <span className="font-medium">Subtotal: ${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-black text-gray-900 pt-2 border-t border-gray-200">
                    <span>Grand Total</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex justify-end pt-4 pb-10 gap-3">
            <Link href="/receptionist/billing">
              <button type="button" className="px-6 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-white hover:shadow-sm transition-all">
                Cancel
              </button>
            </Link>
            <button
              type="submit" disabled={isSubmitting}
              className="flex items-center px-8 py-3 bg-red-600 text-white font-bold rounded-xl shadow-md hover:bg-red-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DocumentCheckIcon className="h-5 w-5 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save & Issue Invoice'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
