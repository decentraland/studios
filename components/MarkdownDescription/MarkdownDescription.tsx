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
    p: 'span',
    ol({ children }: { children: string }) {
      return <ol style={{ display: 'inline-block' }}>{children}</ol>
    },
    ul({ children }: { children: string }) {
      return <ul style={{ display: 'inline-block' }}>{children}</ul>
    },
  }

  interface Props extends React.HTMLAttributes<HTMLDivElement> {
    description: string
  }

function MarkdownDescription ({description, ...otherProps}: Props){
    return (
    <ReactMarkdown components={customComponents}  {...otherProps} >
            {description}
    </ReactMarkdown>
    )
}

export default MarkdownDescription