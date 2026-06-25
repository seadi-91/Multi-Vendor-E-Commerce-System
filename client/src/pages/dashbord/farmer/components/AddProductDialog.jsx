import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, Check, X, ChevronRight, ChevronLeft } from 'lucide-react';
import api from '../../../../api';

const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  category: z.enum(['Vegetables', 'Fruits', 'Grains', 'Dairy'], {
    required_error: 'Please select a category',
  }),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.string().min(1, 'Price is required'),
  unit: z.string().min(1, 'Please select a unit'),
  stock: z.string().min(1, 'Stock is required'),
  minOrder: z.string().min(1, 'Minimum order is required'),
  organic: z.boolean().default(false),
  pesticideFree: z.boolean().default(false),
  freshlyHarvested: z.boolean().default(false),
});

const AddProductDialog = ({ open, onOpenChange, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const categoryUnits = {
    Vegetables: [
      { value: 'kg', label: 'Kilograms' },
      { value: 'g', label: 'Grams' },
      { value: 'piece', label: 'Pieces' },
      { value: 'bunch', label: 'Bunches' },
    ],
    Fruits: [
      { value: 'kg', label: 'Kilograms' },
      { value: 'g', label: 'Grams' },
      { value: 'dozen', label: 'Dozen' },
      { value: 'piece', label: 'Pieces' },
    ],
    Grains: [
      { value: 'kg', label: 'Kilograms' },
      { value: 'quintal', label: 'Quintal' },
      { value: 'ton', label: 'Ton' },
    ],
    Dairy: [
      { value: 'liter', label: 'Liters' },
      { value: 'ml', label: 'Milliliters' },
      { value: 'packet', label: 'Packets' },
      { value: 'bottle', label: 'Bottles' },
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
      setCurrentStep(1);
      setUploadedImages([]);
    } catch (error) {
      console.error('Error adding product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-forest-900 mb-2 block">Product Name</label>
              <Input
                {...register('name')}
                placeholder="Enter product name"
                className="border-forest-200 focus:border-forest-500 focus:ring-forest-500"
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-forest-900 mb-2 block">Category</label>
              <Select onValueChange={(value) => setValue('category', value)}>
                <SelectTrigger className="border-forest-200 focus:border-forest-500">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vegetables">Vegetables</SelectItem>
                  <SelectItem value="Fruits">Fruits</SelectItem>
                  <SelectItem value="Grains">Grains</SelectItem>
                  <SelectItem value="Dairy">Dairy</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-forest-900 mb-2 block">Description</label>
              <Textarea
                {...register('description')}
                placeholder="Describe your product..."
                rows={4}
                className="border-forest-200 focus:border-forest-500 focus:ring-forest-500"
              />
              {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-forest-900 mb-2 block">Price per Unit</label>
                <Input
                  {...register('price')}
                  type="number"
                  placeholder="0.00"
                  className="border-forest-200 focus:border-forest-500 focus:ring-forest-500"
                />
                {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-forest-900 mb-2 block">Unit</label>
                <Select onValueChange={(value) => setValue('unit', value)}>
                  <SelectTrigger className="border-forest-200 focus:border-forest-500">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryUnits[category]?.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.unit && <p className="text-sm text-red-600 mt-1">{errors.unit.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-forest-900 mb-2 block">Available Stock</label>
                <Input
                  {...register('stock')}
                  type="number"
                  placeholder="0"
                  className="border-forest-200 focus:border-forest-500 focus:ring-forest-500"
                />
                {errors.stock && <p className="text-sm text-red-600 mt-1">{errors.stock.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-forest-900 mb-2 block">Min Order Quantity</label>
                <Input
                  {...register('minOrder')}
                  type="number"
                  placeholder="0"
                  className="border-forest-200 focus:border-forest-500 focus:ring-forest-500"
                />
                {errors.minOrder && <p className="text-sm text-red-600 mt-1">{errors.minOrder.message}</p>}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-forest-300 rounded-2xl p-8 bg-forest-50 text-center">
              <Upload className="h-12 w-12 text-forest-400 mx-auto mb-4" />
              <p className="text-sm font-medium text-forest-900 mb-2">Upload Product Images</p>
              <p className="text-xs text-forest-600 mb-4">Drag and drop or click to upload</p>
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
                className="inline-flex items-center px-4 py-2 bg-forest-600 text-white rounded-lg cursor-pointer hover:bg-forest-700 transition-colors"
              >
                Choose Files
              </label>
            </div>

            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {uploadedImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.preview}
                      alt={`Preview ${index}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    {img.isPrimary && (
                      <div className="absolute top-1 left-1 bg-mint-500 text-white text-xs px-2 py-0.5 rounded">
                        Primary
                      </div>
                    )}
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {!img.isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(index)}
                        className="absolute bottom-1 right-1 bg-forest-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Set as primary"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <p className="text-sm font-medium text-forest-900 mb-4">Product Badges & Features</p>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-forest-200 hover:bg-forest-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  {...register('organic')}
                  className="h-5 w-5 text-forest-600 rounded focus:ring-forest-500"
                />
                <div>
                  <p className="font-medium text-forest-900">Organic Certified</p>
                  <p className="text-xs text-forest-600">Product is certified organic</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-forest-200 hover:bg-forest-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  {...register('pesticideFree')}
                  className="h-5 w-5 text-forest-600 rounded focus:ring-forest-500"
                />
                <div>
                  <p className="font-medium text-forest-900">Pesticide Free</p>
                  <p className="text-xs text-forest-600">Grown without pesticides</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-forest-200 hover:bg-forest-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  {...register('freshlyHarvested')}
                  className="h-5 w-5 text-forest-600 rounded focus:ring-forest-500"
                />
                <div>
                  <p className="font-medium text-forest-900">Freshly Harvested</p>
                  <p className="text-xs text-forest-600">Recently harvested produce</p>
                </div>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white border-forest-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-forest-900">Add New Product</DialogTitle>
          <DialogDescription className="text-forest-600">
            Step {currentStep} of 4: {['General Details', 'Price & Inventory', 'Image Upload', 'Badges & Features'][currentStep - 1]}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="py-4">{renderStep()}</div>

          <DialogFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="border-forest-200 text-forest-700 hover:bg-forest-50"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep === 4 ? (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-forest-600 hover:bg-forest-700 text-white"
              >
                {isSubmitting ? 'Saving Product...' : 'Add Product'}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-forest-600 hover:bg-forest-700 text-white"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
