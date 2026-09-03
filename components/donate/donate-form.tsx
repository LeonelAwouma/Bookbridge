'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Loader2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LocationPicker, type LocationValue } from '@/components/location/location-picker'
import { createBookAction, attachBookImagesAction } from '@/lib/actions/books'
import { createClient } from '@/lib/supabase/client'
import { compressImage, randomFileName } from '@/lib/images'
import { categoryOptions, conditionOptions, educationLevelOptions, languageOptions } from '@/lib/data/taxonomy'
import type { BookCategory, BookCondition, EducationLevel } from '@/lib/supabase/types'
import { useI18n } from '@/lib/i18n/provider'

interface DonateFormProps {
  userId: string
  initialLocation: LocationValue
  organizations: { id: string; name: string }[]
  prefill?: { category?: BookCategory; educationLevel?: EducationLevel; subject?: string }
}

export function DonateForm({ userId, initialLocation, organizations, prefill }: DonateFormProps) {
  const { t, dict } = useI18n()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [isbn, setIsbn] = useState('')
  const [category, setCategory] = useState<BookCategory>(prefill?.category ?? 'other')
  const [subject, setSubject] = useState(prefill?.subject ?? '')
  const [educationLevel, setEducationLevel] = useState<EducationLevel>(prefill?.educationLevel ?? 'all_levels')
  const [language, setLanguage] = useState('fr')
  const [condition, setCondition] = useState<BookCondition>('good')
  const [quantity, setQuantity] = useState(1)
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState<LocationValue>(initialLocation)
  const [pickupAvailable, setPickupAvailable] = useState(true)
  const [dropoffAvailable, setDropoffAvailable] = useState(false)
  const [donorSource, setDonorSource] = useState<string>('individual')

  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)

  async function onFilesSelected(fileList: FileList | null) {
    if (!fileList) return
    const files = Array.from(fileList).slice(0, 5 - photos.length)
    const compressed = await Promise.all(files.map(compressImage))
    setPhotos((prev) => [...prev, ...compressed.map((file) => ({ file, preview: URL.createObjectURL(file) }))])
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError(t('donate.titleError'))
      return
    }
    if (!location.country || !location.city) {
      setError(t('donate.locationError'))
      return
    }
    if (!pickupAvailable && !dropoffAvailable) {
      setError(t('donate.handoverError'))
      return
    }

    setError(null)
    setSubmitting(true)

    const result = await createBookAction({
      donorProfileId: donorSource === 'individual' ? userId : null,
      organizationId: donorSource === 'individual' ? null : donorSource,
      title: title.trim(),
      author,
      isbn,
      category,
      subject,
      educationLevel,
      language,
      condition,
      quantity,
      description,
      ...location,
      pickupAvailable,
      dropoffAvailable,
    })

    if (result.error || !result.bookId) {
      setError(result.error ?? 'Something went wrong. Please try again.')
      setSubmitting(false)
      return
    }

    if (photos.length > 0) {
      setUploadStatus(t('donate.uploading', { done: 0, total: photos.length }))
      const supabase = createClient()
      const urls: string[] = []
      for (let i = 0; i < photos.length; i++) {
        const fileName = randomFileName(photos[i].file.name)
        const path = `${userId}/${result.bookId}/${fileName}`
        const { error: uploadError } = await supabase.storage.from('book-images').upload(path, photos[i].file)
        if (!uploadError) {
          const { data } = supabase.storage.from('book-images').getPublicUrl(path)
          urls.push(data.publicUrl)
        }
        setUploadStatus(t('donate.uploading', { done: i + 1, total: photos.length }))
      }
      if (urls.length > 0) await attachBookImagesAction(result.bookId, urls)
    }

    router.push(`/books/${result.bookId}?donated=1`)
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      {organizations.length > 0 && (
        <section className="flex flex-col gap-1.5">
          <Label htmlFor="donorSource">{t('donate.donatingAs')}</Label>
          <Select value={donorSource} onValueChange={(v) => setDonorSource(v ?? 'individual')}>
            <SelectTrigger id="donorSource" className="w-full sm:w-80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">{t('donate.myself')}</SelectItem>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="font-serif text-xl">{t('donate.bookInformation')}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="title">{t('donate.title')} *</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Mathematics Form 4" autoFocus required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="author">{t('donate.author')}</Label>
            <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="isbn">{t('donate.isbnOptional')}</Label>
            <Input id="isbn" value={isbn} onChange={(e) => setIsbn(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category">{t('common.category')}</Label>
            <Select value={category} onValueChange={(v) => setCategory((v as BookCategory) ?? 'other')}>
              <SelectTrigger id="category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions(dict).map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="subject">{t('donate.schoolSubjectOptional')}</Label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Algebra" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="educationLevel">{t('common.educationLevel')}</Label>
            <Select value={educationLevel} onValueChange={(v) => setEducationLevel((v as EducationLevel) ?? 'all_levels')}>
              <SelectTrigger id="educationLevel" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {educationLevelOptions(dict).map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="language">{t('common.language')}</Label>
            <Select value={language} onValueChange={(v) => setLanguage(v ?? 'fr')}>
              <SelectTrigger id="language" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languageOptions(dict).map((opt) => (
                  <SelectItem key={opt.code} value={opt.code}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="condition">{t('common.condition')}</Label>
            <Select value={condition} onValueChange={(v) => setCondition((v as BookCondition) ?? 'good')}>
              <SelectTrigger id="condition" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {conditionOptions(dict).map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="quantity">{t('common.quantity')}</Label>
            <Input id="quantity" type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">{t('donate.descriptionOptional')}</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('donate.descriptionPlaceholder')} />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-serif text-xl">{t('donate.photos')}</h2>
        <div className="flex flex-wrap gap-3">
          {photos.map((photo, index) => (
            <div key={photo.preview} className="relative size-24 overflow-hidden rounded-lg ring-1 ring-border">
              <Image src={photo.preview} alt="" fill className="object-cover" unoptimized />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                aria-label="Remove photo"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {photos.length < 5 && (
            <label className="flex size-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground hover:bg-muted">
              <Upload size={18} />
              <span className="text-[10px]">{t('donate.addPhoto')}</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFilesSelected(e.target.files)} />
            </label>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{t('donate.photosHint')}</p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-serif text-xl">{t('donate.locationAndHandover')}</h2>
        <LocationPicker value={location} onChange={setLocation} />

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={pickupAvailable} onCheckedChange={(v) => setPickupAvailable(!!v)} />
            {t('donate.pickupOption')}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={dropoffAvailable} onCheckedChange={(v) => setDropoffAvailable(!!v)} />
            {t('donate.dropoffOption')}
          </label>
        </div>
      </section>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {uploadStatus && <p className="text-sm text-muted-foreground">{uploadStatus}</p>}

      <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
        {submitting && <Loader2 className="animate-spin" size={16} />}
        {t('home.ctaDonate')}
      </Button>
    </form>
  )
}
