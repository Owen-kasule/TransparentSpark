import React, { useState, useRef } from 'react';
import {
  Save, ArrowLeft, Plus, Trash2, Upload, X,
  Eye, Palette, Home, User, Mail, FileText, Briefcase,
  Share2, Layout as LayoutIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import GlassCard from '../ui/GlassCard';
import ImageCropperModal from './ImageCropper';
import { useContent } from '../../contexts/SiteContentContext';
import { uploadImage } from '../../lib/contentService';
import { defaultContent } from '../../lib/contentDefaults';
import { TEXT_LIMITS, IMAGE_SPECS } from '../../types/content';
import type {
  SiteSection, ImageSpec,
  HomeContent, AboutContent, ContactContent, ResumeContent,
  ProjectsContent, FooterContent, HeaderContent, SocialContent, ThemeContent,
} from '../../types/content';

// ────────────────────────────────────────────
// Shared helpers
// ────────────────────────────────────────────

const clampLen = (val: string, rule: { min: number; max: number }) =>
  val.length <= rule.max ? val : val.slice(0, rule.max);

const charCount = (val: string, rule: { min: number; max: number }) => {
  const len = val.length;
  const tooShort = len < rule.min;
  const tooLong = len > rule.max;
  return (
    <span className={`text-xs ${tooShort ? 'text-yellow-400' : tooLong ? 'text-red-400' : 'text-white/40'}`}>
      {len}/{rule.max} {tooShort && `(min ${rule.min})`}
    </span>
  );
};

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rule: { min: number; max: number };
  multiline?: boolean;
  placeholder?: string;
  type?: string;
}

const Field: React.FC<FieldProps> = ({ label, value, onChange, rule, multiline, placeholder, type }) => {
  const clamped = (v: string) => onChange(clampLen(v, rule));
  const isValid = value.length >= rule.min && value.length <= rule.max;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-white/80 text-sm font-medium">{label}</label>
        {charCount(value, rule)}
      </div>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => clamped(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-white/40 text-sm focus:outline-none transition-colors ${
            !isValid && value.length > 0 ? 'border-yellow-500/50 focus:border-yellow-400' : 'border-white/20 focus:border-azure-400'
          }`}
        />
      ) : (
        <input
          type={type || 'text'}
          value={value}
          onChange={e => clamped(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-white/40 text-sm focus:outline-none transition-colors ${
            !isValid && value.length > 0 ? 'border-yellow-500/50 focus:border-yellow-400' : 'border-white/20 focus:border-azure-400'
          }`}
        />
      )}
    </div>
  );
};

// ────────────────────────────────────────────
// Image upload field with dimension enforcement
// ────────────────────────────────────────────

interface ImageFieldProps {
  label: string;
  currentUrl: string;
  spec: ImageSpec;
  onUploaded: (url: string) => void;
}

const ImageField: React.FC<ImageFieldProps> = ({ label, currentUrl, spec, onUploaded }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Size check
    if (file.size > spec.maxSizeMB * 1024 * 1024) {
      toast.error(`File too large. Max ${spec.maxSizeMB}MB.`);
      return;
    }

    // Check dimensions — if exact match, skip crop
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        if (img.width === spec.width && img.height === spec.height) {
          // Perfect size, upload directly
          handleDirectUpload(file);
        } else {
          // Needs cropping
          setCropSrc(reader.result as string);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleDirectUpload = async (file: Blob) => {
    setUploading(true);
    try {
      const path = `content/${Date.now()}-${spec.label.replace(/\s+/g, '-').toLowerCase()}.jpg`;
      const url = await uploadImage(file, path);
      onUploaded(url);
      toast.success('Image uploaded!');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onCropDone = async (blob: Blob) => {
    setCropSrc(null);
    await handleDirectUpload(blob);
  };

  return (
    <div className="space-y-2">
      <label className="text-white/80 text-sm font-medium block">{label}</label>
      <p className="text-white/40 text-xs">
        Required: {spec.width} × {spec.height}px &middot; Max {spec.maxSizeMB}MB &middot;
        Images that don't match will be cropped automatically
      </p>
      <div className="flex items-center gap-3">
        {currentUrl && (
          <div className="w-20 h-14 rounded-lg overflow-hidden bg-white/10 border border-white/20 flex-shrink-0">
            <img src={currentUrl} alt="preview" className="w-full h-full object-cover" />
          </div>
        )}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Upload size={14} /> {uploading ? 'Uploading...' : 'Choose Image'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileSelect} />
      </div>

      {cropSrc && (
        <ImageCropperModal
          imageSrc={cropSrc}
          spec={spec}
          onCropComplete={onCropDone}
          onCancel={() => setCropSrc(null)}
        />
      )}
    </div>
  );
};

// ────────────────────────────────────────────
// Section editors
// ────────────────────────────────────────────

// ── Theme Editor ──
const ThemeEditor: React.FC<{
  data: ThemeContent;
  onChange: (d: ThemeContent) => void;
}> = ({ data, onChange }) => {
  const set = (k: keyof ThemeContent, v: string) => onChange({ ...data, [k]: v });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-white/80 text-sm font-medium block">Primary / Accent Color</label>
        <p className="text-white/40 text-xs">
          This color is used throughout the site for buttons, links, accents, and highlights.
        </p>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={data.primaryColor}
            onChange={e => set('primaryColor', e.target.value)}
            className="w-12 h-10 rounded-lg cursor-pointer border border-white/20 bg-transparent"
          />
          <input
            type="text"
            value={data.primaryColor}
            onChange={e => {
              const v = e.target.value;
              if (/^#[0-9a-fA-F]{0,6}$/.test(v)) set('primaryColor', v);
            }}
            className="w-32 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-azure-400"
          />
          <button
            onClick={() => set('primaryColor', defaultContent.theme.primaryColor)}
            className="text-white/50 hover:text-white text-xs underline"
          >
            Reset to default
          </button>
        </div>
      </div>

      <ImageField
        label="Desktop Light Background"
        currentUrl={data.heroDesktopLight}
        spec={IMAGE_SPECS.heroDesktopLight}
        onUploaded={url => set('heroDesktopLight', url)}
      />
      <ImageField
        label="Desktop Dark Background"
        currentUrl={data.heroDesktopDark}
        spec={IMAGE_SPECS.heroDesktopDark}
        onUploaded={url => set('heroDesktopDark', url)}
      />
      <ImageField
        label="Mobile Background"
        currentUrl={data.heroMobile}
        spec={IMAGE_SPECS.heroMobile}
        onUploaded={url => set('heroMobile', url)}
      />
    </div>
  );
};

// ── Home Editor ──
const HomeEditor: React.FC<{
  data: HomeContent;
  onChange: (d: HomeContent) => void;
}> = ({ data, onChange }) => {
  const set = (k: keyof HomeContent, v: any) => onChange({ ...data, [k]: v });
  const T = TEXT_LIMITS;

  return (
    <div className="space-y-6">
      <h3 className="text-white font-semibold border-b border-white/10 pb-2">Hero Section</h3>
      <div className="grid md:grid-cols-3 gap-4">
        <Field label="Greeting" value={data.heroGreeting} onChange={v => set('heroGreeting', v)} rule={T.heroGreeting} placeholder="HI I'M" />
        <Field label="First Name" value={data.heroFirstName} onChange={v => set('heroFirstName', v)} rule={T.heroFirstName} placeholder="OWEN" />
        <Field label="Middle Initial" value={data.heroMiddleInitial} onChange={v => set('heroMiddleInitial', v)} rule={T.heroMiddleInitial} placeholder="K." />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Last Name" value={data.heroLastName} onChange={v => set('heroLastName', v)} rule={T.heroLastName} placeholder="muhereze" />
        <Field label="Subtitle" value={data.heroSubtitle} onChange={v => set('heroSubtitle', v)} rule={T.heroSubtitle} placeholder="A FULL STACK DEVELOPER" />
      </div>
      <Field label="Introduction Text" value={data.heroDescription} onChange={v => set('heroDescription', v)} rule={T.heroDescription} multiline placeholder="I craft digital experiences..." />

      <h3 className="text-white font-semibold border-b border-white/10 pb-2 pt-4">Skills Icons</h3>
      <div className="space-y-3">
        {data.heroSkills.map((skill, i) => (
          <div key={i} className="flex items-center gap-3">
            <select
              value={skill.icon}
              onChange={e => {
                const skills = [...data.heroSkills];
                skills[i] = { ...skills[i], icon: e.target.value };
                set('heroSkills', skills);
              }}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none"
            >
              <option value="code">Code</option>
              <option value="database">Database</option>
              <option value="globe">Globe</option>
              <option value="server">Server</option>
              <option value="smartphone">Mobile</option>
              <option value="cloud">Cloud</option>
            </select>
            <input
              value={skill.label}
              onChange={e => {
                const skills = [...data.heroSkills];
                skills[i] = { ...skills[i], label: clampLen(e.target.value, T.heroSkillLabel) };
                set('heroSkills', skills);
              }}
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-azure-400"
              placeholder="Skill label"
            />
            <button onClick={() => {
              const skills = data.heroSkills.filter((_, j) => j !== i);
              set('heroSkills', skills);
            }} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"><Trash2 size={14} /></button>
          </div>
        ))}
        {data.heroSkills.length < 5 && (
          <button
            onClick={() => set('heroSkills', [...data.heroSkills, { icon: 'code', label: '' }])}
            className="text-azure-400 text-sm flex items-center gap-1 hover:underline"
          ><Plus size={14} /> Add Skill</button>
        )}
      </div>

      <h3 className="text-white font-semibold border-b border-white/10 pb-2 pt-4">CTA Buttons</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Primary Button Text" value={data.ctaPrimaryText} onChange={v => set('ctaPrimaryText', v)} rule={T.ctaButtonText} />
        <Field label="Primary Button Link" value={data.ctaPrimaryLink} onChange={v => set('ctaPrimaryLink', v)} rule={{ min: 1, max: 100 }} placeholder="/contact" />
        <Field label="Secondary Button Text" value={data.ctaSecondaryText} onChange={v => set('ctaSecondaryText', v)} rule={T.ctaButtonText} />
        <Field label="Secondary Button Text (Short)" value={data.ctaSecondaryTextShort} onChange={v => set('ctaSecondaryTextShort', v)} rule={T.ctaButtonText} />
      </div>
      <Field label="Secondary Button Link" value={data.ctaSecondaryLink} onChange={v => set('ctaSecondaryLink', v)} rule={{ min: 1, max: 100 }} placeholder="/resume" />

      <h3 className="text-white font-semibold border-b border-white/10 pb-2 pt-4">Featured Projects Heading</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Title" value={data.featuredTitle} onChange={v => set('featuredTitle', v)} rule={T.featuredTitle} />
        <Field label="Subtitle" value={data.featuredSubtitle} onChange={v => set('featuredSubtitle', v)} rule={T.featuredSubtitle} />
      </div>

      <h3 className="text-white font-semibold border-b border-white/10 pb-2 pt-4">Profile Images</h3>
      <ImageField label="Profile Image (Desktop)" currentUrl={data.profileImageDesktop} spec={IMAGE_SPECS.profileDesktop} onUploaded={url => set('profileImageDesktop', url)} />
      <ImageField label="Profile Image (Mobile)" currentUrl={data.profileImageMobile} spec={IMAGE_SPECS.profileMobile} onUploaded={url => set('profileImageMobile', url)} />
    </div>
  );
};

// ── About Editor ──
const AboutEditor: React.FC<{
  data: AboutContent;
  onChange: (d: AboutContent) => void;
}> = ({ data, onChange }) => {
  const set = (k: keyof AboutContent, v: any) => onChange({ ...data, [k]: v });
  const T = TEXT_LIMITS;

  return (
    <div className="space-y-6">
      <Field label="Page Title" value={data.pageTitle} onChange={v => set('pageTitle', v)} rule={T.pageTitle} />
      <Field label="Story Section Title" value={data.storyTitle} onChange={v => set('storyTitle', v)} rule={T.sectionTitle} />

      <h3 className="text-white font-semibold border-b border-white/10 pb-2">Story Paragraphs</h3>
      {data.storyParagraphs.map((p, i) => (
        <div key={i} className="flex gap-2">
          <div className="flex-1">
            <Field
              label={`Paragraph ${i + 1}`}
              value={p}
              onChange={v => {
                const paras = [...data.storyParagraphs];
                paras[i] = v;
                set('storyParagraphs', paras);
              }}
              rule={T.storyParagraph}
              multiline
            />
          </div>
          {data.storyParagraphs.length > 1 && (
            <button onClick={() => set('storyParagraphs', data.storyParagraphs.filter((_, j) => j !== i))} className="mt-7 p-2 text-red-400 hover:bg-red-500/20 rounded-lg self-start"><Trash2 size={14} /></button>
          )}
        </div>
      ))}
      {data.storyParagraphs.length < 6 && (
        <button onClick={() => set('storyParagraphs', [...data.storyParagraphs, ''])} className="text-azure-400 text-sm flex items-center gap-1 hover:underline"><Plus size={14}/> Add Paragraph</button>
      )}

      <h3 className="text-white font-semibold border-b border-white/10 pb-2 pt-4">Statistics</h3>
      <Field label="Stats Section Title" value={data.statsTitle} onChange={v => set('statsTitle', v)} rule={T.sectionTitle} />
      {data.stats.map((stat, i) => (
        <div key={i} className="grid grid-cols-3 gap-3 items-end">
          <Field label="Label" value={stat.label} onChange={v => {
            const stats = [...data.stats];
            stats[i] = { ...stats[i], label: v };
            set('stats', stats);
          }} rule={T.statLabel} />
          <Field label="Display Value" value={stat.value} onChange={v => {
            const stats = [...data.stats];
            stats[i] = { ...stats[i], value: v };
            set('stats', stats);
          }} rule={T.statValue} />
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="text-white/80 text-sm font-medium block mb-1">Count Target</label>
              <input
                type="number"
                value={stat.target}
                onChange={e => {
                  const stats = [...data.stats];
                  stats[i] = { ...stats[i], target: parseInt(e.target.value) || 0 };
                  set('stats', stats);
                }}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-azure-400"
              />
            </div>
            <button onClick={() => set('stats', data.stats.filter((_, j) => j !== i))} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"><Trash2 size={14} /></button>
          </div>
        </div>
      ))}
      {data.stats.length < 6 && (
        <button onClick={() => set('stats', [...data.stats, { label: '', value: '', target: 0 }])} className="text-azure-400 text-sm flex items-center gap-1 hover:underline"><Plus size={14}/> Add Stat</button>
      )}

      <h3 className="text-white font-semibold border-b border-white/10 pb-2 pt-4">Tech Stack</h3>
      <Field label="Tech Stack Section Title" value={data.techStackTitle} onChange={v => set('techStackTitle', v)} rule={T.sectionTitle} />
      {data.techStack.map((group, gi) => (
        <div key={gi} className="p-4 bg-white/5 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <Field label="Category" value={group.category} onChange={v => {
              const ts = [...data.techStack];
              ts[gi] = { ...ts[gi], category: v };
              set('techStack', ts);
            }} rule={T.skillCategory} />
            <button onClick={() => set('techStack', data.techStack.filter((_, j) => j !== gi))} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"><Trash2 size={14}/></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {group.skills.map((skill, si) => (
              <div key={si} className="flex items-center bg-white/10 rounded-full px-3 py-1 gap-2">
                <input
                  value={skill}
                  onChange={e => {
                    const ts = [...data.techStack];
                    const skills = [...ts[gi].skills];
                    skills[si] = clampLen(e.target.value, T.skillName);
                    ts[gi] = { ...ts[gi], skills };
                    set('techStack', ts);
                  }}
                  className="bg-transparent text-white text-sm w-24 focus:outline-none"
                />
                <button onClick={() => {
                  const ts = [...data.techStack];
                  ts[gi] = { ...ts[gi], skills: ts[gi].skills.filter((_, j) => j !== si) };
                  set('techStack', ts);
                }} className="text-white/40 hover:text-red-400"><X size={12}/></button>
              </div>
            ))}
            <button onClick={() => {
              const ts = [...data.techStack];
              ts[gi] = { ...ts[gi], skills: [...ts[gi].skills, ''] };
              set('techStack', ts);
            }} className="text-azure-400 text-xs flex items-center gap-1 px-3 py-1 rounded-full border border-azure-400/30 hover:bg-azure-400/10"><Plus size={12}/> Skill</button>
          </div>
        </div>
      ))}
      {data.techStack.length < 6 && (
        <button onClick={() => set('techStack', [...data.techStack, { category: '', skills: [] }])} className="text-azure-400 text-sm flex items-center gap-1 hover:underline"><Plus size={14}/> Add Category</button>
      )}
    </div>
  );
};

// ── Contact Editor ──
const ContactEditor: React.FC<{
  data: ContactContent;
  onChange: (d: ContactContent) => void;
}> = ({ data, onChange }) => {
  const set = (k: keyof ContactContent, v: any) => onChange({ ...data, [k]: v });
  const T = TEXT_LIMITS;

  return (
    <div className="space-y-6">
      <Field label="Page Title" value={data.pageTitle} onChange={v => set('pageTitle', v)} rule={T.pageTitle} />
      <Field label="Page Subtitle" value={data.pageSubtitle} onChange={v => set('pageSubtitle', v)} rule={T.pageSubtitle} multiline />
      <Field label="Form Title" value={data.formTitle} onChange={v => set('formTitle', v)} rule={T.sectionTitle} />
      <Field label="Success Title" value={data.successTitle} onChange={v => set('successTitle', v)} rule={T.sectionTitle} />
      <Field label="Success Message" value={data.successMessage} onChange={v => set('successMessage', v)} rule={T.pageSubtitle} multiline />
      <Field label="Recipient Email (where messages go)" value={data.recipientEmail} onChange={v => set('recipientEmail', v)} rule={T.contactValue} type="email" />

      <h3 className="text-white font-semibold border-b border-white/10 pb-2 pt-4">Contact Cards</h3>
      {data.contactInfo.map((info, i) => (
        <div key={i} className="grid grid-cols-4 gap-3 items-end p-3 bg-white/5 rounded-lg">
          <div>
            <label className="text-white/80 text-xs font-medium block mb-1">Icon</label>
            <select
              value={info.icon}
              onChange={e => {
                const ci = [...data.contactInfo];
                ci[i] = { ...ci[i], icon: e.target.value };
                set('contactInfo', ci);
              }}
              className="w-full px-2 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none"
            >
              <option value="mail">Email</option>
              <option value="phone">Phone</option>
              <option value="mapPin">Location</option>
              <option value="globe">Website</option>
            </select>
          </div>
          <Field label="Label" value={info.label} onChange={v => {
            const ci = [...data.contactInfo];
            ci[i] = { ...ci[i], label: v };
            set('contactInfo', ci);
          }} rule={T.contactLabel} />
          <Field label="Value" value={info.value} onChange={v => {
            const ci = [...data.contactInfo];
            ci[i] = { ...ci[i], value: v };
            set('contactInfo', ci);
          }} rule={T.contactValue} />
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Field label="Link (href)" value={info.href} onChange={v => {
                const ci = [...data.contactInfo];
                ci[i] = { ...ci[i], href: v };
                set('contactInfo', ci);
              }} rule={{ min: 1, max: 100 }} />
            </div>
            <button onClick={() => set('contactInfo', data.contactInfo.filter((_, j) => j !== i))} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"><Trash2 size={14}/></button>
          </div>
        </div>
      ))}
      {data.contactInfo.length < 6 && (
        <button onClick={() => set('contactInfo', [...data.contactInfo, { icon: 'mail', label: '', value: '', href: '#' }])} className="text-azure-400 text-sm flex items-center gap-1 hover:underline"><Plus size={14}/> Add Contact Card</button>
      )}
    </div>
  );
};

// ── Resume Editor ──
const ResumeEditor: React.FC<{
  data: ResumeContent;
  onChange: (d: ResumeContent) => void;
}> = ({ data, onChange }) => {
  const T = TEXT_LIMITS;
  const setPersonal = (k: string, v: string) =>
    onChange({ ...data, personal: { ...data.personal, [k]: v } });

  return (
    <div className="space-y-6">
      <h3 className="text-white font-semibold border-b border-white/10 pb-2">Personal Info</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Full Name" value={data.personal.name} onChange={v => setPersonal('name', v)} rule={T.personName} />
        <Field label="Professional Title" value={data.personal.title} onChange={v => setPersonal('title', v)} rule={T.personTitle} />
        <Field label="Email" value={data.personal.email} onChange={v => setPersonal('email', v)} rule={T.contactValue} type="email" />
        <Field label="Phone" value={data.personal.phone} onChange={v => setPersonal('phone', v)} rule={T.contactValue} type="tel" />
        <Field label="Location" value={data.personal.location} onChange={v => setPersonal('location', v)} rule={T.location} />
        <Field label="LinkedIn" value={data.personal.linkedin} onChange={v => setPersonal('linkedin', v)} rule={{ min: 5, max: 200 }} />
      </div>
      <Field label="Professional Summary" value={data.personal.summary} onChange={v => setPersonal('summary', v)} rule={T.summary} multiline />

      <h3 className="text-white font-semibold border-b border-white/10 pb-2 pt-4">Work Experience</h3>
      {data.experience.map((exp, i) => (
        <div key={exp.id} className="p-4 bg-white/5 rounded-lg space-y-3">
          <div className="flex justify-between">
            <span className="text-white font-medium text-sm">Position {i + 1}</span>
            <button onClick={() => onChange({ ...data, experience: data.experience.filter((_, j) => j !== i) })} className="p-1 text-red-400 hover:bg-red-500/20 rounded"><Trash2 size={14}/></button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Company" value={exp.company} onChange={v => {
              const exps = [...data.experience]; exps[i] = { ...exps[i], company: v }; onChange({ ...data, experience: exps });
            }} rule={T.companyName} />
            <Field label="Position" value={exp.position} onChange={v => {
              const exps = [...data.experience]; exps[i] = { ...exps[i], position: v }; onChange({ ...data, experience: exps });
            }} rule={T.jobTitle} />
            <Field label="Duration" value={exp.duration} onChange={v => {
              const exps = [...data.experience]; exps[i] = { ...exps[i], duration: v }; onChange({ ...data, experience: exps });
            }} rule={T.duration} />
            <Field label="Location" value={exp.location} onChange={v => {
              const exps = [...data.experience]; exps[i] = { ...exps[i], location: v }; onChange({ ...data, experience: exps });
            }} rule={T.location} />
          </div>
          <Field label="Description" value={exp.description} onChange={v => {
            const exps = [...data.experience]; exps[i] = { ...exps[i], description: v }; onChange({ ...data, experience: exps });
          }} rule={T.description} multiline />

          <div className="space-y-2">
            <label className="text-white/80 text-sm font-medium">Achievements</label>
            {exp.achievements.map((ach, ai) => (
              <div key={ai} className="flex gap-2">
                <input value={ach} onChange={e => {
                  const exps = [...data.experience];
                  const achs = [...exps[i].achievements];
                  achs[ai] = clampLen(e.target.value, T.achievement);
                  exps[i] = { ...exps[i], achievements: achs };
                  onChange({ ...data, experience: exps });
                }} className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-azure-400" />
                <button onClick={() => {
                  const exps = [...data.experience];
                  exps[i] = { ...exps[i], achievements: exps[i].achievements.filter((_, j) => j !== ai) };
                  onChange({ ...data, experience: exps });
                }} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"><Trash2 size={14}/></button>
              </div>
            ))}
            <button onClick={() => {
              const exps = [...data.experience];
              exps[i] = { ...exps[i], achievements: [...exps[i].achievements, ''] };
              onChange({ ...data, experience: exps });
            }} className="text-azure-400 text-xs flex items-center gap-1 hover:underline"><Plus size={12}/> Achievement</button>
          </div>

          <div className="space-y-2">
            <label className="text-white/80 text-sm font-medium">Technologies</label>
            <div className="flex flex-wrap gap-2">
              {exp.technologies.map((tech, ti) => (
                <div key={ti} className="flex items-center bg-white/10 rounded-full px-3 py-1 gap-2">
                  <input value={tech} onChange={e => {
                    const exps = [...data.experience];
                    const techs = [...exps[i].technologies];
                    techs[ti] = clampLen(e.target.value, T.technology);
                    exps[i] = { ...exps[i], technologies: techs };
                    onChange({ ...data, experience: exps });
                  }} className="bg-transparent text-white text-sm w-24 focus:outline-none" />
                  <button onClick={() => {
                    const exps = [...data.experience];
                    exps[i] = { ...exps[i], technologies: exps[i].technologies.filter((_, j) => j !== ti) };
                    onChange({ ...data, experience: exps });
                  }} className="text-white/40 hover:text-red-400"><X size={12}/></button>
                </div>
              ))}
              <button onClick={() => {
                const exps = [...data.experience];
                exps[i] = { ...exps[i], technologies: [...exps[i].technologies, ''] };
                onChange({ ...data, experience: exps });
              }} className="text-azure-400 text-xs flex items-center gap-1 px-3 py-1 rounded-full border border-azure-400/30 hover:bg-azure-400/10"><Plus size={12}/> Tech</button>
            </div>
          </div>
        </div>
      ))}
      <button onClick={() => onChange({
        ...data,
        experience: [...data.experience, { id: Date.now(), company: '', position: '', duration: '', location: '', description: '', achievements: [], technologies: [] }]
      })} className="text-azure-400 text-sm flex items-center gap-1 hover:underline"><Plus size={14}/> Add Experience</button>

      <h3 className="text-white font-semibold border-b border-white/10 pb-2 pt-4">Education</h3>
      {data.education.map((edu, i) => (
        <div key={edu.id} className="p-4 bg-white/5 rounded-lg space-y-3">
          <div className="flex justify-between">
            <span className="text-white font-medium text-sm">Education {i + 1}</span>
            <button onClick={() => onChange({ ...data, education: data.education.filter((_, j) => j !== i) })} className="p-1 text-red-400 hover:bg-red-500/20 rounded"><Trash2 size={14}/></button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Degree" value={edu.degree} onChange={v => {
              const eds = [...data.education]; eds[i] = { ...eds[i], degree: v }; onChange({ ...data, education: eds });
            }} rule={T.degreeName} />
            <Field label="School" value={edu.school} onChange={v => {
              const eds = [...data.education]; eds[i] = { ...eds[i], school: v }; onChange({ ...data, education: eds });
            }} rule={T.schoolName} />
            <Field label="Duration" value={edu.duration} onChange={v => {
              const eds = [...data.education]; eds[i] = { ...eds[i], duration: v }; onChange({ ...data, education: eds });
            }} rule={T.duration} />
            <Field label="Status/GPA" value={edu.gpa} onChange={v => {
              const eds = [...data.education]; eds[i] = { ...eds[i], gpa: v }; onChange({ ...data, education: eds });
            }} rule={{ min: 1, max: 30 }} />
          </div>
        </div>
      ))}
      <button onClick={() => onChange({
        ...data,
        education: [...data.education, { id: Date.now(), degree: '', school: '', duration: '', location: '', gpa: '', relevantCourses: [] }]
      })} className="text-azure-400 text-sm flex items-center gap-1 hover:underline"><Plus size={14}/> Add Education</button>

      <h3 className="text-white font-semibold border-b border-white/10 pb-2 pt-4">Skills</h3>
      <div className="space-y-4">
        <div className="p-4 bg-white/5 rounded-lg space-y-3">
          <label className="text-white/80 text-sm font-medium">Technical Skills</label>
          {data.skills.technical.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input value={s} onChange={e => {
                const tech = [...data.skills.technical];
                tech[i] = clampLen(e.target.value, T.achievement);
                onChange({ ...data, skills: { ...data.skills, technical: tech } });
              }} className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-azure-400" />
              <button onClick={() => {
                onChange({ ...data, skills: { ...data.skills, technical: data.skills.technical.filter((_, j) => j !== i) } });
              }} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"><Trash2 size={14}/></button>
            </div>
          ))}
          <button onClick={() => onChange({ ...data, skills: { ...data.skills, technical: [...data.skills.technical, ''] } })} className="text-azure-400 text-xs flex items-center gap-1 hover:underline"><Plus size={12}/> Add Skill</button>
        </div>

        <div className="p-4 bg-white/5 rounded-lg space-y-3">
          <label className="text-white/80 text-sm font-medium">Soft Skills</label>
          {data.skills.soft.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input value={s} onChange={e => {
                const soft = [...data.skills.soft];
                soft[i] = clampLen(e.target.value, T.achievement);
                onChange({ ...data, skills: { ...data.skills, soft } });
              }} className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-azure-400" />
              <button onClick={() => {
                onChange({ ...data, skills: { ...data.skills, soft: data.skills.soft.filter((_, j) => j !== i) } });
              }} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"><Trash2 size={14}/></button>
            </div>
          ))}
          <button onClick={() => onChange({ ...data, skills: { ...data.skills, soft: [...data.skills.soft, ''] } })} className="text-azure-400 text-xs flex items-center gap-1 hover:underline"><Plus size={12}/> Add Skill</button>
        </div>
      </div>

      <h3 className="text-white font-semibold border-b border-white/10 pb-2 pt-4">Certifications</h3>
      {data.certifications.map((cert, i) => (
        <div key={i} className="grid grid-cols-4 gap-3 items-end">
          <Field label="Certification" value={cert.name} onChange={v => {
            const certs = [...data.certifications]; certs[i] = { ...certs[i], name: v }; onChange({ ...data, certifications: certs });
          }} rule={T.certName} />
          <Field label="Issuer" value={cert.issuer} onChange={v => {
            const certs = [...data.certifications]; certs[i] = { ...certs[i], issuer: v }; onChange({ ...data, certifications: certs });
          }} rule={T.certIssuer} />
          <Field label="Date" value={cert.date} onChange={v => {
            const certs = [...data.certifications]; certs[i] = { ...certs[i], date: v }; onChange({ ...data, certifications: certs });
          }} rule={T.certDate} />
          <button onClick={() => onChange({ ...data, certifications: data.certifications.filter((_, j) => j !== i) })} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg self-end"><Trash2 size={14}/></button>
        </div>
      ))}
      <button onClick={() => onChange({ ...data, certifications: [...data.certifications, { name: '', issuer: '', date: '' }] })} className="text-azure-400 text-sm flex items-center gap-1 hover:underline"><Plus size={14}/> Add Certification</button>
    </div>
  );
};

// ── Projects Editor ──
const ProjectsEditor: React.FC<{
  data: ProjectsContent;
  onChange: (d: ProjectsContent) => void;
}> = ({ data, onChange }) => {
  const set = (k: keyof ProjectsContent, v: any) => onChange({ ...data, [k]: v });
  const T = TEXT_LIMITS;

  return (
    <div className="space-y-6">
      <Field label="Page Title" value={data.pageTitle} onChange={v => set('pageTitle', v)} rule={T.pageTitle} />
      <Field label="Page Subtitle" value={data.pageSubtitle} onChange={v => set('pageSubtitle', v)} rule={T.pageSubtitle} multiline />

      <h3 className="text-white font-semibold border-b border-white/10 pb-2 pt-4">Projects</h3>
      {data.projects.map((proj, i) => (
        <div key={proj.id} className="p-4 bg-white/5 rounded-lg space-y-3">
          <div className="flex justify-between">
            <span className="text-white font-medium text-sm">Project {i + 1}</span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={proj.featured}
                  onChange={e => {
                    const projs = [...data.projects];
                    projs[i] = { ...projs[i], featured: e.target.checked };
                    set('projects', projs);
                  }}
                  className="rounded"
                />
                Featured
              </label>
              <button onClick={() => set('projects', data.projects.filter((_, j) => j !== i))} className="p-1 text-red-400 hover:bg-red-500/20 rounded"><Trash2 size={14}/></button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Title" value={proj.title} onChange={v => {
              const projs = [...data.projects]; projs[i] = { ...projs[i], title: v }; set('projects', projs);
            }} rule={T.projectTitle} />
            <Field label="Live URL" value={proj.liveUrl} onChange={v => {
              const projs = [...data.projects]; projs[i] = { ...projs[i], liveUrl: v }; set('projects', projs);
            }} rule={{ min: 0, max: 200 }} type="url" />
          </div>
          <Field label="Description" value={proj.description} onChange={v => {
            const projs = [...data.projects]; projs[i] = { ...projs[i], description: v }; set('projects', projs);
          }} rule={T.projectDescription} multiline />
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="GitHub URL" value={proj.githubUrl} onChange={v => {
              const projs = [...data.projects]; projs[i] = { ...projs[i], githubUrl: v }; set('projects', projs);
            }} rule={{ min: 0, max: 200 }} type="url" />
            <Field label="Image URL" value={proj.imageUrl} onChange={v => {
              const projs = [...data.projects]; projs[i] = { ...projs[i], imageUrl: v }; set('projects', projs);
            }} rule={{ min: 5, max: 500 }} />
          </div>
          <ImageField
            label="Project Thumbnail"
            currentUrl={proj.imageUrl}
            spec={IMAGE_SPECS.projectThumb}
            onUploaded={url => {
              const projs = [...data.projects];
              projs[i] = { ...projs[i], imageUrl: url };
              set('projects', projs);
            }}
          />
          <div className="space-y-2">
            <label className="text-white/80 text-sm font-medium">Technologies</label>
            <div className="flex flex-wrap gap-2">
              {proj.technologies.map((tech, ti) => (
                <div key={ti} className="flex items-center bg-white/10 rounded-full px-3 py-1 gap-2">
                  <input value={tech} onChange={e => {
                    const projs = [...data.projects];
                    const techs = [...projs[i].technologies];
                    techs[ti] = clampLen(e.target.value, T.technology);
                    projs[i] = { ...projs[i], technologies: techs };
                    set('projects', projs);
                  }} className="bg-transparent text-white text-sm w-24 focus:outline-none" />
                  <button onClick={() => {
                    const projs = [...data.projects];
                    projs[i] = { ...projs[i], technologies: projs[i].technologies.filter((_, j) => j !== ti) };
                    set('projects', projs);
                  }} className="text-white/40 hover:text-red-400"><X size={12}/></button>
                </div>
              ))}
              <button onClick={() => {
                const projs = [...data.projects];
                projs[i] = { ...projs[i], technologies: [...projs[i].technologies, ''] };
                set('projects', projs);
              }} className="text-azure-400 text-xs flex items-center gap-1 px-3 py-1 rounded-full border border-azure-400/30 hover:bg-azure-400/10"><Plus size={12}/> Tech</button>
            </div>
          </div>
        </div>
      ))}
      <button onClick={() => set('projects', [...data.projects, {
        id: String(Date.now()),
        title: '', description: '', technologies: [],
        imageUrl: '', liveUrl: '', githubUrl: '', featured: false,
      }])} className="text-azure-400 text-sm flex items-center gap-1 hover:underline"><Plus size={14}/> Add Project</button>
    </div>
  );
};

// ── Social Links Editor ──
const SocialEditor: React.FC<{
  data: SocialContent;
  onChange: (d: SocialContent) => void;
}> = ({ data, onChange }) => {
  const T = TEXT_LIMITS;
  const icons = ['github', 'linkedin', 'twitter', 'instagram', 'whatsapp', 'youtube', 'facebook', 'tiktok'];

  return (
    <div className="space-y-4">
      <p className="text-white/60 text-sm">These links appear in the sidebar, footer, and mobile navigation.</p>
      {data.links.map((link, i) => (
        <div key={i} className="grid grid-cols-4 gap-3 items-end p-3 bg-white/5 rounded-lg">
          <div>
            <label className="text-white/80 text-xs font-medium block mb-1">Platform</label>
            <select
              value={link.icon}
              onChange={e => {
                const links = [...data.links];
                links[i] = { ...links[i], icon: e.target.value, platform: e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1) };
                onChange({ ...data, links });
              }}
              className="w-full px-2 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none"
            >
              {icons.map(ic => <option key={ic} value={ic}>{ic.charAt(0).toUpperCase() + ic.slice(1)}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <Field label="URL" value={link.url} onChange={v => {
              const links = [...data.links];
              links[i] = { ...links[i], url: v };
              onChange({ ...data, links });
            }} rule={T.socialUrl} type="url" />
          </div>
          <button onClick={() => onChange({ ...data, links: data.links.filter((_, j) => j !== i) })} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg self-end"><Trash2 size={14}/></button>
        </div>
      ))}
      {data.links.length < 10 && (
        <button onClick={() => onChange({ ...data, links: [...data.links, { platform: '', url: '', icon: 'github' }] })} className="text-azure-400 text-sm flex items-center gap-1 hover:underline"><Plus size={14}/> Add Link</button>
      )}
    </div>
  );
};

// ── Header & Footer Editor ──
const HeaderFooterEditor: React.FC<{
  header: HeaderContent;
  footer: FooterContent;
  onHeaderChange: (d: HeaderContent) => void;
  onFooterChange: (d: FooterContent) => void;
}> = ({ header, footer, onHeaderChange, onFooterChange }) => {
  const T = TEXT_LIMITS;
  return (
    <div className="space-y-6">
      <h3 className="text-white font-semibold border-b border-white/10 pb-2">Header</h3>
      <Field label="Logo Text" value={header.logoText} onChange={v => onHeaderChange({ ...header, logoText: v })} rule={T.logoText} />
      <h4 className="text-white/80 text-sm font-medium">Navigation Items</h4>
      {header.navItems.map((item, i) => (
        <div key={i} className="grid grid-cols-3 gap-3 items-end">
          <Field label="Label" value={item.name} onChange={v => {
            const items = [...header.navItems];
            items[i] = { ...items[i], name: v };
            onHeaderChange({ ...header, navItems: items });
          }} rule={T.navLabel} />
          <Field label="Path" value={item.path} onChange={v => {
            const items = [...header.navItems];
            items[i] = { ...items[i], path: v };
            onHeaderChange({ ...header, navItems: items });
          }} rule={{ min: 1, max: 50 }} />
          <button onClick={() => onHeaderChange({ ...header, navItems: header.navItems.filter((_, j) => j !== i) })} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg self-end"><Trash2 size={14}/></button>
        </div>
      ))}
      {header.navItems.length < 8 && (
        <button onClick={() => onHeaderChange({ ...header, navItems: [...header.navItems, { name: '', path: '/' }] })} className="text-azure-400 text-sm flex items-center gap-1 hover:underline"><Plus size={14}/> Add Nav Item</button>
      )}

      <h3 className="text-white font-semibold border-b border-white/10 pb-2 pt-6">Footer</h3>
      <Field label="Brand Name" value={footer.brandName} onChange={v => onFooterChange({ ...footer, brandName: v })} rule={T.brandName} />
    </div>
  );
};

// ────────────────────────────────────────────
// Main ContentManager
// ────────────────────────────────────────────

interface Section {
  id: string;
  label: string;
  icon: LucideIcon;
  sectionKey: SiteSection;
}

const sections: Section[] = [
  { id: 'theme', label: 'Theme & Backgrounds', icon: Palette, sectionKey: 'theme' },
  { id: 'home', label: 'Home Page', icon: Home, sectionKey: 'home' },
  { id: 'about', label: 'About Page', icon: User, sectionKey: 'about' },
  { id: 'contact', label: 'Contact Page', icon: Mail, sectionKey: 'contact' },
  { id: 'resume', label: 'Resume', icon: Briefcase, sectionKey: 'resume' },
  { id: 'projects', label: 'Projects', icon: FileText, sectionKey: 'projects' },
  { id: 'social', label: 'Social Links', icon: Share2, sectionKey: 'social' },
  { id: 'header-footer', label: 'Header & Footer', icon: LayoutIcon, sectionKey: 'header' },
];

const ContentManager: React.FC = () => {
  const { content, update } = useContent();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [draft, setDraft] = useState<any>(null);
  const [draftFooter, setDraftFooter] = useState<FooterContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const openSection = (sec: Section) => {
    setActiveSection(sec.id);
    if (sec.id === 'header-footer') {
      setDraft({ ...content.header });
      setDraftFooter({ ...content.footer });
    } else {
      setDraft(JSON.parse(JSON.stringify(content[sec.sectionKey])));
      setDraftFooter(null);
    }
    setHasChanges(false);
  };

  const handleDraftChange = (d: any) => {
    setDraft(d);
    setHasChanges(true);
  };

  const handleFooterChange = (d: FooterContent) => {
    setDraftFooter(d);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!activeSection || !draft) return;
    setSaving(true);
    try {
      const sec = sections.find(s => s.id === activeSection);
      if (!sec) return;

      if (activeSection === 'header-footer') {
        await update('header', draft);
        if (draftFooter) await update('footer', draftFooter);
      } else {
        await update(sec.sectionKey, draft);
      }

      setHasChanges(false);
      toast.success('Changes saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const sec = sections.find(s => s.id === activeSection);
    if (!sec) return;
    if (activeSection === 'header-footer') {
      setDraft(JSON.parse(JSON.stringify(defaultContent.header)));
      setDraftFooter(JSON.parse(JSON.stringify(defaultContent.footer)));
    } else {
      setDraft(JSON.parse(JSON.stringify(defaultContent[sec.sectionKey])));
    }
    setHasChanges(true);
    toast('Reset to defaults — save to apply', { icon: 'ℹ️' });
  };

  // Section picker
  if (!activeSection) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <LayoutIcon className="text-azure-400" size={24} />
          <div>
            <h2 className="text-xl font-bold text-white">Content Management</h2>
            <p className="text-white/60 text-sm">Edit any content on your site. Changes are saved to the database and appear immediately.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sections.map(sec => (
            <button
              key={sec.id}
              onClick={() => openSection(sec)}
              className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-azure-400/30 rounded-lg transition-all text-left group"
            >
              <sec.icon size={24} className="text-azure-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-semibold text-sm">{sec.label}</h3>
              <p className="text-white/50 text-xs mt-1">Click to edit</p>
            </button>
          ))}
        </div>
      </GlassCard>
    );
  }

  // Editor view
  const currentSection = sections.find(s => s.id === activeSection);

  return (
    <GlassCard className="p-6">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (hasChanges && !window.confirm('You have unsaved changes. Discard them?')) return;
              setActiveSection(null);
              setDraft(null);
              setDraftFooter(null);
              setHasChanges(false);
            }}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          {currentSection && <currentSection.icon size={20} className="text-azure-400" />}
          <h2 className="text-lg font-bold text-white">{currentSection?.label}</h2>
          {hasChanges && (
            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
              Unsaved changes
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleReset} className="px-3 py-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-colors">
            Reset to Defaults
          </button>
          <button
            onClick={() => window.open(activeSection === 'home' ? '/' : `/${activeSection === 'header-footer' ? '' : activeSection}`, '_blank')}
            className="px-3 py-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-colors flex items-center gap-1"
          >
            <Eye size={14} /> Preview
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="px-4 py-2 bg-azure-500 hover:bg-azure-600 disabled:opacity-50 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Editor body */}
      <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
        {activeSection === 'theme' && <ThemeEditor data={draft} onChange={handleDraftChange} />}
        {activeSection === 'home' && <HomeEditor data={draft} onChange={handleDraftChange} />}
        {activeSection === 'about' && <AboutEditor data={draft} onChange={handleDraftChange} />}
        {activeSection === 'contact' && <ContactEditor data={draft} onChange={handleDraftChange} />}
        {activeSection === 'resume' && <ResumeEditor data={draft} onChange={handleDraftChange} />}
        {activeSection === 'projects' && <ProjectsEditor data={draft} onChange={handleDraftChange} />}
        {activeSection === 'social' && <SocialEditor data={draft} onChange={handleDraftChange} />}
        {activeSection === 'header-footer' && (
          <HeaderFooterEditor
            header={draft}
            footer={draftFooter!}
            onHeaderChange={handleDraftChange}
            onFooterChange={handleFooterChange}
          />
        )}
      </div>
    </GlassCard>
  );
};

export default ContentManager;
