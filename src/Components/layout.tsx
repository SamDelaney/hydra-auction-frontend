import React from 'react';

export default function Layout({ children }: React.PropsWithChildren) {
  return <div className="p-6 md:p-12 w-full h-full">{children}</div>;
}
