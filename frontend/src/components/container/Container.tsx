import * as React from "react";

const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full h-screen border-[#cfcfcf] rounded-lg relative overflow-auto">
      {children}
    </div>
  );
};

export default Container;
