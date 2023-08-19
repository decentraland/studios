// ajustar usando quick type check

export interface Landing {
  id:                      number;
  status:                  string;
  date_created:            Date;
  user_updated:            string;
  date_updated:            Date;
  hero_title:              string;
  hero_background:         string;
  hero_description:        string;
  hero_button:             string;
  hero_cover:              string;
  slug:                    string;
  form_title:              string;
  form_image:              string;
  form_description:        string;
  form_name:               string;
  form_email:              string;
  form_button:             string;
  form_success_title:      string;
  form_success_text:       string;
  form_success_open:       string;
  form_success_send_again: string;
  form_success_open_url:   string;
  form_success_open_intercom:   string;
  about_show:              boolean;
  about_intro:             string;
  about_title:             string;
  about_image:             string;
  about_blocks:            Block[];
  content1_show:           boolean;
  content1_title:          string;
  content1_description:    string;
  content1_button:         string;
  content1_blocks:         Block[];
  content2_show:           boolean;
  content2_title:          string;
  content2_button:         string;
  content2_description:    string;
  content2_background:     string;
  content2_blocks:         Block[];
  call_show:               boolean;
  call_title:              string;
  call_button:             string;
  call_image:              string;
  reviews_show:            boolean;
  reviews_title:           string;
  reviews:                 Review[];
  faq_show:                boolean;
  faq_title:               string;
  faq_description:         string;
  faqs:                    FAQ[];
  contact_show:            boolean;
  contact_title:           string;
  contact_action:          string;
  contact_close:           string;
  contact_text:            string;
  contact_text_close:      string;
  contact_us:              string;
  custom_fields:           object;
  form_custom_fields:      FormCustomField[];
  list_ids:                string;
  fb_pixel:                string;
  track_linkedin:          LinkedinTrackData;
}

export interface FormCustomField {
  sg_id: string;
  label: string;
  name: string;
  options: [];
  value: string
}

export interface LinkedinTrackData {
  partner_id: string;
  conversion_id?: string;
}

export interface Block {
  title:       string;
  description: string;
  icon?:        string;
}

export interface FAQ {
  Question: string;
  Answer:   string;
}

export interface Review {
  Author:  string;
  Company: string;
  Review:  string;
  Avatar: string;
}