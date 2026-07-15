import React, { useState } from 'react';
import { Review } from '../types';
import { Star, MessageSquare, Plus, Check } from 'lucide-react';

interface ReviewSectionProps {
  reviews: Review[];
  onAddReview: (review: Omit<Review, 'id' | 'date'>) => void;
}

export default function ReviewSection({ reviews, onAddReview }: ReviewSectionProps) {
  const [userName, setUserName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Calculate statistics
  const totalReviews = reviews.length;
  const averageRating = (
    reviews.reduce((acc, curr) => acc + curr.rating, 0) / (totalReviews || 1)
  ).toFixed(1);

  // Distribution counts
  const starDistribution = [0, 0, 0, 0, 0]; // Index 0 = 1 star, Index 4 = 5 star
  reviews.forEach((r) => {
    const idx = Math.min(4, Math.max(0, Math.floor(r.rating) - 1));
    starDistribution[idx]++;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !comment.trim()) return;

    onAddReview({
      userName,
      rating,
      comment,
    });

    setUserName('');
    setRating(5);
    setComment('');
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setShowForm(false);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-neutral-50/60 p-6 sm:p-8 rounded-3xl border border-neutral-100">
        
        {/* Aggregated score (Col 4) */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-neutral-200/60 pb-6 md:pb-0 md:pr-6">
          <span className="text-5xl font-black text-neutral-900 tracking-tight">{averageRating}</span>
          
          <div className="flex items-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className={`w-5 h-5 ${
                  star <= Math.round(Number(averageRating)) 
                    ? 'fill-amber-400 text-amber-400' 
                    : 'text-neutral-200'
                }`} 
              />
            ))}
          </div>

          <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
            {totalReviews} Student Reviews
          </span>
        </div>

        {/* Bar distribution breakdown (Col 5) */}
        <div className="md:col-span-5 flex flex-col justify-center space-y-1.5 px-0 md:px-4">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = starDistribution[stars - 1];
            const percent = (count / (totalReviews || 1)) * 100;
            return (
              <div key={stars} className="flex items-center gap-3 text-xs font-semibold text-neutral-600">
                <span className="w-10 text-right">{stars} Star</span>
                <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-400 rounded-full" 
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-6 text-left">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Trigger form button (Col 3) */}
        <div className="md:col-span-3 flex items-center justify-center">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Write Review
            </button>
          )}
        </div>
      </div>

      {/* Write review form overlay or collapse */}
      {showForm && (
        <form 
          onSubmit={handleSubmit} 
          className="bg-white p-5 sm:p-6 rounded-2xl border border-orange-100/60 shadow-xs space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-neutral-900 uppercase tracking-wider">
              Share Your Class Experience
            </h4>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs text-neutral-400 hover:text-orange-600 font-semibold uppercase tracking-wider"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name Input */}
            <div className="space-y-1.5">
              <label htmlFor="user-review-name" className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                Your Name
              </label>
              <input
                id="user-review-name"
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-4 py-2 bg-neutral-50 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>

            {/* Stars Selector */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                Your Rating
              </span>
              <div className="flex items-center gap-1 h-9">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-neutral-300 hover:text-amber-400 hover:scale-110 transition-all focus:outline-none"
                  >
                    <Star 
                      className={`w-6 h-6 ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Comment box */}
          <div className="space-y-1.5">
            <label htmlFor="review-comment" className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
              Your Review Comments
            </label>
            <textarea
              id="review-comment"
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you think of the instructor, curriculum, and interactive quizzes?"
              className="w-full px-4 py-2 bg-neutral-50 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmitted}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                isSubmitted 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white'
              }`}
            >
              {isSubmitted ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Review Submitted!</span>
                </>
              ) : (
                <span>Submit Feedback</span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Review list */}
      <div className="space-y-4">
        {reviews.map((rev) => (
          <div 
            key={rev.id} 
            className="p-5 bg-white rounded-2xl border border-neutral-100 shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between">
              {/* Profile and meta info */}
              <div className="flex items-center gap-3">
                <img 
                  src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'} 
                  alt={rev.userName} 
                  className="w-9 h-9 rounded-full bg-neutral-100 object-cover"
                />
                <div>
                  <h5 className="text-xs font-bold text-neutral-900">{rev.userName}</h5>
                  <span className="text-[9px] text-neutral-400 font-bold">{rev.date}</span>
                </div>
              </div>

              {/* Individual stars */}
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-3.5 h-3.5 ${
                      star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-100'
                    }`} 
                  />
                ))}
              </div>
            </div>

            {/* Content comment */}
            <p className="text-xs text-neutral-600 font-medium leading-relaxed">
              {rev.comment}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
