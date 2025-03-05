import React from 'react';
import { Link } from 'react-router-dom';

interface CategoryCardProps {
  id: string;
  name: string;
  color: string;
  image?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ id, name, color, image }) => {
  return (
    <Link 
      to={`/category/${id}`}
      className="relative overflow-hidden rounded-lg transition-transform hover:scale-105"
      style={{ backgroundColor: color, height: '200px' }}
    >
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        <h3 className="text-white text-2xl font-bold">{name}</h3>
      </div>
      {image && (
        <div 
          className="absolute bottom-0 right-0 w-32 h-32 transform rotate-25 translate-x-6 translate-y-6"
          style={{ 
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
          }}
        />
      )}
    </Link>
  );
};

export default CategoryCard;