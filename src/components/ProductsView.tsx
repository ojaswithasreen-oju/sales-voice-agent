import React, { useState } from 'react';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Users,
  DollarSign,
  Play,
  X
} from 'lucide-react';
import { api } from '../lib/api';
import type { Product } from '../types';

interface ProductsViewProps {
  products: Product[];
  onRefresh: () => void;
  onTestAssistantPrompt: (samplePrompt: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  onRefresh,
  onTestAssistantPrompt,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});
  const [featureInput, setFeatureInput] = useState('');

  const handleOpenCreate = () => {
    setEditingProduct({
      name: '',
      price: '$990 / month',
      description: '',
      features: ['24/7 SLA Guarantee', 'Dedicated Technical Account Manager', 'SSO & SAML Security'],
      benefits: ['Accelerate delivery by 40%', 'Reduce operating overhead'],
      targetCustomer: 'Mid-market and enterprise operations teams',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct({ ...p });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct.name) return;

    try {
      if (editingProduct.id) {
        await api.updateProduct(editingProduct.id, editingProduct);
      } else {
        await api.createProduct(editingProduct);
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error('Failed to save product', err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(id);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete product', err);
    }
  };

  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    setEditingProduct({
      ...editingProduct,
      features: [...(editingProduct.features || []), featureInput.trim()],
    });
    setFeatureInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Products &amp; Offerings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure your solutions catalogue, pricing schedules, value propositions, and buyer FAQs for AI ground-truth.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Product or Service</span>
        </button>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{product.name}</h3>
                  <div className="text-xs font-bold font-mono text-indigo-600 mt-0.5">
                    {product.price}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(product)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {product.description}
              </p>

              {/* Target Customer */}
              {product.targetCustomer && (
                <div className="mb-4 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate"><b>Target:</b> {product.targetCustomer}</span>
                </div>
              )}

              {/* Features List */}
              <div className="space-y-1.5 mb-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Included Features
                </div>
                {product.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Pitch Simulation Button */}
            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() =>
                  onTestAssistantPrompt(`Can you tell me all about ${product.name} and how much it costs?`)
                }
                className="w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-indigo-200 shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Test AI Voice Pitch for this Offering</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* CREATE / EDIT PRODUCT MODAL */}
      {/* ------------------------------------------------------------------ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct.id ? 'Edit Offering' : 'Add New Product / Service'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-3.5 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Offering Title</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="e.g. Enterprise Cloud Suite"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pricing Model / Cost</label>
                <input
                  type="text"
                  required
                  value={editingProduct.price || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                  placeholder="e.g. $1,990 / month or Starting at $49/seat"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Value Proposition / Description</label>
                <textarea
                  rows={3}
                  required
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  placeholder="Detailed summary for the AI voice assistant..."
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Customer Profile</label>
                <input
                  type="text"
                  value={editingProduct.targetCustomer || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, targetCustomer: e.target.value })}
                  placeholder="e.g. Mid-market CTOs and Directors of Engineering"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Features &amp; Highlights</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    placeholder="Add bullet item (e.g. SOC2 Type II compliance)"
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(editingProduct.features || []).map((feat, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-[11px] font-medium flex items-center gap-1.5"
                    >
                      <span>{feat}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingProduct({
                            ...editingProduct,
                            features: editingProduct.features?.filter((_, idx) => idx !== i),
                          })
                        }
                        className="text-slate-400 hover:text-rose-600"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl cursor-pointer shadow-xs"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
