'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusCircleIcon,
  DocumentTextIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CreditCardIcon,
  PrinterIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  PlusIcon,
  TrashIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';

const API = `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/receptionist/invoices`;

const getStatusBadge = (status) => {
  switch (status) {
    case 'Paid':    return 'bg-green-100 text-green-700 border-green-200';
    case 'Pending': return 'bg-orange-100 text-orange-700 border-orange-200';
    default:        return 'bg-gray-100 text-gray-800';
  }
};

const displayStatus = (status) => status === 'Pending' ? 'Unpaid' : status;

const shortId  = (uuid) => `INV-${uuid?.slice(0, 8).toUpperCase()}`;
const fmtDate  = (iso) => iso ? new Date(iso).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fmtMoney = (n)   => `RM ${Number(n).toFixed(2)}`;

function printReceipt(inv) {
  const items = (inv.items || []).map(i => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6">${i.description}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:center">${i.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:right">RM ${Number(i.unitPrice).toFixed(2)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:right">RM ${Number(i.amount).toFixed(2)}</td>
    </tr>`).join('');

  const apptSection = inv.appointment ? `
    <div style="margin-bottom:16px;padding:10px 14px;background:#f9fafb;border-radius:8px;font-size:13px;color:#374151">
      <strong>Appointment:</strong> ${inv.appointment.date} at ${inv.appointment.time}<br/>
      <strong>Doctor:</strong> ${inv.appointment.doctorName}
      ${inv.appointment.reason ? `<br/><strong>Reason:</strong> ${inv.appointment.reason}` : ''}
    </div>` : '';

  const win = window.open('', '_blank', 'width=680,height=860');
  win.document.write(`<!DOCTYPE html><html><head>
    <title>Receipt ${shortId(inv.invoiceId)}</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family: 'Segoe UI', Arial, sans-serif; padding: 48px; color: #111827; }
      h1  { font-size: 22px; font-weight: 800; color: #dc2626; }
      table { width: 100%; border-collapse: collapse; font-size: 14px; }
      th  { padding: 10px 12px; background: #f9fafb; text-align: left; font-size: 12px;
            text-transform: uppercase; letter-spacing: .05em; color: #6b7280; border-bottom: 2px solid #e5e7eb; }
      th:not(:first-child) { text-align: right; }
      th:nth-child(3) { text-align: center; }
      .total-row td { padding: 12px; font-weight: 800; font-size: 16px; border-top: 2px solid #e5e7eb; }
      @media print { button { display: none !important; } }
    </style>
  </head><body>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px">
      <div>
        <h1>Medical Receipt</h1>
        <p style="color:#6b7280;font-size:13px;margin-top:4px">Clinic Management System</p>
      </div>
      <div style="text-align:right;font-size:13px;color:#374151">
        <div style="font-weight:700;font-size:15px">${shortId(inv.invoiceId)}</div>
        <div style="color:#6b7280">Issued: ${fmtDate(inv.createdAt)}</div>
        ${inv.paidAt ? `<div style="color:#16a34a;font-weight:600">Paid: ${fmtDate(inv.paidAt)}</div>` : ''}
        ${inv.paymentMethod ? `<div style="color:#6b7280">${inv.paymentMethod}</div>` : ''}
      </div>
    </div>

    <div style="margin-bottom:20px;font-size:14px">
      <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">Bill To</div>
      <div style="font-weight:700;font-size:16px">${inv.patientName}</div>
    </div>

    ${apptSection}

    <table>
      <thead><tr>
        <th>Description</th><th style="text-align:center">Qty</th>
        <th style="text-align:right">Unit Price</th><th style="text-align:right">Amount</th>
      </tr></thead>
      <tbody>${items}</tbody>
      <tfoot><tr class="total-row">
        <td colspan="3">Grand Total</td>
        <td style="text-align:right">${fmtMoney(inv.totalAmount)}</td>
      </tr></tfoot>
    </table>

    <div style="margin-top:40px;text-align:center;font-size:12px;color:#9ca3af">
      Thank you for choosing our clinic. Please retain this receipt for your records.
    </div>
    <script>window.onload = function() { window.print(); }</script>
  </body></html>`);
  win.document.close();
}

export default function BillingDashboard() {
  const [invoices, setInvoices]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [searchTerm, setSearchTerm]       = useState('');
  const [statusFilter, setStatusFilter]   = useState('All Statuses');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen]       = useState(false);
  const [selectedInvoice, setSelectedInvoice]       = useState(null);
  const [paymentMethod, setPaymentMethod]           = useState('Credit Card');
  const [paymentAmount, setPaymentAmount]           = useState('');
  const [paying, setPaying]               = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editInvoiceId, setEditInvoiceId]     = useState(null);
  const [editPatientName, setEditPatientName] = useState('');
  const [editItems, setEditItems]             = useState([]);
  const [editSaving, setEditSaving]           = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const r    = await fetch(API);
      const data = await r.json();
      setInvoices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, []);

  const filteredInvoices = useMemo(() => invoices.filter(inv => {
    const q = searchTerm.toLowerCase();
    const matchSearch = inv.patientName.toLowerCase().includes(q) || inv.invoiceId.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All Statuses' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  }), [invoices, searchTerm, statusFilter]);

  const totalOutstanding = invoices.filter(i => i.status !== 'Paid').reduce((a, i) => a + i.totalAmount, 0);
  const totalCollected = invoices.filter(i => i.status === 'Paid').reduce((a, i) => a + i.totalAmount, 0);
  const unpaidCount    = invoices.filter(i => i.status === 'Pending').length;

  const openPaymentModal = (inv) => {
    setSelectedInvoice(inv);
    setPaymentMethod('Credit Card');
    setPaymentAmount(inv.totalAmount > 0 ? inv.totalAmount.toFixed(2) : '');
    setIsPaymentModalOpen(true);
  };
  const openViewModal    = (inv) => { setSelectedInvoice(inv); setIsViewModalOpen(true); };

  const openEditModal = (inv) => {
    setEditInvoiceId(inv.invoiceId);
    setEditPatientName(inv.patientName);
    setEditItems(
      inv.items && inv.items.length > 0
        ? inv.items.map((item, i) => ({ id: i + 1, description: item.description, quantity: item.quantity, unitPrice: item.unitPrice.toString() }))
        : [{ id: 1, description: '', quantity: 1, unitPrice: '' }]
    );
    setIsEditModalOpen(true);
  };

  const handleEditItemChange = (id, field, value) => {
    setEditItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const addEditItem = () => {
    setEditItems(prev => [...prev, { id: Date.now(), description: '', quantity: 1, unitPrice: '' }]);
  };

  const removeEditItem = (id) => {
    if (editItems.length > 1) setEditItems(prev => prev.filter(item => item.id !== id));
  };

  const getEditLineAmount = (item) => (parseFloat(item.unitPrice) || 0) * (parseInt(item.quantity) || 0);

  const handleSaveItems = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    try {
      const items = editItems.map(item => ({
        description: item.description,
        quantity:    parseInt(item.quantity) || 1,
        unitPrice:   parseFloat(item.unitPrice) || 0
      }));
      const res = await fetch(`${API}/${editInvoiceId}/items`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ items })
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        await fetchInvoices();
      } else {
        alert('Failed to update invoice. Please try again.');
      }
    } catch {
      alert('Error connecting to server.');
    } finally {
      setEditSaving(false);
    }
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }
    setPaying(true);
    try {
      const res = await fetch(`${API}/${selectedInvoice.invoiceId}/pay`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ paymentMethod, amount: parseFloat(paymentAmount) })
      });
      if (res.ok) {
        setIsPaymentModalOpen(false);
        await fetchInvoices();
      } else {
        alert('Failed to process payment.');
      }
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl w-full mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Billing & Payments</h2>
            <p className="mt-1 text-sm text-gray-500">Manage patient invoices and track payment collection.</p>
          </div>
          <Link href="/receptionist/billing/new">
            <button className="flex items-center px-6 py-3 bg-red-600 text-white font-bold rounded-xl shadow-md hover:bg-red-700 hover:-translate-y-0.5 transition-all">
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Generate Invoice
            </button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center shrink-0">
              <BanknotesIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500">Collected</p>
              <p className="text-2xl font-black text-gray-900">{fmtMoney(totalCollected)}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
              <DocumentTextIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500">Outstanding</p>
              <p className="text-2xl font-black text-gray-900">{fmtMoney(totalOutstanding)}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500">Unpaid Bills</p>
              <p className="text-2xl font-black text-gray-900">{unpaidCount}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Invoice ID or Patient Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 font-medium text-sm text-gray-800 outline-none focus:ring-2 focus:ring-red-500 transition-colors"
            />
          </div>
          <div className="relative w-full md:w-64">
            <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-3 font-medium text-sm text-gray-800 outline-none focus:ring-2 focus:ring-red-500 appearance-none cursor-pointer"
            >
              <option>All Statuses</option>
              <option value="Pending">Unpaid</option>
              <option>Paid</option>
            </select>
          </div>
        </div>

        {/* Invoice Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500 mx-auto mb-3"></div>
              <p className="text-gray-500 font-medium">Loading invoices...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Invoice ID</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Appointment</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredInvoices.map(inv => (
                    <tr key={inv.invoiceId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900 font-mono">{shortId(inv.invoiceId)}</td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{fmtDate(inv.createdAt)}</td>
                      <td className="px-6 py-4 font-bold text-gray-700">{inv.patientName}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {inv.appointment ? (
                          <div className="flex items-center gap-1">
                            <CalendarDaysIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            <span>{inv.appointment.date}</span>
                            <span className="text-gray-400">·</span>
                            <span>{inv.appointment.doctorName}</span>
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-black text-gray-900 whitespace-nowrap">{fmtMoney(inv.totalAmount)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded text-xs font-bold border ${getStatusBadge(inv.status)}`}>
                          {displayStatus(inv.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                        {inv.status === 'Pending' && (
                          <>
                            <button onClick={() => openEditModal(inv)} className="inline-flex items-center text-blue-600 font-bold hover:text-blue-800 transition-colors text-sm">
                              <PencilSquareIcon className="h-4 w-4 mr-1" />
                              Edit
                            </button>
                            <button onClick={() => openPaymentModal(inv)} className="text-red-600 font-bold hover:text-red-800 transition-colors text-sm">
                              Collect Payment
                            </button>
                          </>
                        )}
                        <button onClick={() => openViewModal(inv)} className="text-gray-400 hover:text-gray-900 transition-colors font-semibold text-sm">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredInvoices.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500 font-medium">
                        No invoices found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* ── Edit Invoice Modal ──────────────────────────────── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 shrink-0">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <PencilSquareIcon className="h-6 w-6 mr-2 text-blue-600" />
                Edit Invoice Items
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-colors">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItems} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1 space-y-5">
                <div className="bg-blue-50 px-4 py-3 rounded-xl border border-blue-100 text-sm text-blue-800 font-medium">
                  Patient: <span className="font-black">{editPatientName}</span>
                  <span className="text-blue-500 ml-2 font-normal">— Invoice stays Unpaid after saving. Collect payment separately.</span>
                </div>

                {/* Column headers */}
                <div className="hidden sm:grid grid-cols-12 gap-3 text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                  <div className="col-span-5">Description</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-3 text-right">Unit Price (RM)</div>
                  <div className="col-span-1 text-right">Amount</div>
                  <div className="col-span-1"></div>
                </div>

                <div className="space-y-3">
                  {editItems.map((item) => {
                    const lineAmt = getEditLineAmount(item);
                    return (
                      <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-none border-gray-200">
                        <div className="sm:col-span-5">
                          <input
                            type="text" required
                            placeholder="e.g. Consultation Fee"
                            value={item.description}
                            onChange={(e) => handleEditItemChange(item.id, 'description', e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            type="number" min="1" required
                            value={item.quantity}
                            onChange={(e) => handleEditItemChange(item.id, 'quantity', e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-center"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <input
                            type="number" step="0.01" min="0" required
                            placeholder="0.00"
                            value={item.unitPrice}
                            onChange={(e) => handleEditItemChange(item.id, 'unitPrice', e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-right font-mono"
                          />
                        </div>
                        <div className="sm:col-span-1 text-right text-sm font-black text-gray-800 font-mono">
                          {lineAmt.toFixed(2)}
                        </div>
                        <div className="sm:col-span-1 flex justify-end sm:justify-center">
                          <button
                            type="button"
                            onClick={() => removeEditItem(item.id)}
                            disabled={editItems.length === 1}
                            className={`p-2 rounded-lg transition-colors ${editItems.length === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button type="button" onClick={addEditItem} className="flex items-center text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add another item
                </button>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">{editItems.length} item{editItems.length !== 1 ? 's' : ''}</span>
                  <div className="text-right">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide block">Grand Total</span>
                    <span className="text-2xl font-black text-gray-900">
                      RM {editItems.reduce((acc, item) => acc + getEditLineAmount(item), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={editSaving} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md transition-all disabled:opacity-60">
                  {editSaving ? 'Saving...' : 'Save Items'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Payment Modal ────────────────────────────────────── */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <BanknotesIcon className="h-6 w-6 mr-2 text-green-600" />
                Collect Payment
              </h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-colors">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="p-6 space-y-6">
              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">Invoice</p>
                <p className="text-sm font-bold text-green-900">{selectedInvoice.patientName} · {shortId(selectedInvoice.invoiceId)}</p>
                {selectedInvoice.appointment && (
                  <p className="text-xs text-green-600 mt-0.5">
                    {selectedInvoice.appointment.date} · {selectedInvoice.appointment.doctorName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Amount (RM) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="Enter amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg font-black text-gray-900 outline-none focus:ring-2 focus:ring-red-500 text-right font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Payment Method</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Cash', 'Credit Card', 'E-Wallet'].map(method => (
                    <button
                      key={method} type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-3 rounded-xl text-sm font-bold transition-all border flex flex-col items-center justify-center gap-2
                        ${paymentMethod === method
                          ? 'bg-red-600 text-white border-red-600 shadow-md'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:text-red-600'}`}
                    >
                      <CreditCardIcon className="h-6 w-6" />
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="px-6 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={paying} className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-md transition-all disabled:opacity-60">
                  {paying ? 'Processing...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── View Invoice Modal ───────────────────────────────── */}
      {isViewModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 shrink-0">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <DocumentTextIcon className="h-6 w-6 mr-2 text-gray-500" />
                Invoice Details
              </h3>
              <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-colors">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Invoice header */}
              <div className="flex justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Bill To</p>
                  <p className="text-lg font-black text-gray-900">{selectedInvoice.patientName}</p>
                  <p className="text-sm text-gray-500">Issued: {fmtDate(selectedInvoice.createdAt)}</p>
                  {selectedInvoice.paidAt && (
                    <p className="text-sm text-green-600 font-medium">Paid: {fmtDate(selectedInvoice.paidAt)} · {selectedInvoice.paymentMethod}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Invoice ID</p>
                  <p className="text-base font-bold text-gray-900 font-mono">{shortId(selectedInvoice.invoiceId)}</p>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded text-xs font-bold border ${getStatusBadge(selectedInvoice.status)}`}>
                    {displayStatus(selectedInvoice.status)}
                  </span>
                </div>
              </div>

              {/* Appointment info */}
              {selectedInvoice.appointment && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-sm">
                  <p className="text-xs font-bold text-blue-500 uppercase tracking-wide mb-2">Linked Appointment</p>
                  <div className="grid grid-cols-2 gap-y-1 text-gray-700">
                    <span className="font-medium text-gray-500">Date</span>
                    <span className="font-bold">{selectedInvoice.appointment.date} at {selectedInvoice.appointment.time}</span>
                    <span className="font-medium text-gray-500">Doctor</span>
                    <span className="font-bold">{selectedInvoice.appointment.doctorName}</span>
                    {selectedInvoice.appointment.reason && <>
                      <span className="font-medium text-gray-500">Reason</span>
                      <span className="font-bold">{selectedInvoice.appointment.reason}</span>
                    </>}
                  </div>
                </div>
              )}

              {/* Line items */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 grid grid-cols-12 gap-2 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
                  <span className="col-span-5">Description</span>
                  <span className="col-span-2 text-center">Qty</span>
                  <span className="col-span-2 text-right">Unit Price</span>
                  <span className="col-span-3 text-right">Amount</span>
                </div>
                {(selectedInvoice.items || []).map((item, i) => (
                  <div key={i} className="px-4 py-3 grid grid-cols-12 gap-2 text-sm text-gray-800 border-t border-gray-50">
                    <span className="col-span-5 font-medium">{item.description}</span>
                    <span className="col-span-2 text-center text-gray-500">{item.quantity}</span>
                    <span className="col-span-2 text-right text-gray-500">RM {Number(item.unitPrice).toFixed(2)}</span>
                    <span className="col-span-3 text-right font-bold">RM {Number(item.amount).toFixed(2)}</span>
                  </div>
                ))}
                <div className="bg-gray-50 px-4 py-3 flex justify-between border-t border-gray-200">
                  <span className="font-bold text-gray-700">Grand Total</span>
                  <span className="font-black text-gray-900">{fmtMoney(selectedInvoice.totalAmount)}</span>
                </div>
              </div>

              {/* Actions */}
              {selectedInvoice.status === 'Paid' ? (
                <div className="pt-2 border-t border-gray-100 flex justify-end gap-3">
                  <button
                    onClick={() => printReceipt(selectedInvoice)}
                    className="flex items-center px-4 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
                  >
                    <PrinterIcon className="h-5 w-5 mr-2" />
                    Print Receipt
                  </button>
                  <button
                    onClick={() => { printReceipt(selectedInvoice); alert('Receipt sent to patient email.'); }}
                    className="flex items-center px-4 py-2.5 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition-all"
                  >
                    <EnvelopeIcon className="h-5 w-5 mr-2" />
                    Email Receipt
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-gray-100 flex justify-end gap-3">
                  <button onClick={() => setIsViewModalOpen(false)} className="px-6 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all">
                    Close
                  </button>
                  <button
                    onClick={() => { setIsViewModalOpen(false); openPaymentModal(selectedInvoice); }}
                    className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all"
                  >
                    Collect Payment Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
