import React, { useState, useEffect } from 'react';
import { getCurrentUser, updateResearcherProfile, uploadResearcherDocuments } from '../../services/api';
import {
    Activity, Award, BookOpen, FileText, Save, Microscope, Loader2,
    Upload, ExternalLink, ShieldCheck, MapPin, GraduationCap, Briefcase,
    Globe, Link, UserCheck, Plus, X, Hash, MessageSquare, Fingerprint
} from 'lucide-react';

interface ResearcherProfileData {
    institution: string;
    field_of_study: string;
    publications_count: number;
    current_projects: string;
    bio: string;
    professional_title: string;
    city: string;
    country: string;
    highest_qualification: string;
    specialization: string;
    university: string;
    completion_year: number;
    research_areas: string;
    techniques: string;
    therapeutic_domains: string;
    total_experience_years: number;
    research_type: string;
    orcid_id: string;
    linkedin_url: string;
    google_scholar_url: string;
    collaboration_interests: string;
    is_mentorship_available: boolean;
    thesis_url?: string;
    cv_url?: string;
    other_docs_url?: string;
}

const ResearcherProfile: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<ResearcherProfileData>({
        institution: '',
        field_of_study: '',
        publications_count: 0,
        current_projects: '',
        bio: '',
        professional_title: '',
        city: '',
        country: '',
        highest_qualification: '',
        specialization: '',
        university: '',
        completion_year: new Date().getFullYear(),
        research_areas: '',
        techniques: '',
        therapeutic_domains: '',
        total_experience_years: 0,
        research_type: 'Academic',
        orcid_id: '',
        linkedin_url: '',
        google_scholar_url: '',
        collaboration_interests: '',
        is_mentorship_available: false
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const userData = await getCurrentUser();
            setUser(userData);
            if (userData.researcher_profile) {
                setProfile({
                    ...profile,
                    ...userData.researcher_profile
                });
            }
        } catch (err) {
            setError('Failed to load profile');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        setProfile(prev => ({
            ...prev,
            [name]: name === 'publications_count' || name === 'completion_year' || name === 'total_experience_years'
                ? parseInt(value) || 0
                : val
        }));
    };

    const handleTagAction = (field: 'research_areas' | 'techniques' | 'therapeutic_domains', action: 'add' | 'remove', tag?: string) => {
        const tags = profile[field].split(';').filter(t => t.trim() !== '');
        if (action === 'add' && tag && !tags.includes(tag)) {
            tags.push(tag);
        } else if (action === 'remove' && tag) {
            const index = tags.indexOf(tag);
            if (index > -1) tags.splice(index, 1);
        }
        setProfile(prev => ({ ...prev, [field]: tags.join(';') }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append(field, file);

        try {
            const updatedProfile = await uploadResearcherDocuments(formData);
            setProfile(prev => ({
                ...prev,
                ...updatedProfile
            }));
            setSuccess(`Document '${field}' status synchronized`);
        } catch (err) {
            setError('Failed to upload document');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            await updateResearcherProfile(profile);
            setSuccess('Professional profile synchronized with G-ONE network');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            setError('Failed to update profile');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Professional Header Section */}
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 bg-slate-900/50 backdrop-blur-md p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-blue-600/10 opacity-50" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="relative">
                            <div className="w-32 h-32 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-500">
                                <Microscope className="w-14 h-14 text-white" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-xl shadow-lg border-4 border-slate-900">
                                <ShieldCheck className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div className="text-center md:text-left space-y-2">
                            <p className="text-purple-400 font-bold uppercase tracking-[0.2em] text-[10px]">Academic Credential Verified</p>
                            <h1 className="text-4xl font-extrabold text-white tracking-tight">{profile.institution ? `${profile.professional_title || 'Scientist'}` : 'Researcher Identity'}</h1>
                            <p className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                {profile.institution ? (user?.full_name || 'Verified Researcher') : 'Scientific Profile'}
                            </p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                                <div className="flex items-center gap-2 bg-slate-950/50 px-4 py-2 rounded-xl border border-slate-800/50">
                                    <MapPin className="w-4 h-4 text-slate-500" />
                                    <span className="text-sm font-medium text-slate-300">{profile.city || 'Location'}, {profile.country || 'Global'}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-950/50 px-4 py-2 rounded-xl border border-slate-800/50">
                                    <Fingerprint className="w-4 h-4 text-slate-500" />
                                    <span className="text-sm font-medium text-slate-300">ID: {profile.orcid_id || 'REGISTERED'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-600 to-blue-700 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                    <div className="relative z-10 space-y-4">
                        <h3 className="text-xl font-bold text-white">Trust Layer</h3>
                        <p className="text-purple-100/70 text-sm leading-relaxed">
                            Your profile is part of the G-ONE encrypted scientific network. Your credentials are used for clinical trial matching and co-authoring discovery.
                        </p>
                    </div>
                    <div className="relative z-10 mt-6 pt-6 border-t border-white/10">
                        <div className="flex justify-between items-center text-white">
                            <span className="text-xs font-bold uppercase tracking-widest opacity-60">Visibility</span>
                            <span className="text-xs font-bold bg-emerald-400/20 px-3 py-1 rounded-full text-emerald-400">Live & Public</span>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Status Message */}
                    {(error || success) && (
                        <div className={`p - 5 rounded - 3xl border flex items - center gap - 4 animate -in fade -in slide -in -from - top - 4 duration - 300 ${error ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            } `}>
                            <div className={`p - 2 rounded - xl ${error ? 'bg-red-500/20' : 'bg-emerald-500/20'} `}>
                                {error ? <Activity className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                            </div>
                            <span className="text-sm font-bold tracking-wide">{error || success}</span>
                        </div>
                    )}

                    {/* Section: Core Identity */}
                    <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-[2rem] border border-slate-800 shadow-xl space-y-8">
                        <div className="flex items-center gap-3">
                            <UserCheck className="w-5 h-5 text-purple-400" />
                            <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">Core Profile</h3>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Professional Title</label>
                                <input
                                    type="text"
                                    name="professional_title"
                                    value={profile.professional_title}
                                    onChange={handleChange}
                                    className="w-full bg-slate-950/50 border border-slate-800 text-white px-5 py-4 rounded-2xl focus:ring-2 focus:ring-purple-600/50 outline-none transition-all placeholder:text-slate-700"
                                    placeholder="e.g. Clinical Pharmacologist"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Affiliated Institution</label>
                                <input
                                    type="text"
                                    name="institution"
                                    value={profile.institution}
                                    onChange={handleChange}
                                    className="w-full bg-slate-950/50 border border-slate-800 text-white px-5 py-4 rounded-2xl focus:ring-2 focus:ring-purple-600/50 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={profile.city}
                                    onChange={handleChange}
                                    className="w-full bg-slate-950/50 border border-slate-800 text-white px-5 py-4 rounded-2xl focus:ring-2 focus:ring-purple-600/50 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={profile.country}
                                    onChange={handleChange}
                                    className="w-full bg-slate-950/50 border border-slate-800 text-white px-5 py-4 rounded-2xl focus:ring-2 focus:ring-purple-600/50 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Primary Field</label>
                                <input
                                    type="text"
                                    name="field_of_study"
                                    value={profile.field_of_study}
                                    onChange={handleChange}
                                    className="w-full bg-slate-950/50 border border-slate-800 text-white px-5 py-4 rounded-2xl focus:ring-2 focus:ring-purple-600/50 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section: Academic & Experience */}
                    <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-[2rem] border border-slate-800 shadow-xl space-y-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <GraduationCap className="w-5 h-5 text-purple-400" />
                                <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">Academic & Career</h3>
                            </div>
                            <div className="flex items-center gap-2 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20">
                                <Briefcase className="w-4 h-4 text-purple-400" />
                                <span className="text-xs font-bold text-purple-400">{profile.total_experience_years} Years Experience</span>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Highest Qualification</label>
                                    <input
                                        type="text"
                                        name="highest_qualification"
                                        value={profile.highest_qualification}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950/50 border border-slate-800 text-white px-5 py-4 rounded-2xl focus:ring-2 focus:ring-purple-600/50 outline-none transition-all"
                                        placeholder="e.g. PhD in Molecular Biology"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">University / Institute</label>
                                    <input
                                        type="text"
                                        name="university"
                                        value={profile.university}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950/50 border border-slate-800 text-white px-5 py-4 rounded-2xl focus:ring-2 focus:ring-purple-600/50 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Completion Year</label>
                                        <input
                                            type="number"
                                            name="completion_year"
                                            value={profile.completion_year}
                                            onChange={handleChange}
                                            className="w-full bg-slate-950/50 border border-slate-800 text-white px-5 py-4 rounded-2xl focus:ring-2 focus:ring-purple-600/50 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Exp. (Years)</label>
                                        <input
                                            type="number"
                                            name="total_experience_years"
                                            value={profile.total_experience_years}
                                            onChange={handleChange}
                                            className="w-full bg-slate-950/50 border border-slate-800 text-white px-5 py-4 rounded-2xl focus:ring-2 focus:ring-purple-600/50 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Research Type</label>
                                    <select
                                        name="research_type"
                                        value={profile.research_type}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950 border border-slate-800 text-white px-5 py-4 rounded-2xl focus:ring-2 focus:ring-purple-600/50 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="Academic">Academic</option>
                                        <option value="Industrial">Industrial</option>
                                        <option value="Clinical">Clinical</option>
                                        <option value="Regulatory">Regulatory</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section: Expertise Discovery */}
                    <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-[2rem] border border-slate-800 shadow-xl space-y-8">
                        <div className="flex items-center gap-3">
                            <Plus className="w-5 h-5 text-purple-400" />
                            <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">Research Matrix</h3>
                        </div>

                        {[
                            { label: 'Research Areas', field: 'research_areas', icon: Globe, placeholder: 'Add Area (e.g. Oncology)' },
                            { label: 'Techniques / Methods', field: 'techniques', icon: Hash, placeholder: 'Add Technique (e.g. CRISPR)' },
                            { label: 'Therapeutic Domains', field: 'therapeutic_domains', icon: Activity, placeholder: 'Add Domain (e.g. Immunology)' }
                        ].map((matrix) => (
                            <div key={matrix.field} className="space-y-4">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                    <matrix.icon className="w-3 h-3" />
                                    {matrix.label}
                                </label>
                                <div className="flex flex-wrap gap-2 min-h-[50px] p-4 bg-slate-950/30 border border-slate-800/50 rounded-2xl">
                                    {profile[matrix.field as keyof ResearcherProfileData] ? (
                                        (profile[matrix.field as keyof ResearcherProfileData] as string).split(';').filter(t => t.trim()).map(tag => (
                                            <div key={tag} className="group flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 px-3 py-1.5 rounded-xl border border-purple-500/30 animate-in zoom-in duration-300">
                                                <span className="text-xs font-bold text-white tracking-wide">{tag}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleTagAction(matrix.field as any, 'remove', tag)}
                                                    className="text-slate-500 hover:text-red-400 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-slate-700 italic">No tags defined...</p>
                                    )}
                                </div>
                                <div className="relative group/input">
                                    <input
                                        type="text"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleTagAction(matrix.field as any, 'add', e.currentTarget.value);
                                                e.currentTarget.value = '';
                                            }
                                        }}
                                        className="w-full bg-slate-950/50 border border-slate-800 text-white px-5 py-3 rounded-2xl focus:ring-1 focus:ring-purple-600/50 outline-none text-xs"
                                        placeholder={matrix.placeholder}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-600 uppercase tracking-tighter opacity-0 group-focus-within/input:opacity-100 transition-opacity">Press Enter</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* Professional Bio */}
                    <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-[2rem] border border-slate-800 shadow-xl space-y-6">
                        <div className="flex items-center gap-3">
                            <MessageSquare className="w-5 h-5 text-purple-400" />
                            <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">Biography</h3>
                        </div>
                        <textarea
                            name="bio"
                            value={profile.bio}
                            onChange={handleChange}
                            rows={8}
                            className="w-full bg-slate-950/50 border border-slate-800 text-white p-5 rounded-2xl focus:ring-2 focus:ring-purple-600/50 outline-none text-sm leading-relaxed resize-none scrollbar-hide"
                            placeholder="Detail your scientific journey and expertise..."
                        />
                    </div>

                    {/* Digital Footprint */}
                    <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-[2rem] border border-slate-800 shadow-xl space-y-6">
                        <div className="flex items-center gap-3">
                            <Link className="w-5 h-5 text-purple-400" />
                            <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">Validation</h3>
                        </div>

                        <div className="space-y-4">
                            {[
                                { name: 'orcid_id', label: 'ORCID ID', icon: Fingerprint, placeholder: '0000-0002-XXXX-XXXX' },
                                { name: 'linkedin_url', label: 'LinkedIn Profile', icon: Globe, placeholder: 'linkedin.com/in/...' },
                                { name: 'google_scholar_url', label: 'Google Scholar', icon: BookOpen, placeholder: 'scholar.google.com/...' }
                            ].map((site) => (
                                <div key={site.name} className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                        <site.icon className="w-4 h-4 text-slate-600" />
                                    </div>
                                    <input
                                        type="text"
                                        name={site.name}
                                        value={profile[site.name as keyof ResearcherProfileData] as string}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950/50 border border-slate-800 text-white pl-12 pr-5 py-4 rounded-2xl focus:ring-2 focus:ring-purple-600/50 outline-none text-xs transition-all"
                                        placeholder={site.placeholder}
                                    />
                                    <div className="absolute top-0 right-4 -translate-y-1/2 bg-slate-900 px-2 text-[8px] font-black text-slate-500 uppercase tracking-widest">{site.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Collaboration Toggle */}
                    <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-800 shadow-xl overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5" />
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Open to Mentorship</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="is_mentorship_available"
                                        checked={profile.is_mentorship_available}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Collaboration Interests</label>
                                <textarea
                                    name="collaboration_interests"
                                    value={profile.collaboration_interests}
                                    onChange={handleChange}
                                    className="w-full bg-slate-950/50 border border-slate-800 text-white p-4 rounded-2xl focus:ring-2 focus:ring-purple-600/50 outline-none text-xs leading-relaxed h-24 resize-none"
                                    placeholder="Co-authoring, Clinical trials, Grants..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Document Repository */}
                    <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-[2rem] border border-slate-800 shadow-xl space-y-6">
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-purple-400" />
                            <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">Papers</h3>
                        </div>

                        <div className="space-y-3">
                            {[
                                { label: 'Primary Thesis', field: 'thesis', url: profile.thesis_url },
                                { label: 'Modern CV', field: 'cv', url: profile.cv_url }
                            ].map((doc) => (
                                <div key={doc.field} className="flex items-center justify-between bg-slate-950/50 p-4 rounded-2xl border border-slate-800 group hover:border-purple-600/30 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className={`p - 2 rounded - lg ${doc.url ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-600'} `}>
                                            <Upload className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-white uppercase tracking-wider">{doc.label}</p>
                                            <p className="text-[8px] text-slate-500">{doc.url ? 'VERIFIED' : 'PENDING'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <label className="cursor-pointer p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, doc.field)} />
                                            <Upload className="w-3.5 h-3.5 text-white" />
                                        </label>
                                        {doc.url && (
                                            <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${doc.url} `} target="_blank" className="p-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors">
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Final Action */}
                    <button
                        type="submit"
                        disabled={saving || uploading}
                        className="w-full bg-gradient-to-tr from-purple-600 to-blue-600 hover:shadow-2xl hover:shadow-purple-500/30 text-white py-6 rounded-3xl font-black text-sm tracking-[0.3em] flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 group"
                    >
                        {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                        {saving ? 'UPDATING...' : 'SYNC ALL DATA'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ResearcherProfile;
