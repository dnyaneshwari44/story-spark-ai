import { ReactNode } from "react";
import NavListComponent from "../hero/nav_list.component";
import FooterComponent from "../footer/footer.component";

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <NavListComponent />
      <div className="flex-grow">{children}</div>
      <FooterComponent />
    </div>
  );
};

export default RootLayout;
