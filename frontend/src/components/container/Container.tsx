import * as React from "react";

const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full h-screen border-border rounded-lg relative flex flex-col">
      {children}
    </div>
  );
};

export default Container;
