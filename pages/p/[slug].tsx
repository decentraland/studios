import React, { useEffect, useState } from "react"
import { GetStaticPaths, GetStaticProps } from "next";
import Landings from "../../clients/Landings";
import { Landing } from "../../interfaces/Landing";
import { useRouter } from "next/router";
import Head from "next/head";

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
            pdfUrl: landing.form_success_open_url,
            mobile: !!globalThis?.navigator.userAgent.match(/Mobi/),
            user_agent: globalThis?.navigator.userAgent
        }

        fetch('/api/guide/submit', {
            method: 'POST',
            body: JSON.stringify(body)
        })

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

    return (<>
        <Head>
            <meta property="og:title" content="Unleash the Power of the Metaverse for Your Brand" />
            <meta property="og:description" content="Read our Metaverse guide to learn how to leverage the immersive and interactive nature of the Metaverse to create marketing campaigns that drive results." />
            <meta property="og:image" content="/images/guide/PDF-cover.png" />
        </Head>
        <main>
            <link  rel="stylesheet" type="text/css" href="/guides.css"/>
            <div className="section section--hero">
                <div className="section--hero__container">
                    <img src="/images/guide/DCL_Logo_dark.webp" alt="" className="section--hero__container__logo" />
                    <h1>{landing.hero_title}</h1>
                    <p className="base-text hero__container__base-text">{landing.hero_description}</p>
                    <a onClick={ctaHighlight} href="#section--cta" className="cta hero__container__cta">{landing.hero_button}</a>
                    <img className="hero__container__pdf-cover" src="/images/guide/PDF-cover.webp" alt="" />
                </div>
            </div>
            <div className="section section--cta" id="section--cta">
                <div id="cta__container" className="section--cta__container container--enabled">
                    <div className="section--cta__container__content form--enabled">
                        <img className="cta__image" src="/images/guide/Plan-illustration.webp" alt="" />
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
                                <a onClick={fbqTrackLead} href={landing.form_success_open_url} target="_blank" rel="noreferrer" className="cta">{landing.form_success_open}</a>
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
                <img className="section--aboutdcl__image" src="/images/guide/about-dcl.webp" alt="" />
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
            <div className="section section--journey">
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
                    <img src="/images/guide/deepdive.webp" className="section--deepdive__container__img" alt="" />
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
        </>)
}

export default MetaverseGuide