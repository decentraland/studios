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
      return <ul style={{ display: 'inline-block' }}>{children}</ul>
    },
  }

  interface Props extends React.HTMLAttributes<HTMLDivElement> {
    description: string,
    inPartnersList?: boolean
  }

function MarkdownDescription ({description, inPartnersList, ...otherProps}: Props){
  
  let renderCustomComponents: any = {...customComponents}
  
  if (inPartnersList){
    renderCustomComponents.p = 'span'
  }

  return (
  <ReactMarkdown components={renderCustomComponents}  {...otherProps} >
          {description}
  </ReactMarkdown>
  )
}

export default MarkdownDescription