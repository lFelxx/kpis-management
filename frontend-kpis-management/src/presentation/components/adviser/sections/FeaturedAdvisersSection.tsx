import React from "react";
import { Adviser } from "../../../../core/domain/Adviser/Adviser";
import { motion } from 'framer-motion';
import FeaturedAdviserCard from "../cards/FeaturedAdviserCard";

interface Props {
    bestAdviser: Adviser | null;
    worstAdviser: Adviser | null;
}

const FeaturedAdvisersSection: React.FC<Props> = ({ bestAdviser, worstAdviser }) =>{
    return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <FeaturedAdviserCard adviser={bestAdviser} type="best" />
          <FeaturedAdviserCard adviser={worstAdviser} type="worst" />
        </motion.div>
      );
};

export default FeaturedAdvisersSection;