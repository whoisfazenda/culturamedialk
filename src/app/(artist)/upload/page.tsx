"use client";

import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Upload, Info, Music, FileAudio, CheckCircle2, Megaphone, ArrowRight, Disc } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { useState, useEffect } from "react";
import { createRelease, checkServerStorage, getCurrentUser } from "../../actions";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/providers/LanguageProvider";
import { Lock } from "lucide-react";
import Link from "next/link";

// --- Validation Schema ---
const releaseSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  version: z.string().optional(),
  type: z.enum(["SINGLE", "EP", "ALBUM"]),
  genre: z.string().min(1, "Выберите жанр"),
  instrumental: z.boolean().default(false),
  language: z.string().optional(),
  releaseDate: z.string().refine((date) => {
    const d = new Date(date);
    const today = new Date();
    const minDate = new Date();
    minDate.setDate(today.getDate() + 7);
    return d >= minDate;
  }, "Дата релиза должна быть не менее чем через 7 дней"),
  mainArtist: z.string().min(1, "Основной артист обязателен"),
  featArtists: z.string().optional(),
  comment: z.string().optional(),
  
  // Promo Fields
  promoRequest: z.boolean().default(false),
  promoReleaseInfo: z.string().optional(),
  promoArtistInfo: z.string().optional(),
  promoMarketingInfo: z.string().optional(),

  tracks: z.array(z.object({
    title: z.string().min(1),
    version: z.string().optional(),
    mainArtist: z.string().optional(),
    featArtists: z.string().optional(),
    composer: z.string().min(1),
    lyricist: z.string().optional(),
    instrumental: z.boolean().default(false),
    ffp: z.boolean().default(false),
    explicit: z.boolean().default(false),
    fileData: z.string().optional(), // Base64 string for audio
    fileName: z.string().optional(),
  })).min(1, "Добавьте хотя бы один трек"),
  coverData: z.string().optional(), // Base64 string for cover
}).superRefine((data, ctx) => {
  if (data.promoRequest) {
    if (!data.promoReleaseInfo || data.promoReleaseInfo.length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Информация о релизе обязательна для промо",
        path: ["promoReleaseInfo"]
      });
    }
  }
});

type ReleaseFormValues = z.infer<typeof releaseSchema>;

const GENRES = [
  "Pop", "Hip-Hop/Rap", "Rock", "Electronic", "R&B/Soul", "Alternative", 
  "Dance", "House", "Techno", "Trance", "Drum & Bass", "Dubstep", 
  "Lo-Fi", "Indie", "Metal", "Punk", "Jazz", "Blues", "Classical", 
  "Folk", "Country", "Reggae", "Latin", "World"
];

const LANGUAGES = [
  "Русский", "English", "Spanish", "French", "German", "Italian", 
  "Chinese", "Japanese", "Korean", "Ukrainian", "Kazakh", "Belarusian"
];

export default function UploadPage() {
  const router = useRouter();
  const { dict } = useLanguage();
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});
  const [trackFiles, setTrackFiles] = useState<{ [key: number]: string }>({});
  const [isStorageFull, setIsStorageFull] = useState(false);
  const [userTariff, setUserTariff] = useState("BASIC");

  useEffect(() => {
    checkServerStorage().then(res => setIsStorageFull(res.isFull));
    getCurrentUser().then(u => setUserTariff(u?.tariff || "BASIC"));
  }, []);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReleaseFormValues>({
    resolver: zodResolver(releaseSchema),
    defaultValues: {
      type: "SINGLE",
      instrumental: false,
      promoRequest: false,
      tracks: [{ title: "", version: "", composer: "", instrumental: false, ffp: false, explicit: false }],
      releaseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tracks",
  });

  const watchedValues = watch();
  const isInstrumentalRelease = watchedValues.instrumental;
  const isPromoRequest = watchedValues.promoRequest;

  const onSubmit: SubmitHandler<ReleaseFormValues> = async (data) => {
    if (!data.coverData) {
      setCoverError("Обложка обязательна");
      return;
    }
    
    const missingFiles = data.tracks.some(t => !t.fileData);
    if (missingFiles) {
      alert(isStorageFull ? "Пожалуйста, укажите ссылки на аудиофайлы" : "Пожалуйста, загрузите аудиофайлы для всех треков (.wav)");
      return;
    }

    try {
      const result = await createRelease(data);
      if (result.success) {
        alert("Релиз успешно отправлен на модерацию!");
        router.push("/releases");
      } else {
        alert("Ошибка при отправке: " + result.error);
      }
    } catch (e) {
      console.error("Upload error:", e);
      alert("Произошла ошибка при отправке. Возможно, файл слишком большой или возникла проблема с сетью.");
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setCoverError(null);
    
    if (file) {
      if (!file.type.startsWith('image/')) {
        setCoverError("Пожалуйста, загрузите изображение (JPG, PNG)");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          if (img.width !== 3000 || img.height !== 3000) {
            setCoverError(`Размер изображения должен быть строго 3000x3000px. Текущий: ${img.width}x${img.height}`);
            setCoverPreview(null);
            setValue("coverData", "");
          } else {
            setCoverPreview(event.target?.result as string);
            setValue("coverData", event.target?.result as string);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTrackUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isWav = file.name.toLowerCase().endsWith('.wav') || file.type === 'audio/wav' || file.type === 'audio/x-wav';
      
      if (!isWav) {
        alert("Только файлы формата .wav");
        e.target.value = ""; 
        return;
      }

      setTrackFiles(prev => ({ ...prev, [index]: file.name }));
      setUploadProgress(prev => ({ ...prev, [index]: 0 }));

      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(prev => ({ ...prev, [index]: progress }));
        if (progress >= 100) clearInterval(interval);
      }, 100);

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setValue(`tracks.${index}.fileData`, base64);
        setValue(`tracks.${index}.fileName`, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-entry">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-textMain">{dict.common.newRelease}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        
        {/* Left Column: Form */}
        <div className="space-y-8">
          
          {/* Block 1: Release Info */}
          <div className="glass p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6 text-primary font-semibold text-xl">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">1</div>
              <h3>{dict.upload.basicInfo}</h3>
            </div>

            <div className="space-y-6">
              <Input
                label={dict.upload.title}
                {...register("title")}
                error={errors.title?.message}
                className="text-lg"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-base font-medium text-textMuted">Тип</label>
                  <Select
                    options={["SINGLE", "EP", "ALBUM"]}
                    value={watchedValues.type}
                    onChange={(val) => setValue("type", val as "SINGLE" | "EP" | "ALBUM")}
                    placeholder="Выберите тип..."
                  />
                </div>
                <Input 
                  label="Версия (опц.)" 
                  placeholder="Remix, Live..." 
                  {...register("version")} 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div className="space-y-2">
                    <label className="text-base font-medium text-textMuted">{dict.upload.genre}</label>
                    <Select
                      options={GENRES}
                      value={watchedValues.genre}
                      onChange={(val) => setValue("genre", val)}
                      placeholder={dict.upload.selectGenre}
                    />
                </div>
                <div className="flex items-center gap-2 h-11 pb-1">
                  {userTariff === 'PREMIUM' ? (
                    <>
                      <input
                        type="checkbox"
                        id="instrumental-release"
                        {...register("instrumental")}
                        className="w-5 h-5 rounded border-border bg-surfaceHover text-primary focus:ring-primary"
                      />
                      <label htmlFor="instrumental-release" className="text-sm text-textMuted cursor-pointer select-none">{dict.upload.instrumental}</label>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 opacity-50 cursor-not-allowed" title="Доступно в Premium">
                      <div className="w-5 h-5 rounded border border-border bg-surfaceHover flex items-center justify-center">
                        <Lock className="w-3 h-3 text-textMuted" />
                      </div>
                      <span className="text-sm text-textMuted">{dict.upload.instrumental}</span>
                    </div>
                  )}
                </div>
              </div>
              {errors.genre && <span className="text-xs text-error">{errors.genre.message}</span>}

              {!isInstrumentalRelease && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-base font-medium text-textMuted">{dict.upload.language}</label>
                  <Select
                    options={LANGUAGES}
                    value={watchedValues.language}
                    onChange={(val) => setValue("language", val)}
                    placeholder={dict.upload.selectLanguage}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-base font-medium text-textMuted">{dict.upload.date}</label>
                <DatePicker
                  value={watchedValues.releaseDate ? new Date(watchedValues.releaseDate) : undefined}
                  onChange={(date) => {
                    const offset = date.getTimezoneOffset() * 60000;
                    const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 10);
                    setValue("releaseDate", localISOTime, { shouldValidate: true });
                  }}
                  minDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
                  placeholder={dict.upload.selectDate}
                />
                {errors.releaseDate && <span className="text-xs text-error">{errors.releaseDate.message}</span>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label={dict.upload.mainArtist}
                    {...register("mainArtist")}
                    error={errors.mainArtist?.message}
                />
                <Input
                    label={dict.upload.featArtists}
                    placeholder={dict.upload.enterComma}
                    {...register("featArtists")}
                />
              </div>
            </div>
          </div>

          {/* Block 2: Tracks */}
          <div className="glass p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-primary font-semibold text-xl">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">2</div>
                <h3>{dict.upload.tracklist}</h3>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => append({ title: "", version: "", composer: "", instrumental: false, ffp: false, explicit: false })}
              >
                <Plus className="w-4 h-4 mr-2" />
                {dict.upload.addTrack}
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="glass p-6 rounded-2xl border border-border relative animate-in fade-in slide-in-from-top-2 transition-all">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-primary font-bold bg-primary/10 px-3 py-1 rounded-lg text-sm">Трек #{index + 1}</span>
                    {fields.length > 1 && (
                      <button type="button" onClick={() => remove(index)} className="text-error hover:opacity-80 p-2 hover:bg-error/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input
                      placeholder={dict.upload.trackTitle}
                      {...register(`tracks.${index}.title`)}
                      error={errors.tracks?.[index]?.title?.message}
                    />
                    <Input
                      placeholder={dict.upload.trackVersion}
                      {...register(`tracks.${index}.version`)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input
                      placeholder={dict.upload.trackMainArtist}
                      {...register(`tracks.${index}.mainArtist`)}
                    />
                    <Input
                      placeholder={dict.upload.trackFeatArtists}
                      {...register(`tracks.${index}.featArtists`)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Input
                      placeholder={dict.upload.composer}
                      {...register(`tracks.${index}.composer`)}
                      error={errors.tracks?.[index]?.composer?.message}
                    />
                    <Input
                      placeholder={dict.upload.lyricist}
                      {...register(`tracks.${index}.lyricist`)}
                    />
                  </div>

                  {/* Audio File Input / Link Input */}
                  {isStorageFull ? (
                    <div className="mb-6">
                      <Input
                        placeholder={dict.upload.linkWav}
                        {...register(`tracks.${index}.fileData`)}
                        onChange={(e) => {
                          setValue(`tracks.${index}.fileData`, e.target.value);
                          setValue(`tracks.${index}.fileName`, "Link provided");
                          setTrackFiles(prev => ({ ...prev, [index]: "Link provided" }));
                        }}
                      />
                      <p className="text-xs text-textMuted mt-2">
                        {dict.upload.serverFull}
                      </p>
                    </div>
                  ) : (
                    <div className="mb-6 bg-surfaceHover rounded-xl p-4 border border-border hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <label className={`flex-shrink-0 flex items-center justify-center px-4 py-3 border rounded-xl cursor-pointer transition-all hover:scale-105 active:scale-95 ${trackFiles[index] ? 'border-success text-success bg-success/10' : 'border-primary text-primary hover:bg-primary/10'}`}>
                            {trackFiles[index] ? <CheckCircle2 className="w-5 h-5" /> : <FileAudio className="w-5 h-5" />}
                            <input
                                type="file"
                                accept=".wav,audio/wav"
                                className="hidden"
                                onChange={(e) => handleTrackUpload(index, e)}
                            />
                        </label>
                        
                        <div className="flex-grow">
                          {trackFiles[index] ? (
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs font-medium">
                                <span className="text-textMain truncate max-w-[200px]">{trackFiles[index]}</span>
                                <span className="text-primary">{uploadProgress[index]}%</span>
                              </div>
                              <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary transition-all duration-300 shadow-[0_0_10px_rgba(124,58,237,0.5)]"
                                  style={{ width: `${uploadProgress[index]}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col justify-center h-full">
                              <span className="text-sm font-medium text-textMain">{dict.upload.uploadWav}</span>
                              <span className="text-xs text-textMuted">44.1kHz / 16bit / Stereo</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`inst-${index}`}
                        {...register(`tracks.${index}.instrumental`)}
                        className="w-5 h-5 rounded border-border bg-surface text-primary focus:ring-primary"
                      />
                      <label htmlFor={`inst-${index}`} className="text-sm text-textMuted cursor-pointer select-none hover:text-textMain transition-colors">{dict.upload.instrumentalLabel}</label>
                    </div>

                    <div className="flex items-center gap-2">
                      {userTariff === 'PREMIUM' ? (
                        <>
                          <input
                            type="checkbox"
                            id={`ffp-${index}`}
                            {...register(`tracks.${index}.ffp`)}
                            className="w-5 h-5 rounded border-border bg-surface text-warning focus:ring-warning"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setValue("promoRequest", false);
                              }
                            }}
                          />
                          <label htmlFor={`ffp-${index}`} className="text-sm text-textMuted cursor-pointer select-none hover:text-textMain transition-colors">FFP Инструментал</label>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 opacity-50 cursor-not-allowed" title="Доступно в Premium">
                          <div className="w-5 h-5 rounded border border-border bg-surface flex items-center justify-center">
                            <Lock className="w-3 h-3 text-textMuted" />
                          </div>
                          <span className="text-sm text-textMuted">FFP Инструментал</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`expl-${index}`}
                        {...register(`tracks.${index}.explicit`)}
                        className="w-5 h-5 rounded border-border bg-surface text-error focus:ring-error"
                      />
                      <label htmlFor={`expl-${index}`} className="text-sm text-textMuted cursor-pointer select-none hover:text-textMain transition-colors">{dict.upload.explicit}</label>
                    </div>
                  </div>
                  
                  {watch(`tracks.${index}.ffp`) && (
                    <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-xs text-yellow-500">
                      При отметке FFP Инструментал из списка площадок исключаются: Youtube, Youtube Music, Youtube Content ID, SoundCloud, Facebook, Instagram, Oculus
                    </div>
                  )}
                </div>
              ))}
            </div>
            {errors.tracks && <p className="text-sm text-error mt-4">{errors.tracks.message}</p>}
          </div>

          {/* Block 3: Promo Request */}
          <div className="glass p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-primary font-semibold text-xl">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">3</div>
                <h3>{dict.upload.promo}</h3>
              </div>
              <div className="flex items-center gap-3 bg-surfaceHover px-4 py-2 rounded-xl border border-border">
                <label htmlFor="promo-request" className="text-sm font-medium text-textMain cursor-pointer select-none">{dict.upload.sendRequest}</label>
                <input
                  type="checkbox"
                  id="promo-request"
                  {...register("promoRequest")}
                  className="w-5 h-5 rounded border-border bg-surface text-primary focus:ring-primary"
                />
              </div>
            </div>

            {isPromoRequest && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2 pt-6 border-t border-border/50">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-textMuted">{dict.upload.pitch} <span className="text-error">*</span></label>
                  <textarea
                    {...register("promoReleaseInfo")}
                    className="w-full min-h-[120px] rounded-xl border border-border bg-surfaceHover px-4 py-3 text-sm text-textMain focus:outline-none focus:ring-2 focus:ring-primary transition-all focus:bg-surface placeholder:text-textMuted"
                    placeholder={dict.upload.pitchPlaceholder}
                  />
                  {errors.promoReleaseInfo && <span className="text-xs text-error">{errors.promoReleaseInfo.message}</span>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-textMuted">{dict.upload.aboutArtist}</label>
                  <textarea
                    {...register("promoArtistInfo")}
                    className="w-full min-h-[100px] rounded-xl border border-border bg-surfaceHover px-4 py-3 text-sm text-textMain focus:outline-none focus:ring-2 focus:ring-primary transition-all focus:bg-surface placeholder:text-textMuted"
                    placeholder={dict.upload.aboutPlaceholder}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-textMuted">{dict.upload.marketing}</label>
                  <textarea
                    {...register("promoMarketingInfo")}
                    className="w-full min-h-[100px] rounded-xl border border-border bg-surfaceHover px-4 py-3 text-sm text-textMain focus:outline-none focus:ring-2 focus:ring-primary transition-all focus:bg-surface placeholder:text-textMuted"
                    placeholder={dict.upload.marketingPlaceholder}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Block 4: Finish */}
          <div className="glass p-8 rounded-3xl">
             <div className="flex items-center gap-3 mb-6 text-primary font-semibold text-xl">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">4</div>
              <h3>{dict.upload.finish}</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-textMuted">{dict.upload.comment}</label>
                <textarea
                  {...register("comment")}
                  className="w-full min-h-[100px] rounded-xl border border-border bg-surfaceHover px-4 py-3 text-sm text-textMain focus:outline-none focus:ring-2 focus:ring-primary transition-all focus:bg-surface placeholder:text-textMuted"
                  placeholder={dict.upload.commentPlaceholder}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Sticky Summary */}
        <div className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            {/* Cover Preview Card */}
            <div className="glass p-6 rounded-3xl text-center relative overflow-hidden group">
              <label className="aspect-square rounded-2xl bg-surfaceHover border-2 border-dashed border-border flex items-center justify-center mb-4 relative overflow-hidden group-hover:border-primary/50 transition-colors cursor-pointer">
                {coverPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-textMuted">
                    <Upload className="w-8 h-8" />
                    <span className="text-xs">{dict.upload.uploadCover}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium text-sm">
                  {dict.upload.changeCover}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverUpload}
                />
              </label>
              
              <div className="space-y-1">
                <h3 className="font-bold text-lg truncate">{watchedValues.title || dict.upload.title}</h3>
                <p className="text-sm text-textMuted truncate">{watchedValues.mainArtist || dict.upload.mainArtist}</p>
              </div>

              {coverError && <div className="mt-4 text-xs text-error bg-error/10 p-2 rounded-lg">{coverError}</div>}
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit(onSubmit)}
              size="lg"
              className="w-full h-14 text-lg shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              disabled={isSubmitting}
            >
              {isSubmitting ? dict.upload.sending : dict.upload.submit}
              {!isSubmitting && <ArrowRight className="ml-2 w-5 h-5" />}
            </Button>

            {/* Checklist */}
            <div className="glass p-6 rounded-3xl space-y-3 text-sm">
              <h4 className="font-bold mb-2">{dict.upload.checklist}</h4>
              <div className={`flex items-center gap-2 ${watchedValues.title && watchedValues.mainArtist ? 'text-success' : 'text-textMuted'}`}>
                <CheckCircle2 className="w-4 h-4" /> {dict.upload.basicInfo}
              </div>
              <div className={`flex items-center gap-2 ${coverPreview ? 'text-success' : 'text-textMuted'}`}>
                <CheckCircle2 className="w-4 h-4" /> {dict.upload.cover}
              </div>
              <div className={`flex items-center gap-2 ${fields.every((_, i) => trackFiles[i]) ? 'text-success' : 'text-textMuted'}`}>
                <CheckCircle2 className="w-4 h-4" /> {dict.upload.audio}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Submit (Fixed Bottom) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-surface/90 backdrop-blur-xl border-t border-border z-40">
          <Button onClick={handleSubmit(onSubmit)} size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? dict.upload.sending : dict.upload.submit}
          </Button>
        </div>

      </form>
    </div>
  );
}