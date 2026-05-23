
import React, { ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Add comment: Fix ErrorBoundary props error by explicitly extending React.Component and providing a constructor.
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReset = () => {
     localStorage.clear();
     window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: '#fff', backgroundColor: '#111', minHeight: '100vh', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h1 style={{ color: '#ec4899' }}>Đã xảy ra lỗi hệ thống</h1>
          <p>Ứng dụng gặp sự cố khi xử lý dữ liệu (thường do bộ nhớ đầy hoặc dữ liệu ảnh quá lớn).</p>
          <pre style={{ backgroundColor: '#222', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', maxWidth: '800px', margin: '1rem auto', textAlign: 'left' }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginRight: '1rem', padding: '0.5rem 1rem', backgroundColor: '#374151', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
          >
            Tải lại trang
          </button>
          <button 
            onClick={this.handleReset} 
            style={{ padding: '0.5rem 1rem', backgroundColor: '#be123c', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
          >
            Xóa dữ liệu & Reset (Khuyên dùng nếu bị lỗi liên tục)
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
