// ajustar usando quick type check

export interface Landing {
  id:                      number;
  status:                  string;
  date_created:            Date;
  user_updated:            string;
  date_updated:            Date;
  hero_title:              string;
  hero_description:        string;
  hero_button:             string;
  hero_cover:              string;
  slug:                    string;
  form_title:              string;
  form_description:        string;
  form_name:               string;
  form_email:              string;
  form_button:             string;
  form_success_title:      string;
  form_success_text:       string;
  form_success_open:       string;
  form_success_send_again: string;
  form_success_open_url:   string;
  about_intro:             string;
  about_title:             string;
  about_image:             string;
  content1_title:          string;
  content1_description:    string;
  content1_button:         string;
  content2_title:          string;
  content2_button:         string;
  content2_description:    string;
  content2_background:     string;
  faqs:                    FAQ[];
  call_title:              string;
  call_button:             string;
  call_image:              string;
  reviews:                 Review[];
  contact_title:           string;
  contact_action:          string;
  contact_close:           string;
  faq_title:               string;
  faq_description:         string;
  reviews_title:           string;
  about_blocks:            Block[];
  content1_blocks:         Block[];
  content2_blocks:         Block[];
  contact_text:            string;
  contact_text_close:      string;
  contact_us:              string;
  custom_fields:           string;
  list_ids:                string;
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