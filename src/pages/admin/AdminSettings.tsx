import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Zap, Shield, Bot, X, Plus, Save, Loader2, Clock, MessageSquare, AlertTriangle, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AI_MODELS = [
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', provider: 'Google', badge: 'Rápido', badgeColor: 'text-emerald-400', desc: 'Velocidade e eficiência para respostas ágeis' },
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google', badge: 'Balanceado', badgeColor: 'text-sky-400', desc: 'Equilíbrio entre custo e qualidade' },
  { id: 'google/gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', provider: 'Google', badge: 'Econômico', badgeColor: 'text-teal-400', desc: 'Mais rápido e barato, ideal para classificações' },
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google', badge: 'Premium', badgeColor: 'text-amber-400', desc: 'Raciocínio complexo e contexto amplo' },
  { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', provider: 'OpenAI', badge: 'Eficiente', badgeColor: 'text-violet-400', desc: 'Custo-benefício com alta capacidade' },
  { id: 'openai/gpt-5', name: 'GPT-5', provider: 'OpenAI', badge: 'Máximo', badgeColor: 'text-rose-400', desc: 'Melhor precisão e raciocínio avançado' },
];

const TABS = [
  { id: 'personality', label: 'Personalidade', icon: Brain },
  { id: 'escalation', label: 'Escalação', icon: AlertTriangle },
  { id: 'rules', label: 'Regras', icon: Shield },
  { id: 'model', label: 'Modelo IA', icon: Zap },
  { id: 'urgency', label: 'Urgência', icon: Zap },
];

interface AgentConfig {
  id?: string;
  system_prompt: string;
  trigger_analysis: string[];
  trigger_human: string[];
  max_messages_before_escalation: number;
  inactivity_timeout_minutes: number;
  ai_model: string;
  agent_name: string;
  greeting_message: string;
  escalation_message: string;
  wait_message: string;
  updated_at?: string;
}

interface UrgencyConfig {
  id?: string;
  is_enabled: boolean;
  ai_model: string;
  classification_prompt: string;
  criteria_rules: string;
  fallback_urgency: string;
  night_boost: boolean;
  updated_at?: string;
}

function TagInput({ tags, onAdd, onRemove, placeholder }: { tags: string[]; onAdd: (t: string) => void; onRemove: (i: number) => void; placeholder: string }) {
  const [input, setInput] = useState('');

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim().toLowerCase())) {
        onAdd(input.trim().toLowerCase());
      }
      setInput('');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 min-h-[40px]">
        <AnimatePresence mode="popLayout">
          {tags.map((tag, i) => (
            <motion.span
              key={tag}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20"
            >
              {tag}
              <button
                onClick={() => onRemove(i)}
                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          className="flex-1 bg-background/50 border-border/50"
        />
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={() => {
            if (input.trim() && !tags.includes(input.trim().toLowerCase())) {
              onAdd(input.trim().toLowerCase());
              setInput('');
            }
          }}
          className="shrink-0 border-primary/30 hover:bg-primary/10 hover:border-primary/50"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function ModelSelector({ selectedModel, onSelect }: { selectedModel: string; onSelect: (id: string) => void }) {
  return (
    <div className="space-y-3">
      {AI_MODELS.map((model) => {
        const isSelected = selectedModel === model.id;
        return (
          <motion.button
            key={model.id}
            onClick={() => onSelect(model.id)}
            whileTap={{ scale: 0.98 }}
            className={`w-full text-left rounded-xl border p-4 transition-all ${
              isSelected
                ? 'bg-primary/5 border-primary/30 shadow-md shadow-primary/10'
                : 'bg-card border-border/50 hover:border-border'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">{model.name}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${model.badgeColor}`}>
                    {model.badge}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{model.desc}</p>
                <p className="text-[10px] text-muted-foreground/40 font-mono">{model.provider}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                isSelected ? 'border-primary bg-primary' : 'border-border'
              }`}>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full bg-primary-foreground"
                  />
                )}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('personality');
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [urgencyConfig, setUrgencyConfig] = useState<UrgencyConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    const [agentRes, urgencyRes] = await Promise.all([
      supabase.from('agent_config').select('*').limit(1).single(),
      supabase.from('urgency_config').select('*').limit(1).single(),
    ]);

    if (agentRes.data && !agentRes.error) {
      setConfig(agentRes.data as unknown as AgentConfig);
    }
    if (urgencyRes.data && !urgencyRes.error) {
      setUrgencyConfig(urgencyRes.data as unknown as UrgencyConfig);
    }
    setLoading(false);
  };

  const updateConfig = useCallback((field: keyof AgentConfig, value: any) => {
    setConfig(prev => prev ? { ...prev, [field]: value } : prev);
    setSaved(false);
  }, []);

  const updateUrgencyConfig = useCallback((field: keyof UrgencyConfig, value: any) => {
    setUrgencyConfig(prev => prev ? { ...prev, [field]: value } : prev);
    setSaved(false);
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);

    // Save agent config
    const { id, updated_at, ...rest } = config;
    const agentResult = await supabase.from('agent_config').upsert({ ...rest, id, updated_at: new Date().toISOString() } as any);

    let urgencyResult: { error: any } = { error: null };
    if (urgencyConfig) {
      const { id: uId, updated_at: uUpdated, ...uRest } = urgencyConfig;
      urgencyResult = await supabase.from('urgency_config').upsert({ ...uRest, id: uId, updated_at: new Date().toISOString() } as any);
    }

    const hasError = agentResult.error || urgencyResult.error;
    const hasError = results.some(r => r.error);

    if (hasError) {
      toast.error('Erro ao salvar configurações');
      console.error(results.map(r => r.error).filter(Boolean));
    } else {
      toast.success('Configurações salvas com sucesso!');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center text-muted-foreground py-12">
        Erro ao carregar configurações do agente.
      </div>
    );
  }

  const relativeTime = config.updated_at
    ? (() => {
        const diff = Date.now() - new Date(config.updated_at).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'agora mesmo';
        if (mins < 60) return `${mins}min atrás`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h atrás`;
        return `${Math.floor(hrs / 24)}d atrás`;
      })()
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/8 via-card to-card border border-border/50 p-6">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20"
            >
              <Bot className="w-6 h-6 text-primary-foreground" />
            </motion.div>
            <div>
              <h2 className="text-lg font-display font-extrabold text-foreground">
                Configurar Agente IA
              </h2>
              <p className="text-sm text-muted-foreground font-body">
                Personalize comportamento, regras e modelo do assistente
              </p>
            </div>
          </div>
          {relativeTime && (
            <span className="text-xs text-muted-foreground/60 font-body flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Atualizado {relativeTime}
            </span>
          )}
        </div>
      </div>

      {/* Main layout */}
      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Tabs */}
        <div className="lg:w-56 shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <tab.icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-primary' : ''}`} />
                  <span className="relative z-10">{tab.label}</span>
                  {isActive && <ChevronRight className="w-3 h-3 ml-auto relative z-10 hidden lg:block" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'personality' && (
                <div className="space-y-5">
                  <Card className="bg-card border-border/50">
                    <CardContent className="p-5 space-y-5">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Nome do Agente
                        </Label>
                        <Input
                          value={config.agent_name}
                          onChange={(e) => updateConfig('agent_name', e.target.value)}
                          className="bg-background/50 border-border/50 font-medium"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Mensagem de Saudação
                        </Label>
                        <Textarea
                          value={config.greeting_message}
                          onChange={(e) => updateConfig('greeting_message', e.target.value)}
                          rows={2}
                          className="bg-background/50 border-border/50 resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            System Prompt
                          </Label>
                          <span className="text-xs text-muted-foreground/50 font-mono">
                            {config.system_prompt.length} chars
                          </span>
                        </div>
                        <Textarea
                          value={config.system_prompt}
                          onChange={(e) => updateConfig('system_prompt', e.target.value)}
                          rows={12}
                          className="bg-background/50 border-border/50 font-mono text-xs leading-relaxed resize-y"
                        />
                        <p className="text-xs text-muted-foreground/50">
                          Define a personalidade, regras e contexto do agente. Use linguagem clara e direta.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'escalation' && (
                <div className="space-y-5">
                  <Card className="bg-card border-border/50">
                    <CardContent className="p-5 space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Palavras de Análise
                          </Label>
                        </div>
                        <p className="text-xs text-muted-foreground/60">
                          Quando detectadas, o ticket é movido para análise antes de escalar para um humano.
                        </p>
                        <TagInput
                          tags={config.trigger_analysis}
                          onAdd={(t) => updateConfig('trigger_analysis', [...config.trigger_analysis, t])}
                          onRemove={(i) => updateConfig('trigger_analysis', config.trigger_analysis.filter((_, idx) => idx !== i))}
                          placeholder="Ex: reclamação, procon..."
                        />
                      </div>

                      <div className="h-px bg-border/50" />

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-rose-400" />
                          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Palavras de Escalação Humana
                          </Label>
                        </div>
                        <p className="text-xs text-muted-foreground/60">
                          Quando detectadas, o ticket é transferido imediatamente para um atendente.
                        </p>
                        <TagInput
                          tags={config.trigger_human}
                          onAdd={(t) => updateConfig('trigger_human', [...config.trigger_human, t])}
                          onRemove={(i) => updateConfig('trigger_human', config.trigger_human.filter((_, idx) => idx !== i))}
                          placeholder="Ex: falar com atendente..."
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'rules' && (
                <div className="space-y-5">
                  <Card className="bg-card border-border/50">
                    <CardContent className="p-5 space-y-6">
                      <div className="space-y-4">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Máx. mensagens antes de escalar
                        </Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={[config.max_messages_before_escalation]}
                            onValueChange={([v]) => updateConfig('max_messages_before_escalation', v)}
                            min={3}
                            max={30}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-lg font-bold text-primary w-10 text-right tabular-nums">
                            {config.max_messages_before_escalation}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground/50 flex items-center gap-1.5">
                          <MessageSquare className="w-3 h-3" />
                          Após {config.max_messages_before_escalation} mensagens sem resolução, o ticket é escalado para análise.
                        </p>
                      </div>

                      <div className="h-px bg-border/50" />

                      <div className="space-y-4">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Timeout de inatividade (minutos)
                        </Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={[config.inactivity_timeout_minutes]}
                            onValueChange={([v]) => updateConfig('inactivity_timeout_minutes', v)}
                            min={1}
                            max={30}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-lg font-bold text-primary w-10 text-right tabular-nums">
                            {config.inactivity_timeout_minutes}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground/50 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          Após {config.inactivity_timeout_minutes}min sem resposta do atendente, envia mensagem automática.
                        </p>
                      </div>

                      <div className="h-px bg-border/50" />

                      <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Mensagem de Escalação
                        </Label>
                        <Textarea
                          value={config.escalation_message}
                          onChange={(e) => updateConfig('escalation_message', e.target.value)}
                          rows={2}
                          className="bg-background/50 border-border/50 resize-none text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Mensagem de Espera
                        </Label>
                        <Textarea
                          value={config.wait_message}
                          onChange={(e) => updateConfig('wait_message', e.target.value)}
                          rows={2}
                          className="bg-background/50 border-border/50 resize-none text-sm"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'model' && (
                <ModelSelector selectedModel={config.ai_model} onSelect={(id) => updateConfig('ai_model', id)} />
              )}

              {activeTab === 'urgency' && urgencyConfig && (
                <div className="space-y-5">
                  <Card className="bg-card border-border/50">
                    <CardContent className="p-5 space-y-6">
                      {/* Enable/Disable */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-sm font-semibold text-foreground">
                            Classificação Automática
                          </Label>
                          <p className="text-xs text-muted-foreground/60">
                            Quando ativa, a IA analisa cada solicitação e atribui um nível de urgência.
                          </p>
                        </div>
                        <Switch
                          checked={urgencyConfig.is_enabled}
                          onCheckedChange={(v) => updateUrgencyConfig('is_enabled', v)}
                        />
                      </div>

                      <div className="h-px bg-border/50" />

                      {/* Night boost */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-sm font-semibold text-foreground">
                            Boost Noturno
                          </Label>
                          <p className="text-xs text-muted-foreground/60">
                            Aumenta automaticamente a urgência para solicitações feitas entre 00h e 06h.
                          </p>
                        </div>
                        <Switch
                          checked={urgencyConfig.night_boost}
                          onCheckedChange={(v) => updateUrgencyConfig('night_boost', v)}
                        />
                      </div>

                      <div className="h-px bg-border/50" />

                      {/* Fallback urgency */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Urgência Padrão (Fallback)
                        </Label>
                        <p className="text-xs text-muted-foreground/60">
                          Nível usado quando a IA está desativada ou falha.
                        </p>
                        <Select
                          value={urgencyConfig.fallback_urgency}
                          onValueChange={(v) => updateUrgencyConfig('fallback_urgency', v)}
                        >
                          <SelectTrigger className="bg-background/50 border-border/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">🟢 Baixa</SelectItem>
                            <SelectItem value="medium">🟡 Média</SelectItem>
                            <SelectItem value="high">🟠 Alta</SelectItem>
                            <SelectItem value="critical">🔴 Crítica</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="h-px bg-border/50" />

                      {/* Classification prompt */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Prompt de Classificação
                          </Label>
                          <span className="text-xs text-muted-foreground/50 font-mono">
                            {urgencyConfig.classification_prompt.length} chars
                          </span>
                        </div>
                        <Textarea
                          value={urgencyConfig.classification_prompt}
                          onChange={(e) => updateUrgencyConfig('classification_prompt', e.target.value)}
                          rows={3}
                          className="bg-background/50 border-border/50 font-mono text-xs leading-relaxed resize-y"
                        />
                        <p className="text-xs text-muted-foreground/50">
                          Instrução enviada à IA como system prompt para classificar a urgência.
                        </p>
                      </div>

                      <div className="h-px bg-border/50" />

                      {/* Criteria rules */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Critérios de Classificação
                          </Label>
                          <span className="text-xs text-muted-foreground/50 font-mono">
                            {urgencyConfig.criteria_rules.length} chars
                          </span>
                        </div>
                        <Textarea
                          value={urgencyConfig.criteria_rules}
                          onChange={(e) => updateUrgencyConfig('criteria_rules', e.target.value)}
                          rows={5}
                          className="bg-background/50 border-border/50 text-sm leading-relaxed resize-y"
                        />
                        <p className="text-xs text-muted-foreground/50">
                          Regras que a IA segue para determinar o nível de urgência (low, medium, high, critical).
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Model selection for urgency */}
                  <Card className="bg-card border-border/50">
                    <CardContent className="p-5 space-y-4">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Modelo IA para Classificação
                      </Label>
                      <ModelSelector
                        selectedModel={urgencyConfig.ai_model}
                        onSelect={(id) => updateUrgencyConfig('ai_model', id)}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Save bar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky bottom-4 z-10"
      >
        <div className="flex items-center justify-between bg-card/95 backdrop-blur-sm border border-border/50 rounded-xl p-4 shadow-lg">
          <div className="text-xs text-muted-foreground/60 font-body">
            {saved ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-emerald-500 flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3" />
                Alterações salvas
              </motion.span>
            ) : (
              'Alterações não salvas'
            )}
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2 shadow-md shadow-primary/20"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
