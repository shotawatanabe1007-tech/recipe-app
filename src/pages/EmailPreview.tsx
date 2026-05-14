import { useEffect, useRef } from 'react';

export default function EmailPreview() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    fetch('/email-templates/corporate-services-dm-with-images.html')
      .then(r => r.text())
      .then(html => {
        const doc = iframeRef.current?.contentDocument;
        if (doc) {
          doc.open();
          doc.write(html);
          doc.close();
        }
      })
      .catch(() => {
        // fallback: direct src
      });
  }, []);

  return (
    <div style={{ background: '#e5e7eb', minHeight: '100vh', padding: '24px 0' }}>
      {/* Toolbar */}
      <div style={{
        maxWidth: 660, margin: '0 auto 16px', padding: '0 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <span style={{ fontWeight: 'bold', fontSize: 16, color: '#1a3a6b' }}>
            メールプレビュー
          </span>
          <span style={{ marginLeft: 12, fontSize: 12, color: '#6b7280', background: '#dbeafe',
            padding: '2px 10px', borderRadius: 20 }}>
            法人向け営業DM
          </span>
        </div>
        <a
          href="/email-templates/corporate-services-dm-with-images.html"
          download="corporate-services-dm.html"
          style={{
            background: '#1a3a6b', color: '#fff', fontSize: 13, fontWeight: 'bold',
            padding: '8px 20px', borderRadius: 50, textDecoration: 'none',
          }}
        >
          ↓ HTMLをダウンロード
        </a>
      </div>

      {/* Subject suggestion */}
      <div style={{ maxWidth: 660, margin: '0 auto 16px', padding: '0 20px' }}>
        <div style={{
          background: '#fff', borderRadius: 8, padding: '12px 16px',
          border: '1px solid #e5e7eb', fontSize: 13,
        }}>
          <span style={{ color: '#6b7280', marginRight: 8 }}>件名（推奨）：</span>
          <strong style={{ color: '#1a3a6b' }}>
            【〇〇株式会社様へ】通信費削減＋防犯を1社でまとめる方法
          </strong>
        </div>
      </div>

      {/* Email iframe */}
      <div style={{ maxWidth: 660, margin: '0 auto', padding: '0 20px' }}>
        <iframe
          ref={iframeRef}
          title="Email Preview"
          style={{
            width: '100%', minHeight: 1800, border: 'none',
            borderRadius: 8, boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            background: '#fff',
          }}
        />
      </div>
    </div>
  );
}
