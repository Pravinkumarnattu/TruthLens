import { useEffect, useState } from "react";
import axios from "axios";

export default function URLPreview({ url }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!url) { setPreview(null); return; }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await axios.post("http://localhost:5000/preview", { url });
        setPreview(data);
      } catch {
        setPreview(null);
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [url]);

  if (loading) {
    return (
      <div className="url-preview url-preview-loading">
        <div className="url-preview-favicon-placeholder" />
        <div className="url-preview-lines">
          <div className="url-skeleton url-skeleton-title" />
          <div className="url-skeleton url-skeleton-desc" />
          <div className="url-skeleton url-skeleton-domain" />
        </div>
      </div>
    );
  }

  if (!preview) return null;

  return (
    <div className="url-preview">
      {/* Left — favicon + image */}
      <div className="url-preview-left">
        {preview.image ? (
          <img
            src={preview.image}
            alt="preview"
            className="url-preview-thumb"
            onError={(e) => e.target.style.display = "none"}
          />
        ) : (
          <div className="url-preview-favicon-wrap">
            <img
              src={preview.favicon}
              alt="favicon"
              className="url-preview-favicon"
              onError={(e) => e.target.style.display = "none"}
            />
          </div>
        )}
      </div>

      {/* Right — text */}
      <div className="url-preview-content">
        <p className="url-preview-title">{preview.title}</p>
        <p className="url-preview-desc">{preview.description}</p>
        <div className="url-preview-domain">
          <img
            src={preview.favicon}
            alt=""
            className="url-preview-domain-favicon"
            onError={(e) => e.target.style.display = "none"}
          />
          {preview.domain}
        </div>
      </div>
    </div>
  );
}