import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

type UploadEntry = {
  id: string;
  filename: string;
  status: string;
  record_count: number;
  created_at: string;
  error?: string | null;
};

type UploadResponse = {
  upload: UploadEntry;
  job: {
    id: string;
    status: string;
    record_count: number;
    analysis?: Record<string, unknown>;
    error?: string | null;
  };
};

const HISTORY_REFRESH_MS = 5000;

const UploadPanel: React.FC = () => {
  const [history, setHistory] = useState<UploadEntry[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  const fetchHistory = useCallback(async () => {
    const response = await fetch("/uploads/");
    if (!response.ok) {
      throw new Error(`Failed to load uploads: ${response.statusText}`);
    }
    const payload: UploadEntry[] = await response.json();
    setHistory(payload);
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchHistory().catch((err) => {
      if (mounted) {
        setError(err.message);
      }
    });

    intervalRef.current = window.setInterval(() => {
      fetchHistory().catch(() => {
        /* periodic refresh failures are surfaced via upload errors */
      });
    }, HISTORY_REFRESH_MS);

    return () => {
      mounted = false;
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [fetchHistory]);

  const uploadFile = useCallback(
    (file: File) => {
      setIsUploading(true);
      setProgress(0);
      setError(null);

      return new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/uploads/");

        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) {
            return;
          }
          const value = Math.round((event.loaded / event.total) * 100);
          setProgress(value);
        };

        xhr.onerror = () => {
          setIsUploading(false);
          setProgress(null);
          const message = "网络错误：无法上传文件";
          setError(message);
          reject(new Error(message));
        };

        xhr.onload = () => {
          setIsUploading(false);
          setProgress(null);

          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const payload: UploadResponse = JSON.parse(xhr.responseText);
              setHistory((prev) => [payload.upload, ...prev.filter((item) => item.id !== payload.upload.id)]);
            } catch (err) {
              // ignore JSON parsing errors and fallback to full refresh
            }
            fetchHistory().catch(() => {
              /* best effort */
            });
            resolve();
            return;
          }

          let message = "文件上传失败";
          try {
            const details = JSON.parse(xhr.responseText);
            if (details?.detail) {
              message = String(details.detail);
            }
          } catch (err) {
            // ignore JSON parsing failure
          }
          setError(message);
          reject(new Error(message));
        };

        const formData = new FormData();
        formData.append("file", file);
        xhr.send(formData);
      });
    },
    [fetchHistory]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || !files.length) {
        return;
      }
      void uploadFile(files[0]);
    },
    [uploadFile]
  );

  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(event.target.files);
      event.target.value = "";
    },
    [handleFiles]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  }, []);

  const onDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setDragActive(false);
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles]
  );

  const dropZoneClass = useMemo(() => {
    const base = "upload-panel__dropzone";
    return dragActive ? `${base} upload-panel__dropzone--active` : base;
  }, [dragActive]);

  return (
    <section className="upload-panel">
      <h2>报文上传</h2>
      <div
        className={dropZoneClass}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        data-testid="dropzone"
      >
        <p>拖拽 CSV/Excel 文件到此处，或</p>
        <label className="upload-panel__button">
          <span>选择文件</span>
          <input
            id="upload-input"
            data-testid="file-input"
            type="file"
            accept=".csv,.xls,.xlsx"
            onChange={onInputChange}
            disabled={isUploading}
            hidden
          />
        </label>
      </div>

      {isUploading && (
        <div className="upload-panel__progress" role="status">
          <p>正在上传… {progress ?? 0}%</p>
        </div>
      )}

      {error && (
        <div className="upload-panel__error" role="alert">
          {error}
        </div>
      )}

      <div className="upload-panel__history">
        <h3>上传历史</h3>
        {history.length === 0 ? (
          <p>暂无历史记录。</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>文件名</th>
                <th>状态</th>
                <th>记录数</th>
                <th>时间</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td>{item.filename}</td>
                  <td>{item.status}</td>
                  <td>{item.record_count}</td>
                  <td>{new Date(item.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default UploadPanel;
