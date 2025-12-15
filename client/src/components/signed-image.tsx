import { useState, useEffect } from "react";
import { Loader2, Image as ImageIcon } from "lucide-react";

interface SignedImageProps {
  filePath?: string;
  fallbackUrl?: string;
  alt: string;
  className?: string;
  "data-testid"?: string;
}

export function SignedImage({
  filePath,
  fallbackUrl,
  alt,
  className,
  "data-testid": dataTestId,
}: SignedImageProps) {
  const [signedUrl, setSignedUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setSignedUrl("");
    setLoading(true);
    setError(false);

    const fetchSignedUrl = async () => {
      if (filePath) {
        try {
          const token = localStorage.getItem("pos_token");
          const res = await fetch("/api/imagekit/signed-url", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ filePath }),
          });
          if (res.ok) {
            const data = await res.json();
            setSignedUrl(data.signedUrl);
          } else {
            setError(true);
          }
        } catch {
          setError(true);
        }
        setLoading(false);
        return;
      }

      if (fallbackUrl) {
        setSignedUrl(fallbackUrl);
      }
      setLoading(false);
    };

    fetchSignedUrl();
  }, [filePath, fallbackUrl]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !signedUrl) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <ImageIcon className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  return <img src={signedUrl} alt={alt} className={className} data-testid={dataTestId} />;
}
