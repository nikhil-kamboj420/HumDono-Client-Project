// components/SEO.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SEO = ({ 
  title = "HumDono - Find Your Perfect Match | Indian Dating App",
  description = "HumDono is India's most trusted dating app. Find meaningful connections, chat with verified profiles, and discover your perfect match nearby.",
  keywords = "dating app, Indian dating, find matches, online dating India",
  image = "https://humdono.in/logo.png",
  url = "https://humdono.in"
}) => {
  const location = useLocation();
  const currentUrl = `${url}${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    updateMetaTag('name', 'description', description);
    updateMetaTag('name', 'keywords', keywords);
    
    // Update Open Graph tags
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:image', image);
    updateMetaTag('property', 'og:url', currentUrl);
    
    // Update Twitter tags
    updateMetaTag('property', 'twitter:title', title);
    updateMetaTag('property', 'twitter:description', description);
    updateMetaTag('property', 'twitter:image', image);
    
    // Update canonical URL
    updateCanonicalUrl(currentUrl);
  }, [title, description, keywords, image, currentUrl]);

  const updateMetaTag = (attribute, key, content) => {
    let element = document.querySelector(`meta[${attribute}="${key}"]`);
    if (element) {
      element.setAttribute('content', content);
    } else {
      element = document.createElement('meta');
      element.setAttribute(attribute, key);
      element.setAttribute('content', content);
      document.head.appendChild(element);
    }
  };

  const updateCanonicalUrl = (url) => {
    let link = document.querySelector('link[rel="canonical"]');
    if (link) {
      link.setAttribute('href', url);
    } else {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', url);
      document.head.appendChild(link);
    }
  };

  return null; // This component doesn't render anything
};

export default SEO;

// Pre-defined SEO configs for different pages
export const seoConfigs = {
  home: {
    title: "HumDono - Find Your Perfect Match | Indian Dating App",
    description: "Join HumDono to find meaningful connections. Chat with verified profiles and discover your perfect match nearby. India's most trusted dating app!",
    keywords: "dating app, Indian dating, find matches, online dating India, meet singles"
  },
  login: {
    title: "Login - HumDono Dating App",
    description: "Login to HumDono and start connecting with amazing people near you. Find your perfect match today!",
    keywords: "login, sign in, HumDono login, dating app login"
  },
  profile: {
    title: "Create Profile - HumDono",
    description: "Create your profile on HumDono and start your journey to find meaningful connections.",
    keywords: "create profile, dating profile, HumDono profile"
  },
  matches: {
    title: "Your Matches - HumDono",
    description: "View your matches and start conversations with people who liked you back!",
    keywords: "matches, dating matches, mutual likes"
  },
  messages: {
    title: "Messages - HumDono",
    description: "Chat with your matches and build meaningful connections.",
    keywords: "messages, chat, dating chat"
  },
  subscription: {
    title: "Premium Subscription - HumDono",
    description: "Unlock premium features with HumDono subscription. Get unlimited likes, messages, and more!",
    keywords: "premium, subscription, dating premium, unlock features"
  }
};
