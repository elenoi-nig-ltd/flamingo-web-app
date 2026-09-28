import React from 'react';

/**
 * Renders a JSON-LD <script> tag for structured data (spec §11).
 * Server-safe: outputs a plain script element with the serialized schema.
 */
export default function JsonLd({ data }: { data: object | object[] }) {
  const json = Array.isArray(data) ? data : [data];
  return (
    <>
      {json.map((entry, index) => (
        <script
          key={index}
          type="application/ld+json"
          // JSON.stringify output is safe here: it's our own server-built data,
          // and we escape the closing-script sequence just in case.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(entry).replace(/</g, '\\u003c'),
          }}
        />
      ))}
    </>
  );
}
