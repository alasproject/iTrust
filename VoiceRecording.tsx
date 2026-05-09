import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Square, Loader2, Wand2, X, Type, ChevronRight, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { processarAudio, processarTexto, acordoToContract, type AcordoExtraido } from '../lib/groq';

interface VoiceRecordingProps {
  onCancel: () => void;
  /** Agora recebe o texto transcrito E o acordo extraído */
  onGenerate: (transcript: string, acordo: AcordoExtraido) => void;
  /** Nome do usuário logado para pré-preencher "contratado" */
  userName?: string;
}

type Status = 'idle' | 'recording' | 'transcribing' | 'extracting' | 'done' | 'error';

const STATUS_LABELS: Record<Status, string> = {
  idle:        'Pronto para gravar',
  recording:   'Escutando agora...',
  transcribing:'Transcrevendo com Whisper...',
  extracting:  'Extraindo contrato com IA...',
  done:        'Contrato gerado!',
  error:       'Erro no processamento',
};

export function VoiceRecording({ onCancel, onGenerate, userName = 'Você' }: VoiceRecordingProps) {
  const [mode, setMode]           = useState<'voice' | 'text'>('voice');
  const [status, setStatus]       = useState<Status>('idle');
  const [transcript, setTranscript] = useState('');
  const [timer, setTimer]         = useState(0);
  const [errorMsg, setErrorMsg]   = useState('');
  const [previewAcordo, setPreviewAcordo] = useState<AcordoExtraido | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef        = useRef<Blob[]>([]);
  const timerRef         = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef        = useRef<MediaStream | null>(null);

  // ─── Iniciar gravação real ──────────────────────────────────
  const startRecording = useCallback(async () => {
    setErrorMsg('');
    setTranscript('');
    setPreviewAcordo(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Detecta o melhor formato suportado
      const mimeType = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
      ].find(t => MediaRecorder.isTypeSupported(t)) || '';

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start(250); // coleta chunks a cada 250ms
      setStatus('recording');
      setTimer(0);

      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } catch (err: any) {
      setErrorMsg('Permissão de microfone negada. Verifique as configurações do navegador.');
      setStatus('error');
    }
  }, []);

  // ─── Parar gravação e processar ────────────────────────────
  const stopAndProcess = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;

    if (timerRef.current) clearInterval(timerRef.current);

    recorder.onstop = async () => {
      // Libera microfone
      streamRef.current?.getTracks().forEach(t => t.stop());

      const mimeType  = recorder.mimeType || 'audio/webm';
      const audioBlob = new Blob(chunksRef.current, { type: mimeType });

      if (audioBlob.size < 1000) {
        setErrorMsg('Gravação muito curta. Tente novamente.');
        setStatus('error');
        return;
      }

      try {
        // Passo 1: Whisper
        setStatus('transcribing');
        const { transcricao, acordo } = await processarAudio(audioBlob);
        setTranscript(transcricao);

        // Passo 2: LLaMA (já feito dentro de processarAudio)
        setStatus('extracting');
        await new Promise(r => setTimeout(r, 600)); // pequena pausa visual

        setPreviewAcordo(acordo);
        setStatus('done');
      } catch (err: any) {
        setErrorMsg(err.message || 'Erro ao processar áudio. Tente novamente.');
        setStatus('error');
      }
    };

    recorder.stop();
  }, []);

  // ─── Processar texto manual ─────────────────────────────────
  const processText = useCallback(async () => {
    if (transcript.length < 10) return;
    setErrorMsg('');
    setStatus('extracting');
    try {
      const { acordo } = await processarTexto(transcript);
      setPreviewAcordo(acordo);
      setStatus('done');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao processar texto.');
      setStatus('error');
    }
  }, [transcript]);

  // ─── Confirmar e avançar ────────────────────────────────────
  const handleConfirm = () => {
    if (previewAcordo) {
      onGenerate(transcript, previewAcordo);
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setTranscript('');
    setPreviewAcordo(null);
    setErrorMsg('');
    setTimer(0);
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const isProcessing = status === 'transcribing' || status === 'extracting';
  const isRecording  = status === 'recording';

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100">

      {/* Header */}
      <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Novos Acordos</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            {mode === 'voice' ? 'Whisper + LLaMA · Groq AI' : 'LLaMA · Groq AI'}
          </p>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
          <X className="w-6 h-6" />
        </button>
      </div>

      <main className="flex-1 p-6 flex flex-col space-y-6 overflow-y-auto">

        {/* Toggle de modo — só aparece no idle */}
        {status === 'idle' && (
          <div className="bg-slate-100 p-1 rounded-2xl flex gap-1">
            {(['voice', 'text'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setTranscript(''); }}
                className={cn(
                  'flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                  mode === m ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600',
                )}
              >
                {m === 'voice' ? '🎙 Voz' : '⌨️ Texto'}
              </button>
            ))}
          </div>
        )}

        {/* ── MODO VOZ ── */}
        {mode === 'voice' && status !== 'done' && (
          <div className="flex flex-col items-center space-y-6">
            {/* Botão mic animado */}
            <div className="relative flex items-center justify-center mt-4">
              <AnimatePresence>
                {isRecording && (
                  <>
                    {[1.4, 1.7, 2.0].map((scale, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 1, opacity: 0.4 }}
                        animate={{ scale, opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 2, delay: i * 0.4 }}
                        className="absolute w-32 h-32 rounded-[2.5rem] bg-indigo-200"
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>

              <div className={cn(
                'relative w-32 h-32 rounded-[2.5rem] flex items-center justify-center transition-all duration-500 z-10',
                isRecording    ? 'bg-indigo-600 scale-110 shadow-2xl shadow-indigo-200' :
                isProcessing   ? 'bg-indigo-500' : 'bg-slate-50',
              )}>
                {isProcessing ? (
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                ) : isRecording ? (
                  <Square className="w-10 h-10 text-white fill-white" />
                ) : (
                  <Mic className="w-10 h-10 text-indigo-600" />
                )}
              </div>
            </div>

            {/* Timer e status */}
            <div className="text-center">
              {isRecording && (
                <div className="text-4xl font-mono font-bold text-slate-900 mb-2 tracking-tighter">
                  {formatTime(timer)}
                </div>
              )}
              <p className={cn(
                'text-xs font-bold uppercase tracking-widest',
                isProcessing ? 'text-indigo-500' : isRecording ? 'text-slate-700' : 'text-slate-400',
              )}>
                {STATUS_LABELS[status]}
              </p>
            </div>

            {/* Ondas de áudio */}
            {isRecording && (
              <div className="flex items-end gap-1 h-8 w-full max-w-xs">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [4, Math.random() * 28 + 4, 4] }}
                    transition={{ repeat: Infinity, duration: 0.4 + Math.random() * 0.3, delay: i * 0.04 }}
                    className="w-full rounded-full bg-indigo-400"
                  />
                ))}
              </div>
            )}

            {/* Progresso de processamento */}
            {isProcessing && (
              <div className="w-full space-y-3 mt-2">
                {[
                  { label: 'Transcrição Whisper',  active: status === 'transcribing' || status === 'extracting' },
                  { label: 'Extração LLaMA 3.3',    active: status === 'extracting' },
                ].map(({ label, active }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                      active ? 'border-indigo-500' : 'border-slate-200',
                    )}>
                      {active && <Loader2 className="w-3 h-3 text-indigo-500 animate-spin" />}
                    </div>
                    <span className={cn('text-xs font-semibold', active ? 'text-indigo-600' : 'text-slate-300')}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MODO TEXTO ── */}
        {mode === 'text' && status !== 'done' && (
          <div className="space-y-4">
            <div className="bg-indigo-50/50 p-5 rounded-2xl border-2 border-dashed border-indigo-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white p-2 rounded-xl shadow-sm"><Type className="w-4 h-4 text-indigo-600" /></div>
                <h3 className="font-bold text-indigo-900 text-sm">Descreva o Acordo</h3>
              </div>
              <p className="text-xs text-indigo-700 leading-relaxed font-medium">
                Escreva livremente: o que será feito, valor, prazo e quem está envolvido. A IA extrai o contrato automaticamente.
              </p>
            </div>
          </div>
        )}

        {/* Textarea — transcrição ou texto manual */}
        {status !== 'done' && (
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              {mode === 'voice' ? 'Transcrição' : 'Seu Texto'}
            </label>
            <div className="relative">
              <textarea
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
                disabled={isRecording || isProcessing}
                placeholder={
                  mode === 'voice'
                    ? 'A transcrição aparecerá aqui após parar a gravação...'
                    : 'Ex: Criação de site para Artur Lima, R$ 2.000, entrega em 20 dias, 50% via Escrow...'
                }
                className="w-full bg-slate-50 border-none rounded-2xl p-5 font-medium text-slate-800 focus:ring-4 focus:ring-indigo-50 outline-none transition-all h-36 resize-none leading-relaxed text-sm"
              />
              {isRecording && (
                <motion.div
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="absolute right-5 bottom-5 w-2 h-2 bg-indigo-500 rounded-full"
                />
              )}
            </div>
          </div>
        )}

        {/* ── PREVIEW do contrato extraído ── */}
        {status === 'done' && previewAcordo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              Contrato extraído pela IA
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 space-y-3 border border-slate-100">
              {[
                { label: 'Projeto',      value: previewAcordo.titulo_projeto },
                { label: 'Valor',        value: previewAcordo.valor_total },
                { label: 'Prazo',        value: previewAcordo.prazo_estimado },
                { label: 'Contratante',  value: previewAcordo.contratante },
                { label: 'Contratado',   value: previewAcordo.contratado },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start gap-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0 mt-0.5">{label}</span>
                  <span className="text-sm font-semibold text-slate-800 text-right">{value}</span>
                </div>
              ))}

              {previewAcordo.condicoes_entregaveis.length > 0 && (
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Entregáveis</span>
                  <ul className="space-y-1">
                    {previewAcordo.condicoes_entregaveis.map((c, i) => (
                      <li key={i} className="text-xs font-medium text-slate-600 flex gap-2">
                        <span className="text-indigo-400">•</span>{c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {previewAcordo.resumo && (
              <p className="text-xs text-slate-500 leading-relaxed italic px-1">
                "{previewAcordo.resumo}"
              </p>
            )}

            <button
              onClick={handleReset}
              className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest py-2 transition-colors"
            >
              ↩ Tentar novamente
            </button>
          </motion.div>
        )}

        {/* Erro */}
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3 items-start"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-700">Algo deu errado</p>
              <p className="text-xs text-red-500 mt-1">{errorMsg}</p>
              <button onClick={handleReset} className="text-xs font-bold text-red-600 hover:underline mt-2">
                Tentar novamente
              </button>
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer com botão de ação */}
      <div className="p-6 bg-white border-t border-slate-50">
        {status === 'done' ? (
          <button
            onClick={handleConfirm}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-[2rem] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl shadow-indigo-100"
          >
            <ChevronRight className="w-5 h-5" />
            Revisar e Assinar Contrato
          </button>
        ) : mode === 'voice' ? (
          isRecording ? (
            <button
              onClick={stopAndProcess}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-5 rounded-[2rem] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl shadow-red-100"
            >
              <Square className="w-5 h-5 fill-white" />
              Parar e Processar
            </button>
          ) : isProcessing ? (
            <button disabled className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 cursor-not-allowed opacity-80">
              <Loader2 className="w-5 h-5 animate-spin" />
              {STATUS_LABELS[status]}
            </button>
          ) : (
            <button
              onClick={startRecording}
              disabled={status === 'error'}
              className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl shadow-indigo-100 disabled:opacity-50"
            >
              <Mic className="w-5 h-5" />
              Começar Gravação
            </button>
          )
        ) : (
          // Modo texto
          isProcessing ? (
            <button disabled className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 cursor-not-allowed opacity-80">
              <Loader2 className="w-5 h-5 animate-spin" />
              Extraindo com IA...
            </button>
          ) : (
            <button
              onClick={processText}
              disabled={transcript.length < 10}
              className={cn(
                'w-full py-5 rounded-[2rem] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl',
                transcript.length < 10
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                  : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700',
              )}
            >
              <Wand2 className="w-5 h-5" />
              Processar com IA
            </button>
          )
        )}
      </div>
    </div>
  );
}
