import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Check, X, ChevronDown, Leaf } from 'lucide-react';
import api from '../../../../api';

const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  category: z.string().min(1, 'Please select a category'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.string().min(1, 'Price is required'),
  unit: z.string().min(1, 'Please select a unit'),
  stock: z.string().min(1, 'Stock is required'),
  minOrder: z.string().min(1, 'Minimum order is required'),
  organic: z.boolean().default(false),
  pesticideFree: z.boolean().default(false),
  freshlyHarvested: z.boolean().default(false),
});

const CustomDropdown = ({ label, options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full">
      <label className="text-sm font-medium text-forest-900 mb-2 block">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center bg-white border border-slate-200 px-4 py-3 rounded-xl hover:border-forest-300 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all"
      >
        <span className={value ? 'text-forest-900' : 'text-slate-400'}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-forest-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const AddProductDialog = ({ open, onOpenChange, onSuccess }) => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [unitOpen, setUnitOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      organic: false,
      pesticideFree: false,
      freshlyHarvested: false,
    },
  });

  const category = watch('category');

  const categoryOptions = [
    { value: 'Vegetables', label: 'Vegetables' },
    { value: 'Fruits', label: 'Fruits' },
    { value: 'Grains', label: 'Grains' },
    { value: 'Dairy', label: 'Dairy' },
  ];

  const unitOptions = {
    Vegetables: [
      { value: 'kg', label: 'Kilogram (kg)' },
      { value: 'g', label: 'Gram (g)' },
      { value: 'piece', label: 'Piece' },
      { value: 'bunch', label: 'Bunch' },
    ],
    Fruits: [
      { value: 'kg', label: 'Kilogram (kg)' },
      { value: 'g', label: 'Gram (g)' },
      { value: 'dozen', label: 'Dozen' },
      { value: 'piece', label: 'Piece' },
    ],
    Grains: [
      { value: 'kg', label: 'Kilogram (kg)' },
      { value: 'quintal', label: 'Quintal (q)' },
      { value: 'ton', label: 'Ton (t)' },
    ],
    Dairy: [
      { value: 'liter', label: 'Liter (L)' },
      { value: 'ml', label: 'Milliliter (ml)' },
      { value: 'packet', label: 'Packet' },
      { value: 'bottle', label: 'Bottle' },
    ],
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isPrimary: uploadedImages.length === 0,
    }));
    setUploadedImages([...uploadedImages, ...newImages]);
  };

  const handleRemoveImage = (index) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleSetPrimary = (index) => {
    setUploadedImages(
      uploadedImages.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('category', data.category);
      formData.append('description', data.description);
      formData.append('price', data.price);
      formData.append('unit', data.unit);
      formData.append('stock', data.stock);
      formData.append('minOrder', data.minOrder);
      formData.append('organic', data.organic);
      formData.append('pesticideFree', data.pesticideFree);
      formData.append('freshlyHarvested', data.freshlyHarvested);

      uploadedImages.forEach((img, index) => {
        formData.append('images', img.file);
        if (img.isPrimary) {
          formData.append('primaryImageIndex', index);
        }
      });

      await api.post('/farmer/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onSuccess();
      onOpenChange(false);
      setUploadedImages([]);
    } catch (error) {
      console.error('Error adding product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-[#F4F7F6]">
        {/* Header */}
        <div className="bg-forest-700 px-8 py-6 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white">Add a New Listing</DialogTitle>
              <p className="text-sm text-forest-100">FarmConnect Product Management</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8">
          {/* Section 1: Basic Product Information */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-forest-900 mb-6 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-600 text-white text-sm font-bold">1</span>
              Basic Product Information
            </h2>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <label className="text-sm font-medium text-forest-900 mb-2 block">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('name')}
                  placeholder="Enter product name"
                  className="border-slate-200 focus:border-forest-500 focus:ring-forest-500"
                />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
              </div>

              <div className="relative w-full">
                <label className="text-sm font-medium text-forest-900 mb-2 block">
                  Category <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setCategoryOpen(!categoryOpen)}
                  className="w-full flex justify-between items-center bg-white border border-slate-200 px-4 py-3 rounded-xl hover:border-forest-300 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all"
                >
                  <span className={category ? 'text-forest-900' : 'text-slate-400'}>
                    {category || 'Select category'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
                </button>
                {categoryOpen && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                    {categoryOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setValue('category', option.value);
                          setCategoryOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-forest-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
                {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-forest-900 mb-2 block">
                  Description <span className="text-red-500">*</span>
                </label>
                <Textarea
                  {...register('description')}
                  placeholder="Describe your product in detail..."
                  rows={6}
                  className="border-slate-200 focus:border-forest-500 focus:ring-forest-500"
                />
                {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>}
              </div>
            </div>
          </div>

          {/* Section 2: Offer & Pricing */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-forest-900 mb-6 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-600 text-white text-sm font-bold">2</span>
              Offer & Pricing
            </h2>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-forest-900 mb-2 block">
                    Price per Unit <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-600 font-medium">ETB</span>
                    <Input
                      {...register('price')}
                      type="number"
                      placeholder="0.00"
                      className="border-slate-200 focus:border-forest-500 focus:ring-forest-500 pl-12"
                    />
                  </div>
                  {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>}
                </div>

                <div className="relative w-full">
                  <label className="text-sm font-medium text-forest-900 mb-2 block">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setUnitOpen(!unitOpen)}
                    className="w-full flex justify-between items-center bg-white border border-slate-200 px-4 py-3 rounded-xl hover:border-forest-300 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all"
                  >
                    <span className={watch('unit') ? 'text-forest-900' : 'text-slate-400'}>
                      {watch('unit') ? unitOptions[category]?.find(u => u.value === watch('unit'))?.label : 'Select unit'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${unitOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {unitOpen && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                      {(unitOptions[category] || []).map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setValue('unit', option.value);
                            setUnitOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-forest-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {errors.unit && <p className="text-sm text-red-600 mt-1">{errors.unit.message}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-forest-900 mb-2 block">
                    Available Stock <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register('stock')}
                    type="number"
                    placeholder="0"
                    className="border-slate-200 focus:border-forest-500 focus:ring-forest-500"
                  />
                  {errors.stock && <p className="text-sm text-red-600 mt-1">{errors.stock.message}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-forest-900 mb-2 block">
                    Minimum Order Quantity <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register('minOrder')}
                    type="number"
                    placeholder="0"
                    className="border-slate-200 focus:border-forest-500 focus:ring-forest-500"
                  />
                  {errors.minOrder && <p className="text-sm text-red-600 mt-1">{errors.minOrder.message}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Media & Logistics */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-forest-900 mb-6 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-600 text-white text-sm font-bold">3</span>
              Media & Logistics
            </h2>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <label className="text-sm font-medium text-forest-900 mb-2 block">Product Images</label>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 bg-slate-50 text-center hover:border-forest-400 transition-colors">
                  <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-sm font-medium text-forest-900 mb-2">Upload Product Images</p>
                  <p className="text-xs text-slate-600 mb-4">Drag and drop or click to upload (Max 5 images)</p>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center px-6 py-3 bg-forest-600 text-white rounded-xl cursor-pointer hover:bg-forest-700 transition-colors font-medium"
                  >
                    Choose Files
                  </label>
                </div>
              </div>

              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-5 gap-4">
                  {uploadedImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <div className={`aspect-square rounded-xl overflow-hidden border-2 ${img.isPrimary ? 'border-forest-500 ring-2 ring-forest-200' : 'border-slate-200'}`}>
                        <img
                          src={img.preview}
                          alt={`Preview ${index}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {img.isPrimary && (
                        <div className="absolute top-2 left-2 bg-forest-600 text-white text-xs px-2 py-1 rounded-lg font-medium">
                          Featured
                        </div>
                      )}
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {!img.isPrimary && (
                        <button
                          onClick={() => handleSetPrimary(index)}
                          className="absolute bottom-2 right-2 bg-forest-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          title="Set as featured"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-forest-900 mb-4 block">Product Badges</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-forest-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      {...register('organic')}
                      className="h-5 w-5 text-forest-600 rounded focus:ring-forest-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-forest-900">Organic Certified</p>
                      <p className="text-xs text-slate-600">Product is certified organic</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-forest-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      {...register('pesticideFree')}
                      className="h-5 w-5 text-forest-600 rounded focus:ring-forest-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-forest-900">Pesticide Free</p>
                      <p className="text-xs text-slate-600">Grown without pesticides</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-forest-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      {...register('freshlyHarvested')}
                      className="h-5 w-5 text-forest-600 rounded focus:ring-forest-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-forest-900">Freshly Harvested Today</p>
                      <p className="text-xs text-slate-600">Recently harvested produce</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 px-6"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-forest-300 text-forest-700 hover:bg-forest-50 px-6"
            >
              Save Draft
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-forest-600 hover:bg-forest-700 text-white px-8"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Listing'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
