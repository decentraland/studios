import React, { useEffect, useState } from "react"
import { GetStaticPaths, GetStaticProps } from "next";
import Landings from "../../clients/Landings";
import { Landing } from "../../interfaces/Landing";
import { useRouter } from "next/router";
import Head from "next/head";
import Script from "next/script";

export const getStaticProps: GetStaticProps = async ({ params }) => {

    if (params && params.slug) {
      const landing = await Landings.getLandingData(`?filter[slug]=${params.slug}`)
      return {
        props: {
            landing,
        }
      }
    }
    
  return {
    props: { error: true },
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
    const paths = await Landings.getAllSlugs()
  
    return {
      paths,
      fallback: false,
    }
}
  

interface Props {
    landing: Landing
}

interface VisitData {
    country_code: string
    country_name: string
    state: string
    IPv4: string
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

function MetaverseGuide({ landing }: Props) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [ipData, setIpData] = useState({} as VisitData)

    const router = useRouter()
    const { utm_source, utm_medium, utm_campaign } = router.query || {}

    useEffect(() => {
        const fetchIp = async() => {
            const ipData = (await (await fetch('https://geolocation-db.com/json/')).json())
            setIpData(ipData)
        }

        fetchIp()
    }, [])

    useEffect(() => {
        if (landing.fb_pixel){
            (globalThis as any).fbq && (globalThis as any).fbq('init', landing.fb_pixel);
            (globalThis as any).fbq && (globalThis as any).fbq('trackSingle', landing.fb_pixel, 'PageView');
        }
    }, [(globalThis as any).fbq])

    const onFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const body = {
            name,
            email,
            slug: landing.slug,
            utm_source, 
            utm_medium, 
            utm_campaign,
            ip: ipData.IPv4,
            country_code: ipData.country_code,
            country: ipData.country_name,
            city: ipData.state,
            mobile: !!globalThis?.navigator.userAgent.match(/Mobi/),
            user_agent: globalThis?.navigator.userAgent,
            list_ids: landing.list_ids,
            custom_fields: landing.custom_fields
        }

        fetch('/api/landing/submit', {
            method: 'POST',
            body: JSON.stringify(body)
        })

        fbqTrackLead()
        linkedinTrackLead()
        ctaSuccess()
    }

    const ctaSuccess = () => {
        const ctaContainer = document.getElementById('cta__container');
        ctaContainer && ctaContainer.classList.remove('container--enabled');
        ctaContainer && ctaContainer.classList.add('container--success');
    }

    const ctaSendAgain = () => {
        setName('')
        setEmail('')
        const ctaContainer = document.getElementById('cta__container');
        ctaContainer && ctaContainer.classList.remove('container--success');
        ctaContainer && ctaContainer.classList.add('container--enabled');
      }

    const ctaToggle = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (Object.values(event.currentTarget.classList).includes('faq--collapsed')){
            event.currentTarget.classList.remove('faq--collapsed')
        } else {
            event.currentTarget.classList.add('faq--collapsed')
        }
    }

    const ctaHighlight = () => {
        const ctaContainer = document.getElementById('cta__container');
        ctaContainer && ctaContainer.classList.add('cta--highlight')

        setTimeout(() => {
            ctaContainer && ctaContainer.classList.remove('cta--highlight');
          }, 4000);
    }

    const showIntercom = () => {
        typeof window !== 'undefined' && (window as any).Intercom && (window as any).Intercom('show');
    }
    
    const fbqTrackLead = () => (globalThis as any).fbq('track', 'Lead');
    
    const linkedinTrackLead = () => (globalThis as any).lintrk && (globalThis as any).lintrk('track', { conversion_id: landing.track_linkedin?.conversion_id });

    let hero_background = {}

    if (landing.hero_background){
        hero_background = {
            backgroundSize: 'cover',
            backgroundImage: `url("${DB_URL}/assets/${landing.hero_background}")`
        }
    }

    let linkedinTracking = null

    if (landing.track_linkedin?.partner_id) {
        linkedinTracking = <footer>
            <Script id="linkedin-partner_id" strategy="afterInteractive">
                {`_linkedin_partner_id = "${landing.track_linkedin.partner_id}";
                window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
                window._linkedin_data_partner_ids.push(_linkedin_partner_id);`}
            </Script>
            <Script id="linkedin-tracking" strategy="afterInteractive">
                {`(function(l) {
                if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
                window.lintrk.q=[]}
                var s = document.getElementsByTagName("script")[0];
                var b = document.createElement("script");
                b.type = "text/javascript";b.async = true;
                b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
                s.parentNode.insertBefore(b, s);})(window.lintrk);`} 
            </Script>
            <noscript>
                <img height="1" width="1" style={{display:"none"}} alt="" src={`https://px.ads.linkedin.com/collect/?pid=${landing.track_linkedin.partner_id}&fmt=gif`} />
            </noscript>
        </footer>
    }

    return (<>
        <Head>
            <meta property="og:title" content={landing.hero_title} />
            <meta property="og:description" content={landing.hero_description} />
            <meta property="og:image" content={`${DB_URL}/assets/${landing.hero_cover}`} />

            <meta property="og:url" content={`https://studios.decentraland.org/p/${landing.slug}`} />

            <meta property="twitter:url" content={`https://studios.decentraland.org/p/${landing.slug}`} />
            <meta name="twitter:title" content={landing.hero_title} />
            <meta name="twitter:description" content={landing.hero_description} />
            <meta name="twitter:image" content={`${DB_URL}/assets/${landing.hero_cover}`} />
        </Head>
        <main>
            <link  rel="stylesheet" type="text/css" href="/guides.css"/>
            <div className="section section--hero" 
                style={hero_background}>
                <div className="section--hero__container">
                    <img src="/images/guide/DCL_Logo_dark.webp" alt="" className="section--hero__container__logo" />
                    <h1>{landing.hero_title}</h1>
                    <p className="base-text hero__container__base-text">{landing.hero_description}</p>
                    <a onClick={ctaHighlight} href="#section--cta" className="cta hero__container__cta">{landing.hero_button}</a>
                    <img className="hero__container__pdf-cover" src={`${DB_URL}/assets/${landing.hero_cover}`} alt="" />
                </div>
            </div>
            <div className="section section--cta" id="section--cta">
                <div id="cta__container" className="section--cta__container container--enabled">
                    <div className="section--cta__container__content form--enabled">
                        <img className="cta__image" src={`${DB_URL}/assets/${landing.form_image}`} alt="" />
                        <div className="cta__form">
                            <h3>{landing.form_title}</h3>
                            <p className="base-text cta__base-text">{landing.form_description}</p>
                            <form onSubmit={onFormSubmit}>
                                <input type="text" name="name" id="name" placeholder={landing.form_name} required value={name} onChange={(newVal) => setName(newVal.target.value)} />
                                <input type="email" name="email" id="email" placeholder={landing.form_email} required value={email} onChange={(newVal) => setEmail(newVal.target.value)} />
                                <button className="cta" type="submit">{landing.form_button}</button>
                            </form>
                        </div>
                    </div>
                    <div className="section--cta__container__content form--success">
                        <img className="cta__image" src="/images/guide/Success-form.webp" alt="" />
                        <div className="cta__form">
                            <h3>{landing.form_success_title}</h3>
                            <p className="base-text cta__base-text">{landing.form_success_text} <strong>{email}</strong>.</p>
                            <div className="cta__form--success__buttons">
                                <a href={landing.form_success_open_url} target="_blank" rel="noreferrer" className="cta">{landing.form_success_open}</a>
                                <a onClick={ctaSendAgain} className="inline-link">{landing.form_success_send_again}</a>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <div className="section section--aboutdcl">
                <div className="section--aboutdcl__description">
                    <h4>{landing.about_intro}</h4>
                    <h2>{landing.about_title}</h2>
                </div>
                <div className="section--aboutdcl__cards">
                {landing.about_blocks.map(( aboutBlock, i ) => 
                    <div key={`about-${i}`} className="card section--aboutdcl__cards__card">
                        <p className="section--aboutdcl__cards__card__title">{aboutBlock.title}</p>
                        <p>{aboutBlock.description}</p>
                    </div>)}
                </div>
                <img className="section--aboutdcl__image" src={`${DB_URL}/assets/${landing.about_image}`} alt="" />
            </div>
            <div className="section section--whatsinside">
                <div className="section--whatsinside__description">
                    <h2>{landing.content1_title}</h2>
                    <div className="section--whatsinside__description__text" dangerouslySetInnerHTML={{__html: landing.content1_description}}/>
                </div>
                <div className="section--whatsinside__cards">
                    {landing.content1_blocks.map(( contentBlock, i ) => 
                    <div key={`content1-${i}`} className="card section--whatsinside__cards__card">
                        <img className="section--whatsinside__cards__card__icon" src={contentBlock.icon} alt="" />
                        <p className="section--whatsinside__cards__card__title">{contentBlock.title}</p>
                        <p className="base-text section--whatsinside__cards__card__text">{contentBlock.description}</p>
                    </div>)}
                </div>
                <a onClick={ctaHighlight} href="#section--cta" className="cta section--whatsinside__cta">{landing.content1_button}</a>
            </div>
            <div className="section section--journey" style={{background: `url('${DB_URL}/assets/${landing.content2_background}')`}}>
                <div className="section--journey__container">
                    <h2>{landing.content2_title}</h2>
                    <div className="section--journey__container__cards">
                        {landing.content2_blocks.map(( contentBlock, i ) => 
                        <div key={`content2-${i}`} className="card section--journey__container__cards__card">
                            <p className="section--journey__container__cards__card__number">{i+1}</p>
                            <p className="section--journey__container__cards__card__title">{contentBlock.title}</p>
                            <p className="base-text section--journey__cards__card__description">{contentBlock.description}</p>
                        </div>)}
                    </div>
                    <div className="section--journey__container__cta">
                        <p className="base-text section--journey__container__cta__text">{landing.content2_description}</p>
                        <a href="#section--cta" className="cta" onClick={ctaHighlight}>{landing.content2_button}</a>
                    </div>

                </div>
            </div>
            <div className="section--faq">
                <div className="section section--faq__container">
                    <div className="section--faq__container__description">
                        <h3>{landing.faq_title}</h3>
                        <p className="base-text section--faq__container__description">{landing.faq_description}</p>
                    </div>
                    <div className="section--faq__container__faqlist">
                        {landing.faqs.map((faqBlock,i) => 
                        <div key={`faq-${i}`} id="faq" className="section--faq__container__faqlist__faq faq faq--collapsed" onClick={ctaToggle}>
                            <div className="section--faq__container__faqlist__faq__title">
                                <p className="section--faq__container__faqlist__faq__title__number">{i+1}</p>
                                <p className="section--faq__container__faqlist__faq__title__question_title">{faqBlock.Question}</p>
                                <img src="/images/guide/Chevron.png" className="section--faq__container__faqlist__faq__title__chevron" />
                            </div>
                            <p className="section--faq__container__faqlist__faq__answer">{faqBlock.Answer}</p>
                        </div>)}
                    </div>
                </div>
            </div>
            <div className="section section--deepdive">
                <div className="section--deepdive__container">
                    <img src={`${DB_URL}/assets/${landing.call_image}`} className="section--deepdive__container__img" alt="" />
                    <h2>{landing.call_title}</h2>
                    <a onClick={ctaHighlight} href="#section--cta" className="cta section--deepdive__container__cta">{landing.call_button}</a>
                </div>
            </div>
            <div className="section section--reviews">
                <h3>{landing.reviews_title}</h3>
                <div className="section--reviews__container">
                    {landing.reviews.map((reviewBlock, i) => 
                    <div key={`rev-${i}`} className="section--reviews__container__review">
                        <p className="base-text section--reviews__container__review__text">{reviewBlock.Review}</p>
                        <div className="section--reviews__container__review__author">
                            <img src={reviewBlock.Avatar} alt="" className="section--reviews__container__review__author__image" />
                            <div className="section--reviews__container__review__author__authorname">
                                <p className="section--reviews__container__review__author__name">{reviewBlock.Author}</p>
                                <p className="section--reviews__container__review__author__company">{reviewBlock.Company}</p>
                            </div>
                        </div>
                    </div>)}
                </div>
            </div>
            <div className="section section--contact">
                <div className="section--contact__container">
                    <div className="section--contact__container__message">
                        <h2>{landing.contact_title} <a onClick={showIntercom} className="chat-link">{landing.contact_action}</a> {landing.contact_close}</h2>
                        <div className="section--contact__cta">
                            <p className="base-text section--contact__cta__text">{landing.contact_text} <a className="inline-link" href="#section--cta" onClick={ctaHighlight}> {landing.contact_text_close}</a> </p>
                        </div>
                    </div>
                    <img src="/images/guide/envelope.webp" alt="" className="section--contact_envelope" />
            </div>
            </div>
            <div className="footer">
                <div className="footer__container">
                    <img src="/images/guide/DCL_Logo_white.webp" alt="" className="logo" />
                    <a href="mailto:studios@decentraland.org" className="base-text">{landing.contact_us}</a>
                </div>
            </div>
        </main>
        {linkedinTracking}
        </>)
}

export default MetaverseGuide