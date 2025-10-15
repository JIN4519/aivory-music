import React from 'react';

export class ErrorBoundary extends React.Component<{children:any}, {error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { error };
  }

  componentDidCatch(error: any, info: any) {
    console.error('Unhandled error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="m-8 p-6 bg-red-900 text-white rounded">
          <h2 className="text-xl font-bold mb-2">앱에서 오류가 발생했습니다</h2>
          <pre className="whitespace-pre-wrap text-sm">{String(this.state.error)}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
