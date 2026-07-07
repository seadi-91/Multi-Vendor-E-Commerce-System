import React, { useEffect, useState } from 'react';
import { Star, X } from 'lucide-react';
import { Button } from '../ui/button';

const ReviewModal = ({ open, onClose, item, initialReview, onSubmit, loading, theme }) => {
    const [rating, setRating] = useState(initialReview?.rating || 5);
    const [comment, setComment] = useState(initialReview?.comment || '');

    useEffect(() => {
        if (open) {
            setRating(initialReview?.rating || 5);
            setComment(initialReview?.comment || '');
        }
    }, [open, initialReview]);

    if (!open || !item) return null;

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit({ rating, comment: comment.trim() });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3 py-4 backdrop-blur-sm">
            <div className={`w-full max-w-lg rounded-2xl border shadow-2xl ${theme === 'dark' ? 'border-slate-700 bg-slate-900 text-white' : 'border-gray-200 bg-white text-slate-900'}`}>
                <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 sm:px-5">
                    <div>
                        <h3 className="text-base font-semibold">{initialReview ? 'Edit Review' : 'Write a Review'}</h3>
                        <p className="text-sm text-[var(--muted-foreground)]">Share your experience about {item.name || 'this product'}</p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 transition hover:bg-[var(--secondary)]">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 px-4 py-4 sm:px-5">
                    <div>
                        <label className="mb-2 block text-sm font-medium">Your rating</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="rounded-full p-1"
                                    aria-label={`Rate ${star} stars`}
                                >
                                    <Star className={`h-6 w-6 ${star <= rating ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">Your review</label>
                        <textarea
                            value={comment}
                            onChange={(event) => setComment(event.target.value)}
                            rows={5}
                            maxLength={500}
                            placeholder="Tell others what you liked or what could be improved"
                            className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${theme === 'dark' ? 'border-slate-700 bg-slate-950' : 'border-gray-300 bg-gray-50'}`}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} className="border-[var(--border)] bg-[var(--secondary)]">
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                            {loading ? 'Saving...' : initialReview ? 'Update Review' : 'Submit Review'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
