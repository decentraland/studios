import React, { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'

import globalStyles from '../../styles/Home.module.css'
import styles from './landing.module.css'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import IconExternal from '../../components/Icons/IconExternal'
import { openIntercom } from '../../components/utils'
import IconArrowRight from '../../components/Icons/IconArrowRight'

function JobsLandingPage() {

    const HeroSlider = () => {

        const images = [
            ["Vice Media building in Decentraland", "/images/jobs/hero_1.webp"],
            ["LaLiga stadium in Decentraland by Vegas City", "/images/jobs/hero_2.webp"],
            ["Mango store in Decentraland by Metacast", "/images/jobs/hero_3.webp"],
            ["Absolut store in Decentraland by PARCEL PARTY", "/images/jobs/hero_4.webp"],
        ]
        
        return <div className={styles.heroAllocator}>
        <div className={styles.heroSlider}>
            <div className={styles['heroSlider--moving']}>
                {[...images, ...images].map(([name, img], i) => <div key={i} className={styles.heroImgContainer}>
                        <img className={styles.heroImage} alt={name} src={img} />
                        <div className={styles.heroOverlay}>
                            <div className={styles.heroNames}>{name}</div>
                        </div>
                    </div>)}
            </div>
        </div>
        </div>
    }

    const BrandsSlider = () => {
        return <div className={styles.brandsAllocator}>
            <div className={styles.heroSlider}>
                <div className={styles.brandsMask}/>
                <div className={styles['brandsSlider--moving']}>
                    <img alt="Brands" src="/images/jobs/brand_slider.webp" />
                    <img alt="Brands" src="/images/jobs/brand_slider.webp" />
                </div>
            </div>
        </div>
    }

    const UsageExamples = () => {
        
        const [currentExample, setCurrentExample] = useState(0)
        const [autoPlay, setAutoPlay] = useState(true)
        const [lastUpdate, setLastUpdate] = useState(Date.now())
        const [currentTime, setCurrentTime] = useState(Date.now())
        
        const examplesData = [
            ['A store, arena, or headquarters for your brand', 'CONSENSYS BUILDING IN DECENTRALAND' ],
            [ 'A playable experience such as a game or a quest', 'DOMINO’S STORE IN DECENTRALAND' ],
            [ 'A product launch or conference', 'DORITOS PRODUCT LAUNCH' ],
            [ 'Digital wearables for sale or giveaways', 'DOLCE&GABANNA AND COCA-COLA WEARABLES' ],
            [ 'Brand placement such as advertising billboards', 'COCA-COLA ADS IN DECENTRALAND' ],
            [ 'Educational material for internal stakeholders', 'CONFERENCE CENTER AND DECENTRALAND UNIVERSITY DISTRICT' ]
        ]
        
        setTimeout(() => setCurrentTime(Date.now()), 1000)

        if (autoPlay && currentTime > lastUpdate + 3000){
            setCurrentExample(currentExample === examplesData.length - 1 ? 0 : currentExample + 1)
            setLastUpdate(Date.now())
        }

        return <div className={styles.examplesContainer}
                    onPointerEnter={() => setAutoPlay(false)}
                    onPointerLeave={() => setAutoPlay(true)}>
            <div className={styles.examplesLeftPanel}>
                <div className={styles.examplesTitle}> What can your brand build in Decentraland?</div>
                
                {examplesData.map(([exampleText, footerText], i) => <div key={i}><div className={`${styles.examplesText} ${currentExample === i ? '' : styles['examplesText--gray']}`}
                                                        onPointerOver={() => setCurrentExample(i)}>
                        {currentExample === i && <IconArrowRight />}{exampleText}
                        </div>
                        <div className={`${styles['examplesImgMobile']} ${currentExample === i ? styles['examplesImgMobile--show'] : ''}`}>
                            <div className={styles.examplesImg} style={{backgroundImage: `url(/images/jobs/example_${i}b.webp)`}}/>
                            <div className={styles.examplesFooterText}>{footerText}</div>
                        </div>
                    </div>)}
                
                <Link href={'/jobs/hire'} legacyBehavior ><div className={styles.hireTalentBtn}>START A PROJECT</div></Link>
            </div>
            <div className={styles.examplesRightPanel}>
                <div className={styles.examplesImg} style={{backgroundImage: `url(/images/jobs/example_${currentExample}a.webp)`}}/>
                <div className={styles.examplesImg} style={{backgroundImage: `url(/images/jobs/example_${currentExample}b.webp)`}}/>
                <div className={styles.examplesFooterText}>{examplesData[currentExample][1]}</div>
            </div>
        </div>
    }

    return (
        <Container className={globalStyles.container}>
            <Head>
                <meta property="og:title" content="Decentraland creative services, on demand" />
                <meta property="og:description" content="Looking to bring your brand to Decentraland? Connect with top-tier studios and professionals to make it happen." />
                <meta property="og:image" content="https://studios.decentraland.org/images/banner_jobs.png" />

                <meta property="og:url" content="https://studios.decentraland.org/jobs" />

                <meta property="twitter:url" content="https://studios.decentraland.org/jobs" />
                <meta name="twitter:title" content="Decentraland creative services, on demand" />
                <meta name="twitter:description" content="Looking to bring your brand to Decentraland? Connect with top-tier studios and professionals to make it happen." />
                <meta name="twitter:image" content="https://studios.decentraland.org/images/banner_jobs.png"/>

                <link rel="canonical" href="https://studios.decentraland.org/jobs" />
            </Head>
            <main className={globalStyles.main}>
                <div className={styles.fakeBackground} />
                <div className={styles.heroContainer}>
                    <div>Decentraland creative services, on demand</div>
                    <div>
                    Looking to bring your brand to Decentraland? Connect with top-tier studios and professionals to make it happen.
                        <div className={styles.buttonsContainer}>
                            <Link href={'/jobs/hire'} legacyBehavior ><div className='button_primary'>START A PROJECT</div></Link>
                            <Link href={'/jobs/list'} legacyBehavior ><div className='button_primary--inverted'>APPLY TO A PROJECT</div></Link>
                        </div>
                    </div>
                </div>
                
                <div className={styles.heroSliderContainer}>
                    <div className={styles.trusted}>TRUSTED BY THE BEST</div>
                    <HeroSlider />

                    <BrandsSlider />
                    
                </div>
                
                <div className={styles.howToTitle}>How do <b>Jobs</b> work?</div>
                <div className={styles.howToContainer}>
                    <div className={styles.howToCard}>
                        <div className={styles['howToCard--titleRow']}><span>01</span>Start a project</div>
                        <div className={styles['howToCard--content']}><Link className={styles.linkText} href="/jobs/hire">Create a post</Link> detailing the project you want to do in Decentraland, and the skills or collaborators you are looking for.</div>
                    </div>
                    <div className={styles.howToCard}>
                        <div className={styles['howToCard--titleRow']}><span>02</span>Review candidates</div>
                        <div className={styles['howToCard--content']}>Studios will apply to your project. Review their profile and portfolio, and assess if they have the skills your need.</div>
                    </div>
                    <div className={styles.howToCard}>
                        <div className={styles['howToCard--titleRow']}><span>03</span>Chat and assess</div>
                        <div className={styles['howToCard--content']}>Chat with your candidates and select a studio to work with. Make sure to discuss your project and align expectations.</div>
                    </div>
                    <div className={styles.howToCard}>
                        <div className={styles['howToCard--titleRow']}><span>04</span>Collaborate</div>
                        <div className={styles['howToCard--content']}>Begin collaborating with your chosen studio. Work together and enjoy seeing your vision come to fruition!</div>
                    </div>
                </div>
                <div className={styles.hireContainer}>
                    <Link href={'/jobs/hire'} legacyBehavior ><div className={styles.hireTalentBtn}>START A PROJECT</div></Link>
                </div>
                
                <UsageExamples />
                
                <div className={styles.readAllocator}>
                    <div className={styles.readContainer}>
                        <div className={styles.readLeftPanel}>
                            <div className={styles.readTitle}>Read what other brands are doing in Decentraland</div>
                            <div className={styles.readText}>We wrote an introductory guide for brand owners, marketing agencies and small businesses who want to advance their presence online, while learning about the metaverse.</div>
                            <a href={'/p/metaverse-guide'} rel="noreferrer" target="_blank" ><div className={styles.getGuideBtn}>GET THE GUIDE <IconExternal /></div></a>
                        </div>
                        <div className={styles.readRightPanel}>
                            <img className={styles.readEndImg} alt="metaverse guide" src="/images/jobs/read_1.webp" />
                            <img className={styles.readCenterImg} alt="metaverse guide" src="/images/jobs/read_2.webp" />
                            <img className={styles.readEndImg} alt="metaverse guide" src="/images/jobs/read_3.webp" />
                        </div>
                    </div>
                </div>
                
                <div className={styles.reviewsContainer}>
                    <div className={styles.reviewCard}>
                        <div className={styles.reviewsTitle}>Read clients’ reviews about verified Decentraland Studios.</div>
                        {/* <div className={styles.reviewsSubTitle}>This is what they said after collaborating with different studios</div> */}
                    </div>
                    
                    <div className={styles.reviewCard}>
                        <div className={styles.reviewFrame}>
                            <div className={styles.reviewTitleRow}>
                                <span>
                                    <img alt="logo DAPPCRAFT" src="/images/jobs/rev_logo_1.webp" /> Review for DAPPCRAFT
                                </span>
                                <a href="/profile/dappcraft" target="_blank" rel="noreferrer">
                                    <IconExternal red />
                                </a>
                                </div>
                            <div>DAPPCRAFT is in a league of their own. The quality of their wearables and scene builds are unmatched. For ambitious projects and brand campaigns, I highly recommend this team.</div>
                        </div>
                        <div className={styles.reviewAuthor}><b>Matt Bond</b> from Banquet</div>
                    </div>
                    
                    <div className={styles.reviewCard}>
                        <div className={styles.reviewFrame}>
                            <div className={styles.reviewTitleRow}>
                                <span>
                                    <img alt="logo KOLLECTIFF" src="/images/jobs/rev_logo_2.webp" /> Review for KOLLECTIFF
                                </span> 
                                <a href="/profile/kollectiff" target="_blank" rel="noreferrer">
                                    <IconExternal red />
                                </a>
                            </div>
                            <div>Truly a one stop shop! The staff at Kollectiff is super knowledgeable and went way above and beyond for us. Can&apos;t recommend them highly enough!</div>
                        </div>
                        <div className={styles.reviewAuthor}><b>Philip Savage</b> BBDO</div>
                    </div>

                    <div className={styles.reviewCard}>
                        <div className={styles.reviewFrame}>
                            <div className={styles.reviewTitleRow}>
                                <span>
                                    <img alt="logo Atrovenado" src="/images/jobs/rev_logo_3.webp" /> Review for Atrovenado
                                </span> 
                                <a href="/profile/atrovenado" target="_blank" rel="noreferrer">
                                    <IconExternal red />
                                </a>
                            </div>
                            <div>The services provided were very good with the support of its team committed to bringing results. We appreciate everyone&apos;s dedication!</div>
                        </div>
                        <div className={styles.reviewAuthor}><b>Byron Mendes</b> from Metamundi</div>
                    </div>
                </div>


                <div className={styles.banner}>
                    <div>Ready to take your brand into Decentraland?</div>
                    <Link href={'/jobs/hire'} legacyBehavior ><div className={styles.hireTalentBtn}>START A PROJECT</div></Link>
                </div>
                    
                <div className={styles.unsureWrapper}>
                    <div className={styles.unsureContainer}>
                        <div className={styles.unsureText}>Unsure about the Metaverse? <span className={styles.linkText} onClick={() => openIntercom()}>Let&apos;s chat.</span> We&apos;d love to help.</div>
                        <img className={styles.unsureImg} alt='avatars' src='/images/jobs/footer_avatars.webp' />
                    </div>
                </div>
            </main>
        </Container>
    )
}

export default JobsLandingPage