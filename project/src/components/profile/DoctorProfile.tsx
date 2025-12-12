import React, { useState, useEffect } from 'react';
import { getCurrentUser, updateDoctorProfile } from '../../services/api';
import { User, Activity, Award, BookOpen, MapPin, Building, FileText, Save } from 'lucide-react';

interface DoctorProfileData {
    specialty: string;
    license_number: string;
    years_of_experience: number;
    hospital_affiliation: string;
    bio: string;
    hospital_name: string;
    hospital_state: string;
    hospital_city: string;
}

const DoctorProfile: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [profile, setProfile] = useState<DoctorProfileData>({
        specialty: '',
        license_number: '',
        years_of_experience: 0,
        hospital_affiliation: '',
        bio: '',
        hospital_name: '',
        hospital_state: '',
        hospital_city: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const user = await getCurrentUser();
            if (user.doctor_profile) {
                setProfile({
                    specialty: user.doctor_profile.specialty || '',
                    license_number: user.doctor_profile.license_number || '',
                    years_of_experience: user.doctor_profile.years_of_experience || 0,
                    hospital_affiliation: user.doctor_profile.hospital_affiliation || '',
                    bio: user.doctor_profile.bio || '',
                    hospital_name: user.doctor_profile.hospital_name || '',
                    hospital_state: user.doctor_profile.hospital_state || '',
                    hospital_city: user.doctor_profile.hospital_city || ''
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
            [name]: name === 'years_of_experience' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            await updateDoctorProfile(profile);
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
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                            <User className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Doctor Profile</h1>
                            <p className="text-blue-100 mt-1">Manage your professional information</p>
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
                        {/* Professional Info */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b pb-2">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                                Professional Details
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                                    <input
                                        type="text"
                                        name="specialty"
                                        value={profile.specialty}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                                    <input
                                        type="text"
                                        name="license_number"
                                        value={profile.license_number}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                                    <input
                                        type="number"
                                        name="years_of_experience"
                                        value={profile.years_of_experience}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Hospital Info */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b pb-2">
                                <Building className="w-5 h-5 text-blue-600" />
                                Hospital Affiliation
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
                                    <input
                                        type="text"
                                        name="hospital_name"
                                        value={profile.hospital_name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                        <input
                                            type="text"
                                            name="hospital_state"
                                            value={profile.hospital_state}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                        <input
                                            type="text"
                                            name="hospital_city"
                                            value={profile.hospital_city}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b pb-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            Biography
                        </h3>
                        <textarea
                            name="bio"
                            rows={4}
                            value={profile.bio}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Tell us about your professional background..."
                        />
                    </div>

                    <div className="flex justify-end pt-6 border-t">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
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

export default DoctorProfile;
