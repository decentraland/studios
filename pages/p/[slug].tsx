import React, { useEffect, useState } from "react"
import { GetStaticPaths, GetStaticProps } from "next";
import Landings from "../../clients/Landings";
import { Landing } from "../../interfaces/Landing";
import { useRouter } from "next/router";
import Head from "next/head";
import Script from "next/script";
import { fbq, googleAdsTrack, linkedinTrackLead, openIntercom, plausibleTrackEvent, updateIntercom } from "../../components/utils";
import { stringify } from "querystring";

export const getStaticProps: GetStaticProps = async ({ params }) => {

    if (params && params.slug) {
      const landing = await Landings.getLandingData(`${params.slug}`)
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

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

function MetaverseGuide({ landing }: Props) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [landingData, setLandingData] = useState(landing)
    const [customFields, setCustomFields] = useState(landing.form_custom_fields)

    useEffect(() => {
		fetch(`/api/get/landing`,
            {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ slug: landing.slug })
            }).then(res => res.ok && res.json())
                .then((data) => {
                    setLandingData(data)
                    data.form_custom_fields && setCustomFields(data.form_custom_fields)
                })
                .catch((err) => console.log(err))
        }, [])

    const router = useRouter()
    const { utm_source, utm_medium, utm_campaign } = router.query || {}

    useEffect(() => {
        if (landingData.fb_pixel){
            (globalThis as any).fbq && (globalThis as any).fbq('init', landingData.fb_pixel);
            (globalThis as any).fbq && (globalThis as any).fbq('trackSingle', landingData.fb_pixel, 'PageView');
        }
    }, [(globalThis as any).fbq])

    

    const onFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        let newFields
        if (customFields?.length){
            newFields = customFields.reduce((a, v) => ({ ...a, [v.sg_id]: v.value}), {}) 
        }

        const body = {
            name,
            email,
            slug: landingData.slug,
            utm_source, 
            utm_medium, 
            utm_campaign,
            mobile: !!globalThis?.navigator.userAgent.match(/Mobi/),
            user_agent: globalThis?.navigator.userAgent,
            list_ids: landingData.list_ids,
            custom_fields: {... landingData.custom_fields, ...newFields}
        }

        fetch('/api/landing/submit', {
            method: 'POST',
            body: JSON.stringify(body)
        })

        globalThis.sessionStorage.setItem('leadName', name);
        globalThis.sessionStorage.setItem('leadEmail', email);
        globalThis.sessionStorage.setItem('leadSlug', landingData.slug);

        if (landingData.track_linkedin?.conversion_id) {
            globalThis.sessionStorage.setItem('leadConversionId', landingData.track_linkedin.conversion_id);
        }
        
        fbq('track', 'Lead')
        linkedinTrackLead(landingData.track_linkedin?.conversion_id)
        plausibleTrackEvent('LandingSubmit' , { slug: landingData.slug, email: email })
        googleAdsTrack()
        updateIntercom({"name": name, "email": email})
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

    let hero_background = {}

    if (landingData.hero_background){
        hero_background = {
            backgroundSize: 'cover',
            backgroundImage: `url("${DB_URL}/assets/${landingData.hero_background}")`
        }
    }

    let linkedinTracking = null

    if (landingData.track_linkedin?.partner_id) {
        linkedinTracking = <footer>
            <Script id="linkedin-partner_id" strategy="afterInteractive">
                {`_linkedin_partner_id = "${landingData.track_linkedin.partner_id}";
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
                <img height="1" width="1" style={{display:"none"}} alt="" src={`https://px.ads.linkedin.com/collect/?pid=${landingData.track_linkedin.partner_id}&fmt=gif`} />
            </noscript>
        </footer>

    }

    const handleCheckbox = (e: React.FormEvent, i: number) => {
        const element = e.currentTarget as HTMLInputElement
        
        let newFieldData = customFields[i].value || ""
        
        const index = newFieldData.indexOf(element.value)
        
        if ( index === -1) {
            newFieldData = newFieldData.concat(`${newFieldData.length ? ', ' : '' }"${element.value}"`)
        } else {
            let arrayData = [...newFieldData]
            if (index === 1) {
                arrayData.splice(0, element.value.length + 4 )
            } else {
                arrayData.splice(index - 3, element.value.length + 4 )
            }
            newFieldData = arrayData.join("")
        }
        
        let newCustomFields = [ ...customFields ]
        newCustomFields[i].value = newFieldData

        setCustomFields(newCustomFields)
    }

    let renderFormCustomFields = null
    if (customFields?.length) {

        renderFormCustomFields = <div className="cta__customFields">{customFields.map( (field, i) => {
            if (field.options?.length) {
                return <>
                <br/><label>{field.label}</label>

                {field.options.map((text: string) => <div key={text}><label className="options">
                    <input type="checkbox" name={text}
                        value={text}
                        onChange={(e) => handleCheckbox(e, i)}
                        checked={field.value?.includes(text)} />
                    {text}</label></div>)}
                </>
            }

            return <input key={field.name} type="text" name={field.name} id={field.name} placeholder={field.label} value={field.value} onChange={(newVal) => {
                let newCustomFields = [...customFields]
                newCustomFields[i].value = newVal.target.value
                setCustomFields(newCustomFields)
            }} />

        })}</div>
    }

    return (<>
        <Head>
            <meta property="og:title" content={landingData.hero_title} />
            <meta property="og:description" content={landingData.hero_description} />
            <meta property="og:image" content={`${DB_URL}/assets/${landingData.hero_cover}`} />

            <meta property="og:url" content={`https://studios.decentraland.org/p/${landingData.slug}`} />

            <meta property="twitter:url" content={`https://studios.decentraland.org/p/${landingData.slug}`} />
            <meta name="twitter:title" content={landingData.hero_title} />
            <meta name="twitter:description" content={landingData.hero_description} />
            <meta name="twitter:image" content={`${DB_URL}/assets/${landingData.hero_cover}`} />
    
            <link rel="canonical" href={`https://studios.decentraland.org/p/${landingData.slug}`} />
        </Head>
        <main>
            <link  rel="stylesheet" type="text/css" href="/landings.css"/>
            <div className="section section--hero" 
                style={hero_background}>
                <div className="section--hero__container">
                    <img src="/images/guide/DCL_Logo_dark.webp" alt="" className="section--hero__container__logo" />
                    <h1>{landingData.hero_title}</h1>
                    <p className="base-text hero__container__base-text">{landingData.hero_description}</p>
                    <a onClick={ctaHighlight} href="#section--cta" className="cta hero__container__cta">{landingData.hero_button}</a>
                    <img className="hero__container__pdf-cover" src={`${DB_URL}/assets/${landingData.hero_cover}`} alt="" />
                </div>
            </div>
            <div className="section section--cta" id="section--cta">
                <div id="cta__container" className={`section--cta__container container--enabled  ${renderFormCustomFields ? 'extraFields' : ''}`}>
                    <div className="section--cta__container__content form--enabled">
                        <img className="cta__image" src={`${DB_URL}/assets/${landingData.form_image}`} alt="" />
                        <div className="cta__form">
                            <h3>{landingData.form_title}</h3>
                            <p className="base-text cta__base-text">{landingData.form_description}</p>
                                {renderFormCustomFields}
                            <form onSubmit={onFormSubmit}>
                                <input type="text" name="name" id="name" placeholder={landingData.form_name} required value={name} onChange={(newVal) => setName(newVal.target.value)} />
                                <input type="email" name="email" id="email" placeholder={landingData.form_email} required value={email} onChange={(newVal) => setEmail(newVal.target.value)} />
                                
                                <button className="cta" type="submit">{landingData.form_button}</button>
                            </form>
                        </div>
                    </div>
                    <div className="section--cta__container__content form--success">
                        <img className="cta__image" src="/images/guide/Success-form.webp" alt="" />
                        <div className="cta__form">
                            <h3>{landingData.form_success_title}</h3>
                            <p className="base-text cta__base-text">{landingData.form_success_text} <strong>{email}</strong>.</p>
                            <div className="cta__form--success__buttons">
                                {landingData.form_success_open_intercom ? 
                                <>
                                    <a href={landingData.form_success_open_url} { ...landingData.form_success_open_url.includes('://') ? { target:"_blank" } : {} } rel="noreferrer" className="cta">{landingData.form_success_open}</a>
                                    <a onClick={openIntercom} className="cta cta-inverted">{landingData.form_success_open_intercom}</a>
                                </>
                                :
                                <>
                                    <a href={landingData.form_success_open_url} target="_blank" rel="noreferrer" className="cta">{landingData.form_success_open}</a>
                                    <a onClick={ctaSendAgain} className="inline-link">{landingData.form_success_send_again}</a>
                                </>
                            }
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            {landingData.about_show &&
            <div className="section section--aboutdcl">
                <div className="section--aboutdcl__description">
                    <h4>{landingData.about_intro}</h4>
                    <h2>{landingData.about_title}</h2>
                </div>
                <div className="section--aboutdcl__cards">
                {landingData.about_blocks.map(( aboutBlock, i ) => 
                    <div key={`about-${i}`} className="card section--aboutdcl__cards__card">
                        <p className="section--aboutdcl__cards__card__title">{aboutBlock.title}</p>
                        <p>{aboutBlock.description}</p>
                    </div>)}
                </div>
                <img className="section--aboutdcl__image" src={`${DB_URL}/assets/${landingData.about_image}`} alt="" />
            </div>}
            {landingData.content1_show && 
            <div className="section section--whatsinside">
                <div className="section--whatsinside__description">
                    <h2>{landingData.content1_title}</h2>
                    <div className="section--whatsinside__description__text" dangerouslySetInnerHTML={{__html: landingData.content1_description}}/>
                </div>
                <div className="section--whatsinside__cards">
                    {landingData.content1_blocks.map(( contentBlock, i ) => 
                    <div key={`content1-${i}`} className="card section--whatsinside__cards__card">
                        <img className="section--whatsinside__cards__card__icon" src={contentBlock.icon} alt="" />
                        <p className="section--whatsinside__cards__card__title">{contentBlock.title}</p>
                        <p className="base-text section--whatsinside__cards__card__text">{contentBlock.description}</p>
                    </div>)}
                </div>
                <a onClick={ctaHighlight} href="#section--cta" className="cta section--whatsinside__cta">{landingData.content1_button}</a>
            </div>}
            {landingData.content2_show &&
            <div className="section section--journey" style={{background: `url('${DB_URL}/assets/${landingData.content2_background}')`}}>
                <div className="section--journey__container">
                    <h2>{landingData.content2_title}</h2>
                    <div className="section--journey__container__cards">
                        {landingData.content2_blocks.map(( contentBlock, i ) => 
                        <div key={`content2-${i}`} className="card section--journey__container__cards__card">
                            <p className="section--journey__container__cards__card__number">{i+1}</p>
                            <p className="section--journey__container__cards__card__title">{contentBlock.title}</p>
                            <p className="base-text section--journey__cards__card__description">{contentBlock.description}</p>
                        </div>)}
                    </div>
                    <div className="section--journey__container__cta">
                        <p className="base-text section--journey__container__cta__text">{landingData.content2_description}</p>
                        <a href="#section--cta" className="cta" onClick={ctaHighlight}>{landingData.content2_button}</a>
                    </div>

                </div>
            </div>}
            {landingData.faq_show &&
            <div className="section--faq">
                <div className="section section--faq__container">
                    <div className="section--faq__container__description">
                        <h3>{landingData.faq_title}</h3>
                        <p className="base-text section--faq__container__description">{landingData.faq_description}</p>
                    </div>
                    <div className="section--faq__container__faqlist">
                        {landingData.faqs.map((faqBlock,i) => 
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
            </div>}
            {landingData.call_show &&
            <div className="section section--deepdive">
                <div className="section--deepdive__container">
                    <img src={`${DB_URL}/assets/${landingData.call_image}`} className="section--deepdive__container__img" alt="" />
                    <h2>{landingData.call_title}</h2>
                    <a onClick={ctaHighlight} href="#section--cta" className="cta section--deepdive__container__cta">{landingData.call_button}</a>
                </div>
            </div>}
            {landingData.reviews_show &&
            <div className="section section--reviews">
                <h3>{landingData.reviews_title}</h3>
                <div className="section--reviews__container">
                    {landingData.reviews.map((reviewBlock, i) => 
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
            </div>}
            {landingData.contact_show &&
            <div className="section section--contact">
                <div className="section--contact__container">
                    <div className="section--contact__container__message">
                        <h2>{landingData.contact_title} <a onClick={openIntercom} className="chat-link">{landingData.contact_action}</a> {landingData.contact_close}</h2>
                            <p className="base-text section--contact__cta__text">{landingData.contact_text} <a className="inline-link" href="#section--cta" onClick={ctaHighlight}> {landingData.contact_text_close}</a> </p>
                    </div>
                <img src="/images/guide/envelope.webp" alt="" className="section--contact_envelope" />
                </div>
            </div>}
            {/* <div className="footer">
                <div className="footer__container">
                    <img src="/images/guide/DCL_Logo_white.webp" alt="" className="logo" />
                    <a href="mailto:studios@decentraland.org" className="base-text">{landingData.contact_us}</a>
                </div>
            </div> */}
        </main>
        {linkedinTracking}
        </>)
}

export default MetaverseGuide