'use client';

import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppButton = () => {
  const phoneNumber = '+2348026968067';
  const whatsappLink = `https://wa.me/${phoneNumber.replace('+', '')}?text=Hello%20Flamingo,%20I%20have%20a%20question!`;

  return (
    <motion.a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] text-white p-4 rounded-full shadow-lg hover:from-[#f47a45] hover:to-[#f58c55] dark:hover:from-[#f58c55] dark:hover:to-[#f7a16b] transition-all duration-300 z-50 flex items-center justify-center"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Contact us on WhatsApp"
    >
      <FaWhatsapp size={24} />
    </motion.a>
  );
};

export default WhatsAppButton;