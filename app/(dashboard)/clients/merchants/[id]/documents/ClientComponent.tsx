'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DocumentUploader } from '@/components/merchants/DocumentUploader';
import { useMerchantStore } from '@/stores/merchantStore';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function MerchantDocumentsPage() {
  const params = useParams();
  const router = useRouter();
  const merchantId = params.id as string;

  const {
    selectedMerchant,
    documents,
    complianceDashboard,
    isLoading,
    fetchMerchantById,
    fetchDocuments,
    fetchComplianceDashboard,
    uploadDocument,
    verifyDocument,
    deleteDocument,
  } = useMerchantStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUploader, setShowUploader] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadType, setUploadType] = useState('');

  useEffect(() => {
    if (merchantId) {
      fetchMerchantById(merchantId);
      fetchDocuments(merchantId);
      fetchComplianceDashboard(merchantId);
    }
  }, [merchantId]);

  const handleUpload = async (files: File[]) => {
    try {
      for (const file of files) {
        await uploadDocument(merchantId, file, uploadType, uploadCategory);
      }
      toast.success('Documents uploaded successfully');
      setShowUploader(false);
      fetchDocuments(merchantId);
    } catch (error) {
      toast.error('Failed to upload documents');
    }
  };

  const handleVerify = async (docId: string, status: 'verified' | 'rejected') => {
    try {
      await verifyDocument(merchantId, docId, status);
      toast.success(`Document ${status} successfully`);
      fetchDocuments(merchantId);
      fetchComplianceDashboard(merchantId);
    } catch (error) {
      toast.error(`Failed to ${status} document`);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await deleteDocument(merchantId, docId);
      toast.success('Document deleted successfully');
      fetchDocuments(merchantId);
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const categories = ['all', 'incorporation', 'tax', 'banking', 'kyc', 'address_proof', 'other'];

  const safeDocuments = Array.isArray(documents) ? documents : [];
  const filteredDocuments = selectedCategory === 'all'
    ? safeDocuments
    : safeDocuments.filter(doc => doc.category === selectedCategory);

  const statusColors = {
    pending: 'bg-yellow-500',
    verified: 'bg-green-500',
    rejected: 'bg-red-500',
    expired: 'bg-slate-900/600',
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700/30 rounded w-1/4"></div>
          <div className="h-64 bg-slate-700/30 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        ← Back to Merchant Profile
      </Button>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Document Management
          </h1>
          <p className="text-slate-400">{selectedMerchant?.businessName}</p>
        </div>
        <Button onClick={() => setShowUploader(true)}>
          Upload Document
        </Button>
      </div>

      {complianceDashboard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-6 hover:shadow-orange-500/5 transition-shadow duration-300">
            <p className="text-sm text-slate-400 mb-1">Compliance Score</p>
            <div className="flex items-baseline">
              <p className="text-3xl font-bold">{complianceDashboard.overallScore}</p>
              <p className="text-sm text-slate-500 ml-1">/100</p>
            </div>
            <div className="mt-2 h-2 bg-slate-700/30 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  complianceDashboard.overallScore >= 80
                    ? 'bg-green-500'
                    : complianceDashboard.overallScore >= 60
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${complianceDashboard.overallScore}%` }}
              />
            </div>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-6 hover:shadow-orange-500/5 transition-shadow duration-300">
            <p className="text-sm text-slate-400 mb-1">Missing Documents</p>
            <p className="text-3xl font-bold text-red-600">
              {complianceDashboard.missingDocuments.length}
            </p>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-6 hover:shadow-orange-500/5 transition-shadow duration-300">
            <p className="text-sm text-slate-400 mb-1">Expiring Soon</p>
            <p className="text-3xl font-bold text-orange-600">
              {complianceDashboard.expiringDocuments.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Next 30 days</p>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-6 hover:shadow-orange-500/5 transition-shadow duration-300">
            <p className="text-sm text-slate-400 mb-1">Expired</p>
            <p className="text-3xl font-bold text-slate-400">
              {complianceDashboard.expiredDocuments.length}
            </p>
          </Card>
        </div>
      )}

      {complianceDashboard && complianceDashboard.missingDocuments.length > 0 && (
        <Card className="p-6 mb-8 bg-red-50 border-red-200">
          <h3 className="font-semibold text-red-900 mb-3">Missing Required Documents</h3>
          <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
            {complianceDashboard.missingDocuments.map((doc) => (
              <li key={doc.id}>{doc.name}</li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="mb-6">
        <div className="p-4 border-b">
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category.replace('_', ' ').toUpperCase()}
              </Button>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-6 hover:shadow-orange-500/5 transition-shadow duration-300">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <svg
                className="mx-auto h-12 w-12 text-slate-500 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p>No documents found in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDocuments.map((doc) => (
                <Card key={doc.id} className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-6 hover:shadow-orange-500/5 transition-shadow duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{doc.type}</h4>
                        <Badge className={`${statusColors[doc.status]} text-white`}>
                          {doc.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 mb-1">{doc.fileName}</p>
                      <p className="text-xs text-slate-500">
                        Category: {doc.category}
                      </p>
                      <p className="text-xs text-slate-500">
                        Uploaded {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}
                      </p>
                      {doc.expiryDate && (
                        <p className="text-xs text-slate-500">
                          Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                        </p>
                      )}
                      {doc.verifiedAt && (
                        <p className="text-xs text-green-600 mt-1">
                          Verified by {doc.verifiedBy} on {new Date(doc.verifiedAt).toLocaleDateString()}
                        </p>
                      )}
                      {doc.notes && (
                        <p className="text-xs text-slate-400 mt-2 p-2 bg-slate-900/60 rounded">
                          {doc.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Download
                    </Button>
                    {doc.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleVerify(doc.id, 'verified')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleVerify(doc.id, 'rejected')}
                          variant="outline"
                          className="text-red-600"
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleDelete(doc.id)}
                      variant="outline"
                      className="text-red-600"
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>

      {showUploader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Upload Document</h3>
              <button
                onClick={() => setShowUploader(false)}
                className="text-slate-500 hover:text-slate-400"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Document Type *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-600/50 rounded-md"
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  placeholder="e.g., PAN Card, GST Certificate"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <select
                  className="w-full px-3 py-2 border border-slate-600/50 rounded-md"
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  required
                >
                  <option value="">Select category</option>
                  <option value="incorporation">Incorporation</option>
                  <option value="tax">Tax Documents</option>
                  <option value="banking">Banking</option>
                  <option value="kyc">KYC</option>
                  <option value="address_proof">Address Proof</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {uploadType && uploadCategory && (
              <DocumentUploader onUpload={handleUpload} />
            )}

            {(!uploadType || !uploadCategory) && (
              <div className="text-center py-8 text-slate-500">
                Please select document type and category to continue
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
