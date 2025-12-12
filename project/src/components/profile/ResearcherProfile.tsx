import React, { useState, useEffect } from 'react';
import { getCurrentUser, updateResearcherProfile } from '../../services/api';
import { User, Activity, Award, BookOpen, Building, FileText, Save, Microscope } from 'lucide-react';

interface ResearcherProfileData {
    institution: string;
    field_of_study: string;
    publications_count: number;
    current_projects: string;
}

const ResearcherProfile: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [profile, setProfile] = useState<ResearcherProfileData>({
        institution: '',
        field_of_study: '',
        publications_count: 0,
        current_projects: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const user = await getCurrentUser();
            if (user.researcher_profile) {
                setProfile({
                    institution: user.researcher_profile.institution || '',
                    field_of_study: user.researcher_profile.field_of_study || '',
                    publications_count: user.researcher_profile.publications_count || 0,
                    current_projects: user.researcher_profile.current_projects || ''
                });
            }
        } catch (err) {
            setError('Failed to load profile');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: name === 'publications_count' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            await updateResearcherProfile(profile);
            setSuccess('Profile updated successfully');
        } catch (err) {
            setError('Failed to update profile');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading profile...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-8 text-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                            <Microscope className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Researcher Profile</h1>
                            <p className="text-purple-100 mt-1">Manage your academic and research details</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 text-green-600 p-4 rounded-xl border border-green-100 flex items-center gap-2">
                            <Award className="w-5 h-5" />
                            {success}
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Academic Info */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b pb-2">
                                <Building className="w-5 h-5 text-purple-600" />
                                Academic Affiliation
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                                    <input
                                        type="text"
                                        name="institution"
                                        value={profile.institution}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                                    <input
                                        type="text"
                                        name="field_of_study"
                                        value={profile.field_of_study}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Research Stats */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b pb-2">
                                <BookOpen className="w-5 h-5 text-purple-600" />
                                Research Statistics
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Publications Count</label>
                                    <input
                                        type="number"
                                        name="publications_count"
                                        value={profile.publications_count}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Current Projects */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b pb-2">
                            <FileText className="w-5 h-5 text-purple-600" />
                            Current Projects
                        </h3>
                        <textarea
                            name="current_projects"
                            rows={4}
                            value={profile.current_projects}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            placeholder="Describe your current research projects..."
                        />
                    </div>

                    <div className="flex justify-end pt-6 border-t">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/20"
                        >
                            <Save className="w-5 h-5" />
                            {saving ? 'Saving Changes...' : 'Save Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResearcherProfile;
