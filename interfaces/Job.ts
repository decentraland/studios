import { VerifiedPartner } from "./VerifiedPartner";

export interface Job {
    id:                 string;
    title:              string;
    date_created:       string;    
    author_name:        string;
    company?:            string;
    budget_min:         string;
    budget_max:         string;
    short_description:  string[];
    long_description:   string;
    email:              string;
}

export interface JobMessage {
    from_profile: VerifiedPartner
    to_job: Job
    message: string
    date_created: string
}
