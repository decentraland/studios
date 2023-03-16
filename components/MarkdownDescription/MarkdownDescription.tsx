import React from "react";
import ReactMarkdown from "react-markdown";
import { trackLink } from "../utils";

const customComponents: object = {
    a({ href, children }: { href: string; children: string }) {
      return (
        <a
          href={href}
          target="_blank"
          onClick={() => trackLink('Open External Link', 'Description Link', href)}
          rel="noreferrer"
        >
          {children}
        </a>
      )
    },
    ol({ children }: { children: string }) {
      return <ol style={{ display: 'inline-block' }}>{children}</ol>
    },
    ul({ children }: { children: string }) {
      return <ul style={{ display: 'table', tableLayout: 'fixed', width: '100%'}}>{children}</ul>
    },
    img({ src }: { src: string }){
      return <img alt='' src={src} style={{maxWidth: '100%'}} />
    }
  }

  interface Props extends React.HTMLAttributes<HTMLDivElement> {
    description: string
    inPartnersList?: boolean
    rehypePlugins?: object[]
  }

function MarkdownDescription ({description, inPartnersList, rehypePlugins, ...otherProps}: Props){
  
  let renderCustomComponents: any = {...customComponents}
  
  if (inPartnersList){
    renderCustomComponents.p = 'span'
    renderCustomComponents.h1 = 'div'
    renderCustomComponents.img = () => {return null}
  }

  return (
  <ReactMarkdown components={renderCustomComponents} rehypePlugins={rehypePlugins}  {...otherProps} >
          {description}
  </ReactMarkdown>
  )
}

export default MarkdownDescription