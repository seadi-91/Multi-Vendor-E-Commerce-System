import React, { useEffect, useState } from 'react';
import Footer from '../../../../components/Footer';
import Header from '../../../../components/Header';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../context/ThemeContext';
import api from '../../../../api';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Edit3, MessageSquare, Star, Trash2 } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';
import ReviewModal from '../../../../components/reviews/ReviewModal';

const MyReviews = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReview, setSelectedReview] = useState(null);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [savingReview, setSavingReview] = useState(false);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await api.get('/reviews/me');
            setReviews(Array.isArray(response.data?.data) ? response.data.data : []);
        } catch (error) {
            console.warn('Unable to load reviews', error);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const openEdit = (review) => {
        setSelectedReview(review);
        setReviewModalOpen(true);
    };

    const closeModal = () => {
        setReviewModalOpen(false);
        setSelectedReview(null);
    };

    const handleSubmit = async ({ rating, comment }) => {
        if (!selectedReview) return;

        setSavingReview(true);
        try {
            await api.post('/reviews', {
                productId: selectedReview.productId,
                orderId: selectedReview.orderId,
                rating,
                comment
            });
            toast.success('Review updated successfully');
            closeModal();
            fetchReviews();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to save your review');
        } finally {
            setSavingReview(false);
        }
    };

    const handleDelete = async (reviewId) => {
        try {
            await api.delete(`/reviews/${reviewId}`);
            toast.success('Review removed');
            fetchReviews();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to delete review');
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
            <Header pageType="reviews" />
            <div className="flex-1 px-3 py-4 sm:px-4 lg:px-6">
                <div className="mx-auto flex max-w-5xl items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] px-3 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="h-9 rounded-xl border-[var(--border)] bg-[var(--secondary)]" onClick={() => navigate(-1)}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <div>
                            <h1 className="text-base font-semibold">My Reviews</h1>
                            <p className="text-sm text-[var(--muted-foreground)]">Manage the feedback you have left for purchases.</p>
                        </div>
                    </div>
                </div>

                <div className="mx-auto mt-4 max-w-5xl space-y-3">
                    {loading ? (
                        <Card className="border-none ring-0 bg-[var(--card)] shadow-sm">
                            <CardContent className="p-6 text-center text-sm text-[var(--muted-foreground)]">Loading your reviews...</CardContent>
                        </Card>
                    ) : reviews.length === 0 ? (
                        <Card className="border-none ring-0 bg-[var(--card)] shadow-sm">
                            <CardContent className="p-8 text-center">
                                <MessageSquare className="mx-auto h-8 w-8 text-[var(--muted-foreground)]" />
                                <h2 className="mt-3 text-base font-semibold">No reviews yet</h2>
                                <p className="mt-1 text-sm text-[var(--muted-foreground)]">Reviews you submit from delivered orders will appear here.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        reviews.map((review) => (
                            <Card key={review.id} className="border-none ring-0 bg-[var(--card)] shadow-sm">
                                <CardContent className="p-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="flex gap-3 min-w-0 flex-1">
                                            {review.product?.image && (
                                                <img src={review.product.image} alt={review.product?.name || 'Product'} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h2 className="text-sm font-semibold">{review.product?.name || 'Product review'}</h2>
                                                    <div className="flex items-center gap-0.5">
                                                        {[...Array(5)].map((_, index) => (
                                                            <Star key={index} className={`h-3.5 w-3.5 ${index < review.rating ? 'fill-amber-500 text-amber-500' : 'text-[var(--muted-foreground)]'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="mt-2 text-sm text-[var(--muted-foreground)]">{review.comment || 'No comment provided.'}</p>
                                                <p className="mt-2 text-[11px] text-[var(--muted-foreground)]">Submitted {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" className="h-8 rounded-lg border-[var(--border)] bg-[var(--secondary)]" onClick={() => openEdit(review)}>
                                                <Edit3 className="mr-2 h-3.5 w-3.5" /> Edit
                                            </Button>
                                            <Button variant="outline" className="h-8 rounded-lg border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300" onClick={() => handleDelete(review.id)}>
                                                <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                <ReviewModal
                    open={reviewModalOpen}
                    onClose={closeModal}
                    item={selectedReview?.product ? selectedReview.product : { name: 'Product' }}
                    initialReview={selectedReview}
                    onSubmit={handleSubmit}
                    loading={savingReview}
                    theme={theme}
                />
            </div>
            <Footer />
        </div>
    );
};

export default MyReviews;
