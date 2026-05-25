import { MdWarningAmber, MdRefresh } from 'react-icons/md';

interface ErrorFallbackProps {
  error: unknown;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-background text-center">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <MdWarningAmber className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Algo deu errado</h2>
      <p className="text-sm text-gray-500 mb-1 max-w-xs">
        Ocorreu um erro inesperado. Tente recarregar a página.
      </p>
      {import.meta.env.DEV && (
        <p className="text-xs text-red-400 font-mono mt-2 mb-4 max-w-sm break-all">
          {error instanceof Error ? error.message : String(error)}
        </p>
      )}
      <button
        onClick={resetErrorBoundary}
        className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
      >
        <MdRefresh className="w-4 h-4" />
        Tentar novamente
      </button>
    </div>
  );
}
