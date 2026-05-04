'use client';

import { useState, useEffect, useRef } from 'react';
import {
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { UserCircleIcon } from '@heroicons/react/24/solid';

const QUICK_TEMPLATES = [
  "Patient is ready and waiting outside.",
  "Please review the updated invoice.",
  "Could you come to the front desk when free?",
  "Appointment has been successfully cancelled."
];

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState('Staff');
  const [activeContactId, setActiveContactId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [patientList, setPatientList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/receptionist/messages/contacts`)
      .then(r => r.json())
      .then(data => {
        setStaffList(data.staff || []);
        setPatientList(data.patients || []);
        const first = (data.staff || [])[0];
        if (first) setActiveContactId(first.id);
      })
      .catch(console.error)
      .finally(() => setLoadingContacts(false));
  }, []);

  useEffect(() => {
    if (!activeContactId || !token) return;
    setLoadingMessages(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/receptionist/messages/${activeContactId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoadingMessages(false));

    // mark messages from this contact as read
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/receptionist/messages/${activeContactId}/read`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    }).catch(console.error);
  }, [activeContactId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeContacts = activeTab === 'Staff' ? staffList : patientList;
  const filteredContacts = activeContacts.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const activeContact = [...staffList, ...patientList].find(c => c.id === activeContactId);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setSearchTerm('');
    const list = tab === 'Staff' ? staffList : patientList;
    if (list.length > 0) setActiveContactId(list[0].id);
    else setActiveContactId(null);
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeContactId || !token) return;

    const text = inputText;
    setInputText('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/receptionist/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ receiverId: activeContactId, content: text })
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => [...prev, newMsg]);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const insertTemplate = (text) => setInputText(text);

  return (
    <div className="h-full bg-gray-50 flex flex-col py-6 px-6 font-sans overflow-hidden">
      <div className="w-full flex flex-col flex-1 min-h-0 space-y-4">

        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center">
            <ChatBubbleLeftRightIcon className="h-8 w-8 mr-3 text-red-600" />
            Internal Communications
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Send quick messages to doctors, nurses, or patients directly.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex overflow-hidden flex-1 min-h-0">

          {/* LEFT PANE: Contact List */}
          <div className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => handleTabSwitch('Staff')}
                className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'Staff' ? 'border-red-600 text-red-600 bg-red-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
              >
                Medical Staff
              </button>
              <button
                onClick={() => handleTabSwitch('Patients')}
                className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'Patients' ? 'border-red-600 text-red-600 bg-red-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
              >
                Patients
              </button>
            </div>

            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-100 rounded-lg pl-10 pr-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-red-500 transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingContacts ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mx-auto"></div>
                </div>
              ) : filteredContacts.length === 0 ? (
                <p className="p-6 text-center text-sm text-gray-400 font-medium">No contacts found.</p>
              ) : (
                filteredContacts.map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => setActiveContactId(contact.id)}
                    className={`w-full flex items-center p-4 border-b border-gray-50 transition-colors text-left
                    ${activeContactId === contact.id ? 'bg-red-50/50' : 'hover:bg-gray-50'}`}
                  >
                    <UserCircleIcon className={`h-12 w-12 mr-3 ${activeContactId === contact.id ? 'text-red-500' : 'text-gray-300'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${activeContactId === contact.id ? 'text-gray-900' : 'text-gray-700'}`}>
                        {contact.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{contact.role}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* RIGHT PANE: Chat */}
          <div className="flex-1 bg-gray-50 flex flex-col min-w-0 max-w-5xl">
            {activeContact ? (
              <>
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center shadow-sm z-10">
                  <UserCircleIcon className="h-10 w-10 mr-3 text-red-500" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{activeContact.name}</h3>
                    <p className="text-xs font-medium text-gray-500">{activeContact.role}</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3">
                      <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-300" />
                      <p className="text-sm font-medium text-gray-500">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map(msg => (
                      <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-sm px-5 py-3 rounded-2xl text-sm shadow-sm
                          ${msg.sender === 'me'
                            ? 'bg-red-600 text-white rounded-br-sm'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'}`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-xs text-gray-400 mt-1 font-medium px-1">{msg.time}</span>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="bg-white border-t border-gray-200 p-4">
                  <div className="flex space-x-2 mb-3 overflow-x-auto pb-1">
                    {QUICK_TEMPLATES.map((tpl, i) => (
                      <button
                        key={i}
                        onClick={() => insertTemplate(tpl)}
                        className="whitespace-nowrap px-3 py-1.5 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-700 text-xs font-bold rounded-lg transition-colors border border-transparent hover:border-red-100"
                      >
                        {tpl}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={`Message ${activeContact.name}...`}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className={`p-3 rounded-xl flex items-center justify-center transition-all
                      ${inputText.trim()
                        ? 'bg-red-600 text-white hover:bg-red-700 shadow-md'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                      <PaperAirplaneIcon className="h-6 w-6 transform -rotate-45" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <p>Select a contact to start messaging.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
