import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  Heart,
  Sparkles,
  ShieldCheck,
  Leaf,
  Smile,
  Flame,
  Plus,
  Building2,
} from 'lucide-react';

interface ClinicLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  customLogoUrl?: string;
  customPrimaryColor?: string;
  customSecondaryColor?: string;
  customIcon?: string;
  customName?: string;
}

export const ClinicLogo: React.FC<ClinicLogoProps> = ({
  size = 'md',
  showText = false,
  className = '',
  customLogoUrl,
  customPrimaryColor,
  customSecondaryColor,
  customIcon,
  customName,
}) => {
  const { activeTenant } = useApp();
  const [imageError, setImageError] = useState(false);

  const logoUrl = customLogoUrl !== undefined ? customLogoUrl : activeTenant?.logoUrl;
  const primaryColor = customPrimaryColor || activeTenant?.primaryColor || '#2563eb';
  const secondaryColor = customSecondaryColor || activeTenant?.secondaryColor || '#0ea5e9';
  const iconKey = customIcon || activeTenant?.logoIcon || 'activity';
  const clinicName = customName || activeTenant?.tradeName || activeTenant?.name || 'ClinicFlow Pro';

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs rounded-md',
    sm: 'w-8 h-8 text-sm rounded-lg',
    md: 'w-10 h-10 text-base rounded-xl',
    lg: 'w-12 h-12 text-lg rounded-2xl',
    xl: 'w-16 h-16 text-xl rounded-2xl',
  };

  const iconSizes = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const renderIcon = () => {
    const isize = iconSizes[size];
    switch (iconKey) {
      case 'heart':
        return <Heart className={`${isize} text-white fill-white/20`} />;
      case 'sparkles':
        return <Sparkles className={`${isize} text-white`} />;
      case 'cross':
        return <Plus className={`${isize} text-white stroke-[3]`} />;
      case 'shield':
        return <ShieldCheck className={`${isize} text-white`} />;
      case 'leaf':
        return <Leaf className={`${isize} text-white`} />;
      case 'smile':
        return <Smile className={`${isize} text-white`} />;
      case 'flame':
        return <Flame className={`${isize} text-white`} />;
      case 'activity':
      default:
        return <Activity className={`${isize} text-white`} />;
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {logoUrl && !imageError ? (
        <div
          className={`${sizeClasses[size]} overflow-hidden bg-white border border-slate-200/80 shadow-xs flex items-center justify-center shrink-0`}
        >
          <img
            src={logoUrl}
            alt={clinicName}
            className="w-full h-full object-contain p-1"
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        <div
          className={`${sizeClasses[size]} flex items-center justify-center shrink-0 shadow-md transition-transform duration-200`}
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            boxShadow: `0 4px 14px -2px ${primaryColor}40`,
          }}
        >
          {renderIcon()}
        </div>
      )}

      {showText && (
        <div className="leading-tight">
          <span className="text-slate-900 font-extrabold text-base font-display block truncate max-w-[200px]">
            {clinicName}
          </span>
          <span
            className="text-xs font-semibold block"
            style={{ color: primaryColor }}
          >
            {activeTenant?.planId ? `Plano ${activeTenant.planId.toUpperCase()}` : 'Gestão Inteligente'}
          </span>
        </div>
      )}
    </div>
  );
};
