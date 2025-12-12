import { Profile, HospitalVisit } from '../types/database.types'

/**
 * Anonymization Service for the "Bridge" between Doctor/Patient data and Pharma Analytics.
 * Handles De-identification (Safe Harbor method approximation).
 */

export const AnonymizerdService = {

    /**
     * Strips direct identifiers and generalizes quasi-identifiers.
     */
    anonymizePatient: (profile: Profile) => {
        // 1. Remove Direct Identifiers
        const { id, full_name, email, phone, emergency_contact_name, emergency_contact_phone, ...rest } = profile

        // 2. Generalize Age (to 5-year buckets)
        // Assuming date_of_birth is YYYY-MM-DD
        let ageGroup = 'Unknown'
        if (profile.date_of_birth) {
            const year = new Date(profile.date_of_birth).getFullYear()
            const currentYear = new Date().getFullYear()
            const age = currentYear - year

            // Bucketing logic
            const lowerBound = Math.floor(age / 5) * 5
            ageGroup = `${lowerBound}-${lowerBound + 5}`
        }

        return {
            analytic_id: `ANON-${id.substring(0, 8)}`, // Hashed or truncated ID
            age_group: ageGroup,
            ...rest
        }
    },

    /**
     * Aggregates visit data without revealing specific admission dates or raw costs.
     */
    aggregateVisitTrends: (visits: HospitalVisit[]) => {
        const diagnosisCounts: Record<string, number> = {}

        visits.forEach(visit => {
            if (diagnosisCounts[visit.diagnosis]) {
                diagnosisCounts[visit.diagnosis]++
            } else {
                diagnosisCounts[visit.diagnosis] = 1
            }
        })

        return Object.entries(diagnosisCounts).map(([diagnosis, count]) => ({
            diagnosis,
            count
        })).sort((a, b) => b.count - a.count)
    }
}
