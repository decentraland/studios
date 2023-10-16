import { User } from "./User";
import { VerifiedPartner } from "./VerifiedPartner";

export interface Job {
    id:                 string;
    title:              string;
    date_created:       string;    
    author_name:        string;
    company?:            string;
    budget:             string;
    short_description:  string[];
    long_description:   string;
    email:              string;
    brief_file?:         any;
    deadline_date?:      string;
    landing_url?:        string;
    messages:           JobMessage[];
    status:             string;
    verified_email?:     boolean;
    managers:           User[];
    managers_invites?: string;
    closed_poll?:        string;
    author_id?:         string;
}

export interface JobMessage {
    from_profile:   VerifiedPartner
    to_job:         Job
    message:        string
    date_created:   string
    brief_file?:    any
}