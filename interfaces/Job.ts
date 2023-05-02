import { VerifiedPartner } from "./VerifiedPartner";

export interface Job {
    id:                 string;
    title:              string;
    date_created:       string;    
    author_name:        string;
    company?:            string;
    budget:         string;
    short_description:  string[];
    long_description:   string;
    email:              string;
    brief_file?:         any;
}

export interface JobMessage {
    from_profile:   VerifiedPartner
    to_job:         Job
    message:        string
    date_created:   string
    brief_file?:    any
}