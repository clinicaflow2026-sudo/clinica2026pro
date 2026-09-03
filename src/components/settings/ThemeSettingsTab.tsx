import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { ClinicLogo } from '../common/ClinicLogo';
import {
  Palette,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Eye,
  Sliders,
  Check,
  Smartphone,
  Layout,
  FileText,
  Calendar,
  AlertCircle,
  HelpCircle,
  Trash2,
  ExternalLink,
  Sun,
  Moon,
} from 'lucide-react';
import { THEME_PRESETS, LOGO_ICON_OPTIONS, getContrastTextColor } from '../../lib/themeUtils';

export const ThemeSettingsTab: React.FC = () => {
  const { activeTenant, updateTenantInfo } = useApp();
  const {
    primaryColor,
    secondaryColor,
    accentColor,
    logoUrl,
    logoIcon,
    themePreset,
    isDarkMode,
    toggleDarkMode,
    setDarkMode,
    updateTheme,
    applyPreset,
    setClinicLogo,
    setLogoIcon,
  } = useTheme();

  const [customPrimary, setCustomPrimary] = useState(primaryColor);
  const [customSecondary, setCustomSecondary] = useState(secondaryColor);
  const [customAccent, setCustomAccent] = useState(accentColor);
  const [customLogoUrlInput, setCustomLogoUrlInput] = useState(logoUrl || '');
  const [selectedIcon, setSelectedIcon] = useState(logoIcon || 'activity');
  const [activePresetId, setActivePresetId] = useState(themePreset || 'ocean');
  const [showToast, setShowToast] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if activeTenant changes
  React.useEffect(() => {
    setCustomPrimary(activeTenant?.primaryColor || '#2563eb');
    setCustomSecondary(activeTenant?.secondaryColor || '#0ea5e9');
    setCustomAccent(activeTenant?.accentColor || '#38bdf8');
    setCustomLogoUrlInput(activeTenant?.logoUrl || '');
    setSelectedIcon(activeTenant?.logoIcon || 'activity');
    setActivePresetId(activeTenant?.themePreset || 'ocean');
  }, [activeTenant]);

  const triggerSaveToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleSelectPreset = (preset: typeof THEME_PRESETS[0]) => {
    setActivePresetId(preset.id);
    setCustomPrimary(preset.primaryColor);
    setCustomSecondary(preset.secondaryColor);
    setCustomAccent(preset.accentColor);

    updateTheme({
      primaryColor: preset.primaryColor,
      secondaryColor: preset.secondaryColor,
      accentColor: preset.accentColor,
      themePreset: preset.id,
    });

    triggerSaveToast();
  };

  const handleApplyCustomColors = () => {
    updateTheme({
      primaryColor: customPrimary,
      secondaryColor: customSecondary,
      accentColor: customAccent,
      themePreset: 'custom',
    });
    setActivePresetId('custom');
    triggerSaveToast();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('O arquivo de imagem deve ter no máximo 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setCustomLogoUrlInput(base64);
        setClinicLogo(base64);
        triggerSaveToast();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert('O arquivo de imagem deve ter no máximo 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setCustomLogoUrlInput(base64);
        setClinicLogo(base64);
        triggerSaveToast();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlLogoSave = () => {
    setClinicLogo(customLogoUrlInput.trim() ? customLogoUrlInput.trim() : undefined);
    triggerSaveToast();
  };

  const handleRemoveLogo = () => {
    setCustomLogoUrlInput('');
    setClinicLogo(undefined);
    triggerSaveToast();
  };

  const handleIconSelect = (iconKey: string) => {
    setSelectedIcon(iconKey);
    setLogoIcon(iconKey);
    triggerSaveToast();
  };

  const contrastColor = getContrastTextColor(customPrimary);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div
        className="p-6 rounded-2xl border text-white relative overflow-hidden shadow-lg transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, ${customPrimary} 0%, ${customSecondary} 100%)`,
          borderColor: `${customPrimary}80`,
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-white/20 backdrop-blur-xs tracking-wider">
              <Sparkles className="w-3 h-3" /> Gestor de Identidade Visual
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
              Tema e Cores da Clínica
            </h2>
            <p className="text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed">
              Personalize o logotipo, cores primárias e secundárias do sistema. A identidade é aplicada
              dinamicamente na Navbar, Sidebar, App do Paciente (PWA), recibos e prontuários.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {showToast && (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg animate-in fade-in slide-in-from-bottom-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Tema atualizado com sucesso!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns (Controls + Live Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Theme Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Logo & Visual Symbol */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-brand-primary" />
                  Logo da Clínica & Símbolo
                </h3>
                <p className="text-slate-500 text-xs">
                  Faça o upload do logo oficial ou selecione um ícone de especialidade.
                </p>
              </div>
              {logoUrl && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remover Logo
                </button>
              )}
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-brand-primary bg-brand-primary-light/50'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/svg+xml, image/webp"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs transition"
                  style={{
                    backgroundColor: `${customPrimary}15`,
                    color: customPrimary,
                  }}
                >
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Clique para enviar ou arraste a imagem do logo aqui
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    PNG, SVG, JPG ou WebP (Recomendado fundo transparente, máx 2MB)
                  </p>
                </div>
              </div>
            </div>

            {/* URL Input Fallback */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ou informe uma URL externa para a imagem do logo:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://exemplo.com/logo.png"
                  value={customLogoUrlInput}
                  onChange={(e) => setCustomLogoUrlInput(e.target.value)}
                  className="flex-1 text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 ring-brand-primary text-slate-800 transition"
                />
                <button
                  type="button"
                  onClick={handleUrlLogoSave}
                  className="px-4 py-2.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition"
                >
                  Aplicar URL
                </button>
              </div>
            </div>

            {/* Stylized Specialty Icons Grid */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Ícone Padrão para Clínicas sem Logo em Imagem:
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {LOGO_ICON_OPTIONS.map((opt) => {
                  const isSelected = selectedIcon === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleIconSelect(opt.id)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition text-center ${
                        isSelected
                          ? 'border-brand-primary bg-brand-primary-light font-bold text-brand-primary ring-2 ring-brand-primary/30'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shadow-2xs"
                        style={{
                          background: isSelected
                            ? `linear-gradient(135deg, ${customPrimary} 0%, ${customSecondary} 100%)`
                            : '#f1f5f9',
                          color: isSelected ? '#ffffff' : '#64748b',
                        }}
                      >
                        <ClinicLogo
                          size="xs"
                          customIcon={opt.id}
                          customPrimaryColor={isSelected ? customPrimary : '#64748b'}
                          customSecondaryColor={isSelected ? customSecondary : '#94a3b8'}
                          customLogoUrl=""
                        />
                      </div>
                      <span className="text-[10px] truncate w-full">{opt.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section: Dark Mode / Modo Noturno */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {isDarkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  Tema Visual do Sistema (Modo Escuro / Claro)
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  Alterne entre a interface diurna e a experiência escura para conforto visual em períodos noturnos.
                </p>
              </div>

              {/* Status Pill */}
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  isDarkMode
                    ? 'bg-slate-800 text-amber-300 border border-slate-700'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {isDarkMode ? 'Modo Escuro Ativo' : 'Modo Claro Ativo'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Light Mode Card */}
              <button
                type="button"
                onClick={() => {
                  setDarkMode(false);
                  triggerSaveToast();
                }}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  !isDarkMode
                    ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/30 ring-2 ring-teal-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Tema Claro</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Padrão diurno de alta legibilidade</p>
                  </div>
                </div>
                {!isDarkMode && (
                  <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                )}
              </button>

              {/* Dark Mode Card */}
              <button
                type="button"
                onClick={() => {
                  setDarkMode(true);
                  triggerSaveToast();
                }}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isDarkMode
                    ? 'border-amber-500 bg-slate-800/90 text-white ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-300 border border-slate-700 flex items-center justify-center font-bold shrink-0">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Tema Escuro (Noturno)</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Protege a visão em consultas noturnas</p>
                  </div>
                </div>
                {isDarkMode && (
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                )}
              </button>
            </div>
          </div>

          {/* Section 2: Preset Themes */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-brand-primary" />
                Paletas Clínicas Pré-configuradas (1-Clique)
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Selecione combinações de cores harmonizadas criadas para especialidades de saúde e bem-estar.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {THEME_PRESETS.map((p) => {
                const isSelected = activePresetId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-slate-900 bg-slate-50 shadow-xs ring-2 ring-slate-900/10'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-white'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{p.name}</span>
                        {isSelected && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-slate-900 text-white">
                            Ativo
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{p.description}</p>
                    </div>

                    {/* Color Swatches */}
                    <div className="flex items-center -space-x-1.5 pl-2 shrink-0">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow-xs"
                        style={{ backgroundColor: p.primaryColor }}
                        title={`Primária: ${p.primaryColor}`}
                      />
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow-xs"
                        style={{ backgroundColor: p.secondaryColor }}
                        title={`Secundária: ${p.secondaryColor}`}
                      />
                      <div
                        className="w-5 h-5 rounded-full border-2 border-white shadow-xs"
                        style={{ backgroundColor: p.accentColor }}
                        title={`Destaque: ${p.accentColor}`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Custom Hex Color Pickers */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-primary" />
                Personalização Fina de Cores (Hexadecimal)
              </h3>
              <p className="text-slate-500 text-xs">
                Ajuste manualmente qualquer cor para bater 100% com o manual de identidade da sua clínica.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Primary */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Cor Primária
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customPrimary}
                    onChange={(e) => setCustomPrimary(e.target.value)}
                    className="w-10 h-10 p-1 border border-slate-200 rounded-xl cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={customPrimary}
                    onChange={(e) => setCustomPrimary(e.target.value)}
                    className="w-24 text-xs font-mono font-bold p-2 border border-slate-200 rounded-lg bg-white uppercase text-slate-800"
                  />
                </div>
                <p className="text-[10px] text-slate-400">Botões, links, logos e destaques principais</p>
              </div>

              {/* Secondary */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Cor Secundária
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customSecondary}
                    onChange={(e) => setCustomSecondary(e.target.value)}
                    className="w-10 h-10 p-1 border border-slate-200 rounded-xl cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={customSecondary}
                    onChange={(e) => setCustomSecondary(e.target.value)}
                    className="w-24 text-xs font-mono font-bold p-2 border border-slate-200 rounded-lg bg-white uppercase text-slate-800"
                  />
                </div>
                <p className="text-[10px] text-slate-400">Gradientes, subcabeçalhos e gráficos</p>
              </div>

              {/* Accent */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Cor de Destaque
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customAccent}
                    onChange={(e) => setCustomAccent(e.target.value)}
                    className="w-10 h-10 p-1 border border-slate-200 rounded-xl cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={customAccent}
                    onChange={(e) => setCustomAccent(e.target.value)}
                    className="w-24 text-xs font-mono font-bold p-2 border border-slate-200 rounded-lg bg-white uppercase text-slate-800"
                  />
                </div>
                <p className="text-[10px] text-slate-400">Badges, notificações e tags</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleApplyCustomColors}
                className="px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Aplicar Cores Personalizadas
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Mockup & Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-6 space-y-6">
            {/* Live Component Preview Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-brand-primary" />
                  <h3 className="text-sm font-bold text-slate-900">Simulador Visual em Tempo Real</h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Live CSS Engine
                </span>
              </div>

              {/* Mockup: Navbar Sample */}
              <div className="p-3.5 bg-slate-900 text-white rounded-2xl space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Cabeçalho do Sistema (Navbar)
                </p>
                <div className="flex items-center justify-between bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  <ClinicLogo
                    size="sm"
                    showText={true}
                    customLogoUrl={customLogoUrlInput}
                    customPrimaryColor={customPrimary}
                    customSecondaryColor={customSecondary}
                    customIcon={selectedIcon}
                    customName={activeTenant.name}
                  />
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-2xs"
                      style={{ backgroundColor: customPrimary }}
                    >
                      Online
                    </span>
                  </div>
                </div>
              </div>

              {/* Mockup: Active Sidebar Nav item */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Item de Navegação Ativo (Sidebar)
                </p>
                <div className="bg-slate-900 p-3 rounded-2xl space-y-2">
                  <div
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-white transition shadow-sm"
                    style={{
                      backgroundColor: `${customPrimary}25`,
                      border: `1px solid ${customPrimary}60`,
                      color: '#ffffff',
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4" style={{ color: customPrimary }} />
                      <span>Agenda Central</span>
                    </div>
                    <span
                      className="px-2 py-0.5 text-[10px] font-extrabold text-white rounded-full"
                      style={{ backgroundColor: customPrimary }}
                    >
                      12
                    </span>
                  </div>
                </div>
              </div>

              {/* Mockup: Primary & Secondary Buttons */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Botões e Ações
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold text-white shadow-md transition transform active:scale-95 text-center"
                    style={{
                      backgroundColor: customPrimary,
                      boxShadow: `0 4px 12px ${customPrimary}40`,
                    }}
                  >
                    Novo Agendamento
                  </button>

                  <button
                    type="button"
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition text-center border"
                    style={{
                      color: customPrimary,
                      borderColor: `${customPrimary}50`,
                      backgroundColor: `${customPrimary}08`,
                    }}
                  >
                    Emitir Recibo
                  </button>
                </div>
              </div>

              {/* Mockup: Mini Patient Portal Card */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  App do Paciente (PWA Header)
                </p>
                <div
                  className="p-4 rounded-2xl text-white shadow-md space-y-3"
                  style={{
                    background: `linear-gradient(135deg, ${customPrimary} 0%, ${customSecondary} 100%)`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ClinicLogo
                        size="xs"
                        customLogoUrl={customLogoUrlInput}
                        customPrimaryColor="#ffffff"
                        customSecondaryColor="#ffffff"
                        customIcon={selectedIcon}
                      />
                      <span className="font-bold text-xs">{activeTenant.tradeName || activeTenant.name}</span>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/20 font-bold">PWA</span>
                  </div>
                  <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs">
                    <div>
                      <p className="text-[10px] text-white/80">Próxima Sessão</p>
                      <p className="font-bold text-xs">Hoje, às 15:30</p>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-white text-slate-900 font-extrabold text-[10px]">
                      Confirmada
                    </span>
                  </div>
                </div>
              </div>

              {/* Contrast & Accessibility Badge */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-bold text-slate-700">Contraste de Acessibilidade:</span>
                </div>
                <span className="font-mono text-slate-900 font-bold">
                  {contrastColor === '#ffffff' ? 'Texto Claro (Branco)' : 'Texto Escuro (Preto)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
