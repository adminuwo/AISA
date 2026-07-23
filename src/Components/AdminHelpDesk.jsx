import React, { useState, useEffect } from 'react';
import { X, Search, Eye, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { apis, API } from '../types';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../services/apiService';

const AdminHelpDesk = ({ isOpen, onClose, isEmbedded = false }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const ticketsRes = await axios.get(`${apis.support}/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('[ADMIN HELPDESK] Tickets fetched:', ticketsRes.data.tickets);
      setTickets(ticketsRes.data.tickets || []);
    } catch (error) {
      console.error('[ADMIN] Error fetching tickets:', error);
      if (error.response) {
        console.error('[ADMIN] Error details:', error.response.data);
      }
      toast.error('Failed to fetch support tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen || isEmbedded) {
      fetchTickets();
      // Poll for new messages every 10 seconds
      const interval = setInterval(fetchTickets, 10000);
      return () => clearInterval(interval);
    }
  }, [isOpen, isEmbedded]);

  useEffect(() => {
    setReplyText('');
  }, [selectedTicket]);

  const handleStatusChange = async (ticketId, newStatus) => {
    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${apis.support}/tickets/${ticketId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Status updated successfully');
      setSelectedTicket(response.data.ticket);
      setTickets(prevTickets =>
        prevTickets.map(t => (t._id === ticketId ? response.data.ticket : t))
      );
    } catch (error) {
      console.error('[ADMIN] Failed to update status:', error);
      toast.error(error.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    try {
      await apiService.replyToSupportTicket(selectedTicket._id, replyText);
      toast.success('Reply email sent successfully');
      setReplyText('');
    } catch (error) {
      console.error('[ADMIN] Failed to send reply email:', error);
      toast.error(error.response?.data?.error || 'Failed to send reply email');
    } finally {
      setSendingReply(false);
    }
  };

  const filteredTickets = (tickets || []).filter(ticket => {
    const matchesSearch =
      ticket?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket?.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket?.status?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || ticket?.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = status => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'resolved':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  if (!isOpen && !isEmbedded) return null;

  const modalClasses =
    'bg-background border border-border rounded-2xl w-[95vw] max-w-7xl h-[90vh] flex flex-col shadow-2xl overflow-hidden';
  const embeddedClasses =
    'bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-2xl w-full h-[700px] flex flex-col shadow-xl overflow-hidden backdrop-blur-md';

  const content = (
    <motion.div
      initial={isEmbedded ? {} : { opacity: 0, scale: 0.95 }}
      animate={isEmbedded ? {} : { opacity: 1, scale: 1 }}
      exit={isEmbedded ? {} : { opacity: 0, scale: 0.95 }}
      className={isEmbedded ? embeddedClasses : modalClasses}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h2 className="text-2xl font-bold text-maintext flex items-center gap-2">
            🎧 Admin Help Desk
          </h2>
          <p className="text-sm text-subtext mt-1">Manage user support queries</p>
        </div>
        {!isEmbedded && (
          <button onClick={onClose} className="p-2 hover:bg-surface rounded-lg transition-colors">
            <X className="w-6 h-6 text-subtext" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-6 border-b border-border flex-wrap sm:flex-nowrap">
        <div className="flex-1 relative min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-subtext" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-maintext placeholder-subtext focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="relative shrink-0">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2 bg-surface border border-border rounded-lg text-maintext focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-subtext">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <button
          onClick={fetchTickets}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Tickets List */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-subtext">
            <p className="text-lg">No tickets found</p>
            <p className="text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTickets.map(ticket => (
              <div
                key={ticket._id}
                className="bg-surface border border-border rounded-xl p-4 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold text-maintext">{ticket.name}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(ticket.status)}`}
                      >
                        {ticket.status}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        {ticket.issueType}
                      </span>
                    </div>
                    <p className="text-sm text-subtext mb-2">{ticket.email}</p>
                    <p className="text-sm text-maintext line-clamp-2">{ticket.message}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xs text-subtext whitespace-nowrap">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedTicket(ticket);
                        }}
                        className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 text-primary" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );

  const ticketModal = (
    <AnimatePresence>
      {selectedTicket && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-background border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl m-4"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                <h3 className="text-xl font-bold text-maintext">Ticket Details</h3>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 hover:bg-surface rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-subtext" />
                </button>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-subtext uppercase font-semibold">Name</label>
                    <p className="text-maintext font-semibold text-sm mt-0.5">{selectedTicket.name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-subtext uppercase font-semibold">Email</label>
                    <p className="text-maintext text-sm mt-0.5">{selectedTicket.email}</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-subtext uppercase font-semibold">Issue Type</label>
                  <p className="text-maintext text-sm mt-0.5">{selectedTicket.issueType}</p>
                </div>

                <div>
                  <label className="text-xs text-subtext uppercase font-semibold">Message</label>
                  <p className="text-maintext bg-surface p-4 rounded-xl border border-border whitespace-pre-wrap text-sm mt-1 leading-relaxed">
                    {selectedTicket.message}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div>
                    <label className="text-xs text-subtext uppercase font-semibold block mb-1">Status</label>
                    <div className="relative">
                      <select
                        value={selectedTicket.status}
                        onChange={e => handleStatusChange(selectedTicket._id, e.target.value)}
                        disabled={updatingStatus}
                        className={`text-xs px-3 py-1.5 pr-8 rounded-full border bg-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer font-bold uppercase appearance-none ${getStatusColor(selectedTicket.status)}`}
                      >
                        {selectedTicket.status === 'resolved' ? (
                          <>
                            <option value="resolved">Resolved</option>
                            <option value="pending">Reopen as Pending</option>
                            <option value="in_progress">Reopen as In Progress</option>
                          </>
                        ) : (
                          <>
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                          </>
                        )}
                      </select>
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-subtext">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <label className="text-xs text-subtext uppercase font-semibold block mb-0.5">Created</label>
                    <p className="text-maintext text-xs">
                      {new Date(selectedTicket.createdAt).toLocaleString()}
                    </p>
                    {selectedTicket.status === 'resolved' && selectedTicket.resolvedAt && (
                      <div className="mt-1.5">
                        <label className="text-[10px] text-green-500 uppercase font-black block">Resolved At</label>
                        <p className="text-[11px] text-green-500 font-semibold">
                          {new Date(selectedTicket.resolvedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reply section */}
                <div className="border-t border-border pt-4">
                  <label className="text-xs text-subtext uppercase font-semibold block mb-2">Send Reply Email</label>
                  {selectedTicket.status === 'resolved' ? (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-500 text-sm rounded-lg font-medium">
                      This query is marked as Resolved. Replies and edits are disabled unless the ticket is reopened.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <textarea
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Type your reply to the user here..."
                        className="w-full p-3 bg-surface border border-border rounded-lg text-maintext placeholder-subtext focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px] text-sm"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={handleSendReply}
                          disabled={sendingReply || !replyText.trim()}
                          className="px-4 py-2 bg-primary text-white text-xs font-bold uppercase rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {sendingReply ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            'Send Reply Email'
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (isEmbedded) {
    return (
      <div className="w-full relative">
        {content}
        {ticketModal}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {content}
      {ticketModal}
    </div>
  );
};

export default AdminHelpDesk;
