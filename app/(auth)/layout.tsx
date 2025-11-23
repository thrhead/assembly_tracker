export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-between p-4 sm:p-6 font-sans">
      <div className="flex flex-col items-center justify-center flex-grow w-full max-w-md">
        {children}
      </div>
      <footer className="mt-8 mb-4 text-gray-500 text-xs">
        © 2024 FactoryOps Solutions. All rights reserved.
      </footer>
    </div>
  )
}
