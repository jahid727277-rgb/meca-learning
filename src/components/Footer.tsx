import React from 'react';
import { 
  Facebook, 
  Youtube, 
  Instagram, 
  MessageCircle, 
  Mail, 
  Phone, 
  GraduationCap
} from 'lucide-react';

export const footerContent = {
  about: {
    title: "About Us - Meca Learning",
    content: "Welcome to Meca Learning, a premier e-learning platform dedicated to revolutionizing how people learn Artificial Intelligence. We specialize in cutting-edge AI courses, including Prompt Engineering, Generative AI tools, and practical Machine Learning applications. Our mission is to make advanced AI education accessible, practical, and career-focused for students and professionals in Bangladesh and beyond."
  },
  privacy: {
    title: "Privacy Policy",
    content: "At Meca Learning, your privacy is our top priority. We collect minimal personal data—such as your name, email address, and phone number—solely for course enrollment and providing support. We strictly do not sell, rent, or share your personal information with any third-party marketing agencies."
  },
  terms: {
    title: "Terms and Conditions",
    content: "By enrolling in any AI course on Meca Learning, you agree to these terms: All course content, videos, and materials are the intellectual property of Meca Learning and are strictly for personal, non-commercial educational use. Account sharing, downloading, recording, or unauthorized redistribution of our course materials is strictly prohibited and will lead to legal action and immediate account termination."
  },
  refund: {
    title: "Refund Policy",
    content: "We stand behind the quality of our AI training. We offer a 100% money-back guarantee within 7 days of purchase under the condition that the student has consumed less than 20% of the course content. To request a refund, please contact us at mecalearing.contact@gmail.com with your purchase receipt. Refund requests made after 7 days or for courses with more than 20% completion are non-refundable."
  }
};

interface FooterProps {
  onNavigate: (view: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-black text-white py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Top Section */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-10 h-10 text-white" />
            <h2 className="text-3xl font-bold">Meca Learning</h2>
          </div>
          
          <div className="flex gap-4">
            <a href="https://www.facebook.com/share/1NeS4CBe6R/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-orange-500 transition-colors">
              <Facebook className="w-6 h-6" />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="text-white hover:text-orange-500 transition-colors">
              <Youtube className="w-6 h-6" />
            </a>
            <a href="https://www.instagram.com/meca_learning/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-orange-500 transition-colors">
              <Instagram className="w-6 h-6" />
            </a>
            <a href="https://wa.me/8801611799963" target="_blank" rel="noopener noreferrer" className="text-white hover:text-orange-500 transition-colors">
              <MessageCircle className="w-6 h-6" />
            </a>
          </div>
        </div>

        {/* Middle Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4 border-b border-white pb-2 inline-block">তথ্যসমূহ</h3>
            <ul className="space-y-2">
              {Object.keys(footerContent).map((key) => (
                <li key={key}>
                  <button 
                    onClick={() => onNavigate(key)}
                    className="text-white hover:text-orange-500 transition-colors text-left flex items-center gap-2"
                  >
                    <span>{'>'}</span> {key.charAt(0).toUpperCase() + key.slice(1)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 border-b border-white pb-2 inline-block">যোগাযোগ</h3>
            <ul className="space-y-3 text-neutral-400">
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-white" />
                <a href="mailto:mecalearing.contact@gmail.com" className="hover:text-orange-500">mecalearing.contact@gmail.com</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-white" />
                <a href="tel:+8801611799963" className="hover:text-orange-500">01611799963</a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-white" />
                <span>01611799963</span>
              </li>
              <li className="flex items-center gap-3">
                <Facebook className="w-5 h-5 text-white" />
                <span>Meca Learning</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/20 text-center">
        <p className="text-white/60">Copyright © 2026 Meca Learning. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
